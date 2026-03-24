import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CollectionStatus, Prisma, ProductStatus } from '@prisma/client';
import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate } from '../../common/utils/pagination';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

const DEFAULT_CATALOG_LOCALE = 'zh';
const DEFAULT_CURRENCY = 'USD';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublicProducts(query: ProductQueryDto) {
    const products = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        OR: query.q
          ? [
              {
                handle: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
              {
                translations: {
                  some: {
                    locale: DEFAULT_CATALOG_LOCALE,
                    title: {
                      contains: query.q,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ]
          : undefined,
      },
      include: this.productInclude(),
    });

    const serialized = this.sortPublicProducts(
      products.map((product) => this.serializePublicProduct(product)),
      query.sortKey,
      query.reverse ?? false,
    );

    return this.shouldPaginate(query) ? paginate(serialized, query) : serialized;
  }

  async listAdminProducts(query: ProductQueryDto) {
    const products = await this.prisma.product.findMany({
      where: {
        status: query.status
          ? this.toPrismaProductStatus(query.status)
          : undefined,
        OR: query.q
          ? [
              {
                handle: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
              {
                sku: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
              {
                translations: {
                  some: {
                    locale: DEFAULT_CATALOG_LOCALE,
                    title: {
                      contains: query.q,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ]
          : undefined,
      },
      include: this.productInclude(),
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const serialized = this.sortAdminProducts(
      products.map((product) => this.serializeAdminProduct(product)),
      query.sortKey,
      query.reverse ?? false,
    );

    return paginate(serialized, query);
  }

  async getPublicProduct(idOrHandle: string) {
    const product = await this.findProduct(idOrHandle);
    if (product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('Product not found.');
    }

    return this.serializePublicProduct(product);
  }

  async getAdminProduct(idOrHandle: string) {
    const product = await this.findProduct(idOrHandle);
    return this.serializeAdminProduct(product);
  }

  async getProductRecommendations(idOrHandle: string) {
    const product = await this.findProduct(idOrHandle);
    if (product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('Product not found.');
    }

    const explicitRecommendations = await this.prisma.productRecommendation.findMany({
      where: {
        sourceProductId: product.id,
      },
      orderBy: {
        position: 'asc',
      },
      include: {
        targetProduct: {
          include: this.productInclude(),
        },
      },
    });

    const explicit = explicitRecommendations
      .map((entry) => entry.targetProduct)
      .filter((candidate) => candidate.status === ProductStatus.ACTIVE)
      .map((candidate) => this.serializePublicProduct(candidate));

    if (explicit.length > 0) {
      return explicit;
    }

    const categoryIds = product.categories.map((entry) => entry.categoryId);
    const fallback = await this.prisma.product.findMany({
      where: {
        id: {
          not: product.id,
        },
        status: ProductStatus.ACTIVE,
        categories: {
          some: {
            categoryId: {
              in: categoryIds,
            },
          },
        },
      },
      include: this.productInclude(),
      take: 4,
    });

    return fallback.map((candidate) => this.serializePublicProduct(candidate));
  }

  async createProduct(payload: CreateProductDto) {
    await this.assertUniqueProductHandle(payload.handle);

    return this.prisma.$transaction(async (tx) => {
      const normalized = this.normalizeProductPayload(payload);
      await this.assertCategoryIdsExist(tx, normalized.categoryIds);
      await this.assertBrandExists(tx, normalized.brandId);

      const product = await tx.product.create({
        data: {
          sku: normalized.productSku,
          handle: normalized.handle,
          status: normalized.status,
          brandId: normalized.brandId,
        },
      });

      await tx.productTranslation.create({
        data: {
          productId: product.id,
          locale: DEFAULT_CATALOG_LOCALE,
          title: normalized.title,
          shortDescription: normalized.description || null,
          descriptionHtml: normalized.description || null,
        },
      });

      if (normalized.images.length > 0) {
        await tx.productImage.createMany({
          data: normalized.images.map((url, index) => ({
            productId: product.id,
            url,
            position: index,
            isPrimary: index === normalized.primaryImageIndex,
          })),
        });
      }

      if (normalized.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: normalized.categoryIds.map((categoryId) => ({
            productId: product.id,
            categoryId,
          })),
        });
      }

      const optionIdByName = new Map<string, string>();
      for (const option of normalized.options) {
        const createdOption = await tx.variantOption.create({
          data: {
            productId: product.id,
            name: option.name,
            position: option.position,
          },
        });
        optionIdByName.set(option.name, createdOption.id);
      }

      for (const variant of normalized.variants) {
        const createdVariant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: variant.sku,
            title: variant.title,
            barcode: variant.barcode,
            compareAtPrice: variant.compareAtPrice,
          },
        });

        await tx.variantPrice.createMany({
          data: variant.prices.map((price) => ({
            variantId: createdVariant.id,
            currency: price.currency,
            market: price.market ?? null,
            amount: price.amount,
          })),
        });

        await tx.inventoryItem.create({
          data: {
            variantId: createdVariant.id,
            quantityOnHand: variant.inventory,
            quantityReserved: 0,
          },
        });

        if (variant.selectedOptions.length > 0) {
          await tx.variantOptionValue.createMany({
            data: variant.selectedOptions.map((selectedOption) => {
              const optionId = optionIdByName.get(selectedOption.name);
              if (!optionId) {
                throw new BadRequestException(
                  `Variant option ${selectedOption.name} is not defined.`,
                );
              }

              return {
                optionId,
                variantId: createdVariant.id,
                value: selectedOption.value,
              };
            }),
          });
        }
      }

      const created = await tx.product.findUnique({
        where: { id: product.id },
        include: this.productInclude(),
      });

      if (!created) {
        throw new NotFoundException('Product not found after creation.');
      }

      return this.serializeAdminProduct(created);
    }).catch((error) => this.handlePrismaError(error));
  }

  async updateProduct(id: string, payload: Partial<CreateProductDto>) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: this.productInclude(),
    });

    if (!existing) {
      throw new NotFoundException('Product not found.');
    }

    const current = this.serializeAdminProduct(existing);
    const mergedPayload: CreateProductDto = {
      sku: payload.sku ?? current.sku,
      title: payload.title ?? current.title,
      handle: payload.handle ?? current.handle,
      description: payload.description ?? current.description,
      price: payload.price ?? Number(current.price),
      compareAtPrice:
        payload.compareAtPrice ??
        (current.compareAtPrice ? Number(current.compareAtPrice) : undefined),
      inventory: payload.inventory ?? current.inventory,
      status: payload.status ?? current.status,
      images: payload.images ?? current.images.map((image: { url: string }) => image.url),
      primaryImageIndex: payload.primaryImageIndex ?? current.primaryImageIndex,
      featuredImage: payload.featuredImage,
      brandId: payload.brandId ?? current.brandId,
      categoryIds: payload.categoryIds ?? current.categoryIds,
      options: payload.options ?? current.options,
      variants: payload.variants ?? current.variants,
    };

    if (mergedPayload.handle !== existing.handle) {
      await this.assertUniqueProductHandle(mergedPayload.handle, existing.id);
    }

    return this.prisma.$transaction(async (tx) => {
      const normalized = this.normalizeProductPayload(mergedPayload, existing.id);
      await this.assertCategoryIdsExist(tx, normalized.categoryIds);
      await this.assertBrandExists(tx, normalized.brandId);

      await tx.product.update({
        where: { id },
        data: {
          sku: normalized.productSku,
          handle: normalized.handle,
          status: normalized.status,
          brandId: normalized.brandId,
          version: {
            increment: 1,
          },
        },
      });

      await tx.productTranslation.upsert({
        where: {
          productId_locale: {
            productId: id,
            locale: DEFAULT_CATALOG_LOCALE,
          },
        },
        update: {
          title: normalized.title,
          shortDescription: normalized.description || null,
          descriptionHtml: normalized.description || null,
        },
        create: {
          productId: id,
          locale: DEFAULT_CATALOG_LOCALE,
          title: normalized.title,
          shortDescription: normalized.description || null,
          descriptionHtml: normalized.description || null,
        },
      });

      await tx.productImage.deleteMany({ where: { productId: id } });
      if (normalized.images.length > 0) {
        await tx.productImage.createMany({
          data: normalized.images.map((url, index) => ({
            productId: id,
            url,
            position: index,
            isPrimary: index === normalized.primaryImageIndex,
          })),
        });
      }

      if (payload.categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        if (normalized.categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: normalized.categoryIds.map((categoryId) => ({
              productId: id,
              categoryId,
            })),
          });
        }
      }

      if (payload.options || payload.variants) {
        await tx.variantOptionValue.deleteMany({
          where: {
            variant: {
              productId: id,
            },
          },
        });
        await tx.variantPrice.deleteMany({
          where: {
            variant: {
              productId: id,
            },
          },
        });
        await tx.inventoryItem.deleteMany({
          where: {
            variant: {
              productId: id,
            },
          },
        });
        await tx.productVariant.deleteMany({ where: { productId: id } });
        await tx.variantOption.deleteMany({ where: { productId: id } });

        const optionIdByName = new Map<string, string>();
        for (const option of normalized.options) {
          const createdOption = await tx.variantOption.create({
            data: {
              productId: id,
              name: option.name,
              position: option.position,
            },
          });
          optionIdByName.set(option.name, createdOption.id);
        }

        for (const variant of normalized.variants) {
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: id,
              sku: variant.sku,
              title: variant.title,
              barcode: variant.barcode,
              compareAtPrice: variant.compareAtPrice,
            },
          });

          await tx.variantPrice.createMany({
            data: variant.prices.map((price) => ({
              variantId: createdVariant.id,
              currency: price.currency,
              market: price.market ?? null,
              amount: price.amount,
            })),
          });

          await tx.inventoryItem.create({
            data: {
              variantId: createdVariant.id,
              quantityOnHand: variant.inventory,
              quantityReserved: 0,
            },
          });

          if (variant.selectedOptions.length > 0) {
            await tx.variantOptionValue.createMany({
              data: variant.selectedOptions.map((selectedOption) => {
                const optionId = optionIdByName.get(selectedOption.name);
                if (!optionId) {
                  throw new BadRequestException(
                    `Variant option ${selectedOption.name} is not defined.`,
                  );
                }

                return {
                  optionId,
                  variantId: createdVariant.id,
                  value: selectedOption.value,
                };
              }),
            });
          }
        }
      } else {
        const firstVariant = existing.variants[0];
        if (firstVariant) {
          await tx.productVariant.update({
            where: { id: firstVariant.id },
            data: {
              sku: normalized.variants[0].sku,
              title: normalized.variants[0].title,
              compareAtPrice: normalized.variants[0].compareAtPrice,
            },
          });

          await tx.variantPrice.deleteMany({ where: { variantId: firstVariant.id } });
          await tx.variantPrice.createMany({
            data: normalized.variants[0].prices.map((price) => ({
              variantId: firstVariant.id,
              currency: price.currency,
              market: price.market ?? null,
              amount: price.amount,
            })),
          });

          await tx.inventoryItem.updateMany({
            where: { variantId: firstVariant.id },
            data: {
              quantityOnHand: normalized.variants[0].inventory,
            },
          });
        }
      }

      const updated = await tx.product.findUnique({
        where: { id },
        include: this.productInclude(),
      });

      if (!updated) {
        throw new NotFoundException('Product not found after update.');
      }

      return this.serializeAdminProduct(updated);
    }).catch((error) => this.handlePrismaError(error));
  }

  async deleteProduct(id: string) {
    try {
      await this.prisma.product.delete({
        where: { id },
      });

      return { id };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async applyProductBulkAction(payload: BulkActionRequestDto) {
    if (payload.action === 'delete') {
      const result = await this.prisma.product.deleteMany({
        where: {
          id: {
            in: payload.ids,
          },
        },
      });
      return { updated: result.count };
    }

    if (payload.action === 'updateStatus' && payload.status) {
      const result = await this.prisma.product.updateMany({
        where: {
          id: {
            in: payload.ids,
          },
        },
        data: {
          status: this.toPrismaProductStatus(payload.status),
        },
      });
      return { updated: result.count };
    }

    throw new BadRequestException('Unsupported product bulk action.');
  }

  async listPublicCollections(query: PaginationQueryDto) {
    const collections = await this.prisma.category.findMany({
      where: {
        status: CollectionStatus.ACTIVE,
        OR: query.q
          ? [
              {
                handle: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
              {
                translations: {
                  some: {
                    locale: DEFAULT_CATALOG_LOCALE,
                    title: {
                      contains: query.q,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ]
          : undefined,
      },
      include: this.categoryInclude(),
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });

    const serialized = collections.map((collection) =>
      this.serializePublicCollection(collection),
    );

    return this.shouldPaginate(query) ? paginate(serialized, query) : serialized;
  }

  async listAdminCollections(query: PaginationQueryDto) {
    const collections = await this.prisma.category.findMany({
      where: {
        status: query.status
          ? this.toPrismaCollectionStatus(query.status)
          : undefined,
        OR: query.q
          ? [
              {
                handle: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              },
              {
                translations: {
                  some: {
                    locale: DEFAULT_CATALOG_LOCALE,
                    title: {
                      contains: query.q,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ]
          : undefined,
      },
      include: this.categoryInclude(),
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });

    return paginate(
      collections.map((collection) => this.serializeAdminCollection(collection)),
      query,
    );
  }

  async getPublicCollection(idOrHandle: string) {
    const collection = await this.findCollection(idOrHandle);
    if (collection.status !== CollectionStatus.ACTIVE) {
      throw new NotFoundException('Collection not found.');
    }

    return this.serializePublicCollection(collection);
  }

  async getAdminCollection(idOrHandle: string) {
    const collection = await this.findCollection(idOrHandle);
    return this.serializeAdminCollection(collection);
  }

  async getCollectionProducts(handle: string, query: ProductQueryDto) {
    const collection = await this.findCollection(handle);
    if (collection.status !== CollectionStatus.ACTIVE) {
      throw new NotFoundException('Collection not found.');
    }

    const products = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        categories: {
          some: {
            categoryId: collection.id,
          },
        },
      },
      include: this.productInclude(),
    });

    const serialized = this.sortPublicProducts(
      products.map((product) => this.serializePublicProduct(product)),
      query.sortKey,
      query.reverse ?? false,
    );

    return this.shouldPaginate(query) ? paginate(serialized, query) : serialized;
  }

  async createCollection(payload: CreateCollectionDto) {
    await this.assertUniqueCollectionHandle(payload.handle);

    try {
      const collection = await this.prisma.category.create({
        data: {
          handle: payload.handle,
          status: this.toPrismaCollectionStatus(payload.status),
          imageUrl: payload.image,
          translations: {
            create: {
              locale: DEFAULT_CATALOG_LOCALE,
              title: payload.title,
              description: payload.description,
            },
          },
        },
        include: this.categoryInclude(),
      });

      return this.serializeAdminCollection(collection);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateCollection(id: string, payload: Partial<CreateCollectionDto>) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: this.categoryInclude(),
    });

    if (!existing) {
      throw new NotFoundException('Collection not found.');
    }

    const current = this.serializeAdminCollection(existing);
    const handle = payload.handle ?? current.handle;
    if (handle !== existing.handle) {
      await this.assertUniqueCollectionHandle(handle, existing.id);
    }

    try {
      const collection = await this.prisma.category.update({
        where: { id },
        data: {
          handle,
          status: payload.status
            ? this.toPrismaCollectionStatus(payload.status)
            : undefined,
          imageUrl: payload.image ?? current.image,
          translations: {
            upsert: {
              where: {
                categoryId_locale: {
                  categoryId: id,
                  locale: DEFAULT_CATALOG_LOCALE,
                },
              },
              update: {
                title: payload.title ?? current.title,
                description: payload.description ?? current.description,
              },
              create: {
                locale: DEFAULT_CATALOG_LOCALE,
                title: payload.title ?? current.title,
                description: payload.description ?? current.description,
              },
            },
          },
        },
        include: this.categoryInclude(),
      });

      return this.serializeAdminCollection(collection);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async deleteCollection(id: string) {
    try {
      await this.prisma.category.delete({
        where: { id },
      });
      return { id };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async applyCollectionBulkAction(payload: BulkActionRequestDto) {
    if (payload.action === 'delete') {
      const result = await this.prisma.category.deleteMany({
        where: {
          id: {
            in: payload.ids,
          },
        },
      });
      return { updated: result.count };
    }

    if (payload.action === 'updateStatus' && payload.status) {
      const result = await this.prisma.category.updateMany({
        where: {
          id: {
            in: payload.ids,
          },
        },
        data: {
          status: this.toPrismaCollectionStatus(payload.status),
        },
      });
      return { updated: result.count };
    }

    throw new BadRequestException('Unsupported collection bulk action.');
  }

  async listBrands() {
    const brands = await this.prisma.brand.findMany({
      include: {
        translations: {
          where: {
            locale: DEFAULT_CATALOG_LOCALE,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return brands.map((brand) => this.serializeBrand(brand));
  }

  async createBrand(payload: CreateBrandDto) {
    await this.assertUniqueBrandHandle(payload.handle);

    try {
      const brand = await this.prisma.brand.create({
        data: {
          handle: payload.handle,
          logoUrl: payload.logo,
          translations: {
            create: {
              locale: DEFAULT_CATALOG_LOCALE,
              name: payload.name,
              description: payload.description,
            },
          },
        },
        include: {
          translations: {
            where: {
              locale: DEFAULT_CATALOG_LOCALE,
            },
          },
        },
      });

      return this.serializeBrand(brand);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private productInclude() {
    return {
      translations: {
        where: {
          locale: DEFAULT_CATALOG_LOCALE,
        },
      },
      options: {
        include: {
          values: true,
        },
        orderBy: {
          position: 'asc' as const,
        },
      },
      variants: {
        include: {
          prices: true,
          inventoryItem: true,
          optionValues: {
            include: {
              option: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc' as const,
        },
      },
      images: {
        orderBy: {
          position: 'asc' as const,
        },
      },
      categories: {
        include: {
          category: {
            include: {
              translations: {
                where: {
                  locale: DEFAULT_CATALOG_LOCALE,
                },
              },
            },
          },
        },
      },
    };
  }

  private categoryInclude() {
    return {
      translations: {
        where: {
          locale: DEFAULT_CATALOG_LOCALE,
        },
      },
      productLinks: {
        include: {
          product: true,
        },
      },
    };
  }

  private serializePublicProduct(product: any) {
    const translation = product.translations[0];
    const images = product.images.map((image: any) => ({
      url: image.url,
      altText: image.altText ?? '',
      width: 800,
      height: 800,
    }));
    const primaryImageIndex = product.images.findIndex((image: any) => image.isPrimary);
    const featuredImage = images[primaryImageIndex] ?? images[0] ?? null;
    const variants = product.variants.map((variant: any) => {
      const primaryPrice = this.pickPrimaryPrice(variant.prices);
      const availableInventory =
        (variant.inventoryItem?.quantityOnHand ?? 0) -
        (variant.inventoryItem?.quantityReserved ?? 0);

      return {
        id: variant.id,
        title: variant.title,
        availableForSale: availableInventory > 0,
        selectedOptions: variant.optionValues.map((optionValue: any) => ({
          name: optionValue.option.name,
          value: optionValue.value,
        })),
        price: {
          amount: primaryPrice.amount.toFixed(2),
          currencyCode: primaryPrice.currency,
        },
      };
    });
    const amounts = product.variants.map((variant: any) =>
      Number(this.pickPrimaryPrice(variant.prices).amount),
    );
    const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
    const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;

    return {
      id: product.id,
      handle: product.handle,
      availableForSale: variants.some((variant: any) => variant.availableForSale),
      title: translation?.title ?? product.handle,
      description: translation?.shortDescription ?? this.stripHtml(translation?.descriptionHtml ?? ''),
      descriptionHtml: translation?.descriptionHtml ?? translation?.shortDescription ?? '',
      options: product.options.map((option: any) => ({
        id: option.id,
        name: option.name,
        values: Array.from(new Set(option.values.map((value: any) => value.value))),
      })),
      priceRange: {
        minVariantPrice: {
          amount: minAmount.toFixed(2),
          currencyCode: DEFAULT_CURRENCY,
        },
        maxVariantPrice: {
          amount: maxAmount.toFixed(2),
          currencyCode: DEFAULT_CURRENCY,
        },
      },
      variants,
      featuredImage,
      images,
      seo: {
        title: translation?.seoTitle ?? translation?.title ?? product.handle,
        description:
          translation?.seoDescription ??
          translation?.shortDescription ??
          this.stripHtml(translation?.descriptionHtml ?? ''),
      },
      tags: [],
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  private serializeAdminProduct(product: any) {
    const translation = product.translations[0];
    const images = product.images.map((image: any) => ({
      id: image.id,
      url: image.url,
      isPrimary: image.isPrimary,
    }));
    const primaryImageIndex = Math.max(
      0,
      product.images.findIndex((image: any) => image.isPrimary),
    );
    const defaultVariant = product.variants[0];
    const defaultPrice = defaultVariant
      ? this.pickPrimaryPrice(defaultVariant.prices)
      : { amount: 0, currency: DEFAULT_CURRENCY };

    return {
      id: product.id,
      sku: product.sku,
      title: translation?.title ?? product.handle,
      handle: product.handle,
      description:
        translation?.shortDescription ?? this.stripHtml(translation?.descriptionHtml ?? ''),
      price: defaultPrice.amount,
      compareAtPrice: defaultVariant?.compareAtPrice
        ? Number(defaultVariant.compareAtPrice)
        : undefined,
      inventory: product.variants.reduce(
        (sum: number, variant: any) =>
          sum +
          ((variant.inventoryItem?.quantityOnHand ?? 0) -
            (variant.inventoryItem?.quantityReserved ?? 0)),
        0,
      ),
      status: this.fromPrismaProductStatus(product.status),
      images,
      featuredImage: images[primaryImageIndex] ?? images[0] ?? null,
      primaryImageIndex,
      brandId: product.brandId ?? undefined,
      categoryIds: product.categories.map((entry: any) => entry.categoryId),
      options: product.options.map((option: any) => ({
        name: option.name,
        position: option.position,
        values: Array.from(new Set(option.values.map((value: any) => value.value))),
      })),
      variants: product.variants.map((variant: any) => ({
        id: variant.id,
        sku: variant.sku,
        title: variant.title,
        barcode: variant.barcode ?? undefined,
        compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined,
        inventory:
          (variant.inventoryItem?.quantityOnHand ?? 0) -
          (variant.inventoryItem?.quantityReserved ?? 0),
        prices: variant.prices.map((price: any) => ({
          currency: price.currency,
          market: price.market ?? undefined,
          amount: Number(price.amount),
        })),
        selectedOptions: variant.optionValues.map((optionValue: any) => ({
          name: optionValue.option.name,
          value: optionValue.value,
        })),
      })),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  private serializePublicCollection(collection: any) {
    const translation = collection.translations[0];
    return {
      handle: collection.handle,
      title: translation?.title ?? collection.handle,
      description: translation?.description ?? '',
      seo: {
        title: translation?.seoTitle ?? translation?.title ?? collection.handle,
        description: translation?.seoDescription ?? translation?.description ?? '',
      },
      path: `/search/${collection.handle}`,
      updatedAt: collection.updatedAt.toISOString(),
      productCount: collection.productLinks.filter(
        (entry: any) => entry.product.status === ProductStatus.ACTIVE,
      ).length,
    };
  }

  private serializeAdminCollection(collection: any) {
    const translation = collection.translations[0];
    return {
      id: collection.id,
      title: translation?.title ?? collection.handle,
      handle: collection.handle,
      description: translation?.description ?? '',
      image: collection.imageUrl ?? undefined,
      status: this.fromPrismaCollectionStatus(collection.status),
      productCount: collection.productLinks.length,
      updatedAt: collection.updatedAt.toISOString(),
    };
  }

  private serializeBrand(brand: any) {
    const translation = brand.translations[0];
    return {
      id: brand.id,
      handle: brand.handle,
      name: translation?.name ?? brand.handle,
      description: translation?.description ?? '',
      logo: brand.logoUrl ?? undefined,
      updatedAt: brand.updatedAt.toISOString(),
    };
  }

  private normalizeProductPayload(payload: Partial<CreateProductDto>, existingId?: string) {
    const title = payload.title?.trim();
    const handle = payload.handle?.trim();

    if (!title || !handle) {
      throw new BadRequestException('Product title and handle are required.');
    }

    const images = this.normalizeImages(payload.images, payload.featuredImage);
    const primaryImageIndex = this.normalizePrimaryImageIndex(
      payload.primaryImageIndex ?? 0,
      images.length,
    );

    const variants = payload.variants?.length
      ? payload.variants.map((variant, index) => ({
          sku: variant.sku.trim(),
          title: variant.title.trim() || `Variant ${index + 1}`,
          barcode: variant.barcode?.trim() || undefined,
          compareAtPrice:
            typeof variant.compareAtPrice === 'number'
              ? new Prisma.Decimal(variant.compareAtPrice)
              : undefined,
          inventory: variant.inventory,
          prices: variant.prices.map((price) => ({
            currency: price.currency,
            market: price.market,
            amount: new Prisma.Decimal(price.amount),
          })),
          selectedOptions: (variant.selectedOptions ?? []).map((selectedOption) => ({
            name: selectedOption.name.trim(),
            value: selectedOption.value.trim(),
          })),
        }))
      : [
          {
            sku: payload.sku?.trim() || this.buildDefaultVariantSku(handle, existingId),
            title: 'Default',
            barcode: undefined,
            compareAtPrice:
              typeof payload.compareAtPrice === 'number'
                ? new Prisma.Decimal(payload.compareAtPrice)
                : undefined,
            inventory: payload.inventory ?? 0,
            prices: [
              {
                currency: DEFAULT_CURRENCY,
                market: undefined,
                amount: new Prisma.Decimal(payload.price ?? 0),
              },
            ],
            selectedOptions: [],
          },
        ];

    const optionMap = new Map<
      string,
      { name: string; position: number; values: Set<string> }
    >();
    for (const option of payload.options ?? []) {
      optionMap.set(option.name.trim(), {
        name: option.name.trim(),
        position: option.position ?? optionMap.size,
        values: new Set(option.values.map((value) => value.trim()).filter(Boolean)),
      });
    }

    variants.forEach((variant) => {
      variant.selectedOptions.forEach((selectedOption) => {
        const existingOption = optionMap.get(selectedOption.name);
        if (existingOption) {
          existingOption.values.add(selectedOption.value);
          return;
        }

        optionMap.set(selectedOption.name, {
          name: selectedOption.name,
          position: optionMap.size,
          values: new Set([selectedOption.value]),
        });
      });
    });

    const options = Array.from(optionMap.values()).map((option) => ({
      name: option.name,
      position: option.position,
      values: Array.from(option.values),
    }));

    const variantSkus = variants.map((variant) => variant.sku.toLowerCase());
    if (new Set(variantSkus).size !== variantSkus.length) {
      throw new BadRequestException('Variant SKU values must be unique within a product.');
    }

    return {
      title,
      handle,
      description: payload.description?.trim() ?? '',
      status: this.toPrismaProductStatus(payload.status),
      images,
      primaryImageIndex,
      productSku: payload.sku?.trim() || this.buildProductSku(handle, existingId),
      brandId: payload.brandId?.trim() || null,
      categoryIds: (payload.categoryIds ?? []).filter(Boolean),
      options,
      variants,
    };
  }

  private normalizeImages(images?: string[], featuredImage?: string) {
    const imageUrls = Array.isArray(images)
      ? images.filter((image) => typeof image === 'string' && image.length > 0)
      : [];

    if (imageUrls.length > 0) {
      return imageUrls;
    }

    return featuredImage ? [featuredImage] : [];
  }

  private normalizePrimaryImageIndex(index: number, imageCount: number) {
    if (imageCount <= 0) {
      return 0;
    }

    if (index < 0) {
      return 0;
    }

    if (index >= imageCount) {
      return imageCount - 1;
    }

    return index;
  }

  private buildProductSku(handle: string, existingId?: string) {
    const normalized = handle.replace(/[^a-zA-Z0-9]+/g, '-').toUpperCase();
    return `${normalized}${existingId ? `-${existingId.slice(0, 6).toUpperCase()}` : ''}`;
  }

  private buildDefaultVariantSku(handle: string, existingId?: string) {
    return `${this.buildProductSku(handle, existingId)}-DEFAULT`;
  }

  private pickPrimaryPrice(prices: any[]) {
    const primary =
      prices.find((price) => price.currency === DEFAULT_CURRENCY && !price.market) ??
      prices[0];

    return {
      amount: Number(primary?.amount ?? 0),
      currency: primary?.currency ?? DEFAULT_CURRENCY,
    };
  }

  private sortPublicProducts(products: any[], sortKey?: string, reverse = false) {
    const sorted = [...products];
    if (sortKey?.toLowerCase() === 'price') {
      sorted.sort(
        (left, right) =>
          Number(left.priceRange.minVariantPrice.amount) -
          Number(right.priceRange.minVariantPrice.amount),
      );
    } else {
      sorted.sort((left, right) => left.title.localeCompare(right.title));
    }

    return reverse ? sorted.reverse() : sorted;
  }

  private sortAdminProducts(products: any[], sortKey?: string, reverse = false) {
    const sorted = [...products];
    if (sortKey?.toLowerCase() === 'price') {
      sorted.sort((left, right) => Number(left.price) - Number(right.price));
    } else {
      sorted.sort((left, right) => left.title.localeCompare(right.title));
    }

    return reverse ? sorted.reverse() : sorted;
  }

  private shouldPaginate(query: PaginationQueryDto) {
    return query.page !== undefined || query.pageSize !== undefined;
  }

  private async findProduct(idOrHandle: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrHandle }, { handle: idOrHandle }],
      },
      include: this.productInclude(),
    });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  private async findCollection(idOrHandle: string) {
    const collection = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: idOrHandle }, { handle: idOrHandle }],
      },
      include: this.categoryInclude(),
    });
    if (!collection) {
      throw new NotFoundException('Collection not found.');
    }

    return collection;
  }

  private async assertUniqueProductHandle(handle: string, excludeId?: string) {
    const existing = await this.prisma.product.findFirst({
      where: {
        handle,
        id: excludeId ? { not: excludeId } : undefined,
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Product handle already exists.');
    }
  }

  private async assertUniqueCollectionHandle(handle: string, excludeId?: string) {
    const existing = await this.prisma.category.findFirst({
      where: {
        handle,
        id: excludeId ? { not: excludeId } : undefined,
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Collection handle already exists.');
    }
  }

  private async assertUniqueBrandHandle(handle: string) {
    const existing = await this.prisma.brand.findUnique({
      where: { handle },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Brand handle already exists.');
    }
  }

  private async assertCategoryIdsExist(tx: Prisma.TransactionClient, categoryIds: string[]) {
    if (categoryIds.length === 0) {
      return;
    }

    const count = await tx.category.count({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });

    if (count !== new Set(categoryIds).size) {
      throw new BadRequestException('One or more category ids are invalid.');
    }
  }

  private async assertBrandExists(tx: Prisma.TransactionClient, brandId: string | null) {
    if (!brandId) {
      return;
    }

    const brand = await tx.brand.findUnique({
      where: { id: brandId },
      select: { id: true },
    });

    if (!brand) {
      throw new BadRequestException('Brand not found.');
    }
  }

  private toPrismaProductStatus(status?: string) {
    switch (status) {
      case 'draft':
        return ProductStatus.DRAFT;
      case 'scheduled':
        return ProductStatus.SCHEDULED;
      case 'archived':
        return ProductStatus.ARCHIVED;
      case 'active':
      case undefined:
      case null:
      case '':
        return ProductStatus.ACTIVE;
      default:
        throw new BadRequestException('Invalid product status.');
    }
  }

  private fromPrismaProductStatus(status: ProductStatus) {
    switch (status) {
      case ProductStatus.DRAFT:
        return 'draft';
      case ProductStatus.SCHEDULED:
        return 'scheduled';
      case ProductStatus.ARCHIVED:
        return 'archived';
      case ProductStatus.ACTIVE:
      default:
        return 'active';
    }
  }

  private toPrismaCollectionStatus(status?: string) {
    switch (status) {
      case 'hidden':
        return CollectionStatus.HIDDEN;
      case 'active':
      case undefined:
      case null:
      case '':
        return CollectionStatus.ACTIVE;
      default:
        throw new BadRequestException('Invalid collection status.');
    }
  }

  private fromPrismaCollectionStatus(status: CollectionStatus) {
    return status === CollectionStatus.HIDDEN ? 'hidden' : 'active';
  }

  private stripHtml(value: string) {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private handlePrismaError(error: unknown): never {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('A unique field already exists.');
    }

    throw error;
  }
}


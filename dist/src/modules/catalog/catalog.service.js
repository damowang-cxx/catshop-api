"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../common/utils/pagination");
const prisma_service_1 = require("../../prisma/prisma.service");
const DEFAULT_CATALOG_LOCALE = 'zh';
const DEFAULT_CURRENCY = 'USD';
let CatalogService = class CatalogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPublicProducts(query) {
        const products = await this.prisma.product.findMany({
            where: {
                status: client_1.ProductStatus.ACTIVE,
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
        const serialized = this.sortPublicProducts(products.map((product) => this.serializePublicProduct(product)), query.sortKey, query.reverse ?? false);
        return this.shouldPaginate(query) ? (0, pagination_1.paginate)(serialized, query) : serialized;
    }
    async listAdminProducts(query) {
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
        const serialized = this.sortAdminProducts(products.map((product) => this.serializeAdminProduct(product)), query.sortKey, query.reverse ?? false);
        return (0, pagination_1.paginate)(serialized, query);
    }
    async getPublicProduct(idOrHandle) {
        const product = await this.findProduct(idOrHandle);
        if (product.status !== client_1.ProductStatus.ACTIVE) {
            throw new common_1.NotFoundException('Product not found.');
        }
        return this.serializePublicProduct(product);
    }
    async getAdminProduct(idOrHandle) {
        const product = await this.findProduct(idOrHandle);
        return this.serializeAdminProduct(product);
    }
    async getProductRecommendations(idOrHandle) {
        const product = await this.findProduct(idOrHandle);
        if (product.status !== client_1.ProductStatus.ACTIVE) {
            throw new common_1.NotFoundException('Product not found.');
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
            .filter((candidate) => candidate.status === client_1.ProductStatus.ACTIVE)
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
                status: client_1.ProductStatus.ACTIVE,
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
    async createProduct(payload) {
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
            const optionIdByName = new Map();
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
                                throw new common_1.BadRequestException(`Variant option ${selectedOption.name} is not defined.`);
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
                throw new common_1.NotFoundException('Product not found after creation.');
            }
            return this.serializeAdminProduct(created);
        }).catch((error) => this.handlePrismaError(error));
    }
    async updateProduct(id, payload) {
        const existing = await this.prisma.product.findUnique({
            where: { id },
            include: this.productInclude(),
        });
        if (!existing) {
            throw new common_1.NotFoundException('Product not found.');
        }
        const current = this.serializeAdminProduct(existing);
        const mergedPayload = {
            sku: payload.sku ?? current.sku,
            title: payload.title ?? current.title,
            handle: payload.handle ?? current.handle,
            description: payload.description ?? current.description,
            price: payload.price ?? Number(current.price),
            compareAtPrice: payload.compareAtPrice ??
                (current.compareAtPrice ? Number(current.compareAtPrice) : undefined),
            inventory: payload.inventory ?? current.inventory,
            status: payload.status ?? current.status,
            images: payload.images ?? current.images.map((image) => image.url),
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
                const optionIdByName = new Map();
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
                                    throw new common_1.BadRequestException(`Variant option ${selectedOption.name} is not defined.`);
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
            }
            else {
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
                throw new common_1.NotFoundException('Product not found after update.');
            }
            return this.serializeAdminProduct(updated);
        }).catch((error) => this.handlePrismaError(error));
    }
    async deleteProduct(id) {
        try {
            await this.prisma.product.delete({
                where: { id },
            });
            return { id };
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    async applyProductBulkAction(payload) {
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
        throw new common_1.BadRequestException('Unsupported product bulk action.');
    }
    async listPublicCollections(query) {
        const collections = await this.prisma.category.findMany({
            where: {
                status: client_1.CollectionStatus.ACTIVE,
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
        const serialized = collections.map((collection) => this.serializePublicCollection(collection));
        return this.shouldPaginate(query) ? (0, pagination_1.paginate)(serialized, query) : serialized;
    }
    async listAdminCollections(query) {
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
        return (0, pagination_1.paginate)(collections.map((collection) => this.serializeAdminCollection(collection)), query);
    }
    async getPublicCollection(idOrHandle) {
        const collection = await this.findCollection(idOrHandle);
        if (collection.status !== client_1.CollectionStatus.ACTIVE) {
            throw new common_1.NotFoundException('Collection not found.');
        }
        return this.serializePublicCollection(collection);
    }
    async getAdminCollection(idOrHandle) {
        const collection = await this.findCollection(idOrHandle);
        return this.serializeAdminCollection(collection);
    }
    async getCollectionProducts(handle, query) {
        const collection = await this.findCollection(handle);
        if (collection.status !== client_1.CollectionStatus.ACTIVE) {
            throw new common_1.NotFoundException('Collection not found.');
        }
        const products = await this.prisma.product.findMany({
            where: {
                status: client_1.ProductStatus.ACTIVE,
                categories: {
                    some: {
                        categoryId: collection.id,
                    },
                },
            },
            include: this.productInclude(),
        });
        const serialized = this.sortPublicProducts(products.map((product) => this.serializePublicProduct(product)), query.sortKey, query.reverse ?? false);
        return this.shouldPaginate(query) ? (0, pagination_1.paginate)(serialized, query) : serialized;
    }
    async createCollection(payload) {
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
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    async updateCollection(id, payload) {
        const existing = await this.prisma.category.findUnique({
            where: { id },
            include: this.categoryInclude(),
        });
        if (!existing) {
            throw new common_1.NotFoundException('Collection not found.');
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
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    async deleteCollection(id) {
        try {
            await this.prisma.category.delete({
                where: { id },
            });
            return { id };
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    async applyCollectionBulkAction(payload) {
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
        throw new common_1.BadRequestException('Unsupported collection bulk action.');
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
    async createBrand(payload) {
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
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    productInclude() {
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
                    position: 'asc',
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
                    createdAt: 'asc',
                },
            },
            images: {
                orderBy: {
                    position: 'asc',
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
    categoryInclude() {
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
    serializePublicProduct(product) {
        const translation = product.translations[0];
        const images = product.images.map((image) => ({
            url: image.url,
            altText: image.altText ?? '',
            width: 800,
            height: 800,
        }));
        const primaryImageIndex = product.images.findIndex((image) => image.isPrimary);
        const featuredImage = images[primaryImageIndex] ?? images[0] ?? null;
        const variants = product.variants.map((variant) => {
            const primaryPrice = this.pickPrimaryPrice(variant.prices);
            const availableInventory = (variant.inventoryItem?.quantityOnHand ?? 0) -
                (variant.inventoryItem?.quantityReserved ?? 0);
            return {
                id: variant.id,
                title: variant.title,
                availableForSale: availableInventory > 0,
                selectedOptions: variant.optionValues.map((optionValue) => ({
                    name: optionValue.option.name,
                    value: optionValue.value,
                })),
                price: {
                    amount: primaryPrice.amount.toFixed(2),
                    currencyCode: primaryPrice.currency,
                },
            };
        });
        const amounts = product.variants.map((variant) => Number(this.pickPrimaryPrice(variant.prices).amount));
        const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
        const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
        return {
            id: product.id,
            handle: product.handle,
            availableForSale: variants.some((variant) => variant.availableForSale),
            title: translation?.title ?? product.handle,
            description: translation?.shortDescription ?? this.stripHtml(translation?.descriptionHtml ?? ''),
            descriptionHtml: translation?.descriptionHtml ?? translation?.shortDescription ?? '',
            options: product.options.map((option) => ({
                id: option.id,
                name: option.name,
                values: Array.from(new Set(option.values.map((value) => value.value))),
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
                description: translation?.seoDescription ??
                    translation?.shortDescription ??
                    this.stripHtml(translation?.descriptionHtml ?? ''),
            },
            tags: [],
            updatedAt: product.updatedAt.toISOString(),
        };
    }
    serializeAdminProduct(product) {
        const translation = product.translations[0];
        const images = product.images.map((image) => ({
            id: image.id,
            url: image.url,
            isPrimary: image.isPrimary,
        }));
        const primaryImageIndex = Math.max(0, product.images.findIndex((image) => image.isPrimary));
        const defaultVariant = product.variants[0];
        const defaultPrice = defaultVariant
            ? this.pickPrimaryPrice(defaultVariant.prices)
            : { amount: 0, currency: DEFAULT_CURRENCY };
        return {
            id: product.id,
            sku: product.sku,
            title: translation?.title ?? product.handle,
            handle: product.handle,
            description: translation?.shortDescription ?? this.stripHtml(translation?.descriptionHtml ?? ''),
            price: defaultPrice.amount,
            compareAtPrice: defaultVariant?.compareAtPrice
                ? Number(defaultVariant.compareAtPrice)
                : undefined,
            inventory: product.variants.reduce((sum, variant) => sum +
                ((variant.inventoryItem?.quantityOnHand ?? 0) -
                    (variant.inventoryItem?.quantityReserved ?? 0)), 0),
            status: this.fromPrismaProductStatus(product.status),
            images,
            featuredImage: images[primaryImageIndex] ?? images[0] ?? null,
            primaryImageIndex,
            brandId: product.brandId ?? undefined,
            categoryIds: product.categories.map((entry) => entry.categoryId),
            options: product.options.map((option) => ({
                name: option.name,
                position: option.position,
                values: Array.from(new Set(option.values.map((value) => value.value))),
            })),
            variants: product.variants.map((variant) => ({
                id: variant.id,
                sku: variant.sku,
                title: variant.title,
                barcode: variant.barcode ?? undefined,
                compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined,
                inventory: (variant.inventoryItem?.quantityOnHand ?? 0) -
                    (variant.inventoryItem?.quantityReserved ?? 0),
                prices: variant.prices.map((price) => ({
                    currency: price.currency,
                    market: price.market ?? undefined,
                    amount: Number(price.amount),
                })),
                selectedOptions: variant.optionValues.map((optionValue) => ({
                    name: optionValue.option.name,
                    value: optionValue.value,
                })),
            })),
            updatedAt: product.updatedAt.toISOString(),
        };
    }
    serializePublicCollection(collection) {
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
            productCount: collection.productLinks.filter((entry) => entry.product.status === client_1.ProductStatus.ACTIVE).length,
        };
    }
    serializeAdminCollection(collection) {
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
    serializeBrand(brand) {
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
    normalizeProductPayload(payload, existingId) {
        const title = payload.title?.trim();
        const handle = payload.handle?.trim();
        if (!title || !handle) {
            throw new common_1.BadRequestException('Product title and handle are required.');
        }
        const images = this.normalizeImages(payload.images, payload.featuredImage);
        const primaryImageIndex = this.normalizePrimaryImageIndex(payload.primaryImageIndex ?? 0, images.length);
        const variants = payload.variants?.length
            ? payload.variants.map((variant, index) => ({
                sku: variant.sku.trim(),
                title: variant.title.trim() || `Variant ${index + 1}`,
                barcode: variant.barcode?.trim() || undefined,
                compareAtPrice: typeof variant.compareAtPrice === 'number'
                    ? new client_1.Prisma.Decimal(variant.compareAtPrice)
                    : undefined,
                inventory: variant.inventory,
                prices: variant.prices.map((price) => ({
                    currency: price.currency,
                    market: price.market,
                    amount: new client_1.Prisma.Decimal(price.amount),
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
                    compareAtPrice: typeof payload.compareAtPrice === 'number'
                        ? new client_1.Prisma.Decimal(payload.compareAtPrice)
                        : undefined,
                    inventory: payload.inventory ?? 0,
                    prices: [
                        {
                            currency: DEFAULT_CURRENCY,
                            market: undefined,
                            amount: new client_1.Prisma.Decimal(payload.price ?? 0),
                        },
                    ],
                    selectedOptions: [],
                },
            ];
        const optionMap = new Map();
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
            throw new common_1.BadRequestException('Variant SKU values must be unique within a product.');
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
    normalizeImages(images, featuredImage) {
        const imageUrls = Array.isArray(images)
            ? images.filter((image) => typeof image === 'string' && image.length > 0)
            : [];
        if (imageUrls.length > 0) {
            return imageUrls;
        }
        return featuredImage ? [featuredImage] : [];
    }
    normalizePrimaryImageIndex(index, imageCount) {
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
    buildProductSku(handle, existingId) {
        const normalized = handle.replace(/[^a-zA-Z0-9]+/g, '-').toUpperCase();
        return `${normalized}${existingId ? `-${existingId.slice(0, 6).toUpperCase()}` : ''}`;
    }
    buildDefaultVariantSku(handle, existingId) {
        return `${this.buildProductSku(handle, existingId)}-DEFAULT`;
    }
    pickPrimaryPrice(prices) {
        const primary = prices.find((price) => price.currency === DEFAULT_CURRENCY && !price.market) ??
            prices[0];
        return {
            amount: Number(primary?.amount ?? 0),
            currency: primary?.currency ?? DEFAULT_CURRENCY,
        };
    }
    sortPublicProducts(products, sortKey, reverse = false) {
        const sorted = [...products];
        if (sortKey?.toLowerCase() === 'price') {
            sorted.sort((left, right) => Number(left.priceRange.minVariantPrice.amount) -
                Number(right.priceRange.minVariantPrice.amount));
        }
        else {
            sorted.sort((left, right) => left.title.localeCompare(right.title));
        }
        return reverse ? sorted.reverse() : sorted;
    }
    sortAdminProducts(products, sortKey, reverse = false) {
        const sorted = [...products];
        if (sortKey?.toLowerCase() === 'price') {
            sorted.sort((left, right) => Number(left.price) - Number(right.price));
        }
        else {
            sorted.sort((left, right) => left.title.localeCompare(right.title));
        }
        return reverse ? sorted.reverse() : sorted;
    }
    shouldPaginate(query) {
        return query.page !== undefined || query.pageSize !== undefined;
    }
    async findProduct(idOrHandle) {
        const product = await this.prisma.product.findFirst({
            where: {
                OR: [{ id: idOrHandle }, { handle: idOrHandle }],
            },
            include: this.productInclude(),
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found.');
        }
        return product;
    }
    async findCollection(idOrHandle) {
        const collection = await this.prisma.category.findFirst({
            where: {
                OR: [{ id: idOrHandle }, { handle: idOrHandle }],
            },
            include: this.categoryInclude(),
        });
        if (!collection) {
            throw new common_1.NotFoundException('Collection not found.');
        }
        return collection;
    }
    async assertUniqueProductHandle(handle, excludeId) {
        const existing = await this.prisma.product.findFirst({
            where: {
                handle,
                id: excludeId ? { not: excludeId } : undefined,
            },
            select: { id: true },
        });
        if (existing) {
            throw new common_1.ConflictException('Product handle already exists.');
        }
    }
    async assertUniqueCollectionHandle(handle, excludeId) {
        const existing = await this.prisma.category.findFirst({
            where: {
                handle,
                id: excludeId ? { not: excludeId } : undefined,
            },
            select: { id: true },
        });
        if (existing) {
            throw new common_1.ConflictException('Collection handle already exists.');
        }
    }
    async assertUniqueBrandHandle(handle) {
        const existing = await this.prisma.brand.findUnique({
            where: { handle },
            select: { id: true },
        });
        if (existing) {
            throw new common_1.ConflictException('Brand handle already exists.');
        }
    }
    async assertCategoryIdsExist(tx, categoryIds) {
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
            throw new common_1.BadRequestException('One or more category ids are invalid.');
        }
    }
    async assertBrandExists(tx, brandId) {
        if (!brandId) {
            return;
        }
        const brand = await tx.brand.findUnique({
            where: { id: brandId },
            select: { id: true },
        });
        if (!brand) {
            throw new common_1.BadRequestException('Brand not found.');
        }
    }
    toPrismaProductStatus(status) {
        switch (status) {
            case 'draft':
                return client_1.ProductStatus.DRAFT;
            case 'scheduled':
                return client_1.ProductStatus.SCHEDULED;
            case 'archived':
                return client_1.ProductStatus.ARCHIVED;
            case 'active':
            case undefined:
            case null:
            case '':
                return client_1.ProductStatus.ACTIVE;
            default:
                throw new common_1.BadRequestException('Invalid product status.');
        }
    }
    fromPrismaProductStatus(status) {
        switch (status) {
            case client_1.ProductStatus.DRAFT:
                return 'draft';
            case client_1.ProductStatus.SCHEDULED:
                return 'scheduled';
            case client_1.ProductStatus.ARCHIVED:
                return 'archived';
            case client_1.ProductStatus.ACTIVE:
            default:
                return 'active';
        }
    }
    toPrismaCollectionStatus(status) {
        switch (status) {
            case 'hidden':
                return client_1.CollectionStatus.HIDDEN;
            case 'active':
            case undefined:
            case null:
            case '':
                return client_1.CollectionStatus.ACTIVE;
            default:
                throw new common_1.BadRequestException('Invalid collection status.');
        }
    }
    fromPrismaCollectionStatus(status) {
        return status === client_1.CollectionStatus.HIDDEN ? 'hidden' : 'active';
    }
    stripHtml(value) {
        return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    handlePrismaError(error) {
        if (error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 'P2002') {
            throw new common_1.ConflictException('A unique field already exists.');
        }
        throw error;
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map
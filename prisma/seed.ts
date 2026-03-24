import {
  AdminUserStatus,
  CollectionStatus,
  PrismaClient,
  ProductStatus,
} from '@prisma/client';
import {
  PERMISSIONS,
  ROLE_PERMISSION_MAP,
} from '../src/common/auth/permissions.constants';
import {
  DEV_ADMIN_PASSWORD_HASH,
  DEV_CUSTOMER_PASSWORD_HASH,
} from '../src/modules/auth/password.util';

const prisma = new PrismaClient();
const DEFAULT_LOCALE = 'zh';
const DEFAULT_CURRENCY = 'USD';
const DEFAULT_IMAGE = '/images/products/teddy-bear-classic.jpg';

const ROLE_METADATA: Record<
  keyof typeof ROLE_PERMISSION_MAP,
  { name: string; description: string }
> = {
  super_admin: {
    name: 'Super Admin',
    description: 'Full access to the CatShop admin backend.',
  },
  catalog_manager: {
    name: 'Catalog Manager',
    description: 'Manages products, collections, brands, and inventory.',
  },
  support_agent: {
    name: 'Support Agent',
    description: 'Handles customer and order operations.',
  },
};

const PERMISSION_METADATA: Record<
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS],
  { name: string; description: string }
> = {
  [PERMISSIONS.catalogRead]: {
    name: 'Catalog Read',
    description: 'Read products, categories, and brands.',
  },
  [PERMISSIONS.catalogWrite]: {
    name: 'Catalog Write',
    description: 'Create and update products, categories, and brands.',
  },
  [PERMISSIONS.ordersRead]: {
    name: 'Orders Read',
    description: 'Read orders and related details.',
  },
  [PERMISSIONS.ordersWrite]: {
    name: 'Orders Write',
    description: 'Update order status, shipments, and returns.',
  },
  [PERMISSIONS.customersRead]: {
    name: 'Customers Read',
    description: 'Read customer records and profiles.',
  },
  [PERMISSIONS.inventoryRead]: {
    name: 'Inventory Read',
    description: 'Read inventory levels and reservations.',
  },
  [PERMISSIONS.inventoryWrite]: {
    name: 'Inventory Write',
    description: 'Adjust inventory and reservations.',
  },
  [PERMISSIONS.analyticsRead]: {
    name: 'Analytics Read',
    description: 'Read analytics and reporting data.',
  },
  [PERMISSIONS.adminsRead]: {
    name: 'Admins Read',
    description: 'Read admin users and roles.',
  },
  [PERMISSIONS.adminsWrite]: {
    name: 'Admins Write',
    description: 'Create and update admin users.',
  },
};

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const adminPasswordHash =
    process.env.ADMIN_PASSWORD_HASH ?? DEV_ADMIN_PASSWORD_HASH;
  const customerEmail = process.env.CUSTOMER_EMAIL ?? 'alice@example.com';
  const customerPasswordHash =
    process.env.CUSTOMER_PASSWORD_HASH ?? DEV_CUSTOMER_PASSWORD_HASH;

  const permissions = await seedPermissions();
  const roles = await seedRoles(permissions);
  await seedAdmin(adminEmail, adminPasswordHash, roles.super_admin.id);

  if (isProduction) {
    return;
  }

  await seedCustomer(customerEmail, customerPasswordHash);

  const brand = await seedBrand();
  const category = await seedCategory();

  await seedProduct({
    sku: 'CAT-PLUSH-001',
    handle: 'classic-teddy-bear',
    title: '经典泰迪熊',
    description: '柔软亲肤的经典玩偶，适合作为礼物和日常陪伴。',
    status: ProductStatus.ACTIVE,
    brandId: brand.id,
    categoryId: category.id,
    imageUrl: DEFAULT_IMAGE,
    price: 39.9,
    inventory: 120,
  });

  await seedProduct({
    sku: 'CAT-PLUSH-002',
    handle: 'sleepy-kitty-plush',
    title: '瞌睡猫咪抱枕',
    description: '适合卧室和沙发陈列的猫咪玩偶抱枕。',
    status: ProductStatus.DRAFT,
    brandId: brand.id,
    categoryId: category.id,
    imageUrl: '/images/products/teddy-bear-plush.jpg',
    price: 29.9,
    inventory: 45,
  });
}

async function seedPermissions() {
  const entries = await Promise.all(
    Object.values(PERMISSIONS).map(async (key) => {
      const metadata = PERMISSION_METADATA[key];
      const permission = await prisma.permission.upsert({
        where: { key },
        update: {
          name: metadata.name,
          description: metadata.description,
        },
        create: {
          key,
          name: metadata.name,
          description: metadata.description,
        },
      });

      return [key, permission] as const;
    }),
  );

  return Object.fromEntries(entries);
}

async function seedRoles(
  permissions: Record<string, Awaited<ReturnType<typeof prisma.permission.upsert>>>,
) {
  const roles = {} as Record<
    keyof typeof ROLE_PERMISSION_MAP,
    Awaited<ReturnType<typeof prisma.role.upsert>>
  >;

  for (const roleKey of Object.keys(ROLE_PERMISSION_MAP) as Array<
    keyof typeof ROLE_PERMISSION_MAP
  >) {
    const metadata = ROLE_METADATA[roleKey];
    const role = await prisma.role.upsert({
      where: { key: roleKey },
      update: {
        name: metadata.name,
        description: metadata.description,
      },
      create: {
        key: roleKey,
        name: metadata.name,
        description: metadata.description,
      },
    });

    const permissionIds = ROLE_PERMISSION_MAP[roleKey].map(
      (permissionKey) => permissions[permissionKey].id,
    );

    await prisma.rolePermission.deleteMany({
      where: {
        roleId: role.id,
        permissionId: {
          notIn: permissionIds,
        },
      },
    });

    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      })),
      skipDuplicates: true,
    });

    roles[roleKey] = role;
  }

  return roles;
}

async function seedAdmin(
  email: string,
  passwordHash: string,
  roleId: string,
) {
  await prisma.adminUser.upsert({
    where: { email },
    update: {
      name: 'Primary Admin',
      passwordHash,
      roleId,
      status: AdminUserStatus.ACTIVE,
    },
    create: {
      email,
      passwordHash,
      name: 'Primary Admin',
      roleId,
      status: AdminUserStatus.ACTIVE,
    },
  });
}

async function seedCustomer(email: string, passwordHash: string) {
  await prisma.customer.upsert({
    where: { email },
    update: {
      firstName: 'Alice',
      lastName: 'Shopper',
      passwordHash,
      phone: '+1 555 0101',
    },
    create: {
      email,
      passwordHash,
      firstName: 'Alice',
      lastName: 'Shopper',
      phone: '+1 555 0101',
    },
  });
}

async function seedBrand() {
  const brand = await prisma.brand.upsert({
    where: { handle: 'catroom-studio' },
    update: {
      logoUrl: DEFAULT_IMAGE,
    },
    create: {
      handle: 'catroom-studio',
      logoUrl: DEFAULT_IMAGE,
    },
  });

  await prisma.brandTranslation.upsert({
    where: {
      brandId_locale: {
        brandId: brand.id,
        locale: DEFAULT_LOCALE,
      },
    },
    update: {
      name: '猫舍工作室',
      description: '原创玩偶与毛绒产品设计品牌。',
    },
    create: {
      brandId: brand.id,
      locale: DEFAULT_LOCALE,
      name: '猫舍工作室',
      description: '原创玩偶与毛绒产品设计品牌。',
    },
  });

  return brand;
}

async function seedCategory() {
  const category = await prisma.category.upsert({
    where: { handle: 'plush-toys' },
    update: {
      status: CollectionStatus.ACTIVE,
      imageUrl: DEFAULT_IMAGE,
    },
    create: {
      handle: 'plush-toys',
      status: CollectionStatus.ACTIVE,
      imageUrl: DEFAULT_IMAGE,
    },
  });

  await prisma.categoryTranslation.upsert({
    where: {
      categoryId_locale: {
        categoryId: category.id,
        locale: DEFAULT_LOCALE,
      },
    },
    update: {
      title: '毛绒玩具',
      description: '适合礼品和居家陈列的毛绒玩具系列。',
      seoTitle: '毛绒玩具',
      seoDescription: '猫舍工作室毛绒玩具系列',
    },
    create: {
      categoryId: category.id,
      locale: DEFAULT_LOCALE,
      title: '毛绒玩具',
      description: '适合礼品和居家陈列的毛绒玩具系列。',
      seoTitle: '毛绒玩具',
      seoDescription: '猫舍工作室毛绒玩具系列',
    },
  });

  return category;
}

async function seedProduct(input: {
  sku: string;
  handle: string;
  title: string;
  description: string;
  status: ProductStatus;
  brandId: string;
  categoryId: string;
  imageUrl: string;
  price: number;
  inventory: number;
}) {
  const product = await prisma.product.upsert({
    where: { handle: input.handle },
    update: {
      sku: input.sku,
      brandId: input.brandId,
      status: input.status,
      publishAt: input.status === ProductStatus.ACTIVE ? new Date() : null,
    },
    create: {
      sku: input.sku,
      handle: input.handle,
      brandId: input.brandId,
      status: input.status,
      publishAt: input.status === ProductStatus.ACTIVE ? new Date() : null,
    },
  });

  await prisma.productTranslation.upsert({
    where: {
      productId_locale: {
        productId: product.id,
        locale: DEFAULT_LOCALE,
      },
    },
    update: {
      title: input.title,
      shortDescription: input.description,
      descriptionHtml: `<p>${input.description}</p>`,
      seoTitle: input.title,
      seoDescription: input.description,
    },
    create: {
      productId: product.id,
      locale: DEFAULT_LOCALE,
      title: input.title,
      shortDescription: input.description,
      descriptionHtml: `<p>${input.description}</p>`,
      seoTitle: input.title,
      seoDescription: input.description,
    },
  });

  const existingImage = await prisma.productImage.findFirst({
    where: { productId: product.id },
    orderBy: { position: 'asc' },
  });

  if (existingImage) {
    await prisma.productImage.update({
      where: { id: existingImage.id },
      data: {
        url: input.imageUrl,
        isPrimary: true,
        position: 0,
      },
    });
  } else {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: input.imageUrl,
        isPrimary: true,
        position: 0,
      },
    });
  }

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: {
        productId: product.id,
        categoryId: input.categoryId,
      },
    },
    update: {},
    create: {
      productId: product.id,
      categoryId: input.categoryId,
    },
  });

  const variantSku = `${input.sku}-DEFAULT`;
  const variant = await prisma.productVariant.upsert({
    where: { sku: variantSku },
    update: {
      productId: product.id,
      title: 'Default',
      compareAtPrice: input.price + 10,
    },
    create: {
      productId: product.id,
      sku: variantSku,
      title: 'Default',
      compareAtPrice: input.price + 10,
    },
  });

  const existingPrice = await prisma.variantPrice.findFirst({
    where: {
      variantId: variant.id,
      currency: DEFAULT_CURRENCY,
      market: null,
    },
  });

  if (existingPrice) {
    await prisma.variantPrice.update({
      where: { id: existingPrice.id },
      data: {
        amount: input.price,
      },
    });
  } else {
    await prisma.variantPrice.create({
      data: {
        variantId: variant.id,
        currency: DEFAULT_CURRENCY,
        amount: input.price,
      },
    });
  }

  const inventoryItem = await prisma.inventoryItem.upsert({
    where: { variantId: variant.id },
    update: {
      quantityOnHand: input.inventory,
      lowStockThreshold: 5,
    },
    create: {
      variantId: variant.id,
      quantityOnHand: input.inventory,
      lowStockThreshold: 5,
    },
  });

  await prisma.stockAlertRule.upsert({
    where: { inventoryItemId: inventoryItem.id },
    update: {
      threshold: 5,
      enabled: true,
    },
    create: {
      inventoryItemId: inventoryItem.id,
      threshold: 5,
      enabled: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

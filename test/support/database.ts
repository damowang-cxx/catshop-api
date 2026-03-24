import {
  AdminUserStatus,
  CollectionStatus,
  PrismaClient,
  ProductStatus,
} from '@prisma/client';
import {
  PERMISSIONS,
  ROLE_PERMISSION_MAP,
} from '../../src/common/auth/permissions.constants';
import {
  DEV_ADMIN_PASSWORD_HASH,
  DEV_CUSTOMER_PASSWORD_HASH,
} from '../../src/modules/auth/password.util';

const prisma = new PrismaClient();
const DEFAULT_LOCALE = 'zh';

export async function seedTestDatabase() {
  await resetDatabase();

  const permissions = await Promise.all(
    Object.values(PERMISSIONS).map((key) =>
      prisma.permission.upsert({
        where: { key },
        update: {
          name: key,
        },
        create: {
          key,
          name: key,
        },
      }),
    ),
  );

  const permissionByKey = Object.fromEntries(
    permissions.map((permission) => [permission.key, permission]),
  );

  for (const [roleKey, rolePermissions] of Object.entries(ROLE_PERMISSION_MAP)) {
    const role = await prisma.role.upsert({
      where: { key: roleKey },
      update: {
        name: roleKey,
      },
      create: {
        key: roleKey,
        name: roleKey,
      },
    });

    await prisma.rolePermission.createMany({
      data: rolePermissions.map((permissionKey) => ({
        roleId: role.id,
        permissionId: permissionByKey[permissionKey].id,
      })),
      skipDuplicates: true,
    });
  }

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { key: 'super_admin' },
  });

  await prisma.adminUser.create({
    data: {
      email: 'admin@example.com',
      passwordHash: DEV_ADMIN_PASSWORD_HASH,
      name: 'Primary Admin',
      status: AdminUserStatus.ACTIVE,
      roleId: superAdminRole.id,
    },
  });

  await prisma.customer.create({
    data: {
      email: 'alice@example.com',
      passwordHash: DEV_CUSTOMER_PASSWORD_HASH,
      firstName: 'Alice',
      lastName: 'Shopper',
      phone: '+1 555 0101',
    },
  });

  const brand = await prisma.brand.create({
    data: {
      handle: 'catroom-studio',
      translations: {
        create: {
          locale: DEFAULT_LOCALE,
          name: '猫舍工作室',
        },
      },
    },
  });

  const category = await prisma.category.create({
    data: {
      handle: 'plush-toys',
      status: CollectionStatus.ACTIVE,
      translations: {
        create: {
          locale: DEFAULT_LOCALE,
          title: '毛绒玩具',
        },
      },
    },
  });

  await createProduct({
    sku: 'CAT-PLUSH-001',
    handle: 'classic-teddy-bear',
    title: '经典泰迪熊',
    status: ProductStatus.ACTIVE,
    brandId: brand.id,
    categoryId: category.id,
    inventory: 20,
    price: 39.9,
  });

  await createProduct({
    sku: 'CAT-PLUSH-002',
    handle: 'sleepy-kitty-plush',
    title: '瞌睡猫咪抱枕',
    status: ProductStatus.DRAFT,
    brandId: brand.id,
    categoryId: category.id,
    inventory: 10,
    price: 29.9,
  });
}

async function createProduct(input: {
  sku: string;
  handle: string;
  title: string;
  status: ProductStatus;
  brandId: string;
  categoryId: string;
  inventory: number;
  price: number;
}) {
  const product = await prisma.product.create({
    data: {
      sku: input.sku,
      handle: input.handle,
      status: input.status,
      brandId: input.brandId,
      translations: {
        create: {
          locale: DEFAULT_LOCALE,
          title: input.title,
          shortDescription: input.title,
          descriptionHtml: `<p>${input.title}</p>`,
        },
      },
      images: {
        create: {
          url: '/images/products/teddy-bear-classic.jpg',
          isPrimary: true,
          position: 0,
        },
      },
      categories: {
        create: {
          categoryId: input.categoryId,
        },
      },
    },
  });

  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku: `${input.sku}-DEFAULT`,
      title: 'Default',
      compareAtPrice: input.price + 10,
    },
  });

  await prisma.variantPrice.create({
    data: {
      variantId: variant.id,
      currency: 'USD',
      amount: input.price,
    },
  });

  await prisma.inventoryItem.create({
    data: {
      variantId: variant.id,
      quantityOnHand: input.inventory,
      lowStockThreshold: 5,
    },
  });
}

async function resetDatabase() {
  const tables = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
    `
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
    `,
  );

  if (tables.length === 0) {
    return;
  }

  const quotedTables = tables.map(({ tablename }) => `"${tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${quotedTables} RESTART IDENTITY CASCADE;`,
  );
}

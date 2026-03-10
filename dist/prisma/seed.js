"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminRole = await prisma.role.upsert({
        where: { key: 'super_admin' },
        update: {},
        create: {
            key: 'super_admin',
            name: 'Super Admin',
            description: 'Full access to the CatShop admin backend.',
        },
    });
    await prisma.adminUser.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            passwordHash: 'replace-me',
            name: 'Primary Admin',
            roleId: adminRole.id,
        },
    });
    const brand = await prisma.brand.upsert({
        where: { handle: 'catroom-studio' },
        update: {},
        create: {
            handle: 'catroom-studio',
            logoUrl: '/images/products/teddy-bear-classic.jpg',
            translations: {
                create: {
                    locale: 'en',
                    name: 'CatRoom Studio',
                    description: 'Original plush toy studio.',
                },
            },
        },
    });
    const category = await prisma.category.upsert({
        where: { handle: 'plush-toys' },
        update: {},
        create: {
            handle: 'plush-toys',
            status: client_1.CollectionStatus.ACTIVE,
            translations: {
                create: {
                    locale: 'en',
                    title: 'Plush Toys',
                    description: 'Soft plush toys for gifting.',
                },
            },
        },
    });
    await prisma.product.upsert({
        where: { handle: 'classic-teddy-bear' },
        update: {},
        create: {
            sku: 'TEDDY-001',
            handle: 'classic-teddy-bear',
            status: client_1.ProductStatus.ACTIVE,
            brandId: brand.id,
            translations: {
                create: {
                    locale: 'en',
                    title: 'Classic Teddy Bear',
                    shortDescription: 'A warm and classic teddy bear.',
                    descriptionHtml: '<p>A warm and classic teddy bear.</p>',
                },
            },
            images: {
                create: {
                    url: '/images/products/teddy-bear-classic.jpg',
                    isPrimary: true,
                },
            },
            categories: {
                create: {
                    categoryId: category.id,
                },
            },
            variants: {
                create: {
                    sku: 'TEDDY-001-DEFAULT',
                    title: 'Default',
                    prices: {
                        create: {
                            currency: 'USD',
                            amount: 39.9,
                        },
                    },
                },
            },
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
//# sourceMappingURL=seed.js.map
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
const pagination_1 = require("../../common/utils/pagination");
const mock_database_service_1 = require("../../shared/mock-database.service");
let CatalogService = class CatalogService {
    mockDb;
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    listProducts(query, adminView = false) {
        let products = [...this.mockDb.products];
        if (!adminView) {
            products = products.filter((product) => product.status === 'active');
        }
        if (query.q) {
            const keyword = query.q.toLowerCase();
            products = products.filter((product) => product.title.toLowerCase().includes(keyword) ||
                product.handle.toLowerCase().includes(keyword));
        }
        if (adminView && query.status) {
            products = products.filter((product) => product.status === query.status);
        }
        products = this.sortProducts(products, query.sortKey, query.reverse ?? false);
        return adminView ? (0, pagination_1.paginate)(products, query) : products;
    }
    getProduct(idOrHandle) {
        const product = this.mockDb.products.find((candidate) => candidate.id === idOrHandle || candidate.handle === idOrHandle);
        if (!product) {
            throw new common_1.NotFoundException('Product not found.');
        }
        return product;
    }
    getProductRecommendations(idOrHandle) {
        const product = this.getProduct(idOrHandle);
        const recommendations = product.recommendationIds
            .map((id) => this.mockDb.products.find((candidate) => candidate.id === id))
            .filter((candidate) => Boolean(candidate))
            .filter((candidate) => candidate.status === 'active');
        if (recommendations.length > 0) {
            return recommendations;
        }
        return this.mockDb.products
            .filter((candidate) => candidate.id !== product.id &&
            candidate.collectionIds.some((collectionId) => product.collectionIds.includes(collectionId)) &&
            candidate.status === 'active')
            .slice(0, 4);
    }
    createProduct(payload) {
        const now = new Date().toISOString();
        const imageUrls = payload.images?.length
            ? payload.images
            : payload.featuredImage
                ? [payload.featuredImage]
                : [];
        const images = imageUrls.map((url) => ({ url }));
        const product = {
            id: this.mockDb.createId('prod'),
            title: payload.title,
            handle: payload.handle,
            description: payload.description ?? '',
            price: payload.price,
            compareAtPrice: payload.compareAtPrice,
            inventory: payload.inventory,
            status: payload.status === 'draft' ||
                payload.status === 'scheduled' ||
                payload.status === 'archived'
                ? payload.status
                : 'active',
            images,
            featuredImage: images[payload.primaryImageIndex ?? 0] ?? images[0] ?? null,
            primaryImageIndex: payload.primaryImageIndex ?? 0,
            availableForSale: (payload.status ?? 'active') === 'active',
            brandId: undefined,
            collectionIds: [],
            tags: [],
            options: [],
            variants: [
                {
                    id: this.mockDb.createId('var'),
                    title: 'Default',
                    price: {
                        amount: payload.price.toFixed(2),
                        currencyCode: 'USD',
                    },
                    availableForSale: true,
                    selectedOptions: [],
                },
            ],
            recommendationIds: [],
            createdAt: now,
            updatedAt: now,
        };
        this.mockDb.products.unshift(product);
        return product;
    }
    updateProduct(id, payload) {
        const product = this.getProduct(id);
        product.title = payload.title ?? product.title;
        product.handle = payload.handle ?? product.handle;
        product.description = payload.description ?? product.description;
        product.price = payload.price ?? product.price;
        product.compareAtPrice = payload.compareAtPrice ?? product.compareAtPrice;
        product.inventory = payload.inventory ?? product.inventory;
        if (payload.status === 'draft' ||
            payload.status === 'active' ||
            payload.status === 'scheduled' ||
            payload.status === 'archived') {
            product.status = payload.status;
            product.availableForSale = payload.status === 'active';
        }
        if (payload.images) {
            product.images = payload.images.map((url) => ({ url }));
        }
        if (typeof payload.primaryImageIndex === 'number') {
            product.primaryImageIndex = payload.primaryImageIndex;
        }
        product.featuredImage =
            product.images[product.primaryImageIndex] ?? product.images[0] ?? null;
        product.updatedAt = new Date().toISOString();
        return product;
    }
    deleteProduct(id) {
        const index = this.mockDb.products.findIndex((product) => product.id === id);
        if (index < 0) {
            throw new common_1.NotFoundException('Product not found.');
        }
        const [deleted] = this.mockDb.products.splice(index, 1);
        this.refreshCollectionCounts();
        return deleted;
    }
    applyProductBulkAction(payload) {
        if (payload.action === 'delete') {
            this.mockDb.products.splice(0, this.mockDb.products.length, ...this.mockDb.products.filter((product) => !payload.ids.includes(product.id)));
            this.refreshCollectionCounts();
            return { updated: payload.ids.length };
        }
        if (payload.action === 'updateStatus' && payload.status) {
            this.mockDb.products.forEach((product) => {
                if (payload.ids.includes(product.id)) {
                    product.status = payload.status;
                    product.availableForSale = payload.status === 'active';
                    product.updatedAt = new Date().toISOString();
                }
            });
        }
        return { updated: payload.ids.length };
    }
    listCollections(query, adminView = false) {
        this.refreshCollectionCounts();
        let collections = [...this.mockDb.collections];
        if (!adminView) {
            collections = collections.filter((collection) => collection.status === 'active');
        }
        if (query.q) {
            const keyword = query.q.toLowerCase();
            collections = collections.filter((collection) => collection.title.toLowerCase().includes(keyword) ||
                collection.handle.toLowerCase().includes(keyword));
        }
        if (adminView && query.status) {
            collections = collections.filter((collection) => collection.status === query.status);
        }
        return adminView ? (0, pagination_1.paginate)(collections, query) : collections;
    }
    getCollection(idOrHandle) {
        const collection = this.mockDb.collections.find((candidate) => candidate.id === idOrHandle || candidate.handle === idOrHandle);
        if (!collection) {
            throw new common_1.NotFoundException('Collection not found.');
        }
        this.refreshCollectionCounts();
        return collection;
    }
    getCollectionProducts(handle, query) {
        const collection = this.getCollection(handle);
        const products = this.mockDb.products.filter((product) => product.collectionIds.includes(collection.id) && product.status === 'active');
        return this.sortProducts(products, query.sortKey, query.reverse ?? false);
    }
    createCollection(payload) {
        const collection = {
            id: this.mockDb.createId('col'),
            title: payload.title,
            handle: payload.handle,
            description: payload.description,
            image: payload.image,
            status: payload.status === 'hidden' ? 'hidden' : 'active',
            productCount: 0,
            updatedAt: new Date().toISOString(),
        };
        this.mockDb.collections.unshift(collection);
        return collection;
    }
    updateCollection(id, payload) {
        const collection = this.getCollection(id);
        collection.title = payload.title ?? collection.title;
        collection.handle = payload.handle ?? collection.handle;
        collection.description = payload.description ?? collection.description;
        collection.image = payload.image ?? collection.image;
        if (payload.status === 'hidden' || payload.status === 'active') {
            collection.status = payload.status;
        }
        collection.updatedAt = new Date().toISOString();
        this.refreshCollectionCounts();
        return collection;
    }
    deleteCollection(id) {
        const index = this.mockDb.collections.findIndex((collection) => collection.id === id);
        if (index < 0) {
            throw new common_1.NotFoundException('Collection not found.');
        }
        const [deleted] = this.mockDb.collections.splice(index, 1);
        this.mockDb.products.forEach((product) => {
            product.collectionIds = product.collectionIds.filter((collectionId) => collectionId !== id);
        });
        this.refreshCollectionCounts();
        return deleted;
    }
    applyCollectionBulkAction(payload) {
        if (payload.action === 'delete') {
            this.mockDb.collections.splice(0, this.mockDb.collections.length, ...this.mockDb.collections.filter((collection) => !payload.ids.includes(collection.id)));
            this.refreshCollectionCounts();
            return { updated: payload.ids.length };
        }
        if (payload.action === 'updateStatus' && payload.status) {
            this.mockDb.collections.forEach((collection) => {
                if (payload.ids.includes(collection.id)) {
                    collection.status = payload.status === 'hidden' ? 'hidden' : 'active';
                    collection.updatedAt = new Date().toISOString();
                }
            });
        }
        return { updated: payload.ids.length };
    }
    listBrands() {
        return this.mockDb.brands;
    }
    createBrand(payload) {
        const brand = {
            id: this.mockDb.createId('brand'),
            name: payload.name,
            handle: payload.handle,
            description: payload.description,
            logo: payload.logo,
        };
        this.mockDb.brands.unshift(brand);
        return brand;
    }
    sortProducts(products, sortKey, reverse = false) {
        const sorted = [...products];
        if (sortKey?.toLowerCase() === 'price') {
            sorted.sort((left, right) => left.price - right.price);
        }
        else {
            sorted.sort((left, right) => left.title.localeCompare(right.title));
        }
        return reverse ? sorted.reverse() : sorted;
    }
    refreshCollectionCounts() {
        this.mockDb.collections.forEach((collection) => {
            collection.productCount = this.mockDb.products.filter((product) => product.collectionIds.includes(collection.id)).length;
        });
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_database_service_1.MockDatabaseService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map
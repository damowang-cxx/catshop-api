import { MockDatabaseService } from '../../shared/mock-database.service';
import { AddCartLinesDto } from './dto/add-cart-lines.dto';
import { RemoveCartLinesDto } from './dto/remove-cart-lines.dto';
export declare class CartService {
    private readonly mockDb;
    constructor(mockDb: MockDatabaseService);
    createCart(): {
        id: string;
        checkoutUrl: string;
        items: {
            id: string;
            quantity: number;
            cost: {
                totalAmount: {
                    amount: string;
                    currencyCode: string;
                };
            };
            merchandise: {
                id: string;
                title: string;
                selectedOptions: {
                    name: string;
                    value: string;
                }[];
                product: {
                    id: string;
                    handle: string;
                    title: string;
                    featuredImage: import("../../common/types/domain.types").ImageRecord | undefined;
                } | undefined;
            };
        }[];
        lines: {
            id: string;
            quantity: number;
            cost: {
                totalAmount: {
                    amount: string;
                    currencyCode: string;
                };
            };
            merchandise: {
                id: string;
                title: string;
                selectedOptions: {
                    name: string;
                    value: string;
                }[];
                product: {
                    id: string;
                    handle: string;
                    title: string;
                    featuredImage: import("../../common/types/domain.types").ImageRecord | undefined;
                } | undefined;
            };
        }[];
        subtotal: {
            amount: string;
            currencyCode: string;
        };
        total: {
            amount: string;
            currencyCode: string;
        };
        tax: {
            amount: string;
            currencyCode: string;
        };
        cost: {
            subtotalAmount: {
                amount: string;
                currencyCode: string;
            };
            totalAmount: {
                amount: string;
                currencyCode: string;
            };
            totalTaxAmount: {
                amount: string;
                currencyCode: string;
            };
        };
        totalQuantity: number;
    };
    getCart(id: string): {
        id: string;
        checkoutUrl: string;
        items: {
            id: string;
            quantity: number;
            cost: {
                totalAmount: {
                    amount: string;
                    currencyCode: string;
                };
            };
            merchandise: {
                id: string;
                title: string;
                selectedOptions: {
                    name: string;
                    value: string;
                }[];
                product: {
                    id: string;
                    handle: string;
                    title: string;
                    featuredImage: import("../../common/types/domain.types").ImageRecord | undefined;
                } | undefined;
            };
        }[];
        lines: {
            id: string;
            quantity: number;
            cost: {
                totalAmount: {
                    amount: string;
                    currencyCode: string;
                };
            };
            merchandise: {
                id: string;
                title: string;
                selectedOptions: {
                    name: string;
                    value: string;
                }[];
                product: {
                    id: string;
                    handle: string;
                    title: string;
                    featuredImage: import("../../common/types/domain.types").ImageRecord | undefined;
                } | undefined;
            };
        }[];
        subtotal: {
            amount: string;
            currencyCode: string;
        };
        total: {
            amount: string;
            currencyCode: string;
        };
        tax: {
            amount: string;
            currencyCode: string;
        };
        cost: {
            subtotalAmount: {
                amount: string;
                currencyCode: string;
            };
            totalAmount: {
                amount: string;
                currencyCode: string;
            };
            totalTaxAmount: {
                amount: string;
                currencyCode: string;
            };
        };
        totalQuantity: number;
    };
    addLines(cartId: string, payload: AddCartLinesDto): {
        id: string;
        checkoutUrl: string;
        items: {
            id: string;
            quantity: number;
            cost: {
                totalAmount: {
                    amount: string;
                    currencyCode: string;
                };
            };
            merchandise: {
                id: string;
                title: string;
                selectedOptions: {
                    name: string;
                    value: string;
                }[];
                product: {
                    id: string;
                    handle: string;
                    title: string;
                    featuredImage: import("../../common/types/domain.types").ImageRecord | undefined;
                } | undefined;
            };
        }[];
        lines: {
            id: string;
            quantity: number;
            cost: {
                totalAmount: {
                    amount: string;
                    currencyCode: string;
                };
            };
            merchandise: {
                id: string;
                title: string;
                selectedOptions: {
                    name: string;
                    value: string;
                }[];
                product: {
                    id: string;
                    handle: string;
                    title: string;
                    featuredImage: import("../../common/types/domain.types").ImageRecord | undefined;
                } | undefined;
            };
        }[];
        subtotal: {
            amount: string;
            currencyCode: string;
        };
        total: {
            amount: string;
            currencyCode: string;
        };
        tax: {
            amount: string;
            currencyCode: string;
        };
        cost: {
            subtotalAmount: {
                amount: string;
                currencyCode: string;
            };
            totalAmount: {
                amount: string;
                currencyCode: string;
            };
            totalTaxAmount: {
                amount: string;
                currencyCode: string;
            };
        };
        totalQuantity: number;
    };
    updateLines(cartId: string, payload: AddCartLinesDto): {
        id: string;
        checkoutUrl: string;
        items: {
            id: string;
            quantity: number;
            cost: {
                totalAmount: {
                    amount: string;
                    currencyCode: string;
                };
            };
            merchandise: {
                id: string;
                title: string;
                selectedOptions: {
                    name: string;
                    value: string;
                }[];
                product: {
                    id: string;
                    handle: string;
                    title: string;
                    featuredImage: import("../../common/types/domain.types").ImageRecord | undefined;
                } | undefined;
            };
        }[];
        lines: {
            id: string;
            quantity: number;
            cost: {
                totalAmount: {
                    amount: string;
                    currencyCode: string;
                };
            };
            merchandise: {
                id: string;
                title: string;
                selectedOptions: {
                    name: string;
                    value: string;
                }[];
                product: {
                    id: string;
                    handle: string;
                    title: string;
                    featuredImage: import("../../common/types/domain.types").ImageRecord | undefined;
                } | undefined;
            };
        }[];
        subtotal: {
            amount: string;
            currencyCode: string;
        };
        total: {
            amount: string;
            currencyCode: string;
        };
        tax: {
            amount: string;
            currencyCode: string;
        };
        cost: {
            subtotalAmount: {
                amount: string;
                currencyCode: string;
            };
            totalAmount: {
                amount: string;
                currencyCode: string;
            };
            totalTaxAmount: {
                amount: string;
                currencyCode: string;
            };
        };
        totalQuantity: number;
    };
    removeLines(cartId: string, payload: RemoveCartLinesDto): {
        id: string;
        checkoutUrl: string;
        items: {
            id: string;
            quantity: number;
            cost: {
                totalAmount: {
                    amount: string;
                    currencyCode: string;
                };
            };
            merchandise: {
                id: string;
                title: string;
                selectedOptions: {
                    name: string;
                    value: string;
                }[];
                product: {
                    id: string;
                    handle: string;
                    title: string;
                    featuredImage: import("../../common/types/domain.types").ImageRecord | undefined;
                } | undefined;
            };
        }[];
        lines: {
            id: string;
            quantity: number;
            cost: {
                totalAmount: {
                    amount: string;
                    currencyCode: string;
                };
            };
            merchandise: {
                id: string;
                title: string;
                selectedOptions: {
                    name: string;
                    value: string;
                }[];
                product: {
                    id: string;
                    handle: string;
                    title: string;
                    featuredImage: import("../../common/types/domain.types").ImageRecord | undefined;
                } | undefined;
            };
        }[];
        subtotal: {
            amount: string;
            currencyCode: string;
        };
        total: {
            amount: string;
            currencyCode: string;
        };
        tax: {
            amount: string;
            currencyCode: string;
        };
        cost: {
            subtotalAmount: {
                amount: string;
                currencyCode: string;
            };
            totalAmount: {
                amount: string;
                currencyCode: string;
            };
            totalTaxAmount: {
                amount: string;
                currencyCode: string;
            };
        };
        totalQuantity: number;
    };
    private serializeCart;
    private findCart;
    private findProductByMerchandise;
}

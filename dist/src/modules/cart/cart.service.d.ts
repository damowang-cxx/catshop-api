import { PrismaService } from '../../prisma/prisma.service';
import { AddCartLinesDto } from './dto/add-cart-lines.dto';
import { RemoveCartLinesDto } from './dto/remove-cart-lines.dto';
export declare class CartService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createCart(customerId?: string): Promise<{
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
                    featuredImage: {
                        url: string;
                        altText: string;
                        width: number;
                        height: number;
                    } | null;
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
                    featuredImage: {
                        url: string;
                        altText: string;
                        width: number;
                        height: number;
                    } | null;
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
    }>;
    getCart(id: string, customerId?: string): Promise<{
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
                    featuredImage: {
                        url: string;
                        altText: string;
                        width: number;
                        height: number;
                    } | null;
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
                    featuredImage: {
                        url: string;
                        altText: string;
                        width: number;
                        height: number;
                    } | null;
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
    }>;
    addLines(cartId: string, payload: AddCartLinesDto, customerId?: string): Promise<{
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
                    featuredImage: {
                        url: string;
                        altText: string;
                        width: number;
                        height: number;
                    } | null;
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
                    featuredImage: {
                        url: string;
                        altText: string;
                        width: number;
                        height: number;
                    } | null;
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
    }>;
    updateLines(cartId: string, payload: AddCartLinesDto, customerId?: string): Promise<{
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
                    featuredImage: {
                        url: string;
                        altText: string;
                        width: number;
                        height: number;
                    } | null;
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
                    featuredImage: {
                        url: string;
                        altText: string;
                        width: number;
                        height: number;
                    } | null;
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
    }>;
    removeLines(cartId: string, payload: RemoveCartLinesDto, customerId?: string): Promise<{
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
                    featuredImage: {
                        url: string;
                        altText: string;
                        width: number;
                        height: number;
                    } | null;
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
                    featuredImage: {
                        url: string;
                        altText: string;
                        width: number;
                        height: number;
                    } | null;
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
    }>;
    clearCart(cartId: string, customerId?: string): Promise<void>;
    private serializeCart;
    private findCart;
    private findVariantByMerchandise;
}

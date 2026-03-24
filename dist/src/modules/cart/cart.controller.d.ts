import type { FastifyRequest } from 'fastify';
import { AuthService } from '../auth/auth.service';
import { CartService } from './cart.service';
import { AddCartLinesDto } from './dto/add-cart-lines.dto';
import { RemoveCartLinesDto } from './dto/remove-cart-lines.dto';
export declare class CartController {
    private readonly cartService;
    private readonly authService;
    constructor(cartService: CartService, authService: AuthService);
    private resolveCustomerId;
    getCart(id: string, request: FastifyRequest): Promise<{
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
    createCart(request: FastifyRequest): Promise<{
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
    addCartItems(id: string, payload: AddCartLinesDto, request: FastifyRequest): Promise<{
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
    updateCartItems(id: string, payload: AddCartLinesDto, request: FastifyRequest): Promise<{
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
    removeCartItems(id: string, payload: RemoveCartLinesDto, request: FastifyRequest): Promise<{
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
}

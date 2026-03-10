declare class CartLineInputDto {
    id?: string;
    merchandiseId: string;
    quantity: number;
}
export declare class AddCartLinesDto {
    lines: CartLineInputDto[];
}
export {};

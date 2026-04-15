export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartProductItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    description: string;
    imageUrl: string;
  };
}

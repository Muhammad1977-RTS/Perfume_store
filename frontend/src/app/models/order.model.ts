/** A single line in an order — includes product details at time of purchase */
export interface OrderItem {
  productId: string;
  name:      string;
  brand:     string;
  price:     number;
  quantity:  number;
}

export interface Order {
  id:        string;
  name:      string;
  phone:     string;
  address:   string;
  items:     OrderItem[];
  total:     number;
  createdAt: string;
  status:    'pending' | 'sent';
}

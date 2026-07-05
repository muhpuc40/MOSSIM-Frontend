export interface OrderItem {
  id: string;
  variant_id: string;
  qty: number;
  unit_price: number;
  discount_pct: number;
  line_total: number;
  product: {
    id: string;
    code: string;
    name: string;
    image: string | null;
  } | null;
  variant: {
    sku: string;
    color: { id: string; name: string; hex: string } | null;
    size: { id: string; name: string } | null;
  } | null;
}

export interface OrderAddress {
  recipient_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  tracking_number?: string | null;
  channel: string;
  status: string;
  status_label: string;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  is_paid: boolean;
  notes: string | null;
  placed_at: string;
  item_count?: number;
  currency: { code: string; symbol: string } | null;
  coupon: { id: string; code: string } | null;
  shipping_address: OrderAddress | null;
  items?: OrderItem[];
  payments?: any[];
  shipment?: any;
}

export interface CouponResult {
  coupon: {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
  };
  subtotal: number;
  discount: number;
  final_total: number;
}

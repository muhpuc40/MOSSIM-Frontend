export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  type: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  default_address: CustomerAddress | null;
}

export interface CustomerAddress {
  id: string;
  label: string | null;
  recipient_name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
}

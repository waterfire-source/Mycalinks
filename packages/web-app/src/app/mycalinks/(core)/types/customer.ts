// getPosCustomerInfoのレスポンスの型
export interface PosCustomerInfo {
  id: number;
  store_id: number;
  myca_user_id: number | null;
  birthday?: string;
  address?: string;
  zip_code?: string;
  full_name?: string;
  full_name_ruby?: string;
  email?: string;
  phone_number?: string;
  gender?: string;
  career?: string;
  owned_point?: number;
  created_at: string;
  updated_at: string;
  store?: {
    id: number;
    display_name?: string;
    receipt_logo_url?: string | null;
  };
}

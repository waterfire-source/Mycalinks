import { ArrivalStatus } from '@/feature/arrival/manage/arrivalStatus/Tabs';

export interface ArrivalTableType {
  id: number;
  status: ArrivalStatus;
  products: string[];
  expectedArrivalData: string;
  arrivalData: string | undefined;
  supplier: string;
  arrivalStore: string;
  memo?: string;
}

export interface ArrivalProductType {
  id: number;
  product: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

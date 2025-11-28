export type SelectedElement = {
  id?: number;
  nom: string;
  step_type: string;
}

export type Item = {
  id?: number;
  product_id?: number;
  category_id?: number;
  etat_cuisine?: number;
  nom: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selectedElements?: SelectedElement[];
}

export type Order = {
  id?: number;
  total: number;
  table?: number | null;
  note?: string | null;
  paymentState?: string;
  saleMode?: string;
  paymentMode?: string;
  date?: string;
  items: Item[];
  createdAt?: string;
  order_date?: string;
}

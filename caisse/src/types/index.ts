export interface Element {
  id: number;
  nom: string;
  prix?: number;
  image?: string;
  description?: string;
  included?: boolean; // Pour les éléments inclus par défaut
  excludeId?: number; // Pour les options "sans" qui retirent un élément
}

export interface Step {
  type: string;
  nom: string;
  description?: string;
  elements: Element[];
  minSelection?: number;
  maxSelection?: number;
  required?: boolean;
}

export interface Produit {
  id: number;
  nom: string;
  image: string;
  prix: number;
  promo: boolean;
  promo_type?: 'percentage' | 'fixed_price' | null;
  promo_value?: number | null;
  prix_promo?: number;
  description?: string;
  category_id?: number;
  steps: Step[];
}

export interface Categorie {
  id: number;
  nom: string;
  image?: string;
  promo?: boolean;
  promo_type?: 'percentage' | 'fixed_price' | null;
  promo_value?: number | null;
  prix?: any;
  description?: string;
  steps?: Step[];
  // A category may either contain products directly, or contain nested subcategories
  produits?: Produit[];
  items?: Categorie[];
}

export interface SelectedElement {
  element: Element;
  stepType: string;
}

export interface CartItem {
  product: Produit;
  selectedElements: SelectedElement[];
  quantity: number;
  totalPrice: number;
  categoryId?: number;
}

export interface Order {
  items: CartItem[];
  total: number;
  table?: string | number;
  saleMode?: string;
  paymentMode?: string;
  paymentState?: number; // 0 = non payé, 1 = payé
}
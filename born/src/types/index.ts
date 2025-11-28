export interface Element {
    id: number;
    nom: string;
    prix?: number;
    image?: string;
    description?: string;
    included?: boolean;
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

export interface Product {
    id: number;
    nom: string;
    image: string | null;
    prix: number;
    promo: boolean;
    promo_type?: 'percentage' | 'fixed_price' | null;
    promo_value?: number | null;
    prix_promo?: number;
    description?: string;
    categorie_id?: number;
    steps?: Step[];
}

export interface Category {
    id: number;
    nom: string;
    image: string | null;
    promo: boolean;
    promo_type?: 'percentage' | 'fixed_price' | null;
    promo_value?: number | null;
    produits?: Product[];
    items?: Category[];
}

export interface SelectedElement {
    element: Element;
    stepType: string;
}

export interface CartItem {
    product: Product;
    selectedElements: SelectedElement[];
    quantity: number;
    totalPrice: number;
}

export type SaleMode = 'sur_place' | 'emporter';

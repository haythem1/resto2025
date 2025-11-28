import React from 'react';
import type { Product } from '../types';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
    onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
    const displayPrice = product.promo && product.prix_promo ? product.prix_promo : product.prix;

    return (
        <div className="product-card-kiosk" onClick={onClick}>
            {product.promo && (
                <div className="promo-badge">
                    {product.promo_type === 'percentage' ? `-${product.promo_value}%` : 'PROMO'}
                </div>
            )}
            <div className="product-image">
                {product.image ? (
                    <img src={product.image} alt={product.nom} />
                ) : (
                    <div className="no-image">📷</div>
                )}
            </div>
            <div className="product-info">
                <h3>{product.nom}</h3>
                <div className="price-container">
                    {product.promo && product.prix_promo ? (
                        <>
                            <span className="price-promo">{product.prix_promo.toFixed(2)} DT</span>
                            <span className="price-original">{product.prix.toFixed(2)} DT</span>
                        </>
                    ) : (
                        <span className="price">{product.prix.toFixed(2)} DT</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

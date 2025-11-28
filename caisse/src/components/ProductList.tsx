import React, { useState, useRef } from 'react';
import type { Produit } from '../types';
import CachedImage from './CachedImage';

interface ProductListProps {
  products: Produit[];
  onSelectProduct: (product: Produit) => void;
  onAddToCart: (product: Produit, selectedElements: any[]) => void;
  onBackToCategories: () => void;
  columns?: number;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onBackToCategories,
  columns = 5
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [columnsState, setColumnsState] = useState<number>(5);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    setShowScrollTop(scrollTop > 100);
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleProductClick = (product: Produit) => {
    if (!product.steps || product.steps.length === 0) {
      onAddToCart(product, []);
    } else {
      onSelectProduct(product);
    }
  };

  const getButtonText = (product: Produit) => {
    if (!product.steps || product.steps.length === 0) {
      return 'Ajouter au panier 🛒';
    }
    return 'Personnaliser ✓';
  };

  const getButtonClass = (product: Produit) => {
    if (!product.steps || product.steps.length === 0) {
      return 'add-to-cart-button';
    }
    return 'customize-button';
  };

  return (
    <div className="product-list">
      <div className="product-list-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="back-button" onClick={onBackToCategories}>
            ← Catégories
          </button>
          <label style={{ fontSize: '0.9rem', color: '#fff', background: 'transparent' }} htmlFor="columns-select">Colonnes:</label>

        </div>

      </div>

      <div
        className="products-grid-container"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ maxHeight: '700px' }} // Hauteur fixe de 500px
      >
        <div className={`products-grid products-grid-${columnsState}`}>
          {products.map(product => (
            <div
              key={product.id}
              className="product-card"
            >
              <div
                className="product-image-container"
                onClick={() => handleProductClick(product)}
              >
                <CachedImage
                  src={product.image}
                  alt={product.nom}
                  className="product-image"
                  fallbackSrc="/placeholder-product.png"
                />
              </div>

              <div className="product-info" onClick={() => handleProductClick(product)}>
                <p className="product-name">{product.nom}</p>
                {product.promo && product.prix_promo ? (
                  <div className="product-price-container">
                    <span className="product-price-promo">{Number(product.prix_promo).toFixed(2)} DT</span>
                    <span className="product-price-original">{Number(product.prix).toFixed(2)} DT</span>
                    {product.promo_type === 'percentage' && (
                      <span className="product-promo-badge">-{product.promo_value}%</span>
                    )}
                  </div>
                ) : (
                  <p className="product-price">{Number(product.prix).toFixed(2)} DT</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
};

export default ProductList;
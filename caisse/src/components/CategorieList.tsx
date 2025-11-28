import React, { useState } from 'react';
import type { Categorie } from '../types';
import CachedImage from './CachedImage';

interface CategorieListProps {
  categories: Categorie[];
  selectedCategory: Categorie | null;
  onSelectCategory: (category: Categorie) => void;
}

const CategorieList: React.FC<CategorieListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const [columns, setColumns] = useState<number>(5);

  const getProductCount = (categorie: Categorie) => {
    if (categorie.produits && categorie.produits.length) return categorie.produits.length
    if (categorie.items && categorie.items.length) {
      return categorie.items.reduce((acc, s) => acc + (s.produits?.length || 0), 0)
    }
    return 0
  }

  return (
    <div className="categorie-list">
      
      <div className={`categories-grid categories-grid-${columns}`}>
        {categories.map(categorie => (
          <div
            key={categorie.id}
            className={`categorie-card ${selectedCategory?.id === categorie.id ? 'selected' : ''} ${categorie.promo ? 'promo' : ''}`}
            onClick={() => onSelectCategory(categorie)}
          >
            <div className="categorie-image-container">
              <CachedImage
                src={categorie.image || ''}
                alt={categorie.nom}
                className="categorie-image"
                fallbackSrc="/placeholder-category.png"
              />
              <div className="categorie-overlay">
                <div className="product-count">
                  {getProductCount(categorie)} produit{getProductCount(categorie) > 1 ? 's' : ''}
                </div>
              </div>
              
              {categorie.promo && (
                <div className="promo-badge">
                  <span className="promo-text">🔥 PROMO</span>
                </div>
              )}
            </div>
            
            <div className="categorie-info">
              <h3 className="categorie-name">{categorie.nom}</h3>
              <div className="categorie-indicator">
                {selectedCategory?.id === categorie.id && (
                  <div className="selected-indicator">✓ Sélectionné</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorieList;
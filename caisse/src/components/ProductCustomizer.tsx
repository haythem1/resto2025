import React, { useState } from 'react';
import type { Produit, SelectedElement, Element } from '../types';

interface ProductCustomizerProps {
  product: Produit;
  onAddToCart: (product: Produit, selectedElements: SelectedElement[]) => void;
  onClose: () => void;
}

const ProductCustomizer: React.FC<ProductCustomizerProps> = ({
  product,
  onAddToCart,
  onClose
}) => {
  const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([]);

  const handleElementToggle = (stepType: string, element: Element) => {
    setSelectedElements(prev => {
      const existingIndex = prev.findIndex(
        item => item.stepType === stepType && item.element.id === element.id
      );

      if (existingIndex >= 0) {
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        return [...prev, { stepType, element }];
      }
    });
  };

  const calculateTotalPrice = () => {
    const supplementsPrice = selectedElements
      .filter(item => item.stepType !== 'composition')
      .reduce((total, item) => total + (item.element.prix || 0), 0);
    
    return product.prix + supplementsPrice;
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedElements);
    onClose();
  };

  return (
    <div className="product-customizer">
      <div className="customizer-header">
        <h2>Personnaliser {product.nom}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="customizer-content">
        {product.steps.map((step, index) => (
          <div key={index} className="step">
            <h3>{step.nom || `Étape ${index + 1}`}</h3>
            <div className="elements">
              {step.elements.map(element => (
                <div
                  key={element.id}
                  className={`element ${selectedElements.some(
                    item => item.stepType === step.type && item.element.id === element.id
                  ) ? 'selected' : ''}`}
                  onClick={() => handleElementToggle(step.type, element)}
                >
                  <span className="element-name">{element.nom}</span>
                  {element.prix && <span className="element-price">+{element.prix}€</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="customizer-footer">
        <div className="total-price">
          Total: {calculateTotalPrice().toFixed(2)}€
        </div>
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          Ajouter au panier
        </button>
      </div>
    </div>
  );
};

export default ProductCustomizer;
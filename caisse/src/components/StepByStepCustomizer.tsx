import React, { useState, useEffect } from 'react';
import type { Produit, SelectedElement, Element } from '../types';
import CachedImage from './CachedImage';

interface StepByStepCustomizerProps {
  product: Produit;
  onAddToCart: (product: Produit, selectedElements: SelectedElement[]) => void;
  onClose: () => void;
  initialSelectedElements?: SelectedElement[]; // Nouvelle prop pour l'édition
}

const StepByStepCustomizer: React.FC<StepByStepCustomizerProps> = ({
  product,
  onAddToCart,
  onClose,
  initialSelectedElements = []
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([]);
  const [excludedElements, setExcludedElements] = useState<number[]>([]);

  const steps = product.steps;
  const currentStepData = steps[currentStep];
  const isCompositionBaseStep = currentStepData.type === 'composition';

  // Récupérer l'étape composition une fois pour toutes
  const compositionBaseStep = product.steps.find(step => step.type === 'composition');

  // Initialiser les sélections depuis initialSelectedElements
  useEffect(() => {
    if (initialSelectedElements.length > 0) {
      // Séparer les exclusions des sélections normales
      const initialExclusions = initialSelectedElements
        .filter(item => item.stepType === 'exclusion')
        .map(item => {
          // Extraire l'ID original depuis l'ID modifié des exclusions
          return Math.floor(item.element.id / 1000);
        });
      
      const normalSelections = initialSelectedElements.filter(item => 
        item.stepType !== 'exclusion' && item.stepType !== 'composition'
      );

      setExcludedElements(initialExclusions);
      setSelectedElements(normalSelections);
    }
  }, [initialSelectedElements]);

  // Bloquer le défilement du body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Fermeture avec Echap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getSelectedElementsForStep = (stepType: string): Element[] => {
    return selectedElements
      .filter(item => item.stepType === stepType)
      .map(item => item.element);
  };

  const handleElementSelect = (element: Element) => {
    if (isCompositionBaseStep) {
      // Pour composition : toggle l'exclusion
      setExcludedElements(prev => 
        prev.includes(element.id) 
          ? prev.filter(id => id !== element.id)
          : [...prev, element.id]
      );
    } else {
      // Pour les autres étapes : sélection normale
      const stepSelectedElements = getSelectedElementsForStep(currentStepData.type);
      const isSelected = stepSelectedElements.some(el => el.id === element.id);
      const maxSelection = currentStepData.maxSelection || 1;

      setSelectedElements(prev => {
        if (isSelected) {
          return prev.filter(item => 
            !(item.stepType === currentStepData.type && item.element.id === element.id)
          );
        } else {
          if (stepSelectedElements.length >= maxSelection) {
            if (maxSelection === 1) {
              return prev.filter(item => item.stepType !== currentStepData.type)
                .concat([{ stepType: currentStepData.type, element }]);
            }
            return prev;
          } else {
            return [...prev, { stepType: currentStepData.type, element }];
          }
        }
      });
    }
  };

  const canProceed = (): boolean => {
    // Pour composition, toujours possible de continuer
    if (isCompositionBaseStep) {
      return true;
    }
    
    const stepSelected = getSelectedElementsForStep(currentStepData.type);
    
    if (currentStepData.required) {
      return stepSelected.length > 0;
    }
    
    if (currentStepData.minSelection) {
      return stepSelected.length >= currentStepData.minSelection;
    }
    
    return true;
  };

  const handleNext = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateTotalPrice = (): number => {
    const supplementsPrice = selectedElements.reduce(
      (total, item) => total + (item.element.prix || 0), 0
    );
    return product.prix + supplementsPrice;
  };

  const prepareSelectedElements = (): SelectedElement[] => {
    // Éléments normaux (sauf composition)
    const normalElements = selectedElements.filter(item => 
      item.stepType !== 'composition'
    );
    
    // CORRECTION : Utiliser compositionBaseStep pour trouver les éléments exclus
    const exclusionElements: SelectedElement[] = excludedElements.map(excludedId => {
      // Trouver l'élément exclu dans l'étape composition
      const excludedElement = compositionBaseStep?.elements.find(el => el.id === excludedId);
      
      return {
        stepType: 'exclusion',
        element: {
          id: excludedId * 1000,
          nom: excludedElement ? `Sans ${excludedElement.nom}` : `Sans ingrédient ${excludedId}`,
          prix: 0
        }
      };
    });

    return [...normalElements, ...exclusionElements];
  };

  const handleAddToCart = () => {
    if (canProceed()) {
      const finalSelectedElements = prepareSelectedElements();
      onAddToCart(product, finalSelectedElements);
      onClose();
    }
  };

  const getProgressPercentage = (): number => {
    return ((currentStep + 1) / steps.length) * 100;
  };

  const isElementSelected = (element: Element): boolean => {
    if (isCompositionBaseStep) {
      return excludedElements.includes(element.id);
    } else {
      return selectedElements.some(
        item => item.stepType === currentStepData.type && item.element.id === element.id
      );
    }
  };

  const getSelectionText = (): string => {
    if (isCompositionBaseStep) {
      return 'Cliquez sur les ingrédients à retirer';
    }
    
    if (currentStepData.maxSelection === 1) {
      return 'Choisissez une option' + (currentStepData.required ? ' (requis)' : '');
    }
    
    if (currentStepData.maxSelection && currentStepData.maxSelection > 1) {
      return `Choisissez jusqu'à ${currentStepData.maxSelection} options` + 
             (currentStepData.minSelection ? ` (min: ${currentStepData.minSelection})` : '');
    }
    
    return 'Sélectionnez vos préférences';
  };

  const getElementStatus = (element: Element) => {
    if (isCompositionBaseStep) {
      const isExcluded = excludedElements.includes(element.id);
      return {
        text: isExcluded ? 'Retiré' : 'Inclus',
        className: isExcluded ? 'element-excluded' : 'element-included'
      };
    } else {
      const isSelected = selectedElements.some(
        item => item.stepType === currentStepData.type && item.element.id === element.id
      );
      return {
        text: element.prix && element.prix > 0 ? `+${element.prix}€` : 'Gratuit',
        className: isSelected ? 'element-selected' : 'element-available'
      };
    }
  };

  // Vérifier si on est en mode édition
  const isEditMode = initialSelectedElements.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="step-by-step-customizer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="customizer-header">
          <div className="product-info">
            <CachedImage
              src={product.image}
              alt={product.nom}
              className="product-image"
              fallbackSrc="/placeholder-product.png"
            />
            <div className="product-text">
             
              {isEditMode && (
                <div className="edit-mode-badge">Mode édition</div>
              )}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Barre de progression */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <div className="step-indicator">
            Étape {currentStep + 1}/{steps.length} • {currentStepData.nom}
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className="step-content">
          
          <div className="elements-grid">
            {currentStepData.elements.map(element => {
              const isSelected = isElementSelected(element);
              // Pour composition: isSelected = true signifie exclu (retiré)
              // Pour autres: isSelected = true signifie sélectionné
              const isExcluded = isCompositionBaseStep && isSelected;
              const isIncluded = isCompositionBaseStep && !isSelected;

              return (
                <div
                  key={element.id}
                  className={`element-card ${
                    isCompositionBaseStep
                      ? (isExcluded ? 'excluded' : 'included')
                      : (isSelected ? 'selected' : '')
                  } ${isCompositionBaseStep ? 'composition-base-card' : 'normal-card'}`}
                  onClick={() => handleElementSelect(element)}
                >
                  <div className="element-image">
                    <CachedImage
                      src={element.image || '/placeholder-food.png'}
                      alt={element.nom}
                      fallbackSrc="/placeholder-food.png"
                    />
                    <div className={`selection-indicator ${
                      isCompositionBaseStep
                        ? (isExcluded ? 'excluded-indicator' : 'included-indicator')
                        : 'normal-indicator'
                    }`}>
                      {isCompositionBaseStep
                        ? (isExcluded ? '✕' : '✓')
                        : (isSelected ? '✓' : '+')
                      }
                    </div>
                  </div>

                  <div className="element-info">
                    <h4>{element.nom}</h4>
                    {!isCompositionBaseStep && element.prix !== undefined && element.prix > 0 && (
                      <div className="element-price">+{element.prix.toFixed(2)}€</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="navigation-footer">
          <div className="current-selection">
            {/* Éléments exclus (uniquement pour composition) */}
            {isCompositionBaseStep && excludedElements.length > 0 && (
              <div className="excluded-items">
                <strong>Ingrédients retirés :</strong>
                {excludedElements.map(excludedId => {
                  const excludedElement = compositionBaseStep?.elements.find(el => el.id === excludedId);
                  return (
                    <span key={excludedId} className="excluded-item-tag">
                      {excludedElement?.nom}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Éléments sélectionnés (pour les autres étapes) */}
            {!isCompositionBaseStep && getSelectedElementsForStep(currentStepData.type).length > 0 && (
              <div className="selected-items">
                <strong>Sélection :</strong>
                {getSelectedElementsForStep(currentStepData.type).map(el => (
                  <span key={el.id} className="selected-item-tag">
                    {el.nom}
                    {el.prix && el.prix > 0 && ` (+${el.prix}€)`}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="navigation-buttons">
            <button 
              className="nav-btn prev-btn"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              ← Précédent
            </button>

            <div className="total-price">
              Total: {calculateTotalPrice().toFixed(2)}€
            </div>

            {currentStep < steps.length - 1 ? (
              <button 
                className="nav-btn next-btn"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Suivant →
              </button>
            ) : (
              <button 
                className="nav-btn confirm-btn"
                onClick={handleAddToCart}
                disabled={!canProceed()}
              >
                {isEditMode ? '✓ Mettre à jour' : '✓ Ajouter au panier'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepByStepCustomizer;
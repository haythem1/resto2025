import React, { useState } from 'react';
import type { Product, SelectedElement } from '../types';
import './ProductCustomizer.css';

interface ProductCustomizerProps {
    product: Product;
    onAddToCart: (product: Product, selectedElements: SelectedElement[]) => void;
    onClose: () => void;
    initialSelectedElements?: SelectedElement[];
}

const ProductCustomizer: React.FC<ProductCustomizerProps> = ({ product, onAddToCart, onClose, initialSelectedElements }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([]);

    // Initialize selectedElements when product or initialSelectedElements changes
    React.useEffect(() => {
        setSelectedElements(initialSelectedElements ?? []);
        setCurrentStepIndex(0);
    }, [product, initialSelectedElements]);

    const steps = product.steps || [];
    const currentStep = steps[currentStepIndex];

    const handleElementToggle = (element: any, stepType: string) => {
        const existingIndex = selectedElements.findIndex(
            sel => sel.element.id === element.id && sel.stepType === stepType
        );

        if (existingIndex >= 0) {
            setSelectedElements(prev => prev.filter((_, i) => i !== existingIndex));
        } else {
            setSelectedElements(prev => [...prev, { element, stepType }]);
        }
    };

    const isElementSelected = (elementId: number, stepType: string) => {
        return selectedElements.some(
            sel => sel.element.id === elementId && sel.stepType === stepType
        );
    };

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onAddToCart(product, selectedElements);
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const calculateTotal = () => {
        const basePrice = product.promo && product.prix_promo ? product.prix_promo : product.prix;
        const supplementsPrice = selectedElements
            .filter(item => item.stepType !== 'composition')
            .reduce((total, item) => total + (item.element.prix || 0), 0);
        return basePrice + supplementsPrice;
    };

    return (
        <div className="customizer-overlay" onClick={onClose}>
            <div className="customizer-modal" onClick={(e) => e.stopPropagation()}>
                <div className="customizer-header">
                    <h2>{product.nom}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="customizer-content">
                    {currentStep && (
                        <>
                            <div className="step-header">
                                <h3>{currentStep.nom}</h3>
                                {currentStep.description && <p>{currentStep.description}</p>}
                                {currentStep.type === 'composition' && (
                                    <p className="composition-hint">Cliquez sur les ingrédients pour les retirer (Sans...)</p>
                                )}
                            </div>

                            <div className="elements-grid">
                                {currentStep.elements.map(element => {
                                    const isSelected = isElementSelected(element.id, currentStep.type);
                                    const isComposition = currentStep.type === 'composition';

                                    return (
                                        <div
                                            key={element.id}
                                            className={`element-card ${isSelected ? 'selected' : ''} ${isComposition ? 'composition' : ''}`}
                                            onClick={() => handleElementToggle(element, currentStep.type)}
                                        >
                                            {element.image && (
                                                <div className="element-image">
                                                    <img src={element.image} alt={element.nom} />
                                                </div>
                                            )}
                                            <div className="element-info">
                                                <h4>
                                                    {isComposition && isSelected ? '❌ Sans ' : ''}
                                                    {element.nom}
                                                </h4>
                                                {!isComposition && element.prix && element.prix > 0 && (
                                                    <span className="element-price">+{element.prix.toFixed(2)} DT</span>
                                                )}
                                                {element.included && !isComposition && <span className="included-badge">Inclus</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                <div className="customizer-footer">
                    <button
                        className="nav-btn prev-btn"
                        onClick={handlePrevious}
                        disabled={currentStepIndex === 0}
                    >
                        ← Précédent
                    </button>
                    <div className="total-price">
                        Total: {calculateTotal().toFixed(2)} DT
                    </div>
                    <button className="nav-btn next-btn" onClick={handleNext}>
                        {currentStepIndex < steps.length - 1 ? 'Suivant →' : 'Ajouter au panier'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCustomizer;

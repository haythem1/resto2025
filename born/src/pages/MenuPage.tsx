import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';
import ProductCustomizer from '../components/ProductCustomizer';
import Cart from '../components/Cart';
import type { Category, Product, CartItem, SelectedElement, SaleMode } from '../types';
import './MenuPage.css';

const MenuPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { menuData, loading, error } = useMenu();
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [showCartModal, setShowCartModal] = useState(false);

    const saleMode = (location.state as { saleMode?: SaleMode })?.saleMode || 'sur_place';

    React.useEffect(() => {
        if (menuData.length > 0 && !selectedCategory) {
            setSelectedCategory(menuData[0]);
        }
    }, [menuData, selectedCategory]);

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
    };

    const handleProductClick = (product: Product) => {
        if (product.steps && product.steps.length > 0) {
            setSelectedProduct(product);
        } else {
            handleAddToCart(product, []);
        }
    };

    const handleAddToCart = (product: Product, selectedElements: SelectedElement[]) => {
        const supplementsPrice = selectedElements
            .filter(item => item.stepType !== 'composition')
            .reduce((total, item) => total + (item.element.prix || 0), 0);

        const basePrice = product.promo && product.prix_promo ? product.prix_promo : product.prix;
        const totalPrice = basePrice + supplementsPrice;

        setCartItems(prev => {
            const existingItemIndex = prev.findIndex(
                item => item.product.id === product.id &&
                    JSON.stringify(item.selectedElements) === JSON.stringify(selectedElements)
            );

            if (existingItemIndex >= 0) {
                const updatedItems = [...prev];
                updatedItems[existingItemIndex].quantity += 1;
                updatedItems[existingItemIndex].totalPrice =
                    updatedItems[existingItemIndex].quantity * totalPrice;
                return updatedItems;
            } else {
                return [...prev, {
                    product,
                    selectedElements,
                    quantity: 1,
                    totalPrice
                }];
            }
        });

        setSelectedProduct(null);
    };

    const handleUpdateQuantity = (index: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems(prev => prev.map((item, i) => {
            if (i === index) {
                const unitPrice = item.totalPrice / item.quantity;
                return { ...item, quantity: newQuantity, totalPrice: unitPrice * newQuantity };
            }
            return item;
        }));
    };

    const handleRemoveItem = (index: number) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const getDisplayProducts = (): Product[] => {
        if (!selectedCategory) return [];

        let products: Product[] = [];

        if (selectedCategory.produits) {
            products = [...selectedCategory.produits];
        }

        if (selectedCategory.items) {
            selectedCategory.items.forEach(subCat => {
                if (subCat.produits) {
                    products = [...products, ...subCat.produits];
                }
            });
        }

        return products;
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    if (loading) {
        return <div className="loading">Chargement du menu...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    const displayProducts = getDisplayProducts();

    return (
        <div className="menu-page">
            <CategorySidebar
                categories={menuData}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
            />

            <div className="menu-content">
                {/* Category Banner moved to top */}
                {selectedCategory && (
                    <div className="category-banner" key={selectedCategory.id}>
                        {selectedCategory.image && (
                            <img
                                src={selectedCategory.image}
                                alt={selectedCategory.nom}
                                className="category-banner-image"
                            />
                        )}
                        <div className="category-banner-overlay">
                            <h2>{selectedCategory.nom}</h2>
                            {selectedCategory.promo && (
                                <div className="category-promo-tag">
                                    🎉 Promotions en cours !
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="menu-header">
                    <button className="back-btn" onClick={() => navigate('/sale-mode')}>
                        ← Retour
                    </button>
                    <h1>{selectedCategory ? selectedCategory.nom : 'Sélectionnez une catégorie'}</h1>
                    <div className="sale-mode-badge">
                        {saleMode === 'sur_place' ? '🍽️ Sur Place' : '🥡 À Emporter'}
                    </div>
                </div>

                <div className="products-grid">
                    {displayProducts.length > 0 ? (
                        displayProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => handleProductClick(product)}
                            />
                        ))
                    ) : (
                        <div className="no-products">
                            {selectedCategory ? 'Aucun produit disponible' : 'Sélectionnez une catégorie pour voir les produits'}
                        </div>
                    )}
                </div>

                {/* Floating Cart Button */}
                <button
                    className="floating-cart-btn"
                    onClick={() => setShowCartModal(true)}
                    disabled={cartItems.length === 0}
                >
                    <span className="cart-icon">🛒</span>
                    <span className="cart-info">
                        <span className="cart-count">{totalItems} article(s)</span>
                        <span className="cart-total">{totalPrice.toFixed(2)} DT</span>
                    </span>
                </button>
            </div>

            {/* Cart Modal */}
            {showCartModal && (
                <div className="cart-modal-overlay" onClick={() => setShowCartModal(false)}>
                    <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
                        <Cart
                            items={cartItems}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveItem={handleRemoveItem}
                            saleMode={saleMode}
                        />
                        <button className="close-cart-btn" onClick={() => setShowCartModal(false)}>
                            Continuer mes achats
                        </button>
                    </div>
                </div>
            )}

            {selectedProduct && (
                <ProductCustomizer
                    product={selectedProduct}
                    onAddToCart={handleAddToCart}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

export default MenuPage;

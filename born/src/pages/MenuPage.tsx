import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';
import BottomOrderBar from '../components/BottomOrderBar';
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
    const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
    const [initialSelectedElements, setInitialSelectedElements] = useState<SelectedElement[] | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [showCartModal, setShowCartModal] = useState(false);

    const saleMode = (location.state as { saleMode?: SaleMode })?.saleMode || 'sur_place';

    React.useEffect(() => {
        if (menuData.length > 0 && !selectedCategory) {
            setSelectedCategory(menuData[0]);
        }
    }, [menuData, selectedCategory]);

    // Reset selected subcategory whenever we change the main category
    React.useEffect(() => {
        setSelectedSubCategory(null);
    }, [selectedCategory]);

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
        // If we were editing, clear the editing index & initial selections
        setEditingCartIndex(null);
        setInitialSelectedElements(null);
    };

    const handleEditCartItem = (index: number) => {
        const item = cartItems[index];
        setEditingCartIndex(index);
        setInitialSelectedElements(item.selectedElements || []);
        setSelectedProduct(item.product);
    };

    const handleUpdateCartItem = (index: number, product: Product, selectedElements: SelectedElement[]) => {
        setCartItems(prev => prev.map((it, i) => {
            if (i !== index) return it;

            // Recalculate totalPrice for the current quantity
            const supplementsPrice = selectedElements
                .filter(item => item.stepType !== 'composition')
                .reduce((total, item) => total + (item.element.prix || 0), 0);
            const basePrice = product.promo && product.prix_promo ? product.prix_promo : product.prix;
            const unitPrice = basePrice + supplementsPrice;

            return {
                ...it,
                product,
                selectedElements,
                totalPrice: unitPrice * it.quantity
            };
        }));

        // close customizer
        setSelectedProduct(null);
        setEditingCartIndex(null);
        setInitialSelectedElements(null);
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

    const collectProductsFromCategory = (category: Category | null): Product[] => {
        if (!category) return [];

        let products: Product[] = [];

        if (category.produits) products = [...category.produits];

        if (category.items) {
            for (const sub of category.items) {
                products = [...products, ...collectProductsFromCategory(sub)];
            }
        }

        return products;
    };

    const getDisplayProducts = (): Product[] => {
        if (!selectedCategory) return [];

        // If a subcategory is selected, show only its products (and nested sub-subcategories)
        if (selectedSubCategory) {
            return collectProductsFromCategory(selectedSubCategory);
        }

        // Otherwise show all products from the category and any nested subcategories
        return collectProductsFromCategory(selectedCategory);
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

                {/* Subcategory navigation (when a category has nested items) */}
                {selectedCategory && selectedCategory.items && selectedCategory.items.length > 0 && (
                    <div className="subcategory-bar">
                        <button
                            className={`subcat-btn ${selectedSubCategory ? '' : 'active'}`}
                            onClick={() => setSelectedSubCategory(null)}
                        >
                            Tous
                        </button>
                        {selectedCategory.items.map(sub => (
                            <button
                                key={sub.id}
                                className={`subcat-btn ${selectedSubCategory?.id === sub.id ? 'active' : ''}`}
                                onClick={() => setSelectedSubCategory(sub)}
                            >
                                {sub.nom}
                            </button>
                        ))}
                    </div>
                )}

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

                {/* Floating cart button removed — now using BottomOrderBar */}
            </div>

            {/* Cart Modal */}
            {showCartModal && (
                <div className="cart-modal-overlay" onClick={() => setShowCartModal(false)}>
                    <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
                        <Cart
                            items={cartItems}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveItem={handleRemoveItem}
                            onEditItem={handleEditCartItem}
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
                    onAddToCart={(p, selections) => {
                        if (editingCartIndex !== null) {
                            // Update existing cart item
                            handleUpdateCartItem(editingCartIndex, p, selections);
                        } else {
                            handleAddToCart(p, selections);
                        }
                    }}
                    initialSelectedElements={initialSelectedElements ?? []}
                    onClose={() => {
                        setSelectedProduct(null);
                        setEditingCartIndex(null);
                        setInitialSelectedElements(null);
                    }}
                />
            )}

            <BottomOrderBar totalAmount={totalPrice} onOpenCart={() => setShowCartModal(true)} />
        </div>
    );
};

export default MenuPage;

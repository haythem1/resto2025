import React from 'react';
import type { CartItem, SaleMode } from '../types';
import './Cart.css';

interface CartProps {
    items: CartItem[];
    onUpdateQuantity: (index: number, quantity: number) => void;
    onRemoveItem: (index: number) => void;
    saleMode: SaleMode;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemoveItem, saleMode }) => {
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return (
        <div className="cart">
            <div className="cart-header">
                <h2>🛒 Panier</h2>
                <span className="items-count">{items.length} article(s)</span>
            </div>

            <div className="cart-items">
                {items.length === 0 ? (
                    <div className="empty-cart">
                        <p>Votre panier est vide</p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div key={index} className="cart-item">
                            <div className="item-info">
                                <h4>{item.product.nom}</h4>
                                {item.selectedElements && item.selectedElements.length > 0 && (
                                    <div className="item-options">
                                        {item.selectedElements.map((sel, i) => (
                                            <div key={i} className={`option-item ${sel.stepType === 'composition' ? 'removed' : 'added'}`}>
                                                {sel.stepType === 'composition' ? '❌ Sans ' : '+ '}
                                                {sel.element.nom}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="item-price">{(item.totalPrice / item.quantity).toFixed(2)} DT</p>
                            </div>
                            <div className="item-controls">
                                <button onClick={() => onUpdateQuantity(index, item.quantity - 1)}>−</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(index, item.quantity + 1)}>+</button>
                            </div>
                            <button className="remove-btn" onClick={() => onRemoveItem(index)}>
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="cart-footer">
                <div className="total-section">
                    <span>Total</span>
                    <span className="total-amount">{total.toFixed(2)} DT</span>
                </div>
                <button
                    className="checkout-btn"
                    disabled={items.length === 0}
                >
                    Commander
                </button>
            </div>
        </div>
    );
};

export default Cart;

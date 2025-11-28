import React from 'react';
import type { CartItem } from '../types';
import './BottomOrderBar.css';

interface BottomOrderBarProps {
    totalAmount: number;
    onOpenCart: () => void;
}

const BottomOrderBar: React.FC<BottomOrderBarProps> = ({ totalAmount, onOpenCart }) => {
    return (
        <div className="bottom-order-bar">
            <div className="language-flags">
                <span className="flag">🇫🇷</span>
                <span className="flag">🇬🇧</span>
            </div>

            <div className="order-button-area">
                <button className="view-order-btn" onClick={onOpenCart}>
                    Voir ma commande
                    <span className="order-total">{totalAmount.toFixed(2)} DT</span>
                </button>
            </div>
        </div>
    );
};

export default BottomOrderBar;

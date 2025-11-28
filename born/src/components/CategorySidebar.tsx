import React from 'react';
import type { Category } from '../types';
import './CategorySidebar.css';

interface CategorySidebarProps {
    categories: Category[];
    selectedCategory: Category | null;
    onSelectCategory: (category: Category) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
    categories,
    selectedCategory,
    onSelectCategory
}) => {
    return (
        <div className="category-sidebar">
            <div className="categories-list">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={`category-btn ${selectedCategory?.id === category.id ? 'active' : ''}`}
                        onClick={() => onSelectCategory(category)}
                    >
                        {category.image && (
                            <img src={category.image} alt={category.nom} className="category-btn-image" />
                        )}
                        <span className="category-name">{category.nom}</span>
                        {category.promo && <span className="category-promo-badge">PROMO</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategorySidebar;

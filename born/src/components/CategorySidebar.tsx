import React, { useRef, useEffect, useMemo } from 'react';
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
    const VISIBLE_COUNT = 6; // kept for consistent viewport height
    const itemHeight = 100; // matches CSS .icon-btn height + gap
    const listRef = useRef<HTMLDivElement | null>(null);

    const overflow = categories.length > VISIBLE_COUNT;

    useEffect(() => {
        // When categories or viewport changes, ensure top is visible
        if (listRef.current && !overflow) {
            // center content vertically when not overflowing
            listRef.current.scrollTop = 0;
        }
    }, [categories, overflow]);
    return (
        <aside className="category-sidebar-kiosk">
            

            <div className="sidebar-viewport" >
                <div ref={listRef} className={`sidebar-list-inner ${overflow ? 'overflow' : 'centered'}`}>
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className={`icon-btn ${selectedCategory?.id === category.id ? 'active' : ''}`}
                            onClick={() => onSelectCategory(category)}
                            title={category.nom}
                        >
                            {category.image ? (
                                <img src={category.image} alt={category.nom} />
                            ) : (
                                <div className="icon-placeholder">🍽️</div>
                            )}
                            <span className="cat-label">{category.nom}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Only show minimal arrow controls when the list overflows */}
            {overflow && (
                <div className="sidebar-arrow-controls">
                    <button
                        className="scroll-small top"
                        onClick={() => listRef.current?.scrollBy({ top: -itemHeight, behavior: 'smooth' })}
                        aria-label="Précédent"
                    >
                        ▲
                    </button>
                    <button
                        className="scroll-small bottom"
                        onClick={() => listRef.current?.scrollBy({ top: itemHeight, behavior: 'smooth' })}
                        aria-label="Suivant"
                    >
                        ▼
                    </button>
                </div>
            )}

            <div className="sidebar-footer">
                <div className="user-icon">👤</div>
            </div>
        </aside>
    );
};

export default CategorySidebar;

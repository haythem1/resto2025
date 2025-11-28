import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SaleMode } from '../types';
import './SaleModeSelection.css';

const SaleModeSelection: React.FC = () => {
    const navigate = useNavigate();

    const handleModeSelection = (mode: SaleMode) => {
        navigate('/menu', { state: { saleMode: mode } });
    };

    return (
        <div className="sale-mode-selection">
            <div className="mode-container">
                <h1>Choisissez votre mode de vente</h1>
                <div className="mode-buttons">
                    <button
                        className="mode-btn sur-place"
                        onClick={() => handleModeSelection('sur_place')}
                    >
                        <div className="mode-icon">🍽️</div>
                        <h2>Sur Place</h2>
                        <p>Consommer au restaurant</p>
                    </button>
                    <button
                        className="mode-btn emporter"
                        onClick={() => handleModeSelection('emporter')}
                    >
                        <div className="mode-icon">🥡</div>
                        <h2>À Emporter</h2>
                        <p>Commander pour emporter</p>
                    </button>
                </div>
                <button className="back-btn" onClick={() => navigate('/')}>
                    ← Retour
                </button>
            </div>
        </div>
    );
};

export default SaleModeSelection;

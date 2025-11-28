import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SaleModeSelection from './pages/SaleModeSelection';
import MenuPage from './pages/MenuPage';
import './App.css';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/sale-mode" element={<SaleModeSelection />} />
                <Route path="/menu" element={<MenuPage />} />
            </Routes>
        </Router>
    );
};

export default App;

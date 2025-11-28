import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Images de publicité (vous pouvez les remplacer par vos propres images)
    const ads = [
        { id: 1, title: 'Promotion 1', image: '/ads/ad1.jpg', color: '#FF6B6B' },
        { id: 2, title: 'Promotion 2', image: '/ads/ad2.jpg', color: '#4ECDC4' },
        { id: 3, title: 'Promotion 3', image: '/ads/ad3.jpg', color: '#FFE66D' }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % ads.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [ads.length]);

    const handleClick = () => {
        navigate('/sale-mode');
    };

    return (
        <div className="homepage" onClick={handleClick}>
            <div className="carousel">
                {ads.map((ad, index) => (
                    <div
                        key={ad.id}
                        className={`slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundColor: ad.color }}
                    >
                        <div className="slide-content">
                            <h1>{ad.title}</h1>
                            <p>Touchez l'écran pour commander</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="carousel-indicators">
                {ads.map((_, index) => (
                    <div
                        key={index}
                        className={`indicator ${index === currentSlide ? 'active' : ''}`}
                    />
                ))}
            </div>
            <div className="tap-message">
                <p>👆 Touchez l'écran pour commencer</p>
            </div>
        </div>
    );
};

export default HomePage;

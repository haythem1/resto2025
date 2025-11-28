import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Category } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useMenu = () => {
    const [menuData, setMenuData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/menu-complet`);
                setMenuData(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching menu:', err);
                setError('Impossible de charger le menu');
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, []);

    return { menuData, loading, error };
};

import { useState, useEffect } from 'react';
import type { Categorie } from '../types';
import { menuApi } from '../services/menuApi';
import { preloadImages } from '../utils/imageCache';

// Extraire toutes les URLs d'images du menu
const extractAllImageUrls = (categories: Categorie[]): string[] => {
  const urls: string[] = [];

  const processCategory = (cat: Categorie) => {
    if (cat.image) urls.push(cat.image);

    // Images des produits
    cat.produits?.forEach(product => {
      if (product.image) urls.push(product.image);
      // Images des éléments dans les steps
      product.steps?.forEach(step => {
        step.elements?.forEach(element => {
          if (element.image) urls.push(element.image);
        });
      });
    });

    // Sous-catégories
    cat.items?.forEach(processCategory);
  };

  categories.forEach(processCategory);
  return urls;
};

export const useMenu = () => {
  const [menuData, setMenuData] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Chargement du menu depuis l\'API...');
        const data = await menuApi.getMenuComplet();

        console.log('✅ Menu chargé:', data.length, 'catégories');
        setMenuData(data);

        // Précharger toutes les images en cache
        const imageUrls = extractAllImageUrls(data);
        console.log('🖼️ Préchargement de', imageUrls.length, 'images...');
        preloadImages(imageUrls).then(() => {
          console.log('✅ Images préchargées en cache');
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('❌ Erreur lors du chargement du menu:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const reloadMenu = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await menuApi.getMenuComplet();
      setMenuData(data);

      console.log('🔄 Menu rechargé');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur lors du rechargement du menu:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    menuData,
    loading,
    error,
    reloadMenu
  };
};

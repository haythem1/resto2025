import type { Categorie } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const menuApi = {
  /**
   * Récupère le menu complet depuis l'API
   */
  getMenuComplet: async (): Promise<Categorie[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-complet`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement du menu:', error);
      throw error;
    }
  }
};

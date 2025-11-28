// Utilitaire pour le cache d'images avec localStorage

const CACHE_PREFIX = 'img_cache_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 heures

interface CachedImageData {
  data: string; // base64
  timestamp: number;
}

// Générer une clé de cache à partir de l'URL
const getCacheKey = (url: string): string => {
  // Créer un hash simple de l'URL pour éviter les clés trop longues
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return CACHE_PREFIX + Math.abs(hash).toString(36);
};

// Convertir un blob en base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Récupérer une image du cache localStorage
export const getCachedImage = async (url: string): Promise<string | null> => {
  try {
    const key = getCacheKey(url);
    const cached = localStorage.getItem(key);

    if (cached) {
      const data: CachedImageData = JSON.parse(cached);

      // Vérifier si le cache a expiré
      if (Date.now() - data.timestamp < CACHE_EXPIRY_MS) {
        return data.data; // Retourner le base64 directement
      } else {
        // Cache expiré, supprimer
        localStorage.removeItem(key);
      }
    }
    return null;
  } catch {
    return null;
  }
};

// Sauvegarder une image dans le cache localStorage
export const cacheImage = async (url: string, blob: Blob): Promise<void> => {
  try {
    // Vérifier la taille du blob
    if (blob.size > 500 * 1024) {
      // Ignorer les images > 500KB pour économiser l'espace
      return;
    }

    const base64 = await blobToBase64(blob);
    const key = getCacheKey(url);

    const data: CachedImageData = {
      data: base64,
      timestamp: Date.now(),
    };

    // Essayer de sauvegarder, nettoyer si localStorage est plein
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // localStorage plein, nettoyer les anciennes entrées
      cleanupOldCache();
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        // Toujours plein, abandonner
      }
    }
  } catch {
    // Ignorer les erreurs de cache
  }
};

// Supprimer une image du cache
export const deleteCachedImage = async (url: string): Promise<void> => {
  try {
    const key = getCacheKey(url);
    localStorage.removeItem(key);
  } catch {
    // Ignorer les erreurs
  }
};

// Nettoyer les anciennes entrées du cache
const cleanupOldCache = (): void => {
  try {
    const keysToRemove: string[] = [];
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const data: CachedImageData = JSON.parse(cached);
            // Supprimer si expiré ou si on doit libérer de l'espace
            if (now - data.timestamp > CACHE_EXPIRY_MS) {
              keysToRemove.push(key);
            }
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }

    // Supprimer les entrées expirées
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch {
    // Ignorer les erreurs
  }
};

// Vider tout le cache d'images
export const clearImageCache = async (): Promise<void> => {
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch {
    // Ignorer les erreurs
  }
};

// Télécharger et mettre en cache une image
export const fetchAndCacheImage = async (url: string): Promise<string> => {
  // D'abord vérifier le cache
  const cached = await getCachedImage(url);
  if (cached) {
    return cached;
  }

  // Télécharger l'image
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();

    // Sauvegarder dans le cache
    await cacheImage(url, blob);

    // Convertir et retourner le base64
    const base64 = await blobToBase64(blob);
    return base64;
  } catch {
    // En cas d'erreur, retourner l'URL originale
    return url;
  }
};

// Précharger plusieurs images en parallèle
export const preloadImages = async (urls: string[]): Promise<void> => {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  // Limiter le nombre de téléchargements parallèles
  const batchSize = 5;
  for (let i = 0; i < uniqueUrls.length; i += batchSize) {
    const batch = uniqueUrls.slice(i, i + batchSize);
    await Promise.all(batch.map(fetchAndCacheImage));
  }
};

// Obtenir les statistiques du cache
export const getCacheStats = (): { count: number; sizeKB: number } => {
  let count = 0;
  let totalSize = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      count++;
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length * 2; // UTF-16 = 2 bytes per char
      }
    }
  }

  return {
    count,
    sizeKB: Math.round(totalSize / 1024),
  };
};

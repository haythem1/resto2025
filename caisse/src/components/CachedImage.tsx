import React, { useState, useEffect } from 'react';
import { fetchAndCacheImage } from '../utils/imageCache';

interface CachedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onClick?: () => void;
}

const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder-product.png',
  onClick,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadImage = async () => {
      if (!src) {
        setImageSrc(fallbackSrc);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const cachedUrl = await fetchAndCacheImage(src);

        if (isMounted) {
          // Si c'est un blob URL, on le garde pour le révoquer plus tard
          if (cachedUrl.startsWith('blob:')) {
            objectUrl = cachedUrl;
          }
          setImageSrc(cachedUrl);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setImageSrc(fallbackSrc);
          setError(true);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      // Révoquer l'URL de l'objet blob pour libérer la mémoire
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!error) {
      setError(true);
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={handleError}
      style={{
        opacity: loading ? 0.5 : 1,
        transition: 'opacity 0.2s ease-in-out',
      }}
    />
  );
};

export default CachedImage;

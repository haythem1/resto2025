-- Migration pour ajouter le système de promotions
-- Date: 2025-11-28

-- Ajouter les colonnes de promotion à la table categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS promo_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS promo_value DECIMAL(10,2) DEFAULT NULL;

-- Ajouter les colonnes de promotion à la table produits
ALTER TABLE produits 
ADD COLUMN IF NOT EXISTS promo_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS promo_value DECIMAL(10,2) DEFAULT NULL;

-- Commentaires pour documentation
COMMENT ON COLUMN categories.promo_type IS 'Type de promotion: percentage ou fixed_price';
COMMENT ON COLUMN categories.promo_value IS 'Valeur de la promotion (pourcentage ou prix fixe)';
COMMENT ON COLUMN produits.promo_type IS 'Type de promotion: percentage ou fixed_price';
COMMENT ON COLUMN produits.promo_value IS 'Valeur de la promotion (pourcentage ou prix fixe)';

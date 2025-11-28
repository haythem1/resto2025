import React, { useState } from 'react';
import { Card, Button, Badge, ButtonGroup, ListGroup, Stack } from 'react-bootstrap';
import type { CartItem } from '../types';
import TablePlanModal from './TablePlanModal';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onClearCart: () => void;
  onEditItem: (item: CartItem) => void;
  selectedTable?: string | number | null;
  onOpenTableSelector?: () => void;
  onOpenCheckout?: () => void;
  selectedSaleMode?: string | null;
  selectedPaymentMode?: string | null;
  onSelectTable?: (tableNumber: number) => void;
  onSelectSaleMode?: (mode: string) => void;
  editingOrderId?: number | null;
  onCancelEdit?: () => void;
}

type SaleMode = 'sur_place' | 'plan_table' | 'a_emporter' | 'livraison';

const saleModes = [
  { value: 'sur_place', label: 'Sur place', icon: '🪑' },
  { value: 'plan_table', label: 'Plan table', icon: '📍' },
  { value: 'a_emporter', label: 'A emporter', icon: '📦' },
  { value: 'livraison', label: 'Livraison', icon: '🚚' },
];

const Cart: React.FC<CartProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onEditItem,
  selectedTable,
  onOpenCheckout,
  onSelectTable,
  onSelectSaleMode,
  editingOrderId,
  onCancelEdit,
}) => {
  const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const [selectedMode, setSelectedMode] = useState<SaleMode>('sur_place');
  const [isTablePlanOpen, setIsTablePlanOpen] = useState(false);

  const handleModeChange = (mode: SaleMode) => {
    setSelectedMode(mode);
    if (mode === 'plan_table') {
      setIsTablePlanOpen(true);
    }
    if (onSelectSaleMode) {
      onSelectSaleMode(mode);
    }
  };

  const canBeEdited = (item: CartItem): boolean => {
    return item.product.steps && item.product.steps.length > 0;
  };

  // Panier vide
  if (cartItems.length === 0) {
    return (
      <div className="h-100 d-flex flex-column">
        {/* Header */}
        <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 d-flex align-items-center gap-2">
            🛒 Panier
            {editingOrderId && <Badge bg="warning" text="dark">#{editingOrderId}</Badge>}
          </h5>
          {editingOrderId && (
            <Button variant="outline-light" size="sm" onClick={onCancelEdit}>
              Annuler
            </Button>
          )}
        </div>

        {/* Contenu vide */}
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted p-4">
          <div style={{ fontSize: '4rem', opacity: 0.3 }}>🛒</div>
          <p className="mt-3 mb-0">Le panier est vide</p>
          <small>Selectionnez des produits pour commencer</small>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-100 d-flex flex-column">
        {/* Header */}
        <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 d-flex align-items-center gap-2">
            🛒 Panier
            <Badge bg="primary" pill>{cartItems.length}</Badge>
            {editingOrderId && <Badge bg="warning" text="dark">Edition #{editingOrderId}</Badge>}
          </h5>
          <Button variant="outline-danger" size="sm" onClick={onClearCart}>
            🗑️ Vider
          </Button>
        </div>

        {/* Mode de vente */}
        <Card className="border-0 border-bottom rounded-0">
          <Card.Body className="py-2 px-3">
            <small className="text-muted fw-semibold d-block mb-2">Mode de vente</small>
            <div className="d-flex flex-wrap gap-1">
              {saleModes.map((mode) => (
                <Button
                  key={mode.value}
                  variant={selectedMode === mode.value ? 'success' : 'outline-secondary'}
                  size="sm"
                  className="flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                  onClick={() => handleModeChange(mode.value as SaleMode)}
                  style={{ minWidth: '45%', fontSize: '0.75rem', padding: '0.4rem 0.5rem' }}
                >
                  <span>{mode.icon}</span>
                  <span className="d-none d-xl-inline">{mode.label}</span>
                </Button>
              ))}
            </div>
            {selectedTable && selectedMode === 'plan_table' && (
              <Badge bg="success" className="mt-2 w-100 py-2">
                ✓ Table {selectedTable} selectionnee
              </Badge>
            )}
          </Card.Body>
        </Card>

        {/* Liste des articles */}
        <div className="flex-grow-1 overflow-auto p-2" style={{ maxHeight: 'calc(100vh - 350px)' }}>
          <ListGroup variant="flush">
            {cartItems.map((item, index) => (
              <ListGroup.Item
                key={`${item.product.id}-${index}`}
                className="px-2 py-2 border rounded mb-2 bg-light"
              >
                {/* Nom du produit et bouton modifier */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                      {item.product.nom}
                    </h6>
                    {/* Supplements */}
                    <div className="d-flex flex-wrap gap-1">
                      {item.selectedElements
                        .filter(sel => sel.stepType !== 'composition')
                        .map((sel, idx) => (
                          <Badge
                            key={idx}
                            bg={sel.stepType === 'exclusion' ? 'danger' : 'success'}
                            className="fw-normal"
                            style={{ fontSize: '0.65rem' }}
                          >
                            {sel.stepType === 'exclusion' ? '✕ ' : '+ '}
                            {sel.element.nom}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  {canBeEdited(item) && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onEditItem(item)}
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                    >
                      ✎
                    </Button>
                  )}
                </div>

                {/* Controles quantite et prix */}
                <div className="d-flex justify-content-between align-items-center">
                  <ButtonGroup size="sm">
                    <Button
                      variant="outline-secondary"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      style={{ width: '28px', padding: '0.2rem' }}
                    >
                      -
                    </Button>
                    <Button variant="light" disabled style={{ minWidth: '32px', fontWeight: 'bold' }}>
                      {item.quantity}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      style={{ width: '28px', padding: '0.2rem' }}
                    >
                      +
                    </Button>
                  </ButtonGroup>

                  <Stack direction="horizontal" gap={2}>
                    <span className="fw-bold text-success" style={{ fontSize: '0.95rem' }}>
                      {Number(item.totalPrice ?? 0).toFixed(2)} DT
                    </span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onRemoveItem(item.product.id)}
                      style={{ width: '28px', height: '28px', padding: '0' }}
                    >
                      ×
                    </Button>
                  </Stack>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        {/* Footer avec total et validation */}
        <div className="mt-auto bg-dark text-white p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fs-5">Total</span>
            <span className="fs-4 fw-bold text-success">
              {Number(total ?? 0).toFixed(2)} DT
            </span>
          </div>
          {onOpenCheckout && (
            <Button
              variant="success"
              size="lg"
              className="w-100 py-3 fw-bold"
              onClick={onOpenCheckout}
              style={{ fontSize: '1.2rem' }}
            >
              {editingOrderId ? '💾 Enregistrer' : '✓ Valider la commande'}
            </Button>
          )}
        </div>
      </div>

      <TablePlanModal
        isOpen={isTablePlanOpen}
        onClose={() => setIsTablePlanOpen(false)}
        onSelectTable={(tableNum) => {
          if (onSelectTable) {
            onSelectTable(tableNum);
          }
          setIsTablePlanOpen(false);
        }}
        selectedTable={selectedTable}
      />
    </>
  );
};

export default Cart;

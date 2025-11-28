import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Navbar, Nav, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import type { Categorie, Produit, SelectedElement, CartItem } from './types';
import { useMenu } from './hooks/useMenu';
import CategorieList from './components/CategorieList';
import ProductList from './components/ProductList';
import StepByStepCustomizer from './components/StepByStepCustomizer';
import Cart from './components/Cart';
import TableSelector from './components/TableSelector';
import CheckoutModal from './components/CheckoutModal';
import OrderList from './components/OrderList';
import CaissierLogin from './components/CaissierLogin';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CAISSIER_STORAGE_KEY = 'caissier_connected';

interface CaissierInfo {
  id: number;
  nom: string;
  prenom: string;
}

// Fonction pour récupérer le caissier du localStorage
const getStoredCaissier = (): CaissierInfo | null => {
  try {
    const stored = localStorage.getItem(CAISSIER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erreur lecture localStorage:', e);
  }
  return null;
};

// Fonction pour stocker le caissier dans localStorage
const storeCaissier = (caissier: CaissierInfo | null) => {
  try {
    if (caissier) {
      localStorage.setItem(CAISSIER_STORAGE_KEY, JSON.stringify(caissier));
    } else {
      localStorage.removeItem(CAISSIER_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Erreur ecriture localStorage:', e);
  }
};

const App: React.FC = () => {
  const { menuData, loading: menuLoading, error: menuError } = useMenu();
  const [caissier, setCaissier] = useState<CaissierInfo | null>(getStoredCaissier);

  // Synchroniser le caissier avec localStorage
  useEffect(() => {
    storeCaissier(caissier);
  }, [caissier]);

  const [selectedCategory, setSelectedCategory] = useState<Categorie | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Categorie | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Produit | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCategories, setShowCategories] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string | number | null>(null);
  const [isTableSelectorOpen, setIsTableSelectorOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedSaleMode, setSelectedSaleMode] = useState<string | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string | null>(null);
  const [showOrders, setShowOrders] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);

  const getCategoryId = (product: Produit): number | undefined => {
    if (product.category_id) return product.category_id;
    if (selectedSubCategory?.id) return selectedSubCategory.id;
    if (selectedCategory?.id) return selectedCategory.id;
    return undefined;
  };

  const handleAddToCart = (product: Produit, selectedElements: SelectedElement[]) => {
    const supplementsPrice = selectedElements
      .filter(item => item.stepType !== 'composition')
      .reduce((total, item) => total + (item.element.prix || 0), 0);

    const totalPrice = (product.prix + supplementsPrice);
    const categoryId = getCategoryId(product);

    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(
        item => item.product.id === product.id &&
        JSON.stringify(item.selectedElements) === JSON.stringify(selectedElements)
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prev];
        updatedItems[existingItemIndex].quantity += 1;
        updatedItems[existingItemIndex].totalPrice =
          updatedItems[existingItemIndex].quantity * totalPrice;
        return updatedItems;
      } else {
        return [...prev, {
          product,
          selectedElements,
          quantity: 1,
          totalPrice,
          categoryId
        }];
      }
    });
  };

  const handleEditCartItem = (item: CartItem) => {
    setEditingCartItem(item);
  };

  const handleUpdateCartItem = (product: Produit, selectedElements: SelectedElement[]) => {
    if (editingCartItem) {
      const supplementsPrice = selectedElements
        .filter(item => item.stepType !== 'composition')
        .reduce((total, item) => total + (item.element.prix || 0), 0);

      const unitPrice = product.prix + supplementsPrice;
      const totalPrice = unitPrice * editingCartItem.quantity;

      setCartItems(prev =>
        prev.map(item =>
          item.product.id === editingCartItem.product.id &&
          JSON.stringify(item.selectedElements) === JSON.stringify(editingCartItem.selectedElements)
            ? { ...item, product, selectedElements, totalPrice }
            : item
        )
      );
      setEditingCartItem(null);
    }
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item => {
      if (item.product.id === itemId) {
        const unitPrice = item.totalPrice / item.quantity;
        return { ...item, quantity: newQuantity, totalPrice: unitPrice * newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSelectCategory = (category: Categorie) => {
    setSelectedCategory(category);
    setShowCategories(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setShowCategories(true);
  };

  const handleCloseCustomizer = () => {
    setSelectedProduct(null);
    setEditingCartItem(null);
  };

  const handleOpenCheckout = async () => {
    const saleModeValue = selectedSaleMode ?? 'sur_place';

    if (editingOrderId) {
      const total = cartItems.reduce((s, it) => s + it.totalPrice, 0);
      const paymentState = saleModeValue === 'plan_table' ? 0 : 1;

      const payload = {
        items: cartItems.map(it => ({
          productId: it.product.id,
          category_id: it.categoryId,
          nom: it.product.nom,
          quantity: it.quantity,
          unitPrice: it.totalPrice / it.quantity,
          totalPrice: it.totalPrice,
          selectedElements: it.selectedElements.map(se => ({ nom: se.element.nom, stepType: se.stepType }))
        })),
        total,
        table: selectedTable ?? null,
        saleMode: saleModeValue,
        paymentMode: selectedPaymentMode ?? null,
        paymentState,
        note: '',
        date: new Date().toISOString(),
        idCaissier: caissier?.id ?? null
      };

      try {
        setOrderSubmitting(true);
        setOrderResult(null);
        const res = await fetch(`${API_URL}/orders/${editingOrderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setShowOrders(true);
        setEditingOrderId(null);
        setCartItems([]);
      } catch (err: any) {
        setOrderResult(`Erreur lors de la mise a jour: ${err?.message || err}`);
      } finally {
        setOrderSubmitting(false);
      }
      return;
    }

    if (saleModeValue === 'plan_table') {
      const total = cartItems.reduce((s, it) => s + it.totalPrice, 0);

      const payload = {
        items: cartItems.map(it => ({
          productId: it.product.id,
          category_id: it.categoryId,
          nom: it.product.nom,
          quantity: it.quantity,
          unitPrice: it.totalPrice / it.quantity,
          totalPrice: it.totalPrice,
          selectedElements: it.selectedElements.map(se => ({ nom: se.element.nom, stepType: se.stepType }))
        })),
        total,
        table: selectedTable ?? null,
        saleMode: saleModeValue,
        paymentMode: null,
        paymentState: 0,
        etat: 1,
        note: '',
        date: new Date().toISOString(),
        idCaissier: caissier?.id ?? null
      };

      try {
        setOrderSubmitting(true);
        setOrderResult(null);
        const res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        setCartItems([]);
      } catch (err: any) {
        console.error('Order error', err);
        setOrderResult(`Erreur lors de l'envoi: ${err?.message || err}`);
      } finally {
        setOrderSubmitting(false);
      }
      return;
    }

    setIsCheckoutOpen(true);
  };

  // Si pas de caissier connecte, afficher le login
  if (!caissier) {
    return <CaissierLogin onLogin={(c) => setCaissier(c)} />;
  }

  const handleLogout = () => {
    setCaissier(null);
    setCartItems([]);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setShowCategories(true);
    setShowOrders(false);
  };

  if (menuLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
          <h4 className="text-primary">Chargement du menu...</h4>
          <p className="text-muted">Connexion a l'API en cours</p>
        </div>
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <Alert variant="danger" className="text-center" style={{ maxWidth: '500px' }}>
          <Alert.Heading>Erreur de chargement</Alert.Heading>
          <p>{menuError}</p>
          <hr />
          <p className="mb-0">Verifiez que le serveur backend est demarre sur http://localhost:5000</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="pos-app vh-100 d-flex flex-column">
      {/* Header moderne */}
      <Navbar bg="dark" variant="dark" className="py-2 shadow-sm">
        <Container fluid className="px-3">
          <Navbar.Brand className="d-flex align-items-center fw-bold">
            <span className="me-2" style={{ fontSize: '1.5rem' }}>🍽️</span>
            <span className="d-none d-md-inline">Restaurant POS</span>
            <Badge bg="secondary" className="ms-2 fw-normal" style={{ fontSize: '0.7rem' }}>
              {caissier.prenom} {caissier.nom}
            </Badge>
          </Navbar.Brand>
          <Nav className="ms-auto d-flex flex-row gap-2">
            <Button
              variant={!showOrders ? "outline-light" : "outline-secondary"}
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => {
                setShowOrders(false);
                setShowCategories(true);
                setSelectedCategory(null);
                setSelectedSubCategory(null);
              }}
            >
              <span>🏠</span>
              <span className="d-none d-sm-inline">Accueil</span>
            </Button>
            <Button
              variant={showOrders ? "light" : "outline-light"}
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => setShowOrders(true)}
            >
              <span>📋</span>
              <span className="d-none d-sm-inline">Commandes</span>
            </Button>
            {!showCategories && !showOrders && (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={handleBackToCategories}
                className="d-flex align-items-center gap-1"
              >
                <span>←</span>
                <span className="d-none d-sm-inline">Retour</span>
              </Button>
            )}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleLogout}
              className="d-flex align-items-center gap-1"
            >
              <span>🚪</span>
              <span className="d-none d-sm-inline">Deconnexion</span>
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Contenu principal */}
      <Container fluid className="flex-grow-1 p-0 overflow-hidden">
        <Row className="h-100 g-0 flex-nowrap">
          {/* Panel gauche - Categories/Produits */}
          <Col className="h-100 overflow-auto bg-light p-3" style={{ flex: '1 1 0', minWidth: 0 }}>
            {showOrders ? (
              <div className="h-100">
                <div className="d-flex align-items-center mb-3">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowOrders(false)}
                    className="me-3"
                  >
                    ← Retour
                  </Button>
                  <h4 className="mb-0">Liste des commandes</h4>
                </div>
                <OrderList idCaissier={caissier?.id} onEditOrder={(order) => {
                  const flattenProducts = (categories: any[]): any[] => {
                    const out: any[] = [];
                    for (const c of categories) {
                      if (c.produits && c.produits.length) out.push(...c.produits);
                      if (c.sousCategories && c.sousCategories.length) out.push(...flattenProducts(c.sousCategories));
                    }
                    return out;
                  };
                  const allProducts = flattenProducts(menuData);
                  const cartFromOrder: any[] = (order.items || []).map(it => {
                    const productFromCatalog = allProducts.find(p => ((it.product_id && p?.id === it.product_id) || p?.nom === it.nom));
                    const quantity = it.quantity ?? 1;
                    const unitPrice = (Number(it.unit_price ?? 0) || (Number(it.total_price ?? 0) / quantity)) || 0;
                    const totalPrice = Number(it.total_price ?? unitPrice * quantity);
                    const product = productFromCatalog ? productFromCatalog : { id: it.product_id ?? Math.floor(Math.random() * 1000000), nom: it.nom ?? 'Produit', image: '', prix: unitPrice, promo: false, steps: [] };
                    const selectedElements = (it.selectedElements || []).map(se => ({ element: { id: 0, nom: se.nom, prix: 0 }, stepType: se.step_type ?? '' }));
                    return { product, selectedElements, quantity, totalPrice };
                  });
                  setCartItems(cartFromOrder as any);
                  setSelectedTable(order.table_number ?? null);
                  setSelectedSaleMode(order.sale_mode ?? null);
                  setSelectedPaymentMode(order.payment_mode ?? null);
                  setShowOrders(false);
                  setShowCategories(false);
                  setEditingOrderId(order.id);
                }} />
              </div>
            ) : showCategories ? (
              <CategorieList
                categories={menuData}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />
            ) : selectedCategory ? (
              selectedCategory.items && selectedCategory.items.length > 0 && !selectedSubCategory ? (
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => { setSelectedCategory(null); setShowCategories(true); }}
                      className="me-3"
                    >
                      ← Retour
                    </Button>
                    <h4 className="mb-0">{selectedCategory.nom}</h4>
                    <Badge bg="secondary" className="ms-2">Sous-categories</Badge>
                  </div>
                  <CategorieList
                    categories={selectedCategory.items}
                    selectedCategory={selectedSubCategory}
                    onSelectCategory={(c) => setSelectedSubCategory(c)}
                  />
                </div>
              ) : (
                <ProductList
                  products={(selectedSubCategory ? selectedSubCategory.produits : selectedCategory.produits) || []}
                  onSelectProduct={setSelectedProduct}
                  onAddToCart={handleAddToCart}
                  onBackToCategories={handleBackToCategories}
                  columns={4}
                />
              )
            ) : null}
          </Col>

          {/* Panel droit - Panier */}
          <Col className="h-100 border-start bg-white d-flex flex-column shadow-lg" style={{ flex: '0 0 320px', maxWidth: '320px', minWidth: '280px' }}>
            <Cart
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onEditItem={handleEditCartItem}
              selectedTable={selectedTable}
              onOpenTableSelector={() => setIsTableSelectorOpen(true)}
              onOpenCheckout={handleOpenCheckout}
              selectedSaleMode={selectedSaleMode}
              selectedPaymentMode={selectedPaymentMode}
              onSelectTable={(tableNum) => setSelectedTable(tableNum)}
              onSelectSaleMode={(mode) => setSelectedSaleMode(mode)}
              editingOrderId={editingOrderId}
              onCancelEdit={() => { setEditingOrderId(null); setCartItems([]); }}
            />
          </Col>
        </Row>
      </Container>

      {/* Modals */}
      <TableSelector
        isOpen={isTableSelectorOpen}
        onClose={() => setIsTableSelectorOpen(false)}
        onSelect={(t) => setSelectedTable(t)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={async (paymentMode, note) => {
          setSelectedPaymentMode(paymentMode);
          const total = cartItems.reduce((s, it) => s + it.totalPrice, 0);
          const saleModeValue = selectedSaleMode ?? 'sur_place';
          const paymentState = saleModeValue === 'plan_table' ? 0 : 1;

          const payload = {
            items: cartItems.map(it => ({
              productId: it.product.id,
              category_id: it.categoryId,
              nom: it.product.nom,
              quantity: it.quantity,
              unitPrice: it.totalPrice / it.quantity,
              totalPrice: it.totalPrice,
              selectedElements: it.selectedElements.map(se => ({ nom: se.element.nom, stepType: se.stepType }))
            })),
            total,
            table: selectedTable ?? null,
            saleMode: saleModeValue,
            paymentMode,
            paymentState,
            etat: 1,
            note: note || '',
            date: new Date().toISOString(),
            idCaissier: caissier?.id ?? null
          };

          try {
            setOrderSubmitting(true);
            setOrderResult(null);
            const res = await fetch(editingOrderId ? `${API_URL}/modiforder/${editingOrderId}` : `${API_URL}/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (!res.ok) {
              const text = await res.text();
              throw new Error(text || `HTTP ${res.status}`);
            }
            setCartItems([]);
            setEditingOrderId(null);
          } catch (err: any) {
            console.error('Order error', err);
            setOrderResult(`Erreur lors de l'envoi: ${err?.message || err}`);
          } finally {
            setOrderSubmitting(false);
          }
        }}
      />

      {/* Toast de resultat */}
      {orderResult && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 3000 }}>
          <Alert variant={orderResult.includes('Erreur') ? 'danger' : 'success'} dismissible onClose={() => setOrderResult(null)}>
            {orderResult}
          </Alert>
        </div>
      )}

      {/* Overlay de chargement */}
      {orderSubmitting && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
             style={{ background: 'rgba(0,0,0,0.6)', zIndex: 3500 }}>
          <div className="bg-dark text-white p-4 rounded-3 d-flex align-items-center gap-3">
            <Spinner animation="border" size="sm" />
            <span>Envoi de la commande...</span>
          </div>
        </div>
      )}

      {/* Customizer pour nouveau produit */}
      {selectedProduct && (
        <StepByStepCustomizer
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onClose={handleCloseCustomizer}
        />
      )}

      {/* Customizer pour edition */}
      {editingCartItem && (
        <StepByStepCustomizer
          product={editingCartItem.product}
          onAddToCart={handleUpdateCartItem}
          onClose={handleCloseCustomizer}
          initialSelectedElements={editingCartItem.selectedElements}
        />
      )}
    </div>
  );
};

export default App;

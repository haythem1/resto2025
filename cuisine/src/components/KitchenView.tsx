import React, { useEffect, useState, useCallback } from 'react'
import type { Order } from '../types'
import socket, { subscribeNewOrders, unsubscribeNewOrders } from '../socket'
import OrderCard from './OrderCard'
import CategorySelector from './CategorySelector'

interface KitchenViewProps {
  serverUrl?: string
}

function getApiBase(): string {
  try {
    const stored = localStorage.getItem('kitchenServerUrl')
    if (stored) {
        return `${stored}:5000`
  
    }
    return 'http://localhost:5000'
  } catch {
    return 'http://localhost:5000'
  }
}

export default function KitchenView({ serverUrl }: KitchenViewProps) {
  const API_BASE = serverUrl || getApiBase()
  const [orders, setOrders] = useState<Order[]>([])
    const [freshOrders, setFreshOrders] = useState<Record<number, boolean>>({})
  const [categories, setCategories] = useState<Array<{ id: number; nom: string }>>([])
  const [categoryMapping, setCategoryMapping] = useState<Record<number, { root_id: number; root_nom: string }>>({})
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('kitchenSelectedCategoryIds')
      return raw ? JSON.parse(raw) : []
    } catch (e) { return [] }
  })
  const [showCategoryModal, setShowCategoryModal] = useState(() => {
    try { return !localStorage.getItem('kitchenSelectedCategoryIds') } catch { return true }
  })
  const [showHistory, setShowHistory] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories/racine')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch categories', err)
    }
  }, [])

  const fetchCategoryMapping = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories/mapping-to-root')
      const data = await res.json()
      setCategoryMapping(data)
    } catch (err) {
      console.error('Failed to fetch category mapping', err)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/orders/cuisine`)
      const data = await res.json()
      // Ensure unique orders by id (server may return strict ordering but we dedupe to be safe)
      const seen = new Set<number>()
      const uniq = [] as Order[]
      for (const o of data) {
        const id = Number(o.id)
        if (!Number.isFinite(id)) continue
        if (seen.has(id)) continue
        seen.add(id)
        uniq.push(o)
      }
      setOrders(uniq)
    } catch (err) {
      console.error('Failed to fetch orders', err)
    }
  }, [serverUrl])

  useEffect(() => {
    // init socket connection
    socket.connect()
    fetchOrders()
    fetchCategories()
    fetchCategoryMapping()

    const dedupe = (arr: Order[]) => {
      const seen = new Set<number>()
      const result: Order[] = []
      for (const o of arr) {
        const id = Number(o.id)
        if (!Number.isFinite(id)) continue
        if (seen.has(id)) continue
        seen.add(id)
        result.push(o)
      }
      return result
    }

    const onNewOrder = (newOrder: Order) => {
      setOrders((s) => {
        // If the order is already in the list, replace it and move to front
        const id = Number(newOrder.id)
        if (!Number.isFinite(id)) {
          // If it doesn't carry an id, just prepend
          return [newOrder, ...s]
        }
        const exists = s.some(o => Number(o.id) === id)
        if (exists) {
          return [newOrder, ...s.filter(o => Number(o.id) !== id)]
        }
        // Not present -> add to front
        return [newOrder, ...s]
      })

      // mark as fresh for a few seconds
      const id = Number(newOrder.id)
      if (Number.isFinite(id)) {
        setFreshOrders(prev => ({ ...prev, [id]: true }))
        setTimeout(() => setFreshOrders(prev => { const n = { ...prev }; delete n[id]; return n; }), 4000)
      }
    }

    function ensureStatuses(list: Order[]) {
      // no-op: statuses are computed from items now
    }

    subscribeNewOrders(onNewOrder)

    // ensure statuses for already fetched orders (we call this in fetchOrders)

    return () => {
      unsubscribeNewOrders(onNewOrder)
      socket.disconnect()
    }
  }, [fetchOrders, fetchCategories, fetchCategoryMapping])

  const getOrderCategoryIds = (o: Order): number[] => {
    const catIds = new Set<number>()
    for (const it of o.items) {
      if (it.category_id && Number.isFinite(Number(it.category_id))) {
        const itemCatId = Number(it.category_id)
        // Utiliser le mapping pour obtenir la catégorie racine
        const rootCategory = categoryMapping[itemCatId]
        if (rootCategory && rootCategory.root_id) {
          catIds.add(rootCategory.root_id)
        } else {
          // Fallback: si pas de mapping, utiliser la catégorie directe
          catIds.add(itemCatId)
        }
      }
    }
    return Array.from(catIds)
  }

  // statuses are now derived from items; no persistence needed

  // manual status setter removed; status is derived from items

  const computeOrderStatus = (o: Order): 'pending' | 'in-progress' | 'ready' => {
    if (!o.items || o.items.length === 0) return 'pending'
    const states = o.items.map(it => it.etat_cuisine)
    const allReady = states.length > 0 && states.every(s => s === 2)
    if (allReady) return 'ready'
    const anyInProgress = states.some(s => s === 1)
    if (anyInProgress) return 'in-progress'
    // pending if all are null/undefined/0
    return 'pending'
  }

  const selectedCount = selectedCategoryIds.length === 0 ? categories.length : selectedCategoryIds.length

  const updateItemEtat = async (itemId: number, etat: number) => {
    try {
      console.log(API_BASE)
      const res = await fetch(`${API_BASE}/orders/items/${itemId}/etat`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etat_cuisine: etat })
      })
      if (!res.ok) throw new Error('Failed to update item etat')
      const updatedItem = await res.json()
      
      // Update local order items with new etat
      setOrders(prev => prev.map(o => ({
        ...o,
        items: o.items.map(it => it.id === itemId ? { ...it, etat_cuisine: etat } : it)
      })))
    } catch (err) {
      console.error('Error updating item etat:', err)
      alert('Erreur lors de la mise à jour de l\'état')
    }
  }

  // Ajout de la logique pour ajuster la disposition des commandes
  const getColumnClass = () => {
    if (selectedCategoryIds.length === 1) {
      return 'col-lg-3'; // 4 colonnes
    } else if (selectedCategoryIds.length === 2) {
      return 'col-lg-6'; // 2 colonnes
    }
    return 'col-lg-4'; // Par défaut, 3 colonnes
  };

  return (
    <div className="container-fluid mt-3">
      <div className="row align-items-center justify-content-between mb-4 g-3">
        <div className="col-xs-12 col-md-4">
          <h2 className="m-0">       <span className="badge text-bg-secondary">Connected: <strong>{socket.connected ? '✅' : '❌'}</strong></span>
</h2>
        </div>
        <div className="col-xs-12 col-md-4 d-flex justify-content-center gap-2 flex-wrap">
          <span className="badge text-bg-danger">
            {orders.filter(o => computeOrderStatus(o) === 'pending').length} en attente
          </span>
          <span className="badge text-bg-warning text-dark">
            {orders.filter(o => computeOrderStatus(o) === 'in-progress').length} en cours
          </span>
        </div>
        <div className="col-xs-12 col-md-4 d-flex justify-content-end gap-2 flex-wrap">
          <button className="btn btn-sm btn-outline-light" onClick={fetchOrders}>Rafraîchir</button>
          <button className="btn btn-sm btn-primary" onClick={() => setShowCategoryModal(true)}>Choisir catégories</button>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowHistory(s => !s)}>{showHistory ? 'Voir en cours' : 'Historique'}</button>
        </div>
      </div>

      <div className="row g-3">
        {categories.map((cat) => {
          if (selectedCategoryIds.length > 0 && !selectedCategoryIds.includes(cat.id)) {
            return null;
          }
          const ordersInCat = orders
            .filter(o => showHistory ? computeOrderStatus(o) === 'ready' : computeOrderStatus(o) !== 'ready')
            .filter(o => {
              const orderCatIds = getOrderCategoryIds(o);
              if (selectedCategoryIds.length === 0) return true;
              return orderCatIds.some(id => selectedCategoryIds.includes(id));
            });

          if (ordersInCat.length === 0) {
            return null;
          }

          // Si 1 seule catégorie: 100% (col-12), si 2+ catégories: 50% (col-lg-6)
          const colSize = selectedCategoryIds.length === 1 ? 'col-12' : 'col-lg-6 col-12';

          return (
            <div key={cat.id} className={colSize}>
              <div className="p-3 rounded border border-1 border-opacity-25">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="m-0">{cat.nom}</h5>
                  <span className="badge text-bg-info">{ordersInCat.length}</span>
                </div>
                <div className="row g-3">
                  {ordersInCat.map((o) => {
                    // Filtrer les items dont la catégorie racine correspond à cat.id
                    const itemsForCategory = o.items.filter(it => {
                      if (!it.category_id) return false;
                      const itemCatId = Number(it.category_id);
                      const rootCategory = categoryMapping[itemCatId];
                      if (rootCategory && rootCategory.root_id) {
                        return rootCategory.root_id === cat.id;
                      }
                      // Fallback: si pas de mapping, comparer directement
                      return itemCatId === cat.id;
                    });
                    if (itemsForCategory.length === 0) return null;

                    return (
                      <div key={`${cat.id}-col-${o.id}`} className="col-xs-12">
                        <OrderCard
                          key={`${cat.id}-${o.id}`}
                          order={o}
                          categoryId={cat.id}
                          categoryMapping={categoryMapping}
                          status={computeOrderStatus(o)}
                          onUpdateItemEtat={updateItemEtat}
                          isFresh={!!freshOrders[Number(o.id)]}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCategoryModal && (
        <CategorySelector
          available={categories}
          selected={selectedCategoryIds}
          onClose={() => setShowCategoryModal(false)}
          onSave={(sel) => {
            setSelectedCategoryIds(sel);
            try { localStorage.setItem('kitchenSelectedCategoryIds', JSON.stringify(sel)); } catch {}
            setShowCategoryModal(false);
          }}
        />
      )}
    </div>
  )
}

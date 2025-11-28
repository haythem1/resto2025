import React, { useEffect, useState } from 'react'
import type { Order } from '../types'

type Status = 'pending' | 'in-progress' | 'ready'

function formatTime(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatDateTime(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString([], { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function OrderCard({ order, categoryId, categoryMapping = {}, status = 'pending', onStart, onMarkReady, onUpdateItemEtat, isFresh = false }:
  { order: Order, categoryId?: number, categoryMapping?: Record<number, { root_id: number; root_nom: string }>, status?: Status, onStart?: () => void, onMarkReady?: () => void, onUpdateItemEtat?: (itemId: number, etat: number) => void, isFresh?: boolean }) {
  const [elapsed, setElapsed] = useState<string>('')
  useEffect(() => {
    const compute = () => {
      const now = Date.now()
      const t = new Date(order.createdAt || order.date || '').getTime() || now
      const diff = Math.max(0, now - t)
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setElapsed(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
    }
    compute()
    const iv = setInterval(compute, 1000)
    return () => clearInterval(iv)
  }, [order.createdAt, order.date])

  return (
    <article className={`order-card ${isFresh ? 'fresh' : ''}`}>
      <div className={`card-top ${status}`}></div>
      <header className="d-flex justify-content-between align-items-center">
        <div className="d-flex gap-2 align-items-center">
          {order.table && <span className="badge text-bg-danger">Table: {order.table}</span>}
          <span className="text-secondary">#{order.id}</span>
          {order.saleMode && (
            <span className={`badge ${order.saleMode === 'livraison' ? 'text-bg-warning text-dark' : order.saleMode === 'a_emporter' || order.saleMode === 'emporter' ? 'text-bg-info' : 'text-bg-primary'}`}>
              {order.saleMode === 'a_emporter' || order.saleMode === 'emporter' ? '🛍️ À emporter' : order.saleMode === 'livraison' ? '🏍️ Livraison' : '🍽️ Sur place'}
            </span>
          )}
        </div>
        <div className="text-secondary text-end">
          <div><strong>{elapsed}</strong></div>
          <small>{formatDateTime(order.createdAt || order.date || order.order_date)}</small>
        </div>
      </header>
      <section className="mt-2">
        {order.items
          .filter(it => {
            if (!categoryId) return true;
            const itemCatId = Number(it.category_id);
            const rootCategory = categoryMapping[itemCatId];
            if (rootCategory && rootCategory.root_id) {
              return rootCategory.root_id === categoryId;
            }
            return itemCatId === categoryId;
          })
          .map((it) => (
          <div className={`item ${it.etat_cuisine === 2 ? 'done' : ''}`} key={it.id}>
            <div className="d-flex gap-2 align-items-center">
              <span className="fw-bold">{it.quantity}x</span>
              <span className="fw-semibold">{it.nom}</span>
            </div>
            {it.selectedElements && it.selectedElements.length > 0 && (
              <ul className="selected">
                {it.selectedElements.map((se) => (
                  <li key={se.nom + se.step_type}>{se.nom} <small>({se.step_type})</small></li>
                ))}
              </ul>
            )}
            {(!it.etat_cuisine || it.etat_cuisine !== 2) && (
              <div className="d-flex gap-2 mt-2">
                {(!it.etat_cuisine || it.etat_cuisine === 0) && (
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => onUpdateItemEtat?.(it.id!, 1)}
                    title="Commencer la préparation"
                  >
                    ▶ Commencer
                  </button>
                )}
                {it.etat_cuisine === 1 && (
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => onUpdateItemEtat?.(it.id!, 2)}
                    title="Marquer comme prêt"
                  >
                    ✔ Prêt
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </section>
      <footer className="d-flex justify-content-between align-items-center text-secondary mt-2">
        <div className="note">{order.note}</div>
      </footer>

    </article>
  )
}

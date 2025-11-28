import React, { useEffect, useState, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import QRCode from 'react-qr-code';
import DataTable from 'react-data-table-component';
import type { TableColumn } from 'react-data-table-component';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type OrderItem = {
  id: number;
  order_id?: number;
  product_id?: number;
  nom?: string;
  quantity?: number;
  unit_price?: string;
  total_price?: string;
  selectedElements?: Array<{ nom: string; step_type?: string }>;
};

type Order = {
  id: number;
  total: string | number;
  table_number?: string | null;
  sale_mode?: string | null;
  payment_mode?: string | null;
  paymentState?: number | null;
  etat?: number | null; // 0 = en attente de confirmation, 1 = confirmée
  note?: string | null;
  order_date?: string;
  created_at?: string;
  items?: OrderItem[];
};

interface OrderListProps {
  onEditOrder?: (order: Order) => void;
  idCaissier?: number | null; // ID du caissier connecté pour filtrer les commandes
}

const OrderList: React.FC<OrderListProps> = ({ onEditOrder, idCaissier }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  // removed: paymentModalSaleMode state (we only send paymentMode now)
  const [paymentModalPaymentMode, setPaymentModalPaymentMode] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [markPaidMessage, setMarkPaidMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construire l'URL avec le filtre par caissier si fourni
      const url = idCaissier ? `${API_URL}/orders?idCaissier=${idCaissier}` : `${API_URL}/orders`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [idCaissier]);

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleString(); } catch { return d; }
  };

  const printTicket = (order: Order) => {
    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) return;
    const itemsHtml = (order.items || []).map(it => {
      const sel = (it.selectedElements || []).map(se => `${se.nom}${se.step_type ? ' (' + se.step_type + ')' : ''}`).join(', ');
      return `
      <tr>
        <td style="padding:6px;border-bottom:1px solid #eee">${it.nom}${sel ? '<div style="font-size:12px;color:#555;margin-top:4px">' + sel + '</div>' : ''}<br></td>
        <td style="padding:6px;border-bottom:1px solid #eee;text-align:center">${it.quantity ?? 0}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;text-align:right">${it.total_price ?? '0.00'}€</td>
      </tr>
    `
    }).join('');

    const noteHtml = order.note ? `
      <div style="margin:10px 0;padding:10px;background:#fff3cd;border:1px solid #ffc107;border-radius:4px;color:#856404">
        <strong>📝 Note:</strong> ${order.note}
      </div>
    ` : '';

    const qrValue = `${window.location.origin}/orders/${order.id}`;
    const qrSvg = renderToStaticMarkup(<QRCode value={qrValue} size={120} />);
    const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qrSvg);

    const html = `
      <html>
      <head>
        <title>Ticket #${order.id}</title>
      </head>
      <body style="font-family: Arial, Helvetica, sans-serif; padding:20px; color:#222">
        <h2>Commande #${order.id}</h2>

         <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 8;">
            <div style="text-align: center;">
              <div style="background: #fff; padding: 8px; border-radius: 8px; border: 1px solid #e9ecef; display: inline-block;">
                <img src="${svgDataUri}" width="120" height="120" style="display:block;" alt="QR code" />
              </div>
            </div>
         </div>
        <div>Date: ${formatDate(order.order_date ?? order.created_at)}</div>
        <div>Table: ${order.table_number ?? '—'}</div>
        <div>Vente: ${order.sale_mode ?? '—'}</div>
        <div>Paiement: ${order.payment_mode ?? '—'}</div>
        ${noteHtml}
        <hr />
        <table style="width:100%;border-collapse:collapse">${itemsHtml}</table>
        <hr />
        <div style="text-align:right;font-weight:700">Total: ${order.total}€</div>
        <script>window.onload = function(){ window.print(); setTimeout(()=>window.close(), 500); };</script>
      </body>
      </html>
    `;

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const markPaid = async (orderId: number, paymentMode?: string | null) => {
    try {
        alert(paymentMode)
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentState: 1, // 1 = encaissé
          paymentMode: paymentMode ?? undefined
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchOrders();
      setMarkPaidMessage(`Commande #${orderId} marquée encaissée`);
    } catch (err: any) {
      alert('Impossible de mettre à jour le statut d\'encaissement: ' + (err?.message || err));
    }
  };

  const openMarkPaidModal = (order: Order) => {
    setPaymentModalOrder(order);
    // sale mode is not sent in markPaid anymore
    setPaymentModalPaymentMode(order.payment_mode ?? 'especes');
  };

  // Confirmer une commande (passer etat de 0 à 1 et envoyer vers cuisine)
  const confirmOrder = async (orderId: number) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchOrders();
      setMarkPaidMessage(`Commande #${orderId} confirmée et envoyée en cuisine`);
    } catch (err: any) {
      alert('Erreur lors de la confirmation: ' + (err?.message || err));
    }
  };

  const confirmMarkPaidFromModal = async () => {
    if (!paymentModalOrder) return;
    await markPaid(paymentModalOrder.id, paymentModalPaymentMode);
    setPaymentModalOrder(null);
  };

  React.useEffect(() => {
    if (!markPaidMessage) return;
    const t = setTimeout(() => setMarkPaidMessage(null), 3000);
    return () => clearTimeout(t);
  }, [markPaidMessage]);

  const columns: TableColumn<Order>[] = [
    { id: 1, name: 'ID', selector: row => row.id, sortable: true, width: '80px' },
    { name: 'Total', selector: row => `${row.total}€`, sortable: true, right: true },
    { name: 'Table', selector: row => row.table_number ?? '—', sortable: true },
    { name: 'Vente', selector: row => row.sale_mode ?? '—', sortable: true },
    { name: 'Paiement', selector: row => row.payment_mode ?? '—', sortable: true },
    { name: 'Etat', cell: row => (row.etat === 0) ? '⏳ En attente' : '✅ Confirmée', sortable: true },
    { name: 'Encaissement', cell: row => ((row.paymentState ?? (row as any).payment_state) == 1) ? '✅ Encaissé' : '❌ Non encaissé', sortable: true },
    { name: 'Date', selector: row => formatDate(row.order_date ?? row.created_at), sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            title="Détails"
            aria-label="Détails"
            onClick={() => setSelectedOrder(row)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}
          >
            {/* eye icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            title="Imprimer"
            aria-label="Imprimer"
            onClick={() => printTicket(row)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}
          >
            {/* printer icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9V2h12v7" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="8" y="13" width="8" height="8" rx="1" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Bouton Confirmer pour les commandes en attente (etat=0) */}
          {row.etat === 0 && (
            <button
              title="Confirmer la commande"
              aria-label="Confirmer la commande"
              onClick={() => confirmOrder(row.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}
            >
              {/* checkmark icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="#ffc107" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {(row.paymentState !=1) && (

<div>
          <button
            title="Modifier"
            aria-label="Modifier"
            onClick={() => onEditOrder && onEditOrder(row)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}
          >
            {/* pencil icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 20h9" stroke="#007bff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="#007bff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
            <button
              title="Marquer encaissé"
              aria-label="Marquer encaissé"
              onClick={() => openMarkPaidModal(row)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}
            >
              {/* check / cash icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.1-12.3" stroke="#28a745" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4v6h-6" stroke="#28a745" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="#28a745" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            </div>
          )}

        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    }
  ];

  if (loading) return <div style={{ padding: 16 }}>Chargement des commandes...</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>Erreur: {error}</div>;

  const filteredOrders = orders.filter(o => {
    if (!filterText) return true;
    const ft = filterText.toLowerCase();
    return (
      o.id.toString().includes(ft) ||
      o.total?.toString().toLowerCase().includes(ft) ||
      (o.table_number ?? '').toString().toLowerCase().includes(ft) ||
      (o.sale_mode ?? '').toString().toLowerCase().includes(ft) ||
      (o.payment_mode ?? '').toString().toLowerCase().includes(ft)
    );
  });

  const subHeaderComponent = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Recherche (ID, total, table, vente, paiement)..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e9ecef', minWidth: 260 }}
      />
      <button
        onClick={() => {
          setFilterText('');
          setResetPaginationToggle(!resetPaginationToggle);
        }}
        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e9ecef', cursor: 'pointer' }}
      >
        Effacer
      </button>
    </div>
  );

  return (
    <div className="order-list" style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Liste des commandes</h2>
        <div>
          <button onClick={fetchOrders} style={{ marginRight: 8 }}>Rafraîchir</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <DataTable
          columns={columns}
          data={[...filteredOrders].sort((a,b) => (b.id as number) - (a.id as number))}
          subHeader
          subHeaderComponent={subHeaderComponent}
          paginationResetDefaultPage={resetPaginationToggle} // optionally reset page when clearing
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10]}
          dense
          highlightOnHover
          defaultSortFieldId={1}
          defaultSortAsc={false}
        />
      </div>

      {paymentModalOrder && (
        <div className="order-mark-paid-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
          <div style={{ background: '#fff', padding: 18, borderRadius: 8, width: '90%', maxWidth: 460 }}>
            <h3>Marquer commande #{paymentModalOrder.id} comme encaissée</h3>
            
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>Mode de paiement</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['especes', 'carte', 'ticket_restaurant'].map(pm => (
                  <button
                    key={pm}
                    onClick={() => setPaymentModalPaymentMode(pm)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: paymentModalPaymentMode === pm ? '2px solid #27ae60' : '1px solid #e9ecef',
                      background: paymentModalPaymentMode === pm ? 'linear-gradient(135deg,#f8fff9,#e8f5e8)' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {pm === 'especes' ? 'Espèces' : pm === 'carte' ? 'Carte' : 'Ticket resto'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setPaymentModalOrder(null)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e9ecef' }}>Annuler</button>
              <button onClick={confirmMarkPaidFromModal} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#27ae60', color: 'white' }}>Valider</button>
            </div>
          </div>
        </div>
      )}

      {markPaidMessage && (
        <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 4200 }}>
          <div style={{ background: '#27ae60', color: 'white', padding: '12px 16px', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>{markPaidMessage}</span>
            <button onClick={() => setMarkPaidMessage(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>OK</button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="order-detail-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 8, width: '90%', maxWidth: 700, maxHeight: '90%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Détails commande #{selectedOrder.id}</h3>
              <div>
                <button onClick={() => { printTicket(selectedOrder); }} style={{ marginRight: 8 }}>Imprimer</button>
                <button onClick={() => setSelectedOrder(null)}>Fermer</button>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ textAlign: 'center' }}>
                      <div style={{ background: '#fff', padding: 8, borderRadius: 8, border: '1px solid #e9ecef', display: 'inline-block' }}>
                      <QRCode value={`${window.location.origin}/orders/${selectedOrder.id}`} size={120} />
                    </div>
                    <div style={{ marginTop: 8, color: '#666' }}>
                      <div style={{ fontWeight: 700 }}>Commande #{selectedOrder.id}</div>
                      <div>{selectedOrder.total}€ — {selectedOrder.table_number ? `Table ${selectedOrder.table_number}` : '—'}</div>
                    </div>
                  </div>
                </div>
              <div>Date: {formatDate(selectedOrder.order_date ?? selectedOrder.created_at)}</div>
              <div>Table: {selectedOrder.table_number ?? '—'}</div>
              <div>Vente: {selectedOrder.sale_mode ?? '—'}</div>
              <div>Paiement: {selectedOrder.payment_mode ?? '—'}</div>
              <div>Encaissement:  {(selectedOrder.paymentState) ==1 ? '✅ Encaissé' : '❌ Non encaissé'}</div>
              {selectedOrder.note && (
                <div style={{
                  marginTop: 8,
                  padding: 8,
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: 4,
                  color: '#856404'
                }}>
                  <strong>📝 Note:</strong> {selectedOrder.note}
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <strong>Items</strong>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                  <thead>
                    <tr style={{ textAlign: 'left' }}>
                      <th style={{ padding: 6 }}>Nom</th>
                      <th style={{ padding: 6 }}>Quantité</th>
                      <th style={{ padding: 6 }}>Prix total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map(it => (
                      <Fragment key={it.id}>
                        <tr>
                          <td style={{ padding: 6, borderTop: '1px solid #eee' }}>{it.nom}</td>
                          <td style={{ padding: 6, borderTop: '1px solid #eee' }}>{it.quantity}</td>
                          <td style={{ padding: 6, borderTop: '1px solid #eee' }}>{it.total_price}€</td>
                        </tr>
                        {it.selectedElements && it.selectedElements.length > 0 && (
                          <tr>
                            <td colSpan={3} style={{ padding: 6, color: '#555', fontSize: 13 }}>
                              {it.selectedElements.map((se, idx) => (
                                <span key={idx} style={{ display: 'inline-block', marginRight: 8 }}>{se.nom}{se.step_type ? ` (${se.step_type})` : ''}</span>
                              ))}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;

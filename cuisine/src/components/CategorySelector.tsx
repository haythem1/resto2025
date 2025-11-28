import React from 'react'

interface Category {
  id: number
  nom: string
}

export default function CategorySelector({
  available = [],
  selected = [],
  onClose,
  onSave,
}: {
  available?: Category[]
  selected?: number[]
  onClose: () => void
  onSave: (sel: number[]) => void
}) {
  const [sel, setSel] = React.useState<Record<number, boolean>>(() => {
    const map: Record<number, boolean> = {}
    for (const c of available) {
      map[c.id] = selected.includes(c.id)
    }
    return map
  })

  const toggle = (id: number) => setSel(prev => ({ ...prev, [id]: !prev[id] }))

  const save = () => {
    const selectedIds = Object.keys(sel)
      .map(Number)
      .filter(k => sel[k])
    
    if (selectedIds.length === 0) {
      alert('Veuillez sélectionner au moins une catégorie')
      return
    }
    
    onSave(selectedIds)
  }

  return (
    <div className="category-modal-overlay">
      <div className="category-modal">
        <h3 className="mb-3">Sélectionner les catégories à afficher</h3>
        <div className="d-flex flex-column gap-2">
          {available.map(c => (
            <label key={c.id} className="d-flex align-items-center gap-2">
              <input type="checkbox" checked={!!sel[c.id]} onChange={() => toggle(c.id)} />
              <span className="fw-semibold">{c.nom}</span>
            </label>
          ))}
        </div>
        <div className="d-flex gap-2 mt-3 justify-content-end">
          <button onClick={onClose} className="btn btn-outline-secondary">Annuler</button>
          <button onClick={save} className="btn btn-primary">Confirmer</button>
        </div>
      </div>
    </div>
  )
}

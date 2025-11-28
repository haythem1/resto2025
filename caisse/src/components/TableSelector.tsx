import React from 'react';

interface TableSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (table: string | number) => void;
}

const defaultTables: (string | number)[] = [
  'À emporter',
  1,2,3,4,5,6,7,8,9,10,11,12
];

const TableSelector: React.FC<TableSelectorProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="table-selector-overlay">
      <div className="table-selector-modal">
        <h3>Choisir une table</h3>
        <div className="table-list">
          {defaultTables.map((t, idx) => (
            <button
              key={idx}
              className="table-btn"
              onClick={() => {
                onSelect(t);
                onClose();
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="table-actions">
          <button onClick={onClose} className="cancel-btn">Annuler</button>
        </div>
      </div>

      <style>{`
        .table-selector-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .table-selector-modal {
          background: white;
          padding: 16px;
          border-radius: 8px;
          width: 320px;
          max-width: calc(100% - 32px);
        }
        .table-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .table-btn { padding: 8px 12px; border-radius: 6px; border: 1px solid #ddd; background: #fff; cursor: pointer; }
        .table-btn:hover { background: #f6f6f6; }
        .table-actions { margin-top: 12px; text-align: right; }
        .cancel-btn { background: transparent; border: none; color: #333; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default TableSelector;

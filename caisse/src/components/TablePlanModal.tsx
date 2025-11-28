import React from 'react';

interface TablePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTable: (tableNumber: number) => void;
  selectedTable?: number | string | null;
}

const TablePlanModal: React.FC<TablePlanModalProps> = ({
  isOpen,
  onClose,
  onSelectTable,
  selectedTable
}) => {
  if (!isOpen) return null;

  // Génère 30 tables (ou ajustez selon vos besoins)
  const tables = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="table-plan-modal" onClick={(e) => e.stopPropagation()}>
        <div className="table-plan-header">
          <h2>🪑 Plan de Table</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="table-plan-grid">
          {tables.map(tableNum => (
            <button
              key={tableNum}
              className={`table-plan-item ${selectedTable === tableNum ? 'selected' : ''}`}
              onClick={() => {
                onSelectTable(tableNum);
                onClose();
              }}
            >
              <div className="table-icon">🪑</div>
              <div className="table-number">Table {tableNum}</div>
            </button>
          ))}
        </div>

        <style>{`
          .table-plan-modal {
            background: white;
            border-radius: 20px;
            width: 90%;
            max-width: 900px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
            overflow: hidden;
          }

          .table-plan-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white;
            border-bottom: 3px solid #e9ecef;
          }

          .table-plan-header h2 {
            margin: 0;
            font-size: 1.8rem;
            font-weight: 700;
          }

          .table-plan-header .close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.4);
            color: white;
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-weight: 300;
          }

          .table-plan-header .close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.6);
            transform: rotate(90deg);
          }

          .table-plan-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 1rem;
            padding: 2rem;
            overflow-y: auto;
            flex: 1;
            background: #f8f9fa;
          }

          .table-plan-item {
            background: white;
            border: 3px solid #e9ecef;
            border-radius: 16px;
            padding: 1.5rem 1rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            text-align: center;
            position: relative;
          }

          .table-plan-item:hover {
            border-color: #3498db;
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(52, 152, 219, 0.2);
          }

          .table-plan-item.selected {
            border-color: #27ae60;
            background: linear-gradient(135deg, #f8fff9, #e8f5e8);
            box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
          }

          .table-plan-item.selected::after {
            content: '✓';
            position: absolute;
            top: 8px;
            right: 8px;
            background: #27ae60;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1rem;
            box-shadow: 0 2px 8px rgba(39, 174, 96, 0.4);
          }

          .table-icon {
            font-size: 2.5rem;
          }

          .table-number {
            font-weight: 700;
            color: #2c3e50;
            font-size: 1rem;
          }

          .table-plan-grid::-webkit-scrollbar {
            width: 8px;
          }

          .table-plan-grid::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .table-plan-grid::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }

          .table-plan-grid::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }

          @media (max-width: 768px) {
            .table-plan-modal {
              width: 95%;
              max-height: 90vh;
            }

            .table-plan-grid {
              grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
              gap: 0.8rem;
              padding: 1.5rem;
            }

            .table-plan-item {
              padding: 1rem 0.8rem;
            }

            .table-icon {
              font-size: 2rem;
            }

            .table-number {
              font-size: 0.9rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TablePlanModal;

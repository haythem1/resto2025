import React from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentModeId: string, note: string) => void;
}

interface ModeOption {
  id: string;
  label: string;
}

const paymentModes: ModeOption[] = [
  { id: 'especes', label: 'Espèces' },
  { id: 'carte', label: 'Carte' },
  { id: 'ticket_restaurant', label: 'Ticket restaurant' }
];

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [paymentMode, setPaymentMode] = React.useState<ModeOption | null>(null);
  const [note, setNote] = React.useState<string>('');
  const [showKeyboard, setShowKeyboard] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!isOpen) {
      setPaymentMode(null);
      setNote('');
      setShowKeyboard(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canConfirm = !!paymentMode;

  const handleKeyClick = (key: string) => {
    setNote(prev => prev + key);
  };

  const handleBackspace = () => {
    setNote(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setNote('');
  };

  const handleSpace = () => {
    setNote(prev => prev + ' ');
  };

  // Définir les rangées du clavier
  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
    ['W', 'X', 'C', 'V', 'B', 'N', ',', '.', '!', '?']
  ];

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        <h3>Finaliser la commande</h3>

        <div className="checkout-section">
          <label><strong>Mode de paiement</strong></label>
          <div className="options-row">
            {paymentModes.map(m => (
              <button
                key={m.id}
                className={`option-btn ${paymentMode?.id === m.id ? 'selected' : ''}`}
                onClick={() => setPaymentMode(m)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="checkout-section">
          <label><strong>Note</strong></label>
          <input
            type="text"
            className="note-input"
            value={note}
            placeholder="Cliquez pour ajouter une note..."
            onClick={() => setShowKeyboard(true)}
            readOnly
          />
        </div>

        {showKeyboard && (
          <div className="virtual-keyboard">
            <div className="keyboard-header">
              <span>Clavier virtuel</span>
              <button className="close-keyboard-btn" onClick={() => setShowKeyboard(false)}>✕</button>
            </div>
            <div className="keyboard-rows">
              {keyboardRows.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                  {row.map(key => (
                    <button
                      key={key}
                      className="keyboard-key"
                      onClick={() => handleKeyClick(key)}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
              <div className="keyboard-row keyboard-bottom-row">
                <button className="keyboard-key keyboard-space" onClick={handleSpace}>
                  ESPACE
                </button>
                <button className="keyboard-key keyboard-backspace" onClick={handleBackspace}>
                  ⌫
                </button>
                <button className="keyboard-key keyboard-clear" onClick={handleClear}>
                  EFFACER
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="checkout-actions">
          <button className="cancel-btn" onClick={onClose}>Annuler</button>
          <button
            className="confirm-btn"
            disabled={!canConfirm}
            onClick={() => {
              if (paymentMode) {
                onConfirm(paymentMode.id, note);
                onClose();
              }
            }}
          >
            Valider
          </button>
        </div>

        <style>{`
          .note-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1rem;
            margin-top: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .note-input:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
          }

          .virtual-keyboard {
            margin-top: 1rem;
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1rem;
            border: 2px solid #e9ecef;
          }

          .keyboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #dee2e6;
          }

          .keyboard-header span {
            font-weight: 600;
            color: #2c3e50;
            font-size: 1.1rem;
          }

          .close-keyboard-btn {
            background: #e74c3c;
            color: white;
            border: none;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.3rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .close-keyboard-btn:hover {
            background: #c0392b;
            transform: scale(1.1);
          }

          .keyboard-rows {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .keyboard-row {
            display: flex;
            justify-content: center;
            gap: 6px;
          }

          .keyboard-key {
            background: white;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #2c3e50;
            min-width: 45px;
            text-align: center;
          }

          .keyboard-key:hover {
            background: #3498db;
            color: white;
            border-color: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
          }

          .keyboard-key:active {
            transform: translateY(0);
          }

          .keyboard-bottom-row {
            margin-top: 4px;
          }

          .keyboard-space {
            flex: 2;
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border-color: #2980b9;
          }

          .keyboard-space:hover {
            background: linear-gradient(135deg, #2980b9, #2471a3);
            border-color: #2471a3;
          }

          .keyboard-backspace {
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            border-color: #e67e22;
            font-size: 1.3rem;
            flex: 1;
          }

          .keyboard-backspace:hover {
            background: linear-gradient(135deg, #e67e22, #d35400);
            border-color: #d35400;
          }

          .keyboard-clear {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            border-color: #c0392b;
            flex: 1;
          }

          .keyboard-clear:hover {
            background: linear-gradient(135deg, #c0392b, #a93226);
            border-color: #a93226;
          }

          @media (max-width: 768px) {
            .keyboard-key {
              padding: 10px 12px;
              font-size: 0.9rem;
              min-width: 38px;
            }

            .keyboard-rows {
              gap: 6px;
            }

            .keyboard-row {
              gap: 4px;
            }
          }

          @media (max-width: 600px) {
            .virtual-keyboard {
              padding: 0.8rem;
            }

            .keyboard-key {
              padding: 8px 10px;
              font-size: 0.85rem;
              min-width: 32px;
            }

            .keyboard-rows {
              gap: 5px;
            }

            .keyboard-row {
              gap: 3px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CheckoutModal;

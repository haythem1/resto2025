import React, { useState } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface CaissierLoginProps {
  onLogin: (caissier: { id: number; nom: string; prenom: string }) => void;
}

const CaissierLogin: React.FC<CaissierLoginProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 10) {
      setPin(prev => prev + num);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const handleLogin = async () => {
    if (pin.length < 4) {
      setError('Le code PIN doit contenir au moins 4 chiffres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/caissiers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      if (data.success && data.caissier) {
        onLogin(data.caissier);
      }
    } catch (err: any) {
      setError(err.message || 'Code PIN invalide');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const renderPinDisplay = () => {
    const dots = [];
    for (let i = 0; i < 10; i++) {
      dots.push(
        <span
          key={i}
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: i < pin.length ? '#198754' : '#dee2e6',
            margin: '0 4px',
            transition: 'all 0.2s ease',
          }}
        />
      );
    }
    return dots;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <Container style={{ maxWidth: 400 }}>
        <Card className="shadow-lg border-0" style={{ borderRadius: 16, overflow: 'hidden' }}>
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #212529, #343a40)',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍽️</div>
            <h4 className="text-white mb-1">Restaurant POS</h4>
            <p className="text-white-50 mb-0" style={{ fontSize: '0.9rem' }}>
              Entrez votre code PIN pour vous connecter
            </p>
          </div>

          <Card.Body className="p-4">
            {error && (
              <Alert variant="danger" className="mb-3 text-center py-2">
                {error}
              </Alert>
            )}

            {/* PIN Display */}
            <div
              className="d-flex justify-content-center align-items-center mb-4 p-3"
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: 12,
                minHeight: 50,
              }}
            >
              {renderPinDisplay()}
            </div>

            {/* Numeric Keypad */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="outline-dark"
                  onClick={() => handleNumberClick(num.toString())}
                  disabled={loading}
                  style={{
                    height: 60,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    borderRadius: 12,
                    border: '2px solid #dee2e6',
                  }}
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="outline-danger"
                onClick={handleClear}
                disabled={loading}
                style={{
                  height: 60,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 12,
                  border: '2px solid #dc3545',
                }}
              >
                C
              </Button>
              <Button
                variant="outline-dark"
                onClick={() => handleNumberClick('0')}
                disabled={loading}
                style={{
                  height: 60,
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  borderRadius: 12,
                  border: '2px solid #dee2e6',
                }}
              >
                0
              </Button>
              <Button
                variant="outline-warning"
                onClick={handleBackspace}
                disabled={loading}
                style={{
                  height: 60,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  borderRadius: 12,
                  border: '2px solid #ffc107',
                }}
              >
                ←
              </Button>
            </div>

            {/* Login Button */}
            <Button
              variant="success"
              size="lg"
              className="w-100 mt-4"
              onClick={handleLogin}
              disabled={loading || pin.length < 4}
              style={{
                height: 56,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 12,
              }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Connexion...
                </>
              ) : (
                '✓ Se connecter'
              )}
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default CaissierLogin;

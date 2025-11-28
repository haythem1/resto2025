import React, { useState, useEffect } from 'react'

interface ServerConfigProps {
  onServerUrlChange: (url: string) => void
}

export default function ServerConfig({ onServerUrlChange }: ServerConfigProps) {
  const [serverUrl, setServerUrl] = useState(() => {
    try {
      return localStorage.getItem('kitchenServerUrl') || ''
    } catch {
      return ''
    }
  })
  const [isEditing, setIsEditing] = useState(!serverUrl)
  const [tempUrl, setTempUrl] = useState(serverUrl)

  useEffect(() => {
    if (serverUrl) {
      onServerUrlChange(serverUrl)
    }
  }, [serverUrl, onServerUrlChange])

  const handleSave = () => {
    const url = tempUrl.trim()
    if (!url) {
      alert('Veuillez entrer une adresse IP valide')
      return
    }

    // Ensure URL has protocol
    let finalUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `http://${url}`
    }

    try {
      localStorage.setItem('kitchenServerUrl', finalUrl)
      setServerUrl(finalUrl)
      setIsEditing(false)
      onServerUrlChange(finalUrl)
    } catch (err) {
      console.error('Failed to save server URL:', err)
      alert('Erreur lors de l\'enregistrement')
    }
  }

  const handleEdit = () => {
    setTempUrl(serverUrl)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setTempUrl(serverUrl)
  }

  if (!isEditing && serverUrl) {
    return null
  }

  return (
    <div className="server-config-modal">
      <div className="server-config-overlay" onClick={handleCancel}></div>
      <div className="server-config-panel">
        <h3>Configuration du serveur</h3>
        <p className="text-muted">Entrez l'adresse IP ou le domaine du serveur</p>
        <input
          type="text"
          className="form-control"
          placeholder="Ex: 192.168.1.100:3000 ou localhost:3000"
          value={tempUrl}
          onChange={(e) => setTempUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />
        <div className="button-group">
          {serverUrl && (
            <button className="btn btn-outline-secondary" onClick={handleCancel}>
              Annuler
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSave}>
            Connecter
          </button>
        </div>
        {serverUrl && (
          <button className="btn btn-link text-muted mt-3" onClick={handleEdit}>
            Modifier la configuration
          </button>
        )}
      </div>
    </div>
  )
}

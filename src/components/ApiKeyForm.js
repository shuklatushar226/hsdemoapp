import React, { useState } from 'react';
import '../App.css';

const ApiKeyForm = ({ onApiKeySubmit, loading = false, error = '' }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      return;
    }

    setIsValidating(true);
    
    try {
      await onApiKeySubmit(apiKey.trim());
    } catch (err) {
      console.error('API Key submission error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e) => {
    setApiKey(e.target.value);
  };

  const isSubmitDisabled = !apiKey.trim() || loading || isValidating;

  return (
    <div className="form-container">
      <h2>Enter Your API Key</h2>
      <p className="info-message" style={{ marginBottom: 'var(--spacing-lg)' }}>
        Please provide your Hyperswitch API key to access the 3DS Intelligence Flow.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="apiKey">
            API Key <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            id="apiKey"
            type="password"
            placeholder="Enter your API key..."
            value={apiKey}
            onChange={handleInputChange}
            required
            autoComplete="off"
            spellCheck="false"
            style={{
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: '0.9rem',
              letterSpacing: '0.5px',
              borderRadius: '100px'
            }}
          />
          <small style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.8rem',
            marginTop: 'var(--spacing-xs)',
            display: 'block'
          }}>
            Your API key will be used to authenticate with Hyperswitch services
          </small>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitDisabled}
          style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
        >
          {isValidating || loading ? (
            <>
              <span style={{ marginRight: 'var(--spacing-sm)' }}>⏳</span>
              Validating API Key...
            </>
          ) : (
            <>
              <span style={{ marginRight: 'var(--spacing-sm)' }}>🔑</span>
              Continue with API Key
            </>
          )}
        </button>

        {error && (
          <p className="error-message" style={{ marginTop: 'var(--spacing-md)' }}>
            {error}
          </p>
        )}
      </form>

      <div style={{ 
        marginTop: 'var(--spacing-xl)', 
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--border-color-light)'
      }}>
        <h4 style={{ 
          margin: '0 0 var(--spacing-sm) 0',
          color: 'var(--text-primary)',
          fontSize: '0.9rem'
        }}>
          🔒 Security Notice
        </h4>
        <p style={{ 
          margin: 0,
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.4'
        }}>
          Your API key is transmitted securely and is not stored locally. 
          It's only used for the duration of this session to communicate with Hyperswitch APIs.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyForm;

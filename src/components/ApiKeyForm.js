import React, { useState } from 'react';
import '../App.css';

const ApiKeyForm = ({ onApiKeySubmit, loading = false, error = '' }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [useDefaultKey, setUseDefaultKey] = useState(false);
  
  const defaultApiKey = 'snd_szudrVEofQbPL2qskIyrmNxrQhf2QAyOhKyzZ5PhtUEHowwzAoGW0pdCWGnC5A6l';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const keyToSubmit = useDefaultKey ? defaultApiKey : apiKey.trim();
    
    if (!keyToSubmit) {
      return;
    }

    setIsValidating(true);
    
    try {
      await onApiKeySubmit(keyToSubmit);
    } catch (err) {
      console.error('API Key submission error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleDefaultKeyToggle = (e) => {
    setUseDefaultKey(e.target.checked);
    if (e.target.checked) {
      setApiKey('');
    }
  };

  const isSubmitDisabled = (!apiKey.trim() && !useDefaultKey) || loading || isValidating;

  return (
    <div className="form-container">
      <h2>Enter Your API Key</h2>
      <p className="info-message" style={{ marginBottom: 'var(--spacing-lg)' }}>
        Please provide your Hyperswitch API key to access the 3DS Intelligence Flow.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #4285F4',
            gap: '12px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(66, 133, 244, 0.15)',
            cursor: 'pointer'
          }}
          onClick={() => setUseDefaultKey(!useDefaultKey)}
          >
            <input
              id="useDefaultKey"
              type="checkbox"
              checked={useDefaultKey}
              onChange={handleDefaultKeyToggle}
              style={{ 
                margin: 0,
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#4285F4'
              }}
            />
            <label htmlFor="useDefaultKey" style={{ 
              margin: 0, 
              fontSize: '1.1rem',
              cursor: 'pointer',
              color: '#333333',
              fontWeight: '600',
              flex: 1
            }}>
              Use default API key for testing
            </label>
            
          </div>
          
          {!useDefaultKey && (
            <>
              <label htmlFor="apiKey">
                API Key <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="apiKey"
                type="password"
                placeholder="Enter your API key..."
                value={apiKey}
                onChange={handleInputChange}
                required={!useDefaultKey}
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
            </>
          )}
          
          {useDefaultKey && (
            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color-light)',
              marginTop: 'var(--spacing-sm)'
            }}>
              <p style={{ 
                margin: 0,
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                fontFamily: 'Monaco, Consolas, monospace'
              }}>
                <strong>Default API Key:</strong> {defaultApiKey.substring(0, 20)}...
              </p>
              <small style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.75rem',
                display: 'block',
                marginTop: 'var(--spacing-xs)'
              }}>
                Using the default test API key for demonstration purposes
              </small>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitDisabled}
          style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
        >
          {isValidating || loading ? (
            <>
              Validating API Key...
            </>
          ) : (
            <>
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
          Security Notice
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

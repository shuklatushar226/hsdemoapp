import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Assuming some styles might be shared

const ApiKeyEntryPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useDefaultKey, setUseDefaultKey] = useState(false);
  const navigate = useNavigate();
  
  const defaultApiKey = 'snd_szudrVEofQbPL2qskIyrmNxrQhf2QAyOhKyzZ5PhtUEHowwzAoGW0pdCWGnC5A6l';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const keyToUse = useDefaultKey ? defaultApiKey : apiKey;

    if (!keyToUse) {
      setError('API Key is required.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to fetch routing rules with API key:', keyToUse.substring(0, 20) + '...');
      
      // Try the specific endpoint first
      let response;
      let rules;
      
      try {
        console.log('Trying specific endpoint: /routing/active with 3DS filter...');
        response = await axios.get(
          'https://integ.hyperswitch.io/api/routing/active?transaction_type=three_ds_authentication&limit=100',
          {
            headers: {
              'api-key': keyToUse,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );
        rules = response.data;
        console.log('Specific endpoint response:', response.status, response.statusText);
        console.log('Rules from specific endpoint:', rules);
      } catch (specificError) {
        console.log('Specific endpoint failed, trying general routing endpoint...');
        console.log('Specific endpoint error:', specificError.response?.status, specificError.response?.statusText);
        
        // Fallback to general routing endpoint
        try {
          response = await axios.get(
            'https://integ.hyperswitch.io/api/routing',
            {
              headers: {
                'api-key': keyToUse,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            }
          );
          rules = response.data;
          console.log('General endpoint response:', response.status, response.statusText);
          console.log('Rules from general endpoint:', rules);
        } catch (generalError) {
          console.log('General endpoint also failed');
          console.log('General endpoint error:', generalError.response?.status, generalError.response?.statusText);
          throw generalError; // Re-throw to be caught by outer catch
        }
      }

      // Enhanced debugging for the response
      console.log('Full response object:', response);
      console.log('Response data type:', typeof rules);
      console.log('Response data:', rules);
      
      if (Array.isArray(rules)) {
        console.log('Rules is an array with length:', rules.length);
        if (rules.length > 0) {
          console.log('First rule structure:', rules[0]);
          const ruleIds = rules.map(rule => rule.id || rule.routing_id || rule.rule_id || rule.routing_rule_id || 'N/A (ID missing)');
          console.log('Extracted Rule IDs:', ruleIds);
        }
      } else if (rules && typeof rules === 'object') {
        console.log('Rules is an object, checking for nested arrays...');
        console.log('Object keys:', Object.keys(rules));
        
        // Check if rules are nested in the response
        if (rules.data && Array.isArray(rules.data)) {
          console.log('Found rules in .data property');
          rules = rules.data;
        } else if (rules.records && Array.isArray(rules.records)) {
          console.log('Found rules in .records property');
          rules = rules.records;
        } else if (rules.results && Array.isArray(rules.results)) {
          console.log('Found rules in .results property');
          rules = rules.results;
        }
      }

      if (!rules || (Array.isArray(rules) && rules.length === 0)) {
        console.log('No routing rules found');
        setError('No routing rules found for this API key. This could mean: 1) No rules are configured, 2) API key lacks permissions, or 3) Rules are in a different format than expected. Check browser console for detailed response.');
        setLoading(false);
        return;
      }

      console.log('Successfully found rules, navigating to payment details...');
      // Navigate to the payment details page with API key and rules
      navigate('/payment-details', {
        state: {
          apiKey: keyToUse,
          rules,
        },
      });

    } catch (err) {
      console.error('Error fetching routing rules:', err);
      let errorMessage = 'Failed to fetch routing rules.';
      if (err.response) {
        errorMessage += ` Server responded with ${err.response.status}.`;
        if (err.response.data && err.response.data.message) {
          errorMessage += ` Message: ${err.response.data.message}`;
        } else if (err.response.data && err.response.data.error_message) {
           errorMessage += ` Message: ${err.response.data.error_message}`;
        }
      } else if (err.request) {
        errorMessage += ' No response received from server.';
      } else {
        errorMessage += ` Error: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // const handleDefaultKeyToggle = (e) => {
  //   setUseDefaultKey(e.target.checked);
  //   if (e.target.checked) {
  //     setApiKey('');
  //   }
  // };

  return (
    <div className="form-container">
      <h2>Enter API Key</h2>
      <form onSubmit={handleSubmit}>
        {/* API Key Options */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Choose API Key Option
          </h3>
          
          {/* Custom API Key Option */}
          <div 
            onClick={() => setUseDefaultKey(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px 24px',
              border: `2px solid ${!useDefaultKey ? '#4285F4' : '#E5E7EB'}`,
              borderRadius: '12px',
              marginBottom: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: !useDefaultKey ? 'linear-gradient(135deg, #F0F8FF 0%, #E6F3FF 100%)' : '#ffffff',
              boxShadow: !useDefaultKey ? '0 4px 12px rgba(66, 133, 244, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
              gap: '16px',
              transform: !useDefaultKey ? 'translateY(-2px)' : 'translateY(0)'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: `2px solid ${!useDefaultKey ? '#4285F4' : '#D1D5DB'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: !useDefaultKey ? '#4285F4' : 'transparent',
              flexShrink: 0,
              transition: 'all 0.3s ease'
            }}>
              {!useDefaultKey && (
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'white'
                }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: !useDefaultKey ? '#1E40AF' : '#374151',
                marginBottom: '4px'
              }}>
                Enter Custom API Key
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: !useDefaultKey ? '#3B82F6' : '#6B7280',
                lineHeight: '1.4'
              }}>
                Use your own Hyperswitch API key for production or testing
              </div>
            </div>
          </div>

          {/* Default API Key Option */}
          <div 
            onClick={() => setUseDefaultKey(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px 24px',
              border: `2px solid ${useDefaultKey ? '#10B981' : '#E5E7EB'}`,
              borderRadius: '12px',
              marginBottom: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: useDefaultKey ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' : '#ffffff',
              boxShadow: useDefaultKey ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
              gap: '16px',
              transform: useDefaultKey ? 'translateY(-2px)' : 'translateY(0)'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: `2px solid ${useDefaultKey ? '#10B981' : '#D1D5DB'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: useDefaultKey ? '#10B981' : 'transparent',
              flexShrink: 0,
              transition: 'all 0.3s ease'
            }}>
              {useDefaultKey && (
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'white'
                }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: useDefaultKey ? '#065F46' : '#374151',
                marginBottom: '4px'
              }}>
                Use Default API Key
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: useDefaultKey ? '#059669' : '#6B7280',
                lineHeight: '1.4'
              }}>
                Quick start with our demo API key for testing purposes
              </div>
            </div>
          </div>
        </div>

        {/* Custom API Key Input */}
        {!useDefaultKey && (
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="apiKey" style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              display: 'block'
            }}>
              Enter Your API Key:
            </label>
            <input
              id="apiKey"
              type="text"
              placeholder="snd_ABCDEF123456"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required={!useDefaultKey}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '500',
                background: '#ffffff',
                color: '#374151',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4285F4';
                e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
              }}
            />
          </div>
        )}

        {/* Default API Key Info */}
        {useDefaultKey && (
          <div style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
            borderRadius: '12px',
            border: '2px solid #10B981',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #10B981, #34D399, #10B981)'
            }}></div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px',
              gap: '8px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              <h4 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: '600',
                color: '#065F46'
              }}>
                Default API Key Active
              </h4>
            </div>
            
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              marginBottom: '12px'
            }}>
              <p style={{ 
                margin: 0,
                fontSize: '0.875rem',
                color: '#065F46',
                fontWeight: '500',
                wordBreak: 'break-all'
              }}>
                <strong>API Key:</strong> {defaultApiKey.substring(0, 30)}...
              </p>
            </div>
            
            <div style={{
              fontSize: '0.875rem',
              color: '#047857',
              lineHeight: '1.5',
              fontWeight: '500'
            }}>
              This demo API key lets you explore all features without setup.
              Switch to "Custom API Key" above to use your own production key.
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || (!useDefaultKey && !apiKey)}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: loading || (!useDefaultKey && !apiKey) ? '#9CA3AF' : '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading || (!useDefaultKey && !apiKey) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: loading || (!useDefaultKey && !apiKey) ? 'none' : '0 4px 12px rgba(66, 133, 244, 0.3)',
            transform: loading || (!useDefaultKey && !apiKey) ? 'none' : 'translateY(0)',
            opacity: loading || (!useDefaultKey && !apiKey) ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading && (useDefaultKey || apiKey)) {
              e.target.style.background = '#3367D6';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(66, 133, 244, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && (useDefaultKey || apiKey)) {
              e.target.style.background = '#4285F4';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.3)';
            }
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
              Fetching Rules...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Continue to Payment Details
            </span>
          )}
        </button>
        
        {error && (
          <div style={{
            marginTop: '20px',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
            border: '2px solid #F87171',
            borderRadius: '12px',
            color: '#DC2626',
            fontSize: '0.875rem',
            fontWeight: '500',
            lineHeight: '1.5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <strong>Error</strong>
            </div>
            {error}
          </div>
        )}
        
        {/* Powered by Hyperswitch */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px', 
          fontSize: '0.875rem',
          color: '#9CA3AF'
        }}>
          powered by <span style={{ fontWeight: '600', color: '#6B7280' }}>hyperswitch</span>
        </div>
      </form>
    </div>
  );
};

export default ApiKeyEntryPage;

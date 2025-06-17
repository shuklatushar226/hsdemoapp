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

  const handleDefaultKeyToggle = (e) => {
    setUseDefaultKey(e.target.checked);
    if (e.target.checked) {
      setApiKey('');
    }
  };

  return (
    <div className="form-container">
      <h2>Enter API Key</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="apiKey">API Key:</label>
          <input
            id="apiKey"
            type="text" // Consider type="password" if it's sensitive and should be masked
            placeholder="Your API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required={!useDefaultKey}
            disabled={useDefaultKey}
          />
        </div>

        {/* Default API Key Option - Below Input */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #f8faff 0%, #e8f4fd 100%)',
          borderRadius: '12px',
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(135deg, #f8faff 0%, #e8f4fd 100%), linear-gradient(135deg, #4285F4, #667eea)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          gap: '12px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 16px rgba(66, 133, 244, 0.1), 0 1px 4px rgba(0, 0, 0, 0.04)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
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
            Default API key
          </label>
        </div>

        {useDefaultKey && (
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%)',
            borderRadius: '10px',
            border: '2px solid #10B981',
            marginBottom: '16px',
            boxShadow: '0 2px 12px rgba(16, 185, 129, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
              borderRadius: '10px 10px 0 0'
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <p style={{ 
                margin: 0,
                fontSize: '0.85rem',
                color: '#065f46',
                fontFamily: 'Monaco, Consolas, monospace',
                fontWeight: '600'
              }}>
                <strong>Default API Key Active:</strong> {defaultApiKey.substring(0, 25)}...
              </p>
            </div>
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <small style={{ 
                color: '#047857', 
                fontSize: '0.75rem',
                display: 'block',
                lineHeight: '1.3',
                fontWeight: '500'
              }}>
               Using the default test API key for quick demonstration. 
                You can uncheck the option above to enter your own API key.
              </small>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Fetching Rules...' : 'Enter Payment Details'}
        </button>
        {error && <p className="error-message" style={{marginTop: '15px'}}>{error}</p>}
        
        {/* Powered by Hyperswitch */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '16px', 
          fontSize: '0.85rem',
          color: '#9CA3AF'
        }}>
          powered by <span style={{ fontWeight: '500', color: '#6B7280' }}>hyperswitch</span>
        </div>
      </form>
    </div>
  );
};

export default ApiKeyEntryPage;

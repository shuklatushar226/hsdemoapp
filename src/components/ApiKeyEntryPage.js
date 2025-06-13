import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Assuming some styles might be shared

const ApiKeyEntryPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!apiKey) {
      setError('API Key is required.');
      setLoading(false);
      return;
    }

    try {
      // Fetch all active routing rules
      const response = await axios.get(
        'https://integ.hyperswitch.io/api/routing/active?transaction_type=three_ds_authentication&limit=100',
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      const rules = response.data;
      // console.log('Fetched routing rules (data only):', JSON.stringify(rules, null, 2)); // Previous log
      console.log('Full response from /routing/active:', response); // Log the entire response object

      if (rules && rules.length > 0) {
        const ruleIds = rules.map(rule => rule.id || rule.routing_id || rule.rule_id || rule.routing_rule_id || 'N/A (ID missing)');
        console.log('Fetched Routing IDs:', ruleIds);
      } else {
        console.log('No routing rules found or rules array is empty.');
      }

      if (!rules || rules.length === 0) {
        setError('No active routing rules found for this API key. Please check your API key or Hyperswitch configuration.');
        setLoading(false);
        return;
      }

      // Navigate to the payment details page with API key and rules
      navigate('/payment-details', {
        state: {
          apiKey,
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

  return (
    <div className="form-container">
      <h2>Step 1: Enter API Key</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="apiKey">API Key:</label>
          <input
            id="apiKey"
            type="text" // Consider type="password" if it's sensitive and should be masked
            placeholder="Your API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Fetching Rules...' : 'Next: Enter Payment Details'}
        </button>
        {error && <p className="error-message" style={{marginTop: '15px'}}>{error}</p>}
      </form>
    </div>
  );
};

export default ApiKeyEntryPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Assuming some styles might be shared

const InitialPaymentForm = () => {
  const [apiKey, setApiKey] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!apiKey || !amount || !currency) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      // Fetch routing ID
      const routingResponse = await axios.get(
        'https://sandbox.hyperswitch.io/api/routing/active?transaction_type=three_ds_authentication&limit=1',
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      // Assuming the routing ID is in response.data[0].id or response.data[0].routing_rule_id
      // This might need adjustment based on the actual API response structure.
      // For now, let's try to find a field that looks like an ID.
      let routingId = null;
      if (routingResponse.data && routingResponse.data.length > 0) {
        const rule = routingResponse.data[0];
        // Common names for IDs in such objects
        routingId = rule.id || rule.routing_id || rule.rule_id || rule.routing_rule_id; 
      }

      if (!routingId) {
        setError('Could not retrieve a valid routing ID. Please check your API key and ensure active rules exist.');
        setLoading(false);
        return;
      }

      // Navigate to the card selection page with the necessary data
      navigate('/select-card', {
        state: {
          apiKey,
          routingId,
          amount: parseInt(amount, 10), // Ensure amount is an integer in smallest currency unit
          currency,
        },
      });

    } catch (err) {
      console.error('Error during initial payment step:', err);
      let errorMessage = 'Failed to process payment details.';
      if (err.response) {
        errorMessage += ` Server responded with ${err.response.status}.`;
        if (err.response.data && err.response.data.message) {
          errorMessage += ` Message: ${err.response.data.message}`;
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
      <h2>Configure 3DS</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="apiKey">API Key:</label>
          <input
            id="apiKey"
            type="text"
            placeholder="Your API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount (in smallest currency unit):</label>
          <input
            id="amount"
            type="number"
            placeholder="e.g., 1050 (for $10.50 USD) or 100 (for ¥100 JPY)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
            step="1"
          />
          <small style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
            Enter amount in cents for USD (100 = $1.00), yen for JPY (100 = ¥100), etc.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="currency">Currency:</label>
          <input
            id="currency"
            type="text"
            placeholder="e.g., USD, EUR, AMD"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            required
            maxLength="3"
          />
        </div>
        {/* Powered by Hyperswitch */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '16px', 
            marginBottom: '8px',
            fontSize: '0.85rem',
            color: '#9CA3AF'
          }}>
            powered by <span style={{ fontWeight: '500', color: '#6B7280' }}>hyperswitch</span>
          </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Next: Select Card'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default InitialPaymentForm;

import React, { useState } from 'react';
import '../App.css';

const cards = [
  { id: 'card1', name: 'Card 1', number: '4242 4242 4242 4242', expiry: '08/2027', cvv: '123', network: 'VISA', issuerName: 'Chase Bank', country: 'Poland' },
  { id: 'card2', name: 'Card 2', number: '4000 4000 4000 4000', expiry: '11/2026', cvv: '456', network: 'VISA', issuerName: 'Bank of America', country: 'India' },
  { id: 'card3', name: 'Card 3', number: '4111 1111 1111 1111', expiry: '03/2028', cvv: '789', network: 'VISA', issuerName: 'Citi Bank', country: 'Germany' },
];

// Mock API response for demonstration
const mockApiResponse = {
  decision: "challenge",
  routing_id: "test-routing-123",
  payment_id: "pay_test_123456",
  status: "requires_customer_action",
  three_ds: {
    authentication_status: "challenge_required",
    challenge_url: "https://example.com/challenge",
    version: "2.1.0"
  },
  connector: {
    name: "stripe",
    merchant_id: "acct_test_123"
  }
};

const mockRequestPayload = {
  routing_id: "test-routing-123",
  payment: { amount: 1000, currency: "USD" },
  payment_method: { card_network: "VISA" },
  issuer: { name: "Chase Bank", country: "Poland" },
  acquirer: { country: "Poland" },
  customer_device: { platform: "web", device_type: "desktop", display_size: "size1920x1080" }
};

// Helper component to display API request and response in a formatted way
const FormattedApiResponse = ({ requestData, responseData }) => {
  if (!responseData && !requestData) return null;

  const newPalette = {
    primary: '#007AFF',
    success: '#34C759',
    textPrimary: '#1D1D1F',
    textSecondary: '#6E6E73',
    borderColor: '#D1D1D6',
    borderColorDivider: '#E5E5EA',
    fontFamilySansSerif: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    bgContent: '#FFFFFF',
    boxShadowSm: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
  };

  const renderSection = (title, data, titleColor = newPalette.primary) => {
    if (!data) return null;

    return (
      <div style={{ marginBottom: '25px', paddingBottom: '10px', borderBottom: `1px solid ${newPalette.borderColorDivider}` }}>
        <h4 style={{ color: titleColor, borderBottom: `2px solid ${titleColor}`, paddingBottom: '8px', marginBottom: '15px', fontSize: '1.2em', fontWeight: '600' }}>
          {title}
        </h4>
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-word', 
          fontSize: '0.9em', 
          lineHeight: '1.5',
          color: newPalette.textSecondary,
          margin: 0,
          fontFamily: 'Monaco, Consolas, monospace'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div style={{ 
      border: `1px solid ${newPalette.borderColor}`,
      padding: '20px', 
      borderRadius: '8px', 
      backgroundColor: newPalette.bgContent,
      marginTop: '15px', 
      fontFamily: newPalette.fontFamilySansSerif,
      boxShadow: newPalette.boxShadowSm,
      width: '100%', 
      boxSizing: 'border-box', 
      overflowX: 'hidden' 
    }}>
      {responseData && renderSection("Response Received", responseData, newPalette.primary)}
      {requestData && renderSection("Request Sent", requestData, newPalette.success)}
    </div>
  );
};

const CardSelectionTest = () => {
  const [selectedCardId, setSelectedCardId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isCvvVisible, setIsCvvVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiRequestPayload, setApiRequestPayload] = useState(null);

  React.useEffect(() => {
    if (selectedCardId) {
      const cardToPopulate = cards.find(card => card.id === selectedCardId);
      if (cardToPopulate) {
        setCardNumber(cardToPopulate.number);
        setExpiryDate(cardToPopulate.expiry);
        setCvv(cardToPopulate.cvv);
      }
    } else {
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
    }
  }, [selectedCardId]);

  const handleDropdownChange = (e) => {
    setSelectedCardId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCardId) {
      setError("Please select a card.");
      return;
    }
    
    setLoading(true);
    setError('');
    setApiResponse(null);
    setApiRequestPayload(null);
    
    // Simulate API call delay
    setTimeout(() => {
      setApiRequestPayload(mockRequestPayload);
      setApiResponse(mockApiResponse);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="page-container card-page-container">
      <h2>Enter Card Details & Confirm (Test Layout)</h2>
      <div className="details-summary" style={{ marginBottom: '20px' }}>
        <p><strong>Amount:</strong> 1000</p>
        <p><strong>Currency:</strong> USD</p>
      </div>

      {/* Main Side-by-Side Layout */}
      <div className="card-page-main-layout">
        {/* Left Side - Form Section */}
        <div className="card-page-left-panel">
          {/* Form and Controls Section */}
          <div className="card-entry-layout">
            {/* Card Input Form */}
            <div className="card-form-panel">
              <h3>Payment Details</h3>
              <form onSubmit={handleSubmit} id="payment-form">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number:</label>
                  <input type="text" id="cardNumber" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="---- ---- ---- ----" required />
                </div>
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiration Date (MM/YYYY):</label>
                  <input type="text" id="expiryDate" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} placeholder="MM/YYYY" required />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV:</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type={isCvvVisible ? 'text' : 'password'}
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="---"
                      required
                      style={{ flexGrow: 1, marginRight: '10px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setIsCvvVisible(!isCvvVisible)}
                      className="button-link secondary"
                      style={{ padding: 'var(--spacing-sm) var(--spacing-md)', minWidth: 'auto', lineHeight: '1.2' }}
                    >
                      {isCvvVisible ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            {/* Card Selection Dropdown */}
            <div className="card-selection-panel">
              <h3>Select a Predefined Card:</h3>
              <div className="form-group">
                <select id="cardSelector" value={selectedCardId} onChange={handleDropdownChange} style={{width: '100%', padding: '10px', fontSize: '1em'}} required>
                  <option value="" disabled>-- Select a Card --</option>
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.name} ({card.issuerName}) - Ends in {card.number.slice(-4)}
                    </option>
                  ))}
                </select>
              </div>
              {selectedCardId ? (
                <p style={{fontSize: '0.9em', color: '#555'}}>
                  Selected Card Network: {cards.find(c => c.id === selectedCardId)?.network}<br/>
                  Selected Issuer: {cards.find(c => c.id === selectedCardId)?.issuerName}
                </p>
              ) : (
                <p style={{fontSize: '0.9em', color: '#777'}}>
                  Select a card to see its details.
                </p>
              )}
            </div>
          </div>

          <button type="submit" form="payment-form" disabled={loading || !selectedCardId} style={{ marginTop: '20px', width: '100%' }}>
            {loading ? 'Processing...' : 'Submit Payment (Demo)'}
          </button>
          {error && <p className="error-message" style={{ marginTop: '15px' }}>{error}</p>}

          {/* Navigation Links */}
          <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #E5E5EA', boxSizing: 'border-box'}}>
            <p style={{ color: '#6E6E73', fontSize: '0.9em', fontStyle: 'italic' }}>
              This is a test layout demonstration. The form will show mock API response data when submitted.
            </p>
          </div>
        </div>

        {/* Right Side - API Response Section */}
        <div className="card-page-right-panel">
          {(apiResponse || apiRequestPayload) ? (
            <div className="api-response-container">
              <h3 style={{ color: '#1D1D1F', marginBottom: '15px', fontSize: '1.3em', fontWeight: '600' }}>Transaction Details:</h3>
              <FormattedApiResponse requestData={apiRequestPayload} responseData={apiResponse} />
            </div>
          ) : (
            <div className="api-response-placeholder">
              <h3 style={{ color: '#6E6E73', marginBottom: '15px', fontSize: '1.3em', fontWeight: '600' }}>Transaction Details</h3>
              <p style={{ color: '#8E8E93', fontStyle: 'italic' }}>Submit the form to see the API response here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardSelectionTest;

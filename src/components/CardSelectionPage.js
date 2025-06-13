import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Assuming some styles might be shared

const cards = [
  { id: 'card1', name: 'Card 1', number: '4242 4242 4242 4242', expiry: '08/2027', cvv: '123', network: 'VISA', issuerName: 'Chase Bank', country: 'Poland' },
  { id: 'card2', name: 'Card 2', number: '4000 4000 4000 4000', expiry: '11/2026', cvv: '456', network: 'VISA', issuerName: 'Bank of America', country: 'India' },
  { id: 'card3', name: 'Card 3', number: '4111 1111 1111 1111', expiry: '03/2028', cvv: '789', network: 'VISA', issuerName: 'Citi Bank', country: 'Germany' },
];

const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return 'Mobile';
  if (width < 1024) return 'Tablet';
  return 'Desktop';
  // GamingConsole is hard to detect reliably in a browser environment
};

// Helper component to display API request and response in a formatted way
const FormattedApiResponse = ({ requestData, responseData }) => {
  if (!responseData && !requestData) return null;

  // Using hex values from the new palette defined in index.css
  const newPalette = {
    primary: '#007AFF',
    success: '#34C759',
    textPrimary: '#1D1D1F',
    textSecondary: '#6E6E73',
    borderColor: '#D1D1D6',
    borderColorDivider: '#E5E5EA',
    fontFamilySansSerif: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    bgContent: '#FFFFFF',
    boxShadowSm: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
  };

  const renderSection = (title, data, titleColor = newPalette.primary, isCollapsibleSection = true) => {
    if (!data) return null;

    const CollapsibleEntry = ({ entryKey, entryValue, level, isInitiallyExpanded = false, isCollapsibleEntry = true }) => {
      const [isExpanded, setIsExpanded] = useState(isCollapsibleEntry ? (level === 0 ? true : isInitiallyExpanded) : true);
      const isObjectOrArray = typeof entryValue === 'object' && entryValue !== null;

      const toggleExpansion = () => {
        if (isObjectOrArray && isCollapsibleEntry) {
          setIsExpanded(!isExpanded);
        }
      };
      
      const renderNestedValue = (value, currentLevel) => {
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            return (
              <ul style={{ listStyleType: 'none', paddingLeft: '0', margin: '5px 0 5px 20px' }}>
                {value.map((item, index) => (
                   <li key={index} style={{ borderLeft: `2px solid ${newPalette.primary}`, paddingLeft: '10px', marginBottom: '5px' }}>
                    <CollapsibleEntry entryKey={index} entryValue={item} level={currentLevel + 1} isCollapsibleEntry={isCollapsibleEntry} />
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <div style={{ borderLeft: `2px solid ${newPalette.borderColor}`, paddingLeft: '10px', marginLeft: '0px', marginTop:'5px' }}>
              {Object.entries(value).map(([k, v]) => (
                 <CollapsibleEntry key={k} entryKey={k} entryValue={v} level={currentLevel + 1} isCollapsibleEntry={isCollapsibleEntry} />
              ))}
            </div>
          );
        }
        return <span style={{ color: newPalette.textSecondary, wordBreak: 'break-all', lineHeight: '1.6' }}>{String(value)}</span>;
      };

      const entryStyle = { marginBottom: '10px', paddingLeft: `${level * 15}px` };
      const keyStyle = {
        textTransform: 'capitalize',
        color: level === 0 ? titleColor : newPalette.textPrimary,
        fontWeight: level === 0 ? '700' : '600',
        fontSize: level === 0 ? '1.0em' : '0.95em',
        display: 'inline-block',
        marginRight: '8px',
      };
      const valueContainerStyle = {
        marginLeft: (isObjectOrArray && isCollapsibleEntry) ? '25px' : (isObjectOrArray && !isCollapsibleEntry ? '5px' : '0px'),
        paddingTop: '3px',
      };

      return (
        <div style={entryStyle}>
          <div onClick={toggleExpansion} style={{ cursor: (isObjectOrArray && isCollapsibleEntry) ? 'pointer' : 'default', display: 'flex', alignItems: 'flex-start', padding: '3px 0' }}>
            {isObjectOrArray && isCollapsibleEntry && (
              <span style={{ marginRight: '8px', color: newPalette.primary, fontWeight: 'bold', width: '15px', display: 'inline-block', flexShrink: 0 }}>
                {isExpanded ? '▼' : '►'}
              </span>
            )}
            {isObjectOrArray && !isCollapsibleEntry && (<span style={{ marginRight: '8px', width: '15px', display: 'inline-block', flexShrink: 0 }}>&nbsp;</span>)}
            <strong style={keyStyle}>{String(entryKey).replace(/_/g, ' ')}:</strong>
            {!isObjectOrArray && <span style={{ color: newPalette.textSecondary, wordBreak: 'break-all', lineHeight: '1.6', marginLeft: '5px' }}>{String(entryValue)}</span>}
          </div>
          {isObjectOrArray && isExpanded && (<div style={valueContainerStyle}>{renderNestedValue(entryValue, level)}</div>)}
        </div>
      );
    };

    return (
      <div style={{ marginBottom: '25px', paddingBottom: '10px', borderBottom: `1px solid ${newPalette.borderColorDivider}` }}>
        <h4 style={{ color: titleColor, borderBottom: `2px solid ${titleColor}`, paddingBottom: '8px', marginBottom: '15px', fontSize: '1.2em', fontWeight: '600' }}>
          {title}
        </h4>
        {Object.entries(data).map(([key, value]) => (
           <CollapsibleEntry key={key} entryKey={key} entryValue={value} level={0} isInitiallyExpanded={true} isCollapsibleEntry={isCollapsibleSection}/>
        ))}
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
      {responseData && renderSection("Response Received", responseData, newPalette.primary, true)}
      {requestData && renderSection("Request Sent", requestData, newPalette.success, false)}
    </div>
  );
};


const CardSelectionPage = () => {
  const location = useLocation();
  const { apiKey, routingId, amount, currency } = location.state || {};

  const [selectedCardId, setSelectedCardId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isCvvVisible, setIsCvvVisible] = useState(false); // State for CVV visibility
  const [deviceType, setDeviceType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiRequestPayload, setApiRequestPayload] = useState(null);

  useEffect(() => {
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

  useEffect(() => {
    setDeviceType(getDeviceType());
    const handleResize = () => setDeviceType(getDeviceType());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!location.state || !apiKey || !routingId || amount === undefined || !currency) {
    return (
      <div className="page-container form-container error-container">
        <h2>Error</h2>
        <p>Required payment details are missing or incomplete.</p>
        <Link to="/" className="button-link">Go to API Key Entry</Link>
      </div>
    );
  }

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
    const selectedFullCard = cards.find(card => card.id === selectedCardId);
    if (!selectedFullCard) {
      setError("Invalid card selected. Please try again.");
      setLoading(false);
      return;
    }
    const payload = {
      routing_id: routingId,
      payment: { amount: Number(amount), currency: currency },
      payment_method: { card_network: selectedFullCard.network },
      issuer: { name: selectedFullCard.issuerName, country: selectedFullCard.country || "US" }, // Default to US if not specified
      acquirer: { country: selectedFullCard.country || "US" }, // Default to US if not specified
      customer_device: { platform: "web", device_type: deviceType ? deviceType.toLowerCase() : "", display_size: "size1920x1080" }
    };
    setApiRequestPayload(payload);
    console.log('Executing /routing/three_ds_decision/execute with payload:', JSON.stringify(payload, null, 2));
    try {
      const response = await axios.post('https://integ.hyperswitch.io/api/three_ds_decision/execute', payload, {
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json',
          'api-key': apiKey 
        },
      });
      setApiResponse(response.data);
      console.log('API Response:', JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('API Call Error:', err);
      let errorMessage = 'Failed to execute 3DS decision rule.';
      if (err.response) {
        errorMessage += ` Server responded with ${err.response.status}.`;
        if (err.response.data && (err.response.data.message || err.response.data.error_message)) {
          errorMessage += ` Message: ${err.response.data.message || err.response.data.error_message}`;
        } else if (typeof err.response.data === 'string') {
          errorMessage += ` Details: ${err.response.data}`;
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
    <div className="page-container form-container">
      <h2>Step 3: Enter Card Details & Confirm</h2>
      <div className="details-summary" style={{ marginBottom: '20px' }}>
        <p><strong>Amount:</strong> {amount}</p>
        <p><strong>Currency:</strong> {currency}</p>
      </div>

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
                  className="button-link secondary" // Re-use button style, can be customized
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
        {loading ? 'Processing...' : 'Submit Payment'}
      </button>
      {error && <p className="error-message" style={{ marginTop: '15px' }}>{error}</p>}

      {/* API Response Section - now below the form */}
      {(apiResponse || apiRequestPayload) && (
        // This div uses class .api-response-viewer from App.css for some base styles if needed,
        // but critical layout/theme aspects are controlled by FormattedApiResponse internal styles
        // or overridden here if necessary.
        // The new palette uses --bg-content for background and --border-color for border.
        // Spacing variables like --spacing-lg can be used for padding.
        <div 
          className="api-response-viewer" // Keep class for potential App.css overrides
          style={{ 
            marginTop: '20px', // var(--spacing-xl)
            maxHeight: '350px', 
            overflowY: 'auto', 
            // Styles below will be largely dictated by FormattedApiResponse now,
            // but we can set a container background and border matching the theme.
            // background: '#fdfdfd', // Will be newPalette.bgContent via FormattedApiResponse
            // border: '1px solid #e0e0e0', // Will be newPalette.borderColor via FormattedApiResponse
            // padding: '15px', // var(--spacing-lg) - FormattedApiResponse has its own padding
            // borderRadius: '8px', // var(--border-radius-lg) - FormattedApiResponse has its own
          }}
        >
          <h3 style={{ color: '#1D1D1F', marginBottom: '15px', fontSize: '1.3em', fontWeight: '600' }}>Transaction Details:</h3>
          <FormattedApiResponse requestData={apiRequestPayload} responseData={apiResponse} />
        </div>
      )}

      <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #E5E5EA', boxSizing: 'border-box'}}>
        <Link to="/payment-details" state={{apiKey, rules: location.state?.rules || [] }} className="button-link secondary" style={{marginRight: '10px'}}>Back to Payment Details</Link>
        <Link to="/" className="button-link secondary">Start Over (API Key)</Link>
      </div>
    </div>
  );
};

export default CardSelectionPage;

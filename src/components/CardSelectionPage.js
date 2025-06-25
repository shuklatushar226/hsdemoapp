import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Assuming some styles might be shared
import showIcon from '../images/show.png';
import hideIcon from '../images/hide.png';

const cards = [
  { id: 'card1', name: 'Chase Sapphire Preferred', number: '4242 4242 4242 4242', expiry: '08/2027', cvv: '123', network: 'VISA', issuerName: 'Chase Bank', country: 'Poland' },
  { id: 'card2', name: 'Bank of America Cash Rewards', number: '4000 4000 4000 4000', expiry: '11/2026', cvv: '456', network: 'VISA', issuerName: 'Bank of America', country: 'India' },
  { id: 'card3', name: 'Citi Double Cash Card', number: '4111 1111 1111 1111', expiry: '03/2028', cvv: '789', network: 'VISA', issuerName: 'Citi Bank', country: 'Germany' },
];

const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return 'Mobile';
  if (width < 1024) return 'Tablet';
  return 'Desktop';
  // GamingConsole is hard to detect reliably in a browser environment
};

// Helper function to format amount for display
const formatAmountForDisplay = (amount, currency) => {
  // Zero-decimal currencies (amounts are already in the correct unit)
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'HUF', 'TWD', 'UGX'];
  
  if (zeroDecimalCurrencies.includes(currency?.toUpperCase())) {
    return `${amount} ${currency}`;
  }
  
  // For decimal currencies (USD, EUR, GBP, INR, AUD, CAD, ANG), divide by 100 to get the major unit
  const majorAmount = (amount / 100).toFixed(2);
  
  // Add currency symbols for better display
  switch (currency?.toUpperCase()) {
    case 'USD':
      return `$${majorAmount}`;
    case 'EUR':
      return `€${majorAmount}`;
    case 'GBP':
      return `£${majorAmount}`;
    case 'INR':
      return `₹${majorAmount}`;
    case 'AUD':
      return `A$${majorAmount}`;
    case 'CAD':
      return `C$${majorAmount}`;
    case 'ANG':
      return `ƒ${majorAmount}`;
    case 'JPY':
      return `¥${amount}`;
    default:
      return `${majorAmount} ${currency}`;
  }
};

// Tooltip component for routing rule details
const RoutingRuleTooltip = ({ routingId, rules, displayedRules, apiResponse, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  console.log('RoutingRuleTooltip - routingId:', routingId);
  console.log('RoutingRuleTooltip - rules:', rules);
  console.log('RoutingRuleTooltip - displayedRules:', displayedRules);
  
  // Just display the first rule that is present
  let selectedRule = null;
  
  if (displayedRules && displayedRules.length > 0) {
    selectedRule = displayedRules[0]; // Just take the first rule
  } else if (rules && rules.length > 0) {
    selectedRule = rules[0]; // Fallback to first original rule
  }
  
  console.log('RoutingRuleTooltip - selectedRule:', selectedRule);
  
  // Always show the tooltip container, even if no rule is found (for debugging)
  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => {
        console.log('Mouse entered tooltip area');
        setShowTooltip(true);
      }}
      onMouseLeave={() => {
        console.log('Mouse left tooltip area');
        setShowTooltip(false);
      }}
    >
      {children}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: '300px',
          maxWidth: '400px',
          maxHeight: '80vh',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          marginTop: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '50%',
            width: '12px',
            height: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: 'none',
            borderRight: 'none',
            transform: 'translateX(-50%) rotate(45deg)'
          }}></div>
          
          <div style={{ 
            color: '#4FC3F7', 
            fontWeight: '600', 
            fontSize: '0.9rem',
            marginBottom: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '6px',
            flexShrink: 0
          }}>
            Routing Rule Details
          </div>
          
          <div style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            paddingRight: '4px'
          }}>
            {selectedRule ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {/* Rule Summary in Structured Format */}
                <div style={{ 
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  borderLeft: '4px solid #4FC3F7'
                }}>
                  <div style={{ 
                    color: '#4FC3F7', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Rule Summary
                  </div>
                  
                  <div style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                    fontSize: '0.8rem',
                    lineHeight: '1.6',
                    color: '#E8F5E8'
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: '#FFE082', fontWeight: '600' }}>
                        {selectedRule.id || selectedRule.routing_id || selectedRule.rule_id || selectedRule.decision_engine_routing_id}
                      </span>
                      <span style={{ color: '#B0BEC5', margin: '0 8px' }}>→</span>
                      <span style={{ color: '#81C784', fontWeight: '600' }}>
                        {selectedRule.name || selectedRule.profile_id || selectedRule.algorithm_for || 'Unnamed Rule'}
                      </span>
                    </div>
                    
                    {/* Rule Conditions */}
                    {selectedRule.statements && selectedRule.statements.length > 0 && (
                      <div style={{ color: '#E0E0E0', marginTop: '8px' }}>
                        {selectedRule.statements.map((statement, index) => (
                          <div key={index}>
                            {statement.condition && statement.condition.map((cond, condIndex) => {
                              const lhs = cond.lhs?.replace(/_/g, ' ') || 'unknown_field';
                              const comparison = cond.comparison === 'Equal' ? '=' : cond.comparison;
                              const value = typeof cond.value === 'object' && cond.value?.value 
                                ? cond.value.value 
                                : cond.value;
                              
                              return (
                                <span key={condIndex}>
                                  {condIndex > 0 && <span style={{ color: '#90CAF9' }}> AND </span>}
                                  <span style={{ 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    display: 'inline-block',
                                    margin: '2px'
                                  }}>
                                    <span style={{ color: '#4FC3F7', fontWeight: '600' }}>{lhs}</span>
                                    <span style={{ color: '#B0BEC5', margin: '0 4px' }}>{comparison}</span>
                                    <span style={{ color: '#81C784', fontWeight: '500' }}>{value}</span>
                                  </span>
                                </span>
                              );
                            })}
                            {index < selectedRule.statements.length - 1 && (
                              <div style={{ color: '#FF8A65', margin: '4px 0' }}>OR</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                <div style={{ display: 'grid', gap: '6px' }}>
                  {selectedRule.kind && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#B0BEC5', fontWeight: '500' }}>Rule Type:</span>
                      <span style={{ color: '#90CAF9', fontWeight: '600', textTransform: 'capitalize' }}>
                        {selectedRule.kind}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rule Type/Algorithm */}
                {selectedRule.algorithm && (
                  <div style={{ 
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    borderLeft: '3px solid #90CAF9'
                  }}>
                    <div style={{ color: '#B0BEC5', fontSize: '0.75rem', marginBottom: '4px' }}>
                      Algorithm:
                    </div>
                    <div style={{ color: '#E0E0E0', fontSize: '0.8rem' }}>
                      {selectedRule.algorithm}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div style={{ color: '#FF8A65', fontSize: '0.8rem' }}>
                Debug: No rule found for ID "{routingId}"<br/>
                Available rules: {rules?.length || 0}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component to display API request and response in a clean, organized way
const FormattedApiResponse = ({ requestData, responseData, rules, displayedRules }) => {
  const [activeTab, setActiveTab] = useState('response');

  if (!responseData && !requestData) return null;

  

  const renderKeyValuePairs = (data, title, color) => {
    if (!data) return null;

    const importantFields = {
      decision: 'Decision',
      status: 'Status',
      routing_id: 'Routing ID',
      payment_id: 'Payment ID',
      amount: 'Amount',
      currency: 'Currency',
      card_network: 'Card Network',
      name: 'Issuer Name',
      country: 'Country',
      platform: 'Platform',
      device_type: 'Device Type'
    };

    const renderValue = (key, value) => {
      const isResponse = title === 'API Response';
      
      if (typeof value === 'object' && value !== null) {
        if (key === 'payment' && value.amount && value.currency) {
          // Format the amount for display using the helper function
          const formattedAmount = formatAmountForDisplay(value.amount, value.currency);
          return isResponse ? formattedAmount.toUpperCase() : formattedAmount;
        }
        if (key === 'payment_method' && value.card_network) {
          return isResponse ? value.card_network.toUpperCase() : value.card_network;
        }
        if (key === 'issuer' && value.name) {
          const result = `${value.name}${value.country ? ` (${value.country})` : ''}`;
          return isResponse ? result.toUpperCase() : result;
        }
        if (key === 'acquirer' && value.country) {
          return isResponse ? value.country.toUpperCase() : value.country;
        }
        if (key === 'customer_device') {
          const result = `${value.platform || 'Unknown'} - ${value.device_type || 'Unknown'}`;
          return isResponse ? result.toUpperCase() : result;
        }
        if (key === 'three_ds') {
          const result = value.authentication_status || 'N/A';
          return isResponse ? result.toUpperCase() : result;
        }
        return isResponse ? 'COMPLEX OBJECT' : 'Complex Object';
      }
      // Replace underscores with spaces for decision values
      if (key === 'decision') {
        const result = String(value).replace(/_/g, ' ');
        return isResponse ? result.toUpperCase() : result;
      }
      const result = String(value);
      return isResponse ? result.toUpperCase() : result;
    };

    const getDisplayKey = (key) => importantFields[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const getDecisionColor = (decision) => {
      switch(decision?.toLowerCase()) {
        case 'challenge_requested': return '#6B7280';
        case 'frictionless': return '#6B7280';
        case 'not_supported': return '#6B7280';
        case 'authentication_failed': return '#6B7280';
        case 'authentication_successful': return '#6B7280';
        default: return '#6B7280';
      }
    };

    const getDecisionIcon = (decision) => {
      switch(decision?.toLowerCase()) {
        case 'challenge_requested': return '';
        case 'frictionless': return '';
        case 'not_supported': return '';
        case 'authentication_failed': return '';
        case 'authentication_successful': return '';
        default: return '';
      }
    };

    return (
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: `2px solid ${color}`
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: color,
            marginRight: '12px'
          }}></div>
          <h4 style={{ 
            color: color, 
            fontSize: '1.1rem', 
            fontWeight: '600',
            margin: 0
          }}>
            {title}
          </h4>
        </div>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(data).map(([key, value]) => {
            const isDecision = key === 'decision';
            const decisionColor = isDecision ? getDecisionColor(value) : null;
            const decisionIcon = isDecision ? getDecisionIcon(value) : null;
            
            return (
              <div key={key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '12px 16px',
                backgroundColor: isDecision ? `${decisionColor}15` : '#f8f9fa',
                borderRadius: '8px',
                border: isDecision ? `2px solid ${decisionColor}40` : '1px solid #e9ecef',
                boxShadow: isDecision ? `0 2px 8px ${decisionColor}20` : 'none'
              }}>
                <span style={{
                  fontWeight: isDecision ? '600' : '500',
                  color: isDecision ? decisionColor : '#495057',
                  fontSize: '0.9rem',
                  minWidth: '120px',
                  marginRight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {isDecision && <span style={{ fontSize: '1rem' }}>{decisionIcon}</span>}
                  {getDisplayKey(key)}:
                </span>
                <span style={{
                  color: isDecision ? decisionColor : '#212529',
                  fontSize: isDecision ? '1rem' : '0.9rem',
                  fontWeight: isDecision ? '700' : 'normal',
                  textAlign: 'right',
                  wordBreak: 'break-word',
                  fontFamily: key.includes('id') || key === 'routing_id' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif' : 'inherit',
                  textTransform: isDecision ? 'capitalize' : 'none',
                  letterSpacing: isDecision ? '0.5px' : '0'
                }}>
                  {key === 'routing_id' ? (
                    <RoutingRuleTooltip routingId={value} rules={rules} displayedRules={displayedRules} apiResponse={title === 'Response' ? data : null}>
                      <span style={{
                        cursor: 'help',
                        textDecoration: 'underline',
                        textDecorationStyle: 'dotted',
                        color: title === 'API Response' ? '#007AFF' : '#0099FF'
                      }}>
                        {renderValue(key, value)}
                      </span>
                    </RoutingRuleTooltip>
                  ) : (
                    renderValue(key, value)
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e9ecef',
        backgroundColor: '#f8f9fa'
      }}>
        {responseData && (
          <button
            onClick={() => setActiveTab('response')}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              backgroundColor: activeTab === 'response' ? '#007AFF' : 'transparent',
              color: activeTab === 'response' ? 'white' : '#6c757d',
              fontWeight: '500',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Response
          </button>
        )}
        {requestData && (
          <button
            onClick={() => setActiveTab('request')}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              backgroundColor: activeTab === 'request' ? '#0099FF' : 'transparent',
              color: activeTab === 'request' ? 'white' : '#6c757d',
              fontWeight: '500',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Request
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '24px' }}>
        {activeTab === 'response' && responseData && 
          renderKeyValuePairs(responseData, 'API Response', '#007AFF')
        }
        {activeTab === 'request' && requestData && 
          renderKeyValuePairs(requestData, 'Request Payload', '#0099FF')
        }
      </div>
    </div>
  );
};


const CardSelectionPage = () => {
  const location = useLocation();
  const { apiKey, routingId, amount, currency, rules, displayedRules } = location.state || {};

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
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    expiryDate: '',
    cvv: ''
  });

  // Validation functions (card number validation removed)

  const validateExpiryDate = (expiry) => {
    if (!expiry) return 'Expiry date is required';
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (!expiryRegex.test(expiry)) return 'Expiry must be in MM/YYYY format';
    
    const [month, year] = expiry.split('/');
    const expiryDate = new Date(parseInt(year), parseInt(month) - 1);
    const currentDate = new Date();
    currentDate.setDate(1); // Set to first day of current month
    
    if (expiryDate < currentDate) return 'Card has expired';
    return '';
  };

  const validateCVV = (cvv) => {
    if (!cvv) return 'CVV is required';
    if (!/^\d{3,4}$/.test(cvv)) return 'CVV must be 3-4 digits';
    return '';
  };

  // Real-time validation handlers
  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    setCardNumber(value);
    // No validation for card number
  };

  const handleExpiryDateChange = (e) => {
    const value = e.target.value;
    setExpiryDate(value);
    const error = validateExpiryDate(value);
    setValidationErrors(prev => ({ ...prev, expiryDate: error }));
  };

  const handleCVVChange = (e) => {
    const value = e.target.value;
    setCvv(value);
    const error = validateCVV(value);
    setValidationErrors(prev => ({ ...prev, cvv: error }));
  };

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
      const response = await axios.post('https://sandbox.hyperswitch.io/three_ds_decision/execute', payload, {
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json',
          'api-key': apiKey 
        },
      });
      setApiResponse(response.data);
      console.log('API Response:', JSON.stringify(response.data, null, 2));
      
      // Dispatch payment completed event to update progress bar
      window.dispatchEvent(new CustomEvent('paymentCompleted'));
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
    <div className="page-container card-page-container">
      <h2>Enter Card Details & Confirm</h2>

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
                {/* Card Number Field */}
                <div className="form-group modern-card-input">
                  <div className="input-with-icon">
                    <input 
                      type="text" 
                      id="cardNumber" 
                      value={cardNumber} 
                      onChange={handleCardNumberChange} 
                      placeholder="Card Number" 
                      required 
                      className="card-number-input"
                    />
                    <div className="card-icon"></div>
                  </div>
                </div>
                
                {/* Expiry and CVV Row */}
                <div className="form-row">
                  <div className={`form-group form-group-half ${validationErrors.expiryDate ? 'validation-error' : ''}`}>
                    <div className="input-with-icon">
                      <input 
                        type="text" 
                        id="expiryDate" 
                        value={expiryDate} 
                        onChange={handleExpiryDateChange} 
                        placeholder="Expiry" 
                        required 
                        className={`expiry-input ${validationErrors.expiryDate ? 'error' : ''}`}
                        style={{
                          borderColor: validationErrors.expiryDate ? '#DC2626' : '',
                          color: validationErrors.expiryDate ? '#DC2626' : ''
                        }}
                      />
                    </div>
                    {validationErrors.expiryDate && (
                      <div className="validation-error-message">
                        {validationErrors.expiryDate}
                      </div>
                    )}
                  </div>
                  <div className={`form-group form-group-cvv ${validationErrors.cvv ? 'validation-error' : ''}`}>
                    <div className="input-with-icon">
                      <input
                        type={isCvvVisible ? 'text' : 'password'}
                        id="cvv"
                        value={cvv}
                        onChange={handleCVVChange}
                        placeholder="CVC"
                        required
                        className={`cvv-input ${validationErrors.cvv ? 'error' : ''}`}
                        style={{
                          borderColor: validationErrors.cvv ? '#DC2626' : '',
                          color: validationErrors.cvv ? '#DC2626' : ''
                        }}
                      />
                      <div 
                        className="cvv-toggle-icon"
                        onClick={() => setIsCvvVisible(!isCvvVisible)}
                        title={isCvvVisible ? 'Hide CVV' : 'Show CVV'}
                      >
                        <img 
                          src={isCvvVisible ? hideIcon : showIcon}
                          alt={isCvvVisible ? 'Hide CVV' : 'Show CVV'}
                          style={{
                            width: '16px',
                            height: '16px',
                            opacity: 0.7,
                            transition: 'opacity 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '1'}
                          onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                        />
                      </div>
                      <div className="cvv-icon"></div>
                    </div>
                    {validationErrors.cvv && (
                      <div className="validation-error-message">
                        {validationErrors.cvv}
                      </div>
                    )}
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
                    **** **** **** {card.number.slice(-4)} - {card.name} ({card.issuerName})
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

          <button type="submit" form="payment-form" disabled={loading || !selectedCardId} style={{ marginTop: '8px', width: '100%' }}>
            {loading ? 'Processing...' : `Pay ${formatAmountForDisplay(amount, currency)}`}
          </button>
          {error && <p className="error-message" style={{ marginTop: '15px' }}>{error}</p>}

          {/* Powered by Hyperswitch */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '16px', 
            fontSize: '0.85rem',
            color: '#9CA3AF'
          }}>
            powered by <span style={{ fontWeight: '500', color: '#6B7280' }}>hyperswitch</span>
          </div>

          
        </div>

        {/* Right Side - API Response Section */}
        <div className="card-page-right-panel">
          {(apiResponse || apiRequestPayload) ? (
            <div className="api-response-container">
              <h3 style={{ color: '#1D1D1F', marginBottom: '15px', fontSize: '1.3em', fontWeight: '600' }}>Transaction Details:</h3>
              <FormattedApiResponse requestData={apiRequestPayload} responseData={apiResponse} rules={rules} displayedRules={displayedRules} />
            </div>
          ) : (
            <div className="api-response-placeholder">
              <h3 style={{ color: '#6E6E73', marginBottom: '15px', fontSize: '1.3em', fontWeight: '600' }}>Transaction Details</h3>
              <p style={{ color: '#8E8E93', fontStyle: 'italic' }}>Submit the form to see the response here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardSelectionPage;

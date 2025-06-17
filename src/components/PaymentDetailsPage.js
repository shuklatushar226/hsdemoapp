import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../App.css'; // Assuming some styles might be shared

import axios from 'axios';

// Helper component to display condition data from rule.statements
const ConditionDisplay = ({ statementsData }) => {
  if (!statementsData || !Array.isArray(statementsData) || statementsData.length === 0) {
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>N/A</span>; // Use CSS variable
  }

  const formatComparison = (comparison) => {
    switch (comparison?.toLowerCase()) {
      case 'equal': return '=';
      case 'notequal': return '!=';
      case 'greaterthan': return '>';
      case 'greaterthanequal': return '>=';
      case 'lessthan': return '<';
      case 'lessthanequal': return '<=';
      default: return comparison || '';
    }
  };

  const formattedStatements = statementsData.map((statement, stmtIndex) => {
    if (!statement || !Array.isArray(statement.condition) || statement.condition.length === 0) {
      return `(Statement ${stmtIndex + 1} has no conditions)`;
    }
    const conditionParts = statement.condition.map((cond, condIndex) => {
      const lhs = cond.lhs || 'unknown_field';
      const comparisonOperator = formatComparison(cond.comparison);
      // value can be an object like { type: "enum_variant", value: "Poland" } or a primitive
      const rhsValue = (typeof cond.value === 'object' && cond.value !== null && cond.value.hasOwnProperty('value'))
        ? cond.value.value
        : cond.value;
      const fieldName = String(lhs).replace(/_/g, ' ');
      const operator = comparisonOperator;
      const value = String(rhsValue);
      return (
        <React.Fragment key={condIndex}>
          {condIndex > 0 && <span style={{ color: '#6B7280', margin: '0 8px', fontWeight: '500' }}> AND </span>}
          <span style={{ 
            padding: '2px 6px', 
            borderRadius: '4px', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'inline-block',
            margin: '2px'
          }}>
            <span style={{ color: '#3B82F6', fontWeight: '600' }}>{fieldName}</span>
            <span style={{ color: '#6B7280', margin: '0 4px' }}>{operator}</span>
            <span style={{ color: '#10B981', fontWeight: '500' }}>{value}</span>
          </span>
        </React.Fragment>
      );
    });
    return conditionParts;
  });

  // If multiple statements, join them by OR (or display separately)
  // For now, joining with a line break if multiple, assuming they are OR'd or separate blocks
  // Join statements with a line break for compactness in a table cell
  return (
    <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4', fontSize: '0.9em' }}> {/* Adjusted styles */}
      {formattedStatements.map((fs, index) => (
        <React.Fragment key={index}>
          {fs}
          {index < formattedStatements.length - 1 && <br />} {/* Add <br /> between statements */}
        </React.Fragment>
      ))}
    </div>
  );
};


const PaymentDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { apiKey, rules } = location.state || {};

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(''); // Default to empty
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [error, setError] = useState('');

  // Billing address state
  // const [billingAddress, setBillingAddress] = useState({
  //   firstName: '',
  //   lastName: '',
  //   addressLine1: '',
  //   addressLine2: '',
  //   city: '',
  //   state: '',
  //   postalCode: '',
  //   country: ''
  // });

  const [routingConfigData, setRoutingConfigData] = useState(null);
  const [routingConfigLoading, setRoutingConfigLoading] = useState(false);
  const [routingConfigError, setRoutingConfigError] = useState('');

  useEffect(() => {
    // Pre-select the first rule if rules are available
    if (rules && rules.length > 0 && !selectedRuleId) { // Ensure it only runs if selectedRuleId isn't already set
      const firstRuleId = rules[0].id || rules[0].routing_id || rules[0].rule_id || rules[0].routing_rule_id;
      if (firstRuleId) {
        setSelectedRuleId(firstRuleId);
      }
    }
  }, [rules, selectedRuleId]);

  useEffect(() => {
    const fetchRoutingConfig = async () => {
      if (selectedRuleId && apiKey) {
        setRoutingConfigLoading(true);
        setRoutingConfigError('');
        setRoutingConfigData(null);
        try {
          const response = await axios.get(
            `https://integ.hyperswitch.io/api/routing/${selectedRuleId}`,
            {
              headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            }
          );
          console.log('Full routing configuration response for ID ' + selectedRuleId + ':', response); // Log the full response object
          setRoutingConfigData(response.data);
        } catch (err) {
          console.error('Error fetching routing configuration:', err);
          let errorMessage = 'Failed to fetch routing configuration for the selected rule.';
          if (err.response) {
            errorMessage += ` Server responded with ${err.response.status}.`;
            if (err.response.data && (err.response.data.message || err.response.data.error_message)) {
              errorMessage += ` Message: ${err.response.data.message || err.response.data.error_message}`;
            }
          }
          setRoutingConfigError(errorMessage);
        } finally {
          setRoutingConfigLoading(false);
        }
      }
    };

    fetchRoutingConfig();
  }, [selectedRuleId, apiKey]);

  if (!location.state || !apiKey || !rules) {
    return (
      <div className="page-container form-container error-container">
        <h2>Error</h2>
        <p>API Key or Routing Rules are missing. Please start over.</p>
        <Link to="/" className="button-link">Go to API Key Entry</Link>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!amount || !currency) {
      setError('Amount and Currency are required.');
      return;
    }
    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive integer.');
      return;
    }
    if (!selectedRuleId) {
        setError('Please select a routing rule.');
        return;
    }

    // Validate required billing address fields
    // const requiredFields = ['firstName', 'lastName', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
    // const missingFields = requiredFields.filter(field => !billingAddress[field].trim());
    
    // if (missingFields.length > 0) {
    //   setError('Please fill in all required billing address fields.');
    //   return;
    // }

    // Get the specific rules displayed in the table
    const displayedRules = routingConfigData?.algorithm?.data?.rules || [];
    
    navigate('/select-card', {
      state: {
        apiKey,
        routingId: selectedRuleId,
        amount: numericAmount, // Send integer amount
        currency,
        // billingAddress, // Pass billing address data
        rules: rules, // Pass the original rules array
        routingConfigData: routingConfigData, // Pass the routing configuration data
        displayedRules: displayedRules, // Pass the specific rules shown in the table
      },
    });
  };

  return (
    <div className="page-container payment-details-container">
      <h2>Configure 3DS</h2>

      {/* Side-by-side layout */}
      <div className="payment-details-layout">
        {/* Left Side - Form */}
        <div className="payment-form-panel">
          <div className="panel-header">
            <h3>Payment Information</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="amount">
                Amount
              </label>
              <div className="input-wrapper">
                <input
                  id="amount"
                  type="number"
                  placeholder="e.g., 100"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow empty string for clearing input, otherwise try to parse as int
                    if (val === '' || /^[1-9]\d*$/.test(val)) {
                      setAmount(val);
                    } else if (val === '0' && amount === '') { // Allow typing '0' initially if field is empty, but it won't be valid alone
                      setAmount(val); 
                    } else if (val === '' && amount !== '') { // Handle backspace to empty
                      setAmount('');
                    }
                  }}
                  required
                  min="1" // HTML5 validation for positive
                  step="1"  // HTML5 validation for integer
                  className="amount-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="currency">
                Currency
              </label>
              <div className="select-wrapper">
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  required
                  className="currency-select"
                >
                  <option value="" disabled>Select Currency</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="ANG">ANG - Netherlands Antillean Guilder</option>
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>

            {/* Billing Address Section
            <div className="billing-address-section">
              <h4 className="section-title">Billing Address</h4>
              
              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={billingAddress.firstName}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    className="billing-input"
                  />
                </div>
                <div className="form-group form-group-half">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={billingAddress.lastName}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    className="billing-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="addressLine1">Address Line 1</label>
                <input
                  id="addressLine1"
                  type="text"
                  placeholder="Street address"
                  value={billingAddress.addressLine1}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                  required
                  className="billing-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="addressLine2">Address Line 2 (Optional)</label>
                <input
                  id="addressLine2"
                  type="text"
                  placeholder="Apartment, suite, etc."
                  value={billingAddress.addressLine2}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                  className="billing-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    placeholder="City"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                    required
                    className="billing-input"
                  />
                </div>
                <div className="form-group form-group-half">
                  <label htmlFor="state">State/Province</label>
                  <input
                    id="state"
                    type="text"
                    placeholder="State/Province"
                    value={billingAddress.state}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                    required
                    className="billing-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    id="postalCode"
                    type="text"
                    placeholder="Postal Code"
                    value={billingAddress.postalCode}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                    required
                    className="billing-input"
                  />
                </div>
                <div className="form-group form-group-half">
                  <label htmlFor="country">Country</label>
                  <div className="select-wrapper">
                    <select
                      id="country"
                      value={billingAddress.country}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                      required
                      className="billing-select"
                    >
                      <option value="" disabled>Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="IN">India</option>
                      <option value="AU">Australia</option>
                      <option value="JP">Japan</option>
                      <option value="NL">Netherlands</option>
                    </select>
                    <div className="select-arrow">▼</div>
                  </div>
                </div>
              </div>
            </div> */}
            
            <div className="form-footer">
              <button type="submit" disabled={!selectedRuleId} className="submit-button">
                Select Card
              </button>
              {error && <div className="error-message">{error}</div>}
              <div className="powered-by" style={{ marginTop: '24px' }}>
                powered by <span className="brand">hyperswitch</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side - Rules Table */}
        <div className="routing-config-panel">
          <div className="panel-header">
            <h3>Routing Configuration</h3>
          </div>
          
          <div className="config-content">
            {selectedRuleId && (
              <div>
                {routingConfigLoading && (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p className="loading-message">Loading configuration...</p>
                  </div>
                )}
                {routingConfigError && <div className="error-message">{routingConfigError}</div>}
                
                {(() => {
                  // Path: routingConfigData.algorithm.data.rules
                  const algorithmData = routingConfigData?.algorithm?.data;
                  if (algorithmData && Array.isArray(algorithmData.rules) && algorithmData.rules.length > 0) {
                    const rulesToDisplay = algorithmData.rules;
                    
                    return (
                      <div className="rules-table-container">
                        <div className="table-wrapper">
                          <table className="rules-table">
                            <thead>
                              <tr>
                                <th>Rule Name</th>
                                <th>Decision</th>
                                <th>Conditions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rulesToDisplay.map((rule, index) => (
                                <tr key={index} className="rule-row">
                                  <td className="rule-name">
                                    <div className="rule-name-content">
                                      {rule.name || rule.rule_name || rule.id || rule.rule_id || 'N/A'}
                                    </div>
                                  </td>
                                  <td className="rule-decision">
                                    <span className="decision-badge">
                                      {rule.connectorSelection && rule.connectorSelection.decision !== undefined
                                        ? String(rule.connectorSelection.decision).replace(/_/g, ' ')
                                        : 'N/A'}
                                    </span>
                                  </td>
                                  <td className="rule-conditions">
                                    <ConditionDisplay statementsData={rule.statements} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  } else if (routingConfigData && !routingConfigLoading) {
                    // Check if algorithm or data or rules is missing or not the correct type
                    let message = "No specific rules found within the algorithm data of this routing configuration.";
                    if (!routingConfigData.algorithm) {
                      message = "Algorithm details not found in the routing configuration.";
                    } else if (!routingConfigData.algorithm.data) {
                      message = "Algorithm 'data' property not found in the routing configuration.";
                    } else if (!Array.isArray(routingConfigData.algorithm.data.rules)) {
                      message = "The 'rules' property within algorithm data is not an array as expected.";
                    } else if (routingConfigData.algorithm.data.rules.length === 0) {
                      message = "The 'rules' array within algorithm data is empty.";
                    }
                    return <div className="info-message">{message}</div>;
                  }
                  return (
                    <div className="empty-state">
                      <div className="empty-icon"></div>
                      <p>Routing configuration will appear here</p>
                      <small>Rules are automatically loaded when available</small>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;

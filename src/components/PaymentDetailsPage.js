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
    const conditionParts = statement.condition.map(cond => {
      const lhs = cond.lhs || 'unknown_field';
      const comparisonOperator = formatComparison(cond.comparison);
      // value can be an object like { type: "enum_variant", value: "Poland" } or a primitive
      const rhsValue = (typeof cond.value === 'object' && cond.value !== null && cond.value.hasOwnProperty('value'))
        ? cond.value.value
        : cond.value;
      return `${String(lhs).replace(/_/g, ' ')} ${comparisonOperator} ${String(rhsValue)}`;
    });
    return conditionParts.join(' AND ');
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

    navigate('/select-card', {
      state: {
        apiKey,
        routingId: selectedRuleId,
        amount: numericAmount, // Send integer amount
        currency,
      },
    });
  };

  // const getRuleId = (rule) => rule.id || rule.routing_id || rule.rule_id || rule.routing_rule_id || 'N/A'; // Commented out as it's unused

  return (
    <div className="page-container form-container">
      <h2>Step 2: Enter Payment Details</h2>

      {/* Display Selected Routing Configuration */}
      {selectedRuleId && (
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          {/* Heading removed as per request */}
          {routingConfigLoading && <p className="loading-message">Loading configuration...</p>}
          {routingConfigError && <p className="error-message">{routingConfigError}</p>}
          
          {(() => {
            // Path: routingConfigData.algorithm.data.rules
            const algorithmData = routingConfigData?.algorithm?.data;
            if (algorithmData && Array.isArray(algorithmData.rules) && algorithmData.rules.length > 0) {
              const rulesToDisplay = algorithmData.rules;
              
              return (
                <div className="rules-table-container">
                  <table className="rules-table">
                    <thead>
                      <tr>
                        <th style={{width: '25%'}}>Rule Name</th>
                        <th style={{width: '25%'}}>Connector Selection Decision</th>
                        <th style={{width: '50%'}}>Conditions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rulesToDisplay.map((rule, index) => (
                        <tr key={index}>
                          <td>{rule.name || rule.rule_name || rule.id || rule.rule_id || 'N/A'}</td>
                          <td>
                            {rule.connectorSelection && rule.connectorSelection.decision !== undefined
                              ? String(rule.connectorSelection.decision)
                              : 'N/A'}
                          </td>
                          <td>
                            <ConditionDisplay statementsData={rule.statements} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              return <p className="info-message">{message}</p>;
            }
            return null;
          })()}
        </div>
      )}
      
      {/* Available Routing Rules section removed as per request */}

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="currency">Currency:</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          >
            <option value="" disabled>Select Currency</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            {/* Add more currencies as needed */}
          </select>
        </div>
        <button type="submit" disabled={!selectedRuleId}>
          Next: Select Card
        </button>
        {error && <p className="error-message" style={{marginTop: '15px'}}>{error}</p>}
      </form>
      <Link to="/" className="button-link secondary" style={{display: 'inline-block', marginTop: '20px', marginRight: '10px'}}>Back to API Key</Link>
    </div>
  );
};

export default PaymentDetailsPage;

import React, { useState } from 'react';

const RuleViewer = ({ rules }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Amount:', amount);
    console.log('Currency:', currency);
  };

  return (
    <div>
      <h2>Enter Transaction Details</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

      <h3>3DS Routing Rules:</h3>
      {rules.length === 0 ? (
        <p>No rules found or yet to be fetched.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {rules.map((rule, index) => (
            <li key={rule.id || index} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', textAlign: 'left' }}>
              <strong>ID:</strong> {rule.id || 'N/A'}<br />
              <strong>Name:</strong> {rule.name || 'N/A'}<br />
              <strong>Description:</strong> {rule.description || 'N/A'}<br />
              {rule.algorithm && typeof rule.algorithm === 'object' && (
                <>
                  <strong>Algorithm Type:</strong> {rule.algorithm.type || 'N/A'}<br />
                  {/* You can add more details from rule.algorithm.data if needed */}
                </>
              )}
              {/* For debugging or full details, uncomment the line below */}
              {/* <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(rule, null, 2)}</pre> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RuleViewer;

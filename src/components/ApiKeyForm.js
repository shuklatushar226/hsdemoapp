import React, { useState } from 'react';

const ApiKeyForm = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onApiKeySubmit(apiKey);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enter your API Key</h2>
      <input
        type="text"
        placeholder="API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default ApiKeyForm;

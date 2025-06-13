import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ApiKeyEntryPage from './components/ApiKeyEntryPage';
import PaymentDetailsPage from './components/PaymentDetailsPage';
import CardSelectionPage from './components/CardSelectionPage';
import './App.css'; // Import App.css

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hyperswitch Payment Flow</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ApiKeyEntryPage />} />
          <Route path="/payment-details" element={<PaymentDetailsPage />} />
          <Route path="/select-card" element={<CardSelectionPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

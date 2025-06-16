import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ApiKeyEntryPage from './components/ApiKeyEntryPage';
import PaymentDetailsPage from './components/PaymentDetailsPage';
import CardSelectionPage from './components/CardSelectionPage';
// import CardSelectionTest from './components/CardSelectionTest';
import ProgressBar from './components/ProgressBar';
import './App.css'; // Import App.css

function AppContent() {
  const location = useLocation();
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  const steps = ['API Key', 'Payment Details', 'Card Selection'];
  
  const getCurrentStep = () => {
    switch (location.pathname) {
      case '/':
        return 1;
      case '/payment-details':
        return 2;
      case '/select-card':
        return paymentCompleted ? 4 : 3; // 4 means completed
      default:
        return 1;
    }
  };

  // Listen for payment completion event
  useEffect(() => {
    const handlePaymentCompleted = () => {
      setPaymentCompleted(true);
    };

    window.addEventListener('paymentCompleted', handlePaymentCompleted);
    
    return () => {
      window.removeEventListener('paymentCompleted', handlePaymentCompleted);
    };
  }, []);

  // Reset payment completed when navigating away from card selection
  useEffect(() => {
    if (location.pathname !== '/select-card') {
      setPaymentCompleted(false);
    }
  }, [location.pathname]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>3DS Intelligence Flow</h1>
      </header>
      <ProgressBar 
        currentStep={getCurrentStep()} 
        totalSteps={3} 
        steps={steps} 
      />
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

function App() {
  return <AppContent />;
}

export default App;

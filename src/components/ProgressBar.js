import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ProgressBar = ({ currentStep, totalSteps, steps }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getStepPath = (stepIndex) => {
    switch (stepIndex) {
      case 0: return '/';
      case 1: return '/payment-details';
      case 2: return '/select-card';
      default: return '/';
    }
  };

  const handleStepClick = (stepIndex) => {
    const stepNumber = stepIndex + 1;
    
    // Only allow navigation to completed steps or current step
    if (stepNumber <= currentStep) {
      const targetPath = getStepPath(stepIndex);
      
      // Pass current state data when navigating
      if (location.state) {
        navigate(targetPath, { state: location.state });
      } else {
        navigate(targetPath);
      }
    }
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-steps-horizontal">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="progress-step-item">
              <div 
                className={`progress-step-circle-horizontal ${
                  index + 1 < currentStep ? 'completed clickable' : 
                  index + 1 === currentStep ? 'active clickable' : 'pending'
                }`}
                onClick={() => handleStepClick(index)}
                style={{
                  cursor: index + 1 <= currentStep ? 'pointer' : 'default'
                }}
                title={index + 1 <= currentStep ? `Go to ${step}` : ''}
              >
                {index + 1 < currentStep ? (
                  <span className="progress-step-check">✓</span>
                ) : (
                  <span className="progress-step-number">{index + 1}</span>
                )}
              </div>
              <span className={`progress-step-label-horizontal ${
                index + 1 <= currentStep ? 'completed' : 'pending'
              }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`progress-line ${
                  index + 1 < currentStep ? 'completed' : 'pending'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;

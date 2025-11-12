import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { CalculatorPage } from './components/CalculatorPage';

const App: React.FC = () => {
  const [page, setPage] = useState<'home' | 'calculator'>('home');

  const handleStart = () => {
    setPage('calculator');
  };

  const handleBackToHome = () => {
    setPage('home');
  };

  if (page === 'home') {
    return <HomePage onStart={handleStart} />;
  }

  return <CalculatorPage onBackToHome={handleBackToHome} />;
};

export default App;
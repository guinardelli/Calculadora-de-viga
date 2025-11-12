import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { FlexureCalculatorPage } from './components/CalculatorPage';
import { ShearCalculatorPage } from './components/ShearCalculatorPage';
import { AnchorageCalculatorPage } from './components/AnchorageCalculatorPage';
import { SteelConverterPage } from './components/SteelConverterPage';
import { MinimumSteelCalculatorPage } from './components/MinimumSteelCalculatorPage';

export type Page = 'home' | 'flexure' | 'shear' | 'anchorage' | 'steelConverter' | 'minimumSteel';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');

  const handleStart = (calculator: Page) => {
    if (calculator !== 'home') {
      setPage(calculator);
    }
  };

  const handleBackToHome = () => {
    setPage('home');
  };

  const renderPage = () => {
    switch (page) {
      case 'flexure':
        return <FlexureCalculatorPage onBackToHome={handleBackToHome} />;
      case 'shear':
        return <ShearCalculatorPage onBackToHome={handleBackToHome} />;
      case 'anchorage':
        return <AnchorageCalculatorPage onBackToHome={handleBackToHome} />;
      case 'steelConverter':
        return <SteelConverterPage onBackToHome={handleBackToHome} />;
      case 'minimumSteel':
        return <MinimumSteelCalculatorPage onBackToHome={handleBackToHome} />;
      case 'home':
      default:
        return <HomePage onStart={handleStart} />;
    }
  };

  return <>{renderPage()}</>;
};

export default App;

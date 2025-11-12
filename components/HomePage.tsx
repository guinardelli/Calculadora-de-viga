import React from 'react';
import type { Page } from '../App';

interface HomePageProps {
  onStart: (page: Page) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
      <div className="text-center p-10 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            Calculadora de Concreto Armado
          </h1>
          <p className="text-xl text-slate-600">
            Ferramentas de dimensionamento e verificação conforme a NBR 6118:2023.
          </p>
        </header>
        
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-10">
          {/* Flexure Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center">
            <div className="text-blue-500 mb-4">
              <i className="fas fa-ruler-combined text-5xl"></i>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Flexão Simples</h2>
            <p className="text-slate-500 mb-6 text-center h-24">
              Calcule a armadura longitudinal necessária para resistir aos momentos fletores.
            </p>
            <button
              onClick={() => onStart('flexure')}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500"
            >
              Acessar
            </button>
          </div>

          {/* Shear Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center">
            <div className="text-green-500 mb-4">
              <i className="fas fa-grip-lines-vertical text-5xl"></i>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Cisalhamento</h2>
            <p className="text-slate-500 mb-6 text-center h-24">
              Dimensione a armadura transversal (estribos) para resistir aos esforços cortantes.
            </p>
            <button
              onClick={() => onStart('shear')}
              className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-500"
            >
              Acessar
            </button>
          </div>

          {/* Anchorage Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center">
            <div className="text-orange-500 mb-4">
              <i className="fas fa-anchor text-5xl"></i>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Ancoragem</h2>
            <p className="text-slate-500 mb-6 text-center h-24">
              Calcule o comprimento de ancoragem necessário para as barras de armadura.
            </p>
            <button
              onClick={() => onStart('anchorage')}
              className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-orange-400"
            >
              Acessar
            </button>
          </div>
          
           {/* Steel Converter Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center">
            <div className="text-indigo-500 mb-4">
              <i className="fas fa-exchange-alt text-5xl"></i>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Conversor de Armadura</h2>
            <p className="text-slate-500 mb-6 text-center h-24">
              Converta bitolas e espaçamentos de barras de aço mantendo a mesma área de aço.
            </p>
            <button
              onClick={() => onStart('steelConverter')}
              className="w-full bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-400"
            >
              Acessar
            </button>
          </div>
          
          {/* Minimum Steel Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center">
            <div className="text-teal-500 mb-4">
              <i className="fas fa-layer-group text-5xl"></i>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Armadura Mínima</h2>
            <p className="text-slate-500 mb-6 text-center h-24">
              Verifique a armadura mínima de flexão e o momento mínimo resistido.
            </p>
            <button
              onClick={() => onStart('minimumSteel')}
              className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-teal-600 transition-all duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-teal-400"
            >
              Acessar
            </button>
          </div>
        </main>

         <footer className="text-center mt-12 text-sm text-slate-500">
            <p>Esta ferramenta é para fins educacionais e de estudo. Os resultados devem ser verificados por um engenheiro qualificado antes do uso em projetos reais.</p>
       </footer>
      </div>
    </div>
  );
};

import React from 'react';

interface HomePageProps {
  onStart: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
      <div className="text-center p-10 max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            Calculadora de Viga de Concreto Armado
          </h1>
          <p className="text-xl text-slate-600">
            Uma ferramenta para dimensionamento à flexão simples conforme a NBR 6118.
          </p>
        </header>
        <main className="mb-8">
          <p className="text-slate-500 leading-relaxed">
            Projete e verifique vigas de concreto armado de forma rápida e intuitiva. Insira os parâmetros da viga, materiais e esforços para obter a área de aço necessária, com todas as verificações de ductilidade e armaduras mínima e máxima, acompanhadas de uma visualização gráfica detalhada.
          </p>
        </main>
        <button
          onClick={onStart}
          className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i className="fas fa-rocket mr-3"></i>
          Iniciar Dimensionamento
        </button>
         <footer className="text-center mt-12 text-sm text-slate-500">
            <p>Esta ferramenta é para fins educacionais e de estudo. Os resultados devem ser verificados por um engenheiro qualificado antes do uso em projetos reais.</p>
       </footer>
      </div>
    </div>
  );
};

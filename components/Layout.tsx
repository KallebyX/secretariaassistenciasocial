import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { ToastContainer } from './Toast';
import { CacapavaDoSulIcon } from './CacapavaDoSulIcon';


const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-prefeitura-verde text-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-3">
                         <CacapavaDoSulIcon className="w-12 h-12" />
                        <h1 className="text-xl font-bold">
                            <span className="hidden sm:inline">Assistência Social</span>
                             <span className="sm:hidden">SAS</span>
                            <span className="block text-xs font-normal text-prefeitura-amarelo">Caçapava do Sul</span>
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user && <span className="text-gray-600 hidden sm:block">Olá, <span className="font-semibold">{user.nome.split(' ')[0]}</span></span>}
                        <button
                            onClick={logout}
                            className="bg-brand-primary-900 hover:bg-brand-primary-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};


const VLibras: React.FC = () => {
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      new window.VLibras.Widget('https://vlibras.gov.br/app');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  return (
    <div vw="true" className="enabled">
      <div vw-access-button="true" className="active"></div>
      <div vw-plugin-wrapper="true">
        <div className="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  );
}


const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
            <ToastContainer />
            <VLibras />
        </div>
    );
};

export default Layout;

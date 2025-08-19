import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CacapavaDoSulIcon } from '../components/CacapavaDoSulIcon';

const LoginPage: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(cpf, senha);
    } catch (err) {
      setError('Credenciais inválidas. Verifique o CPF e a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 space-y-6 transform transition-all hover:scale-105">
        <div className="text-center">
            <div className="flex justify-center mx-auto mb-4">
                 <CacapavaDoSulIcon className="w-20 h-20" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
                Assistência Social
            </h2>
            <p className="mt-2 text-sm text-gray-600">
                Prefeitura Municipal de Caçapava do Sul
            </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
            <input 
              id="cpf"
              name="cpf"
              type="text" 
              autoComplete="username"
              value={cpf} 
              onChange={e => setCpf(e.target.value.replace(/\D/g, ''))}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary-500 focus:border-brand-primary-500 sm:text-sm" 
              required 
              maxLength={11}
              placeholder="Apenas números"
            />
          </div>
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              id="senha"
              name="senha"
              type="password" 
              autoComplete="current-password"
              value={senha} 
              onChange={e => setSenha(e.target.value)}
              className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary-500 focus:border-brand-primary-500 sm:text-sm" 
              required 
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary-900 hover:bg-brand-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-500 disabled:bg-gray-400 transition-colors"
          >
            {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : 'Entrar'}
          </button>
        </form>
        <div className="text-center text-xs text-gray-500 bg-gray-100 p-3 rounded-md">
            <p className="font-semibold mb-1">Para demonstração:</p>
            <p><span className="font-medium">Secretária:</span> CPF `99988877766`</p>
            <p><span className="font-medium">Servidor:</span> CPF `11122233344`</p>
            <p><span className="font-medium">Beneficiário:</span> CPF `55566677788`</p>
            <p>A senha para todos é `senha123`.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

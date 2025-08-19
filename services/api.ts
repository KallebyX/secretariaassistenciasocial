import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

export const apiLogin = async (cpf: string, senha: string) => {
  const response = await api.post('/login', { cpf, password: senha });
  return response.data;
};

export const apiFetchProfile = async (token: string) => {
  const response = await api.get('/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.user;
};


export default api;

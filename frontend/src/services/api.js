import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const sendMessage = async (sessionId, message, language) => {
  const { data } = await api.post('/chat', { sessionId, message, language });
  return data;
};

export const getSchemes = async (profile) => {
  const { data } = await api.post('/schemes/match', { profile });
  return data;
};

export const initiateDigiLocker = async (schemeId) => {
  const { data } = await api.post('/digilocker/initiate', { schemeId });
  return data;
};

export const getDigiLockerStatus = async (sessionToken) => {
  const { data } = await api.get('/digilocker/status', { params: { sessionToken } });
  return data;
};

export const submitApplication = async (schemeId, sessionId) => {
  const { data } = await api.post('/applications/submit', { schemeId, sessionId });
  return data;
};

export const trackApplication = async (applicationId) => {
  const { data } = await api.get(`/applications/${applicationId}`);
  return data;
};

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  const { data } = await api.post('/chat/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export default api;

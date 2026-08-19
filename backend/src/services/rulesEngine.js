import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RULES_ENGINE_URL = process.env.RULES_ENGINE_URL || 'http://localhost:8000';

export const matchSchemes = async (userProfile) => {
  try {
    const response = await axios.post(`${RULES_ENGINE_URL}/match`, { profile: userProfile }, { timeout: 5000 });
    return response.data.schemes || [];
  } catch (error) {
    console.warn("Rules engine unavailable or failed, using mock data.", error.message);
    // Mock fallback returns 3 schemes
    return [
      { id: 'pmkisan', name: 'PM-KISAN', score: 0.95 },
      { id: 'mgnregs', name: 'MGNREGS', score: 0.85 },
      { id: 'ayushman', name: 'Ayushman Bharat PM-JAY', score: 0.80 }
    ];
  }
};

export const healthCheck = async () => {
  try {
    const response = await axios.get(`${RULES_ENGINE_URL}/health`, { timeout: 2000 });
    return response.data;
  } catch (error) {
    return { status: 'down' };
  }
};

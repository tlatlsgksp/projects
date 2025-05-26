import axios from './axios';

export const getTiers = async () => {
  return axios.get('/api/tiers');
};
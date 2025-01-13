import axios from 'axios';

const BASE_URL = 'http://localhost:1337/'; // Strapi'nin base URL'si

// Dinamik API çağrısı için genel bir fonksiyon
export const fetchData = async (endpoint) => {
  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};


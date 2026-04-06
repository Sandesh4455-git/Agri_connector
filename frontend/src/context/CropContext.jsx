// src/context/CropContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CropContext = createContext();

export const useCrops = () => useContext(CropContext);

const API_URL = 'http://localhost:8080/api/crops';

const getToken = () => localStorage.getItem('agri_connect_token');

// ✅ FIX: agri_connect_role key नाही — agri_connect_user मधून role घ्यायचा
const getRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('agri_connect_user') || '{}');
    return (user.role || '').toUpperCase();
  } catch {
    return '';
  }
};

export const CropProvider = ({ children }) => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    const token = getToken();
    if (!token) return;

    const role = getRole();

    // ✅ FARMER आणि ADMIN साठीच /api/crops/my call करायचं
    // DEALER, CUSTOMER, GOVERNMENT → skip
    if (!role || role === 'DEALER' || role === 'CUSTOMER' || role === 'GOVERNMENT') {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        console.warn('Crops fetch failed:', response.status);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setCrops(data.data.map(mapCrop));
      }
    } catch (err) {
      setError('Failed to load crops');
      console.error('Error fetching crops:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCrop = async (cropData) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name:         cropData.name,
          category:     cropData.category,
          quantity:     parseFloat(cropData.quantity),
          unit:         cropData.unit,
          pricePerUnit: parseFloat(cropData.price),
          city:         cropData.location,
          description:  cropData.description
        })
      });
      const data = await response.json();
      if (data.success) {
        setCrops(prev => [...prev, mapCrop(data.data)]);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Error adding crop:', err);
      return { success: false, message: 'Server error' };
    }
  };

  const updateCrop = async (cropId, cropData) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/${cropId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name:         cropData.name,
          category:     cropData.category,
          quantity:     parseFloat(cropData.quantity),
          unit:         cropData.unit,
          pricePerUnit: parseFloat(cropData.price),
          city:         cropData.location,
          description:  cropData.description
        })
      });
      const data = await response.json();
      if (data.success) {
        setCrops(prev => prev.map(c => c.id === cropId ? mapCrop(data.data) : c));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Error updating crop:', err);
      return { success: false, message: 'Server error' };
    }
  };

  const deleteCrop = async (cropId) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_URL}/${cropId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCrops(prev => prev.filter(c => c.id !== cropId));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Error deleting crop:', err);
      return { success: false, message: 'Server error' };
    }
  };

  const mapCrop = (c) => ({
    id:          c.id,
    name:        c.name,
    category:    c.category || 'General',
    quantity:    c.quantity,
    unit:        c.unit || 'kg',
    price:       c.pricePerUnit,
    status:      c.available ? 'Available' : 'Sold',
    harvestDate: c.createdAt ? c.createdAt.split('T')[0] : '',
    location:    c.city || '',
    description: c.description || '',
    image:       getCropEmoji(c.name),
  });

  const getCropEmoji = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('wheat'))     return '🌾';
    if (n.includes('rice'))      return '🍚';
    if (n.includes('tomato'))    return '🍅';
    if (n.includes('potato'))    return '🥔';
    if (n.includes('onion'))     return '🧅';
    if (n.includes('corn') || n.includes('maize')) return '🌽';
    if (n.includes('apple'))     return '🍎';
    if (n.includes('mango'))     return '🥭';
    if (n.includes('banana'))    return '🍌';
    if (n.includes('cotton'))    return '🌿';
    if (n.includes('sugarcane')) return '🎋';
    if (n.includes('chilli'))    return '🌶️';
    if (n.includes('soybean'))   return '🫘';
    return '🌱';
  };

  return (
    <CropContext.Provider value={{ crops, loading, error, addCrop, deleteCrop, updateCrop, fetchCrops }}>
      {children}
    </CropContext.Provider>
  );
};
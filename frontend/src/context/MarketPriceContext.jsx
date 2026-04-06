// src/context/MarketPriceContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const MarketPriceContext = createContext();

export const useMarketPrices = () => useContext(MarketPriceContext);

export const MarketPriceProvider = ({ children }) => {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    // Load from localStorage
    const storedPrices = JSON.parse(localStorage.getItem('marketPrices') || '[]');
    
    if (storedPrices.length === 0) {
      // Default market prices
      const defaultPrices = [
        {
          id: 1,
          crop: 'Wheat',
          variety: 'Sharbati',
          grade: 'A',
          price: 4500,
          market: 'Azadpur Mandi, Delhi',
          date: new Date().toISOString().split('T')[0],
          status: 'active'
        },
        {
          id: 2,
          crop: 'Rice',
          variety: 'Basmati',
          grade: 'A',
          price: 6500,
          market: 'Azadpur Mandi, Delhi',
          date: new Date().toISOString().split('T')[0],
          status: 'active'
        },
        {
          id: 3,
          crop: 'Tomato',
          variety: 'Hybrid',
          grade: 'A',
          price: 3500,
          market: 'Koyambedu Market, Chennai',
          date: new Date().toISOString().split('T')[0],
          status: 'active'
        },
        {
          id: 4,
          crop: 'Potato',
          variety: 'Jyoti',
          grade: 'B',
          price: 2500,
          market: 'Agra Mandi, UP',
          date: new Date().toISOString().split('T')[0],
          status: 'active'
        }
      ];
      setPrices(defaultPrices);
      localStorage.setItem('marketPrices', JSON.stringify(defaultPrices));
    } else {
      setPrices(storedPrices);
    }
  }, []);

  const addPrice = (newPrice) => {
    const priceWithId = {
      ...newPrice,
      id: Date.now()
    };
    const updatedPrices = [...prices, priceWithId];
    setPrices(updatedPrices);
    localStorage.setItem('marketPrices', JSON.stringify(updatedPrices));
  };

  const updatePrice = (updatedPrice) => {
    const updatedPrices = prices.map(price => 
      price.id === updatedPrice.id ? updatedPrice : price
    );
    setPrices(updatedPrices);
    localStorage.setItem('marketPrices', JSON.stringify(updatedPrices));
  };

  const deletePrice = (id) => {
    const updatedPrices = prices.filter(price => price.id !== id);
    setPrices(updatedPrices);
    localStorage.setItem('marketPrices', JSON.stringify(updatedPrices));
  };

  return (
    <MarketPriceContext.Provider value={{ 
      prices, 
      addPrice, 
      updatePrice, 
      deletePrice 
    }}>
      {children}
    </MarketPriceContext.Provider>
  );
};
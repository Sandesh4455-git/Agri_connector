// src/context/SchemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const SchemeContext = createContext();

export const useSchemes = () => useContext(SchemeContext);

export const SchemeProvider = ({ children }) => {
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    // Load from localStorage
    const storedSchemes = JSON.parse(localStorage.getItem('governmentSchemes') || '[]');
    
    if (storedSchemes.length === 0) {
      // Default schemes
      const defaultSchemes = [
        {
          id: 1,
          name: 'PM-KISAN',
          description: 'Income support of ₹6000 per year',
          eligibility: 'All farmers',
          deadline: '2024-12-31',
          status: 'active'
        },
        {
          id: 2,
          name: 'KCC Loan',
          description: 'Kisan Credit Card - ₹3 lakh loan',
          eligibility: 'All farmers',
          deadline: '2024-12-31',
          status: 'active'
        },
        {
          id: 3,
          name: 'PMFBY',
          description: 'Pradhan Mantri Fasal Bima Yojana - Crop Insurance',
          eligibility: 'All farmers',
          deadline: '2024-12-31',
          status: 'active'
        }
      ];
      setSchemes(defaultSchemes);
      localStorage.setItem('governmentSchemes', JSON.stringify(defaultSchemes));
    } else {
      setSchemes(storedSchemes);
    }
  }, []);

  const addScheme = (newScheme) => {
    const schemeWithId = {
      ...newScheme,
      id: Date.now()
    };
    const updatedSchemes = [...schemes, schemeWithId];
    setSchemes(updatedSchemes);
    localStorage.setItem('governmentSchemes', JSON.stringify(updatedSchemes));
  };

  const updateScheme = (updatedScheme) => {
    const updatedSchemes = schemes.map(scheme => 
      scheme.id === updatedScheme.id ? updatedScheme : scheme
    );
    setSchemes(updatedSchemes);
    localStorage.setItem('governmentSchemes', JSON.stringify(updatedSchemes));
  };

  const deleteScheme = (id) => {
    const updatedSchemes = schemes.filter(scheme => scheme.id !== id);
    setSchemes(updatedSchemes);
    localStorage.setItem('governmentSchemes', JSON.stringify(updatedSchemes));
  };

  return (
    <SchemeContext.Provider value={{ 
      schemes, 
      addScheme, 
      updateScheme, 
      deleteScheme 
    }}>
      {children}
    </SchemeContext.Provider>
  );
};
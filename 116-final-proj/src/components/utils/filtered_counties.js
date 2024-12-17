'use client';
import React, { createContext, useContext, useState } from "react";
import geoData from '../counties_with_real_estate.json';

// Create a more specific type/shape for the context
const FilteredCountiesContext = createContext(null);

// Initial ranges computation
const initialRanges = geoData.features.reduce(
  (acc, feature) => {
    const { avg_price, total_price, total_transactions } = feature.properties;

    acc.avg_price.min = Math.min(acc.avg_price.min, avg_price);
    acc.avg_price.max = Math.max(acc.avg_price.max, avg_price);

    acc.total_price.min = Math.min(acc.total_price.min, total_price);
    acc.total_price.max = Math.max(acc.total_price.max, total_price);

    acc.total_transactions.min = Math.min(acc.total_transactions.min, total_transactions);
    acc.total_transactions.max = Math.max(acc.total_transactions.max, total_transactions);

    return acc;
  },
  {
    avg_price: { min: Infinity, max: -Infinity },
    total_price: { min: Infinity, max: -Infinity },
    total_transactions: { min: Infinity, max: -Infinity },
  }
);

export function FilteredCountiesProvider({ children }) {
  // State for slider ranges with explicit types
  const [avg_price, setAvgPrice] = useState([initialRanges.avg_price.min, initialRanges.avg_price.max]);
  const [total_price, setTotalPrice] = useState([initialRanges.total_price.min, initialRanges.total_price.max]);
  const [total_transactions, setTotalTransactions] = useState([initialRanges.total_transactions.min, initialRanges.total_transactions.max]);

  // Memoize the filtered counties
  const filteredCounties = React.useMemo(() => {
    return geoData.features.filter((feature) => {
      const avgPrice = parseFloat(feature.properties.avg_price);
      const totalPrice = parseFloat(feature.properties.total_price);
      const transactions = parseInt(feature.properties.total_transactions);
  
      return (
        avgPrice >= avg_price[0] &&
        avgPrice <= avg_price[1] &&
        totalPrice >= total_price[0] &&
        totalPrice <= total_price[1] &&
        transactions >= total_transactions[0] &&
        transactions <= total_transactions[1]
      );
    });
  }, [avg_price, total_price, total_transactions]);

  const value = React.useMemo(() => ({
    ranges: initialRanges,
    avg_price,
    total_price,
    total_transactions,
    setAvgPrice,
    setTotalPrice,
    setTotalTransactions,
    filteredCounties,
  }), [avg_price, total_price, total_transactions, filteredCounties]);

  return (
    <FilteredCountiesContext.Provider value={value}>
      {children}
    </FilteredCountiesContext.Provider>
  );
}

export function useFilteredCounties() {
  const context = useContext(FilteredCountiesContext);
  
  if (context === null) {
    throw new Error(
      'useFilteredCounties must be used within a FilteredCountiesProvider. ' +
      'Make sure you have wrapped your component tree with FilteredCountiesProvider.'
    );
  }
  
  return context;
}
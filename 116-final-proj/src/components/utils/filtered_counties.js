import React, { createContext, useContext, useState } from "react";
import geoData from '../counties_with_real_estate.json';

const FilteredCountiesContext = createContext();

export const FilteredCountiesProvider = ({ children }) => {
  // Compute initial min and max ranges for each property
  const ranges = geoData.features.reduce(
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

  // State for slider ranges
  const [avg_price, setAvgPrice] = useState([ranges.avg_price.min, ranges.avg_price.max]);
  const [total_price, setTotalPrice] = useState([ranges.total_price.min, ranges.total_price.max]);
  const [total_transactions, setTotalTransactions] = useState([ranges.total_transactions.min, ranges.total_transactions.max]);

  // Function to filter counties based on current slider values
  const filteredCounties = geoData.features.filter((feature) => {
    const { avg_price: avg, total_price: total, total_transactions: transactions } = feature.properties;

    return (
      avg >= avg_price[0] &&
      avg <= avg_price[1] &&
      total >= total_price[0] &&
      total <= total_price[1] &&
      transactions >= total_transactions[0] &&
      transactions <= total_transactions[1]
    );
  });

  return (
    <FilteredCountiesContext.Provider
      value={{
        ranges,
        avg_price,
        total_price,
        total_transactions,
        setAvgPrice,
        setTotalPrice,
        setTotalTransactions,
        filteredCounties,
      }}
    >
      {children}
    </FilteredCountiesContext.Provider>
  );
};

export const useFilteredCounties = () => useContext(FilteredCountiesContext);
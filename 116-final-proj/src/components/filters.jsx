import React from "react";
import { useFilteredCounties } from "./utils/filtered_counties"
import TwoHandleSlider from "./utils/slider";

const Filters = () => {
  const {
    ranges,
    avg_price,
    total_price,
    total_transactions,
    setAvgPrice,
    setTotalPrice,
    setTotalTransactions,
    filteredCounties,
  } = useFilteredCounties();

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3>Average Price</h3>
        <TwoHandleSlider
          min={ranges.avg_price.min}
          max={ranges.avg_price.max}
          onChange={(newRange) => setAvgPrice(newRange)}
        />
      </div>

      <div className="mb-4">
        <h3>Total Price</h3>
        <TwoHandleSlider
          min={ranges.total_price.min}
          max={ranges.total_price.max}
          onChange={(newRange) => setTotalPrice(newRange)}
        />
      </div>

      <div className="mb-4">
        <h3>Total Transactions</h3>
        <TwoHandleSlider
          min={ranges.total_transactions.min}
          max={ranges.total_transactions.max}
          onChange={(newRange) => setTotalTransactions(newRange)}
        />
      </div>

      <div className="mt-4">
        <h3>Filtered Counties</h3>
        <ul>
          {filteredCounties.map((feature, index) => (
            <li key={index}>{feature.properties.NAME}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Filters;

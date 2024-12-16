import TwoHandleSlider from "./utils/slider";
import { useState } from "react";
import geoData from './counties_with_real_estate.json';

const Filters = () => {
  const [range1, setRange1] = useState([20, 80]); // Filter 1
  const [range2, setRange2] = useState([30, 70]); // Filter 2
  const [range3, setRange3] = useState([10, 90]); // Filter 3


  const ranges = geoData.features.reduce(
    (acc, feature) => {
      const { avg_price, total_price, total_transactions } = feature.properties;
  
      // Update min and max for avg_price
      acc.avg_price.min = Math.min(acc.avg_price.min, avg_price);
      acc.avg_price.max = Math.max(acc.avg_price.max, avg_price);
  
      // Update min and max for total_price
      acc.total_price.min = Math.min(acc.total_price.min, total_price);
      acc.total_price.max = Math.max(acc.total_price.max, total_price);
  
      // Update min and max for total_transactions
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

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3>Filter 1</h3>
        <TwoHandleSlider
          min={ranges.avg_price.min}
          max={ranges.avg_price.max}
          onChange={(newRange) => setRange1(newRange)}
        />
        {/* <div>Selected range: {range1[0]} - {range1[1]}</div> */}
      </div>

      <div className="mb-4">
        <h3>Filter 2</h3>
        <TwoHandleSlider
          min={0}
          max={100}
          onChange={(newRange) => setRange2(newRange)}
        />
        {/* <div>Selected range: {range2[0]} - {range2[1]}</div> */}
      </div>

      <div className="mb-4">
        <h3>Filter 3</h3>
        <TwoHandleSlider
          min={0}
          max={100}
          onChange={(newRange) => setRange3(newRange)}
        />
        {/* <div>Selected range: {range3[0]} - {range3[1]}</div> */}
      </div>
    </div>
  );
};

export default Filters;

import React, { useState, useRef } from 'react';

const TwoHandleSlider = ({ min = 0, max = 100, onChange }) => {
  const [values, setValues] = useState([min, max]);
  const sliderRef = useRef(null); // Ref for the slider container

  const handleDrag = (index, newValue) => {
    const newValues = [...values];
    if (index === 0 && newValue > values[1]) {
      // Prevent moving min value above max value
      newValue = values[1];
    }
    if (index === 1 && newValue < values[0]) {
      // Prevent moving max value below min value
      newValue = values[0];
    }

    newValues[index] = Math.min(max, Math.max(min, newValue)); // Ensure value is within bounds
    setValues(newValues);
    if (onChange) onChange(newValues);
  };

  const handleMouseDown = (event, index) => {
    const moveHandler = (moveEvent) => {
      if (sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        const newValue =
          min +
          ((moveEvent.clientX - rect.left) / rect.width) * (max - min);

        handleDrag(index, newValue);
      }
    };

    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  };

  return (
    <div ref={sliderRef} className="relative flex items-center">
      <div className="w-full h-2 bg-gray-300 rounded-full relative">
        {/* Track */}
        <div
          className="absolute bg-accent h-2 rounded-full"
          style={{
            left: `${((values[0] - min) / (max - min)) * 100}%`,
            right: `${100 - ((values[1] - min) / (max - min)) * 100}%`,
          }}
        ></div>

        {/* Handle 1 */}
        <div
          className="w-4 h-4 bg-white border border-base-300 rounded-full shadow-lg cursor-pointer absolute -top-1"
          style={{ left: `${((values[0] - min) / (max - min)) * 100}%` }}
          onMouseDown={(e) => handleMouseDown(e, 0)}
        >
          <div className="tooltip w-full h-full overflow-visible" data-tip={values[0].toLocaleString(undefined, { maximumFractionDigits: 0 })}></div>
        </div>

        {/* Handle 2 */}
        <div
          className="w-4 h-4 bg-white border border-base-300 rounded-full shadow-lg cursor-pointer absolute -top-1 -translate-x-1"
          style={{ left: `${((values[1] - min) / (max - min)) * 100}%` }}
          onMouseDown={(e) => handleMouseDown(e, 1)}
        >
          <div className="tooltip w-full h-full overflow-visible" data-tip={values[1].toLocaleString(undefined, { maximumFractionDigits: 0 })}></div>
        </div>
      </div>
    </div>
  );
};

export default TwoHandleSlider;

// components/ui/DoubleSlider.jsx
import React from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

const DoubleSlider = ({ min = 0, max = 10000, step = 100, value, onChange, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <RangeSlider
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={onChange}
        className="custom-range-slider"
      />
      
      {/* Custom styles */}
      <style jsx>{`
        :global(.custom-range-slider) {
          --range-slider-height: 8px;
          --range-slider-bg: #e5e7eb;
          --range-slider-connect-bg: #10b981;
          --range-slider-handle-bg: #ffffff;
          --range-slider-handle-border: 2px solid #10b981;
          --range-slider-handle-width: 20px;
          --range-slider-handle-height: 20px;
          --range-slider-handle-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          --range-slider-handle-shadow-active: 0 4px 8px rgba(16, 185, 129, 0.3);
        }
        
        :global(.custom-range-slider .range-slider__thumb) {
          cursor: pointer;
        }
        
        :global(.custom-range-slider .range-slider__range) {
          border-radius: 4px;
        }
        
        :global(.custom-range-slider .range-slider) {
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default DoubleSlider;
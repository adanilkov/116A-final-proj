// components/utils/map_tooltip.jsx
export default function MapTooltip({ tooltipContent, position }) {
    if (!tooltipContent) return null;
  
    return (
      <div
        className="fixed bg-gray-800 text-white p-2 rounded shadow-lg z-50 pointer-events-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -100%)", // Adjust position relative to cursor
        }}
      >
        {tooltipContent}
      </div>
    );
  }
  
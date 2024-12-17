export default function MapTooltip({ tooltipContent, position }) {
  if (!tooltipContent) return null;
  
  // Function to format currency with commas and 2 decimal places
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Function to format large numbers with commas
  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  return (
    <div
      className="fixed bg-gray-800 text-white p-3 rounded-lg shadow-lg z-50 pointer-events-none min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <h3 className="font-bold text-lg mb-2">{tooltipContent.name}</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Avg Price:</span>
          <span className="font-medium">{formatPrice(tooltipContent.avg_price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Total Value:</span>
          <span className="font-medium">{formatPrice(tooltipContent.total_price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Transactions:</span>
          <span className="font-medium">{formatNumber(tooltipContent.total_transactions)}</span>
        </div>
      </div>
    </div>
  );
}
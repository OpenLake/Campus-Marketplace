import {
  TrendingDown,
  TrendingUp,
  Minus,
  Calendar,
  IndianRupee,
} from "lucide-react";

/**
 * Format date to readable string
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * PriceHistory Component
 * Displays price change history for a listing
 */
const PriceHistory = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-500 text-sm">No price changes yet</p>
      </div>
    );
  }

  const getPriceChange = (current, previous) => {
    if (!previous) return null;
    const change = current - previous;
    const percentChange = ((change / previous) * 100).toFixed(1);
    return { change, percentChange };
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Price History
      </h3>

      <div className="space-y-2">
        {history.map((entry, index) => {
          const previousPrice =
            index < history.length - 1 ? history[index + 1].price : null;
          const priceChange = getPriceChange(entry.price, previousPrice);

          return (
            <div
              key={entry._id || index}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    !priceChange
                      ? "bg-blue-100"
                      : priceChange.change > 0
                      ? "bg-red-100"
                      : priceChange.change < 0
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  {!priceChange ? (
                    <Minus className="h-5 w-5 text-blue-600" />
                  ) : priceChange.change > 0 ? (
                    <TrendingUp className="h-5 w-5 text-red-600" />
                  ) : priceChange.change < 0 ? (
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  ) : (
                    <Minus className="h-5 w-5 text-gray-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-gray-600" />
                    <span className="text-lg font-bold text-gray-900">
                      {entry.price.toLocaleString()}
                    </span>
                    {priceChange && (
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          priceChange.change > 0
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {priceChange.change > 0 ? "+" : ""}
                        {priceChange.percentChange}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(entry.changedAt)}</span>
                  </div>
                </div>
              </div>

              {priceChange && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Changed by</p>
                  <p
                    className={`text-sm font-semibold ${
                      priceChange.change > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {priceChange.change > 0 ? "+" : ""}₹
                    {Math.abs(priceChange.change).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceHistory;

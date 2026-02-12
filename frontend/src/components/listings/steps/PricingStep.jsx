import { IndianRupee, Tag, Percent } from "lucide-react";

const PricingStep = ({ formData, errors, onChange }) => {
  const handlePriceChange = (e) => {
    let value = e.target.value;
    if (value === "") {
      value = undefined;
    } else {
      value = parseFloat(value);
      if (isNaN(value)) value = undefined;
    }
    onChange({ target: { name: e.target.name, value } });
  };

  return (
    <div className="space-y-6">
      {/* Price */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Price <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="price"
          value={formData.price ?? ""}
          onChange={handlePriceChange}
          placeholder="Enter price"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500 font-medium ${
            errors.price ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price}</p>
        )}
      </div>

      {/* Original Price */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Original Price
        </label>
        <input
          type="number"
          name="originalPrice"
          value={formData.originalPrice ?? ""}
          onChange={handlePriceChange}
          placeholder="(Optional) Retail price"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500 font-medium ${
            errors.originalPrice
              ? "border-red-300 bg-red-50"
              : "border-gray-300"
          }`}
        />
        {errors.originalPrice && (
          <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>
        )}
      </div>

      {/* Discount Badge */}
      {formData.originalPrice > 0 &&
        formData.price > 0 &&
        formData.originalPrice > formData.price && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Percent className="h-5 w-5" />
              <span className="font-semibold">
                {Math.round(
                  ((formData.originalPrice - formData.price) /
                    formData.originalPrice) *
                    100
                )}
                % OFF
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Save ₹{(formData.originalPrice - formData.price).toLocaleString()}
            </p>
          </div>
        )}

      {/* Negotiable */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Negotiable
        </label>
        <select
          name="negotiable"
          value={formData.negotiable ? "true" : "false"}
          onChange={(e) =>
            onChange({
              target: { name: "negotiable", value: e.target.value === "true" },
            })
          }
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 font-medium border-gray-300"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      {/* Pricing Tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-2">
          💡 Pricing Tips:
        </p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Research similar items to set competitive prices</li>
          <li>• Consider item condition when pricing</li>
          <li>• Slightly higher prices give room for negotiation</li>
          <li>• Bundle items for better deals</li>
        </ul>
      </div>
    </div>
  );
};

export default PricingStep;

import { Package, FileText } from "lucide-react";

const BasicInfoStep = ({ formData, errors, onChange }) => {
  const categories = [
    { value: "electronics", label: "Electronics", icon: "📱" },
    { value: "books", label: "Books", icon: "📚" },
    { value: "furniture", label: "Furniture", icon: "🪑" },
    { value: "clothing", label: "Clothing", icon: "👕" },
    { value: "stationery", label: "Stationery", icon: "✏️" },
    { value: "sports", label: "Sports", icon: "⚽" },
    { value: "other", label: "Other", icon: "📦" },
  ];

  const conditions = [
    {
      value: "brand-new",
      label: "Brand New",
      description: "Never used, in original packaging",
    },
    {
      value: "like-new",
      label: "Like New",
      description: "Barely used, excellent condition",
    },
    { value: "good", label: "Good", description: "Used but well maintained" },
    { value: "fair", label: "Fair", description: "Shows signs of wear" },
    {
      value: "poor",
      label: "Poor",
      description: "Significant wear, may need repairs",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Listing Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="e.g., iPhone 13 Pro Max 256GB"
            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500 font-medium ${
              errors.title ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          />
        </div>
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.title.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Describe your item, condition, and any extras..."
            rows={4}
            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500 font-medium resize-none ${
              errors.description
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
          />
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.description.length}/1000 characters
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() =>
                onChange({ target: { name: "category", value: cat.value } })
              }
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.category === cat.value
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl block mb-1">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-700">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Condition <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {conditions.map((cond) => (
            <label
              key={cond.value}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.condition === cond.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="condition"
                value={cond.value}
                checked={formData.condition === cond.value}
                onChange={onChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">{cond.label}</p>
                <p className="text-sm text-gray-500">{cond.description}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.condition && (
          <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
        )}
      </div>
    </div>
  );
};

export default BasicInfoStep;

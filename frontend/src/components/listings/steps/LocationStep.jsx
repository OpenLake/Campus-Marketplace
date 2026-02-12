import { MapPin, Home, Hash, FileText } from "lucide-react";

const LocationStep = ({ formData, errors, onChange }) => {
  const hostels = [
    "Hostel A",
    "Hostel B",
    "Hostel C",
    "Hostel D",
    "Off-Campus",
    "Faculty Housing",
  ];

  return (
    <div className="space-y-6">
      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={onChange}
          placeholder="e.g., Hostel Name, Block, Room"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500 font-medium ${
            errors.location ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location}</p>
        )}
      </div>

      {/* Hostel */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Hostel
        </label>
        <input
          type="text"
          name="hostel"
          value={formData.hostel}
          onChange={onChange}
          placeholder="(Optional) Hostel name"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500 font-medium border-gray-300"
        />
      </div>

      {/* Room Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Room Number
        </label>
        <input
          type="text"
          name="roomNumber"
          value={formData.roomNumber}
          onChange={onChange}
          placeholder="(Optional) Room number"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500 font-medium border-gray-300"
        />
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Additional Notes
        </label>
        <textarea
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={onChange}
          placeholder="Any extra info..."
          rows={3}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder-gray-500 font-medium resize-none border-gray-300"
        />
      </div>

      {/* Pickup Info */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm font-medium text-green-900 mb-2">
          ✓ Pickup Information:
        </p>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Be specific about pickup location</li>
          <li>• Mention available times if needed</li>
          <li>• Ensure the location is safe and accessible</li>
          <li>• Consider meeting in public areas</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationStep;

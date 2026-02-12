import ImageUpload from "../ImageUpload.jsx";

const ImageStep = ({ formData, errors, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Images
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          Add clear, well-lit photos of your item. First image will be the cover
          photo.
        </p>

        <ImageUpload
          images={formData.images}
          onChange={(images) =>
            onChange({ target: { name: "images", value: images } })
          }
          error={errors.images}
          maxImages={5}
        />
      </div>

      {/* Image Guidelines */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm font-medium text-yellow-900 mb-2">
          📸 Photo Guidelines:
        </p>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Use good lighting and clear focus</li>
          <li>• Show item from multiple angles</li>
          <li>• Include any defects or wear</li>
          <li>• Avoid filters or heavy editing</li>
          <li>• Keep background clean and simple</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageStep;

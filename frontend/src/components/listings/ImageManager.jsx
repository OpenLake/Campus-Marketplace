import { useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Trash2, Star } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

/**
 * ImageManager Component
 * Manages existing and new images for editing listings
 */
const ImageManager = ({
  existingImages = [],
  newImages = [],
  onExistingImagesChange,
  onNewImagesChange,
  onDeleteExisting,
  error,
  maxImages = 5,
}) => {
  const [deletingIndex, setDeletingIndex] = useState(null);

  const totalImages = existingImages.length + newImages.length;

  /**
   * Handle new file drop/selection
   */
  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((file) => {
        file.errors.forEach((err) => {
          if (err.code === 'file-too-large') {
            toast.error(`${file.file.name}: File is too large (max 5MB)`);
          } else if (err.code === 'file-invalid-type') {
            toast.error(`${file.file.name}: Invalid file type`);
          } else {
            toast.error(`${file.file.name}: ${err.message}`);
          }
        });
      });
    }

    if (totalImages + acceptedFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImageObjects = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    onNewImagesChange([...newImages, ...newImageObjects]);
    toast.success(`${acceptedFiles.length} image(s) added`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5 * 1024 * 1024,
    disabled: totalImages >= maxImages,
  });

  /**
   * Remove new image
   */
  const removeNewImage = (indexToRemove) => {
    const filtered = newImages.filter((_, index) => index !== indexToRemove);
    onNewImagesChange(filtered);
    toast.success('Image removed');
  };

  /**
   * Delete existing image
   */
  const handleDeleteExisting = async (index) => {
    setDeletingIndex(index);
    try {
      await onDeleteExisting(index);
      toast.success('Image deleted successfully');
    } catch (error) {
      toast.error('Failed to delete image');
    } finally {
      setDeletingIndex(null);
    }
  };

  /**
   * Set as cover image
   */
  const setCoverImage = (index, isExisting) => {
    if (isExisting) {
      const reordered = [...existingImages];
      const [cover] = reordered.splice(index, 1);
      reordered.unshift(cover);
      onExistingImagesChange(reordered);
    } else {
      const reordered = [...newImages];
      const [cover] = reordered.splice(index, 1);
      reordered.unshift(cover);
      onNewImagesChange(reordered);
    }
    toast.success('Cover image updated');
  };

  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">
            Current Images ({existingImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {existingImages.map((imageUrl, index) => (
              <div
                key={`existing-${index}`}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all"
              >
                <img
                  src={imageUrl}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Cover Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Cover
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => setCoverImage(index, true)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                      title="Set as cover"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteExisting(index)}
                    disabled={deletingIndex === index}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors disabled:opacity-50"
                    title="Delete image"
                  >
                    {deletingIndex === index ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images */}
      {newImages.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">
            New Images ({newImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {newImages.map((image, index) => (
              <div
                key={image.id}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-green-200 hover:border-green-500 transition-all"
              >
                <img
                  src={image.preview}
                  alt={`New ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* New Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                  New
                </div>

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCoverImage(index, false)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                    title="Set as cover"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {totalImages < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isDragActive ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <Upload
                className={`h-8 w-8 ${isDragActive ? 'text-blue-600' : 'text-gray-400'}`}
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                {isDragActive ? 'Drop images here' : 'Add more images'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {totalImages} / {maxImages} images • Max 5MB each
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-2">💡 Image Tips:</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• First image will be used as the cover photo</li>
          <li>• Click star icon to change cover image</li>
          <li>• Delete unwanted images before saving</li>
          <li>• New images will be uploaded when you save changes</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageManager;
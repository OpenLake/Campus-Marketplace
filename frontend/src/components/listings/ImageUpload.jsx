import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * ImageUpload Component
 * Drag & drop image upload with preview, reorder, and delete
 */
const ImageUpload = ({ images, onChange, error, maxImages = 5 }) => {
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Handle file drop/selection
   */
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
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

      // Check total images limit
      if (images.length + acceptedFiles.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      // Add new images with preview
      const newImages = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
      }));

      onChange([...images, ...newImages]);
      toast.success(`${acceptedFiles.length} image(s) added`);
    },
    [images, onChange, maxImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: maxImages,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  /**
   * Remove image
   */
  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onChange(newImages);
    toast.success('Image removed');
  };

  /**
   * Reorder images
   */
  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive || isDragging
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
              {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse • Max {maxImages} images • Max 5MB each
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supported formats: JPEG, PNG, WebP
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              {images.length} / {maxImages} images uploaded
            </p>
            <p className="text-xs text-gray-500">Drag to reorder • First image is cover</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id || index}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('imageIndex', index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('imageIndex'));
                  moveImage(fromIndex, index);
                }}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all cursor-move"
              >
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Cover Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                    Cover
                  </div>
                )}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !error && (
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, History, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import listingService from '../../services/listingService.js';
import { stepSchemas } from '../../schemas/listingSchema.js';
import FormProgress from '../../components/listings/FormProgress.jsx';
import BasicInfoStep from '../../components/listings/steps/BasicInfoStep.jsx';
import PricingStep from '../../components/listings/steps/PricingStep.jsx';
import LocationStep from '../../components/listings/steps/LocationStep.jsx';
import ImageManager from '../../components/listings/ImageManager.jsx';
import PriceHistory from '../../components/listings/PriceHistory.jsx';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

/**
 * EditListing Page
 * Multi-step form for editing existing listings
 */
const EditListing = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [originalListing, setOriginalListing] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    price: 0,
    originalPrice: null,
    negotiable: true,
    existingImages: [],
    newImages: [],
    location: '',
    hostel: '',
    roomNumber: '',
    additionalNotes: '',
  });

  const [errors, setErrors] = useState({});

  // Form Steps
  const steps = [
    { title: 'Basic Info', component: BasicInfoStep },
    { title: 'Pricing', component: PricingStep },
    { title: 'Images', component: null }, // Custom component
    { title: 'Location', component: LocationStep },
  ];

  /**
   * Fetch listing data on mount
   */
  useEffect(() => {
    fetchListingData();
  }, [id]);

  /**
   * Fetch listing and verify ownership
   */
  const fetchListingData = async () => {
    try {
      setLoading(true);
      
      // Fetch listing details
      const response = await listingService.getListingForEdit(id);
      const listing = response.data.data;

      // Verify ownership
      if (listing.seller._id !== user?._id && !user?.roles?.includes('admin')) {
        toast.error('You do not have permission to edit this listing');
        navigate('/my-listings');
        return;
      }

      setOriginalListing(listing);

      // Populate form with existing data
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        category: listing.category || '',
        condition: listing.condition || '',
        price: listing.price || 0,
        originalPrice: listing.originalPrice || null,
        negotiable: listing.negotiable ?? true,
        existingImages: listing.images || [],
        newImages: [],
        location: listing.location || '',
        hostel: listing.hostel || '',
        roomNumber: listing.roomNumber || '',
        additionalNotes: listing.additionalNotes || '',
      });

      // Fetch price history
      try {
        const historyResponse = await listingService.getPriceHistory(id);
        setPriceHistory(historyResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching price history:', error);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast.error('Failed to load listing');
      navigate('/my-listings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  /**
   * Validate current step
   */
  const validateStep = () => {
    try {
      const currentSchema = stepSchemas[currentStep];
      let dataToValidate = {};

      if (currentStep === 0) {
        dataToValidate = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
        };
      } else if (currentStep === 1) {
        dataToValidate = {
          price: formData.price,
          originalPrice: formData.originalPrice,
          negotiable: formData.negotiable,
        };
      } else if (currentStep === 2) {
        // Image validation
        const totalImages = formData.existingImages.length + formData.newImages.length;
        if (totalImages === 0) {
          setErrors({ images: 'At least one image is required' });
          toast.error('Please add at least one image');
          return false;
        }
        return true;
      } else if (currentStep === 3) {
        dataToValidate = {
          location: formData.location,
          hostel: formData.hostel,
          roomNumber: formData.roomNumber,
          additionalNotes: formData.additionalNotes,
        };
      }

      currentSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      if (error.issues) {
        error.issues.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
      } else if (error.errors) {
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
      }
      setErrors(newErrors);
      toast.error('Please fix the errors before continuing');
      return false;
    }
  };

  /**
   * Handle next step
   */
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Handle previous step
   */
  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Delete existing image
   */
  const handleDeleteExistingImage = async (index) => {
    const imageUrl = formData.existingImages[index];
    await listingService.deleteListingImage(id, imageUrl);
    
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  /**
   * Upload new images
   */
  const uploadNewImages = async () => {
    const uploadedUrls = [];

    for (const image of formData.newImages) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('image', image.file);

        const response = await listingService.uploadImage(formDataToSend);
        uploadedUrls.push(response.data.data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload images');
      }
    }

    return uploadedUrls;
  };

  /**
   * Handle submit
   */
  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setIsSubmitting(true);

      // Upload new images if any
      let newImageUrls = [];
      if (formData.newImages.length > 0) {
        toast.loading('Uploading new images...');
        newImageUrls = await uploadNewImages();
      }

      // Combine existing and new images
      const allImages = [...formData.existingImages, ...newImageUrls];

      // Prepare update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price: formData.price,
        originalPrice: formData.originalPrice,
        negotiable: formData.negotiable,
        images: allImages,
        location: formData.location,
        hostel: formData.hostel,
        roomNumber: formData.roomNumber,
        additionalNotes: formData.additionalNotes,
      };

      // Update listing
      toast.dismiss();
      toast.loading('Updating listing...');
      await listingService.updateListing(id, updateData);

      toast.dismiss();
      toast.success('Listing updated successfully!');
      navigate(`/listings/${id}`);
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check if data has changed
   */
  const hasChanges = () => {
    if (!originalListing) return false;

    return (
      formData.title !== originalListing.title ||
      formData.description !== originalListing.description ||
      formData.category !== originalListing.category ||
      formData.condition !== originalListing.condition ||
      formData.price !== originalListing.price ||
      formData.originalPrice !== originalListing.originalPrice ||
      formData.negotiable !== originalListing.negotiable ||
      formData.existingImages.length !== originalListing.images.length ||
      formData.newImages.length > 0 ||
      formData.location !== originalListing.location ||
      formData.hostel !== originalListing.hostel ||
      formData.roomNumber !== originalListing.roomNumber ||
      formData.additionalNotes !== (originalListing.additionalNotes || '')
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  // Current Step Component
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
              <p className="text-gray-600 mt-2">
                Update your listing details and manage images
              </p>
            </div>
            {priceHistory.length > 0 && (
              <button
                onClick={() => setShowPriceHistory(!showPriceHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                <History className="h-5 w-5" />
                Price History
              </button>
            )}
          </div>
        </div>

        {/* Changes Warning */}
        {hasChanges() && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Unsaved Changes</p>
              <p className="text-sm text-yellow-800 mt-1">
                You have unsaved changes. Make sure to save before leaving.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
              {/* Progress Indicator */}
              <FormProgress currentStep={currentStep} steps={steps} />

              {/* Step Content */}
              <div className="mt-8">
                {currentStep === 2 ? (
                  <ImageManager
                    existingImages={formData.existingImages}
                    newImages={formData.newImages}
                    onExistingImagesChange={(images) =>
                      setFormData((prev) => ({ ...prev, existingImages: images }))
                    }
                    onNewImagesChange={(images) =>
                      setFormData((prev) => ({ ...prev, newImages: images }))
                    }
                    onDeleteExisting={handleDeleteExistingImage}
                    error={errors.images}
                    maxImages={5}
                  />
                ) : (
                  <CurrentStepComponent
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                <div>
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      onClick={handlePrevious}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ArrowLeft className="h-5 w-5 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !hasChanges()}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-5 w-5" />
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price History Panel */}
            {showPriceHistory && priceHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-4">
                <PriceHistory history={priceHistory} />
              </div>
            )}

            {/* Info Panel */}
            {!showPriceHistory && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Editing Tips
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Update your listing to attract more buyers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Add clear, high-quality images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Price changes are tracked in history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Detailed descriptions increase visibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Keep location information up to date</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditListing;
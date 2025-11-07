import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Send, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import listingService from "../../services/listingService.js";
import { stepSchemas } from "../../schemas/listingSchema.js";
import FormProgress from "../../components/listings/FormProgress.jsx";
import BasicInfoStep from "../../components/listings/steps/BasicInfoStep.jsx";
import PricingStep from "../../components/listings/steps/PricingStep.jsx";
import ImageStep from "../../components/listings/steps/ImageStep.jsx";
import LocationStep from "../../components/listings/steps/LocationStep.jsx";
import Button from "../../components/ui/Button.jsx";
import toast from "react-hot-toast";

/**
 * CreateListing Page
 * Multi-step form wizard for creating new listings
 */
const CreateListing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: "",
    description: "",
    category: "",
    condition: "",
    // Step 2: Pricing
    price: 0,
    originalPrice: null,
    negotiable: true,
    // Step 3: Images
    images: [],
    // Step 4: Location
    location: "",
    hostel: "",
    roomNumber: "",
    additionalNotes: "",
  });

  const [errors, setErrors] = useState({});

  // Form Steps Configuration
  const steps = [
    { title: "Basic Info", component: BasicInfoStep },
    { title: "Pricing", component: PricingStep },
    { title: "Images", component: ImageStep },
    { title: "Location", component: LocationStep },
  ];

  // Check if user has permission to create listings
  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.error("Please login to create a listing");
      navigate("/login", { state: { from: "/listings/create" } });
      return;
    }

    // Check if user has required roles (student, vendor-admin, club-admin)
    const canCreateListing = user.roles?.some((role) =>
      ["student", "vendor-admin", "club-admin", "admin"].includes(role)
    );

    if (!canCreateListing) {
      toast.error("You do not have permission to create listings");
      navigate("/");
    }
  }, [user, navigate]);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
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

      // Extract only the fields relevant to current step
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
        dataToValidate = {
          images: formData.images,
        };
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
      console.error("Validation error:", error);
      const newErrors = {};

      // Handle Zod validation errors
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
      } else if (error.issues && Array.isArray(error.issues)) {
        // Zod uses 'issues' property
        error.issues.forEach((issue) => {
          newErrors[issue.path[0]] = issue.message;
        });
      } else {
        // Generic error handling
        toast.error("Validation failed. Please check your inputs.");
        return false;
      }

      setErrors(newErrors);
      toast.error("Please fix the errors before continuing");
      return false;
    }
  };

  /**
   * Handle next step
   */
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /**
   * Handle previous step
   */
  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Upload images to server
   */
  const uploadImages = async () => {
    const uploadedUrls = [];

    for (const image of formData.images) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("image", image.file);

        const response = await listingService.uploadImage(formDataToSend);
        // FIX: Use response.data.data.url for Cloudinary image URL
        uploadedUrls.push(response.data.data.url);
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Failed to upload images");
      }
    }

    return uploadedUrls;
  };

  /**
   * Handle final submit
   */
  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setIsSubmitting(true);

      // Upload images first
      toast.loading("Uploading images...");
      const imageUrls = await uploadImages();

      // Prepare listing data
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price: formData.price,
        originalPrice: formData.originalPrice,
        negotiable: formData.negotiable,
        images: imageUrls,
        location: formData.location,
        hostel: formData.hostel,
        roomNumber: formData.roomNumber,
        additionalNotes: formData.additionalNotes,
        status: "active",
        isAvailable: true,
      };

      // Create listing
      toast.dismiss();
      toast.loading("Creating listing...");
      const createdListing = await listingService.createListing(listingData);

      toast.dismiss();
      toast.success("Listing created successfully!");

      // Navigate to the created listing or browse listings
      navigate("/listings");
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle save as draft
   */
  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);

      // Upload images if any
      let imageUrls = [];
      if (formData.images.length > 0) {
        toast.loading("Saving draft...");
        imageUrls = await uploadImages();
      }

      // Prepare draft data
      const draftData = {
        ...formData,
        images: imageUrls,
        status: "draft",
        isAvailable: false,
      };

      // Save draft
      await listingService.createListing(draftData);

      toast.dismiss();
      toast.success("Draft saved successfully!");
      navigate("/my-listings?tab=drafts");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Current Step Component
  const CurrentStepComponent = steps[currentStep].component;

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated or doesn't have permission
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check if user has required roles
  const canCreateListing = user.roles?.some((role) =>
    ["student", "vendor-admin", "club-admin", "admin"].includes(role)
  );

  if (!canCreateListing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            You don't have permission to create listings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-700 hover:text-primary-900 font-semibold mb-4 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Listing
          </h1>
          <p className="text-gray-700 mt-2">
            Fill in the details to create your listing. All required fields are
            marked with <span className="text-red-500">*</span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          {/* Progress Indicator */}
          <FormProgress currentStep={currentStep} steps={steps} />

          {/* Step Content */}
          <div className="mt-8">
            <CurrentStepComponent
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div>
              {currentStep > 0 && (
                <Button
                  type="button"
                  onClick={handlePrevious}
                  variant="outline"
                  className="flex items-center gap-2 text-primary-700 border-primary-300 hover:bg-primary-50 font-semibold px-4 py-2 rounded-lg"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Save Draft Button */}
              {currentStep === steps.length - 1 && (
                <Button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  variant="secondary"
                  className="flex items-center gap-2 bg-yellow-500 text-white hover:bg-yellow-600 font-semibold px-4 py-2 rounded-lg"
                >
                  <Save className="h-5 w-5" />
                  {isSavingDraft ? "Saving..." : "Save as Draft"}
                </Button>
              )}

              {/* Next/Submit Button */}
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 font-semibold px-4 py-2 rounded-lg"
                >
                  Next
                  <ArrowRight className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSavingDraft}
                  className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 font-semibold px-4 py-2 rounded-lg"
                >
                  <Send className="h-5 w-5" />
                  {isSubmitting ? "Creating..." : "Create Listing"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;

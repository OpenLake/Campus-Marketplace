import { z } from 'zod';

/**
 * Listing Form Validation Schema
 * Multi-step form validation with Zod
 */

// Step 1: Basic Information
export const basicInfoSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  category: z.string().min(1, 'Please select a category'),
  condition: z.enum(['brand-new', 'like-new', 'good', 'fair', 'poor'], {
    errorMap: () => ({ message: 'Please select a condition' }),
  }),
});

// Step 2: Pricing Details
export const pricingSchema = z.object({
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price must be positive')
    .max(1000000, 'Price seems unrealistic'),
  originalPrice: z
    .number({ invalid_type_error: 'Original price must be a number' })
    .min(0, 'Original price must be positive')
    .optional()
    .nullable(),
  negotiable: z.boolean().default(true),
});

// Step 3: Images (handled separately with File validation)
export const imagesSchema = z.object({
  images: z
    .array(
      z.object({
        file: z.instanceof(File, { message: 'Invalid file type' }),
        preview: z.string(),
      })
    )
    .min(1, 'At least one image is required')
    .max(5, 'Maximum 5 images allowed'),
});

// Step 4: Location & Additional Info
export const locationSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  hostel: z.string().optional(),
  roomNumber: z.string().optional(),
  additionalNotes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
});

// Complete Listing Schema (all steps combined)
export const createListingSchema = basicInfoSchema
  .merge(pricingSchema)
  .merge(imagesSchema)
  .merge(locationSchema);

// Export individual step schemas
export const stepSchemas = [
  basicInfoSchema,
  pricingSchema,
  imagesSchema,
  locationSchema,
];

export default createListingSchema;
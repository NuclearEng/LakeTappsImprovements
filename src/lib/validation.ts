import { z } from 'zod';

// Pierce County parcel number format: 10 digits (e.g., 0420062001)
const parcelNumberRegex = /^\d{10}$/;

// Phone number regex (flexible US format)
const phoneRegex = /^(\+1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

// US Zip code regex
const zipCodeRegex = /^\d{5}(-\d{4})?$/;

// ============================================
// Property Owner Schema
// ============================================
export const propertyOwnerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Please enter a valid phone number (e.g., (253) 555-1234)'),
  address: z.string().min(1, 'Address is required').max(200, 'Address is too long'),
  city: z.string().min(1, 'City is required').max(100, 'City is too long'),
  state: z.string().length(2, 'State must be 2 characters'),
  zip: z.string().regex(zipCodeRegex, 'Please enter a valid ZIP code (e.g., 98391 or 98391-1234)'),
  parcelNumber: z
    .string()
    .min(1, 'Parcel number is required')
    .regex(parcelNumberRegex, 'Pierce County parcel numbers are 10 digits (e.g., 0420062001)'),
  isAgent: z.boolean(),
  agentAuthorization: z.string().optional(),
});

// Conditional validation for agent authorization
export const propertyOwnerSchemaRefined = propertyOwnerSchema.refine(
  (data) => {
    if (data.isAgent) {
      return data.agentAuthorization && data.agentAuthorization.length > 0;
    }
    return true;
  },
  {
    message: 'Agent authorization documentation is required when acting as an agent',
    path: ['agentAuthorization'],
  }
);

// ============================================
// Project Details Schema
// ============================================
export const projectDetailsSchema = z.object({
  category: z.enum(['new_construction', 'modification']),
  improvementTypes: z
    .array(
      z.enum([
        'dock',
        'pier',
        'float',
        'boat_lift',
        'boat_ramp',
        'boathouse',
        'bulkhead',
        'mooring_pile',
        'swim_float',
        'other',
      ])
    )
    .min(1, 'Please select at least one improvement type'),
  description: z
    .string()
    .min(10, 'Please provide a more detailed description (at least 10 characters)')
    .max(2000, 'Description is too long'),
  estimatedCost: z
    .number()
    .min(0, 'Estimated cost cannot be negative')
    .max(10000000, 'Please verify the estimated cost'),
  startDate: z.string().min(1, 'Start date is required'),
  completionDate: z.string().min(1, 'Estimated completion date is required'),
  inWater: z.boolean(),
  belowHighWaterLine: z.boolean(),
  withinShorelineJurisdiction: z.boolean(),
  existingStructure: z.boolean(),
  existingStructureDescription: z.string().optional(),
});

// Date validation refinement
export const projectDetailsSchemaRefined = projectDetailsSchema
  .refine(
    (data) => {
      if (data.startDate && data.completionDate) {
        return new Date(data.completionDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'Completion date must be after start date',
      path: ['completionDate'],
    }
  )
  .refine(
    (data) => {
      if (data.existingStructure) {
        return data.existingStructureDescription && data.existingStructureDescription.length > 0;
      }
      return true;
    },
    {
      message: 'Please describe the existing structure',
      path: ['existingStructureDescription'],
    }
  );

// ============================================
// Site Information Schema
// ============================================
export const siteInformationSchema = z.object({
  propertyAddress: z.string().min(1, 'Property address is required'),
  lakeAddress: z.string().optional(),
  parcelNumber: z
    .string()
    .min(1, 'Parcel number is required')
    .regex(parcelNumberRegex, 'Pierce County parcel numbers are 10 digits'),
  elevation: z
    .number()
    .min(0, 'Elevation cannot be negative')
    .max(1000, 'Please verify the elevation'),
  lotSize: z.string().min(1, 'Lot size is required'),
  waterFrontage: z.string().min(1, 'Water frontage is required'),
  sitePlanFiles: z.array(z.any()).default([]),
  additionalDocuments: z.array(z.any()).default([]),
});

// ============================================
// Insurance Information Schema
// ============================================
export const insuranceInfoSchema = z.object({
  hasInsurance: z.boolean(),
  provider: z.string().optional(),
  policyNumber: z.string().optional(),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
  coverageAmount: z.number().optional(),
  additionalInsuredAdded: z.boolean().optional(),
  certificateFile: z.any().optional(),
});

// Conditional validation when insurance is required
export const insuranceInfoSchemaRefined = insuranceInfoSchema.refine(
  (data) => {
    if (data.hasInsurance) {
      return (
        data.provider &&
        data.provider.length > 0 &&
        data.policyNumber &&
        data.policyNumber.length > 0
      );
    }
    return true;
  },
  {
    message: 'Insurance provider and policy number are required when you have insurance',
    path: ['provider'],
  }
);

// ============================================
// Validation Helper Functions
// ============================================
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  fieldErrors?: z.ZodIssue[];
};

export function validatePropertyOwner(data: unknown): ValidationResult<z.infer<typeof propertyOwnerSchemaRefined>> {
  const result = propertyOwnerSchemaRefined.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error),
    fieldErrors: result.error.issues,
  };
}

export function validateProjectDetails(data: unknown): ValidationResult<z.infer<typeof projectDetailsSchemaRefined>> {
  const result = projectDetailsSchemaRefined.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error),
    fieldErrors: result.error.issues,
  };
}

export function validateSiteInformation(data: unknown): ValidationResult<z.infer<typeof siteInformationSchema>> {
  const result = siteInformationSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error),
    fieldErrors: result.error.issues,
  };
}

export function validateInsuranceInfo(data: unknown): ValidationResult<z.infer<typeof insuranceInfoSchemaRefined>> {
  const result = insuranceInfoSchemaRefined.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error),
    fieldErrors: result.error.issues,
  };
}

// Format Zod errors into a simple key-value object
function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });
  return errors;
}

// ============================================
// Stage Completion Checkers
// ============================================
export interface StageCompletionResult {
  isComplete: boolean;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
  percentComplete: number;
}

export function checkPropertyOwnerCompletion(owner: unknown): StageCompletionResult {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'parcelNumber'];
  const data = owner as Record<string, unknown>;

  const missingFields: string[] = [];
  let completedFields = 0;

  requiredFields.forEach((field) => {
    const value = data?.[field];
    if (value && String(value).trim().length > 0) {
      completedFields++;
    } else {
      missingFields.push(formatFieldName(field));
    }
  });

  // Check agent authorization if isAgent is true
  if (data?.isAgent && (!data?.agentAuthorization || String(data.agentAuthorization).trim().length === 0)) {
    missingFields.push('Agent Authorization');
  } else if (data?.isAgent) {
    completedFields++;
  }

  const totalFields = data?.isAgent ? requiredFields.length + 1 : requiredFields.length;

  return {
    isComplete: missingFields.length === 0,
    completedFields,
    totalFields,
    missingFields,
    percentComplete: Math.round((completedFields / totalFields) * 100),
  };
}

export function checkProjectDetailsCompletion(details: unknown): StageCompletionResult {
  const requiredFields = ['category', 'description', 'startDate', 'completionDate'];
  const data = details as Record<string, unknown>;

  const missingFields: string[] = [];
  let completedFields = 0;

  requiredFields.forEach((field) => {
    const value = data?.[field];
    if (value && String(value).trim().length > 0) {
      completedFields++;
    } else {
      missingFields.push(formatFieldName(field));
    }
  });

  // Check improvement types
  const improvementTypes = data?.improvementTypes as unknown[] | undefined;
  if (improvementTypes && improvementTypes.length > 0) {
    completedFields++;
  } else {
    missingFields.push('Improvement Types');
  }

  // Check existing structure description if applicable
  if (data?.existingStructure && (!data?.existingStructureDescription || String(data.existingStructureDescription).trim().length === 0)) {
    missingFields.push('Existing Structure Description');
  }

  const totalFields = requiredFields.length + 1; // +1 for improvementTypes

  return {
    isComplete: missingFields.length === 0,
    completedFields,
    totalFields,
    missingFields,
    percentComplete: Math.round((completedFields / totalFields) * 100),
  };
}

export function checkSiteInformationCompletion(site: unknown): StageCompletionResult {
  const requiredFields = ['propertyAddress', 'parcelNumber', 'lotSize', 'waterFrontage'];
  const data = site as Record<string, unknown>;

  const missingFields: string[] = [];
  let completedFields = 0;

  requiredFields.forEach((field) => {
    const value = data?.[field];
    if (value && String(value).trim().length > 0) {
      completedFields++;
    } else {
      missingFields.push(formatFieldName(field));
    }
  });

  const totalFields = requiredFields.length;

  return {
    isComplete: missingFields.length === 0,
    completedFields,
    totalFields,
    missingFields,
    percentComplete: Math.round((completedFields / totalFields) * 100),
  };
}

export function checkInsuranceCompletion(insurance: unknown): StageCompletionResult {
  const data = insurance as Record<string, unknown>;

  // Insurance is optional, but if hasInsurance is true, we need provider and policy
  if (!data?.hasInsurance) {
    return {
      isComplete: true,
      completedFields: 1,
      totalFields: 1,
      missingFields: [],
      percentComplete: 100,
    };
  }

  const requiredFields = ['provider', 'policyNumber'];
  const missingFields: string[] = [];
  let completedFields = 0;

  requiredFields.forEach((field) => {
    const value = data?.[field];
    if (value && String(value).trim().length > 0) {
      completedFields++;
    } else {
      missingFields.push(formatFieldName(field));
    }
  });

  return {
    isComplete: missingFields.length === 0,
    completedFields,
    totalFields: requiredFields.length,
    missingFields,
    percentComplete: Math.round((completedFields / requiredFields.length) * 100),
  };
}

// Helper to format field names for display
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// ============================================
// Real-time Field Validation
// ============================================
export function validateField(
  schema: z.ZodObject<z.ZodRawShape>,
  fieldName: string,
  value: unknown
): string | null {
  try {
    const fieldSchema = schema.shape[fieldName];
    if (!fieldSchema) return null;

    // Use safeParse instead of parse
    const result = (fieldSchema as z.ZodType).safeParse(value);
    if (result.success) {
      return null;
    }
    return result.error.issues[0]?.message || 'Invalid value';
  } catch {
    return 'Validation error';
  }
}

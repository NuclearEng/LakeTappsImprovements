// Centralized help content for the Lake Tapps Permit Workflow application

export interface HelpSection {
  title: string;
  description: string;
  tips?: string[];
}

export interface FieldHelpContent {
  label: string;
  help: string;
  example?: string;
}

// Stage-level help content
export const STAGE_HELP: Record<string, HelpSection> = {
  project_type: {
    title: 'Selecting Your Project Type',
    description:
      'The type of improvement you are planning affects which permits you will need. Select all that apply - you can choose multiple improvement types if your project involves several components.',
    tips: [
      'Docks and piers typically require CWA License and Shoreline permits',
      'Projects with mooring piles may require federal Section 10 permits',
      'Boat houses and covered structures usually require building permits',
      "If you're unsure, select 'Other' and describe your project",
    ],
  },
  property_owner: {
    title: 'Property Owner Information',
    description:
      'Enter the information for the legal property owner. If you are submitting on behalf of someone else (as an agent or contractor), check the agent checkbox and provide your own contact information as well.',
    tips: [
      'The parcel number can be found on your property tax statement',
      'Use the address where permit correspondence should be sent',
      'All fields are required for permit applications',
    ],
  },
  project_details: {
    title: 'Describing Your Project',
    description:
      'Provide a detailed description of your planned improvements. The more specific you are, the smoother the permit review process will be.',
    tips: [
      'Include dimensions and materials when known',
      'Describe existing structures if this is a modification',
      'Mention any environmental considerations you are aware of',
      'Accurate cost estimates help determine which permits are required',
    ],
  },
  site_information: {
    title: 'Site Information & Documents',
    description:
      'Upload your site plan and any supporting documents. A site plan showing property boundaries, existing structures, and proposed improvements is required for most permits.',
    tips: [
      'Site plans should be to scale if possible',
      'Include dimensions and setbacks from property lines',
      'Photos of the current site conditions are helpful',
      'Surveys from a licensed surveyor are required for some permits',
    ],
  },
  permit_applications: {
    title: 'Required Permits',
    description:
      'Based on your project details, we have determined which permits you will need. Review each permit requirement carefully and prepare your applications.',
    tips: [
      'CWA License is required for ALL Lake Tapps improvements',
      'Shoreline permits are processed by the City of Bonney Lake',
      'Some permits can be submitted concurrently',
      "Processing times vary - plan ahead",
    ],
  },
  insurance: {
    title: 'Insurance Requirements',
    description:
      "Cascade Water Alliance requires proof of liability insurance for most waterfront improvements. Your homeowner's insurance may already provide this coverage.",
    tips: [
      'Check with your insurance provider about waterfront structures',
      'Minimum coverage is typically $1 million liability',
      'Some projects may require additional coverage',
    ],
  },
  review: {
    title: 'Review Your Application',
    description:
      'Carefully review all information before generating your documents. Any errors may delay your permit approval.',
    tips: [
      'Double-check all contact information',
      'Verify project costs and dimensions',
      'Ensure all required documents are uploaded',
      'Review permit requirements one final time',
    ],
  },
  generate_docs: {
    title: 'Generate Application Documents',
    description:
      'Generate properly formatted application documents that you can submit to each agency. Documents are generated based on the information you provided.',
    tips: [
      'Download all required documents before proceeding',
      'Review generated documents for accuracy',
      'Keep copies of all submitted documents',
    ],
  },
  submit_track: {
    title: 'Submit & Track Progress',
    description:
      'Submit your applications to each agency and track their status. We provide pre-filled email templates to make submission easy.',
    tips: [
      'Submit to all required agencies',
      'Follow up if you do not receive confirmation within 1 week',
      'Keep records of all correspondence',
      'Mark applications as submitted to track your progress',
    ],
  },
};

// Field-specific help content
export const FIELD_HELP: Record<string, FieldHelpContent> = {
  parcel_number: {
    label: 'Parcel Number',
    help: 'Pierce County parcel numbers are 10 digits. You can find this on your property tax statement or by searching the Pierce County Parcel Viewer.',
    example: '1234567890',
  },
  estimated_cost: {
    label: 'Estimated Project Cost',
    help: 'Include all materials, labor, and equipment costs. Projects under $7,047 may qualify for a Shoreline Exemption instead of a full Substantial Development Permit.',
    example: '$15,000',
  },
  in_water_work: {
    label: 'Work in Water',
    help: "Does your project involve work below the ordinary high water mark (543' elevation for Lake Tapps)? This includes installing pilings, dredging, or any construction that touches the water.",
  },
  water_frontage: {
    label: 'Water Frontage',
    help: 'The length of your property that borders Lake Tapps. This affects the maximum size of allowed structures.',
    example: '100 feet',
  },
  site_elevation: {
    label: 'Site Elevation',
    help: "The elevation of your property relative to Lake Tapps. The high water mark is 544' and maximum operating level is 543'. Structures below 544' may require additional permits.",
  },
  existing_structure: {
    label: 'Existing Structures',
    help: 'If you are modifying or replacing an existing dock, pier, or other waterfront structure, describe it here. Include dimensions, materials, and age if known.',
  },
  project_description: {
    label: 'Project Description',
    help: 'Provide a complete description of your project including what you plan to build, materials to be used, dimensions, and any site work required.',
    example: 'Construct a new 6\' x 24\' wood dock with composite decking and two 12" diameter mooring piles.',
  },
  shoreline_setback: {
    label: 'Shoreline Setback',
    help: 'The minimum required distance from the ordinary high water mark to permanent structures. Check with Bonney Lake Planning for current setback requirements.',
  },
};

// Permit-specific help content
export const PERMIT_HELP: Record<string, HelpSection> = {
  cwa_license: {
    title: 'CWA License Application',
    description:
      'The Cascade Water Alliance License is required for ALL improvements on Lake Tapps property. CWA owns the reservoir and adjacent lands to the high water mark.',
    tips: [
      'Submit directly to CWA via email',
      'Include site plan and project description',
      'Allow 2-4 weeks for processing',
      'Annual license fees may apply',
    ],
  },
  shoreline_exemption: {
    title: 'Shoreline Exemption',
    description:
      'For projects with a total cost under $7,047, you may apply for a Shoreline Exemption instead of a full Substantial Development Permit.',
    tips: [
      'Simpler process with faster approval',
      'Still requires compliance with Shoreline Master Program',
      'Submit through City of Bonney Lake',
    ],
  },
  shoreline_substantial: {
    title: 'Substantial Development Permit',
    description:
      'Required for projects exceeding the exemption threshold. Subject to full review under the Shoreline Master Program.',
    tips: [
      'Longer review process (30-60 days)',
      'May require public notice',
      'Environmental review may be required',
    ],
  },
  hpa: {
    title: 'Hydraulic Project Approval',
    description:
      'Required by WA Department of Fish & Wildlife for projects that may affect fish habitat or water flow.',
    tips: [
      'Apply online through APPS system',
      'May have seasonal work windows',
      'Review state environmental requirements',
    ],
  },
  section_10: {
    title: 'Section 10 Permit',
    description:
      'Federal permit required for structures in navigable waters, administered by the Army Corps of Engineers.',
    tips: [
      'Required for pilings and fixed structures',
      'May use Nationwide Permit for small projects',
      'Allow 60-120 days for review',
    ],
  },
};

// Improvement type descriptions
export const IMPROVEMENT_DESCRIPTIONS: Record<string, string> = {
  dock: 'Fixed or floating platform extending over the water for boat mooring and access.',
  pier: 'Fixed structure extending from shore into the water, typically on pilings.',
  float: 'Floating platform that rises and falls with water levels.',
  boat_lift: 'Mechanical device for lifting and storing boats out of the water.',
  boat_ramp: 'Inclined surface for launching boats from a trailer.',
  boathouse: 'Covered structure for storing boats, may be over water or on shore.',
  bulkhead: 'Retaining wall along the shoreline to prevent erosion.',
  mooring_pile: 'Vertical pile driven into the lakebed for securing boats.',
  swim_float: 'Floating platform for swimming and recreation.',
  other: 'Other waterfront improvement not listed above.',
};

// FAQ content
export const FAQ_ITEMS = [
  {
    question: 'How long does the permit process take?',
    answer:
      'Processing times vary by permit type. CWA License approval typically takes 2-4 weeks. Shoreline exemptions may be processed in 1-2 weeks, while Substantial Development Permits can take 4-8 weeks. Federal permits (Section 10/404) may take 60-120 days.',
  },
  {
    question: 'Do I need a contractor to apply for permits?',
    answer:
      'Property owners can apply for permits themselves. However, some agencies may require that construction be performed by licensed contractors. Check with each agency for their specific requirements.',
  },
  {
    question: 'What if my project changes after I get permits?',
    answer:
      'Any significant changes to your project may require permit modifications or new permits. Contact the issuing agency before making changes to your approved plans.',
  },
  {
    question: 'Are there seasonal restrictions on construction?',
    answer:
      "Yes, work in or near the water may be restricted during fish spawning seasons (typically July 15 - February 15). Check your HPA permit for specific work windows.",
  },
  {
    question: 'What happens if I build without permits?',
    answer:
      'Unpermitted construction can result in fines, required removal of structures, and legal action. Always obtain required permits before starting work.',
  },
];

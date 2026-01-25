import type { Project } from '@/types';

export interface EmailTemplate {
  to: string;
  cc?: string;
  subject: string;
  body: string;
}

// Agency contact information
export const AGENCY_CONTACTS = {
  cwa: {
    name: 'Cascade Water Alliance',
    contact: 'Paul Anderson',
    email: 'panderson@cascadewater.org',
    phone: '(425) 453-0930',
    address: '520 112th Ave NE, Suite 400, Bellevue, WA 98004',
  },
  bonney_lake: {
    name: 'City of Bonney Lake',
    contact: 'Permit Center',
    email: 'permits@cobl.us',
    phone: '(253) 447-4356',
    address: '9002 Main St E, Suite 309, Bonney Lake, WA 98391',
    portalUrl: 'https://web.ci.bonney-lake.wa.us',
  },
  pierce_county: {
    name: 'Pierce County Planning',
    contact: 'Planning & Public Works',
    email: 'planning@piercecountywa.gov',
    phone: '(253) 798-7210',
  },
  wdfw: {
    name: 'WA Dept. of Fish & Wildlife',
    contact: 'HPA Applications',
    email: 'HPAapplications@dfw.wa.gov',
    phone: '(360) 902-2534',
  },
  usace: {
    name: 'U.S. Army Corps of Engineers',
    contact: 'Seattle District',
    email: 'paoteam@nws02.usace.army.mil',
    phone: '(206) 764-3495',
  },
};

// Helper function to format date for emails
function formatDate(dateString?: string): string {
  if (!dateString) return 'TBD';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper function to format improvement types for emails
function formatImprovementTypes(types: string[]): string {
  const typeLabels: Record<string, string> = {
    dock: 'Dock',
    pier: 'Pier',
    float: 'Float',
    boat_lift: 'Boat Lift',
    boat_ramp: 'Boat Ramp',
    boathouse: 'Boathouse/Covered Structure',
    bulkhead: 'Bulkhead/Seawall',
    mooring_pile: 'Mooring Pile',
    swim_float: 'Swim Float',
    other: 'Other Improvement',
  };

  return types.map((t) => typeLabels[t] || t).join(', ');
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate CWA License Application email
export function generateCWAEmail(project: Project): EmailTemplate {
  const { owner, details, site } = project;

  const subject = `Lake Tapps License Application - ${site.propertyAddress || owner.lastName}`;

  const body = `Dear Mr. Anderson,

I am submitting a Lake Tapps Reservoir License Application for the following proposed improvement on my property.

PROPERTY INFORMATION:
Property Address: ${site.propertyAddress}
Parcel Number: ${site.parcelNumber || owner.parcelNumber}
Property Owner: ${owner.firstName} ${owner.lastName}
Owner Phone: ${owner.phone}
Owner Email: ${owner.email}
Mailing Address: ${owner.address}, ${owner.city}, ${owner.state} ${owner.zip}

PROJECT DESCRIPTION:
Improvement Type(s): ${formatImprovementTypes(details.improvementTypes)}
Estimated Project Cost: ${formatCurrency(details.estimatedCost)}
Proposed Start Date: ${formatDate(details.startDate)}
Proposed Completion Date: ${formatDate(details.completionDate)}

Description:
${details.description}

PROJECT SPECIFICS:
Work in Water: ${details.inWater ? 'Yes' : 'No'}
Below High Water Line: ${details.belowHighWaterLine ? 'Yes' : 'No'}
Existing Structure: ${details.existingStructure ? 'Yes - Modification/Replacement' : 'No - New Construction'}

${details.existingStructure && details.existingStructureDescription ? `Existing Structure Details:\n${details.existingStructureDescription}\n\n` : ''}ATTACHMENTS:
I have attached the following documents:
${site.sitePlanFiles?.length ? '• Site Plan/Survey' : ''}
• Completed License Application Form
• Required supporting documents

Please let me know if you need any additional information or documentation to process this application.

Thank you for your assistance.

Sincerely,
${owner.firstName} ${owner.lastName}
${owner.phone}
${owner.email}`;

  return {
    to: AGENCY_CONTACTS.cwa.email,
    subject,
    body,
  };
}

// Generate Shoreline Permit email (for inquiry/submission)
export function generateShorelineEmail(project: Project): EmailTemplate {
  const { owner, details, site } = project;

  const isExemption = details.estimatedCost < 7047;
  const permitType = isExemption ? 'Shoreline Exemption' : 'Substantial Development Permit';

  const subject = `${permitType} Application - ${site.propertyAddress}`;

  const body = `Dear Permit Center,

I am submitting a ${permitType} application for a proposed improvement on my Lake Tapps waterfront property.

PROPERTY INFORMATION:
Property Address: ${site.propertyAddress}
Parcel Number: ${site.parcelNumber || owner.parcelNumber}
Property Owner: ${owner.firstName} ${owner.lastName}
Phone: ${owner.phone}
Email: ${owner.email}

PROJECT OVERVIEW:
Improvement Type(s): ${formatImprovementTypes(details.improvementTypes)}
Estimated Project Cost: ${formatCurrency(details.estimatedCost)}
${isExemption ? '\nThis project qualifies for a Shoreline Exemption as the total project cost is under $7,047.' : ''}

Description:
${details.description}

I have also submitted a license application to Cascade Water Alliance for this project.

Please advise on:
1. The specific forms required for my application
2. Any additional documentation needed
3. Current processing times and fees

Thank you for your assistance.

${owner.firstName} ${owner.lastName}
${owner.phone}
${owner.email}`;

  return {
    to: AGENCY_CONTACTS.bonney_lake.email,
    subject,
    body,
  };
}

// Generate HPA Application email
export function generateHPAEmail(project: Project): EmailTemplate {
  const { owner, details, site } = project;

  const subject = `HPA Application Inquiry - Lake Tapps - ${site.propertyAddress}`;

  const body = `Dear HPA Applications Team,

I am planning a waterfront improvement project on Lake Tapps and would like to inquire about Hydraulic Project Approval (HPA) requirements.

PROPERTY INFORMATION:
Property Address: ${site.propertyAddress}
Parcel Number: ${site.parcelNumber || owner.parcelNumber}
Water Body: Lake Tapps (Reservoir), Pierce County, WA
Property Owner: ${owner.firstName} ${owner.lastName}
Phone: ${owner.phone}
Email: ${owner.email}

PROJECT DESCRIPTION:
Improvement Type(s): ${formatImprovementTypes(details.improvementTypes)}
Work in Water: ${details.inWater ? 'Yes' : 'No'}
Below Ordinary High Water Mark: ${details.belowHighWaterLine ? 'Yes' : 'No'}

Description:
${details.description}

Please advise if this project requires an HPA permit and provide any applicable forms or instructions.

Thank you for your assistance.

${owner.firstName} ${owner.lastName}
${owner.phone}
${owner.email}`;

  return {
    to: AGENCY_CONTACTS.wdfw.email,
    subject,
    body,
  };
}

// Generate Army Corps email (Section 10 / 404)
export function generateUSACEEmail(project: Project): EmailTemplate {
  const { owner, details, site } = project;

  const subject = `Section 10/404 Permit Inquiry - Lake Tapps - ${site.propertyAddress}`;

  const body = `Dear Seattle District Regulatory Team,

I am planning a waterfront improvement project on Lake Tapps and would like to inquire about federal permit requirements under Section 10 of the Rivers and Harbors Act and/or Section 404 of the Clean Water Act.

PROPERTY INFORMATION:
Property Address: ${site.propertyAddress}
Parcel Number: ${site.parcelNumber || owner.parcelNumber}
Water Body: Lake Tapps (Reservoir), Pierce County, Washington
Property Owner: ${owner.firstName} ${owner.lastName}
Phone: ${owner.phone}
Email: ${owner.email}

PROJECT DESCRIPTION:
Improvement Type(s): ${formatImprovementTypes(details.improvementTypes)}

Description:
${details.description}

The project involves:
${details.inWater ? '• Work in navigable waters' : ''}
${details.belowHighWaterLine ? '• Structures below ordinary high water mark' : ''}
${details.improvementTypes.includes('mooring_pile') ? '• Installation of mooring piles/pilings' : ''}
${details.improvementTypes.includes('dock') ? '• Dock/pier construction or modification' : ''}

Please advise:
1. If this project requires a federal permit
2. The appropriate permit type (Nationwide vs. Individual)
3. Required application forms and procedures

Thank you for your guidance.

${owner.firstName} ${owner.lastName}
${owner.phone}
${owner.email}`;

  return {
    to: AGENCY_CONTACTS.usace.email,
    subject,
    body,
  };
}

// Generate a mailto URL from template
export function generateMailtoUrl(template: EmailTemplate): string {
  const params = new URLSearchParams();

  if (template.cc) {
    params.set('cc', template.cc);
  }

  params.set('subject', template.subject);
  params.set('body', template.body);

  return `mailto:${template.to}?${params.toString()}`;
}

// Get all required emails for a project based on permit requirements
export function getRequiredEmails(project: Project): Array<{
  id: string;
  agency: string;
  template: EmailTemplate;
  mailtoUrl: string;
}> {
  const emails: Array<{
    id: string;
    agency: string;
    template: EmailTemplate;
    mailtoUrl: string;
  }> = [];

  // CWA is always required
  const cwaTemplate = generateCWAEmail(project);
  emails.push({
    id: 'cwa_license',
    agency: AGENCY_CONTACTS.cwa.name,
    template: cwaTemplate,
    mailtoUrl: generateMailtoUrl(cwaTemplate),
  });

  // Shoreline permit based on jurisdiction
  if (project.details.withinShorelineJurisdiction) {
    const shorelineTemplate = generateShorelineEmail(project);
    emails.push({
      id: 'shoreline',
      agency: AGENCY_CONTACTS.bonney_lake.name,
      template: shorelineTemplate,
      mailtoUrl: generateMailtoUrl(shorelineTemplate),
    });
  }

  // HPA for in-water work
  if (project.details.inWater) {
    const hpaTemplate = generateHPAEmail(project);
    emails.push({
      id: 'hpa',
      agency: AGENCY_CONTACTS.wdfw.name,
      template: hpaTemplate,
      mailtoUrl: generateMailtoUrl(hpaTemplate),
    });
  }

  // USACE for certain project types
  const needsUSACE =
    project.details.improvementTypes.includes('mooring_pile') ||
    project.details.inWater ||
    project.details.belowHighWaterLine;

  if (needsUSACE) {
    const usaceTemplate = generateUSACEEmail(project);
    emails.push({
      id: 'usace',
      agency: AGENCY_CONTACTS.usace.name,
      template: usaceTemplate,
      mailtoUrl: generateMailtoUrl(usaceTemplate),
    });
  }

  return emails;
}

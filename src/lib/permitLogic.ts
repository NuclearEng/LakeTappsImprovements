import type { ProjectDetails, PermitType, ImprovementType } from '@/types';

export interface PermitRecommendation {
  permitType: PermitType;
  name: string;
  agency: string;
  isRequired: boolean;
  isLikelyRequired: boolean;
  reasons: string[];
  regulatoryBasis: string;
  estimatedFee?: string;
  processingTime?: string;
  submitMethod: 'email' | 'online' | 'mail';
  portalUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// Current shoreline exemption threshold (adjusted annually)
const SHORELINE_EXEMPTION_THRESHOLD = 7047; // 2024 value

// Lake Tapps specific elevations
const LAKE_TAPPS_HIGH_WATER_ELEVATION = 544;
const LAKE_TAPPS_MAX_WATER_ELEVATION = 543;

export function determineRequiredPermits(
  details: ProjectDetails,
  siteElevation?: number
): PermitRecommendation[] {
  const recommendations: PermitRecommendation[] = [];

  // CWA License - ALWAYS required for Lake Tapps
  recommendations.push({
    permitType: 'cwa_license',
    name: 'CWA License Application',
    agency: 'Cascade Water Alliance',
    isRequired: true,
    isLikelyRequired: true,
    reasons: [
      'Lake Tapps Reservoir is owned by Cascade Water Alliance',
      'All improvements on CWA property require a license agreement',
    ],
    regulatoryBasis: 'CWA License Agreement - All property owners with waterfront access must obtain approval',
    estimatedFee: '$200-500 application fee',
    processingTime: '2-4 weeks',
    submitMethod: 'email',
    contactEmail: 'panderson@cascadewater.org',
    contactPhone: '(425) 453-0930',
  });

  // Shoreline Permits - Based on cost threshold
  if (details.estimatedCost <= SHORELINE_EXEMPTION_THRESHOLD) {
    recommendations.push({
      permitType: 'shoreline_exemption',
      name: 'Shoreline Exemption',
      agency: 'City of Bonney Lake',
      isRequired: details.withinShorelineJurisdiction,
      isLikelyRequired: true,
      reasons: [
        `Project cost ($${details.estimatedCost.toLocaleString()}) is under the $${SHORELINE_EXEMPTION_THRESHOLD.toLocaleString()} exemption threshold`,
        'Shoreline Management Act still applies but with simplified process',
      ],
      regulatoryBasis: 'WAC 173-27-040 - Exemptions from the requirement for a Substantial Development Permit',
      estimatedFee: '$50-150',
      processingTime: '1-2 weeks',
      submitMethod: 'online',
      portalUrl: 'https://www.cobl.us/community-development/permits',
      contactEmail: 'permits@cobl.us',
      contactPhone: '(253) 447-4356',
    });
  } else {
    recommendations.push({
      permitType: 'shoreline_substantial',
      name: 'Shoreline Substantial Development Permit',
      agency: 'City of Bonney Lake',
      isRequired: details.withinShorelineJurisdiction,
      isLikelyRequired: true,
      reasons: [
        `Project cost ($${details.estimatedCost.toLocaleString()}) exceeds the $${SHORELINE_EXEMPTION_THRESHOLD.toLocaleString()} exemption threshold`,
        'Full Shoreline Master Program review required',
      ],
      regulatoryBasis: 'RCW 90.58 - Shoreline Management Act; WAC 173-27-040',
      estimatedFee: '$500-2,000',
      processingTime: '4-12 weeks',
      submitMethod: 'online',
      portalUrl: 'https://www.cobl.us/community-development/permits',
      contactEmail: 'permits@cobl.us',
      contactPhone: '(253) 447-4356',
    });
  }

  // HPA (Hydraulic Project Approval) - For in-water work
  if (details.inWater || details.belowHighWaterLine) {
    recommendations.push({
      permitType: 'hpa',
      name: 'Hydraulic Project Approval (HPA)',
      agency: 'WA Dept. of Fish & Wildlife',
      isRequired: true,
      isLikelyRequired: true,
      reasons: [
        details.inWater ? 'Project involves work in the water (below ordinary high water line)' : '',
        details.belowHighWaterLine ? `Structure extends below ${LAKE_TAPPS_HIGH_WATER_ELEVATION}' elevation` : '',
        'Required for any work that will use, divert, obstruct, or change the natural flow of waters of the state',
      ].filter(Boolean),
      regulatoryBasis: 'RCW 77.55 - Hydraulic Code',
      estimatedFee: '$0-1,500 (based on project value)',
      processingTime: '2-8 weeks (expedited available)',
      submitMethod: 'online',
      portalUrl: 'https://apps.wdfw.wa.gov/hpaapps/',
      contactEmail: 'HPAapplications@dfw.wa.gov',
      contactPhone: '(360) 902-2534',
    });
  }

  // Section 10/404 Permits - Federal permits for significant in-water work
  const requiresFederalPermit = shouldRequireFederalPermit(details);
  if (requiresFederalPermit.required) {
    recommendations.push({
      permitType: 'section_10',
      name: 'Army Corps Section 10 / JARPA',
      agency: 'US Army Corps of Engineers',
      isRequired: false,
      isLikelyRequired: requiresFederalPermit.likely,
      reasons: requiresFederalPermit.reasons,
      regulatoryBasis: 'Section 10 of the Rivers and Harbors Act of 1899; Section 404 of the Clean Water Act',
      estimatedFee: '$0-100 (Nationwide Permit) or $10-100 (Individual Permit)',
      processingTime: '2-6 months',
      submitMethod: 'online',
      portalUrl: 'https://www.nws.usace.army.mil/Missions/Civil-Works/Regulatory/Permit-Info/',
      contactEmail: 'NWS-OD-CO@usace.army.mil',
      contactPhone: '(206) 764-3495',
    });
  }

  // Building Permit - For structures
  const requiresBuildingPermit = shouldRequireBuildingPermit(details);
  if (requiresBuildingPermit.required) {
    recommendations.push({
      permitType: 'building_permit',
      name: 'Building Permit',
      agency: 'Pierce County / City of Bonney Lake',
      isRequired: false,
      isLikelyRequired: requiresBuildingPermit.likely,
      reasons: requiresBuildingPermit.reasons,
      regulatoryBasis: 'International Building Code as adopted locally',
      estimatedFee: 'Based on project valuation',
      processingTime: '2-4 weeks',
      submitMethod: 'online',
      contactPhone: '(253) 447-4356',
    });
  }

  return recommendations;
}

function shouldRequireFederalPermit(details: ProjectDetails): {
  required: boolean;
  likely: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let likely = false;

  // Mooring piles almost always require federal permit
  if (details.improvementTypes.includes('mooring_pile')) {
    reasons.push('Mooring piles typically require Section 10 authorization');
    likely = true;
  }

  // Large in-water projects
  if (details.inWater && details.estimatedCost > 50000) {
    reasons.push('Significant in-water work with substantial investment');
    likely = true;
  }

  // Boat ramps often require federal permits
  if (details.improvementTypes.includes('boat_ramp')) {
    reasons.push('Boat ramps typically involve dredge or fill activities requiring Section 404');
  }

  // Bulkheads and seawalls
  if (details.improvementTypes.includes('bulkhead')) {
    reasons.push('Bulkhead/seawall construction often requires federal authorization');
    likely = true;
  }

  // Work that extends significantly into water
  if (details.belowHighWaterLine && details.inWater) {
    reasons.push('Project extends below ordinary high water and involves in-water work');
  }

  return {
    required: reasons.length > 0,
    likely,
    reasons,
  };
}

function shouldRequireBuildingPermit(details: ProjectDetails): {
  required: boolean;
  likely: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let likely = false;

  // Boathouses typically require building permits
  if (details.improvementTypes.includes('boathouse')) {
    reasons.push('Boathouses are structures that require building permits');
    likely = true;
  }

  // Covered docks or structures
  if (details.description.toLowerCase().includes('cover') ||
      details.description.toLowerCase().includes('roof') ||
      details.description.toLowerCase().includes('enclosed')) {
    reasons.push('Covered or enclosed structures typically require building permits');
    likely = true;
  }

  // Large projects
  if (details.estimatedCost > 25000) {
    reasons.push('Project value suggests substantial construction that may require building permit');
  }

  // Electrical work
  if (details.description.toLowerCase().includes('electric') ||
      details.description.toLowerCase().includes('power') ||
      details.description.toLowerCase().includes('lighting')) {
    reasons.push('Electrical installations require permits');
    likely = true;
  }

  return {
    required: reasons.length > 0,
    likely,
    reasons,
  };
}

export function getPermitSummary(recommendations: PermitRecommendation[]): {
  definitelyRequired: PermitRecommendation[];
  likelyRequired: PermitRecommendation[];
  possiblyRequired: PermitRecommendation[];
  totalEstimatedFees: string;
  totalEstimatedTime: string;
} {
  const definitelyRequired = recommendations.filter((r) => r.isRequired);
  const likelyRequired = recommendations.filter((r) => !r.isRequired && r.isLikelyRequired);
  const possiblyRequired = recommendations.filter((r) => !r.isRequired && !r.isLikelyRequired);

  return {
    definitelyRequired,
    likelyRequired,
    possiblyRequired,
    totalEstimatedFees: 'Varies by project - contact agencies for current fees',
    totalEstimatedTime: '4-16 weeks for standard processing',
  };
}

export function getImprovementTypeDetails(type: ImprovementType): {
  name: string;
  description: string;
  commonPermits: PermitType[];
  typicalCost: string;
} {
  const details: Record<ImprovementType, {
    name: string;
    description: string;
    commonPermits: PermitType[];
    typicalCost: string;
  }> = {
    dock: {
      name: 'Dock',
      description: 'Fixed or floating platform extending from shoreline into water',
      commonPermits: ['cwa_license', 'shoreline_exemption', 'hpa'],
      typicalCost: '$5,000 - $50,000',
    },
    pier: {
      name: 'Pier',
      description: 'Fixed structure extending from shore, typically on pilings',
      commonPermits: ['cwa_license', 'shoreline_substantial', 'hpa', 'section_10'],
      typicalCost: '$10,000 - $100,000',
    },
    float: {
      name: 'Float',
      description: 'Floating platform, often attached to dock or anchored',
      commonPermits: ['cwa_license', 'shoreline_exemption', 'hpa'],
      typicalCost: '$3,000 - $20,000',
    },
    boat_lift: {
      name: 'Boat Lift',
      description: 'Mechanical device for raising and lowering boats',
      commonPermits: ['cwa_license', 'shoreline_exemption'],
      typicalCost: '$5,000 - $25,000',
    },
    boat_ramp: {
      name: 'Boat Ramp',
      description: 'Inclined surface for launching boats',
      commonPermits: ['cwa_license', 'shoreline_substantial', 'hpa', 'section_10'],
      typicalCost: '$10,000 - $50,000',
    },
    boathouse: {
      name: 'Boathouse',
      description: 'Covered structure for boat storage over water',
      commonPermits: ['cwa_license', 'shoreline_substantial', 'hpa', 'building_permit'],
      typicalCost: '$30,000 - $150,000',
    },
    bulkhead: {
      name: 'Bulkhead',
      description: 'Retaining wall along shoreline to prevent erosion',
      commonPermits: ['cwa_license', 'shoreline_substantial', 'hpa', 'section_10'],
      typicalCost: '$15,000 - $100,000',
    },
    mooring_pile: {
      name: 'Mooring Pile',
      description: 'Vertical post in water for securing boats',
      commonPermits: ['cwa_license', 'shoreline_exemption', 'hpa', 'section_10'],
      typicalCost: '$2,000 - $10,000 per pile',
    },
    swim_float: {
      name: 'Swim Float',
      description: 'Floating platform for swimming and recreation',
      commonPermits: ['cwa_license', 'shoreline_exemption'],
      typicalCost: '$2,000 - $15,000',
    },
    other: {
      name: 'Other Improvement',
      description: 'Other waterfront improvement not listed above',
      commonPermits: ['cwa_license', 'shoreline_exemption'],
      typicalCost: 'Varies',
    },
  };

  return details[type];
}

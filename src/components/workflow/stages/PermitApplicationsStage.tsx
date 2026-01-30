'use client';

import { useStore } from '@/store/useStore';

const PERMIT_INFO: Record<string, {
  name: string;
  agency: string;
  description: string;
  contact?: string;
  email?: string;
  phone: string;
  website?: string;
  bulletinRef?: string;
  submittalRequirements?: string[];
  codeRequirements?: string[];
  engineeringRequired?: string[];
  incentives?: string[];
}> = {
  cwa_license: {
    name: 'CWA License Application',
    agency: 'Cascade Water Alliance',
    description: 'Required for all improvements within Lake Tapps Reservoir property. SEPA categorical exemption applies to minor dock repair and ≤ 4 residential units per WAC 197-11-800.',
    contact: 'Paula Anderson',
    email: 'panderson@cascadewater.org',
    phone: '(425) 453-0930',
  },
  shoreline_exemption: {
    name: 'Shoreline Exemption',
    agency: 'City of Bonney Lake',
    description: 'Shoreline substantial development permit exemption per PCC 18S.60.020. General threshold: projects under $7,047 fair market value. Dock-specific thresholds for Lake Tapps (fresh water) are higher — see code requirements below.',
    email: 'permits@cobl.us',
    phone: '(253) 447-4356',
    bulletinRef: 'PCC 18S.60.020 — Shoreline Substantial Development Permit Exemptions',
    codeRequirements: [
      'General exemption: total fair market value ≤ $7,047 and does not materially interfere with public water use — PCC 18S.60.020',
      'DOCK-SPECIFIC EXEMPTION (fresh water — Lake Tapps): new dock ≤ $10,000 fair market value — PCC 18S.60.020',
      'DOCK-SPECIFIC EXEMPTION (fresh water — Lake Tapps): replacement dock ≤ $20,000 fair market value — PCC 18S.60.020',
      'Note: dock threshold and general threshold are SEPARATE exemptions — a dock project may exceed $7,047 but still be exempt under the dock-specific threshold',
      'Combined construction within 5 years exceeding these thresholds requires a Substantial Development Permit',
      'Normal maintenance and repair of existing structures is exempt (restoration to original condition)',
      'Single-family residence ≤ 35 ft is exempt, but ADUs are NOT exempt ("not considered a normal appurtenance") — PCC 18S.60.020',
      'SEPA categorical exemption: projects involving ≤ 4 single-family residential units per WAC 197-11-800(1)',
    ],
  },
  shoreline_substantial: {
    name: 'Substantial Development Permit',
    agency: 'City of Bonney Lake',
    description: 'Required for shoreline projects exceeding exemption thresholds per PCC 18S.60.020. General threshold: $7,047. Note: dock projects on Lake Tapps (fresh water) have higher exemption thresholds — new docks ≤ $10,000 or replacement docks ≤ $20,000 may still qualify for exemption.',
    email: 'permits@cobl.us',
    phone: '(253) 447-4356',
    bulletinRef: 'PCC Title 18S — Development Policies and Regulations – Shorelines (Ord. 2025-524)',
    codeRequirements: [
      'Required when project fair market value exceeds $7,047 (general) — PCC 18S.60.020',
      'Dock projects on fresh water (Lake Tapps): exempt if new dock ≤ $10,000 or replacement ≤ $20,000 — PCC 18S.60.020',
      'Note: if your dock project is $7,047–$10,000 (new) or $7,047–$20,000 (replacement), you may qualify for exemption under the DOCK-SPECIFIC threshold even though you exceed the general threshold',
      'Combined construction within 5 years is aggregated for threshold calculations',
      'Normal maintenance and repair of existing lawful structures is exempt',
      'Protective bulkheads for single-family residences are exempt (cannot create new dry land)',
      'SEPA review may be required for projects not categorically exempt per WAC 197-11',
    ],
  },
  hpa: {
    name: 'Hydraulic Project Approval (HPA)',
    agency: 'WA Dept. of Fish & Wildlife',
    description: 'Required for work in or near water',
    email: 'HPAapplications@dfw.wa.gov',
    phone: '(360) 902-2534',
  },
  section_10: {
    name: 'Section 10 Permit',
    agency: 'U.S. Army Corps of Engineers',
    description: 'For structures in navigable waters',
    email: 'paoteam@nws02.usace.army.mil',
    phone: '(206) 764-3495',
  },
  pierce_building_permit: {
    name: 'Pierce County Building Permit',
    agency: 'Pierce County Development Center',
    description: 'Residential construction permit for structural waterfront work including boathouses, bulkheads, covered docks, piers, and gangways. Per Pierce County Residential Construction Guide, Bulletin 47 (Docks, Piers, and Gangways), and PCC 17C.30.040. Enhanced Pre-Application Screening ($250) is available and recommended.',
    phone: '(253) 798-3739',
    website: 'piercecountywa.gov/903',
    bulletinRef: 'Pierce County Residential Construction Guide & Bulletin 47 — Docks, Piers, and Gangways (Rev. 3/28/2024)',
    submittalRequirements: [
      'Step 1: Pre-Application Screening Form ($250 fee) — recommended for all projects, required for critical areas/shoreline',
      'Step 2: Completed Residential Building Permit Application',
      'Site plan (to scale) — property boundaries, all structures, setbacks, easements, utilities, OHWM, impervious surfaces, stormwater facilities',
      'Construction plans — floor plans, structural framing, foundation details, cross-sections, dock/pier/piling specifications',
      'Structural details including piling specifications, guardrail/handrail details where required',
      'WA State Energy Code (WSEC) worksheets (if heated/conditioned space)',
      'Drainage plan — basic plan if new/replaced impervious < 2,000 sq ft; engineered plan if ≥ 2,000 sq ft',
      'Fire flow compliance — 750 GPM/45 min (< 3,600 sq ft) or 1,000 GPM/60 min (≥ 3,600 sq ft); hydrant within 350 ft',
      'Proof of water/sewer or septic approval',
      'Environmental permits (shoreline, critical areas) if applicable',
    ],
    codeRequirements: [
      'Docks and piers ≤ 6 ft above grade serving a single-family dwelling: guardrails NOT required around perimeter — Bulletin 47',
      'Gangways: 36″ guardrails/handrails required — Bulletin 47',
      'Gangways steeper than 1:12 slope: handrail required — Bulletin 47',
      'Guardrails on docks/piers need not meet IRC Chapter 3 spacing requirements — Bulletin 47',
      'Handrails not required on floating docks (close to water surface) — Bulletin 47',
      'Special inspections required for pilings on private piers, docks, and gangways — Bulletin 47',
      'Fire flow: 750 GPM at 45 min for structures < 3,600 sq ft; 1,000 GPM at 60 min for ≥ 3,600 sq ft — fire hydrant within 350 ft required',
      'Drainage: new/replaced impervious < 2,000 sq ft = basic plan; ≥ 2,000 sq ft = engineered drainage plan; > 5,000 sq ft = drainage control plan',
      'Site plan minimum: drawn to scale, show property lines, all structures with setbacks, easements, right-of-way, utilities, stormwater facilities — Appendix A',
      'SEPA categorical exemption: minor dock repair/maintenance (piling, ramps, floats, mooring buoys) is exempt per WAC 197-11-800(3)',
    ],
  },
  lni_electrical_permit: {
    name: 'WA State Electrical Work Permit',
    agency: 'WA Dept. of Labor & Industries',
    description: 'Property owner electrical work permit (RCW 19.28.261 exemption)',
    phone: '(360) 902-5800',
    website: 'lni.wa.gov',
  },
  solar_building_permit: {
    name: 'Solar Building Permit',
    agency: 'Pierce County Planning & Public Works',
    description: 'Building permit for residential rooftop PV panel installation per Pierce County Technical Bulletin (2021 International Codes)',
    phone: '(253) 798-3739',
    website: 'piercecountywa.gov/PPW',
    bulletinRef: 'Pierce County Technical Bulletin — Residential Rooftop Photovoltaic Panel Systems (Rev. 3/26/2024)',
    submittalRequirements: [
      'Completed Residential Building Permit Application',
      'Roof PV panel layout with solar AC disconnect panel shown — dimensioned and drawn to scale',
      'Dead load documentation showing panels, supports, mountings, raceways, and accessories weigh ≤ 4 lbs/sq ft with no point loads > 50 lbs',
      'Manufacturer specifications and listing information for all PV panels, attachment hardware, and racking',
      'Inverter specifications and listing information (must be listed for utility interaction)',
      'Installation procedures with moisture intrusion protection and positive roof connection details',
    ],
    codeRequirements: [
      'Design per 2021 IRC Section R324 (as amended by WA State), NFPA 70, UL 1741, and IFC Section R104.11 & 1205',
      'Designed for local wind speed per manufacturer installation specs',
      'Dead load spread across roof-framing members — no point loads > 50 lbs',
      'Panels mounted no higher than 18″ above the roofing surface',
      'Minimum 36″ unobstructed pathway from roof edge to ridge (2021 IFC 1204.2.1.1 / IRC R324.6.1)',
      'Ridge setback: ≥ 18″ both sides if array ≤ 33% of roof area; ≥ 36″ both sides if array > 33%',
      'Rapid shutdown labels per IFC Section 1204.5.1–1204.5.3',
      'Solar panels must not cover plumbing vents without Pierce County approval',
      'SEPA categorical exemption: solar energy equipment on existing structures is exempt per WAC 197-11-800(2)(l)',
    ],
    engineeringRequired: [
      'Dead load exceeds 4 lbs per square foot or point load > 50 lbs',
      'Ground snow load is 70 lbs per square foot or greater',
    ],
  },
  solar_building_permit_firefighter: {
    name: 'Firefighter Accessibility Requirements (WA State)',
    agency: 'Local Fire Authority',
    description: 'Per 2015 IRC / 2015 IFC with WA State Amendments — roof access points and pathways for firefighters are required for all PV installations',
    phone: '',
    codeRequirements: [
      'Roof access points at strong points of building construction — not over windows, doors, or under obstructions (trees, wires, signs)',
      'Each PV array limited to 150 ft in either direction',
      'Multiple arrays separated by 36″ wide clear access pathway',
      'Hip roofs: 36″ clear pathway eave-to-ridge on all sections with solar (except slopes ≤ 2:12)',
      'Single-ridge roofs: 36″ clear pathway eave-to-ridge on all sections with solar (except slopes ≤ 2:12)',
      'Hips/valleys with solar on both sides: panels ≥ 18″ from hip or valley (except slopes ≤ 2:12)',
      'Hips/valleys with solar on one side: panels may be adjacent to hip/valley (except slopes ≤ 2:12)',
      'Panels min. 18″ from ridge for ventilation — may go to ridge only with fire chief approval of alternate ventilation',
    ],
  },
  utility_interconnection_pse: {
    name: 'PSE Interconnection & Net Metering Application',
    agency: 'Puget Sound Energy (PSE)',
    description: 'Interconnection application for customer-connected solar under PSE Rate Schedule 150 (Net Metering) and Rate Schedule 152 (Interconnection). Net metering allows excess solar production to be credited against your usage — you only pay for net energy plus the basic monthly charge. Banked credits expire March 31 each year per state law. Systems up to 100 kW are eligible. Available to residential Rate Schedules 7–49.',
    phone: '1-800-562-1482',
    email: 'customercare@pse.com',
    website: 'pse.com/green-options/Renewable-Energy-Programs/customer-connected-solar',
    bulletinRef: 'PSE Rate Schedule 150 (Net Metering) & Rate Schedule 152 (Interconnection)',
    submittalRequirements: [
      'Submit Interconnection Application via PSE online portal',
      'Receive PSE Approval to Construct',
      'Complete solar installation following local codes and permitting',
      'Finalize electrical permit with local jurisdiction',
      'Submit Notice of Completion to PSE',
      'PSE on-site inspection and meter installation',
      'Receive PSE Approval to Energize and net metering activation',
    ],
    codeRequirements: [
      'System must be ≤ 100 kW nameplate capacity for net metering eligibility',
      'Must be on residential or commercial Rate Schedules 7–49',
      'Not compatible with Time of Use Rate Schedules 307, 327',
      'Not compatible with Non-Communicating Meter Service Schedule 171',
      'Inverter must be UL 1741 listed for utility interaction',
      'System must comply with NEC Article 690 and Article 705 (interconnection)',
      'Rapid shutdown per NEC 690.12 required',
      'Select an experienced installer — PSE Recommended Energy Professionals (REPs) available',
    ],
    engineeringRequired: [
      'Systems larger than 100 kW — contact PSE Distributed Renewables or Energy Advisors at 1-800-562-1482',
      'Storage-only systems operating in parallel with PSE grid',
    ],
    incentives: [
      'Federal ITC (Section 25D) for homeowner-owned systems expired Dec 31, 2025 per OBBBA — leased/PPA systems may still qualify under Section 48E through 2027',
      'Federal Business Energy Investment Tax Credit (Section 48E) — commercial and lease/PPA projects through 2027',
      'Washington State Sales and Use Tax Exemption for Solar Energy Systems (RCW 82.08.962) — through Jan 1, 2030',
      'PSE Net Metering credits offset energy charges — banked credits expire March 31 annually',
      'Note: WA State Production Incentive Program is fully subscribed and no longer accepting PSE customer applications',
    ],
  },
  utility_interconnection_tacoma: {
    name: 'Tacoma Power Net Metering Application',
    agency: 'Tacoma Power (Tacoma Public Utilities)',
    description: 'Net metering application under RCW 80.60 for customer-owned solar generation. Excess electricity produced is stored in your Net Metering Bank and used to offset future bills. The Net Meter Bank resets March 31 each year per RCW. Solar production meter is no longer required as of March 6, 2023.',
    phone: '(253) 502-8277',
    website: 'mytpu.org/community-environment/clean-renewable-energy/solar-net-metering',
    bulletinRef: 'RCW Chapter 80.60 — Net Metering of Electricity',
    submittalRequirements: [
      'Apply for an electrical permit via Accela at CityofTacoma.org/Permits',
      'After obtaining electrical permit, submit Net Meter Application with supporting documents',
      'Complete solar installation per local codes and Tacoma Power construction standards',
      'Schedule inspection through Accela permitting system',
      'Receive approval and net metering activation',
    ],
    codeRequirements: [
      'Electrical permits and inspection approvals required for all PV installations connecting to building electrical system',
      'Some jurisdictions require electrical plan review prior to permit issuance — check with local jurisdiction',
      'Must comply with Tacoma Power customer-owned generation construction standards',
      'Solar production meter no longer required (as of March 6, 2023)',
      'Inverter must be UL 1741 listed for utility interaction',
      'System must comply with NEC Article 690 and Article 705 (interconnection)',
      'Rapid shutdown per NEC 690.12 required',
    ],
    incentives: [
      'Federal ITC (Section 25D) for homeowner-owned systems expired Dec 31, 2025 per OBBBA — leased/PPA systems may still qualify under Section 48E through 2027',
      'Federal Business Energy Investment Tax Credit (Section 48E) — commercial and lease/PPA projects through 2027',
      'Washington State Sales and Use Tax Exemption for Solar Energy Systems (RCW 82.08.962) — through Jan 1, 2030',
      'Tacoma Power Net Metering Bank offsets energy charges — bank resets March 31 annually per RCW 80.60',
    ],
  },
  utility_interconnection: {
    name: 'Utility Interconnection & Net Metering Application',
    agency: 'Utility Provider',
    description: 'Application to connect solar system to the electrical grid and enroll in net metering per RCW 80.60. Contact your utility provider for specific interconnection requirements.',
    phone: '',
  },
  adu_building_permit: {
    name: 'ADU Building Permit',
    agency: 'Pierce County Planning & Public Works',
    description: 'Building permit for accessory dwelling unit construction per Pierce County Code 18A.37.120 (Ord. 2025-516s) and Pierce County Residential Construction Guide. ADUs are permitted on lots with single-family dwellings in all residential zones. Up to 2 ADUs per lot within the UGA; 1 ADU per lot outside the UGA. Enhanced Pre-Application Screening ($250) is available and recommended.',
    phone: '(253) 798-3739',
    website: 'piercecountywa.gov/PPW',
    bulletinRef: 'PCC 18A.37.120 — ADUs (Ord. 2025-516s) & Pierce County Residential Construction Guide',
    submittalRequirements: [
      'Step 1: Pre-Application Screening Form ($250 fee) — recommended for all projects, required if in critical areas or shoreline jurisdiction',
      'Step 2: Completed Residential Building Permit Application',
      'Site plan (to scale) — property boundaries, all structures with setbacks, ADU location, easements, utilities, impervious surfaces, stormwater facilities',
      'Construction plans — floor plans, elevations, structural framing, foundation details, cross-sections (dimensioned and drawn to scale)',
      'WA State Energy Code (WSEC) worksheets — required for all heated/conditioned ADU space',
      'Drainage plan — basic plan if new/replaced impervious < 2,000 sq ft; engineered plan if ≥ 2,000 sq ft; drainage control plan if > 5,000 sq ft',
      'Fire flow compliance documentation — 750 GPM/45 min (< 3,600 sq ft) or 1,000 GPM/60 min (≥ 3,600 sq ft); hydrant within 350 ft',
      'Proof of adequate water supply and sewer/septic capacity (septic approval from Pierce County Health Dept. if not on sewer)',
      'Environmental permits (shoreline, critical areas) if applicable — ADUs near water require shoreline permit per PCC 18S.60.020',
    ],
    codeRequirements: [
      'Max floor area: 1,000 sq ft (within UGA) or 1,250 sq ft (outside UGA) — PCC 18A.37.120.D.1',
      'Up to 2 ADUs per lot within UGA; 1 ADU per lot outside UGA — PCC 18A.37.120.C',
      'ADU height shall not exceed the height of the principal dwelling — PCC 18A.37.120.D.2.a',
      'Exception: ADU above a detached garage may exceed principal dwelling height by 1 story — PCC 18A.37.120.D.2.b',
      'No ADU limited to less than 24 ft in height unless principal dwelling is less than 24 ft — PCC 18A.37.120.D.2.c',
      'Detached ADU side/interior and rear setbacks may be reduced to 5 ft within UGA — PCC 18A.37.120.D.3',
      'Rear setback may be reduced to 2 ft for lots abutting an alley (within UGA) — PCC 18A.37.120.D.3',
      'Existing detached structures may be converted within existing side/rear setback (UGA only) — PCC 18A.37.120.D.3',
      'Off-street parking not required within ½ mile of a major transit stop per RCW 36.70A.681(1) — PCC 18A.37.120.D.4',
      'Street improvements shall not be a condition of ADU approval — PCC 18A.37.120.D.5',
      'Fire flow: 750 GPM at 45 min for structures < 3,600 sq ft; 1,000 GPM at 60 min for ≥ 3,600 sq ft — fire hydrant within 350 ft required',
      'Drainage: new/replaced impervious < 2,000 sq ft = basic plan; ≥ 2,000 sq ft = engineered plan; > 5,000 sq ft = drainage control plan',
      'Site plan minimum: drawn to scale, property lines, all structures with setbacks, easements, utilities, stormwater facilities — Appendix A',
      'ADUs are NOT exempt from building permit — habitable space exclusion per PCC 17C.30.040 §1(a)',
      'Exempt ancillary work (no permit): fences ≤ 6 ft, retaining walls ≤ 4 ft, decks ≤ 30″ above grade, re-roofing, siding replacement, finish work — PCC 17C.30.040',
      'SEPA categorical exemption: ≤ 4 single-family residential units (including ADUs) are exempt per WAC 197-11-800(1)',
    ],
  },
  planning_approval: {
    name: 'Planning Department Approval',
    agency: 'Pierce County Planning & Public Works',
    description: 'Land use and zoning compliance review for ADU per Pierce County Code 18A.37.120 and 18A.15.040 (Setback & Height). ADUs are a permitted use in all residential zones — no special use permit required.',
    phone: '(253) 798-3739',
    website: 'piercecountywa.gov/PPW',
    bulletinRef: 'PCC 18A.37.120 & 18A.15.040 — ADU Standards & Setback/Height Regulations',
    codeRequirements: [
      'ADU is a permitted use on any lot with a single-family dwelling in a residential zone — PCC 18A.37.120.B',
      'Max floor area: 1,000 sq ft (UGA) or 1,250 sq ft (outside UGA) — PCC 18A.37.120.D.1',
      'Height cannot exceed principal dwelling; exception for ADU above detached garage (+1 story) — PCC 18A.37.120.D.2',
      'Setback reductions allowed for detached ADUs within UGA: side/rear to 5 ft, rear to 2 ft abutting alley — PCC 18A.37.120.D.3',
      'Outside UGA: standard zone setbacks per PCC 18A.15.040 apply',
      'No owner-occupancy requirement per Ordinance 2025-516s',
      'Parking: not required within ½ mile of major transit stop (RCW 36.70A.681); otherwise per zone standards',
      'Street improvements not a condition of ADU approval — PCC 18A.37.120.D.5',
      'SEPA categorical exemption: ≤ 4 residential units exempt per WAC 197-11-800(1); no environmental review required',
    ],
  },
  septic_permit: {
    name: 'Septic System Permit',
    agency: 'Pierce County Health Department',
    description: 'Permit for septic system installation or expansion',
    phone: '(253) 798-6470',
  },
  adu_shoreline_permit: {
    name: 'Shoreline Permit (ADU)',
    agency: 'City of Bonney Lake',
    description: 'Shoreline substantial development permit for ADU within 200 ft of water. Per PCC 18S.60.020, ADUs are explicitly NOT exempt from shoreline permitting — "additional dwellings, such as accessory dwelling units and temporary dwelling units, shall not be considered a normal appurtenance" of a single-family residence.',
    email: 'permits@cobl.us',
    phone: '(253) 447-4356',
    bulletinRef: 'PCC 18S.60.020 — ADUs Not Exempt from Shoreline Substantial Development Permit',
    codeRequirements: [
      'ADUs are NOT exempt from shoreline substantial development permit — PCC 18S.60.020',
      'Single-family residences ≤ 35 ft ARE exempt, but ADUs are explicitly excluded from this exemption',
      'The $7,047 general exemption does NOT apply to ADUs as separate dwelling units',
      'ADU must comply with Pierce County Shoreline Master Program (PCC Title 18S)',
      'SEPA: ADU as part of ≤ 4 residential units is categorically exempt per WAC 197-11-800(1), but shoreline permit is still required',
      'Stormwater management and vegetation management plans may be required',
    ],
  },
};

const FEE_TIMELINE_DATA: Record<string, { feeRange: string; timeline: string }> = {
  cwa_license: { feeRange: '$150–$300', timeline: '2–4 weeks' },
  shoreline_exemption: { feeRange: '$0–$200', timeline: '1–2 weeks' },
  shoreline_substantial: { feeRange: '$1,000–$3,000', timeline: '8–16 weeks' },
  shoreline_conditional: { feeRange: '$2,000–$5,000', timeline: '12–20 weeks' },
  shoreline_variance: { feeRange: '$3,000–$7,000', timeline: '16–24 weeks' },
  hpa: { feeRange: '$0–$150', timeline: '4–6 weeks' },
  section_10: { feeRange: '$0–$100', timeline: '6–12 weeks' },
  section_404: { feeRange: '$0–$100', timeline: '6–12 weeks' },
  water_quality_401: { feeRange: '$0–$500', timeline: '4–8 weeks' },
  pierce_building_permit: { feeRange: '$500–$2,500', timeline: '4–8 weeks' },
  building_permit: { feeRange: '$500–$2,500', timeline: '4–8 weeks' },
  lni_electrical_permit: { feeRange: '$30–$100', timeline: '1–2 days' },
  solar_building_permit: { feeRange: '$200–$800', timeline: '2–4 weeks' },
  utility_interconnection: { feeRange: '$0–$100', timeline: '2–6 weeks' },
  adu_building_permit: { feeRange: '$1,000–$5,000', timeline: '4–8 weeks' },
  planning_approval: { feeRange: '$500–$1,500', timeline: '4–8 weeks' },
  septic_permit: { feeRange: '$500–$2,000', timeline: '4–8 weeks' },
  adu_shoreline_permit: { feeRange: '$1,000–$3,000', timeline: '8–16 weeks' },
};

export default function PermitApplicationsStage() {
  const { project, updatePermit } = useStore();

  if (!project) return null;

  const { requiredPermits, solarPermits, aduPermits, permits, workflowType, details } = project;

  // Resolve utility-specific permit info key
  const resolvePermitInfoKey = (permitType: string): string => {
    if (permitType === 'utility_interconnection') {
      const provider = details.utilityProvider;
      if (provider === 'pse' || (!provider && workflowType === 'solar')) {
        return 'utility_interconnection_pse';
      }
      if (provider === 'tacoma_power') {
        return 'utility_interconnection_tacoma';
      }
      return 'utility_interconnection';
    }
    return permitType;
  };

  // Combine all permits based on workflow type
  const allPermits: string[] = workflowType === 'solar'
    ? [...(solarPermits || [])]
    : workflowType === 'adu'
    ? [...(aduPermits || [])]
    : [...requiredPermits];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Permit Applications
        </h1>
        <p className="text-slate-600">
          Complete the required permit applications based on your project details.
        </p>
      </div>

      {/* Fee & Timeline Estimator */}
      {allPermits.length > 0 && (
        <div className="card mb-6 bg-gradient-to-r from-slate-50 to-blue-50/30 border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Estimated Fees & Timeline
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-2 pr-4 text-slate-600 font-semibold">Permit</th>
                  <th className="text-left py-2 pr-4 text-slate-600 font-semibold">Agency</th>
                  <th className="text-left py-2 pr-4 text-slate-600 font-semibold">Est. Fee</th>
                  <th className="text-left py-2 text-slate-600 font-semibold">Est. Processing</th>
                </tr>
              </thead>
              <tbody>
                {allPermits.map((permitType) => {
                  const infoKey = resolvePermitInfoKey(permitType);
                  const info = PERMIT_INFO[infoKey];
                  const feeData = FEE_TIMELINE_DATA[permitType] || FEE_TIMELINE_DATA[infoKey];
                  if (!info || !feeData) return null;
                  return (
                    <tr key={permitType} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium text-slate-900">{info.name}</td>
                      <td className="py-2 pr-4 text-slate-600">{info.agency}</td>
                      <td className="py-2 pr-4 text-slate-700">{feeData.feeRange}</td>
                      <td className="py-2 text-slate-700">{feeData.timeline}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500 italic">
            * Fees and timelines are estimates and may vary. Contact each agency for current rates.
          </p>
        </div>
      )}

      {/* Required Permits List */}
      <div className="space-y-4">
        {allPermits.map((permitType) => {
          const infoKey = resolvePermitInfoKey(permitType);
          const info = PERMIT_INFO[infoKey];
          const permit = permits[permitType];

          if (!info) return null;

          const statusColors = {
            not_started: 'bg-slate-100 text-slate-600',
            in_progress: 'bg-amber-100 text-amber-700',
            ready: 'bg-emerald-100 text-emerald-700',
            submitted: 'bg-blue-100 text-blue-700',
            approved: 'bg-green-100 text-green-700',
            denied: 'bg-red-100 text-red-700',
          };

          const statusLabels = {
            not_started: 'Not Started',
            in_progress: 'In Progress',
            ready: 'Ready to Submit',
            submitted: 'Submitted',
            approved: 'Approved',
            denied: 'Denied',
          };

          return (
            <div key={permitType} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{info.name}</h3>
                  <p className="text-sm text-slate-600">{info.agency}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[permit?.status || 'not_started']}`}>
                  {statusLabels[permit?.status || 'not_started']}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-4">{info.description}</p>

              {/* Bulletin Reference */}
              {info.bulletinRef && (
                <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200/60 rounded-lg">
                  <p className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {info.bulletinRef}
                  </p>
                </div>
              )}

              {/* Submittal Requirements Checklist */}
              {info.submittalRequirements && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      const target = e.currentTarget.nextElementSibling;
                      if (target) target.classList.toggle('hidden');
                      e.currentTarget.querySelector('svg:last-child')?.classList.toggle('rotate-180');
                    }}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2 hover:text-slate-900 transition-colors"
                  >
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Submittal Requirements ({info.submittalRequirements.length} items)
                    <svg className="w-3.5 h-3.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden">
                    <ul className="space-y-1.5 pl-1">
                      {info.submittalRequirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-0.5 w-4 h-4 rounded border border-slate-300 bg-white flex-shrink-0 flex items-center justify-center text-[10px] text-slate-400 font-mono">{i + 1}</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Code Requirements */}
              {info.codeRequirements && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      const target = e.currentTarget.nextElementSibling;
                      if (target) target.classList.toggle('hidden');
                      e.currentTarget.querySelector('svg:last-child')?.classList.toggle('rotate-180');
                    }}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2 hover:text-slate-900 transition-colors"
                  >
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Code Compliance ({info.codeRequirements.length} requirements)
                    <svg className="w-3.5 h-3.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden">
                    <ul className="space-y-1.5 pl-1">
                      {info.codeRequirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <svg className="w-3.5 h-3.5 mt-0.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Incentives */}
              {info.incentives && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      const target = e.currentTarget.nextElementSibling;
                      if (target) target.classList.toggle('hidden');
                      e.currentTarget.querySelector('svg:last-child')?.classList.toggle('rotate-180');
                    }}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2 hover:text-slate-900 transition-colors"
                  >
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available Incentives ({info.incentives.length} items)
                    <svg className="w-3.5 h-3.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="hidden">
                    <ul className="space-y-1.5 pl-1">
                      {info.incentives.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <svg className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Engineering Required */}
              {info.engineeringRequired && (
                <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200/60 rounded-lg">
                  <p className="text-xs font-semibold text-red-800 mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Engineering Required When:
                  </p>
                  <ul className="space-y-1">
                    {info.engineeringRequired.map((req, i) => (
                      <li key={i} className="text-xs text-red-700 flex items-start gap-1.5 pl-5">
                        <span className="text-red-400 mt-1">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {info.email && (
                  <a
                    href={`mailto:${info.email}`}
                    className="text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {info.email}
                  </a>
                )}
                {info.phone && (
                  <a
                    href={`tel:${info.phone}`}
                    className="text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {info.phone}
                  </a>
                )}
                {info.website && (
                  <span className="text-primary-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    {info.website}
                  </span>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <button
                  onClick={() => updatePermit(permitType, { status: 'in_progress' })}
                  className="btn btn-primary btn-sm"
                >
                  Start Application
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {allPermits.length === 0 && (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-600">No permits have been identified yet.</p>
          <p className="text-sm text-slate-500 mt-1">
            Complete the previous steps to determine required permits.
          </p>
        </div>
      )}
    </div>
  );
}

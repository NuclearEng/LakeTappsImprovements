import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import type { Project } from '@/types';
import {
  COLORS, PAGE_WIDTH, PAGE_HEIGHT, MARGIN_LEFT, MARGIN_RIGHT, TABLE_WIDTH,
  drawColoredHeaderBand, drawHorizontalRule, drawStandardFooter, wrapText,
  DOCX_COLORS, DOCX_PAGE_MARGINS, createDocxHeader, createDocxFooter,
  createDocxSectionHeading, createDocxHorizontalRule,
} from './documentStyles';

// ── Agency Data ──────────────────────────────────────────────────────────────

interface AgencyEntry {
  name: string;
  department: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  permits: string[];
  workflowTypes: ('waterfront' | 'solar' | 'adu')[];
}

const AGENCIES: AgencyEntry[] = [
  {
    name: 'Cascade Water Alliance',
    department: 'Real Estate / License Program',
    contactPerson: 'License Program Manager',
    email: 'laketapps@cascadewater.org',
    phone: '(425) 453-0930',
    website: 'https://cascadewater.org/lake-tapps/licenses-permits',
    address: '520 112th Ave NE, Suite 400, Bellevue, WA 98004',
    permits: ['cwa_license'],
    workflowTypes: ['waterfront'],
  },
  {
    name: 'City of Bonney Lake',
    department: 'Community Development',
    contactPerson: 'Permit Center Staff',
    email: 'permits@ci.bonney-lake.wa.us',
    phone: '(253) 447-4356',
    website: 'https://www.ci.bonney-lake.wa.us',
    address: '9002 Main St E, Bonney Lake, WA 98391',
    permits: ['shoreline_exemption', 'shoreline_substantial', 'shoreline_conditional', 'shoreline_variance', 'building_permit', 'adu_shoreline_permit'],
    workflowTypes: ['waterfront', 'adu'],
  },
  {
    name: 'Pierce County',
    department: 'Planning and Public Works',
    contactPerson: 'Permit Center Staff',
    email: 'pcpermit@piercecountywa.gov',
    phone: '(253) 798-7250',
    website: 'https://www.piercecountywa.gov/permits',
    address: '2401 S 35th St, Tacoma, WA 98409',
    permits: ['pierce_building_permit', 'solar_building_permit', 'adu_building_permit', 'planning_approval'],
    workflowTypes: ['waterfront', 'solar', 'adu'],
  },
  {
    name: 'WA Dept of Fish & Wildlife',
    department: 'Habitat Program - HPA',
    contactPerson: 'HPA Biologist',
    email: 'HPAapplications@dfw.wa.gov',
    phone: '(360) 902-2534',
    website: 'https://wdfw.wa.gov/licenses/environmental/hpa',
    address: '600 Capitol Way N, Olympia, WA 98501',
    permits: ['hpa'],
    workflowTypes: ['waterfront'],
  },
  {
    name: 'US Army Corps of Engineers',
    department: 'Seattle District - Regulatory Branch',
    contactPerson: 'Regulatory Project Manager',
    email: 'NWS-Regulatory@usace.army.mil',
    phone: '(206) 764-3495',
    website: 'https://www.nws.usace.army.mil/Missions/Regulatory/',
    address: '4735 E Marginal Way S, Seattle, WA 98134',
    permits: ['section_10', 'section_404'],
    workflowTypes: ['waterfront'],
  },
  {
    name: 'WA Dept of Ecology',
    department: 'Water Quality Program',
    contactPerson: 'Federal Permits Coordinator',
    email: 'ecyrefedpermits@ecy.wa.gov',
    phone: '(360) 407-6600',
    website: 'https://ecology.wa.gov/regulations-permits',
    address: '300 Desmond Dr SE, Lacey, WA 98503',
    permits: ['water_quality_401'],
    workflowTypes: ['waterfront'],
  },
  {
    name: 'WA Dept of Labor & Industries',
    department: 'Electrical Section',
    contactPerson: 'Electrical Program Staff',
    email: 'electricalprogram@lni.wa.gov',
    phone: '(800) 547-8367',
    website: 'https://lni.wa.gov/licensing-permits/electrical',
    address: '7273 Linderson Way SW, Tumwater, WA 98501',
    permits: ['lni_electrical_permit'],
    workflowTypes: ['waterfront', 'solar', 'adu'],
  },
  {
    name: 'Puget Sound Energy',
    department: 'Net Metering / Interconnection',
    contactPerson: 'Customer Service',
    email: 'CustomerCare@pse.com',
    phone: '(888) 225-5773',
    website: 'https://www.pse.com/green-options/renewable-energy-programs/net-metering',
    address: '10885 NE 4th St, Suite 1200, Bellevue, WA 98004',
    permits: ['utility_interconnection'],
    workflowTypes: ['solar'],
  },
  {
    name: 'Tacoma-Pierce County Health Dept',
    department: 'Environmental Health - On-Site Sewage',
    contactPerson: 'OSS Program Staff',
    email: 'osshelpdesk@tpchd.org',
    phone: '(253) 798-6470',
    website: 'https://www.tpchd.org/healthy-places/sewage-septic',
    address: '3629 S D St, Tacoma, WA 98418',
    permits: ['septic_permit'],
    workflowTypes: ['adu'],
  },
];

function getRelevantAgencies(project: Project): AgencyEntry[] {
  const allPermitKeys = new Set<string>([
    ...(project.requiredPermits || []),
    ...(project.solarPermits || []),
    ...(project.aduPermits || []),
  ]);

  // Filter agencies that have at least one permit matching the project
  return AGENCIES.filter(agency =>
    agency.permits.some(p => allPermitKeys.has(p)) ||
    agency.workflowTypes.includes(project.workflowType)
  );
}

function formatWorkflowType(wt: string): string {
  const map: Record<string, string> = {
    waterfront: 'Waterfront',
    solar: 'Solar',
    adu: 'ADU',
  };
  return map[wt] || wt;
}

// ── PDF Generation ───────────────────────────────────────────────────────────

export async function generateAgencyContactListPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const agencies = getRelevantAgencies(project);
  const HEADER_BG = { r: 0.84, g: 0.88, b: 0.96 };

  let pageNum = 1;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 50;

  // Title
  y = drawColoredHeaderBand(page, y, 'AGENCY CONTACT REFERENCE', HEADER_BG, boldFont, 14);
  y -= 4;
  page.drawText(`Workflow: ${formatWorkflowType(project.workflowType)} | Generated: ${new Date().toLocaleDateString()}`, {
    x: MARGIN_LEFT, y, size: 9, font, color: rgb(COLORS.medGray.r, COLORS.medGray.g, COLORS.medGray.b),
  });
  y -= 25;

  for (const agency of agencies) {
    // Check if we need a new page
    if (y < 180) {
      drawStandardFooter(page, font, pageNum, 0, 'Agency Contact Reference');
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pageNum++;
      y = PAGE_HEIGHT - 50;
    }

    // Agency name header
    y = drawColoredHeaderBand(page, y, agency.name, HEADER_BG, boldFont, 11);
    y -= 6;

    const fields: [string, string][] = [
      ['Department:', agency.department],
      ['Contact:', agency.contactPerson],
      ['Phone:', agency.phone],
      ['Email:', agency.email],
      ['Website:', agency.website],
      ['Address:', agency.address],
      ['Workflow:', agency.workflowTypes.map(formatWorkflowType).join(', ')],
    ];

    for (const [label, value] of fields) {
      page.drawText(label, { x: MARGIN_LEFT + 10, y, size: 9, font: boldFont });
      // Wrap long values like website URLs
      const lines = wrapText(value, font, 9, TABLE_WIDTH - 110);
      for (const line of lines) {
        page.drawText(line, { x: 150, y, size: 9, font });
        y -= 14;
      }
    }

    y -= 4;
    y = drawHorizontalRule(page, y);
    y -= 4;
  }

  // Update footers with correct total
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    drawStandardFooter(pdfDoc.getPage(i), font, i + 1, totalPages, 'Agency Contact Reference');
  }

  return pdfDoc.save();
}

// ── DOCX Generation ──────────────────────────────────────────────────────────

export async function generateAgencyContactListDOCX(project: Project): Promise<Blob> {
  const agencies = getRelevantAgencies(project);
  const children: Paragraph[] = [];

  const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const tableBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

  // Title
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: 'AGENCY CONTACT REFERENCE', bold: true, size: 28, color: DOCX_COLORS.cwa })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new TextRun({
      text: `Workflow: ${formatWorkflowType(project.workflowType)} | Generated: ${new Date().toLocaleDateString()}`,
      size: 18, color: '999999',
    })],
  }));

  for (const agency of agencies) {
    children.push(createDocxSectionHeading(agency.name, DOCX_COLORS.headerBandCwa));

    const fields: [string, string][] = [
      ['Department', agency.department],
      ['Contact Person', agency.contactPerson],
      ['Phone', agency.phone],
      ['Email', agency.email],
      ['Website', agency.website],
      ['Address', agency.address],
      ['Workflow Types', agency.workflowTypes.map(formatWorkflowType).join(', ')],
    ];

    const rows: TableRow[] = fields.map(([label, value]) => new TableRow({
      children: [
        new TableCell({
          borders: tableBorders,
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { fill: 'F5F5F5' },
          children: [new Paragraph({
            spacing: { before: 20, after: 20 },
            children: [new TextRun({ text: label, bold: true, size: 18 })],
          })],
        }),
        new TableCell({
          borders: tableBorders,
          width: { size: 75, type: WidthType.PERCENTAGE },
          children: [new Paragraph({
            spacing: { before: 20, after: 20 },
            children: [new TextRun({ text: value, size: 18 })],
          })],
        }),
      ],
    }));

    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows,
    }) as unknown as Paragraph);

    children.push(createDocxHorizontalRule());
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: DOCX_PAGE_MARGINS } },
      headers: { default: createDocxHeader('Agency Contact Reference') },
      footers: { default: createDocxFooter('Agency Contact Reference') },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

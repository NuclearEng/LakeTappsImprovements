import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import type { Project, AgencyContact } from '@/types';
import {
  COLORS, PAGE_WIDTH, PAGE_HEIGHT, MARGIN_LEFT,
  drawColoredHeaderBand, drawHorizontalRule, drawStandardFooter,
  DOCX_COLORS, DOCX_PAGE_MARGINS, createDocxHeader, createDocxFooter,
  createDocxSectionHeading, createDocxHorizontalRule,
} from './documentStyles';

// ── Agency Contact Data ──────────────────────────────────────────────────────

const AGENCY_CONTACTS: Record<string, AgencyContact> = {
  cwa_license: {
    name: 'Cascade Water Alliance',
    department: 'Real Estate / License Program',
    contactName: 'License Program Manager',
    email: 'laketapps@cascadewater.org',
    phone: '(425) 453-0930',
    website: 'https://cascadewater.org/lake-tapps/licenses-permits',
    submissionMethod: 'email',
    address: '520 112th Ave NE, Suite 400, Bellevue, WA 98004',
  },
  shoreline_exemption: {
    name: 'City of Bonney Lake',
    department: 'Community Development - Planning',
    email: 'permits@ci.bonney-lake.wa.us',
    phone: '(253) 447-4356',
    website: 'https://www.ci.bonney-lake.wa.us',
    submissionMethod: 'in_person',
    address: '9002 Main St E, Bonney Lake, WA 98391',
  },
  shoreline_substantial: {
    name: 'City of Bonney Lake',
    department: 'Community Development - Planning',
    email: 'permits@ci.bonney-lake.wa.us',
    phone: '(253) 447-4356',
    website: 'https://www.ci.bonney-lake.wa.us',
    submissionMethod: 'in_person',
    address: '9002 Main St E, Bonney Lake, WA 98391',
  },
  shoreline_conditional: {
    name: 'City of Bonney Lake',
    department: 'Community Development - Planning',
    email: 'permits@ci.bonney-lake.wa.us',
    phone: '(253) 447-4356',
    website: 'https://www.ci.bonney-lake.wa.us',
    submissionMethod: 'in_person',
    address: '9002 Main St E, Bonney Lake, WA 98391',
  },
  shoreline_variance: {
    name: 'City of Bonney Lake',
    department: 'Community Development - Planning',
    email: 'permits@ci.bonney-lake.wa.us',
    phone: '(253) 447-4356',
    website: 'https://www.ci.bonney-lake.wa.us',
    submissionMethod: 'in_person',
    address: '9002 Main St E, Bonney Lake, WA 98391',
  },
  building_permit: {
    name: 'City of Bonney Lake',
    department: 'Community Development - Building',
    email: 'permits@ci.bonney-lake.wa.us',
    phone: '(253) 447-4356',
    website: 'https://www.ci.bonney-lake.wa.us',
    submissionMethod: 'in_person',
    address: '9002 Main St E, Bonney Lake, WA 98391',
  },
  pierce_building_permit: {
    name: 'Pierce County',
    department: 'Planning and Public Works',
    email: 'pcpermit@piercecountywa.gov',
    phone: '(253) 798-7250',
    website: 'https://www.piercecountywa.gov/permits',
    submissionMethod: 'online',
    address: '2401 S 35th St, Tacoma, WA 98409',
  },
  lni_electrical_permit: {
    name: 'WA Dept of Labor & Industries',
    department: 'Electrical Section',
    email: 'electricalprogram@lni.wa.gov',
    phone: '(800) 547-8367',
    website: 'https://lni.wa.gov/licensing-permits/electrical',
    submissionMethod: 'online',
  },
  hpa: {
    name: 'WA Dept of Fish & Wildlife',
    department: 'Habitat Program - HPA',
    email: 'HPAapplications@dfw.wa.gov',
    phone: '(360) 902-2534',
    website: 'https://wdfw.wa.gov/licenses/environmental/hpa',
    submissionMethod: 'online',
  },
  section_10: {
    name: 'US Army Corps of Engineers',
    department: 'Seattle District - Regulatory Branch',
    email: 'NWS-Regulatory@usace.army.mil',
    phone: '(206) 764-3495',
    website: 'https://www.nws.usace.army.mil/Missions/Regulatory/',
    submissionMethod: 'email',
    address: '4735 E Marginal Way S, Seattle, WA 98134',
  },
  section_404: {
    name: 'US Army Corps of Engineers',
    department: 'Seattle District - Regulatory Branch',
    email: 'NWS-Regulatory@usace.army.mil',
    phone: '(206) 764-3495',
    website: 'https://www.nws.usace.army.mil/Missions/Regulatory/',
    submissionMethod: 'email',
    address: '4735 E Marginal Way S, Seattle, WA 98134',
  },
  water_quality_401: {
    name: 'WA Dept of Ecology',
    department: 'Water Quality Program',
    email: 'ecyrefedpermits@ecy.wa.gov',
    phone: '(360) 407-6600',
    website: 'https://ecology.wa.gov/regulations-permits/permits-certifications/401-water-quality-certification',
    submissionMethod: 'online',
  },
  solar_building_permit: {
    name: 'Pierce County',
    department: 'Planning and Public Works',
    email: 'pcpermit@piercecountywa.gov',
    phone: '(253) 798-7250',
    website: 'https://www.piercecountywa.gov/permits',
    submissionMethod: 'online',
  },
  utility_interconnection: {
    name: 'Puget Sound Energy',
    department: 'Net Metering / Interconnection',
    email: 'CustomerCare@pse.com',
    phone: '(888) 225-5773',
    website: 'https://www.pse.com/green-options/renewable-energy-programs/net-metering',
    submissionMethod: 'online',
  },
  adu_building_permit: {
    name: 'Pierce County',
    department: 'Planning and Public Works',
    email: 'pcpermit@piercecountywa.gov',
    phone: '(253) 798-7250',
    website: 'https://www.piercecountywa.gov/permits',
    submissionMethod: 'online',
  },
  planning_approval: {
    name: 'Pierce County',
    department: 'Planning and Public Works',
    email: 'pcpermit@piercecountywa.gov',
    phone: '(253) 798-7250',
    website: 'https://www.piercecountywa.gov/permits',
    submissionMethod: 'online',
  },
  septic_permit: {
    name: 'Tacoma-Pierce County Health Dept',
    department: 'Environmental Health - On-Site Sewage',
    email: 'osshelpdesk@tpchd.org',
    phone: '(253) 798-6470',
    website: 'https://www.tpchd.org/healthy-places/sewage-septic',
    submissionMethod: 'in_person',
  },
  adu_shoreline_permit: {
    name: 'City of Bonney Lake',
    department: 'Community Development - Planning',
    email: 'permits@ci.bonney-lake.wa.us',
    phone: '(253) 447-4356',
    website: 'https://www.ci.bonney-lake.wa.us',
    submissionMethod: 'in_person',
  },
};

const DOCUMENT_REQUIREMENTS: Record<string, string[]> = {
  cwa_license: [
    'Completed CWA License Application',
    'Site plan / drawing showing proposed improvements',
    'Proof of homeowner insurance naming CWA as additional insured',
    'Copy of PSE permit/license (if applicable)',
  ],
  shoreline_exemption: [
    'Completed Shoreline Exemption Application',
    'Site plan with dimensions',
    'Project description',
    'Photos of existing conditions',
  ],
  shoreline_substantial: [
    'Completed Shoreline Substantial Development Application',
    'SEPA checklist',
    'Detailed site plan',
    'Construction plans and specifications',
    'Environmental assessment (if required)',
  ],
  building_permit: [
    'Building permit application',
    'Construction plans (stamped by licensed engineer if applicable)',
    'Site plan',
    'Contractor license information',
  ],
  hpa: [
    'HPA application (via APPS system)',
    'Site plan showing waterward extent of work',
    'Construction timing and methods',
    'Mitigation plan (if applicable)',
  ],
  section_10: [
    'Joint Aquatic Resource Permit Application (JARPA)',
    'Project plans and cross-sections',
    'Environmental documentation',
    'Mitigation plan',
  ],
  section_404: [
    'Joint Aquatic Resource Permit Application (JARPA)',
    'Wetland delineation report (if applicable)',
    'Alternatives analysis',
    'Mitigation plan',
  ],
  lni_electrical_permit: [
    'Electrical permit application',
    'Electrical plans and load calculations',
    'Contractor license information',
  ],
};

function formatPermitName(t: string): string {
  const map: Record<string, string> = {
    cwa_license: 'CWA License Agreement',
    shoreline_exemption: 'Shoreline Exemption',
    shoreline_substantial: 'Shoreline Substantial Development',
    shoreline_conditional: 'Shoreline Conditional Use',
    shoreline_variance: 'Shoreline Variance',
    building_permit: 'Building Permit (Bonney Lake)',
    pierce_building_permit: 'Building Permit (Pierce County)',
    lni_electrical_permit: 'L&I Electrical Permit',
    hpa: 'Hydraulic Project Approval (HPA)',
    section_10: 'Section 10 Permit (USACE)',
    section_404: 'Section 404 Permit (USACE)',
    water_quality_401: '401 Water Quality Certification',
    solar_building_permit: 'Solar Building Permit',
    utility_interconnection: 'Utility Interconnection',
    adu_building_permit: 'ADU Building Permit',
    planning_approval: 'Planning Approval',
    septic_permit: 'Septic Permit',
    adu_shoreline_permit: 'ADU Shoreline Permit',
  };
  return map[t] || t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatSubmissionMethod(method: string): string {
  const map: Record<string, string> = {
    email: 'Email',
    online: 'Online Portal',
    mail: 'Mail',
    in_person: 'In Person',
  };
  return map[method] || method;
}

function getAllPermits(project: Project): string[] {
  const permits: string[] = [...(project.requiredPermits || [])];
  if (project.solarPermits) permits.push(...project.solarPermits);
  if (project.aduPermits) permits.push(...project.aduPermits);
  return permits;
}

// ── PDF Generation ───────────────────────────────────────────────────────────

export async function generateSubmissionChecklistPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const allPermits = getAllPermits(project);
  const HEADER_BG = { r: 0.84, g: 0.88, b: 0.96 };

  let pageNum = 1;
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 50;

  // Title
  y = drawColoredHeaderBand(page, y, 'PERMIT SUBMISSION CHECKLIST', HEADER_BG, boldFont, 14);
  y -= 4;
  page.drawText(`Project: ${project.owner.firstName} ${project.owner.lastName} | Generated: ${new Date().toLocaleDateString()}`, {
    x: MARGIN_LEFT, y, size: 9, font, color: rgb(COLORS.medGray.r, COLORS.medGray.g, COLORS.medGray.b),
  });
  y -= 25;

  for (const permitKey of allPermits) {
    const contact = AGENCY_CONTACTS[permitKey];
    const docs = DOCUMENT_REQUIREMENTS[permitKey] || [];
    const permitName = formatPermitName(permitKey);

    // Estimate space needed for this permit section
    const estimatedHeight = 80 + (docs.length * 14) + (contact ? 56 : 0);
    if (y - estimatedHeight < 60) {
      drawStandardFooter(page, font, pageNum, 0, 'Permit Submission Checklist');
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pageNum++;
      y = PAGE_HEIGHT - 50;
    }

    // Permit header
    y = drawColoredHeaderBand(page, y, permitName, HEADER_BG, boldFont, 11);
    y -= 6;

    // Checkbox line
    page.drawText('\u2610', { x: MARGIN_LEFT + 5, y, size: 12, font });
    page.drawText(`Submit ${permitName}`, { x: MARGIN_LEFT + 22, y, size: 9, font: boldFont });
    y -= 16;

    // Agency and method
    if (contact) {
      page.drawText('Agency:', { x: MARGIN_LEFT + 20, y, size: 9, font: boldFont });
      page.drawText(contact.name, { x: 130, y, size: 9, font });
      y -= 14;
      page.drawText('Method:', { x: MARGIN_LEFT + 20, y, size: 9, font: boldFont });
      page.drawText(formatSubmissionMethod(contact.submissionMethod), { x: 130, y, size: 9, font });
      y -= 14;
      page.drawText('Phone:', { x: MARGIN_LEFT + 20, y, size: 9, font: boldFont });
      page.drawText(contact.phone, { x: 130, y, size: 9, font });
      y -= 14;
      page.drawText('Email:', { x: MARGIN_LEFT + 20, y, size: 9, font: boldFont });
      page.drawText(contact.email, { x: 130, y, size: 9, font });
      y -= 14;
    }

    // Document requirements
    if (docs.length > 0) {
      y -= 4;
      page.drawText('Required Documents:', { x: MARGIN_LEFT + 20, y, size: 9, font: boldFont });
      y -= 14;
      for (const doc of docs) {
        page.drawText('\u2610', { x: MARGIN_LEFT + 30, y, size: 10, font });
        page.drawText(doc, { x: MARGIN_LEFT + 46, y, size: 9, font });
        y -= 14;
      }
    }

    y -= 6;
    y = drawHorizontalRule(page, y);
    y -= 4;
  }

  // Update footers with correct total page count
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    drawStandardFooter(pdfDoc.getPage(i), font, i + 1, totalPages, 'Permit Submission Checklist');
  }

  return pdfDoc.save();
}

// ── DOCX Generation ──────────────────────────────────────────────────────────

export async function generateSubmissionChecklistDOCX(project: Project): Promise<Blob> {
  const allPermits = getAllPermits(project);
  const children: Paragraph[] = [];

  // Title
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: 'PERMIT SUBMISSION CHECKLIST', bold: true, size: 28, color: DOCX_COLORS.cwa })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new TextRun({
      text: `Project: ${project.owner.firstName} ${project.owner.lastName} | Generated: ${new Date().toLocaleDateString()}`,
      size: 18, color: '999999',
    })],
  }));

  const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const tableBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

  for (const permitKey of allPermits) {
    const contact = AGENCY_CONTACTS[permitKey];
    const docs = DOCUMENT_REQUIREMENTS[permitKey] || [];
    const permitName = formatPermitName(permitKey);

    children.push(createDocxSectionHeading(permitName, DOCX_COLORS.headerBandCwa));

    // Checkbox item
    children.push(new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: `\u2610  Submit ${permitName}`, bold: true, size: 20 })],
    }));

    // Contact info table
    if (contact) {
      const contactRows: TableRow[] = [];
      const infoFields: [string, string][] = [
        ['Agency', contact.name],
        ['Department', contact.department || 'N/A'],
        ['Method', formatSubmissionMethod(contact.submissionMethod)],
        ['Phone', contact.phone],
        ['Email', contact.email],
        ['Website', contact.website || 'N/A'],
      ];

      for (const [label, value] of infoFields) {
        contactRows.push(new TableRow({
          children: [
            new TableCell({
              borders: tableBorders,
              width: { size: 25, type: WidthType.PERCENTAGE },
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
      }

      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: contactRows,
      }) as unknown as Paragraph);
    }

    // Document requirements
    if (docs.length > 0) {
      children.push(new Paragraph({
        spacing: { before: 160, after: 80 },
        children: [new TextRun({ text: 'Required Documents:', bold: true, size: 20 })],
      }));
      for (const doc of docs) {
        children.push(new Paragraph({
          spacing: { after: 60 },
          indent: { left: 360 },
          children: [new TextRun({ text: `\u2610  ${doc}`, size: 20 })],
        }));
      }
    }

    children.push(createDocxHorizontalRule());
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: DOCX_PAGE_MARGINS } },
      headers: { default: createDocxHeader('Permit Submission Checklist') },
      footers: { default: createDocxFooter('Permit Submission Checklist') },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

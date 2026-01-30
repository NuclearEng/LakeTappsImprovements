import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import type { Project } from '@/types';
import {
  drawColoredHeaderBand,
  drawHorizontalRule,
  drawStandardFooter,
  drawWatermarkMargin,
  drawSignatureBlock,
  drawWrappedText,
  COLORS,
  MARGIN_LEFT,
  createDocxHeader,
  createDocxFooter,
  createDocxSectionHeading,
  createDocxSignatureBlock,
  createDocxHorizontalRule,
  createFieldParagraph,
  createChecklistItem,
  createNoteParagraph,
  createBodyParagraph,
  DOCX_COLORS,
  DOCX_PAGE_MARGINS,
} from './documentStyles';

const PIERCE_BAND_BG = { r: 0.84, g: 0.86, b: 0.94 };

// Pierce County Residential Building Permit PDF
export async function generateBuildingPermitPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { owner, details, site } = project;

  // Blue header band at the very top
  let y = drawColoredHeaderBand(
    page, 770,
    'PIERCE COUNTY — RESIDENTIAL CONSTRUCTION APPLICATION',
    PIERCE_BAND_BG, boldFont, 13,
  );

  page.drawText('Development Center | 2401 S 35th St, Tacoma, WA 98409 | (253) 798-3739', {
    x: MARGIN_LEFT, y, size: 8, font, color: rgb(0.4, 0.4, 0.4),
  });
  y -= 18;

  // ── PROPERTY OWNER / APPLICANT INFORMATION ─────────────────────────────────
  y = drawHorizontalRule(page, y);
  y = drawColoredHeaderBand(page, y, 'PROPERTY OWNER / APPLICANT INFORMATION', PIERCE_BAND_BG, boldFont, 11);

  const ownerFields = [
    ['Owner Name:', `${owner.firstName} ${owner.lastName}`],
    ['Mailing Address:', owner.address],
    ['City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`],
    ['Phone:', owner.phone],
    ['Email:', owner.email],
  ];
  y -= 10;
  for (const [label, value] of ownerFields) {
    page.drawText(label, { x: 50, y, size: 9, font: boldFont });
    page.drawText(value, { x: 170, y, size: 9, font });
    y -= 18;
  }

  // ── CONTRACTOR INFORMATION ─────────────────────────────────────────────────
  y -= 4;
  y = drawHorizontalRule(page, y);
  y = drawColoredHeaderBand(page, y, 'CONTRACTOR INFORMATION', PIERCE_BAND_BG, boldFont, 11);

  const contractorFields = [
    ['Contractor Name:', details.contractorName || '________________________________'],
    ['WA License #:', details.contractorLicense || '________________________________'],
  ];
  y -= 10;
  for (const [label, value] of contractorFields) {
    page.drawText(label, { x: 50, y, size: 9, font: boldFont });
    page.drawText(value, { x: 170, y, size: 9, font });
    y -= 18;
  }

  // ── PROJECT LOCATION ───────────────────────────────────────────────────────
  y -= 4;
  y = drawHorizontalRule(page, y);
  y = drawColoredHeaderBand(page, y, 'PROJECT LOCATION', PIERCE_BAND_BG, boldFont, 11);

  const locationFields = [
    ['Property Address:', site.propertyAddress || owner.address],
    ['Parcel Number:', owner.parcelNumber || site.parcelNumber || 'N/A'],
    ['Legal Description:', '(See attached site plan)'],
  ];
  y -= 10;
  for (const [label, value] of locationFields) {
    page.drawText(label, { x: 50, y, size: 9, font: boldFont });
    page.drawText(value, { x: 170, y, size: 9, font });
    y -= 18;
  }

  // ── PROJECT DESCRIPTION & SCOPE OF WORK ────────────────────────────────────
  y -= 4;
  y = drawHorizontalRule(page, y);
  y = drawColoredHeaderBand(page, y, 'PROJECT DESCRIPTION & SCOPE OF WORK', PIERCE_BAND_BG, boldFont, 11);

  const desc = details.description || 'See attached plans.';
  y = drawWrappedText(page, desc, 50, y, font, 9, 500);
  y -= 4;

  // ── CONSTRUCTION DATA ──────────────────────────────────────────────────────
  y -= 4;
  y = drawHorizontalRule(page, y);
  y = drawColoredHeaderBand(page, y, 'CONSTRUCTION DATA', PIERCE_BAND_BG, boldFont, 11);

  const dataFields = [
    ['Construction Type:', details.constructionType || 'Residential'],
    ['Total Square Footage:', details.totalSquareFootage ? `${details.totalSquareFootage} sq ft` : (details.aduSquareFootage ? `${details.aduSquareFootage} sq ft` : 'N/A')],
    ['Estimated Valuation:', `$${(details.estimatedCost || 0).toLocaleString()}`],
    ['Number of Stories:', '________________________________'],
  ];
  y -= 10;
  for (const [label, value] of dataFields) {
    page.drawText(label, { x: 50, y, size: 9, font: boldFont });
    page.drawText(value, { x: 180, y, size: 9, font });
    y -= 18;
  }

  // ── SITE DEVELOPMENT ───────────────────────────────────────────────────────
  y -= 4;
  y = drawHorizontalRule(page, y);
  y = drawColoredHeaderBand(page, y, 'SITE DEVELOPMENT', PIERCE_BAND_BG, boldFont, 11);

  const siteFields = [
    'Impervious Surface Area: ________________________________ sq ft',
    'Stormwater Management: ________________________________',
    'Water Supply: ________________________________',
    'Sewer/Septic: ________________________________',
  ];
  y -= 10;
  for (const item of siteFields) {
    page.drawText(item, { x: 50, y, size: 9, font });
    y -= 18;
  }

  // ── REQUIRED ATTACHMENTS CHECKLIST ─────────────────────────────────────────
  y -= 4;
  y = drawHorizontalRule(page, y);
  y = drawColoredHeaderBand(page, y, 'REQUIRED ATTACHMENTS CHECKLIST', PIERCE_BAND_BG, boldFont, 11);

  page.drawText('Per Pierce County Residential Construction Guide & Appendix A', {
    x: 50, y, size: 7, font, color: rgb(0.4, 0.4, 0.4),
  });
  y -= 14;
  const checklist = [
    '[ ] Pre-Application Screening Form ($250 — recommended; required for critical areas/shoreline)',
    '[ ] Site Plan (to scale): property boundaries, all structures w/ setbacks, easements, utilities, impervious surfaces, stormwater',
    '[ ] Construction Plans: floor plans, structural framing, foundation details, cross-sections',
    '[ ] Structural Calculations (if applicable)',
    '[ ] WA State Energy Code (WSEC) Worksheets (heated/conditioned space)',
    '[ ] Drainage Plan: basic (< 2,000 sq ft new impervious), engineered (>= 2,000 sq ft), or DCP (> 5,000 sq ft)',
    '[ ] Fire Flow Compliance: 750 GPM/45 min (< 3,600 sq ft) or 1,000 GPM/60 min (>= 3,600 sq ft); hydrant <= 350 ft',
    '[ ] Proof of Water/Sewer Connection or Septic Approval (Pierce County Health Dept.)',
    '[ ] Environmental Permits (shoreline, critical areas) if applicable',
  ];
  for (const item of checklist) {
    page.drawText(item, { x: 50, y, size: 9, font });
    y -= 14;
  }

  // ── DOCK / PIER / GANGWAY REQUIREMENTS (conditional) ───────────────────────
  const isDock = (details.description || '').toLowerCase().match(/dock|pier|gangway|float|piling|boathouse|bulkhead/);
  if (isDock) {
    y -= 4;
    y = drawHorizontalRule(page, y);
    y = drawColoredHeaderBand(page, y, 'DOCK / PIER / GANGWAY REQUIREMENTS (Bulletin 47, Rev. 3/28/2024)', PIERCE_BAND_BG, boldFont, 11);

    const dockItems = [
      '[ ] Docks/piers <= 6 ft above grade: guardrails NOT required around perimeter',
      '[ ] Gangways: 36" guardrails/handrails required',
      '[ ] Gangways steeper than 1:12 slope: handrail required',
      '[ ] Guardrails need not meet IRC Chapter 3 spacing requirements',
      '[ ] Handrails not required on floating docks (close to water surface)',
      '[ ] Special inspections required for pilings',
    ];
    for (const item of dockItems) {
      page.drawText(item, { x: 50, y, size: 9, font });
      y -= 14;
    }
  }

  // SEPA Note
  y -= 10;
  page.drawText('SEPA: This project may be categorically exempt per WAC 197-11-800.', {
    x: 50, y, size: 8, font, color: rgb(0.3, 0.4, 0.3),
  });
  y -= 10;

  // ── APPLICANT CERTIFICATION ────────────────────────────────────────────────
  y -= 4;
  y = drawHorizontalRule(page, y);
  y = drawColoredHeaderBand(page, y, 'APPLICANT CERTIFICATION', PIERCE_BAND_BG, boldFont, 11);

  page.drawText('I certify that the information provided is true and accurate to the best of my knowledge.', {
    x: 50, y, size: 9, font,
  });
  y -= 20;

  y = drawSignatureBlock(page, y, font, boldFont, 'Applicant Signature');

  // Footer & Watermark
  drawStandardFooter(page, font, 1, 1, 'Pierce County Residential Construction Application');
  drawWatermarkMargin(page, font);

  return pdfDoc.save();
}

// Pierce County Residential Building Permit DOCX
export async function generateBuildingPermitDOCX(project: Project): Promise<Blob> {
  const { owner, details, site } = project;

  const children: (Paragraph | unknown)[] = [
    new Paragraph({
      children: [
        new TextRun({ text: 'PIERCE COUNTY', bold: true, size: 28, color: '1A3380' }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'RESIDENTIAL CONSTRUCTION APPLICATION', bold: true, size: 28 }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Development Center | 2401 S 35th St, Tacoma, WA 98409 | (253) 798-3739',
          size: 16, color: '666666',
        }),
      ],
      spacing: { after: 400 },
    }),

    // Property Owner
    createDocxHorizontalRule(),
    createDocxSectionHeading('PROPERTY OWNER / APPLICANT INFORMATION', DOCX_COLORS.headerBandPierce),
    createFieldParagraph('Owner Name:', `${owner.firstName} ${owner.lastName}`),
    createFieldParagraph('Mailing Address:', owner.address),
    createFieldParagraph('City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`),
    createFieldParagraph('Phone:', owner.phone),
    createFieldParagraph('Email:', owner.email),

    // Contractor
    createDocxHorizontalRule(),
    createDocxSectionHeading('CONTRACTOR INFORMATION', DOCX_COLORS.headerBandPierce),
    createFieldParagraph('Contractor Name:', details.contractorName || '________________________________'),
    createFieldParagraph('WA License #:', details.contractorLicense || '________________________________'),

    // Project Location
    createDocxHorizontalRule(),
    createDocxSectionHeading('PROJECT LOCATION', DOCX_COLORS.headerBandPierce),
    createFieldParagraph('Property Address:', site.propertyAddress || owner.address),
    createFieldParagraph('Parcel Number:', owner.parcelNumber || site.parcelNumber || 'N/A'),
    createFieldParagraph('Legal Description:', '(See attached site plan)'),

    // Project Description
    createDocxHorizontalRule(),
    createDocxSectionHeading('PROJECT DESCRIPTION & SCOPE OF WORK', DOCX_COLORS.headerBandPierce),
    createBodyParagraph(details.description || 'See attached plans.', { spacing: { after: 200 } }),

    // Construction Data
    createDocxHorizontalRule(),
    createDocxSectionHeading('CONSTRUCTION DATA', DOCX_COLORS.headerBandPierce),
    createFieldParagraph('Construction Type:', details.constructionType || 'Residential'),
    createFieldParagraph('Total Square Footage:', details.totalSquareFootage ? `${details.totalSquareFootage} sq ft` : (details.aduSquareFootage ? `${details.aduSquareFootage} sq ft` : 'N/A')),
    createFieldParagraph('Estimated Valuation:', `$${(details.estimatedCost || 0).toLocaleString()}`),
    createFieldParagraph('Number of Stories:', '________________________________'),

    // Site Development
    createDocxHorizontalRule(),
    createDocxSectionHeading('SITE DEVELOPMENT', DOCX_COLORS.headerBandPierce),
    createFieldParagraph('Impervious Surface Area:', '________________________________ sq ft'),
    createFieldParagraph('Stormwater Management:', '________________________________'),
    createFieldParagraph('Water Supply:', '________________________________'),
    createFieldParagraph('Sewer/Septic:', '________________________________'),

    // Required Attachments (per Residential Construction Guide & Appendix A)
    createDocxHorizontalRule(),
    createDocxSectionHeading('REQUIRED ATTACHMENTS CHECKLIST', DOCX_COLORS.headerBandPierce),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Per Pierce County Residential Construction Guide & Appendix A — Document Minimum Requirements',
          size: 16, italics: true, color: '666666',
        }),
      ],
      spacing: { after: 200 },
    }),
    createChecklistItem('[ ] Pre-Application Screening Form ($250 — recommended; required for critical areas/shoreline)'),
    createChecklistItem('[ ] Site Plan (to scale): property boundaries, all structures with setbacks, easements, utilities, impervious surfaces, stormwater facilities'),
    createChecklistItem('[ ] Construction Plans: floor plans, structural framing, foundation details, cross-sections'),
    createChecklistItem('[ ] Structural Calculations (if applicable)'),
    createChecklistItem('[ ] WA State Energy Code (WSEC) Worksheets (heated/conditioned space)'),
    createChecklistItem('[ ] Drainage Plan: basic (< 2,000 sq ft new impervious), engineered (>= 2,000 sq ft), or DCP (> 5,000 sq ft)'),
    createChecklistItem('[ ] Fire Flow Compliance: 750 GPM/45 min (< 3,600 sq ft) or 1,000 GPM/60 min (>= 3,600 sq ft); hydrant <= 350 ft'),
    createChecklistItem('[ ] Proof of Water/Sewer Connection or Septic Approval (Pierce County Health Dept.)'),
    createChecklistItem('[ ] Environmental Permits (shoreline, critical areas) if applicable', { spacing: 200 }),

    // Dock/Pier/Gangway Requirements (always included for reference)
    createDocxHorizontalRule(),
    createDocxSectionHeading('DOCK / PIER / GANGWAY REQUIREMENTS (Bulletin 47)', DOCX_COLORS.headerBandPierce),
    new Paragraph({
      children: [
        new TextRun({ text: 'Per Pierce County Bulletin 47 — Docks, Piers, and Gangways (Rev. 3/28/2024). ', italics: true }),
        new TextRun({ text: 'Applicable to waterfront structural work:', italics: true }),
      ],
      spacing: { after: 100 },
    }),
    createChecklistItem('[ ] Docks/piers <= 6 ft above grade: guardrails NOT required around perimeter'),
    createChecklistItem('[ ] Gangways: 36" guardrails/handrails required'),
    createChecklistItem('[ ] Gangways steeper than 1:12 slope: handrail required'),
    createChecklistItem('[ ] Guardrails need not meet IRC Chapter 3 spacing requirements'),
    createChecklistItem('[ ] Handrails not required on floating docks (close to water surface)'),
    createChecklistItem('[ ] Special inspections required for pilings', { spacing: 200 }),

    createNoteParagraph('SEPA: This project may be categorically exempt per WAC 197-11-800.', '4D6648'),

    // Applicant Certification
    createDocxHorizontalRule(),
    createDocxSectionHeading('APPLICANT CERTIFICATION', DOCX_COLORS.headerBandPierce),
    createBodyParagraph('I certify that the information provided is true and accurate to the best of my knowledge.', { spacing: { after: 400 } }),
    createDocxSignatureBlock('Applicant Signature') as unknown as Paragraph,
  ];

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: DOCX_PAGE_MARGINS,
        },
      },
      headers: {
        default: createDocxHeader('Pierce County Residential Construction Application'),
      },
      footers: {
        default: createDocxFooter('Pierce County Residential Construction Application'),
      },
      children: children as Paragraph[],
    }],
  });

  return Packer.toBlob(doc);
}

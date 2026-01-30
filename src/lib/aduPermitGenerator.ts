import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import type { Project } from '@/types';
import {
  drawColoredHeaderBand,
  drawHorizontalRule,
  drawStandardFooter,
  drawWatermarkMargin,
  drawSignatureBlock,
  wrapText,
  drawWrappedText,
  COLORS,
  MARGIN_LEFT,
  TABLE_WIDTH,
  createDocxHeader,
  createDocxFooter,
  createDocxSectionHeading,
  createDocxSignatureBlock,
  createDocxHorizontalRule,
  createFieldParagraph,
  createChecklistItem,
  createBulletItem,
  createNoteParagraph,
  createBodyParagraph,
  DOCX_COLORS,
  DOCX_PAGE_MARGINS,
} from './documentStyles';

const ADU_HEADER_BAND = { r: 0.84, g: 0.94, b: 0.89 };

// ADU Building Permit PDF
export async function generateADUBuildingPermitPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { owner, details } = project;
  const docTitle = 'ADU Building Permit Application';

  // Title
  page.drawText('ACCESSORY DWELLING UNIT (ADU)', {
    x: 50,
    y: 740,
    size: 16,
    font: boldFont,
    color: rgb(0.1, 0.5, 0.3),
  });

  page.drawText('Building Permit Application', {
    x: 50,
    y: 720,
    size: 14,
    font: boldFont,
  });

  // Property Owner Section
  let yPosition = 690;
  yPosition = drawColoredHeaderBand(page, yPosition, 'PROPERTY OWNER INFORMATION', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const ownerFields = [
    ['Name:', `${owner.firstName} ${owner.lastName}`],
    ['Address:', owner.address],
    ['City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`],
    ['Phone:', owner.phone],
    ['Email:', owner.email],
    ['Parcel Number:', owner.parcelNumber || 'N/A'],
  ];

  for (const [label, value] of ownerFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // ADU Details
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'ADU SPECIFICATIONS', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const aduTypeLabel = details.aduImprovements?.map(t =>
    t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  ).join(', ') || 'N/A';

  const aduFields = [
    ['ADU Type:', aduTypeLabel],
    ['Square Footage:', details.aduSquareFootage ? `${details.aduSquareFootage} sq ft` : 'N/A'],
    ['Bedrooms:', details.aduBedrooms?.toString() || 'N/A'],
    ['Bathrooms:', details.aduBathrooms?.toString() || 'N/A'],
    ['Parking Spaces:', details.aduParkingSpaces?.toString() || 'N/A'],
    ['Existing ADU on Property:', details.hasExistingADU ? 'Yes' : 'No'],
  ];

  for (const [label, value] of aduFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Site Conditions
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'SITE CONDITIONS', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const siteFields = [
    ['Connected to Sewer:', details.onSewer ? 'Yes' : 'No - Septic Required'],
    ['Within 200ft of Shoreline:', details.nearShoreline ? 'Yes - Shoreline Permit Required' : 'No'],
  ];

  for (const [label, value] of siteFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Project Details
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'PROJECT DETAILS', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const projectFields = [
    ['Estimated Cost:', `$${details.estimatedCost?.toLocaleString() || '0'}`],
    ['Planned Start Date:', details.startDate || 'TBD'],
  ];

  for (const [label, value] of projectFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Description
  yPosition -= 10;
  page.drawText('Project Description:', { x: 50, y: yPosition, size: 10, font: boldFont });
  yPosition -= 15;

  const description = details.description || 'Accessory Dwelling Unit construction.';
  yPosition = drawWrappedText(page, description, 50, yPosition, font, 10, 500);

  // Compliance Checklist
  yPosition -= 20;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'ADU COMPLIANCE CHECKLIST', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const complianceItems = [
    '[ ] ADU does not exceed 1,000 sq ft (UGA) or 1,250 sq ft (outside UGA) — PCC 18A.37.120.D.1',
    '[ ] ADU height does not exceed principal dwelling height — PCC 18A.37.120.D.2.a',
    '[ ] Detached ADU setbacks: min 5 ft side/rear within UGA (2 ft rear abutting alley) — PCC 18A.37.120.D.3',
    '[ ] Lot does not already have 2 ADUs (UGA) or 1 ADU (outside UGA) — PCC 18A.37.120.C',
    '[ ] ADU meets current building code requirements',
    '[ ] Adequate water supply and sewer/septic capacity confirmed',
  ];

  for (const item of complianceItems) {
    const lines = wrapText(item, font, 9, 500);
    for (const line of lines) {
      page.drawText(line, { x: 50, y: yPosition, size: 9, font });
      yPosition -= 14;
    }
  }

  // Permit Exemption Notice
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'PERMIT EXEMPTION NOTICE (PCC 17C.30.040)', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  page.drawText('ADUs are NOT exempt from building permit (habitable space exclusion, §1(a)).', {
    x: 50, y: yPosition, size: 9, font: boldFont,
  });
  yPosition -= 14;
  page.drawText('The following ancillary work does NOT require a building permit:', {
    x: 50, y: yPosition, size: 9, font,
  });

  yPosition -= 16;
  const exemptItems = [
    '• Detached storage sheds <= 200 sq ft (non-habitable), >= 5 ft from other structures',
    '• Fences <= 6 ft high; retaining walls <= 4 ft (no surcharge)',
    '• Decks/sidewalks/driveways <= 30" above grade, not over a basement',
    '• Re-roofing (slope > 2:12, total load <= 7.5 lbs/sq ft, no sheathing replacement)',
    '• Siding replacement (no structural sheathing); finish work (paint, tile, carpet, cabinets)',
    '• Self-contained above-ground spas/hot tubs (not connected to potable water or sewer)',
  ];

  for (const item of exemptItems) {
    page.drawText(item, { x: 60, y: yPosition, size: 8, font });
    yPosition -= 12;
  }

  // Submittal Requirements (per Residential Construction Guide)
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'SUBMITTAL REQUIREMENTS (Residential Construction Guide)', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const submittalItems = [
    '[ ] Pre-Application Screening Form ($250 — recommended; required for critical areas/shoreline)',
    '[ ] Site plan (to scale): property lines, all structures w/ setbacks, easements, utilities, impervious surfaces',
    '[ ] Construction plans: floor plans, structural framing, foundation details, cross-sections',
    '[ ] WA State Energy Code (WSEC) worksheets (required for heated/conditioned ADU space)',
    '[ ] Drainage plan: basic (< 2,000 sq ft impervious), engineered (>= 2,000 sq ft), DCP (> 5,000 sq ft)',
    '[ ] Fire flow: 750 GPM/45 min (< 3,600 sq ft) or 1,000 GPM/60 min (>= 3,600 sq ft); hydrant <= 350 ft',
    '[ ] Proof of water/sewer or septic approval (Pierce County Health Dept.)',
    '[ ] Environmental permits (shoreline, critical areas) if applicable',
  ];

  for (const item of submittalItems) {
    const lines = wrapText(item, font, 8, 500);
    for (const line of lines) {
      page.drawText(line, { x: 50, y: yPosition, size: 8, font });
      yPosition -= 12;
    }
  }

  // Signature Section
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'APPLICANT CERTIFICATION', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  page.drawText('I certify that the information provided is true and accurate, and that the ADU', {
    x: 50, y: yPosition, size: 10, font,
  });
  yPosition -= 14;
  page.drawText('will comply with all applicable building codes and zoning regulations.', {
    x: 50, y: yPosition, size: 10, font,
  });

  yPosition -= 20;
  yPosition = drawSignatureBlock(page, yPosition, font, boldFont, 'Property Owner Signature');

  // Footer & Watermark
  drawStandardFooter(page, font, 1, 1, docTitle);
  drawWatermarkMargin(page, font);

  return pdfDoc.save();
}

// ADU Building Permit DOCX
export async function generateADUBuildingPermitDOCX(project: Project): Promise<Blob> {
  const { owner, details } = project;
  const docTitle = 'ADU Building Permit Application';

  const aduTypeLabel = details.aduImprovements?.map(t =>
    t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  ).join(', ') || 'N/A';

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: DOCX_PAGE_MARGINS,
        },
      },
      headers: {
        default: createDocxHeader(docTitle),
      },
      footers: {
        default: createDocxFooter(docTitle),
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'ACCESSORY DWELLING UNIT (ADU)',
              bold: true,
              size: 28,
              color: '1A804D',
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Building Permit Application',
              bold: true,
              size: 28,
            }),
          ],
          spacing: { after: 400 },
        }),

        createDocxSectionHeading('PROPERTY OWNER INFORMATION', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('Name:', `${owner.firstName} ${owner.lastName}`),
        createFieldParagraph('Address:', owner.address),
        createFieldParagraph('City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`),
        createFieldParagraph('Phone:', owner.phone),
        createFieldParagraph('Email:', owner.email),
        createFieldParagraph('Parcel Number:', owner.parcelNumber || 'N/A'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('ADU SPECIFICATIONS', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('ADU Type:', aduTypeLabel),
        createFieldParagraph('Square Footage:', details.aduSquareFootage ? `${details.aduSquareFootage} sq ft` : 'N/A'),
        createFieldParagraph('Bedrooms:', details.aduBedrooms?.toString() || 'N/A'),
        createFieldParagraph('Bathrooms:', details.aduBathrooms?.toString() || 'N/A'),
        createFieldParagraph('Parking Spaces:', details.aduParkingSpaces?.toString() || 'N/A'),
        createFieldParagraph('Existing ADU on Property:', details.hasExistingADU ? 'Yes' : 'No'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('SITE CONDITIONS', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('Connected to Sewer:', details.onSewer ? 'Yes' : 'No - Septic Required'),
        createFieldParagraph('Within 200ft of Shoreline:', details.nearShoreline ? 'Yes - Shoreline Permit Required' : 'No'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('PROJECT DETAILS', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('Estimated Cost:', `$${details.estimatedCost?.toLocaleString() || '0'}`),
        createFieldParagraph('Planned Start Date:', details.startDate || 'TBD'),
        new Paragraph({
          children: [
            new TextRun({ text: 'Project Description:', bold: true }),
          ],
          spacing: { before: 200 },
        }),
        createBodyParagraph(details.description || 'Accessory Dwelling Unit construction.', { spacing: { after: 200 } }),

        createDocxHorizontalRule(),
        createDocxSectionHeading('ADU COMPLIANCE CHECKLIST', DOCX_COLORS.headerBandAdu),
        createChecklistItem('[ ] ADU does not exceed 1,000 sq ft (UGA) or 1,250 sq ft (outside UGA) — PCC 18A.37.120.D.1'),
        createChecklistItem('[ ] ADU height does not exceed principal dwelling height — PCC 18A.37.120.D.2.a'),
        createChecklistItem('[ ] Detached ADU setbacks: min 5 ft side/rear within UGA (2 ft rear abutting alley) — PCC 18A.37.120.D.3'),
        createChecklistItem('[ ] Lot does not already have 2 ADUs (UGA) or 1 ADU (outside UGA) — PCC 18A.37.120.C'),
        createChecklistItem('[ ] ADU meets current building code requirements'),
        createChecklistItem('[ ] Adequate water supply and sewer/septic capacity confirmed', { spacing: 200 }),

        createDocxHorizontalRule(),
        createDocxSectionHeading('PERMIT EXEMPTION NOTICE (PCC 17C.30.040)', DOCX_COLORS.headerBandAdu),
        new Paragraph({
          children: [
            new TextRun({ text: 'ADUs are NOT exempt from building permit', bold: true }),
            new TextRun({ text: ' (habitable space exclusion, §1(a)). The following ancillary work does NOT require a building permit:' }),
          ],
          spacing: { after: 100 },
        }),
        createBulletItem('Detached storage sheds <= 200 sq ft (non-habitable), >= 5 ft from other structures'),
        createBulletItem('Fences <= 6 ft high; retaining walls <= 4 ft (no surcharge)'),
        createBulletItem('Decks/sidewalks/driveways <= 30" above grade, not over a basement'),
        createBulletItem('Re-roofing (slope > 2:12, total load <= 7.5 lbs/sq ft, no sheathing replacement)'),
        createBulletItem('Siding replacement (no structural sheathing); finish work (paint, tile, carpet, cabinets)'),
        createBulletItem('Self-contained above-ground spas/hot tubs (not connected to potable water or sewer)', { spacing: 200 }),

        createDocxHorizontalRule(),
        createDocxSectionHeading('ADU-SPECIFIC SUBMITTAL REQUIREMENTS', DOCX_COLORS.headerBandAdu),
        createNoteParagraph('Per Pierce County ADU Standards (PCC 18A.37.120) & Residential Construction Guide'),
        createChecklistItem('[ ] Pre-Application Screening Form ($250 — recommended; required for critical areas/shoreline)'),
        createChecklistItem('[ ] Site plan (to scale): property lines, all structures with setbacks, easements, utilities, impervious surfaces'),
        createChecklistItem('[ ] Construction plans: floor plans, structural framing, foundation details, cross-sections'),
        createChecklistItem('[ ] WA State Energy Code (WSEC) worksheets (required for heated/conditioned ADU space)'),
        createChecklistItem('[ ] Drainage plan: basic (< 2,000 sq ft impervious), engineered (>= 2,000 sq ft), DCP (> 5,000 sq ft)'),
        createChecklistItem('[ ] Fire flow: 750 GPM/45 min (< 3,600 sq ft) or 1,000 GPM/60 min (>= 3,600 sq ft); hydrant <= 350 ft'),
        createChecklistItem('[ ] Proof of water/sewer or septic approval (Pierce County Health Dept.)'),
        createChecklistItem('[ ] Environmental permits (shoreline, critical areas) if applicable', { spacing: 200 }),

        createDocxHorizontalRule(),
        createDocxSectionHeading('APPLICANT CERTIFICATION', DOCX_COLORS.headerBandAdu),
        createBodyParagraph('I certify that the information provided is true and accurate, and that the ADU will comply with all applicable building codes and zoning regulations.', { spacing: { after: 400 } }),
        createDocxSignatureBlock('Property Owner Signature') as unknown as Paragraph,
      ],
    }],
  });

  return Packer.toBlob(doc);
}

// Planning Approval PDF
export async function generatePlanningApprovalPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { owner, details } = project;
  const docTitle = 'ADU Planning Approval Application';

  // Title
  page.drawText('ADU PLANNING APPROVAL APPLICATION', {
    x: 50,
    y: 740,
    size: 16,
    font: boldFont,
    color: rgb(0.1, 0.5, 0.3),
  });

  page.drawText('Zoning Compliance Review', {
    x: 50,
    y: 720,
    size: 14,
    font: boldFont,
  });

  // Property Information
  let yPosition = 690;
  yPosition = drawColoredHeaderBand(page, yPosition, 'PROPERTY INFORMATION', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const propertyFields = [
    ['Property Owner:', `${owner.firstName} ${owner.lastName}`],
    ['Property Address:', owner.address],
    ['City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`],
    ['Parcel Number:', owner.parcelNumber || 'N/A'],
    ['Phone:', owner.phone],
    ['Email:', owner.email],
  ];

  for (const [label, value] of propertyFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // ADU Proposal
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'ADU PROPOSAL DETAILS', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const aduTypeLabel = details.aduImprovements?.map(t =>
    t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  ).join(', ') || 'N/A';

  const proposalFields = [
    ['ADU Type:', aduTypeLabel],
    ['Proposed Size:', details.aduSquareFootage ? `${details.aduSquareFootage} sq ft` : 'N/A'],
    ['Number of Units:', '1'],
    ['Bedrooms:', details.aduBedrooms?.toString() || 'N/A'],
    ['Bathrooms:', details.aduBathrooms?.toString() || 'N/A'],
    ['Proposed Parking:', details.aduParkingSpaces?.toString() || 'N/A'],
  ];

  for (const [label, value] of proposalFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Zoning Information
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'ZONING INFORMATION', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const zoningFields = [
    ['Current Zoning:', '_______________________________'],
    ['Lot Size:', '_______________________________'],
    ['Primary Dwelling Size:', '_______________________________'],
    ['Year Built (Primary):', '_______________________________'],
  ];

  for (const [label, value] of zoningFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Required Findings
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'REQUIRED FINDINGS FOR APPROVAL', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const findings = [
    '[ ] Property is zoned residential with an existing single-family dwelling — PCC 18A.37.120.B',
    '[ ] ADU does not exceed 1,000 sq ft (UGA) or 1,250 sq ft (outside UGA) — PCC 18A.37.120.D.1',
    '[ ] ADU height does not exceed principal dwelling; or ADU above detached garage (+1 story allowed) — PCC 18A.37.120.D.2',
    '[ ] No ADU limited to less than 24 ft unless principal dwelling is under 24 ft — PCC 18A.37.120.D.2.c',
    '[ ] Setbacks met: 5 ft side/rear (UGA detached), 2 ft rear abutting alley, or zone standard — PCC 18A.37.120.D.3',
    '[ ] Existing detached structure conversion within side/rear setback allowed (UGA) — PCC 18A.37.120.D.3',
    '[ ] Parking: not required within ½ mile of major transit stop (RCW 36.70A.681)',
    '[ ] Street improvements not required as condition of approval — PCC 18A.37.120.D.5',
    '[ ] Lot does not exceed ADU limit: 2 (UGA) or 1 (outside UGA) — PCC 18A.37.120.C',
  ];

  for (const finding of findings) {
    const lines = wrapText(finding, font, 9, 500);
    for (const line of lines) {
      page.drawText(line, { x: 50, y: yPosition, size: 9, font });
      yPosition -= 14;
    }
  }

  // Required Attachments
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'REQUIRED ATTACHMENTS', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const attachments = [
    '[ ] Site plan showing ADU location and setbacks',
    '[ ] Floor plans of proposed ADU',
    '[ ] Elevations of proposed ADU',
    '[ ] Photographs of existing property',
  ];

  for (const attachment of attachments) {
    page.drawText(attachment, { x: 50, y: yPosition, size: 9, font });
    yPosition -= 14;
  }

  // Signature Section
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'APPLICANT CERTIFICATION', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  page.drawText('I certify that the information provided is true and accurate to the best of my knowledge.', {
    x: 50, y: yPosition, size: 10, font,
  });

  yPosition -= 20;
  yPosition = drawSignatureBlock(page, yPosition, font, boldFont, 'Property Owner Signature');

  // Footer & Watermark
  drawStandardFooter(page, font, 1, 1, docTitle);
  drawWatermarkMargin(page, font);

  return pdfDoc.save();
}

// Planning Approval DOCX
export async function generatePlanningApprovalDOCX(project: Project): Promise<Blob> {
  const { owner, details } = project;
  const docTitle = 'ADU Planning Approval Application';

  const aduTypeLabel = details.aduImprovements?.map(t =>
    t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  ).join(', ') || 'N/A';

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: DOCX_PAGE_MARGINS,
        },
      },
      headers: {
        default: createDocxHeader(docTitle),
      },
      footers: {
        default: createDocxFooter(docTitle),
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'ADU PLANNING APPROVAL APPLICATION',
              bold: true,
              size: 28,
              color: '1A804D',
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Zoning Compliance Review',
              bold: true,
              size: 28,
            }),
          ],
          spacing: { after: 400 },
        }),

        createDocxSectionHeading('PROPERTY INFORMATION', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('Property Owner:', `${owner.firstName} ${owner.lastName}`),
        createFieldParagraph('Property Address:', owner.address),
        createFieldParagraph('City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`),
        createFieldParagraph('Parcel Number:', owner.parcelNumber || 'N/A'),
        createFieldParagraph('Phone:', owner.phone),
        createFieldParagraph('Email:', owner.email),

        createDocxHorizontalRule(),
        createDocxSectionHeading('ADU PROPOSAL DETAILS', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('ADU Type:', aduTypeLabel),
        createFieldParagraph('Proposed Size:', details.aduSquareFootage ? `${details.aduSquareFootage} sq ft` : 'N/A'),
        createFieldParagraph('Number of Units:', '1'),
        createFieldParagraph('Bedrooms:', details.aduBedrooms?.toString() || 'N/A'),
        createFieldParagraph('Bathrooms:', details.aduBathrooms?.toString() || 'N/A'),
        createFieldParagraph('Proposed Parking:', details.aduParkingSpaces?.toString() || 'N/A'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('ZONING INFORMATION', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('Current Zoning:', '_______________________________'),
        createFieldParagraph('Lot Size:', '_______________________________'),
        createFieldParagraph('Primary Dwelling Size:', '_______________________________'),
        createFieldParagraph('Year Built (Primary):', '_______________________________'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('REQUIRED FINDINGS FOR APPROVAL', DOCX_COLORS.headerBandAdu),
        createNoteParagraph('Per Pierce County Code Title 18A — Development Regulations, Chapter 18A.37.120'),
        createChecklistItem('[ ] Property is zoned residential with an existing single-family dwelling — PCC 18A.37.120.B'),
        createChecklistItem('[ ] ADU does not exceed 1,000 sq ft (UGA) or 1,250 sq ft (outside UGA) — PCC 18A.37.120.D.1'),
        createChecklistItem('[ ] ADU height does not exceed principal dwelling; or ADU above detached garage (+1 story) — PCC 18A.37.120.D.2'),
        createChecklistItem('[ ] No ADU limited to less than 24 ft unless principal dwelling is under 24 ft — PCC 18A.37.120.D.2.c'),
        createChecklistItem('[ ] Setbacks met: 5 ft side/rear (UGA detached), 2 ft rear abutting alley, or zone standard — PCC 18A.37.120.D.3'),
        createChecklistItem('[ ] Existing structure conversion within side/rear setback allowed (UGA) — PCC 18A.37.120.D.3'),
        createChecklistItem('[ ] Parking: not required within ½ mile of major transit stop (RCW 36.70A.681)'),
        createChecklistItem('[ ] Street improvements not required as condition of approval — PCC 18A.37.120.D.5'),
        createChecklistItem('[ ] Lot does not exceed ADU limit: 2 (UGA) or 1 (outside UGA) — PCC 18A.37.120.C', { spacing: 200 }),

        createDocxHorizontalRule(),
        createDocxSectionHeading('REQUIRED ATTACHMENTS', DOCX_COLORS.headerBandAdu),
        createChecklistItem('[ ] Site plan showing ADU location and setbacks'),
        createChecklistItem('[ ] Floor plans of proposed ADU'),
        createChecklistItem('[ ] Elevations of proposed ADU'),
        createChecklistItem('[ ] Photographs of existing property', { spacing: 200 }),

        createDocxHorizontalRule(),
        createDocxSectionHeading('APPLICANT CERTIFICATION', DOCX_COLORS.headerBandAdu),
        createBodyParagraph('I certify that the information provided is true and accurate to the best of my knowledge.', { spacing: { after: 400 } }),
        createDocxSignatureBlock('Property Owner Signature') as unknown as Paragraph,
      ],
    }],
  });

  return Packer.toBlob(doc);
}

// Septic Permit PDF (for properties not on sewer)
export async function generateSepticPermitPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { owner, details } = project;
  const docTitle = 'Septic System Permit Application';

  // Title
  page.drawText('SEPTIC SYSTEM PERMIT APPLICATION', {
    x: 50,
    y: 740,
    size: 16,
    font: boldFont,
    color: rgb(0.1, 0.5, 0.3),
  });

  page.drawText('Accessory Dwelling Unit Addition', {
    x: 50,
    y: 720,
    size: 14,
    font: boldFont,
  });

  // Property Owner Section
  let yPosition = 690;
  yPosition = drawColoredHeaderBand(page, yPosition, 'PROPERTY OWNER INFORMATION', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const ownerFields = [
    ['Name:', `${owner.firstName} ${owner.lastName}`],
    ['Property Address:', owner.address],
    ['City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`],
    ['Phone:', owner.phone],
    ['Email:', owner.email],
    ['Parcel Number:', owner.parcelNumber || 'N/A'],
  ];

  for (const [label, value] of ownerFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // ADU Details affecting septic
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'ADU WASTEWATER REQUIREMENTS', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const aduFields = [
    ['ADU Square Footage:', details.aduSquareFootage ? `${details.aduSquareFootage} sq ft` : 'N/A'],
    ['Number of Bedrooms:', details.aduBedrooms?.toString() || 'N/A'],
    ['Number of Bathrooms:', details.aduBathrooms?.toString() || 'N/A'],
    ['Estimated Daily Flow:', details.aduBedrooms ? `${details.aduBedrooms * 110} gallons` : 'N/A'],
  ];

  for (const [label, value] of aduFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 180, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Existing System Information
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'EXISTING SEPTIC SYSTEM', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const systemFields = [
    ['System Type:', '_______________________________'],
    ['Tank Size:', '_______________________________'],
    ['Drainfield Size:', '_______________________________'],
    ['Year Installed:', '_______________________________'],
    ['Last Pumped:', '_______________________________'],
  ];

  for (const [label, value] of systemFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Required Actions
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'REQUIRED ACTIONS', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const actions = [
    '[ ] Site evaluation by licensed designer',
    '[ ] Soil log and percolation test',
    '[ ] Septic system design by licensed designer',
    '[ ] Existing system capacity assessment',
    '[ ] Proposed system modification or expansion plan',
  ];

  for (const action of actions) {
    page.drawText(action, { x: 50, y: yPosition, size: 9, font });
    yPosition -= 14;
  }

  // Signature Section
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'APPLICANT CERTIFICATION', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  page.drawText('I certify that the information provided is true and accurate.', {
    x: 50, y: yPosition, size: 10, font,
  });

  yPosition -= 20;
  yPosition = drawSignatureBlock(page, yPosition, font, boldFont, 'Property Owner Signature');

  // Footer & Watermark
  drawStandardFooter(page, font, 1, 1, docTitle);
  drawWatermarkMargin(page, font);

  return pdfDoc.save();
}

// Septic Permit DOCX
export async function generateSepticPermitDOCX(project: Project): Promise<Blob> {
  const { owner, details } = project;
  const docTitle = 'Septic System Permit Application';

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: DOCX_PAGE_MARGINS,
        },
      },
      headers: {
        default: createDocxHeader(docTitle),
      },
      footers: {
        default: createDocxFooter(docTitle),
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'SEPTIC SYSTEM PERMIT APPLICATION',
              bold: true,
              size: 28,
              color: '1A804D',
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Accessory Dwelling Unit Addition',
              bold: true,
              size: 28,
            }),
          ],
          spacing: { after: 400 },
        }),

        createDocxSectionHeading('PROPERTY OWNER INFORMATION', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('Name:', `${owner.firstName} ${owner.lastName}`),
        createFieldParagraph('Property Address:', owner.address),
        createFieldParagraph('City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`),
        createFieldParagraph('Phone:', owner.phone),
        createFieldParagraph('Email:', owner.email),
        createFieldParagraph('Parcel Number:', owner.parcelNumber || 'N/A'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('ADU WASTEWATER REQUIREMENTS', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('ADU Square Footage:', details.aduSquareFootage ? `${details.aduSquareFootage} sq ft` : 'N/A'),
        createFieldParagraph('Number of Bedrooms:', details.aduBedrooms?.toString() || 'N/A'),
        createFieldParagraph('Number of Bathrooms:', details.aduBathrooms?.toString() || 'N/A'),
        createFieldParagraph('Estimated Daily Flow:', details.aduBedrooms ? `${details.aduBedrooms * 110} gallons` : 'N/A'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('EXISTING SEPTIC SYSTEM', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('System Type:', '_______________________________'),
        createFieldParagraph('Tank Size:', '_______________________________'),
        createFieldParagraph('Drainfield Size:', '_______________________________'),
        createFieldParagraph('Year Installed:', '_______________________________'),
        createFieldParagraph('Last Pumped:', '_______________________________'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('REQUIRED ACTIONS', DOCX_COLORS.headerBandAdu),
        createChecklistItem('[ ] Site evaluation by licensed designer'),
        createChecklistItem('[ ] Soil log and percolation test'),
        createChecklistItem('[ ] Septic system design by licensed designer'),
        createChecklistItem('[ ] Existing system capacity assessment'),
        createChecklistItem('[ ] Proposed system modification or expansion plan', { spacing: 200 }),

        createDocxHorizontalRule(),
        createDocxSectionHeading('APPLICANT CERTIFICATION', DOCX_COLORS.headerBandAdu),
        createBodyParagraph('I certify that the information provided is true and accurate.', { spacing: { after: 400 } }),
        createDocxSignatureBlock('Property Owner Signature') as unknown as Paragraph,
      ],
    }],
  });

  return Packer.toBlob(doc);
}

// ADU Shoreline Permit PDF (for properties near water)
export async function generateADUShorelinePermitPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { owner, details, site } = project;
  const docTitle = 'Shoreline Substantial Development Permit';

  // Title
  page.drawText('SHORELINE SUBSTANTIAL DEVELOPMENT PERMIT', {
    x: 50,
    y: 740,
    size: 14,
    font: boldFont,
    color: rgb(0.1, 0.5, 0.3),
  });

  page.drawText('Accessory Dwelling Unit Near Shoreline', {
    x: 50,
    y: 720,
    size: 14,
    font: boldFont,
  });

  // Property Owner Section
  let yPosition = 690;
  yPosition = drawColoredHeaderBand(page, yPosition, 'PROPERTY OWNER INFORMATION', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const ownerFields = [
    ['Name:', `${owner.firstName} ${owner.lastName}`],
    ['Property Address:', owner.address],
    ['City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`],
    ['Phone:', owner.phone],
    ['Email:', owner.email],
    ['Parcel Number:', owner.parcelNumber || 'N/A'],
  ];

  for (const [label, value] of ownerFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Site Information
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'SITE CHARACTERISTICS', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const siteFields = [
    ['Water Body:', 'Lake Tapps'],
    ['Distance to OHWM:', '_______________________________'],
    ['Shoreline Designation:', '_______________________________'],
    ['Water Frontage:', site.waterFrontage ? `${site.waterFrontage} feet` : 'N/A'],
    ['Existing Structures in Buffer:', '_______________________________'],
  ];

  for (const [label, value] of siteFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 180, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // ADU Proposal
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'ADU PROPOSAL', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const aduTypeLabel = details.aduImprovements?.map(t =>
    t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  ).join(', ') || 'N/A';

  const aduFields = [
    ['ADU Type:', aduTypeLabel],
    ['ADU Size:', details.aduSquareFootage ? `${details.aduSquareFootage} sq ft` : 'N/A'],
    ['Estimated Cost:', `$${details.estimatedCost?.toLocaleString() || '0'}`],
    ['Distance to Shoreline:', '_______________________________'],
    ['Height Above Grade:', '_______________________________'],
  ];

  for (const [label, value] of aduFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Required Findings
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'SHORELINE MASTER PROGRAM COMPLIANCE', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  // ADU Non-Exemption Notice
  page.drawText('NOTE: ADUs are NOT exempt from shoreline substantial development', {
    x: 50, y: yPosition, size: 9, font: boldFont, color: rgb(0.7, 0.1, 0.1),
  });
  yPosition -= 13;
  page.drawText('permits per PCC 18S.60.020 — "not considered a normal appurtenance."', {
    x: 50, y: yPosition, size: 9, font, color: rgb(0.7, 0.1, 0.1),
  });
  yPosition -= 13;
  page.drawText('SEPA: <= 4 residential units categorically exempt (WAC 197-11-800(1)),', {
    x: 50, y: yPosition, size: 8, font, color: rgb(0.3, 0.4, 0.3),
  });
  yPosition -= 11;
  page.drawText('but shoreline permit is still required.', {
    x: 50, y: yPosition, size: 8, font, color: rgb(0.3, 0.4, 0.3),
  });

  yPosition -= 20;
  const findings = [
    '[ ] ADU is located landward of the required shoreline buffer',
    '[ ] No net loss of shoreline ecological functions',
    '[ ] ADU is consistent with local shoreline master program (PCC Title 18S)',
    '[ ] Stormwater management plan provided',
    '[ ] Vegetation management plan provided',
    '[ ] ADU design minimizes visual impact on shoreline',
  ];

  for (const finding of findings) {
    page.drawText(finding, { x: 50, y: yPosition, size: 9, font });
    yPosition -= 14;
  }

  // Required Attachments
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'REQUIRED ATTACHMENTS', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  const attachments = [
    '[ ] Site plan showing shoreline buffer and ADU location',
    '[ ] Elevation drawings',
    '[ ] Critical areas study (if applicable)',
    '[ ] Stormwater management plan',
  ];

  for (const attachment of attachments) {
    page.drawText(attachment, { x: 50, y: yPosition, size: 9, font });
    yPosition -= 14;
  }

  // Signature Section
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);
  yPosition = drawColoredHeaderBand(page, yPosition, 'APPLICANT CERTIFICATION', ADU_HEADER_BAND, boldFont);

  yPosition -= 10;
  page.drawText('I certify that the information provided is true and accurate.', {
    x: 50, y: yPosition, size: 10, font,
  });

  yPosition -= 20;
  yPosition = drawSignatureBlock(page, yPosition, font, boldFont, 'Property Owner Signature');

  // Footer & Watermark
  drawStandardFooter(page, font, 1, 1, docTitle);
  drawWatermarkMargin(page, font);

  return pdfDoc.save();
}

// ADU Shoreline Permit DOCX
export async function generateADUShorelinePermitDOCX(project: Project): Promise<Blob> {
  const { owner, details, site } = project;
  const docTitle = 'Shoreline Substantial Development Permit';

  const aduTypeLabel = details.aduImprovements?.map(t =>
    t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  ).join(', ') || 'N/A';

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: DOCX_PAGE_MARGINS,
        },
      },
      headers: {
        default: createDocxHeader(docTitle),
      },
      footers: {
        default: createDocxFooter(docTitle),
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'SHORELINE SUBSTANTIAL DEVELOPMENT PERMIT',
              bold: true,
              size: 28,
              color: '1A804D',
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Accessory Dwelling Unit Near Shoreline',
              bold: true,
              size: 24,
            }),
          ],
          spacing: { after: 400 },
        }),

        createDocxSectionHeading('PROPERTY OWNER INFORMATION', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('Name:', `${owner.firstName} ${owner.lastName}`),
        createFieldParagraph('Property Address:', owner.address),
        createFieldParagraph('City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`),
        createFieldParagraph('Phone:', owner.phone),
        createFieldParagraph('Email:', owner.email),
        createFieldParagraph('Parcel Number:', owner.parcelNumber || 'N/A'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('SITE CHARACTERISTICS', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('Water Body:', 'Lake Tapps'),
        createFieldParagraph('Distance to OHWM:', '_______________________________'),
        createFieldParagraph('Shoreline Designation:', '_______________________________'),
        createFieldParagraph('Water Frontage:', site.waterFrontage ? `${site.waterFrontage} feet` : 'N/A'),
        createFieldParagraph('Existing Structures in Buffer:', '_______________________________'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('ADU PROPOSAL', DOCX_COLORS.headerBandAdu),
        createFieldParagraph('ADU Type:', aduTypeLabel),
        createFieldParagraph('ADU Size:', details.aduSquareFootage ? `${details.aduSquareFootage} sq ft` : 'N/A'),
        createFieldParagraph('Estimated Cost:', `$${details.estimatedCost?.toLocaleString() || '0'}`),
        createFieldParagraph('Distance to Shoreline:', '_______________________________'),
        createFieldParagraph('Height Above Grade:', '_______________________________'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('SHORELINE MASTER PROGRAM COMPLIANCE', DOCX_COLORS.headerBandAdu),
        new Paragraph({
          children: [
            new TextRun({ text: 'NOTE: ', bold: true, color: DOCX_COLORS.warningRed }),
            new TextRun({ text: 'ADUs are NOT exempt from shoreline substantial development permits per PCC 18S.60.020 — "additional dwellings, such as accessory dwelling units, shall not be considered a normal appurtenance." SEPA: <= 4 residential units categorically exempt (WAC 197-11-800(1)), but shoreline permit is still required.', color: DOCX_COLORS.warningRed }),
          ],
          spacing: { after: 200 },
        }),
        createChecklistItem('[ ] ADU is located landward of the required shoreline buffer'),
        createChecklistItem('[ ] No net loss of shoreline ecological functions'),
        createChecklistItem('[ ] ADU is consistent with local shoreline master program (PCC Title 18S)'),
        createChecklistItem('[ ] Stormwater management plan provided'),
        createChecklistItem('[ ] Vegetation management plan provided'),
        createChecklistItem('[ ] ADU design minimizes visual impact on shoreline', { spacing: 200 }),

        createDocxHorizontalRule(),
        createDocxSectionHeading('REQUIRED ATTACHMENTS', DOCX_COLORS.headerBandAdu),
        createChecklistItem('[ ] Site plan showing shoreline buffer and ADU location'),
        createChecklistItem('[ ] Elevation drawings'),
        createChecklistItem('[ ] Critical areas study (if applicable)'),
        createChecklistItem('[ ] Stormwater management plan', { spacing: 200 }),

        createDocxHorizontalRule(),
        createDocxSectionHeading('APPLICANT CERTIFICATION', DOCX_COLORS.headerBandAdu),
        createBodyParagraph('I certify that the information provided is true and accurate.', { spacing: { after: 400 } }),
        createDocxSignatureBlock('Property Owner Signature') as unknown as Paragraph,
      ],
    }],
  });

  return Packer.toBlob(doc);
}

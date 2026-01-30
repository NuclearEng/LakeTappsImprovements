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

const HEADER_BAND_SOLAR = { r: 1.0, g: 0.94, b: 0.84 };

// Solar Building Permit PDF
export async function generateSolarBuildingPermitPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { owner, details } = project;
  const docTitle = 'Solar Installation — Building Permit Application';
  const totalPages = 1;

  // Title
  page.drawText('SOLAR INSTALLATION', {
    x: MARGIN_LEFT,
    y: 740,
    size: 16,
    font: boldFont,
    color: rgb(COLORS.solar.r, COLORS.solar.g, COLORS.solar.b),
  });

  page.drawText('Building Permit Application', {
    x: MARGIN_LEFT,
    y: 720,
    size: 14,
    font: boldFont,
  });

  // Property Owner Section
  let yPosition = 695;
  yPosition = drawColoredHeaderBand(page, yPosition, 'PROPERTY OWNER INFORMATION', HEADER_BAND_SOLAR, boldFont);

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
    page.drawText(label, { x: MARGIN_LEFT, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Horizontal rule between sections
  yPosition -= 4;
  yPosition = drawHorizontalRule(page, yPosition);

  // Solar System Information
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'SOLAR SYSTEM SPECIFICATIONS', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  const systemFields = [
    ['System Type:', details.solarImprovements?.map(t => t.replace(/_/g, ' ')).join(', ') || 'N/A'],
    ['System Size:', details.solarSystemSize ? `${details.solarSystemSize} kW` : 'N/A'],
    ['Panel Count:', details.panelCount?.toString() || 'N/A'],
    ['Mounting Type:', details.mountingType?.replace(/_/g, ' ') || 'N/A'],
    ['Inverter Type:', details.inverterType?.replace(/_/g, ' ') || 'N/A'],
    ['Battery Storage:', details.batteryCapacity ? `${details.batteryCapacity} kWh` : 'None'],
    ['Utility Provider:', details.utilityProvider || 'N/A'],
  ];

  for (const [label, value] of systemFields) {
    page.drawText(label, { x: MARGIN_LEFT, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 180, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Horizontal rule between sections
  yPosition -= 4;
  yPosition = drawHorizontalRule(page, yPosition);

  // Project Details
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'PROJECT DETAILS', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  const projectFields = [
    ['Estimated Cost:', `$${details.estimatedCost?.toLocaleString() || '0'}`],
    ['Planned Start Date:', details.startDate || 'TBD'],
  ];

  for (const [label, value] of projectFields) {
    page.drawText(label, { x: MARGIN_LEFT, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Horizontal rule between sections
  yPosition -= 4;
  yPosition = drawHorizontalRule(page, yPosition);

  // Pierce County Code Compliance Checklist
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'PIERCE COUNTY CODE COMPLIANCE', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  page.drawText('Per Technical Bulletin — Residential Rooftop PV Panel Systems (2021 International Codes)', {
    x: MARGIN_LEFT,
    y: yPosition,
    size: 7,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  yPosition -= 14;
  const complianceChecklist = [
    '[ ] 2021 IRC R324 (WA amended), NFPA 70, UL 1741, IFC R104.11 & 1205',
    '[ ] Designed for local wind speed per manufacturer specs',
    '[ ] Dead load <= 4 lbs/sq ft; no point loads > 50 lbs',
    '[ ] Panels mounted <= 18" above roof surface',
    '[ ] Min. 36" unobstructed pathway, roof edge to ridge (IFC 1204.2.1.1)',
    '[ ] Ridge setback: >=18" (<=33% roof area) or >=36" (>33% roof area)',
    '[ ] Rapid shutdown labels per IFC 1204.5.1–1204.5.3',
    '[ ] Plumbing vents not covered (or Pierce County approval obtained)',
  ];

  for (const item of complianceChecklist) {
    page.drawText(item, { x: MARGIN_LEFT, y: yPosition, size: 9, font });
    yPosition -= 14;
  }

  // Horizontal rule between sections
  yPosition -= 4;
  yPosition = drawHorizontalRule(page, yPosition);

  // Submittal Requirements
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'SUBMITTAL REQUIREMENTS', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  const submittalItems = [
    '[ ] Completed Residential Building Permit Application',
    '[ ] Roof PV panel layout with AC disconnect — dimensioned, drawn to scale',
    '[ ] Dead load documentation (panels, supports, raceways <= 4 lbs/sq ft)',
    '[ ] Manufacturer specs & listing info for PV panels, racking, and hardware',
    '[ ] Inverter specs & listing (must be listed for utility interaction)',
    '[ ] Installation procedures — moisture intrusion protection & roof connection',
  ];

  for (const item of submittalItems) {
    page.drawText(item, { x: MARGIN_LEFT, y: yPosition, size: 9, font });
    yPosition -= 14;
  }

  // Engineering note
  yPosition -= 10;
  page.drawText('Engineering required if: dead load > 4 lbs/sq ft, point load > 50 lbs, or snow load >= 70 lbs/sq ft', {
    x: MARGIN_LEFT,
    y: yPosition,
    size: 8,
    font,
    color: rgb(0.6, 0.2, 0.2),
  });

  // Horizontal rule before description
  yPosition -= 10;
  yPosition = drawHorizontalRule(page, yPosition);

  // Description
  yPosition -= 4;
  page.drawText('Project Description:', { x: MARGIN_LEFT, y: yPosition, size: 10, font: boldFont });
  yPosition -= 15;

  const description = details.description || 'Solar panel installation for residential property.';
  const maxWidth = TABLE_WIDTH;
  yPosition = drawWrappedText(page, description, MARGIN_LEFT, yPosition, font, 10, maxWidth);

  // Horizontal rule before signature
  yPosition -= 12;
  yPosition = drawHorizontalRule(page, yPosition);

  // Signature Section
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'APPLICANT CERTIFICATION', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  const certText = 'I certify that the information provided is true and accurate, and that the installation will comply with all applicable building codes and regulations.';
  yPosition = drawWrappedText(page, certText, MARGIN_LEFT, yPosition, font, 10, maxWidth);

  yPosition -= 10;
  yPosition = drawSignatureBlock(page, yPosition, font, boldFont, 'Applicant Signature');

  // Watermark and footer
  drawWatermarkMargin(page, font);
  drawStandardFooter(page, font, 1, totalPages, docTitle);

  return pdfDoc.save();
}

// Solar Building Permit DOCX
export async function generateSolarBuildingPermitDOCX(project: Project): Promise<Blob> {
  const { owner, details } = project;
  const docTitle = 'Solar Installation — Building Permit Application';

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
              text: 'SOLAR INSTALLATION',
              bold: true,
              size: 28,
              color: DOCX_COLORS.solar,
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

        createDocxSectionHeading('PROPERTY OWNER INFORMATION', DOCX_COLORS.headerBandSolar),
        createFieldParagraph('Name:', `${owner.firstName} ${owner.lastName}`),
        createFieldParagraph('Address:', owner.address),
        createFieldParagraph('City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`),
        createFieldParagraph('Phone:', owner.phone),
        createFieldParagraph('Email:', owner.email),
        createFieldParagraph('Parcel Number:', owner.parcelNumber || 'N/A'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('SOLAR SYSTEM SPECIFICATIONS', DOCX_COLORS.headerBandSolar),
        createFieldParagraph('System Type:', details.solarImprovements?.map(t => t.replace(/_/g, ' ')).join(', ') || 'N/A'),
        createFieldParagraph('System Size:', details.solarSystemSize ? `${details.solarSystemSize} kW` : 'N/A'),
        createFieldParagraph('Panel Count:', details.panelCount?.toString() || 'N/A'),
        createFieldParagraph('Mounting Type:', details.mountingType?.replace(/_/g, ' ') || 'N/A'),
        createFieldParagraph('Inverter Type:', details.inverterType?.replace(/_/g, ' ') || 'N/A'),
        createFieldParagraph('Battery Storage:', details.batteryCapacity ? `${details.batteryCapacity} kWh` : 'None'),
        createFieldParagraph('Utility Provider:', details.utilityProvider || 'N/A'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('PROJECT DETAILS', DOCX_COLORS.headerBandSolar),
        createFieldParagraph('Estimated Cost:', `$${details.estimatedCost?.toLocaleString() || '0'}`),
        createFieldParagraph('Planned Start Date:', details.startDate || 'TBD'),
        new Paragraph({
          children: [
            new TextRun({ text: 'Project Description:', bold: true }),
          ],
          spacing: { before: 200 },
        }),
        new Paragraph({
          text: details.description || 'Solar panel installation for residential property.',
          spacing: { after: 200 },
        }),

        createDocxHorizontalRule(),
        createDocxSectionHeading('PIERCE COUNTY CODE COMPLIANCE', DOCX_COLORS.headerBandSolar),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Per Technical Bulletin — Residential Rooftop PV Panel Systems (2021 International Codes, Rev. 3/26/2024)',
              size: 16,
              color: '666666',
              italics: true,
            }),
          ],
          spacing: { after: 120 },
        }),
        ...[
          '2021 IRC R324 (WA amended), NFPA 70, UL 1741, IFC R104.11 & 1205',
          'Designed for local wind speed per manufacturer specs',
          'Dead load <= 4 lbs/sq ft; no point loads > 50 lbs',
          'Panels mounted <= 18" above roof surface',
          'Min. 36" unobstructed pathway, roof edge to ridge (IFC 1204.2.1.1)',
          'Ridge setback: >=18" (<=33% roof area) or >=36" (>33% roof area)',
          'Rapid shutdown labels per IFC 1204.5.1\u20131204.5.3',
          'Plumbing vents not covered (or Pierce County approval obtained)',
        ].map(item => createChecklistItem(`[ ]  ${item}`)),

        createDocxHorizontalRule(),
        createDocxSectionHeading('SUBMITTAL REQUIREMENTS', DOCX_COLORS.headerBandSolar),
        ...[
          'Completed Residential Building Permit Application',
          'Roof PV panel layout with AC disconnect — dimensioned, drawn to scale',
          'Dead load documentation (panels, supports, raceways <= 4 lbs/sq ft)',
          'Manufacturer specs & listing info for PV panels, racking, and hardware',
          'Inverter specs & listing (must be listed for utility interaction)',
          'Installation procedures — moisture intrusion protection & roof connection',
        ].map(item => createChecklistItem(`[ ]  ${item}`)),
        createNoteParagraph('Engineering required if: dead load > 4 lbs/sq ft, point load > 50 lbs, or snow load >= 70 lbs/sq ft', DOCX_COLORS.noteRed),

        createDocxHorizontalRule(),
        createDocxSectionHeading('APPLICANT CERTIFICATION', DOCX_COLORS.headerBandSolar),
        createBodyParagraph('I certify that the information provided is true and accurate, and that the installation will comply with all applicable building codes and regulations.', { spacing: { after: 400 } }),
        createDocxSignatureBlock('Applicant Signature') as unknown as Paragraph,
      ],
    }],
  });

  return Packer.toBlob(doc);
}

// Electrical Permit PDF
export async function generateElectricalPermitPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { owner, details } = project;
  const docTitle = 'Electrical Permit Application — Solar PV System';
  const totalPages = 1;

  // Title
  page.drawText('ELECTRICAL PERMIT APPLICATION', {
    x: MARGIN_LEFT,
    y: 740,
    size: 16,
    font: boldFont,
    color: rgb(COLORS.solar.r, COLORS.solar.g, COLORS.solar.b),
  });

  page.drawText('Solar Photovoltaic System Installation', {
    x: MARGIN_LEFT,
    y: 720,
    size: 14,
    font: boldFont,
  });

  // Property Owner Section
  let yPosition = 695;
  yPosition = drawColoredHeaderBand(page, yPosition, 'PROPERTY OWNER INFORMATION', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  const ownerFields = [
    ['Name:', `${owner.firstName} ${owner.lastName}`],
    ['Address:', owner.address],
    ['City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`],
    ['Phone:', owner.phone],
    ['Email:', owner.email],
  ];

  for (const [label, value] of ownerFields) {
    page.drawText(label, { x: MARGIN_LEFT, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 170, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Horizontal rule
  yPosition -= 4;
  yPosition = drawHorizontalRule(page, yPosition);

  // Electrical System Details
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'ELECTRICAL SYSTEM DETAILS', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  const electricalFields = [
    ['System Size (DC):', details.solarSystemSize ? `${details.solarSystemSize} kW` : 'N/A'],
    ['Panel Count:', details.panelCount?.toString() || 'N/A'],
    ['Inverter Type:', details.inverterType?.replace(/_/g, ' ') || 'N/A'],
    ['Battery Storage:', details.batteryCapacity ? `${details.batteryCapacity} kWh` : 'None'],
    ['Grid Connection:', 'Grid-Tied with Net Metering'],
    ['Utility Provider:', details.utilityProvider || 'N/A'],
  ];

  for (const [label, value] of electricalFields) {
    page.drawText(label, { x: MARGIN_LEFT, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 180, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Horizontal rule
  yPosition -= 4;
  yPosition = drawHorizontalRule(page, yPosition);

  // Code Compliance
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'CODE COMPLIANCE', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  const complianceItems = [
    '[ ] NEC Article 690 - Solar Photovoltaic Systems',
    '[ ] NEC Article 705 - Interconnected Electric Power Production Sources',
    '[ ] NEC Article 706 - Energy Storage Systems (if applicable)',
    '[ ] Local utility interconnection requirements',
    '[ ] Rapid shutdown requirements per NEC 690.12',
  ];

  for (const item of complianceItems) {
    page.drawText(item, { x: MARGIN_LEFT, y: yPosition, size: 10, font });
    yPosition -= 16;
  }

  // Horizontal rule
  yPosition -= 4;
  yPosition = drawHorizontalRule(page, yPosition);

  // Contractor Information
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'LICENSED ELECTRICAL CONTRACTOR', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  page.drawText('Contractor Name: _________________________________', { x: MARGIN_LEFT, y: yPosition, size: 10, font });
  yPosition -= 18;
  page.drawText('License Number: _________________________________', { x: MARGIN_LEFT, y: yPosition, size: 10, font });
  yPosition -= 18;
  page.drawText('Phone: _________________________________________', { x: MARGIN_LEFT, y: yPosition, size: 10, font });

  // Horizontal rule
  yPosition -= 12;
  yPosition = drawHorizontalRule(page, yPosition);

  // Signature Section
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'SIGNATURES', HEADER_BAND_SOLAR, boldFont);
  yPosition -= 10;

  yPosition = drawSignatureBlock(page, yPosition, font, boldFont, 'Property Owner Signature');
  yPosition -= 4;
  yPosition = drawSignatureBlock(page, yPosition, font, boldFont, 'Contractor Signature');

  // Watermark and footer
  drawWatermarkMargin(page, font);
  drawStandardFooter(page, font, 1, totalPages, docTitle);

  return pdfDoc.save();
}

// Electrical Permit DOCX
export async function generateElectricalPermitDOCX(project: Project): Promise<Blob> {
  const { owner, details } = project;
  const docTitle = 'Electrical Permit Application — Solar PV System';

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
              text: 'ELECTRICAL PERMIT APPLICATION',
              bold: true,
              size: 28,
              color: DOCX_COLORS.solar,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Solar Photovoltaic System Installation',
              bold: true,
              size: 28,
            }),
          ],
          spacing: { after: 400 },
        }),

        createDocxSectionHeading('PROPERTY OWNER INFORMATION', DOCX_COLORS.headerBandSolar),
        createFieldParagraph('Name:', `${owner.firstName} ${owner.lastName}`),
        createFieldParagraph('Address:', owner.address),
        createFieldParagraph('City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`),
        createFieldParagraph('Phone:', owner.phone),
        createFieldParagraph('Email:', owner.email),

        createDocxHorizontalRule(),
        createDocxSectionHeading('ELECTRICAL SYSTEM DETAILS', DOCX_COLORS.headerBandSolar),
        createFieldParagraph('System Size (DC):', details.solarSystemSize ? `${details.solarSystemSize} kW` : 'N/A'),
        createFieldParagraph('Panel Count:', details.panelCount?.toString() || 'N/A'),
        createFieldParagraph('Inverter Type:', details.inverterType?.replace(/_/g, ' ') || 'N/A'),
        createFieldParagraph('Battery Storage:', details.batteryCapacity ? `${details.batteryCapacity} kWh` : 'None'),
        createFieldParagraph('Grid Connection:', 'Grid-Tied with Net Metering'),
        createFieldParagraph('Utility Provider:', details.utilityProvider || 'N/A'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('CODE COMPLIANCE', DOCX_COLORS.headerBandSolar),
        createChecklistItem('[ ] NEC Article 690 - Solar Photovoltaic Systems'),
        createChecklistItem('[ ] NEC Article 705 - Interconnected Electric Power Production Sources'),
        createChecklistItem('[ ] NEC Article 706 - Energy Storage Systems (if applicable)'),
        createChecklistItem('[ ] Local utility interconnection requirements'),
        createChecklistItem('[ ] Rapid shutdown requirements per NEC 690.12', { spacing: 200 }),

        createDocxHorizontalRule(),
        createDocxSectionHeading('LICENSED ELECTRICAL CONTRACTOR', DOCX_COLORS.headerBandSolar),
        createFieldParagraph('Contractor Name:', '_________________________________'),
        createFieldParagraph('License Number:', '_________________________________'),
        createFieldParagraph('Phone:', '_________________________________________'),

        createDocxHorizontalRule(),
        createDocxSectionHeading('SIGNATURES', DOCX_COLORS.headerBandSolar),
        createDocxSignatureBlock('Property Owner Signature') as unknown as Paragraph,
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        createDocxSignatureBlock('Contractor Signature') as unknown as Paragraph,
      ],
    }],
  });

  return Packer.toBlob(doc);
}

// Utility Interconnection PDF
export async function generateUtilityInterconnectionPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { owner, details } = project;
  const isPSE = !details.utilityProvider || details.utilityProvider === 'pse' || details.utilityProvider.toLowerCase().includes('puget');
  const isTacoma = details.utilityProvider === 'tacoma_power' || (details.utilityProvider || '').toLowerCase().includes('tacoma');

  const utilityName = isTacoma ? 'Tacoma Power' : isPSE ? 'PSE' : 'Utility';
  const docTitle = `${utilityName} Interconnection Application`;
  const totalPages = (isPSE || isTacoma) ? 2 : 1;

  // ── PAGE 1 ──
  const page = pdfDoc.addPage([612, 792]);

  // Title
  const titleText = isTacoma
    ? 'TACOMA POWER NET METERING APPLICATION'
    : isPSE
    ? 'PSE INTERCONNECTION & NET METERING'
    : 'UTILITY INTERCONNECTION APPLICATION';
  page.drawText(titleText, {
    x: MARGIN_LEFT,
    y: 740,
    size: 16,
    font: boldFont,
    color: rgb(COLORS.solar.r, COLORS.solar.g, COLORS.solar.b),
  });

  const subtitleText = isTacoma
    ? 'RCW Chapter 80.60 — Net Metering of Electricity'
    : isPSE
    ? 'Rate Schedule 150 (Net Metering) / Rate Schedule 152 (Interconnection)'
    : 'Net Energy Metering (NEM) Program';
  page.drawText(subtitleText, {
    x: MARGIN_LEFT,
    y: 720,
    size: (isPSE || isTacoma) ? 10 : 14,
    font: boldFont,
  });

  // Customer Information
  let yPosition = 700;
  yPosition = drawColoredHeaderBand(page, yPosition, 'CUSTOMER INFORMATION', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  const customerFields = [
    ['Customer Name:', `${owner.firstName} ${owner.lastName}`],
    ['Service Address:', owner.address],
    ['City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`],
    ['Phone:', owner.phone],
    ['Email:', owner.email],
    ['Utility Account #:', '________________________________'],
    ['Meter Number:', '________________________________'],
  ];

  for (const [label, value] of customerFields) {
    page.drawText(label, { x: MARGIN_LEFT, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 180, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Horizontal rule
  yPosition -= 4;
  yPosition = drawHorizontalRule(page, yPosition);

  // System Information
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'GENERATING FACILITY INFORMATION', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  const systemFields = [
    ['System Type:', 'Solar Photovoltaic'],
    ['Nameplate Capacity (AC):', details.solarSystemSize ? `${details.solarSystemSize} kW` : 'N/A'],
    ['Panel Count:', details.panelCount?.toString() || 'N/A'],
    ['Inverter Manufacturer:', '________________________________'],
    ['Inverter Model:', '________________________________'],
    ['Battery Storage:', details.batteryCapacity ? `${details.batteryCapacity} kWh` : 'None'],
    ['Expected Annual Production:', details.solarSystemSize ? `${Math.round(details.solarSystemSize * 1200)} kWh` : 'N/A'],
  ];

  for (const [label, value] of systemFields) {
    page.drawText(label, { x: MARGIN_LEFT, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 200, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Horizontal rule
  yPosition -= 4;
  yPosition = drawHorizontalRule(page, yPosition);

  // Utility-specific Interconnection Steps
  if (isPSE) {
    yPosition -= 4;
    yPosition = drawColoredHeaderBand(page, yPosition, 'PSE INTERCONNECTION STEPS', HEADER_BAND_SOLAR, boldFont);

    yPosition -= 10;
    const pseSteps = [
      '[ ] 1. Select experienced installer (PSE Recommended Energy Professionals available)',
      '[ ] 2. Submit Interconnection Application via PSE online portal',
      '[ ] 3. Receive PSE Approval to Construct',
      '[ ] 4. Complete solar installation per local codes and permitting',
      '[ ] 5. Finalize electrical permit with local jurisdiction',
      '[ ] 6. Submit Notice of Completion to PSE',
      '[ ] 7. PSE on-site inspection and meter installation',
      '[ ] 8. Receive Approval to Energize — net metering begins',
    ];

    for (const step of pseSteps) {
      page.drawText(step, { x: MARGIN_LEFT, y: yPosition, size: 9, font });
      yPosition -= 14;
    }

    // Horizontal rule
    yPosition -= 4;
    yPosition = drawHorizontalRule(page, yPosition);

    // Net Metering Info
    yPosition -= 4;
    yPosition = drawColoredHeaderBand(page, yPosition, 'NET METERING — HOW IT WORKS (PSE Rate Schedule 150)', HEADER_BAND_SOLAR, boldFont, 11);

    yPosition -= 10;
    const netMeteringInfo = [
      'Excess energy sent to the grid is credited against your usage.',
      'You pay only for net energy consumed plus the basic monthly charge.',
      'Extra credits within a billing period are banked for future use.',
      'Banked net metering credits expire March 31 of each year (per state law).',
      'Available to customers on residential/commercial Rate Schedules 7–49.',
      'Systems must be <= 100 kW. Not compatible with TOU Schedules 307/327.',
    ];

    for (const info of netMeteringInfo) {
      page.drawText(`• ${info}`, { x: 55, y: yPosition, size: 9, font });
      yPosition -= 13;
    }
  } else if (isTacoma) {
    yPosition -= 4;
    yPosition = drawColoredHeaderBand(page, yPosition, 'TACOMA POWER NET METERING STEPS', HEADER_BAND_SOLAR, boldFont);

    yPosition -= 10;
    const tacomaSteps = [
      '[ ] 1. Apply for electrical permit via Accela at CityofTacoma.org/Permits',
      '[ ] 2. After obtaining permit, submit Net Meter Application with supporting documents',
      '[ ] 3. Complete solar installation per local codes and Tacoma Power standards',
      '[ ] 4. Schedule inspection through Accela permitting system',
      '[ ] 5. Receive approval and net metering activation',
    ];

    for (const step of tacomaSteps) {
      page.drawText(step, { x: MARGIN_LEFT, y: yPosition, size: 9, font });
      yPosition -= 14;
    }

    // Horizontal rule
    yPosition -= 4;
    yPosition = drawHorizontalRule(page, yPosition);

    // Net Metering Info
    yPosition -= 4;
    yPosition = drawColoredHeaderBand(page, yPosition, 'NET METERING — HOW IT WORKS (RCW 80.60)', HEADER_BAND_SOLAR, boldFont);

    yPosition -= 10;
    const netMeteringInfo = [
      'Excess electricity produced is stored in your Net Metering Bank.',
      'Banked value offsets future electricity bills.',
      'Net Meter Bank resets March 31 each year per RCW 80.60.',
      'Solar production meter no longer required (as of March 6, 2023).',
      'Permits managed via Accela — City of Tacoma enterprise permitting solution.',
    ];

    for (const info of netMeteringInfo) {
      page.drawText(`• ${info}`, { x: 55, y: yPosition, size: 9, font });
      yPosition -= 13;
    }

    // Construction Standards note
    yPosition -= 8;
    page.drawText('Construction Standards: View Tacoma Power customer-owned generation standards at mytpu.org', {
      x: MARGIN_LEFT,
      y: yPosition,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 12;
    page.drawText('Questions: Contact Tacoma Power permitting at (253) 502-8277', {
      x: MARGIN_LEFT,
      y: yPosition,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  } else {
    // Generic utility provider section
    yPosition -= 4;
    yPosition = drawColoredHeaderBand(page, yPosition, 'UTILITY PROVIDER', HEADER_BAND_SOLAR, boldFont);

    yPosition -= 10;
    page.drawText(`Utility Company: ${details.utilityProvider || '________________________________'}`, {
      x: MARGIN_LEFT, y: yPosition, size: 10, font,
    });
  }

  // Horizontal rule
  yPosition -= 12;
  yPosition = drawHorizontalRule(page, yPosition);

  // Terms
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'INTERCONNECTION TERMS', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  const terms = [
    '[ ] I agree to comply with all utility interconnection requirements',
    '[ ] I understand that approval is required before system operation',
    '[ ] I agree to maintain required insurance coverage',
    '[ ] I authorize the utility to access the generating facility for inspection',
  ];

  for (const term of terms) {
    page.drawText(term, { x: MARGIN_LEFT, y: yPosition, size: 10, font });
    yPosition -= 16;
  }

  // Horizontal rule
  yPosition -= 4;
  yPosition = drawHorizontalRule(page, yPosition);

  // Signature Section
  yPosition -= 4;
  yPosition = drawColoredHeaderBand(page, yPosition, 'CUSTOMER AGREEMENT', HEADER_BAND_SOLAR, boldFont);

  yPosition -= 10;
  page.drawText('I certify that the information provided is accurate and complete.', {
    x: MARGIN_LEFT, y: yPosition, size: 10, font,
  });

  yPosition -= 16;
  yPosition = drawSignatureBlock(page, yPosition, font, boldFont, 'Customer Signature');

  // Watermark and footer - Page 1
  drawWatermarkMargin(page, font);
  drawStandardFooter(page, font, 1, totalPages, docTitle);

  // ── PAGE 2: Incentives & Reference (PSE or Tacoma Power) ──
  if (isPSE || isTacoma) {
    const page2 = pdfDoc.addPage([612, 792]);
    let y2 = 740;

    page2.drawText('INCENTIVES & REFERENCE INFORMATION', {
      x: MARGIN_LEFT, y: y2, size: 16, font: boldFont, color: rgb(COLORS.solar.r, COLORS.solar.g, COLORS.solar.b),
    });

    // Federal Incentives
    y2 -= 30;
    y2 = drawColoredHeaderBand(page2, y2, 'FEDERAL INCENTIVES', HEADER_BAND_SOLAR, boldFont);

    y2 -= 10;
    const federalIncentives = [
      '• Residential Renewable Energy Tax Credit (ITC) — available for residential projects',
      '• Business Energy Investment Tax Credit (ITC) — available for commercial projects',
    ];
    for (const item of federalIncentives) {
      page2.drawText(item, { x: 55, y: y2, size: 10, font });
      y2 -= 16;
    }

    // Horizontal rule
    y2 -= 4;
    y2 = drawHorizontalRule(page2, y2);

    // State Incentives
    y2 -= 4;
    y2 = drawColoredHeaderBand(page2, y2, 'WASHINGTON STATE INCENTIVES', HEADER_BAND_SOLAR, boldFont);

    y2 -= 10;
    page2.drawText('• Washington Sales and Use Tax Exemption for Solar Energy Systems', {
      x: 55, y: y2, size: 10, font,
    });
    if (isPSE) {
      y2 -= 20;
      page2.drawText('Note: The WA State Production Incentive Program is fully subscribed and is', {
        x: 55, y: y2, size: 9, font, color: rgb(0.6, 0.2, 0.2),
      });
      y2 -= 13;
      page2.drawText('no longer accepting new applications from PSE customers.', {
        x: 55, y: y2, size: 9, font, color: rgb(0.6, 0.2, 0.2),
      });
    }

    // Horizontal rule
    y2 -= 12;
    y2 = drawHorizontalRule(page2, y2);

    // Firefighter Accessibility
    y2 -= 4;
    y2 = drawColoredHeaderBand(page2, y2, 'FIREFIGHTER ACCESSIBILITY REQUIREMENTS', HEADER_BAND_SOLAR, boldFont);

    y2 -= 2;
    page2.drawText('Per 2015 IRC / 2015 IFC with WA State Amendments', {
      x: MARGIN_LEFT, y: y2, size: 7, font, color: rgb(0.4, 0.4, 0.4),
    });

    y2 -= 14;
    const firefighterReqs = [
      '[ ] Roof access points at strong points of construction (not over windows/doors/obstructions)',
      '[ ] Each PV array limited to 150 ft in either direction',
      '[ ] Multiple arrays separated by 36" wide clear access pathway',
      '[ ] Hip roofs: 36" clear pathway eave-to-ridge on all sections with solar (except <= 2:12 slope)',
      '[ ] Single-ridge roofs: 36" clear pathway eave-to-ridge on all sections with solar',
      '[ ] Hips/valleys with solar both sides: panels >= 18" from hip or valley',
      '[ ] Panels min. 18" from ridge (may go to ridge with fire chief alternate ventilation approval)',
    ];
    for (const req of firefighterReqs) {
      page2.drawText(req, { x: MARGIN_LEFT, y: y2, size: 9, font });
      y2 -= 14;
    }

    // Horizontal rule
    y2 -= 4;
    y2 = drawHorizontalRule(page2, y2);

    // Utility Contact & Resources
    y2 -= 4;
    if (isPSE) {
      y2 = drawColoredHeaderBand(page2, y2, 'PSE CONTACT & RESOURCES', HEADER_BAND_SOLAR, boldFont);

      y2 -= 10;
      const pseResources = [
        ['Energy Advisors:', '1-800-562-1482'],
        ['Customer Care:', 'customercare@pse.com'],
        ['Online Portal:', 'pse.com/green-options/Renewable-Energy-Programs/customer-connected-solar'],
        ['Rate Schedule 150:', 'Net Metering'],
        ['Rate Schedule 152:', 'Interconnection'],
        ['PSE REPs:', 'pse.com (find Recommended Energy Professionals)'],
      ];

      for (const [label, value] of pseResources) {
        page2.drawText(label, { x: MARGIN_LEFT, y: y2, size: 10, font: boldFont });
        page2.drawText(value, { x: 180, y: y2, size: 10, font });
        y2 -= 18;
      }
    } else {
      y2 = drawColoredHeaderBand(page2, y2, 'TACOMA POWER CONTACT & RESOURCES', HEADER_BAND_SOLAR, boldFont);

      y2 -= 10;
      const tacomaResources = [
        ['Permitting Dept:', '(253) 502-8277'],
        ['Permitting Portal:', 'CityofTacoma.org/Permits (Accela)'],
        ['Solar & Net Metering:', 'mytpu.org/community-environment/clean-renewable-energy/solar-net-metering'],
        ['Solar FAQs:', 'mytpu.org — Solar FAQs page'],
        ['Net Metering Law:', 'RCW Chapter 80.60'],
        ['Note:', 'Solar production meter no longer required (as of March 6, 2023)'],
      ];

      for (const [label, value] of tacomaResources) {
        page2.drawText(label, { x: MARGIN_LEFT, y: y2, size: 10, font: boldFont });
        page2.drawText(value, { x: 180, y: y2, size: 10, font });
        y2 -= 18;
      }
    }

    // Watermark and footer - Page 2
    drawWatermarkMargin(page2, font);
    drawStandardFooter(page2, font, 2, totalPages, docTitle);
  }

  return pdfDoc.save();
}

// Utility Interconnection DOCX
export async function generateUtilityInterconnectionDOCX(project: Project): Promise<Blob> {
  const { owner, details } = project;
  const isPSE = !details.utilityProvider || details.utilityProvider === 'pse' || details.utilityProvider.toLowerCase().includes('puget');
  const isTacoma = details.utilityProvider === 'tacoma_power' || (details.utilityProvider || '').toLowerCase().includes('tacoma');

  const utilityName = isTacoma ? 'Tacoma Power' : isPSE ? 'PSE' : 'Utility';
  const docTitle = `${utilityName} Interconnection Application`;

  const children: Paragraph[] = [];

  // Title
  const docxTitle = isTacoma
    ? 'TACOMA POWER NET METERING APPLICATION'
    : isPSE
    ? 'PSE INTERCONNECTION & NET METERING'
    : 'UTILITY INTERCONNECTION APPLICATION';
  const docxSubtitle = isTacoma
    ? 'RCW Chapter 80.60 — Net Metering of Electricity'
    : isPSE
    ? 'Rate Schedule 150 (Net Metering) / Rate Schedule 152 (Interconnection)'
    : 'Net Energy Metering (NEM) Program';

  children.push(new Paragraph({
    children: [new TextRun({
      text: docxTitle,
      bold: true, size: 28, color: DOCX_COLORS.solar,
    })],
  }));
  children.push(new Paragraph({
    children: [new TextRun({
      text: docxSubtitle,
      bold: true, size: (isPSE || isTacoma) ? 22 : 28,
    })],
    spacing: { after: 400 },
  }));

  // Customer Information
  children.push(createDocxSectionHeading('CUSTOMER INFORMATION', DOCX_COLORS.headerBandSolar));
  children.push(createFieldParagraph('Customer Name:', `${owner.firstName} ${owner.lastName}`));
  children.push(createFieldParagraph('Service Address:', owner.address));
  children.push(createFieldParagraph('City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`));
  children.push(createFieldParagraph('Phone:', owner.phone));
  children.push(createFieldParagraph('Email:', owner.email));
  children.push(createFieldParagraph('Utility Account #:', '________________________________'));
  children.push(createFieldParagraph('Meter Number:', '________________________________'));

  // System Information
  children.push(createDocxHorizontalRule());
  children.push(createDocxSectionHeading('GENERATING FACILITY INFORMATION', DOCX_COLORS.headerBandSolar));
  children.push(createFieldParagraph('System Type:', 'Solar Photovoltaic'));
  children.push(createFieldParagraph('Nameplate Capacity (AC):', details.solarSystemSize ? `${details.solarSystemSize} kW` : 'N/A'));
  children.push(createFieldParagraph('Panel Count:', details.panelCount?.toString() || 'N/A'));
  children.push(createFieldParagraph('Inverter Manufacturer:', '________________________________'));
  children.push(createFieldParagraph('Inverter Model:', '________________________________'));
  children.push(createFieldParagraph('Battery Storage:', details.batteryCapacity ? `${details.batteryCapacity} kWh` : 'None'));
  children.push(createFieldParagraph('Expected Annual Production:', details.solarSystemSize ? `${Math.round(details.solarSystemSize * 1200)} kWh` : 'N/A'));

  // Utility-specific Interconnection Steps
  if (isPSE) {
    children.push(createDocxHorizontalRule());
    children.push(createDocxSectionHeading('PSE INTERCONNECTION STEPS', DOCX_COLORS.headerBandSolar));
    const pseSteps = [
      '1. Select experienced installer (PSE Recommended Energy Professionals available)',
      '2. Submit Interconnection Application via PSE online portal',
      '3. Receive PSE Approval to Construct',
      '4. Complete solar installation per local codes and permitting',
      '5. Finalize electrical permit with local jurisdiction',
      '6. Submit Notice of Completion to PSE',
      '7. PSE on-site inspection and meter installation',
      '8. Receive Approval to Energize — net metering begins',
    ];
    for (const step of pseSteps) {
      children.push(createChecklistItem(`[ ]  ${step}`));
    }

    children.push(createDocxHorizontalRule());
    children.push(createDocxSectionHeading('NET METERING — HOW IT WORKS (PSE Rate Schedule 150)', DOCX_COLORS.headerBandSolar));
    const netMeteringInfo = [
      'Excess energy sent to the grid is credited against your usage.',
      'You pay only for net energy consumed plus the basic monthly charge.',
      'Extra credits within a billing period are banked for future use.',
      'Banked net metering credits expire March 31 of each year (per state law).',
      'Available to customers on residential/commercial Rate Schedules 7–49.',
      'Systems must be <= 100 kW. Not compatible with TOU Schedules 307/327.',
    ];
    for (const info of netMeteringInfo) {
      children.push(createBulletItem(info));
    }
  } else if (isTacoma) {
    children.push(createDocxHorizontalRule());
    children.push(createDocxSectionHeading('TACOMA POWER NET METERING STEPS', DOCX_COLORS.headerBandSolar));
    const tacomaSteps = [
      '1. Apply for electrical permit via Accela at CityofTacoma.org/Permits',
      '2. After obtaining permit, submit Net Meter Application with supporting documents',
      '3. Complete solar installation per local codes and Tacoma Power standards',
      '4. Schedule inspection through Accela permitting system',
      '5. Receive approval and net metering activation',
    ];
    for (const step of tacomaSteps) {
      children.push(createChecklistItem(`[ ]  ${step}`));
    }

    children.push(createDocxHorizontalRule());
    children.push(createDocxSectionHeading('NET METERING — HOW IT WORKS (RCW 80.60)', DOCX_COLORS.headerBandSolar));
    const netMeteringInfo = [
      'Excess electricity produced is stored in your Net Metering Bank.',
      'Banked value offsets future electricity bills.',
      'Net Meter Bank resets March 31 each year per RCW 80.60.',
      'Solar production meter no longer required (as of March 6, 2023).',
      'Permits managed via Accela — City of Tacoma enterprise permitting solution.',
    ];
    for (const info of netMeteringInfo) {
      children.push(createBulletItem(info));
    }

    children.push(new Paragraph({
      children: [new TextRun({ text: 'Construction Standards: View Tacoma Power customer-owned generation standards at mytpu.org', size: 16, color: '666666', italics: true })],
      spacing: { after: 40 },
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Questions: Contact Tacoma Power permitting at (253) 502-8277', size: 16, color: '666666', italics: true })],
      spacing: { after: 120 },
    }));
  } else {
    children.push(createDocxHorizontalRule());
    children.push(createDocxSectionHeading('UTILITY PROVIDER', DOCX_COLORS.headerBandSolar));
    children.push(createFieldParagraph('Utility Company:', details.utilityProvider || '________________________________'));
  }

  // Interconnection Terms
  children.push(createDocxHorizontalRule());
  children.push(createDocxSectionHeading('INTERCONNECTION TERMS', DOCX_COLORS.headerBandSolar));
  children.push(createChecklistItem('[ ] I agree to comply with all utility interconnection requirements'));
  children.push(createChecklistItem('[ ] I understand that approval is required before system operation'));
  children.push(createChecklistItem('[ ] I agree to maintain required insurance coverage'));
  children.push(createChecklistItem('[ ] I authorize the utility to access the generating facility for inspection', { spacing: 200 }));

  // Incentives & Reference (PSE or Tacoma)
  if (isPSE || isTacoma) {
    children.push(createDocxHorizontalRule());
    children.push(createDocxSectionHeading('INCENTIVES & REFERENCE INFORMATION', DOCX_COLORS.headerBandSolar));

    children.push(new Paragraph({
      children: [new TextRun({ text: 'Federal Incentives', bold: true, size: 20 })],
      spacing: { after: 100 },
    }));
    children.push(createBulletItem('Residential Renewable Energy Tax Credit (ITC)'));
    children.push(createBulletItem('Business Energy Investment Tax Credit (ITC) — commercial projects'));

    children.push(new Paragraph({
      children: [new TextRun({ text: 'Washington State Incentives', bold: true, size: 20 })],
      spacing: { after: 100 },
    }));
    children.push(createBulletItem('Washington Sales and Use Tax Exemption for Solar Energy Systems'));
    if (isPSE) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Note: WA State Production Incentive Program is fully subscribed and no longer accepting PSE customer applications.', size: 16, color: DOCX_COLORS.noteRed, italics: true })],
        indent: { left: 360 },
        spacing: { after: 120 },
      }));
    }

    // Firefighter Accessibility
    children.push(createDocxHorizontalRule());
    children.push(createDocxSectionHeading('FIREFIGHTER ACCESSIBILITY REQUIREMENTS', DOCX_COLORS.headerBandSolar));
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Per 2015 IRC / 2015 IFC with WA State Amendments', size: 16, color: '666666', italics: true })],
      spacing: { after: 120 },
    }));
    const firefighterReqs = [
      'Roof access points at strong points of construction (not over windows/doors/obstructions)',
      'Each PV array limited to 150 ft in either direction',
      'Multiple arrays separated by 36" wide clear access pathway',
      'Hip roofs: 36" clear pathway eave-to-ridge on all sections with solar (except <= 2:12 slope)',
      'Single-ridge roofs: 36" clear pathway eave-to-ridge on sections with solar',
      'Hips/valleys with solar both sides: panels >= 18" from hip or valley',
      'Panels min. 18" from ridge (may go to ridge with fire chief alternate ventilation approval)',
    ];
    for (const req of firefighterReqs) {
      children.push(createChecklistItem(`[ ]  ${req}`));
    }

    // Utility Contact & Resources
    if (isPSE) {
      children.push(createDocxHorizontalRule());
      children.push(createDocxSectionHeading('PSE CONTACT & RESOURCES', DOCX_COLORS.headerBandSolar));
      children.push(createFieldParagraph('Energy Advisors:', '1-800-562-1482'));
      children.push(createFieldParagraph('Customer Care:', 'customercare@pse.com'));
      children.push(createFieldParagraph('Online Portal:', 'pse.com/green-options/Renewable-Energy-Programs/customer-connected-solar'));
      children.push(createFieldParagraph('Rate Schedule 150:', 'Net Metering'));
      children.push(createFieldParagraph('Rate Schedule 152:', 'Interconnection'));
      children.push(createFieldParagraph('PSE REPs:', 'pse.com (find Recommended Energy Professionals)'));
    } else {
      children.push(createDocxHorizontalRule());
      children.push(createDocxSectionHeading('TACOMA POWER CONTACT & RESOURCES', DOCX_COLORS.headerBandSolar));
      children.push(createFieldParagraph('Permitting Dept:', '(253) 502-8277'));
      children.push(createFieldParagraph('Permitting Portal:', 'CityofTacoma.org/Permits (Accela)'));
      children.push(createFieldParagraph('Solar & Net Metering:', 'mytpu.org/community-environment/clean-renewable-energy/solar-net-metering'));
      children.push(createFieldParagraph('Solar FAQs:', 'mytpu.org — Solar FAQs page'));
      children.push(createFieldParagraph('Net Metering Law:', 'RCW Chapter 80.60'));
      children.push(createFieldParagraph('Note:', 'Solar production meter no longer required (as of March 6, 2023)'));
    }
  }

  // Customer Agreement
  children.push(createDocxHorizontalRule());
  children.push(createDocxSectionHeading('CUSTOMER AGREEMENT', DOCX_COLORS.headerBandSolar));
  children.push(createBodyParagraph('I certify that the information provided is accurate and complete.', { spacing: { after: 400 } }));
  children.push(createDocxSignatureBlock('Customer Signature') as unknown as Paragraph);

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
      children,
    }],
  });
  return Packer.toBlob(doc);
}

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import type { Project } from '@/types';
import {
  COLORS, PAGE_WIDTH, PAGE_HEIGHT, MARGIN_LEFT, MARGIN_RIGHT, TABLE_WIDTH,
  drawColoredHeaderBand, drawHorizontalRule, drawStandardFooter, wrapText,
  DOCX_COLORS, DOCX_PAGE_MARGINS, createDocxHeader, createDocxFooter,
  createDocxSectionHeading, createDocxHorizontalRule,
} from './documentStyles';

// ── PDF Helpers ──────────────────────────────────────────────────────────────

const JARPA_HEADER_COLOR = { r: 0.84, g: 0.88, b: 0.96 };

function drawFormFieldRow(
  page: import('pdf-lib').PDFPage,
  x: number,
  y: number,
  width: number,
  rowHeight: number,
  label: string,
  value: string,
  font: import('pdf-lib').PDFFont,
  boldFont: import('pdf-lib').PDFFont,
  fontSize: number = 9,
): number {
  page.drawRectangle({
    x, y: y - rowHeight, width, height: rowHeight,
    borderColor: rgb(0, 0, 0), borderWidth: 0.5, color: rgb(1, 1, 1),
  });
  page.drawText(label, {
    x: x + 4, y: y - rowHeight + (rowHeight - fontSize) / 2 + 2,
    size: fontSize, font: boldFont,
  });
  const labelWidth = boldFont.widthOfTextAtSize(label + ' ', fontSize);
  page.drawText(value || '', {
    x: x + 4 + labelWidth, y: y - rowHeight + (rowHeight - fontSize) / 2 + 2,
    size: fontSize, font,
  });
  return y - rowHeight;
}

// ── PDF Generation ───────────────────────────────────────────────────────────

export async function generateJARPAPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const { owner, details, site } = project;
  const agent = project.agent;
  const env = project.environmental;
  const totalPages = 3;
  const footerTitle = 'Joint Aquatic Resource Permits Application (JARPA)';
  const rowHeight = 18;

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ═══════════════════════════════════════════════════════════════════════════
  const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 50;

  // Title
  const titleText = 'JOINT AQUATIC RESOURCE PERMITS APPLICATION (JARPA)';
  const titleWidth = boldFont.widthOfTextAtSize(titleText, 14);
  page1.drawText(titleText, {
    x: MARGIN_LEFT + (TABLE_WIDTH - titleWidth) / 2, y, size: 14, font: boldFont,
    color: rgb(COLORS.cwa.r, COLORS.cwa.g, COLORS.cwa.b),
  });
  y -= 18;
  const subtitleText = 'Pre-filled from Lake Tapps Permit Workflow';
  const subtitleWidth = italicFont.widthOfTextAtSize(subtitleText, 10);
  page1.drawText(subtitleText, {
    x: MARGIN_LEFT + (TABLE_WIDTH - subtitleWidth) / 2, y, size: 10, font: italicFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 25;
  y = drawHorizontalRule(page1, y);

  // ── Section 1: Applicant ──
  y -= 4;
  y = drawColoredHeaderBand(page1, y, 'SECTION 1 \u2013 APPLICANT INFORMATION', JARPA_HEADER_COLOR, boldFont);
  y -= 6;

  y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'Name:', `${owner.firstName} ${owner.lastName}`, font, boldFont);
  y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'Mailing Address:', owner.address || '', font, boldFont);
  y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'City / State / Zip:', `${owner.city || ''}, ${owner.state || 'WA'} ${owner.zip || ''}`, font, boldFont);
  y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH / 2, rowHeight, 'Phone:', owner.phone || '', font, boldFont);
  drawFormFieldRow(page1, MARGIN_LEFT + TABLE_WIDTH / 2, y + rowHeight, TABLE_WIDTH / 2, rowHeight, 'Email:', owner.email || '', font, boldFont);

  y -= 8;
  y = drawHorizontalRule(page1, y);

  // ── Section 2: Agent / Representative ──
  y -= 4;
  y = drawColoredHeaderBand(page1, y, 'SECTION 2 \u2013 AGENT / AUTHORIZED REPRESENTATIVE', JARPA_HEADER_COLOR, boldFont);
  y -= 6;

  if (agent) {
    y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'Agent Name:', agent.name || '', font, boldFont);
    y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'Company:', agent.company || '', font, boldFont);
    y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'Address:', agent.address || '', font, boldFont);
    y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH / 2, rowHeight, 'Phone:', agent.phone || '', font, boldFont);
    drawFormFieldRow(page1, MARGIN_LEFT + TABLE_WIDTH / 2, y + rowHeight, TABLE_WIDTH / 2, rowHeight, 'Email:', agent.email || '', font, boldFont);
  } else {
    y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'Agent Name:', 'N/A \u2014 Owner is applicant', font, boldFont);
    y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'Company:', '', font, boldFont);
    y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'Address:', '', font, boldFont);
    y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH / 2, rowHeight, 'Phone:', '', font, boldFont);
    drawFormFieldRow(page1, MARGIN_LEFT + TABLE_WIDTH / 2, y + rowHeight, TABLE_WIDTH / 2, rowHeight, 'Email:', '', font, boldFont);
  }

  y -= 8;
  y = drawHorizontalRule(page1, y);

  // ── Section 3: Project Location ──
  y -= 4;
  y = drawColoredHeaderBand(page1, y, 'SECTION 3 \u2013 PROJECT LOCATION', JARPA_HEADER_COLOR, boldFont);
  y -= 6;

  y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'Property Address:', site.propertyAddress || owner.address || '', font, boldFont);
  y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH / 2, rowHeight, 'Parcel Number:', site.parcelNumber || owner.parcelNumber || '', font, boldFont);
  drawFormFieldRow(page1, MARGIN_LEFT + TABLE_WIDTH / 2, y + rowHeight, TABLE_WIDTH / 2, rowHeight, 'County:', 'Pierce', font, boldFont);
  y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH / 2, rowHeight, 'Water Body Name:', 'Lake Tapps', font, boldFont);
  drawFormFieldRow(page1, MARGIN_LEFT + TABLE_WIDTH / 2, y + rowHeight, TABLE_WIDTH / 2, rowHeight, 'Water Body Type:', 'Freshwater lake/reservoir', font, boldFont);

  y -= 8;
  y = drawHorizontalRule(page1, y);

  // ── Section 4: Project Description ──
  y -= 4;
  y = drawColoredHeaderBand(page1, y, 'SECTION 4 \u2013 PROJECT DESCRIPTION', JARPA_HEADER_COLOR, boldFont);
  y -= 6;

  const categoryLabels: Record<string, string> = {
    new_construction: 'New Construction',
    modification: 'Modification',
    repair_maintenance: 'Repair / Maintenance',
    replace_structure: 'Replace Existing Structure',
  };
  const improvementLabels: Record<string, string> = {
    dock: 'Dock', pier: 'Pier', float: 'Float', boat_lift: 'Boat Lift',
    boat_ramp: 'Boat Ramp', boathouse: 'Boathouse', bulkhead: 'Bulkhead',
    mooring_pile: 'Mooring Pile', swim_float: 'Swim Float', beach_area: 'Beach Area',
    lighting: 'Lighting', fire_pit: 'Fire Pit', stairs_path: 'Stairs / Path', other: 'Other',
  };

  y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'Project Category:', categoryLabels[details.category] || details.category, font, boldFont);
  const improvementsStr = details.improvementTypes.map(t => improvementLabels[t] || t).join(', ');
  y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, 'Improvement Types:', improvementsStr, font, boldFont);
  y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH / 2, rowHeight, 'Estimated Cost:', details.estimatedCost ? `$${details.estimatedCost.toLocaleString()}` : '', font, boldFont);
  drawFormFieldRow(page1, MARGIN_LEFT + TABLE_WIDTH / 2, y + rowHeight, TABLE_WIDTH / 2, rowHeight, 'Start Date:', details.startDate || '', font, boldFont);
  y = drawFormFieldRow(page1, MARGIN_LEFT, y, TABLE_WIDTH / 2, rowHeight, 'Completion Date:', details.completionDate || '', font, boldFont);

  // Description text box
  y -= 4;
  page1.drawText('Description:', { x: MARGIN_LEFT + 4, y: y - 2, size: 9, font: boldFont });
  y -= 14;
  const descBoxTop = y;
  const descBoxHeight = Math.max(60, descBoxTop - 65);
  page1.drawRectangle({
    x: MARGIN_LEFT, y: descBoxTop - descBoxHeight, width: TABLE_WIDTH, height: descBoxHeight,
    borderColor: rgb(0, 0, 0), borderWidth: 0.5, color: rgb(1, 1, 1),
  });
  if (details.description) {
    const descLines = wrapText(details.description, font, 9, TABLE_WIDTH - 10);
    let descY = descBoxTop - 12;
    for (const line of descLines) {
      if (descY < descBoxTop - descBoxHeight + 5) break;
      page1.drawText(line, { x: MARGIN_LEFT + 5, y: descY, size: 9, font });
      descY -= 12;
    }
  }

  drawStandardFooter(page1, font, 1, totalPages, footerTitle);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2
  // ═══════════════════════════════════════════════════════════════════════════
  const page2 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  y = PAGE_HEIGHT - 50;

  // ── Section 5: Permits Requested ──
  y = drawColoredHeaderBand(page2, y, 'SECTION 5 \u2013 PERMITS REQUESTED', JARPA_HEADER_COLOR, boldFont);
  y -= 6;

  page2.drawText('Check all that apply based on project scope:', {
    x: MARGIN_LEFT, y, size: 9, font: italicFont,
  });
  y -= 16;

  const requiredPermits = project.requiredPermits || [];
  const permitChecks = [
    { key: 'hpa', label: 'Hydraulic Project Approval (HPA) \u2014 WA Dept. of Fish & Wildlife' },
    { key: 'section_10', label: 'Section 10 Permit \u2014 U.S. Army Corps of Engineers (Rivers & Harbors Act)' },
    { key: 'section_404', label: 'Section 404 Permit \u2014 U.S. Army Corps of Engineers (Clean Water Act)' },
    { key: 'water_quality_401', label: '401 Water Quality Certification \u2014 WA Dept. of Ecology' },
    { key: 'shoreline_exemption', label: 'Shoreline Exemption' },
    { key: 'shoreline_substantial', label: 'Shoreline Substantial Development Permit' },
    { key: 'shoreline_conditional', label: 'Shoreline Conditional Use Permit' },
    { key: 'shoreline_variance', label: 'Shoreline Variance' },
    { key: 'building_permit', label: 'Building Permit \u2014 City of Bonney Lake' },
    { key: 'pierce_building_permit', label: 'Building Permit \u2014 Pierce County' },
  ];

  for (const permit of permitChecks) {
    const checked = requiredPermits.includes(permit.key as import('@/types').PermitType);
    const checkMark = checked ? '[X]' : '[ ]';
    page2.drawText(`${checkMark}  ${permit.label}`, {
      x: MARGIN_LEFT + 10, y, size: 9, font,
    });
    y -= 16;
  }

  y -= 4;
  y = drawHorizontalRule(page2, y);

  // ── Section 6: Site Characteristics ──
  y -= 4;
  y = drawColoredHeaderBand(page2, y, 'SECTION 6 \u2013 SITE CHARACTERISTICS', JARPA_HEADER_COLOR, boldFont);
  y -= 6;

  y = drawFormFieldRow(page2, MARGIN_LEFT, y, TABLE_WIDTH / 2, rowHeight, 'Elevation:', site.elevation ? `${site.elevation} ft` : '', font, boldFont);
  drawFormFieldRow(page2, MARGIN_LEFT + TABLE_WIDTH / 2, y + rowHeight, TABLE_WIDTH / 2, rowHeight, 'Water Frontage:', site.waterFrontage || '', font, boldFont);
  y = drawFormFieldRow(page2, MARGIN_LEFT, y, TABLE_WIDTH / 2, rowHeight, 'Lot Size:', site.lotSize || '', font, boldFont);
  drawFormFieldRow(page2, MARGIN_LEFT + TABLE_WIDTH / 2, y + rowHeight, TABLE_WIDTH / 2, rowHeight, 'In Water Work:', details.inWater ? 'Yes' : 'No', font, boldFont);
  y = drawFormFieldRow(page2, MARGIN_LEFT, y, TABLE_WIDTH / 2, rowHeight, 'Below High Water:', details.belowHighWaterLine ? 'Yes' : 'No', font, boldFont);
  drawFormFieldRow(page2, MARGIN_LEFT + TABLE_WIDTH / 2, y + rowHeight, TABLE_WIDTH / 2, rowHeight, 'Shoreline Jurisdiction:', details.withinShorelineJurisdiction ? 'Yes' : 'No', font, boldFont);

  y -= 8;
  page2.drawText('Environmental Screening:', { x: MARGIN_LEFT, y, size: 10, font: boldFont });
  y -= 16;

  if (env) {
    const envItems = [
      { label: 'Near Wetlands:', value: env.nearWetlands ? 'Yes' : 'No' },
      { label: 'Vegetation Removal:', value: env.vegetationRemoval ? `Yes \u2014 ${env.vegetationDescription || ''}` : 'No' },
      { label: 'Ground Disturbance:', value: env.groundDisturbance ? 'Yes' : 'No' },
      { label: 'Near Fish Spawning Habitat:', value: env.nearFishSpawning ? 'Yes' : 'No' },
    ];
    for (const item of envItems) {
      y = drawFormFieldRow(page2, MARGIN_LEFT, y, TABLE_WIDTH, rowHeight, item.label, item.value, font, boldFont);
    }
    if (env.erosionControlPlan) {
      y -= 4;
      page2.drawText('Erosion Control Plan:', { x: MARGIN_LEFT + 4, y, size: 9, font: boldFont });
      y -= 12;
      const ecLines = wrapText(env.erosionControlPlan, font, 9, TABLE_WIDTH - 10);
      for (const line of ecLines) {
        page2.drawText(line, { x: MARGIN_LEFT + 8, y, size: 9, font });
        y -= 12;
      }
    }
    if (env.notes) {
      y -= 4;
      page2.drawText('Environmental Notes:', { x: MARGIN_LEFT + 4, y, size: 9, font: boldFont });
      y -= 12;
      const noteLines = wrapText(env.notes, font, 9, TABLE_WIDTH - 10);
      for (const line of noteLines) {
        page2.drawText(line, { x: MARGIN_LEFT + 8, y, size: 9, font });
        y -= 12;
      }
    }
  } else {
    page2.drawText('No environmental screening data provided.', {
      x: MARGIN_LEFT + 10, y, size: 9, font: italicFont,
    });
    y -= 14;
  }

  drawStandardFooter(page2, font, 2, totalPages, footerTitle);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3 - Signature
  // ═══════════════════════════════════════════════════════════════════════════
  const page3 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  y = PAGE_HEIGHT - 50;

  y = drawColoredHeaderBand(page3, y, 'SECTION 7 \u2013 CERTIFICATION AND SIGNATURE', JARPA_HEADER_COLOR, boldFont);
  y -= 10;

  const certText = 'I certify that to the best of my knowledge, the information provided in this application is true, complete, and accurate. I understand that any misrepresentation of facts may result in denial of the permit or revocation of an approved permit. I authorize the agencies reviewing this application to enter the project site for inspection purposes.';
  const certLines = wrapText(certText, font, 10, TABLE_WIDTH);
  for (const line of certLines) {
    page3.drawText(line, { x: MARGIN_LEFT, y, size: 10, font });
    y -= 14;
  }

  y -= 10;
  const certText2 = 'I acknowledge that I am responsible for compliance with all applicable federal, state, and local laws, regulations, and ordinances pertaining to the proposed project.';
  const cert2Lines = wrapText(certText2, font, 10, TABLE_WIDTH);
  for (const line of cert2Lines) {
    page3.drawText(line, { x: MARGIN_LEFT, y, size: 10, font });
    y -= 14;
  }

  // Signature lines
  y -= 30;
  page3.drawLine({
    start: { x: MARGIN_LEFT, y },
    end: { x: MARGIN_LEFT + 300, y },
    thickness: 0.5,
  });
  page3.drawText('Applicant / Agent Signature', {
    x: MARGIN_LEFT, y: y - 14, size: 8, font,
  });

  page3.drawLine({
    start: { x: MARGIN_LEFT + 340, y },
    end: { x: MARGIN_RIGHT, y },
    thickness: 0.5,
  });
  page3.drawText('Date', {
    x: MARGIN_LEFT + 340, y: y - 14, size: 8, font,
  });

  y -= 40;
  page3.drawLine({
    start: { x: MARGIN_LEFT, y },
    end: { x: MARGIN_LEFT + 300, y },
    thickness: 0.5,
  });
  page3.drawText('Print Name', {
    x: MARGIN_LEFT, y: y - 14, size: 8, font,
  });

  page3.drawLine({
    start: { x: MARGIN_LEFT + 340, y },
    end: { x: MARGIN_RIGHT, y },
    thickness: 0.5,
  });
  page3.drawText('Phone Number', {
    x: MARGIN_LEFT + 340, y: y - 14, size: 8, font,
  });

  y -= 40;
  page3.drawLine({
    start: { x: MARGIN_LEFT, y },
    end: { x: MARGIN_RIGHT, y },
    thickness: 0.5,
  });
  page3.drawText('Mailing Address', {
    x: MARGIN_LEFT, y: y - 14, size: 8, font,
  });

  y -= 40;
  page3.drawLine({
    start: { x: MARGIN_LEFT, y },
    end: { x: MARGIN_RIGHT, y },
    thickness: 0.5,
  });
  page3.drawText('Email Address', {
    x: MARGIN_LEFT, y: y - 14, size: 8, font,
  });

  // Property owner signature (if agent is submitting)
  y -= 50;
  y = drawHorizontalRule(page3, y);
  y -= 4;
  page3.drawText('Property Owner (if different from applicant):', {
    x: MARGIN_LEFT, y, size: 10, font: boldFont,
  });
  y -= 30;
  page3.drawLine({
    start: { x: MARGIN_LEFT, y },
    end: { x: MARGIN_LEFT + 300, y },
    thickness: 0.5,
  });
  page3.drawText('Property Owner Signature', {
    x: MARGIN_LEFT, y: y - 14, size: 8, font,
  });
  page3.drawLine({
    start: { x: MARGIN_LEFT + 340, y },
    end: { x: MARGIN_RIGHT, y },
    thickness: 0.5,
  });
  page3.drawText('Date', {
    x: MARGIN_LEFT + 340, y: y - 14, size: 8, font,
  });

  y -= 40;
  page3.drawLine({
    start: { x: MARGIN_LEFT, y },
    end: { x: MARGIN_LEFT + 300, y },
    thickness: 0.5,
  });
  page3.drawText('Print Name', {
    x: MARGIN_LEFT, y: y - 14, size: 8, font,
  });

  drawStandardFooter(page3, font, 3, totalPages, footerTitle);

  return pdfDoc.save();
}

// ── DOCX Generation ──────────────────────────────────────────────────────────

export async function generateJARPADOCX(project: Project): Promise<Blob> {
  const { owner, details, site } = project;
  const agent = project.agent;
  const env = project.environmental;

  const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
  const tableBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

  function fieldCell(label: string, value: string, widthPct: number): TableCell {
    return new TableCell({
      borders: tableBorders,
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      children: [new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({ text: label + ' ', bold: true, size: 18 }),
          new TextRun({ text: value || '', size: 18 }),
        ],
      })],
    });
  }

  const footerTitle = 'Joint Aquatic Resource Permits Application (JARPA)';
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: 'JOINT AQUATIC RESOURCE PERMITS APPLICATION (JARPA)', bold: true, size: 28, color: DOCX_COLORS.cwa })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({ text: 'Pre-filled from Lake Tapps Permit Workflow', italics: true, size: 20, color: '666666' })],
    }),
  );

  children.push(createDocxHorizontalRule());

  // ── Section 1: Applicant ──
  children.push(createDocxSectionHeading('SECTION 1 \u2013 APPLICANT INFORMATION', DOCX_COLORS.headerBandCwa));

  const applicantTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [fieldCell('Name:', `${owner.firstName} ${owner.lastName}`, 100)] }),
      new TableRow({ children: [fieldCell('Mailing Address:', owner.address || '', 100)] }),
      new TableRow({ children: [fieldCell('City / State / Zip:', `${owner.city || ''}, ${owner.state || 'WA'} ${owner.zip || ''}`, 100)] }),
      new TableRow({
        children: [
          fieldCell('Phone:', owner.phone || '', 50),
          fieldCell('Email:', owner.email || '', 50),
        ],
      }),
    ],
  });
  children.push(applicantTable);
  children.push(createDocxHorizontalRule());

  // ── Section 2: Agent ──
  children.push(createDocxSectionHeading('SECTION 2 \u2013 AGENT / AUTHORIZED REPRESENTATIVE', DOCX_COLORS.headerBandCwa));

  const agentRows: TableRow[] = agent
    ? [
        new TableRow({ children: [fieldCell('Agent Name:', agent.name || '', 100)] }),
        new TableRow({ children: [fieldCell('Company:', agent.company || '', 100)] }),
        new TableRow({ children: [fieldCell('Address:', agent.address || '', 100)] }),
        new TableRow({
          children: [
            fieldCell('Phone:', agent.phone || '', 50),
            fieldCell('Email:', agent.email || '', 50),
          ],
        }),
      ]
    : [
        new TableRow({ children: [fieldCell('Agent Name:', 'N/A \u2014 Owner is applicant', 100)] }),
        new TableRow({ children: [fieldCell('Company:', '', 100)] }),
        new TableRow({ children: [fieldCell('Address:', '', 100)] }),
        new TableRow({
          children: [
            fieldCell('Phone:', '', 50),
            fieldCell('Email:', '', 50),
          ],
        }),
      ];

  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: agentRows }));
  children.push(createDocxHorizontalRule());

  // ── Section 3: Project Location ──
  children.push(createDocxSectionHeading('SECTION 3 \u2013 PROJECT LOCATION', DOCX_COLORS.headerBandCwa));

  const locationTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [fieldCell('Property Address:', site.propertyAddress || owner.address || '', 100)] }),
      new TableRow({
        children: [
          fieldCell('Parcel Number:', site.parcelNumber || owner.parcelNumber || '', 50),
          fieldCell('County:', 'Pierce', 50),
        ],
      }),
      new TableRow({
        children: [
          fieldCell('Water Body Name:', 'Lake Tapps', 50),
          fieldCell('Water Body Type:', 'Freshwater lake/reservoir', 50),
        ],
      }),
    ],
  });
  children.push(locationTable);
  children.push(createDocxHorizontalRule());

  // ── Section 4: Project Description ──
  children.push(createDocxSectionHeading('SECTION 4 \u2013 PROJECT DESCRIPTION', DOCX_COLORS.headerBandCwa));

  const categoryLabels: Record<string, string> = {
    new_construction: 'New Construction',
    modification: 'Modification',
    repair_maintenance: 'Repair / Maintenance',
    replace_structure: 'Replace Existing Structure',
  };
  const improvementLabels: Record<string, string> = {
    dock: 'Dock', pier: 'Pier', float: 'Float', boat_lift: 'Boat Lift',
    boat_ramp: 'Boat Ramp', boathouse: 'Boathouse', bulkhead: 'Bulkhead',
    mooring_pile: 'Mooring Pile', swim_float: 'Swim Float', beach_area: 'Beach Area',
    lighting: 'Lighting', fire_pit: 'Fire Pit', stairs_path: 'Stairs / Path', other: 'Other',
  };
  const improvementsStr = details.improvementTypes.map(t => improvementLabels[t] || t).join(', ');

  const descTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [fieldCell('Project Category:', categoryLabels[details.category] || details.category, 100)] }),
      new TableRow({ children: [fieldCell('Improvement Types:', improvementsStr, 100)] }),
      new TableRow({
        children: [
          fieldCell('Estimated Cost:', details.estimatedCost ? `$${details.estimatedCost.toLocaleString()}` : '', 50),
          fieldCell('Start Date:', details.startDate || '', 50),
        ],
      }),
      new TableRow({ children: [fieldCell('Completion Date:', details.completionDate || '', 100)] }),
      new TableRow({
        children: [new TableCell({
          borders: tableBorders,
          width: { size: 100, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              spacing: { before: 20, after: 10 },
              children: [new TextRun({ text: 'Description:', bold: true, size: 18 })],
            }),
            new Paragraph({
              spacing: { before: 10, after: 80 },
              children: [new TextRun({ text: details.description || '', size: 18 })],
            }),
          ],
        })],
      }),
    ],
  });
  children.push(descTable);
  children.push(createDocxHorizontalRule());

  // ── Section 5: Permits Requested ──
  children.push(createDocxSectionHeading('SECTION 5 \u2013 PERMITS REQUESTED', DOCX_COLORS.headerBandCwa));

  children.push(new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: 'Check all that apply based on project scope:', italics: true, size: 18 })],
  }));

  const requiredPermits = project.requiredPermits || [];
  const permitChecks = [
    { key: 'hpa', label: 'Hydraulic Project Approval (HPA) \u2014 WA Dept. of Fish & Wildlife' },
    { key: 'section_10', label: 'Section 10 Permit \u2014 U.S. Army Corps of Engineers (Rivers & Harbors Act)' },
    { key: 'section_404', label: 'Section 404 Permit \u2014 U.S. Army Corps of Engineers (Clean Water Act)' },
    { key: 'water_quality_401', label: '401 Water Quality Certification \u2014 WA Dept. of Ecology' },
    { key: 'shoreline_exemption', label: 'Shoreline Exemption' },
    { key: 'shoreline_substantial', label: 'Shoreline Substantial Development Permit' },
    { key: 'shoreline_conditional', label: 'Shoreline Conditional Use Permit' },
    { key: 'shoreline_variance', label: 'Shoreline Variance' },
    { key: 'building_permit', label: 'Building Permit \u2014 City of Bonney Lake' },
    { key: 'pierce_building_permit', label: 'Building Permit \u2014 Pierce County' },
  ];

  for (const permit of permitChecks) {
    const checked = requiredPermits.includes(permit.key as import('@/types').PermitType);
    children.push(new Paragraph({
      spacing: { after: 60 },
      indent: { left: 360 },
      children: [new TextRun({ text: `${checked ? '[X]' : '[ ]'}  ${permit.label}`, size: 18 })],
    }));
  }
  children.push(createDocxHorizontalRule());

  // ── Section 6: Site Characteristics ──
  children.push(createDocxSectionHeading('SECTION 6 \u2013 SITE CHARACTERISTICS', DOCX_COLORS.headerBandCwa));

  const siteTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          fieldCell('Elevation:', site.elevation ? `${site.elevation} ft` : '', 50),
          fieldCell('Water Frontage:', site.waterFrontage || '', 50),
        ],
      }),
      new TableRow({
        children: [
          fieldCell('Lot Size:', site.lotSize || '', 50),
          fieldCell('In Water Work:', details.inWater ? 'Yes' : 'No', 50),
        ],
      }),
      new TableRow({
        children: [
          fieldCell('Below High Water:', details.belowHighWaterLine ? 'Yes' : 'No', 50),
          fieldCell('Shoreline Jurisdiction:', details.withinShorelineJurisdiction ? 'Yes' : 'No', 50),
        ],
      }),
    ],
  });
  children.push(siteTable);

  // Environmental screening
  children.push(new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: 'Environmental Screening:', bold: true, size: 20 })],
  }));

  if (env) {
    const envTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [fieldCell('Near Wetlands:', env.nearWetlands ? 'Yes' : 'No', 100)] }),
        new TableRow({ children: [fieldCell('Vegetation Removal:', env.vegetationRemoval ? `Yes \u2014 ${env.vegetationDescription || ''}` : 'No', 100)] }),
        new TableRow({ children: [fieldCell('Ground Disturbance:', env.groundDisturbance ? 'Yes' : 'No', 100)] }),
        new TableRow({ children: [fieldCell('Near Fish Spawning Habitat:', env.nearFishSpawning ? 'Yes' : 'No', 100)] }),
      ],
    });
    children.push(envTable);

    if (env.erosionControlPlan) {
      children.push(new Paragraph({
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({ text: 'Erosion Control Plan: ', bold: true, size: 18 }),
          new TextRun({ text: env.erosionControlPlan, size: 18 }),
        ],
      }));
    }
    if (env.notes) {
      children.push(new Paragraph({
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({ text: 'Environmental Notes: ', bold: true, size: 18 }),
          new TextRun({ text: env.notes, size: 18 }),
        ],
      }));
    }
  } else {
    children.push(new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: 'No environmental screening data provided.', italics: true, size: 18 })],
    }));
  }
  children.push(createDocxHorizontalRule());

  // ── Section 7: Signature ──
  children.push(createDocxSectionHeading('SECTION 7 \u2013 CERTIFICATION AND SIGNATURE', DOCX_COLORS.headerBandCwa));

  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: 'I certify that to the best of my knowledge, the information provided in this application is true, complete, and accurate. I understand that any misrepresentation of facts may result in denial of the permit or revocation of an approved permit. I authorize the agencies reviewing this application to enter the project site for inspection purposes.',
      size: 20,
    })],
  }));
  children.push(new Paragraph({
    spacing: { after: 300 },
    children: [new TextRun({
      text: 'I acknowledge that I am responsible for compliance with all applicable federal, state, and local laws, regulations, and ordinances pertaining to the proposed project.',
      size: 20,
    })],
  }));

  // Signature line
  children.push(new Paragraph({
    spacing: { before: 300, after: 40 },
    children: [new TextRun({ text: '___________________________________________          ________________________', size: 18 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({ text: 'Applicant / Agent Signature', size: 16, color: '666666' }),
      new TextRun({ text: '                                                        Date', size: 16, color: '666666' }),
    ],
  }));

  // Print name line
  children.push(new Paragraph({
    spacing: { before: 100, after: 40 },
    children: [new TextRun({ text: '___________________________________________          ________________________', size: 18 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({ text: 'Print Name', size: 16, color: '666666' }),
      new TextRun({ text: '                                                                     Phone Number', size: 16, color: '666666' }),
    ],
  }));

  // Address and email lines
  children.push(new Paragraph({
    spacing: { before: 100, after: 40 },
    children: [new TextRun({ text: '________________________________________________________________________', size: 18 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: 'Mailing Address', size: 16, color: '666666' })],
  }));

  children.push(new Paragraph({
    spacing: { before: 100, after: 40 },
    children: [new TextRun({ text: '________________________________________________________________________', size: 18 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: 'Email Address', size: 16, color: '666666' })],
  }));

  // Property owner signature
  children.push(createDocxHorizontalRule());
  children.push(new Paragraph({
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: 'Property Owner (if different from applicant):', bold: true, size: 20 })],
  }));

  children.push(new Paragraph({
    spacing: { before: 200, after: 40 },
    children: [new TextRun({ text: '___________________________________________          ________________________', size: 18 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({ text: 'Property Owner Signature', size: 16, color: '666666' }),
      new TextRun({ text: '                                                Date', size: 16, color: '666666' }),
    ],
  }));
  children.push(new Paragraph({
    spacing: { before: 100, after: 40 },
    children: [new TextRun({ text: '___________________________________________', size: 18 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: 'Print Name', size: 16, color: '666666' })],
  }));

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: DOCX_PAGE_MARGINS },
      },
      headers: {
        default: createDocxHeader('JARPA \u2014 Joint Aquatic Resource Permits Application'),
      },
      footers: {
        default: createDocxFooter(footerTitle),
      },
      children: children as Paragraph[],
    }],
  });

  return Packer.toBlob(doc);
}

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import type { Project } from '@/types';
import {
  COLORS, PAGE_WIDTH, PAGE_HEIGHT, MARGIN_LEFT, MARGIN_RIGHT, TABLE_WIDTH,
  drawColoredHeaderBand, drawHorizontalRule, drawStandardFooter, wrapText,
  DOCX_COLORS, DOCX_PAGE_MARGINS, createDocxHeader, createDocxFooter,
  createDocxSectionHeading, createDocxHorizontalRule,
} from './documentStyles';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function formatDate(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function buildEnvironmentalImpactText(project: Project): string {
  const env = project.environmental;
  if (!env) {
    return 'An environmental screening has not yet been completed for this project. The applicant will provide environmental information as requested during the review process.';
  }

  const items: string[] = [];
  if (env.vegetationRemoval) {
    items.push(`vegetation removal is anticipated${env.vegetationDescription ? ` (${env.vegetationDescription})` : ''}`);
  } else {
    items.push('no significant vegetation removal is anticipated');
  }
  if (env.groundDisturbance) {
    items.push('ground disturbance will occur during construction');
  }
  if (env.nearFishSpawning) {
    items.push('the project site is near documented fish spawning habitat');
  } else {
    items.push('the project site is not near documented fish spawning habitat');
  }
  if (env.nearWetlands) {
    items.push('wetlands are present in the vicinity of the project site');
  } else {
    items.push('no wetlands have been identified in the immediate project area');
  }

  return `Regarding environmental impact: ${items.join('; ')}.`;
}

// ── PDF Generation ───────────────────────────────────────────────────────────

export async function generateCert401PDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const { owner, details, site } = project;
  const footerTitle = '401 Water Quality Certification Request';
  const lineSpacing = 14;
  const bodyFontSize = 11;
  const propertyAddress = site.propertyAddress || owner.address || '';
  const ownerName = `${owner.firstName} ${owner.lastName}`;
  const ownerFullAddress = `${owner.address || ''}, ${owner.city || ''}, ${owner.state || 'WA'} ${owner.zip || ''}`;

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 60;

  // Date
  page.drawText(formatDate(), {
    x: MARGIN_LEFT, y, size: bodyFontSize, font,
  });
  y -= lineSpacing * 2;

  // To block
  page.drawText('To:', { x: MARGIN_LEFT, y, size: bodyFontSize, font: boldFont });
  y -= lineSpacing;
  page.drawText('Washington State Department of Ecology', {
    x: MARGIN_LEFT + 20, y, size: bodyFontSize, font,
  });
  y -= lineSpacing;
  page.drawText('Water Quality Program', {
    x: MARGIN_LEFT + 20, y, size: bodyFontSize, font,
  });
  y -= lineSpacing * 2;

  // From block
  page.drawText('From:', { x: MARGIN_LEFT, y, size: bodyFontSize, font: boldFont });
  y -= lineSpacing;
  page.drawText(ownerName, {
    x: MARGIN_LEFT + 20, y, size: bodyFontSize, font,
  });
  y -= lineSpacing;
  page.drawText(ownerFullAddress, {
    x: MARGIN_LEFT + 20, y, size: bodyFontSize, font,
  });
  y -= lineSpacing * 2;

  // Subject line
  page.drawText('Subject:', { x: MARGIN_LEFT, y, size: bodyFontSize, font: boldFont });
  const subjectText = `Request for 401 Water Quality Certification \u2014 ${propertyAddress}`;
  const subjectX = MARGIN_LEFT + boldFont.widthOfTextAtSize('Subject: ', bodyFontSize);
  page.drawText(subjectText, {
    x: subjectX, y, size: bodyFontSize, font: boldFont,
  });
  y -= lineSpacing;
  y = drawHorizontalRule(page, y);
  y -= lineSpacing;

  // Paragraph 1: Introduction
  const intro = `I am requesting a Section 401 Water Quality Certification for the following project at Lake Tapps, Pierce County, Washington. The project is located at ${propertyAddress}${site.parcelNumber ? `, Parcel Number ${site.parcelNumber}` : ''}.`;
  const introLines = wrapText(intro, font, bodyFontSize, TABLE_WIDTH);
  for (const line of introLines) {
    page.drawText(line, { x: MARGIN_LEFT, y, size: bodyFontSize, font });
    y -= lineSpacing;
  }
  y -= lineSpacing * 0.5;

  // Paragraph 2: Project Description
  const improvementsStr = details.improvementTypes.map(t => improvementLabels[t] || t).join(', ');
  const projDesc = `The proposed project involves ${categoryLabels[details.category]?.toLowerCase() || details.category} of the following waterfront improvements: ${improvementsStr}. ${details.description || ''} The estimated project cost is ${details.estimatedCost ? `$${details.estimatedCost.toLocaleString()}` : 'to be determined'}.`;
  const projLines = wrapText(projDesc, font, bodyFontSize, TABLE_WIDTH);
  for (const line of projLines) {
    page.drawText(line, { x: MARGIN_LEFT, y, size: bodyFontSize, font });
    y -= lineSpacing;
  }
  y -= lineSpacing * 0.5;

  // Paragraph 3: Federal Permits
  const fedText = 'A Section 404 / Section 10 permit application has been submitted to the U.S. Army Corps of Engineers, Seattle District. This 401 Water Quality Certification request is submitted in conjunction with that federal permit application, as required under Section 401 of the Clean Water Act (33 U.S.C. \u00A7 1341).';
  const fedLines = wrapText(fedText, font, bodyFontSize, TABLE_WIDTH);
  for (const line of fedLines) {
    page.drawText(line, { x: MARGIN_LEFT, y, size: bodyFontSize, font });
    y -= lineSpacing;
  }
  y -= lineSpacing * 0.5;

  // Paragraph 4: Environmental Impact
  const envText = buildEnvironmentalImpactText(project);
  const envLines = wrapText(envText, font, bodyFontSize, TABLE_WIDTH);
  for (const line of envLines) {
    page.drawText(line, { x: MARGIN_LEFT, y, size: bodyFontSize, font });
    y -= lineSpacing;
  }
  y -= lineSpacing * 0.5;

  // Paragraph 5: Best Management Practices
  const bmpText = 'The project will employ best management practices (BMPs) to minimize water quality impacts, including but not limited to: use of silt curtains or turbidity barriers during in-water work, containment of construction debris and materials, proper disposal of waste, and adherence to approved work windows to protect aquatic species. An erosion and sediment control plan will be implemented throughout the construction period.';
  const bmpLines = wrapText(bmpText, font, bodyFontSize, TABLE_WIDTH);
  for (const line of bmpLines) {
    page.drawText(line, { x: MARGIN_LEFT, y, size: bodyFontSize, font });
    y -= lineSpacing;
  }
  y -= lineSpacing * 0.5;

  // Paragraph 6: Closing
  const contactInfo = [owner.phone, owner.email].filter(Boolean).join(' or ');
  const closingText = `Please contact me at ${contactInfo || '[phone/email]'} with any questions regarding this request or if additional information is needed. Thank you for your consideration.`;
  const closingLines = wrapText(closingText, font, bodyFontSize, TABLE_WIDTH);
  for (const line of closingLines) {
    page.drawText(line, { x: MARGIN_LEFT, y, size: bodyFontSize, font });
    y -= lineSpacing;
  }
  y -= lineSpacing;

  // Closing
  page.drawText('Sincerely,', { x: MARGIN_LEFT, y, size: bodyFontSize, font });
  y -= lineSpacing * 3;

  // Signature line
  page.drawLine({
    start: { x: MARGIN_LEFT, y },
    end: { x: MARGIN_LEFT + 250, y },
    thickness: 0.5,
  });
  y -= lineSpacing;
  page.drawText(ownerName, {
    x: MARGIN_LEFT, y, size: bodyFontSize, font,
  });
  y -= lineSpacing;
  page.drawText('Property Owner / Applicant', {
    x: MARGIN_LEFT, y, size: 9, font: italicFont, color: rgb(0.4, 0.4, 0.4),
  });

  y -= lineSpacing * 2;
  page.drawText('Date: ________________________', {
    x: MARGIN_LEFT, y, size: bodyFontSize, font,
  });

  drawStandardFooter(page, font, 1, 1, footerTitle);

  return pdfDoc.save();
}

// ── DOCX Generation ──────────────────────────────────────────────────────────

export async function generateCert401DOCX(project: Project): Promise<Blob> {
  const { owner, details, site } = project;
  const propertyAddress = site.propertyAddress || owner.address || '';
  const ownerName = `${owner.firstName} ${owner.lastName}`;
  const ownerFullAddress = `${owner.address || ''}, ${owner.city || ''}, ${owner.state || 'WA'} ${owner.zip || ''}`;
  const footerTitle = '401 Water Quality Certification Request';

  const improvementsStr = details.improvementTypes.map(t => improvementLabels[t] || t).join(', ');
  const contactInfo = [owner.phone, owner.email].filter(Boolean).join(' or ');

  const children: Paragraph[] = [];

  // Date
  children.push(new Paragraph({
    spacing: { after: 300 },
    children: [new TextRun({ text: formatDate(), size: 22 })],
  }));

  // To block
  children.push(new Paragraph({
    spacing: { after: 0 },
    children: [new TextRun({ text: 'To:', bold: true, size: 22 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 0 },
    indent: { left: 360 },
    children: [new TextRun({ text: 'Washington State Department of Ecology', size: 22 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 300 },
    indent: { left: 360 },
    children: [new TextRun({ text: 'Water Quality Program', size: 22 })],
  }));

  // From block
  children.push(new Paragraph({
    spacing: { after: 0 },
    children: [new TextRun({ text: 'From:', bold: true, size: 22 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 0 },
    indent: { left: 360 },
    children: [new TextRun({ text: ownerName, size: 22 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 300 },
    indent: { left: 360 },
    children: [new TextRun({ text: ownerFullAddress, size: 22 })],
  }));

  // Subject
  children.push(new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: 'Subject: ', bold: true, size: 22 }),
      new TextRun({ text: `Request for 401 Water Quality Certification \u2014 ${propertyAddress}`, bold: true, size: 22 }),
    ],
  }));

  children.push(createDocxHorizontalRule());

  // Paragraph 1: Introduction
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: `I am requesting a Section 401 Water Quality Certification for the following project at Lake Tapps, Pierce County, Washington. The project is located at ${propertyAddress}${site.parcelNumber ? `, Parcel Number ${site.parcelNumber}` : ''}.`,
      size: 22,
    })],
  }));

  // Paragraph 2: Project Description
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: `The proposed project involves ${categoryLabels[details.category]?.toLowerCase() || details.category} of the following waterfront improvements: ${improvementsStr}. ${details.description || ''} The estimated project cost is ${details.estimatedCost ? `$${details.estimatedCost.toLocaleString()}` : 'to be determined'}.`,
      size: 22,
    })],
  }));

  // Paragraph 3: Federal Permits
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: 'A Section 404 / Section 10 permit application has been submitted to the U.S. Army Corps of Engineers, Seattle District. This 401 Water Quality Certification request is submitted in conjunction with that federal permit application, as required under Section 401 of the Clean Water Act (33 U.S.C. \u00A7 1341).',
      size: 22,
    })],
  }));

  // Paragraph 4: Environmental Impact
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: buildEnvironmentalImpactText(project),
      size: 22,
    })],
  }));

  // Paragraph 5: Best Management Practices
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: 'The project will employ best management practices (BMPs) to minimize water quality impacts, including but not limited to: use of silt curtains or turbidity barriers during in-water work, containment of construction debris and materials, proper disposal of waste, and adherence to approved work windows to protect aquatic species. An erosion and sediment control plan will be implemented throughout the construction period.',
      size: 22,
    })],
  }));

  // Paragraph 6: Closing
  children.push(new Paragraph({
    spacing: { after: 300 },
    children: [new TextRun({
      text: `Please contact me at ${contactInfo || '[phone/email]'} with any questions regarding this request or if additional information is needed. Thank you for your consideration.`,
      size: 22,
    })],
  }));

  // Closing and signature
  children.push(new Paragraph({
    spacing: { after: 400 },
    children: [new TextRun({ text: 'Sincerely,', size: 22 })],
  }));

  // Signature line
  children.push(new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: '___________________________________________', size: 18 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 0 },
    children: [new TextRun({ text: ownerName, size: 22 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: 'Property Owner / Applicant', size: 18, italics: true, color: '666666' })],
  }));

  // Date line
  children.push(new Paragraph({
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: 'Date: ________________________', size: 22 })],
  }));

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: DOCX_PAGE_MARGINS },
      },
      headers: {
        default: createDocxHeader('401 Water Quality Certification Request'),
      },
      footers: {
        default: createDocxFooter(footerTitle),
      },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

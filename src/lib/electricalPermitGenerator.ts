import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import type { Project } from '@/types';
import {
  drawStandardFooter,
  drawWatermarkMargin,
  drawWrappedText,
  wrapText,
  COLORS,
  createDocxHeader,
  createDocxFooter,
  createFieldParagraph,
  createChecklistItem,
  createBulletItem,
  createBodyParagraph,
  createNoteParagraph,
  DOCX_COLORS,
  DOCX_PAGE_MARGINS,
} from './documentStyles';

function getWorkDescription(project: Project): string {
  const { details } = project;
  if (project.workflowType === 'solar') {
    const parts = [`Solar PV system installation — ${details.solarSystemSize || '___'} kW DC`];
    if (details.panelCount) parts.push(`${details.panelCount} panels`);
    if (details.inverterType) parts.push(`${details.inverterType.replace(/_/g, ' ')} inverter`);
    if (details.batteryCapacity) parts.push(`${details.batteryCapacity} kWh battery storage`);
    return parts.join(', ') + '.';
  }
  if (project.workflowType === 'adu') {
    const parts = ['Electrical service and wiring for accessory dwelling unit (ADU)'];
    if (details.aduSquareFootage) parts[0] += ` — ${details.aduSquareFootage} sq ft`;
    if (details.description) parts.push(details.description);
    return parts.join('. ') + '.';
  }
  return details.description || 'Electrical work for residential waterfront improvement.';
}

// ─── PDF Generator ──────────────────────────────────────────────────────────
// Matches WA LNI Form F500-094-000 (07-2025)

export async function generateLNIElectricalPermitPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { owner, site } = project;

  // ── Page 1 — Application (sections 1-3) ───────────────────────────────────
  const p1 = pdfDoc.addPage([612, 792]);
  let y = 760;

  // Header
  p1.drawText('STATE OF WASHINGTON', { x: 50, y, size: 11, font: boldFont, color: rgb(0.1, 0.15, 0.35) });
  y -= 14;
  p1.drawText('DEPARTMENT OF LABOR AND INDUSTRIES', { x: 50, y, size: 13, font: boldFont, color: rgb(0.1, 0.15, 0.35) });
  y -= 16;
  p1.drawText('Property Owner Electrical Work Permit Application', { x: 50, y, size: 11, font: boldFont });
  y -= 12;
  p1.drawText('Form F500-094-000  07-2025', { x: 50, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) });
  p1.drawText('www.LnI.wa.gov/Electrical', { x: 350, y, size: 8, font, color: rgb(0.2, 0.3, 0.6) });
  y -= 6;
  p1.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 1.5, color: rgb(0.1, 0.15, 0.35) });

  // ── Section 1 — Applying for your Electrical Permit ──
  y -= 18;
  p1.drawText('1', { x: 50, y, size: 14, font: boldFont, color: rgb(0.1, 0.15, 0.35) });
  p1.drawText('Applying for your Electrical Permit', { x: 66, y, size: 11, font: boldFont });
  y -= 14;
  y = drawWrappedText(p1,
    'In Washington, only licensed electrical contractors may perform electrical work. Property owners may apply for an exemption from these requirements by completing this application and signing the affidavit below before beginning electrical work.',
    50, y, font, 8, 512);
  y -= 4;
  const bullets1 = [
    'Complete all sections & mark the applicable fee item(s) on the Fee Worksheet.',
    'After receiving your completed paperwork and payment we will issue a permit valid for 1 year.',
    'Permits can also be purchased online at www.Lni.wa.gov/Licensing-Permits/Electrical/',
  ];
  for (const b of bullets1) {
    p1.drawText('•  ' + b, { x: 56, y, size: 8, font });
    y -= 12;
  }

  // City limits gate
  y -= 6;
  p1.drawText('Is this property within city limits?', { x: 50, y, size: 9, font: boldFont });
  y -= 13;
  p1.drawText('Yes  —  Stop! Some cities perform their own inspections. Verify with the city before continuing.', { x: 64, y, size: 8, font });
  y -= 11;
  p1.drawText('No   —  Continue', { x: 64, y, size: 8, font });
  y -= 13;
  p1.drawText('Are you doing electrical work inside a manufactured or mobile home?', { x: 50, y, size: 9, font: boldFont });
  y -= 13;
  p1.drawText('Yes  —  Stop! Use Manufactured or Mobile Home Application (F622-036-000).', { x: 64, y, size: 8, font });
  y -= 11;
  p1.drawText('No   —  Continue', { x: 64, y, size: 8, font });

  // ── Section 2 — Affidavit ──
  y -= 18;
  p1.drawText('2', { x: 50, y, size: 14, font: boldFont, color: rgb(0.1, 0.15, 0.35) });
  p1.drawText('Affidavit', { x: 66, y, size: 11, font: boldFont });
  y -= 16;
  const ownerName = `${owner.firstName} ${owner.lastName}`;
  y = drawWrappedText(p1,
    `As authorized under RCW 19.28.261, I, ${ownerName}, hereby apply for an exemption from the electrical licensing and certification requirements of RCW 19.28 by submission of this affidavit.`,
    50, y, font, 9, 512);

  y -= 6;
  p1.drawText('Which statement describes you? (Mark only one)', { x: 50, y, size: 9, font: boldFont });
  y -= 14;
  const ownershipOptions = [
    { mark: '[X]', text: 'I own this property.' },
    { mark: '[ ]', text: 'I lease this property.' },
    { mark: '[ ]', text: 'I am an officer for a 501(c)(3) nonprofit corporation or a nonprofit religious organization.' },
  ];
  for (const opt of ownershipOptions) {
    p1.drawText(`${opt.mark}  ${opt.text}`, { x: 56, y, size: 8, font });
    y -= 12;
  }

  y -= 6;
  p1.drawText('Select your property type (Mark only one)', { x: 50, y, size: 9, font: boldFont });
  y -= 14;
  const propertyTypeOptions = [
    '[ ]  New single-family residence — not for rent, sale, or lease; owner will reside 24+ months.',
    '[ ]  New 2, 3, or 4 unit residential building — owner will reside in one unit 24+ months.',
    '[ ]  New place of business, farm or other property — not for rent, sale, or lease.',
    '[X]  Existing residential property, place of business or farm — will not sell within 12 months.',
    '[ ]  501(c)(3) or nonprofit religious org property — electrical work value <= $30,000.',
  ];
  for (const opt of propertyTypeOptions) {
    p1.drawText(opt, { x: 56, y, size: 7.5, font });
    y -= 11;
  }

  // Signature certification
  y -= 6;
  y = drawWrappedText(p1,
    'By signing below, I certify the information I am providing on this affidavit is true and accurate. I understand that if I make false statements or misrepresentations I may be assessed penalties.',
    50, y, font, 8, 512);
  y -= 14;
  p1.drawLine({ start: { x: 50, y }, end: { x: 220, y }, thickness: 0.75 });
  p1.drawLine({ start: { x: 240, y }, end: { x: 440, y }, thickness: 0.75 });
  p1.drawLine({ start: { x: 460, y }, end: { x: 562, y }, thickness: 0.75 });
  y -= 11;
  p1.drawText('Printed Name', { x: 50, y, size: 7, font });
  p1.drawText('Signature of Property Owner or Lessee', { x: 240, y, size: 7, font });
  p1.drawText('Date', { x: 460, y, size: 7, font });

  // Pre-fill printed name
  p1.drawText(ownerName, { x: 55, y: y + 15, size: 9, font });

  // ── Section 3 — Property owner and inspection site information ──
  y -= 22;
  p1.drawText('3', { x: 50, y, size: 14, font: boldFont, color: rgb(0.1, 0.15, 0.35) });
  p1.drawText('Property owner and inspection site information', { x: 66, y, size: 11, font: boldFont });
  y -= 18;

  const sec3Fields: [string, string][] = [
    ["Property Owner's Name:", `${owner.lastName}, ${owner.firstName}`],
    ['Mailing Address:', owner.address],
    ['City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`],
    ['Daytime Phone:', owner.phone],
    ['Email Address:', owner.email],
  ];
  for (const [label, value] of sec3Fields) {
    p1.drawText(label, { x: 50, y, size: 9, font: boldFont });
    p1.drawText(value, { x: 175, y, size: 9, font });
    y -= 16;
  }

  y -= 4;
  const siteAddr = site.propertyAddress || owner.address;
  p1.drawText('Inspection site address:', { x: 50, y, size: 9, font: boldFont });
  p1.drawText(siteAddr, { x: 175, y, size: 9, font });
  y -= 16;
  p1.drawText('City, State, ZIP:', { x: 50, y, size: 9, font: boldFont });
  p1.drawText(`${owner.city}, ${owner.state} ${owner.zip}`, { x: 175, y, size: 9, font });
  y -= 16;
  p1.drawText('County:', { x: 50, y, size: 9, font: boldFont });
  p1.drawText('Pierce', { x: 175, y, size: 9, font });
  y -= 18;

  p1.drawText('Description of work being done:', { x: 50, y, size: 9, font: boldFont });
  y -= 14;
  y = drawWrappedText(p1, getWorkDescription(project), 50, y, font, 9, 512);

  y -= 8;
  p1.drawText('Directions to the property L&I will be inspecting:', { x: 50, y, size: 9, font: boldFont });
  y -= 12;
  p1.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 0.5 });

  // Page 1 footer & watermark
  drawStandardFooter(p1, font, 1, 2, 'F500-094-000 Property Owner Electrical Work Permit Application');
  drawWatermarkMargin(p1, font);

  // ── Page 2 — Residential Fee Worksheet (F500-133-000) ─────────────────────
  const p2 = pdfDoc.addPage([612, 792]);
  y = 760;

  p2.drawText('1, 2, and Multifamily Dwelling Residential', { x: 50, y, size: 12, font: boldFont, color: rgb(0.1, 0.15, 0.35) });
  y -= 15;
  p2.drawText('Electrical Fee Worksheet', { x: 50, y, size: 12, font: boldFont, color: rgb(0.1, 0.15, 0.35) });
  y -= 13;
  p2.drawText('Fees Effective July 1, 2025    |    Form F500-133-000', { x: 50, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 4;
  p2.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 1.5, color: rgb(0.1, 0.15, 0.35) });

  // Helper to draw a fee table section
  const drawFeeHeader = (title: string) => {
    y -= 18;
    p2.drawText(title, { x: 50, y, size: 9, font: boldFont });
    y -= 4;
    p2.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 0.5 });
    y -= 13;
  };

  const drawFeeRow = (item: string, fee: string, qty: string = '______') => {
    p2.drawText(item, { x: 56, y, size: 8, font });
    p2.drawText(fee, { x: 380, y, size: 8, font });
    p2.drawText('Qty: ' + qty, { x: 480, y, size: 8, font });
    y -= 12;
  };

  // Section 1 — New square footage
  drawFeeHeader('1   1 or 2 Family Dwelling — New Square Footage (Includes service, feeders & circuits)');
  drawFeeRow('First 1,300 sq ft', '$112.60');
  drawFeeRow('Each additional 500 sq ft', '$35.90');
  y -= 4;
  p2.drawText('Enter Total Sq Ft: ____________', { x: 56, y, size: 8, font });
  y -= 4;

  // Section 2 — Multifamily / misc
  drawFeeHeader('2   Each New Service or Largest Feeder (Multifamily & misc. residential structures)');
  drawFeeRow('0 – 200 amps', '$121.50');
  drawFeeRow('201 – 400 amps', '$151.20');
  drawFeeRow('401 – 600 amps', '$207.70');
  drawFeeRow('601 – 800 amps', '$266.50');
  drawFeeRow('801+ amps', '$380.30');
  y -= 2;
  p2.drawText('Additional Feeder(s) (if inspected at same time as new service/feeder):', { x: 56, y, size: 8, font: boldFont });
  y -= 12;
  drawFeeRow('0 – 200 amps', '$35.90');
  drawFeeRow('201 – 400 amps', '$74.00');
  drawFeeRow('401 – 600 amps', '$103.20');
  drawFeeRow('601 – 800 amps', '$141.90');
  drawFeeRow('801+ amps', '$285.10');

  // Section 3 — Other fee items
  drawFeeHeader('3   Other Fee Items');
  drawFeeRow('Altered Service/Feeder 0 – 200 amps (incl. circuits)', '$103.20');
  drawFeeRow('Altered Service/Feeder 201 – 600 amps', '$151.20');
  drawFeeRow('Altered Service/Feeder 601+ amps', '$227.90');
  y -= 4;
  drawFeeRow('Circuits (added or altered) — Per Panel (up to 4)', '$74.00');
  drawFeeRow('  Each additional circuit', '$7.70');
  y -= 4;
  drawFeeRow('Alarms, Telecom & Other LV Systems — First 2,500 sq ft', '$64.90');
  drawFeeRow('  Each additional 2,500 sq ft', '$17.20');
  y -= 4;
  drawFeeRow('Thermostat (low-voltage HVAC) — First', '$55.90');
  drawFeeRow('  Inspected with service', '$46.80');
  drawFeeRow('  Each additional', '$17.20');
  y -= 4;
  drawFeeRow('Generators — Portable w/ permanent transfer equip.', '$103.20');
  drawFeeRow('  Permanent 0 – 200 amp feeder', '$121.50');
  drawFeeRow('  Permanent 201 – 400 amp feeder', '$151.20');
  y -= 4;
  drawFeeRow('Temporary Service — 0 – 60 amps', '$64.90');
  drawFeeRow('  61 – 100 amps', '$74.00');
  drawFeeRow('  101 – 200 amps', '$94.40');

  // Other fees right column style
  y -= 6;
  p2.drawText('Other Fees / Inspections:', { x: 56, y, size: 8, font: boldFont });
  y -= 12;
  drawFeeRow('Hot tub, spa, or sauna', '$74.00');
  drawFeeRow('  Inspected with service', '$46.80');
  drawFeeRow('Septic pumping system', '$74.00');
  drawFeeRow('Swimming pool', '$112.60');
  drawFeeRow('  Inspected with service', '$74.00');
  drawFeeRow('Outbuilding / Detached Garage — inspected same time', '$46.80');
  drawFeeRow('  Inspected separately', '$74.00');
  drawFeeRow('Meter/Mast repair or replacement', '$55.80');
  drawFeeRow('Yard pole meter loop', '$74.00');
  drawFeeRow('Progress Inspection — each ½ hour', '$55.90');

  // Page 2 footer & watermark
  drawStandardFooter(p2, font, 2, 2, 'F500-133-000 Residential Electrical Fee Worksheet');
  drawWatermarkMargin(p2, font);

  return pdfDoc.save();
}

// ─── DOCX Generator ─────────────────────────────────────────────────────────

export async function generateLNIElectricalPermitDOCX(project: Project): Promise<Blob> {
  const { owner, site } = project;
  const ownerName = `${owner.firstName} ${owner.lastName}`;
  const siteAddr = site.propertyAddress || owner.address;

  const doc = new Document({
    sections: [
      // ── Section A: Application (F500-094-000) ──────────────────────────────
      {
        properties: { page: { margin: DOCX_PAGE_MARGINS } },
        headers: { default: createDocxHeader('WA L&I Form F500-094-000') },
        footers: { default: createDocxFooter('F500-094-000 Property Owner Electrical Work Permit Application') },
        children: [
          // Header
          new Paragraph({ children: [new TextRun({ text: 'STATE OF WASHINGTON', bold: true, size: 22, color: '1A2659' })] }),
          new Paragraph({ children: [new TextRun({ text: 'DEPARTMENT OF LABOR AND INDUSTRIES', bold: true, size: 26, color: '1A2659' })] }),
          new Paragraph({ children: [new TextRun({ text: 'Property Owner Electrical Work Permit Application', bold: true, size: 22 })] }),
          new Paragraph({
            children: [new TextRun({ text: 'Form F500-094-000  07-2025  |  www.LnI.wa.gov/Electrical', size: 16, color: '666666' })],
            spacing: { after: 300 },
          }),

          // Section 1
          new Paragraph({ text: '1  Applying for your Electrical Permit', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
          createBodyParagraph('In Washington, only licensed electrical contractors may perform electrical work. Property owners may apply for an exemption from these requirements by completing this application and signing the affidavit below before beginning electrical work.'),
          createBulletItem('Complete all sections & mark the applicable fee item(s) on the Fee Worksheet.'),
          createBulletItem('After receiving your completed paperwork and payment we will issue a permit valid for 1 year.'),
          createBulletItem('Permits can also be purchased online at www.Lni.wa.gov/Licensing-Permits/Electrical/'),

          new Paragraph({ children: [new TextRun({ text: 'Is this property within city limits?', bold: true, size: 20 })], spacing: { before: 100 } }),
          createBodyParagraph('Yes — Stop! Some cities perform their own inspections. Verify with the city before continuing.'),
          createBodyParagraph('No  — Continue'),
          new Paragraph({ children: [new TextRun({ text: 'Are you doing electrical work inside a manufactured or mobile home?', bold: true, size: 20 })] }),
          createBodyParagraph('Yes — Stop! Use Manufactured or Mobile Home Application (F622-036-000).'),
          createBodyParagraph('No  — Continue'),

          // Section 2 — Affidavit
          new Paragraph({ text: '2  Affidavit', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
          createBodyParagraph(`As authorized under RCW 19.28.261, I, ${ownerName}, hereby apply for an exemption from the electrical licensing and certification requirements of RCW 19.28 by submission of this affidavit.`),

          new Paragraph({ children: [new TextRun({ text: 'Which statement describes you? (Mark only one)', bold: true, size: 20 })], spacing: { after: 80 } }),
          createChecklistItem('[X]  I own this property.'),
          createNoteParagraph('     Your name or your company\'s name must be shown on the deed to the property.'),
          createChecklistItem('[ ]  I lease this property.'),
          createChecklistItem('[ ]  I am an officer for a 501(c)(3) nonprofit corporation or a nonprofit religious organization.'),

          new Paragraph({ children: [new TextRun({ text: 'Select your property type (Mark only one)', bold: true, size: 20 })], spacing: { after: 80 } }),
          createChecklistItem('[ ]  New single-family residence — not for rent, sale, or lease; owner will reside 24+ months.'),
          createChecklistItem('[ ]  New 2, 3, or 4 unit residential building — owner will reside in one unit 24+ months.'),
          createChecklistItem('[ ]  New place of business, farm or other property — not for rent, sale, or lease.'),
          createChecklistItem('[X]  Existing residential property, place of business or farm — will not sell within 12 months.'),
          createChecklistItem('[ ]  501(c)(3) or nonprofit religious org property — electrical work value <= $30,000.'),

          // Signature certification
          createBodyParagraph('By signing below, I certify the information I am providing on this affidavit is true and accurate. I understand that if I make false statements or misrepresentations I may be assessed penalties.'),
          new Paragraph({
            children: [
              new TextRun({ text: '_'.repeat(30) + '    ' }),
              new TextRun({ text: '_'.repeat(40) + '    ' }),
              new TextRun({ text: '_'.repeat(20) }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Printed Name', size: 16 }),
              new TextRun({ text: '                                       ' }),
              new TextRun({ text: 'Signature of Property Owner or Lessee', size: 16 }),
              new TextRun({ text: '             ' }),
              new TextRun({ text: 'Date', size: 16 }),
            ],
            spacing: { after: 300 },
          }),

          // Section 3 — Property owner and inspection site
          new Paragraph({ text: '3  Property owner and inspection site information', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
          createFieldParagraph("Property Owner's Name (Last, First):", `${owner.lastName}, ${owner.firstName}`),
          createFieldParagraph('Mailing Address:', owner.address),
          createFieldParagraph('City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`),
          createFieldParagraph('Daytime Phone:', owner.phone),
          createFieldParagraph('Email Address:', owner.email),
          new Paragraph({ spacing: { after: 100 } }),
          createFieldParagraph('Inspection site address (if different):', siteAddr),
          createFieldParagraph('City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`),
          createFieldParagraph('County:', 'Pierce'),
          new Paragraph({ spacing: { after: 100 } }),
          createFieldParagraph('Description of work being done:', ''),
          createBodyParagraph(getWorkDescription(project)),
          createFieldParagraph('Directions to the property L&I will be inspecting:', '________________________________'),
        ],
      },

      // ── Section B: Residential Fee Worksheet (F500-133-000) ────────────────
      {
        properties: { page: { margin: DOCX_PAGE_MARGINS } },
        headers: { default: createDocxHeader('WA L&I Form F500-133-000') },
        footers: { default: createDocxFooter('F500-133-000 Residential Electrical Fee Worksheet') },
        children: [
          new Paragraph({ children: [new TextRun({ text: '1, 2, and Multifamily Dwelling Residential', bold: true, size: 24, color: '1A2659' })] }),
          new Paragraph({
            children: [new TextRun({ text: 'Electrical Fee Worksheet', bold: true, size: 24, color: '1A2659' })],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Fees Effective July 1, 2025   |   Form F500-133-000', size: 16, color: '666666' })],
            spacing: { after: 200 },
          }),

          // 1 — New sq ft
          new Paragraph({
            children: [new TextRun({ text: '1   1 or 2 Family Dwelling — New Square Footage', bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({ children: [new TextRun({ text: '(Includes service, feeders & circuits within dwelling)', italics: true, size: 18 })] }),
          createFieldParagraph('First 1,300 sq ft', '$112.60     Qty: ______'),
          createFieldParagraph('Each additional 500 sq ft', '$35.90       Qty: ______'),
          createFieldParagraph('Enter Total Sq Ft:', '____________'),

          // 2 — Multifamily
          new Paragraph({
            children: [new TextRun({ text: '2   Each New Service or Largest Feeder (Multifamily & misc.)', bold: true })],
            spacing: { before: 200, after: 60 },
          }),
          createFieldParagraph('0 – 200 amps', '$121.50     Qty: ______'),
          createFieldParagraph('201 – 400 amps', '$151.20     Qty: ______'),
          createFieldParagraph('401 – 600 amps', '$207.70     Qty: ______'),
          createFieldParagraph('601 – 800 amps', '$266.50     Qty: ______'),
          createFieldParagraph('801+ amps', '$380.30     Qty: ______'),
          new Paragraph({
            children: [new TextRun({ text: 'Additional Feeder(s) (if inspected at same time):', bold: true, size: 18 })],
            spacing: { before: 100, after: 40 },
          }),
          createFieldParagraph('0 – 200 amps', '$35.90       Qty: ______'),
          createFieldParagraph('201 – 400 amps', '$74.00       Qty: ______'),
          createFieldParagraph('401 – 600 amps', '$103.20     Qty: ______'),
          createFieldParagraph('601 – 800 amps', '$141.90     Qty: ______'),
          createFieldParagraph('801+ amps', '$285.10     Qty: ______'),

          // 3 — Other items
          new Paragraph({
            children: [new TextRun({ text: '3   Other Fee Items', bold: true })],
            spacing: { before: 200, after: 60 },
          }),
          new Paragraph({ children: [new TextRun({ text: 'Altered Service or Feeder (includes circuits):', bold: true, size: 18 })], spacing: { after: 40 } }),
          createFieldParagraph('0 – 200 amps', '$103.20     Qty: ______'),
          createFieldParagraph('201 – 600 amps', '$151.20     Qty: ______'),
          createFieldParagraph('601+ amps', '$227.90     Qty: ______'),

          new Paragraph({ children: [new TextRun({ text: 'Circuits (added or altered):', bold: true, size: 18 })], spacing: { before: 100, after: 40 } }),
          createFieldParagraph('Per Panel (up to 4)', '$74.00       Qty: ______'),
          createFieldParagraph('Each additional circuit', '$7.70         Qty: ______'),

          new Paragraph({ children: [new TextRun({ text: 'Alarms, Telecom & Other LV Systems:', bold: true, size: 18 })], spacing: { before: 100, after: 40 } }),
          createFieldParagraph('First 2,500 sq ft', '$64.90       Qty: ______'),
          createFieldParagraph('Each additional 2,500 sq ft', '$17.20       Qty: ______'),

          new Paragraph({ children: [new TextRun({ text: 'Thermostats (low-voltage HVAC):', bold: true, size: 18 })], spacing: { before: 100, after: 40 } }),
          createFieldParagraph('First thermostat', '$55.90       Qty: ______'),
          createFieldParagraph('Inspected with service', '$46.80       Qty: ______'),
          createFieldParagraph('Each additional', '$17.20       Qty: ______'),

          new Paragraph({ children: [new TextRun({ text: 'Generators:', bold: true, size: 18 })], spacing: { before: 100, after: 40 } }),
          createFieldParagraph('Portable w/ permanent transfer equip.', '$103.20     Qty: ______'),
          createFieldParagraph('Permanent: 0 – 200 amp feeder', '$121.50     Qty: ______'),
          createFieldParagraph('Permanent: 201 – 400 amp feeder', '$151.20     Qty: ______'),

          new Paragraph({ children: [new TextRun({ text: 'Temporary Service or Feeder:', bold: true, size: 18 })], spacing: { before: 100, after: 40 } }),
          createFieldParagraph('0 – 60 amps', '$64.90       Qty: ______'),
          createFieldParagraph('61 – 100 amps', '$74.00       Qty: ______'),
          createFieldParagraph('101 – 200 amps', '$94.40       Qty: ______'),

          new Paragraph({ children: [new TextRun({ text: 'Other Fees / Inspections:', bold: true, size: 18 })], spacing: { before: 100, after: 40 } }),
          createFieldParagraph('Hot tub, spa, or sauna', '$74.00       Qty: ______'),
          createFieldParagraph('  Inspected with service', '$46.80       Qty: ______'),
          createFieldParagraph('Septic pumping system', '$74.00       Qty: ______'),
          createFieldParagraph('Swimming pool', '$112.60     Qty: ______'),
          createFieldParagraph('  Inspected with service', '$74.00       Qty: ______'),
          createFieldParagraph('Outbuilding / Detached Garage — same time', '$46.80       Qty: ______'),
          createFieldParagraph('  Inspected separately', '$74.00       Qty: ______'),
          createFieldParagraph('Meter/Mast repair or replacement', '$55.80       Qty: ______'),
          createFieldParagraph('Yard pole meter loop', '$74.00       Qty: ______'),
          createFieldParagraph('Progress Inspection — each ½ hour', '$55.90       Qty: ______'),

          createNoteParagraph('If paying by check, make payable to: Department of Labor & Industries.'),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

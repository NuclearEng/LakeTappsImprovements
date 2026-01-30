import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, HeadingLevel, Packer, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, SectionType } from 'docx';
import type { Project } from '@/types';
import {
  drawStandardFooter,
  drawWatermarkMargin,
  wrapText as wrapTextShared,
  drawWrappedText as drawWrappedTextShared,
  COLORS,
  createDocxHeader,
  createDocxFooter,
  createFieldParagraph,
  createBulletItem,
  createBodyParagraph,
  DOCX_COLORS,
  DOCX_PAGE_MARGINS,
} from './documentStyles';

// Shared PDF helpers
function drawDORHeader(
  page: ReturnType<typeof PDFDocument.prototype.addPage>,
  y: number,
  formNumber: string,
  italicFont: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  boldFont: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
): number {
  page.drawText('Department of Revenue', { x: 50, y, size: 10, font: italicFont, color: rgb(0.2, 0.2, 0.2) });
  y -= 14;
  page.drawText('Washington State', { x: 50, y, size: 9, font: italicFont, color: rgb(0.3, 0.3, 0.3) });
  y -= 24;

  // DOR use only box
  page.drawRectangle({ x: 430, y: y + 26, width: 145, height: 40, borderColor: rgb(0, 0, 0), borderWidth: 0.5, color: rgb(1, 1, 1) });
  page.drawText('DOR Use Only', { x: 440, y: y + 50, size: 7, font: boldFont });
  page.drawText('Account ID', { x: 440, y: y + 40, size: 7, font });
  page.drawText('Period/Year', { x: 440, y: y + 30, size: 7, font });

  page.drawText(formNumber, { x: 50, y, size: 10, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
  y -= 24;

  // Title
  page.drawText('Application for Sales Tax Refund on Purchases & Installation of', { x: 50, y, size: 14, font: boldFont });
  y -= 18;
  page.drawText('Qualified Renewable Energy Equipment', { x: 50, y, size: 14, font: boldFont });
  y -= 28;

  return y;
}

function drawBuyerInfo(
  page: ReturnType<typeof PDFDocument.prototype.addPage>,
  y: number,
  project: Project,
  boldFont: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
): number {
  const { owner } = project;
  const ownerName = `${owner.firstName} ${owner.lastName}`;

  page.drawText('Name:', { x: 50, y, size: 10, font: boldFont });
  page.drawText(ownerName, { x: 95, y, size: 10, font });
  page.drawText('Phone Number:', { x: 370, y, size: 10, font: boldFont });
  page.drawText(owner.phone, { x: 460, y, size: 10, font });
  y -= 20;

  page.drawText('Mailing Address:', { x: 50, y, size: 10, font: boldFont });
  page.drawText(owner.address, { x: 160, y, size: 10, font });
  page.drawText('City:', { x: 370, y, size: 10, font: boldFont });
  page.drawText(owner.city, { x: 400, y, size: 10, font });
  y -= 20;

  page.drawText('State:', { x: 50, y, size: 10, font: boldFont });
  page.drawText(owner.state || 'WA', { x: 90, y, size: 10, font });
  page.drawText('Zip:', { x: 150, y, size: 10, font: boldFont });
  page.drawText(owner.zip, { x: 175, y, size: 10, font });
  y -= 28;

  page.drawText('Physical Address of Energy System:', { x: 50, y, size: 10, font: boldFont });
  page.drawText(project.site.propertyAddress || owner.address, { x: 270, y, size: 10, font });
  y -= 32;

  return y;
}

function drawPurchaseTable(
  page: ReturnType<typeof PDFDocument.prototype.addPage>,
  y: number,
  boldFont: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
): number {
  page.drawText('Please complete table below.', { x: 50, y, size: 10, font: boldFont });
  y -= 14;
  y = drawWrappedTextShared(page,
    'The 4-digit location code can be obtained on the department\'s website at dor.wa.gov by clicking on the Find the Sales Tax Rate (GIS) link, on the homepage.',
    50, y, font, 9, 510, rgb(0.3, 0.3, 0.3));
  y -= 12;

  const tableTop = y;
  const colWidths = [90, 80, 90, 100, 155];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const rowHeight = 40;
  const headerHeight = 55;

  page.drawRectangle({ x: 50, y: tableTop - headerHeight, width: tableWidth, height: headerHeight, borderColor: rgb(0, 0, 0), borderWidth: 0.5, color: rgb(0.93, 0.93, 0.93) });

  const headers = [
    'Date of\nPurchase',
    'Location of Purchase\nor Delivery\n(Use 4-digit code)',
    'Purchase Price\n(before tax)',
    'Amount of\nRetail Sales\nTax Paid',
    'Name and Address (City,\nState, & Zip) of Seller\nand/or Installer',
  ];

  let colX = 50;
  for (let i = 0; i < headers.length; i++) {
    if (i > 0) {
      page.drawLine({ start: { x: colX, y: tableTop }, end: { x: colX, y: tableTop - headerHeight - rowHeight * 4 }, thickness: 0.5, color: rgb(0, 0, 0) });
    }
    const lines = headers[i].split('\n');
    let headerY = tableTop - 12;
    for (const line of lines) {
      page.drawText(line, { x: colX + 4, y: headerY, size: 7, font: boldFont });
      headerY -= 10;
    }
    colX += colWidths[i];
  }

  for (let row = 1; row <= 4; row++) {
    const rowY = tableTop - headerHeight - rowHeight * row;
    page.drawLine({ start: { x: 50, y: rowY }, end: { x: 50 + tableWidth, y: rowY }, thickness: 0.5, color: rgb(0, 0, 0) });
  }
  page.drawRectangle({ x: 50, y: tableTop - headerHeight - rowHeight * 4, width: tableWidth, height: headerHeight + rowHeight * 4, borderColor: rgb(0, 0, 0), borderWidth: 0.5 });

  return tableTop - headerHeight - rowHeight * 4 - 24;
}

function drawDeclarationAndSignature(
  page: ReturnType<typeof PDFDocument.prototype.addPage>,
  y: number,
  ownerName: string,
  boldFont: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
): number {
  page.drawText('Declaration and Authorization', { x: 50, y, size: 12, font: boldFont, color: rgb(COLORS.dor.r, COLORS.dor.g, COLORS.dor.b) });
  y -= 20;

  y = drawWrappedTextShared(page,
    'By signing this declaration, I authorize the Washington State Department of Revenue to contact the seller regarding these purchases, and confirm that I have not obtained a refund or credit for these purchases from the seller nor will I seek such a refund or credit for these purchases from the seller in the future. I waive all my rights to prior notice of disclosure of tax information specified in RCW 82.32.330.',
    50, y, font, 9, 510);
  y -= 24;

  page.drawText('Buyer\'s Signature:', { x: 50, y, size: 10, font: boldFont });
  page.drawLine({ start: { x: 170, y: y - 2 }, end: { x: 370, y: y - 2 }, thickness: 0.5, color: rgb(0, 0, 0) });
  page.drawText('Date:', { x: 390, y, size: 10, font: boldFont });
  page.drawLine({ start: { x: 425, y: y - 2 }, end: { x: 560, y: y - 2 }, thickness: 0.5, color: rgb(0, 0, 0) });
  y -= 24;

  page.drawText('Buyer\'s Name (please print):', { x: 50, y, size: 10, font: boldFont });
  page.drawText(ownerName, { x: 230, y, size: 10, font });
  page.drawLine({ start: { x: 230, y: y - 2 }, end: { x: 560, y: y - 2 }, thickness: 0.5, color: rgb(0, 0, 0) });
  y -= 28;

  return y;
}

function drawMailingInstructions(
  page: ReturnType<typeof PDFDocument.prototype.addPage>,
  y: number,
  boldFont: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  italicFont: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
): number {
  page.drawText('Attach legible copies of your receipts to this application and mail to:', { x: 50, y, size: 10, font });
  y -= 18;

  const mailingLines = [
    'Renewable Energy Refunds',
    'State of Washington Department of Revenue',
    'PO Box 47476',
    'Olympia, WA 98504-7476',
  ];
  for (const line of mailingLines) {
    page.drawText(line, { x: 80, y, size: 10, font: boldFont });
    y -= 15;
  }
  y -= 10;

  page.drawText('Make a copy of this completed application for your files.', { x: 50, y, size: 10, font: italicFont });
  y -= 20;
  return y;
}

// Shared FAQ data
const FAQ_STANDARD: [string, string][] = [
  ['1. What information needs to be completed on this application?',
   'All applicable sections must be completed, and the application must be signed. Incomplete applications will not be returned. Submit legible copies of receipts and invoices, not the originals.'],
  ['2. What will happen if this application is not fully completed?',
   'You will be notified by letter that your retail sales tax refund claim was not accepted as filed. You may reapply for a refund within the time frame allowed by statute.'],
  ['3. What is the allowed statutory time frame to claim a refund?',
   'No refund may be made for taxes paid more than four years after the end of calendar year in which the tax was paid to the seller.'],
  ['4. When can I expect my refund?',
   'The department must on a quarterly basis remit exempted amounts to qualifying purchasers who submitted applications during the previous quarter.'],
  ['5. How can I get the 4-digit code for the location of purchase if I don\'t know it?',
   'The 4-digit location code can be obtained on the department\'s website at dor.wa.gov by clicking on the Find the Sales Tax Rate (GIS) link, on the homepage.'],
  ['6. What documentation must be attached to this application?',
   'You must provide legible copies of the following items: Invoices, Receipts, Copy of one line diagram provided with your equipment.'],
  ['7. Can I file for a refund electronically?',
   'Yes, go to the Department\'s website at dor.wa.gov and register for an online account or if you are already registered, sign in to "My DOR." On your My DOR home page in the I want to section, click Send a Message to compose a new message. In the drop down box click on Refund Requests then attach a scanned copy of this completed application and scanned legible copies of supporting documents.'],
  ['8. Where do I mail this application and supporting documents if I do not file electronically?',
   'Attn: Renewable Energy Refunds, Washington State Department of Revenue, PO Box 47476, Olympia, WA 98504-7476'],
  ['9. What records should I keep to support the refund claim?',
   'Keep all supporting documents such as original receipts or invoices, proof of tax paid, and documents describing the machinery and equipment.'],
  ['10. What if I have questions about this application?',
   'Call the Department of Revenue at 360-705-6705, or send an email inquiry to communications@dor.wa.gov. If you have questions about an application you have already submitted, call 360-705-6218.'],
];

// Extended FAQ for Category 1 (Form 40 2432A) - includes additional L&I documentation requirements
const FAQ_CATEGORY1: [string, string][] = [
  ...FAQ_STANDARD.slice(0, 5),
  ['6. What documentation must be attached to this application?',
   'You must provide legible copies of: Invoices; Receipts; Copy of one line diagram provided with your equipment; L&I Project Certification Letter; Copy of the contractor\'s certificate of registration; Contractor\'s current unified business identifier (UBI); Contractor\'s proof of industrial insurance coverage and unemployment insurance coverage; Documentation of the contractor\'s history of compliance with federal and state wage and hours laws and regulations.'],
  ...FAQ_STANDARD.slice(6),
];

// ============================================================
// Form 40 2432 (REV 40 2432e) — Standard residential solar
// "Renewable Energy Facility Generating not Less Than One
//  Kilowatt of Electricity" — for systems under 500 kW
// ============================================================
export async function generateDORStandardRefundPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const ownerName = `${project.owner.firstName} ${project.owner.lastName}`;

  // ---- PAGE 1: Application ----
  const page1 = pdfDoc.addPage([612, 792]);
  let y = 750;

  y = drawDORHeader(page1, y, 'Form 40 2432', italicFont, boldFont, font);

  // Description
  page1.drawText('Renewable Energy Facility Generating not Less Than One Kilowatt of Electricity', { x: 50, y, size: 10, font: boldFont, color: rgb(COLORS.dor.r, COLORS.dor.g, COLORS.dor.b) });
  y -= 24;

  // Buyer info
  y = drawBuyerInfo(page1, y, project, boldFont, font);

  // Purchase table
  y = drawPurchaseTable(page1, y, boldFont, font);

  // Exemption description
  y = drawWrappedTextShared(page1,
    'Sales and use tax exemptions apply to purchases and charges for installing machinery and equipment that will be used directly to generate electricity using fuel cells, sun, wind, biomass energy, tidal and wave energy, geothermal resources, technology that converts otherwise lost energy from exhaust, or gas in a facility that generates not less than one kilowatt of electricity based on the nameplate of the equipment.',
    50, y, font, 8, 510, rgb(0.3, 0.3, 0.3));
  y -= 16;

  // Exemption amount
  page1.drawText('Exemption Amount', { x: 50, y, size: 11, font: boldFont, color: rgb(COLORS.dor.r, COLORS.dor.g, COLORS.dor.b) });
  y -= 18;

  page1.drawText('\u2022', { x: 60, y, size: 9, font });
  y = drawWrappedTextShared(page1,
    'From July 1, 2009 through June 30, 2011, the exemption is equal to 100 percent of the total sales or use tax due when the sale occurs.',
    75, y, font, 9, 485);
  y -= 6;

  page1.drawText('\u2022', { x: 60, y, size: 9, font });
  y = drawWrappedTextShared(page1,
    'From July 1, 2011 through December 31, 2019, the exemption is a partial exemption in the form of a refund from the Department of Revenue for 75 percent of total sales or use tax paid to the seller when the sale occurs.',
    75, y, font, 9, 485);
  y -= 16;

  // Declaration and signature
  y = drawDeclarationAndSignature(page1, y, ownerName, boldFont, font);

  // Mailing instructions
  y = drawMailingInstructions(page1, y, boldFont, font, italicFont);

  // Watermark and footer
  drawWatermarkMargin(page1, font);
  drawStandardFooter(page1, font, 1, 2, 'REV 40 2432e — DOR Sales Tax Refund Application');

  // ---- PAGE 2: Instructions ----
  const page2 = pdfDoc.addPage([612, 792]);
  y = 750;

  page2.drawText('Instructions', { x: 50, y, size: 14, font: boldFont, color: rgb(COLORS.dor.r, COLORS.dor.g, COLORS.dor.b) });
  y -= 28;

  for (const [question, answer] of FAQ_STANDARD) {
    if (y < 80) break;
    page2.drawText(question, { x: 50, y, size: 9, font: boldFont });
    y -= 14;
    y = drawWrappedTextShared(page2, answer, 50, y, font, 8, 510, rgb(0.25, 0.25, 0.25));
    y -= 14;
  }

  // Accessibility footer
  y -= 8;
  y = drawWrappedTextShared(page2,
    'For tax assistance or to request this document in an alternate format, please call 360-705-6705. Teletype (TTY) users may use the Washington State Relay Service by calling 711.',
    50, y, font, 7, 510, rgb(0.4, 0.4, 0.4));

  // Watermark and footer
  drawWatermarkMargin(page2, font);
  drawStandardFooter(page2, font, 2, 2, 'REV 40 2432e — DOR Sales Tax Refund Instructions');

  return pdfDoc.save();
}

export async function generateDORStandardRefundDOCX(project: Project): Promise<Blob> {
  const { owner } = project;
  const ownerName = `${owner.firstName} ${owner.lastName}`;

  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  };

  function sectionHeading(text: string): Paragraph {
    return new Paragraph({
      children: [new TextRun({ text, bold: true, size: 24, color: DOCX_COLORS.dor })],
      spacing: { before: 240, after: 120 },
    });
  }

  const tableHeaders = ['Date of Purchase', 'Location of Purchase or Delivery (4-digit code)', 'Purchase Price (before tax)', 'Amount of Retail Sales Tax Paid', 'Name and Address of Seller and/or Installer'];
  const headerRow = new TableRow({
    children: tableHeaders.map(h => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 16 })], alignment: AlignmentType.CENTER })],
      borders: thinBorder,
      shading: { fill: 'EEEEEE' },
    })),
  });

  const emptyRows = Array.from({ length: 4 }, () => new TableRow({
    children: tableHeaders.map(() => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: '', size: 20 })], spacing: { before: 120, after: 120 } })],
      borders: thinBorder,
    })),
  }));

  const standardHeader = createDocxHeader('DOR Form 40 2432');
  const standardFooter = createDocxFooter('REV 40 2432e — DOR Sales Tax Refund Application');

  const doc = new Document({
    sections: [
      // Page 1: Application
      {
        properties: { page: { margin: DOCX_PAGE_MARGINS } },
        headers: { default: standardHeader },
        footers: { default: standardFooter },
        children: [
          new Paragraph({ children: [new TextRun({ text: 'Department of Revenue', italics: true, size: 20, color: '444444' })] }),
          new Paragraph({ children: [new TextRun({ text: 'Washington State', italics: true, size: 18, color: '666666' })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: 'Form 40 2432', bold: true, size: 20, color: '333333' })], spacing: { after: 200 } }),
          new Paragraph({
            children: [new TextRun({ text: 'Application for Sales Tax Refund on Purchases & Installation of Qualified Renewable Energy Equipment', bold: true, size: 28 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120 },
          }),
          sectionHeading('Renewable Energy Facility Generating not Less Than One Kilowatt of Electricity'),

          new Paragraph({ children: [new TextRun({ text: 'BUYER INFORMATION', bold: true, size: 22 })], spacing: { before: 200, after: 120 } }),
          createFieldParagraph('Name:', ownerName),
          createFieldParagraph('Phone Number:', owner.phone),
          createFieldParagraph('Mailing Address:', owner.address),
          createFieldParagraph('City:', `${owner.city}     State: ${owner.state || 'WA'}     Zip: ${owner.zip}`),
          new Paragraph({ spacing: { after: 80 } }),
          createFieldParagraph('Physical Address of Energy System:', project.site.propertyAddress || owner.address),

          new Paragraph({
            children: [new TextRun({ text: 'Please complete table below.', bold: true, size: 20 })],
            spacing: { before: 240, after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'The 4-digit location code can be obtained on the department\'s website at dor.wa.gov by clicking on the Find the Sales Tax Rate (GIS) link, on the homepage.', size: 18, color: '555555' })],
            spacing: { after: 120 },
          }),
          new Table({ rows: [headerRow, ...emptyRows], width: { size: 100, type: WidthType.PERCENTAGE } }),

          new Paragraph({
            children: [new TextRun({
              text: 'Sales and use tax exemptions apply to purchases and charges for installing machinery and equipment that will be used directly to generate electricity using fuel cells, sun, wind, biomass energy, tidal and wave energy, geothermal resources, technology that converts otherwise lost energy from exhaust, or gas in a facility that generates not less than one kilowatt of electricity based on the nameplate of the equipment.',
              size: 16, color: '555555',
            })],
            spacing: { before: 200, after: 160 },
          }),

          sectionHeading('Exemption Amount'),
          new Paragraph({
            children: [new TextRun({ text: '\u2022  From July 1, 2009 through June 30, 2011, the exemption is equal to 100 percent of the total sales or use tax due when the sale occurs.', size: 18 })],
            spacing: { after: 80 }, indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun({ text: '\u2022  From July 1, 2011 through December 31, 2019, the exemption is a partial exemption in the form of a refund from the Department of Revenue for 75 percent of total sales or use tax paid to the seller when the sale occurs.', size: 18 })],
            spacing: { after: 160 }, indent: { left: 360 },
          }),

          sectionHeading('Declaration and Authorization'),
          new Paragraph({
            children: [new TextRun({
              text: 'By signing this declaration, I authorize the Washington State Department of Revenue to contact the seller regarding these purchases, and confirm that I have not obtained a refund or credit for these purchases from the seller nor will I seek such a refund or credit for these purchases from the seller in the future. I waive all my rights to prior notice of disclosure of tax information specified in RCW 82.32.330.',
              size: 18,
            })],
            spacing: { after: 200 },
          }),
          createFieldParagraph('Buyer\'s Signature:', '____________________________'),
          createFieldParagraph('Date:', '____________________________'),
          new Paragraph({ spacing: { after: 80 } }),
          createFieldParagraph('Buyer\'s Name (please print):', ownerName),

          new Paragraph({
            children: [new TextRun({ text: 'Attach legible copies of your receipts to this application and mail to:', size: 20 })],
            spacing: { before: 200, after: 100 },
          }),
          ...(['Renewable Energy Refunds', 'State of Washington Department of Revenue', 'PO Box 47476', 'Olympia, WA 98504-7476'].map(line =>
            new Paragraph({ children: [new TextRun({ text: line, bold: true, size: 20 })], indent: { left: 720 }, spacing: { after: 40 } })
          )),
          new Paragraph({
            children: [new TextRun({ text: 'Make a copy of this completed application for your files.', italics: true, size: 18 })],
            spacing: { before: 120 },
          }),
        ],
      },

      // Page 2: Instructions
      {
        properties: { type: SectionType.NEXT_PAGE, page: { margin: DOCX_PAGE_MARGINS } },
        headers: { default: standardHeader },
        footers: { default: standardFooter },
        children: [
          sectionHeading('Instructions'),
          ...FAQ_STANDARD.flatMap(([q, a]) => [
            new Paragraph({ children: [new TextRun({ text: q, bold: true, size: 20 })], spacing: { before: 160, after: 60 } }),
            new Paragraph({ children: [new TextRun({ text: a, size: 20, color: '444444' })], spacing: { after: 100 } }),
          ]),
          new Paragraph({
            children: [new TextRun({ text: 'For tax assistance or to request this document in an alternate format, please call 360-705-6705. Teletype (TTY) users may use the Washington State Relay Service by calling 711.', size: 14, color: '888888' })],
            spacing: { before: 200 }, alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}


// ============================================================
// Form 40 2432A — Category 1: Large systems (>500 kW solar
// or >1 kW non-solar renewable energy with L&I certification)
// ============================================================
export async function generateDORCategory1RefundPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const ownerName = `${project.owner.firstName} ${project.owner.lastName}`;

  // ---- PAGE 1 ----
  const page1 = pdfDoc.addPage([612, 792]);
  let y = 750;

  y = drawDORHeader(page1, y, 'Form 40 2432A', italicFont, boldFont, font);

  page1.drawText('Category 1', { x: 50, y, size: 11, font: boldFont, color: rgb(COLORS.dor.r, COLORS.dor.g, COLORS.dor.b) });
  page1.drawText(' - Renewable energy facility generating more than one kilowatt of', { x: 120, y, size: 10, font });
  y -= 14;
  page1.drawText('electricity and solar energy systems generating over 500 kilowatts.', { x: 50, y, size: 10, font });
  y -= 28;

  y = drawBuyerInfo(page1, y, project, boldFont, font);
  y = drawPurchaseTable(page1, y, boldFont, font);

  y = drawWrappedTextShared(page1,
    'Sales and use tax exemptions apply to purchases and charges for installing machinery and equipment that will be used directly to generate electricity using fuel cells, wind, biomass energy, tidal and wave energy, geothermal resources, technology that converts otherwise lost energy from exhaust, or gas in a facility that generates not less than one kilowatt of electricity based on the nameplate of the equipment. The exemption also applies to solar energy systems generating over 500 kilowatts of electricity.',
    50, y, font, 8, 510, rgb(0.3, 0.3, 0.3));

  // Watermark and footer
  drawWatermarkMargin(page1, font);
  drawStandardFooter(page1, font, 1, 3, 'REV 40 2432A — DOR Sales Tax Refund Application (Category 1)');

  // ---- PAGE 2: Exemption tiers & Declaration ----
  const page2 = pdfDoc.addPage([612, 792]);
  y = 750;

  page2.drawText('Application for Sales Tax Refund on Purchases & Installation of Qualified', { x: 50, y, size: 11, font: boldFont });
  y -= 15;
  page2.drawText('Renewable Energy Equipment', { x: 50, y, size: 11, font: boldFont });
  y -= 28;

  page2.drawText('Exemption Amount', { x: 50, y, size: 12, font: boldFont, color: rgb(COLORS.dor.r, COLORS.dor.g, COLORS.dor.b) });
  y -= 20;

  y = drawWrappedTextShared(page2,
    'From January 1, 2020 through December 31, 2029, the exemption is equal to 50 percent of the total sales or use tax paid on purchases of the electricity generating systems listed above, provided the Department of Labor & Industries certifies that the project includes all of the following:',
    50, y, font, 9, 510);
  y -= 8;

  const requirements = [
    'Procurement from the contracts with women, minority, or veteran owned businesses.',
    'Procurement from and contracts with entities that have a history of complying with federal and state wage and hour laws and regulations.',
    'Apprenticeship utilization.',
    'Preferred entry for workers living in the area where the project is being constructed.',
  ];
  for (const req of requirements) {
    page2.drawText('\u2022', { x: 60, y, size: 9, font });
    y = drawWrappedTextShared(page2, req, 75, y, font, 9, 485);
    y -= 4;
  }
  y -= 8;

  y = drawWrappedTextShared(page2,
    'The exemption is equal to 75 percent of the total sales or use tax paid for systems if the Department of Labor & Industries certifies the project complies with the requirements above and the project compensates workers at prevailing wage rates determined by the Department of Labor & Industries.',
    50, y, font, 9, 510);
  y -= 12;

  y = drawWrappedTextShared(page2,
    'The exemption is equal to 100 percent of the total sales or use tax paid for systems if the Department of Labor & Industries certifies the project is developed under a community workforce or project labor agreement.',
    50, y, font, 9, 510);
  y -= 24;

  y = drawDeclarationAndSignature(page2, y, ownerName, boldFont, font);
  y -= 8;
  y = drawMailingInstructions(page2, y, boldFont, font, italicFont);

  // Watermark and footer
  drawWatermarkMargin(page2, font);
  drawStandardFooter(page2, font, 2, 3, 'REV 40 2432A — DOR Sales Tax Refund Application (Category 1)');

  // ---- PAGE 3: Instructions ----
  const page3 = pdfDoc.addPage([612, 792]);
  y = 750;

  page3.drawText('Application for Sales Tax Refund on Purchases & Installation of Qualified', { x: 50, y, size: 11, font: boldFont });
  y -= 15;
  page3.drawText('Renewable Energy Equipment', { x: 50, y, size: 11, font: boldFont });
  y -= 28;

  page3.drawText('Instructions and frequently asked questions', { x: 50, y, size: 12, font: boldFont, color: rgb(COLORS.dor.r, COLORS.dor.g, COLORS.dor.b) });
  y -= 24;

  for (const [question, answer] of FAQ_CATEGORY1) {
    if (y < 80) break;
    page3.drawText(question, { x: 50, y, size: 9, font: boldFont });
    y -= 14;
    y = drawWrappedTextShared(page3, answer, 50, y, font, 8, 510, rgb(0.25, 0.25, 0.25));
    y -= 12;
  }

  // Watermark and footer
  drawWatermarkMargin(page3, font);
  drawStandardFooter(page3, font, 3, 3, 'REV 40 2432A — DOR Sales Tax Refund Instructions (Category 1)');

  return pdfDoc.save();
}

export async function generateDORCategory1RefundDOCX(project: Project): Promise<Blob> {
  const { owner } = project;
  const ownerName = `${owner.firstName} ${owner.lastName}`;

  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  };

  function sectionHeading(text: string): Paragraph {
    return new Paragraph({
      children: [new TextRun({ text, bold: true, size: 24, color: DOCX_COLORS.dor })],
      spacing: { before: 240, after: 120 },
    });
  }

  const tableHeaders = ['Date of Purchase', 'Location (4-digit code)', 'Purchase Price (before tax)', 'Amount of Retail Sales Tax Paid', 'Name and Address of Seller/Installer'];
  const headerRow = new TableRow({
    children: tableHeaders.map(h => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 16 })], alignment: AlignmentType.CENTER })],
      borders: thinBorder,
      shading: { fill: 'EEEEEE' },
    })),
  });
  const emptyRows = Array.from({ length: 4 }, () => new TableRow({
    children: tableHeaders.map(() => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: '', size: 20 })], spacing: { before: 120, after: 120 } })],
      borders: thinBorder,
    })),
  }));

  const cat1Header = createDocxHeader('DOR Form 40 2432A');
  const cat1Footer = createDocxFooter('REV 40 2432A — DOR Sales Tax Refund (Category 1)');

  const doc = new Document({
    sections: [
      // Page 1
      {
        properties: { page: { margin: DOCX_PAGE_MARGINS } },
        headers: { default: cat1Header },
        footers: { default: cat1Footer },
        children: [
          new Paragraph({ children: [new TextRun({ text: 'Department of Revenue', italics: true, size: 20, color: '444444' })] }),
          new Paragraph({ children: [new TextRun({ text: 'Washington State', italics: true, size: 18, color: '666666' })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: 'Form 40 2432A', bold: true, size: 20, color: '333333' })], spacing: { after: 200 } }),
          new Paragraph({
            children: [new TextRun({ text: 'Application for Sales Tax Refund on Purchases & Installation of Qualified Renewable Energy Equipment', bold: true, size: 28 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),
          sectionHeading('Category 1 - Renewable energy facility generating more than one kilowatt of electricity and solar energy systems generating over 500 kilowatts.'),

          new Paragraph({ children: [new TextRun({ text: 'BUYER INFORMATION', bold: true, size: 22 })], spacing: { before: 300, after: 120 } }),
          createFieldParagraph('Name (buyer):', ownerName),
          createFieldParagraph('Phone number:', owner.phone),
          createFieldParagraph('Mailing address:', owner.address),
          createFieldParagraph('City:', `${owner.city}     State: ${owner.state || 'WA'}     Zip: ${owner.zip}`),
          new Paragraph({ spacing: { after: 120 } }),
          createFieldParagraph('Physical address of energy system:', project.site.propertyAddress || owner.address),
          createFieldParagraph('City:', `${owner.city}     State: WA     Zip: ${owner.zip}`),

          new Paragraph({ children: [new TextRun({ text: 'Please complete the table below.', bold: true, size: 20 })], spacing: { before: 240, after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: 'The 4-digit location code can be obtained on the department\'s website at dor.wa.gov by clicking on the Find a sales and use tax rate link, on the homepage.', size: 18, color: '555555' })], spacing: { after: 120 } }),
          new Table({ rows: [headerRow, ...emptyRows], width: { size: 100, type: WidthType.PERCENTAGE } }),

          new Paragraph({
            children: [new TextRun({ text: 'Sales and use tax exemptions apply to purchases and charges for installing machinery and equipment that will be used directly to generate electricity using fuel cells, wind, biomass energy, tidal and wave energy, geothermal resources, technology that converts otherwise lost energy from exhaust, or gas in a facility that generates not less than one kilowatt of electricity based on the nameplate of the equipment. The exemption also applies to solar energy systems generating over 500 kilowatts of electricity.', size: 16, color: '555555' })],
            spacing: { before: 200, after: 100 },
          }),
        ],
      },
      // Page 2: Exemption Amount & Declaration
      {
        properties: { type: SectionType.NEXT_PAGE, page: { margin: DOCX_PAGE_MARGINS } },
        headers: { default: cat1Header },
        footers: { default: cat1Footer },
        children: [
          new Paragraph({ children: [new TextRun({ text: 'Application for Sales Tax Refund on Purchases & Installation of Qualified Renewable Energy Equipment', bold: true, size: 22 })], spacing: { after: 200 } }),
          sectionHeading('Exemption Amount'),
          new Paragraph({ children: [new TextRun({ text: 'From January 1, 2020 through December 31, 2029, the exemption is equal to 50 percent of the total sales or use tax paid on purchases of the electricity generating systems listed above, provided the Department of Labor & Industries certifies that the project includes all of the following:', size: 18 })], spacing: { after: 120 } }),
          ...(['Procurement from the contracts with women, minority, or veteran owned businesses.',
            'Procurement from and contracts with entities that have a history of complying with federal and state wage and hour laws and regulations.',
            'Apprenticeship utilization.',
            'Preferred entry for workers living in the area where the project is being constructed.',
          ].map(req => new Paragraph({ children: [new TextRun({ text: `\u2022  ${req}`, size: 18 })], spacing: { after: 60 }, indent: { left: 360 } }))),
          new Paragraph({ children: [new TextRun({ text: 'The exemption is equal to 75 percent of the total sales or use tax paid for systems if the Department of Labor & Industries certifies the project complies with the requirements above and the project compensates workers at prevailing wage rates determined by the Department of Labor & Industries.', size: 18 })], spacing: { before: 160, after: 120 } }),
          new Paragraph({ children: [new TextRun({ text: 'The exemption is equal to 100 percent of the total sales or use tax paid for systems if the Department of Labor & Industries certifies the project is developed under a community workforce or project labor agreement.', size: 18 })], spacing: { after: 200 } }),
          sectionHeading('Declaration and Authorization'),
          new Paragraph({ children: [new TextRun({ text: 'By signing this declaration, I authorize the Washington State Department of Revenue to contact the seller regarding these purchases, and confirm that I have not obtained a refund or credit for these purchases from the seller nor will I seek such a refund or credit for these purchases from the seller in the future. I waive all my rights to prior notice of disclosure of tax information specified in RCW 82.32.330.', size: 18 })], spacing: { after: 200 } }),
          createFieldParagraph('Buyer\'s signature:', '____________________________'),
          createFieldParagraph('Date:', '____________________________'),
          new Paragraph({ spacing: { after: 80 } }),
          createFieldParagraph('Buyer\'s name (please print or type):', ownerName),
          sectionHeading('What to do next'),
          new Paragraph({ children: [new TextRun({ text: 'Attach legible copies of your receipts to this application and mail to:', size: 20 })], spacing: { after: 120 } }),
          ...(['Department of Revenue', 'Renewable Energy Refunds', 'PO Box 47476', 'Olympia, WA 98504-7476'].map(line =>
            new Paragraph({ children: [new TextRun({ text: line, bold: true, size: 20 })], indent: { left: 720 }, spacing: { after: 40 } })
          )),
          new Paragraph({ children: [new TextRun({ text: 'Please keep a copy of this application for your records.', italics: true, size: 18 })], spacing: { before: 160 } }),
        ],
      },
      // Page 3: Instructions
      {
        properties: { type: SectionType.NEXT_PAGE, page: { margin: DOCX_PAGE_MARGINS } },
        headers: { default: cat1Header },
        footers: { default: cat1Footer },
        children: [
          new Paragraph({ children: [new TextRun({ text: 'Application for Sales Tax Refund on Purchases & Installation of Qualified Renewable Energy Equipment', bold: true, size: 22 })], spacing: { after: 200 } }),
          sectionHeading('Instructions and frequently asked questions'),
          ...FAQ_CATEGORY1.flatMap(([q, a]) => [
            new Paragraph({ children: [new TextRun({ text: q, bold: true, size: 20 })], spacing: { before: 160, after: 60 } }),
            new Paragraph({ children: [new TextRun({ text: a, size: 20, color: '444444' })], spacing: { after: 100 } }),
          ]),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}


// ============================================================
// Auto-selecting wrapper — picks the right form based on
// system size. Most residential systems are under 500 kW,
// so the standard form is the default.
// ============================================================

/**
 * Generates the appropriate DOR Sales Tax Refund PDF based on system size.
 * - Systems under 500 kW → Form 40 2432 (REV 40 2432e)
 * - Systems 500 kW or above → Form 40 2432A (Category 1)
 */
export async function generateDORSalesTaxRefundPDF(project: Project): Promise<Uint8Array> {
  const systemKW = project.details.solarSystemSize || 0;
  if (systemKW >= 500) {
    return generateDORCategory1RefundPDF(project);
  }
  return generateDORStandardRefundPDF(project);
}

/**
 * Generates the appropriate DOR Sales Tax Refund DOCX based on system size.
 * - Systems under 500 kW → Form 40 2432 (REV 40 2432e)
 * - Systems 500 kW or above → Form 40 2432A (Category 1)
 */
export async function generateDORSalesTaxRefundDOCX(project: Project): Promise<Blob> {
  const systemKW = project.details.solarSystemSize || 0;
  if (systemKW >= 500) {
    return generateDORCategory1RefundDOCX(project);
  }
  return generateDORStandardRefundDOCX(project);
}

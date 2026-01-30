import { PDFDocument, PDFPage, PDFFont, rgb, degrees } from 'pdf-lib';
import {
  Paragraph,
  TextRun,
  Header,
  Footer,
  PageNumber,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ImageRun,
  ShadingType,
} from 'docx';

// ── Constants ────────────────────────────────────────────────────────────────

export const PAGE_WIDTH = 612;
export const PAGE_HEIGHT = 792;
export const MARGIN_LEFT = 50;
export const MARGIN_RIGHT = 562;
export const TABLE_WIDTH = MARGIN_RIGHT - MARGIN_LEFT;

/** Agency color palette (RGB 0-1 for pdf-lib) */
export const COLORS = {
  cwa: { r: 0.12, g: 0.24, b: 0.55 },       // CWA deep blue
  pierce: { r: 0.1, g: 0.2, b: 0.5 },        // Pierce County navy
  solar: { r: 0.8, g: 0.5, b: 0.0 },         // Solar orange
  adu: { r: 0.1, g: 0.5, b: 0.3 },           // ADU green
  lni: { r: 0.1, g: 0.15, b: 0.35 },         // L&I dark blue
  dor: { r: 0.1, g: 0.3, b: 0.6 },           // DOR blue
  gray: { r: 0.93, g: 0.93, b: 0.93 },       // Watermark gray
  lightGray: { r: 0.85, g: 0.85, b: 0.85 },  // Header band bg
  medGray: { r: 0.6, g: 0.6, b: 0.6 },       // Footer text
  hrGray: { r: 0.78, g: 0.78, b: 0.78 },     // Horizontal rule
};

/** Agency color palette (hex for docx) */
export const DOCX_COLORS = {
  cwa: '1E3D8C',
  pierce: '1A3380',
  solar: 'CC8800',
  adu: '1A804D',
  lni: '1A2659',
  dor: '1A4D99',
  watermark: 'EDEDED',
  headerBandCwa: 'D6E0F5',
  headerBandPierce: 'D6DBF0',
  headerBandSolar: 'FFF0D6',
  headerBandAdu: 'D6F0E3',
  headerBandLni: 'D6DAE8',
  headerBandDor: 'D6E3F5',
  warningRed: 'B91C1C',
  noteRed: '993333',
};

/** Standardized PDF font sizes */
export const PDF_FONT = {
  title: 16,
  subtitle: 14,
  sectionHeader: 12,
  body: 10,
  label: 10,
  checklist: 9,
  smallNote: 8,
  footer: 7,
};

/** Standardized PDF spacing (Y-axis decrements) */
export const PDF_SPACING = {
  fieldRow: 18,
  afterSectionHeader: 10,
  betweenSections: 4,
  checklistItem: 14,
  afterDescription: 12,
};

/** Standardized PDF x-positions for form fields */
export const PDF_FIELD_X = {
  label: MARGIN_LEFT,
  value: 170,
  valueWide: 200,
};

// ── PDF Utilities ────────────────────────────────────────────────────────────

/** Draw a colored rectangle behind a section header */
export function drawColoredHeaderBand(
  page: PDFPage,
  y: number,
  title: string,
  bgColor: { r: number; g: number; b: number },
  font: PDFFont,
  fontSize: number = 12,
): number {
  const bandHeight = 22;
  page.drawRectangle({
    x: MARGIN_LEFT,
    y: y - bandHeight + 6,
    width: TABLE_WIDTH,
    height: bandHeight,
    color: rgb(bgColor.r, bgColor.g, bgColor.b),
  });
  page.drawText(title, {
    x: MARGIN_LEFT + 8,
    y: y - bandHeight + 12,
    size: fontSize,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
  return y - bandHeight - 4;
}

/** Draw a thin gray horizontal rule */
export function drawHorizontalRule(page: PDFPage, y: number): number {
  page.drawLine({
    start: { x: MARGIN_LEFT, y },
    end: { x: MARGIN_RIGHT, y },
    thickness: 0.5,
    color: rgb(COLORS.hrGray.r, COLORS.hrGray.g, COLORS.hrGray.b),
  });
  return y - 8;
}

/** Draw a standardized footer with page numbers, doc title, generation date */
export function drawStandardFooter(
  page: PDFPage,
  font: PDFFont,
  pageNum: number,
  totalPages: number,
  docTitle: string,
): void {
  const footerY = 30;
  // Top line: doc title
  page.drawText(docTitle, {
    x: MARGIN_LEFT,
    y: footerY + 14,
    size: 7,
    font,
    color: rgb(COLORS.medGray.r, COLORS.medGray.g, COLORS.medGray.b),
  });
  // Bottom left: page number
  page.drawText(`Page ${pageNum} of ${totalPages}`, {
    x: MARGIN_LEFT,
    y: footerY + 2,
    size: 7,
    font,
    color: rgb(COLORS.medGray.r, COLORS.medGray.g, COLORS.medGray.b),
  });
  // Bottom right: generation date
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: 440,
    y: footerY + 2,
    size: 7,
    font,
    color: rgb(COLORS.medGray.r, COLORS.medGray.g, COLORS.medGray.b),
  });
}

/** Draw "APPLICATION COPY" watermark rotated 90° in the right margin */
export function drawWatermarkMargin(page: PDFPage, font: PDFFont): void {
  page.drawText('APPLICATION COPY', {
    x: 585,
    y: 300,
    size: 10,
    font,
    color: rgb(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b),
    rotate: degrees(90),
  });
}

/** Draw a bordered signature block with labeled Signature/Date/Print Name lines */
export function drawSignatureBlock(
  page: PDFPage,
  y: number,
  font: PDFFont,
  boldFont: PDFFont,
  sigLabel: string = 'Applicant Signature',
): number {
  const boxHeight = 90;
  const boxWidth = TABLE_WIDTH;

  // Light gray bordered box
  page.drawRectangle({
    x: MARGIN_LEFT,
    y: y - boxHeight,
    width: boxWidth,
    height: boxHeight,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.5,
  });

  // Signature line
  const sigLineY = y - 30;
  page.drawLine({
    start: { x: MARGIN_LEFT + 15, y: sigLineY },
    end: { x: MARGIN_LEFT + 280, y: sigLineY },
    thickness: 0.5,
  });
  page.drawText(sigLabel, {
    x: MARGIN_LEFT + 15,
    y: sigLineY - 12,
    size: 8,
    font,
  });

  // Date line
  page.drawLine({
    start: { x: MARGIN_LEFT + 310, y: sigLineY },
    end: { x: MARGIN_LEFT + boxWidth - 20, y: sigLineY },
    thickness: 0.5,
  });
  page.drawText('Date', {
    x: MARGIN_LEFT + 310,
    y: sigLineY - 12,
    size: 8,
    font,
  });

  // Print Name line
  const nameLineY = y - 70;
  page.drawLine({
    start: { x: MARGIN_LEFT + 15, y: nameLineY },
    end: { x: MARGIN_LEFT + 280, y: nameLineY },
    thickness: 0.5,
  });
  page.drawText('Print Name', {
    x: MARGIN_LEFT + 15,
    y: nameLineY - 12,
    size: 8,
    font,
  });

  return y - boxHeight - 10;
}

/** Word-wrap text and return the wrapped lines */
export function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/** Draw wrapped text on a PDF page, return updated Y position */
export function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
  color = rgb(0, 0, 0),
  lineSpacing: number = 3,
): number {
  const lines = wrapText(text, font, fontSize, maxWidth);
  for (const line of lines) {
    page.drawText(line, { x, y, size: fontSize, font, color });
    y -= fontSize + lineSpacing;
  }
  return y;
}

/** Embed CWA logo into a PDFDocument (returns the embedded image or null) */
export async function embedCWALogo(pdfDoc: PDFDocument) {
  try {
    const { getCWALogoBytes } = await import('./cwaLogo');
    const logoBytes = getCWALogoBytes();
    return await pdfDoc.embedJpg(logoBytes);
  } catch {
    return null;
  }
}

// ── DOCX Utilities ───────────────────────────────────────────────────────────

/** Create a proper DOCX Header with optional logo and "APPLICATION COPY" watermark text */
export function createDocxHeader(
  title: string,
  logoBytes?: Uint8Array,
): Header {
  const children: Paragraph[] = [];

  // Title row (with optional logo)
  const titleChildren: (TextRun | ImageRun)[] = [];
  if (logoBytes) {
    titleChildren.push(
      new ImageRun({
        data: logoBytes,
        transformation: { width: 45, height: 40 },
      }),
    );
    titleChildren.push(new TextRun({ text: '  ' }));
  }
  titleChildren.push(
    new TextRun({
      text: title,
      bold: true,
      size: 16,
      color: '555555',
    }),
  );

  children.push(
    new Paragraph({
      children: titleChildren,
      spacing: { after: 0 },
    }),
  );

  // Watermark text in light gray
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: 'APPLICATION COPY',
          size: 14,
          color: DOCX_COLORS.watermark,
        }),
      ],
      spacing: { after: 100 },
    }),
  );

  return new Header({ children });
}

/** Create a proper DOCX Footer with page numbers and doc title */
export function createDocxFooter(docTitle: string): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: `${docTitle}  |  Page `,
            size: 14,
            color: '999999',
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 14,
            color: '999999',
          }),
          new TextRun({
            text: ' of ',
            size: 14,
            color: '999999',
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            size: 14,
            color: '999999',
          }),
          new TextRun({
            text: `  |  Generated: ${new Date().toLocaleDateString()}`,
            size: 14,
            color: '999999',
          }),
        ],
      }),
    ],
  });
}

/** Create a section heading with shaded background */
export function createDocxSectionHeading(
  text: string,
  fillColor: string,
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: '1A1A1A',
      }),
    ],
    shading: {
      type: ShadingType.CLEAR,
      fill: fillColor,
    },
    spacing: { before: 300, after: 200 },
    indent: { left: 120 },
  });
}

/** Create a DOCX table-based signature block */
export function createDocxSignatureBlock(
  sigLabel: string = 'Applicant Signature',
): Table {
  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: 'CCCCCC',
  };
  const borders = {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Signature + Date row
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 60, type: WidthType.PERCENTAGE },
            shading: { fill: 'F7F7F7' },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: '\n\n', size: 20 }),
                ],
                spacing: { before: 300, after: 0 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '___________________________________________',
                    size: 18,
                  }),
                ],
                spacing: { after: 40 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: sigLabel, size: 16, color: '666666' }),
                ],
                spacing: { after: 100 },
              }),
            ],
          }),
          new TableCell({
            borders,
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: { fill: 'F7F7F7' },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: '\n\n', size: 20 }),
                ],
                spacing: { before: 300, after: 0 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: '________________________',
                    size: 18,
                  }),
                ],
                spacing: { after: 40 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Date', size: 16, color: '666666' }),
                ],
                spacing: { after: 100 },
              }),
            ],
          }),
        ],
      }),
      // Print Name row
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: 'F7F7F7' },
            columnSpan: 2,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: '___________________________________________',
                    size: 18,
                  }),
                ],
                spacing: { before: 100, after: 40 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Print Name',
                    size: 16,
                    color: '666666',
                  }),
                ],
                spacing: { after: 100 },
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/** Create a horizontal rule paragraph */
export function createDocxHorizontalRule(): Paragraph {
  return new Paragraph({
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: 'C8C8C8',
        space: 1,
      },
    },
    spacing: { before: 100, after: 100 },
  });
}

/** Create a field paragraph with bold label and normal value */
export function createFieldParagraph(
  label: string,
  value: string,
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: label + ' ', bold: true, size: 20 }),
      new TextRun({ text: value, size: 20 }),
    ],
    spacing: { after: 80 },
  });
}

/** Create a consistently formatted checklist item */
export function createChecklistItem(
  text: string,
  options?: { indent?: boolean; spacing?: number },
): Paragraph {
  const indent = options?.indent !== false;
  const spacingAfter = options?.spacing ?? 60;
  return new Paragraph({
    children: [new TextRun({ text, size: 20 })],
    spacing: { after: spacingAfter },
    ...(indent ? { indent: { left: 360 } } : {}),
  });
}

/** Create a styled bullet list item */
export function createBulletItem(
  text: string,
  options?: { indent?: boolean; spacing?: number },
): Paragraph {
  const indent = options?.indent !== false;
  const spacingAfter = options?.spacing ?? 60;
  return new Paragraph({
    children: [new TextRun({ text: `\u2022  ${text}`, size: 20 })],
    spacing: { after: spacingAfter },
    ...(indent ? { indent: { left: 360 } } : {}),
  });
}

/** Create a note/callout paragraph with italic styling */
export function createNoteParagraph(
  text: string,
  color: string = '666666',
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text, size: 18, color, italics: true }),
    ],
    spacing: { after: 120 },
  });
}

/** Create a body text paragraph with standard sizing */
export function createBodyParagraph(
  text: string,
  options?: { spacing?: { before?: number; after?: number } },
): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 20 })],
    spacing: options?.spacing ?? { after: 120 },
  });
}

/** Standard DOCX page margins (0.5 inch = 720 twips) */
export const DOCX_PAGE_MARGINS = {
  top: 720,
  bottom: 720,
  left: 720,
  right: 720,
};

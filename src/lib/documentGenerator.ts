import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, Packer, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import type { Project, SitePlanDrawing } from '@/types';
import { getCWALogoBytes } from './cwaLogo';
import {
  drawColoredHeaderBand,
  drawHorizontalRule,
  drawStandardFooter,
  drawWatermarkMargin,
  drawSignatureBlock,
  wrapText,
  embedCWALogo,
  COLORS,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  TABLE_WIDTH,
  createDocxHeader,
  createDocxFooter,
  createDocxSectionHeading,
  createDocxSignatureBlock,
  createDocxHorizontalRule,
  DOCX_COLORS,
  DOCX_PAGE_MARGINS,
} from './documentStyles';

// Helper to decode base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  // Remove data URL prefix if present
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// ── PDF Helpers ──────────────────────────────────────────────────────────────

const CWA_HEADER_BAND_COLOR = { r: 0.84, g: 0.88, b: 0.96 };

function drawFormField(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  rowHeight: number,
  label: string,
  value: string,
  font: PDFFont,
  boldFont: PDFFont,
  fontSize: number = 9,
) {
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
}

// ── PDF Generation (matches official CWA License Application form) ──────────

export async function generateCWALicensePDF(project: Project, sitePlanDrawing?: SitePlanDrawing): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const { owner, details, site } = project;
  const totalPages = 3;
  const footerTitle = 'Application for Use of Cascade Water Alliance Real Estate at Lake Tapps';

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ═══════════════════════════════════════════════════════════════════════════
  const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 50;

  drawWatermarkMargin(page1, font);

  // CWA Logo - top left
  const logoImage = await embedCWALogo(pdfDoc);
  if (logoImage) {
    const logoScale = logoImage.scaleToFit(60, 53);
    page1.drawImage(logoImage, {
      x: MARGIN_LEFT,
      y: y - logoScale.height + 10,
      width: logoScale.width,
      height: logoScale.height,
    });
  }

  // Title block - positioned to the right of the logo
  const titleX = MARGIN_LEFT + 70;
  page1.drawText('CASCADE WATER ALLIANCE', {
    x: titleX, y: y + 2, size: 14, font: boldFont,
  });
  y -= 16;
  page1.drawText('Application for Use of Real Estate at Lake Tapps', {
    x: titleX, y, size: 11, font: italicFont,
  });

  // ── PART A ──
  y -= 35;
  y = drawColoredHeaderBand(page1, y, 'PART A \u2013 GENERAL AND PROPERTY INFORMATION', CWA_HEADER_BAND_COLOR, boldFont);

  // Parcel Information table
  y -= 10;
  const parcelHeaderHeight = 20;
  const parcelRowHeight = 18;
  const halfTable = TABLE_WIDTH / 2;

  // Header row
  page1.drawRectangle({
    x: MARGIN_LEFT, y: y - parcelHeaderHeight, width: TABLE_WIDTH, height: parcelHeaderHeight,
    borderColor: rgb(0, 0, 0), borderWidth: 0.5, color: rgb(0.85, 0.85, 0.85),
  });
  const parcelHeaderText = 'Parcel Information';
  const phWidth = boldFont.widthOfTextAtSize(parcelHeaderText, 10);
  page1.drawText(parcelHeaderText, {
    x: MARGIN_LEFT + (TABLE_WIDTH - phWidth) / 2,
    y: y - parcelHeaderHeight + 5, size: 10, font: boldFont,
  });
  y -= parcelHeaderHeight;

  // Parcel rows - left column: fields, right column: PSE question
  const parcelFields = [
    { label: 'Parcel Tax Number:', value: owner.parcelNumber || '' },
    { label: 'Street Address:', value: site.propertyAddress || owner.address || '' },
    { label: 'Parcel City:', value: owner.city || '' },
    { label: 'State and Zip:', value: `${owner.state || 'WA'} ${owner.zip || ''}` },
  ];

  // Right side PSE text
  const pseText1 = 'Is the property covered by a permit or license from';
  const pseText2 = 'PSE?';
  const pseText3 = 'If so, attach copy of permit or license.';

  for (let i = 0; i < parcelFields.length; i++) {
    const field = parcelFields[i];
    drawFormField(page1, MARGIN_LEFT, y, halfTable, parcelRowHeight, field.label, field.value, font, boldFont);

    // Right cell
    page1.drawRectangle({
      x: MARGIN_LEFT + halfTable, y: y - parcelRowHeight, width: halfTable, height: parcelRowHeight,
      borderColor: rgb(0, 0, 0), borderWidth: 0.5, color: rgb(1, 1, 1),
    });
    if (i === 0) {
      page1.drawText(pseText1, {
        x: MARGIN_LEFT + halfTable + 4, y: y - parcelRowHeight + 5, size: 8, font,
      });
    } else if (i === 1) {
      page1.drawText(pseText2, {
        x: MARGIN_LEFT + halfTable + 4, y: y - parcelRowHeight + 5, size: 8, font,
      });
    } else if (i === 2) {
      page1.drawText(pseText3, {
        x: MARGIN_LEFT + halfTable + 4, y: y - parcelRowHeight + 5, size: 8, font: italicFont,
      });
    }

    y -= parcelRowHeight;
  }

  // Horizontal rule after parcel table
  y -= 5;
  y = drawHorizontalRule(page1, y);

  // Owner and Authorized Agent side-by-side tables
  y -= 10;

  // Header row for both columns
  const contactHeaderHeight = 30;
  page1.drawRectangle({
    x: MARGIN_LEFT, y: y - contactHeaderHeight, width: halfTable, height: contactHeaderHeight,
    borderColor: rgb(0, 0, 0), borderWidth: 0.5, color: rgb(1, 1, 1),
  });
  const ownerHeader = 'Owner and Mailing Address';
  const owHeaderWidth = boldFont.widthOfTextAtSize(ownerHeader, 10);
  page1.drawText(ownerHeader, {
    x: MARGIN_LEFT + (halfTable - owHeaderWidth) / 2,
    y: y - contactHeaderHeight + 10, size: 10, font: boldFont,
  });

  page1.drawRectangle({
    x: MARGIN_LEFT + halfTable, y: y - contactHeaderHeight, width: halfTable, height: contactHeaderHeight,
    borderColor: rgb(0, 0, 0), borderWidth: 0.5, color: rgb(1, 1, 1),
  });
  const agentHeader1 = 'Authorized Agents Name and Mailing Address';
  const agentHeader2 = '(if different from owner, if not, mark \u201csame\u201d)';
  page1.drawText(agentHeader1, {
    x: MARGIN_LEFT + halfTable + 8,
    y: y - contactHeaderHeight + 16, size: 8.5, font: boldFont,
  });
  page1.drawText(agentHeader2, {
    x: MARGIN_LEFT + halfTable + 30,
    y: y - contactHeaderHeight + 5, size: 8, font: italicFont,
  });
  y -= contactHeaderHeight;

  // Contact rows
  const contactRowHeight = 18;
  const contactLabels = ['Name:', 'Street Address:', 'City:', 'State and Zip:', 'Cell Phone:', 'Other Phone:', 'Email Address:'];
  const ownerValues = [
    `${owner.firstName} ${owner.lastName}`,
    owner.address || '',
    owner.city || '',
    `${owner.state || 'WA'} ${owner.zip || ''}`,
    owner.phone || '',
    '',
    owner.email || '',
  ];
  const agentValues = owner.isAgent
    ? ['See authorization', '', '', '', '', '', '']
    : ['same', '', '', '', '', '', ''];

  for (let i = 0; i < contactLabels.length; i++) {
    drawFormField(page1, MARGIN_LEFT, y, halfTable, contactRowHeight, contactLabels[i], ownerValues[i], font, boldFont);
    drawFormField(page1, MARGIN_LEFT + halfTable, y, halfTable, contactRowHeight, contactLabels[i], agentValues[i], font, boldFont);
    y -= contactRowHeight;
  }

  // Horizontal rule after contact tables
  y -= 5;
  y = drawHorizontalRule(page1, y);

  // ── PART B ──
  y -= 10;
  y = drawColoredHeaderBand(page1, y, 'PART B \u2013 USE REQUEST', CWA_HEADER_BAND_COLOR, boldFont);

  y -= 8;
  const partBInstructions = 'The applicant must provide a complete description of any proposed use or improvement. Describe briefly below';
  const partBInstructions2 = 'and attach a detailed depiction and/or plans.';
  page1.drawText(partBInstructions, { x: MARGIN_LEFT, y, size: 9, font: italicFont });
  y -= 12;
  page1.drawText(partBInstructions2, { x: MARGIN_LEFT, y, size: 9, font: italicFont });

  // Description box
  y -= 10;
  const descBoxHeight = y - 65; // Fill remaining page space above footer
  page1.drawRectangle({
    x: MARGIN_LEFT, y: 65, width: TABLE_WIDTH, height: descBoxHeight,
    borderColor: rgb(0, 0, 0), borderWidth: 0.5, color: rgb(1, 1, 1),
  });

  // Fill in description text
  const description = details.description || '';
  if (description) {
    const descLines = wrapText(description, font, 10, TABLE_WIDTH - 10);
    let descY = y - 5 - 12;
    for (const line of descLines) {
      if (descY < 70) break;
      page1.drawText(line, { x: MARGIN_LEFT + 5, y: descY, size: 10, font });
      descY -= 14;
    }
  }

  drawStandardFooter(page1, font, 1, totalPages, footerTitle);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2
  // ═══════════════════════════════════════════════════════════════════════════
  const page2 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  y = PAGE_HEIGHT - 50;

  drawWatermarkMargin(page2, font);

  // ── PART C ──
  y = drawColoredHeaderBand(page2, y, 'PART C \u2013 OTHER PERMITS AND APPROVALS', CWA_HEADER_BAND_COLOR, boldFont);

  y -= 10;
  const partCLines = wrapText(
    'The applicant must comply with the applicable requirements of all jurisdictions (e.g., Washington Department of Fish and Wildlife, United States Army Corps of Engineers, City of Bonney Lake, and/or Pierce County) and obtain all necessary approvals and permits (e.g. building, zoning, shoreline, and/or environmental protection).',
    font, 9, TABLE_WIDTH
  );
  for (const line of partCLines) {
    page2.drawText(line, { x: MARGIN_LEFT, y, size: 9, font });
    y -= 13;
  }
  y -= 3;
  page2.drawText('Visit https://cascadewater.org/lake-tapps/licenses-permits for a homeowner\u2019s starter guide on permitting.', {
    x: MARGIN_LEFT, y, size: 9, font,
  });

  // Horizontal rule after Part C
  y -= 10;
  y = drawHorizontalRule(page2, y);

  // ── PART D ──
  y -= 10;
  y = drawColoredHeaderBand(page2, y, 'PART D - AUTHORIZED SIGNATURES', CWA_HEADER_BAND_COLOR, boldFont);

  y -= 8;
  const partDText = 'The undersigned hereby certifies that he/she is the legal owner of the property or is authorized to submit this Application; that he/she has read, understands and accepts all of Cascade\u2019s terms and conditions that are a part of this application, as well as those included in the form license and in the Lake Tapps Reservoir Property Management Policy; and that the information provided in this application is true, complete and accurate to the best of his/her knowledge. The undersigned acknowledges that he or she is solely responsible for obtaining and complying with all required regulatory permits and authorizations.';
  const partDLines = wrapText(partDText, font, 9, TABLE_WIDTH);
  for (const line of partDLines) {
    page2.drawText(line, { x: MARGIN_LEFT, y, size: 9, font });
    y -= 13;
  }

  y -= 8;
  const partD2 = 'All owners of the property and authorized agents must sign the Application thereby confirming their agreement to abide by the Lake Tapps Reservoir Property Management Policy, including these terms and conditions and any license issued under same.';
  const partD2Lines = wrapText(partD2, font, 9, TABLE_WIDTH);
  for (const line of partD2Lines) {
    page2.drawText(line, { x: MARGIN_LEFT, y, size: 9, font });
    y -= 13;
  }

  // Signature lines - Applicant (two side-by-side) — CWA-specific layout
  y -= 25;
  const sigColWidth = TABLE_WIDTH / 2 - 10;

  // Row 1: Applicant signatures
  page2.drawLine({ start: { x: MARGIN_LEFT, y }, end: { x: MARGIN_LEFT + sigColWidth * 0.6, y }, thickness: 0.5 });
  page2.drawText('Date', { x: MARGIN_LEFT + sigColWidth * 0.65, y, size: 9, font });
  page2.drawLine({ start: { x: MARGIN_LEFT + sigColWidth * 0.72, y }, end: { x: MARGIN_LEFT + sigColWidth * 0.95, y }, thickness: 0.5 });

  page2.drawLine({ start: { x: MARGIN_LEFT + sigColWidth + 20, y }, end: { x: MARGIN_LEFT + sigColWidth + 20 + sigColWidth * 0.6, y }, thickness: 0.5 });
  page2.drawText('Date', { x: MARGIN_LEFT + sigColWidth + 20 + sigColWidth * 0.65, y, size: 9, font });
  page2.drawLine({ start: { x: MARGIN_LEFT + sigColWidth + 20 + sigColWidth * 0.72, y }, end: { x: MARGIN_LEFT + sigColWidth + 20 + sigColWidth * 0.95, y }, thickness: 0.5 });

  y -= 14;
  page2.drawText('Applicant\u2019s Signature', { x: MARGIN_LEFT, y, size: 8, font });
  page2.drawText('Applicant\u2019s Signature', { x: MARGIN_LEFT + sigColWidth + 20, y, size: 8, font });

  // Print Name lines
  y -= 22;
  page2.drawLine({ start: { x: MARGIN_LEFT, y }, end: { x: MARGIN_LEFT + sigColWidth * 0.95, y }, thickness: 0.5 });
  page2.drawLine({ start: { x: MARGIN_LEFT + sigColWidth + 20, y }, end: { x: MARGIN_LEFT + sigColWidth + 20 + sigColWidth * 0.95, y }, thickness: 0.5 });
  y -= 14;
  page2.drawText('Print Name', { x: MARGIN_LEFT, y, size: 8, font });
  page2.drawText('Print Name', { x: MARGIN_LEFT + sigColWidth + 20, y, size: 8, font });

  // Consent text
  y -= 22;
  const consentText = 'I consent to Cascade Water Alliance entering the property where the project is located to inspect the project site or any work.';
  const consentLines = wrapText(consentText, font, 9, TABLE_WIDTH);
  for (const line of consentLines) {
    page2.drawText(line, { x: MARGIN_LEFT, y, size: 9, font });
    y -= 13;
  }

  // Owner signatures (if different than applicant)
  y -= 20;
  page2.drawLine({ start: { x: MARGIN_LEFT, y }, end: { x: MARGIN_LEFT + sigColWidth * 0.6, y }, thickness: 0.5 });
  page2.drawText('Date', { x: MARGIN_LEFT + sigColWidth * 0.65, y, size: 9, font });
  page2.drawLine({ start: { x: MARGIN_LEFT + sigColWidth * 0.72, y }, end: { x: MARGIN_LEFT + sigColWidth * 0.95, y }, thickness: 0.5 });

  page2.drawLine({ start: { x: MARGIN_LEFT + sigColWidth + 20, y }, end: { x: MARGIN_LEFT + sigColWidth + 20 + sigColWidth * 0.6, y }, thickness: 0.5 });
  page2.drawText('Date', { x: MARGIN_LEFT + sigColWidth + 20 + sigColWidth * 0.65, y, size: 9, font });
  page2.drawLine({ start: { x: MARGIN_LEFT + sigColWidth + 20 + sigColWidth * 0.72, y }, end: { x: MARGIN_LEFT + sigColWidth + 20 + sigColWidth * 0.95, y }, thickness: 0.5 });

  y -= 14;
  page2.drawText('Owner\u2019s Signature (if different', { x: MARGIN_LEFT, y, size: 8, font });
  page2.drawText('Owner\u2019s Signature (if different', { x: MARGIN_LEFT + sigColWidth + 20, y, size: 8, font });
  y -= 11;
  page2.drawText('than applicant)', { x: MARGIN_LEFT + 20, y, size: 8, font });
  page2.drawText('than applicant)', { x: MARGIN_LEFT + sigColWidth + 40, y, size: 8, font });

  y -= 18;
  page2.drawLine({ start: { x: MARGIN_LEFT, y }, end: { x: MARGIN_LEFT + sigColWidth * 0.95, y }, thickness: 0.5 });
  page2.drawLine({ start: { x: MARGIN_LEFT + sigColWidth + 20, y }, end: { x: MARGIN_LEFT + sigColWidth + 20 + sigColWidth * 0.95, y }, thickness: 0.5 });
  y -= 14;
  page2.drawText('Print Name', { x: MARGIN_LEFT, y, size: 8, font });
  page2.drawText('Print Name', { x: MARGIN_LEFT + sigColWidth + 20, y, size: 8, font });

  // Horizontal rule after Part D signatures
  y -= 10;
  y = drawHorizontalRule(page2, y);

  // ── PART E (begins on page 2) ──
  y -= 5;
  y = drawColoredHeaderBand(page2, y, 'PART E \u2013 APPLICATION TERMS AND CONDITIONS', CWA_HEADER_BAND_COLOR, boldFont);

  y -= 8;
  const partE1 = 'Cascade Water Alliance (Cascade) is authorized to determine the conditions under which uses and/or improvements on Lake Tapps Reservoir property are appropriate under the rights granted in the 1954 Deed and 1958 Easement. For more information see Lake Tapps Reservoir Property Management Policy, CWAC 7.05.';
  const partE1Lines = wrapText(partE1, font, 9, TABLE_WIDTH);
  for (const line of partE1Lines) {
    page2.drawText(line, { x: MARGIN_LEFT, y, size: 9, font });
    y -= 13;
  }

  y -= 5;
  const partE2 = 'Cascade may deny a request for any use, activity, and/or improvement if it determines, in its sole discretion, that such use, activity, and/or improvement is not consistent with this policy. If Cascade determines, in its sole discretion, that such use, activity, and/or improvement is acceptable, a license (or other permission) will be issued, conditioned on the following, as well as the conditions listed for use, activity, and/or individual improvement type as footnotes to Table 1:';
  const partE2Lines = wrapText(partE2, font, 9, TABLE_WIDTH);
  for (const line of partE2Lines) {
    page2.drawText(line, { x: MARGIN_LEFT, y, size: 9, font });
    y -= 13;
  }

  // Condition 1
  y -= 5;
  const cond1 = '1. Unless an individual license provides otherwise, the license will continue unless terminated by a breach of the license by the applicant or a determination by Cascade that termination of the license is necessary for the use of the Lake Tapps Reservoir for the operation as a municipal water supply. All other permissions are terminated as provided in the document.';
  const cond1Lines = wrapText(cond1, font, 9, TABLE_WIDTH - 15);
  for (const line of cond1Lines) {
    page2.drawText(line, { x: MARGIN_LEFT + 15, y, size: 9, font });
    y -= 13;
  }

  drawStandardFooter(page2, font, 2, totalPages, footerTitle);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3
  // ═══════════════════════════════════════════════════════════════════════════
  const page3 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  y = PAGE_HEIGHT - 50;

  drawWatermarkMargin(page3, font);

  // Conditions 2-12
  const conditions = [
    '2. Applicant showing it will protect against the operational dangers, problems, and/or concerns raised by Cascade (e.g., dike integrity, water quality, recreational safety), including providing professional opinions if required by Cascade, at applicant\u2019s expense (e.g., dam engineer opinion).',
    '3. Applicant will obtain and at all times comply with the requirements of all applicable jurisdictions (e.g., Washington Department of Fish and Wildlife, United States Army Corps of Engineers, Bonney Lake and/or Pierce County) for approvals and permits (e.g., building, zoning, shoreline, and/or environmental protection). Generally, modifications or repairs to uses, activities, and/or improvements that require a federal, state or local agency approval, require permission.',
    '4. Applicant\u2019s release of Cascade from all liability associated with the use and/or improvement, including flooding damage/destruction from Cascade\u2019s right to raise the water level of the Reservoir to 545 feet or from wave action or damage/destruction from Cascade\u2019s lowering or raising of the water level of the Reservoir.',
    '5. Applicant\u2019s full indemnification of Cascade.',
    '6. Applicant\u2019s proof of insurance (homeowner\u2019s insurance and contractor\u2019s proof of insurance if construction is involved) for specific use and/or improvement, naming Cascade as an additional insured, to be updated annually by the applicant.',
    '7. The holder of a license may not sublet or assign the rights or obligations of the license; however, a license transfers with the licensee\u2019s property and a purchaser or tenant must comply with the obligations. Cascade reserves the right to record any license against the licensee\u2019s property so subsequent owners are on notice of their responsibilities. For all other permissions, the terms of assumption and assignment will be as provided in the document.',
    '8. Other specific requirements as may be required by Cascade to achieve the goals of this policy.',
    '9. Due to Cascade\u2019s status as a public entity, and pursuant to Chapter 82.29A RCW, Cascade may be required by agencies administering State law or regulations to collect leasehold excise tax for some permissions, based on the fair market value of the right being utilized. Improvements are subject to either leasehold excise tax or property tax. The Pierce County assessor\u2019s office conducts inspections, reviews permit records, and uses other tools to ensure property tax is levied on owner\u2019s property as a whole (regardless of whether the improvements are located on the owner\u2019s property or Cascade\u2019s Property). Based on discussions with Pierce County, Cascade currently anticipates that the improvements will be subject to property tax rather than leasehold excise tax; however, this may change in the future. The permission will provide that the permittee must pay any leasehold excise tax or property tax determined due by taxing authorities on the permission itself or on the improvements constructed on Cascade\u2019s Property under the license.',
    '10. With the number of applications for permissions currently anticipated, Cascade will not charge an administrative fee for permissions but may require that the applicant pay for any professional services required in processing an application. If the number of applications becomes too great, Cascade may reevaluate this policy.',
    '11. Any permission granted by Cascade grants nonexclusive rights consistent with the Deeds. Permissions do not grant rights to use Cascade\u2019s Property to the exclusion of other homeowners. Permissions do not establish property lines (or lateral lines) beneath the 545-foot contour line, as such property is owned by Cascade. Permits and approvals by local jurisdictions may establish construction setbacks or limit areas of use. Generally, Cascade will not intervene in disputes between homeowners',
    '12. The maintenance of the integrity of the dikes is paramount use. The Deeds grant to a few homeowners only the right to cross the dikes to reach the water. Use, activities, and/or improvements on the dikes may be restricted in any manner that Cascade deems appropriate including, but not limited to, for dike integrity.',
  ];

  for (const condition of conditions) {
    const lines = wrapText(condition, font, 9, TABLE_WIDTH - 15);
    for (const line of lines) {
      if (y < 60) break; // Protect footer area
      page3.drawText(line, { x: MARGIN_LEFT + 15, y, size: 9, font });
      y -= 13;
    }
    y -= 5; // Space between conditions
  }

  drawStandardFooter(page3, font, 3, totalPages, footerTitle);

  // ═══════════════════════════════════════════════════════════════════════════
  // OPTIONAL: Site Plan attachment page
  // ═══════════════════════════════════════════════════════════════════════════
  if (sitePlanDrawing?.exportedImage) {
    const attachPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawWatermarkMargin(attachPage, font);

    attachPage.drawText('ATTACHMENT \u2013 SITE PLAN DRAWING', {
      x: MARGIN_LEFT, y: PAGE_HEIGHT - 50, size: 12, font: boldFont,
    });
    attachPage.drawText(sitePlanDrawing.name || 'Site Plan', {
      x: MARGIN_LEFT, y: PAGE_HEIGHT - 70, size: 10, font,
    });

    try {
      const imageBytes = base64ToUint8Array(sitePlanDrawing.exportedImage);
      const pngImage = await pdfDoc.embedPng(imageBytes);
      const { width: imgWidth, height: imgHeight } = pngImage.scaleToFit(500, 550);

      attachPage.drawImage(pngImage, {
        x: MARGIN_LEFT + 6,
        y: PAGE_HEIGHT - 90 - imgHeight,
        width: imgWidth,
        height: imgHeight,
      });

      if (sitePlanDrawing.scale) {
        attachPage.drawText(`Scale: ${sitePlanDrawing.scale.scaleRatio}`, {
          x: MARGIN_LEFT, y: PAGE_HEIGHT - 100 - imgHeight, size: 9, font, color: rgb(0.4, 0.4, 0.4),
        });
      }
    } catch (error) {
      console.error('Failed to embed site plan image:', error);
    }
  }

  return pdfDoc.save();
}

// ── DOCX Generation (matches official CWA License Application form) ─────────

export async function generateCWALicenseDOCX(project: Project, sitePlanDrawing?: SitePlanDrawing): Promise<Blob> {
  const { owner, details, site } = project;
  const agentNameDocx = owner.isAgent ? 'See authorization' : 'same';

  const thinBorder = {
    style: BorderStyle.SINGLE, size: 1, color: '000000',
  };
  const tableBorders = {
    top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder,
  };

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

  function headerCell(text: string, widthPct: number, isBold = true): TableCell {
    return new TableCell({
      borders: tableBorders,
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      shading: isBold ? { fill: 'D9D9D9' } : undefined,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text, bold: isBold, size: 20 })],
      })],
    });
  }

  // Get logo bytes for header
  let logoBytes: Uint8Array | undefined;
  try {
    logoBytes = getCWALogoBytes();
  } catch {
    // Logo not available
  }

  const footerTitle = 'Application for Use of Cascade Water Alliance Real Estate at Lake Tapps';

  // Build children
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: 'APPLICATION FOR USE OF CASCADE WATER', bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: 'ALLIANCE REAL ESTATE AT LAKE TAPPS', bold: true, size: 28 })],
    }),
  );

  // PART A
  children.push(createDocxSectionHeading('PART A \u2013 GENERAL AND PROPERTY INFORMATION', DOCX_COLORS.headerBandCwa));

  // Parcel Information table
  const parcelTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [headerCell('Parcel Information', 100)],
      }),
      new TableRow({
        children: [
          fieldCell('Parcel Tax Number:', owner.parcelNumber || '', 50),
          fieldCell('Is the property covered by a permit or license from PSE?', '', 50),
        ],
      }),
      new TableRow({
        children: [
          fieldCell('Street Address:', site.propertyAddress || owner.address || '', 50),
          fieldCell('If so, attach copy of permit or license.', '', 50),
        ],
      }),
      new TableRow({
        children: [
          fieldCell('Parcel City:', owner.city || '', 50),
          new TableCell({ borders: tableBorders, width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph('')] }),
        ],
      }),
      new TableRow({
        children: [
          fieldCell('State and Zip:', `${owner.state || 'WA'} ${owner.zip || ''}`, 50),
          new TableCell({ borders: tableBorders, width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph('')] }),
        ],
      }),
    ],
  });
  children.push(new Paragraph({ children: [] }));
  children.push(parcelTable as unknown as Paragraph);

  // Horizontal rule after parcel table
  children.push(createDocxHorizontalRule());

  // Owner / Agent table
  const contactLabels = ['Name:', 'Street Address:', 'City:', 'State and Zip:', 'Cell Phone:', 'Other Phone:', 'Email Address:'];
  const ownerValues = [
    `${owner.firstName} ${owner.lastName}`,
    owner.address || '', owner.city || '', `${owner.state || 'WA'} ${owner.zip || ''}`,
    owner.phone || '', '', owner.email || '',
  ];
  const agentValues = [agentNameDocx, '', '', '', '', '', ''];

  const contactRows = [
    new TableRow({
      children: [
        headerCell('Owner and Mailing Address', 50, true),
        new TableCell({
          borders: tableBorders,
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 20, after: 0 },
              children: [new TextRun({ text: 'Authorized Agents Name and Mailing Address', bold: true, size: 18 })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 20 },
              children: [new TextRun({ text: '(if different from owner, if not, mark \u201csame\u201d)', italics: true, size: 16 })],
            }),
          ],
        }),
      ],
    }),
    ...contactLabels.map((label, i) =>
      new TableRow({
        children: [
          fieldCell(label, ownerValues[i], 50),
          fieldCell(label, agentValues[i], 50),
        ],
      })
    ),
  ];

  const contactTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: contactRows,
  });
  children.push(new Paragraph({ spacing: { before: 200 }, children: [] }));
  children.push(contactTable as unknown as Paragraph);

  // Horizontal rule after contact table
  children.push(createDocxHorizontalRule());

  // PART B
  children.push(createDocxSectionHeading('PART B \u2013 USE REQUEST', DOCX_COLORS.headerBandCwa));

  const descTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [new TableCell({
          borders: tableBorders,
          children: [
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [new TextRun({
                text: 'The applicant must provide a complete description of any proposed use or improvement. Describe briefly below and attach a detailed depiction and/or plans.',
                italics: true, size: 18,
              })],
            }),
            new Paragraph({
              spacing: { before: 100, after: 100 },
              children: [new TextRun({ text: details.description || '', size: 20 })],
            }),
          ],
        })],
      }),
    ],
  });
  children.push(descTable as unknown as Paragraph);

  // Horizontal rule after Part B description
  children.push(createDocxHorizontalRule());

  // PART C
  children.push(createDocxSectionHeading('PART C \u2013 OTHER PERMITS AND APPROVALS', DOCX_COLORS.headerBandCwa));
  children.push(new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({
      text: 'The applicant must comply with the applicable requirements of all jurisdictions (e.g., Washington Department of Fish and Wildlife, United States Army Corps of Engineers, City of Bonney Lake, and/or Pierce County) and obtain all necessary approvals and permits (e.g. building, zoning, shoreline, and/or environmental protection).',
      size: 20,
    })],
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: 'Visit https://cascadewater.org/lake-tapps/licenses-permits for a homeowner\u2019s starter guide on permitting.',
      size: 20,
    })],
  }));

  // Horizontal rule after Part C
  children.push(createDocxHorizontalRule());

  // PART D
  children.push(createDocxSectionHeading('PART D - AUTHORIZED SIGNATURES', DOCX_COLORS.headerBandCwa));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: 'The undersigned hereby certifies that he/she is the legal owner of the property or is authorized to submit this Application; that he/she has read, understands and accepts all of Cascade\u2019s terms and conditions that are a part of this application, as well as those included in the form license and in the Lake Tapps Reservoir Property Management Policy; and that the information provided in this application is true, complete and accurate to the best of his/her knowledge. The undersigned acknowledges that he or she is solely responsible for obtaining and complying with all required regulatory permits and authorizations.',
      size: 20,
    })],
  }));
  children.push(new Paragraph({
    spacing: { after: 400 },
    children: [new TextRun({
      text: 'All owners of the property and authorized agents must sign the Application thereby confirming their agreement to abide by the Lake Tapps Reservoir Property Management Policy, including these terms and conditions and any license issued under same.',
      size: 20,
    })],
  }));

  // Signature block - Applicant
  children.push(createDocxSignatureBlock('Applicant Signature') as unknown as Paragraph);

  children.push(new Paragraph({
    spacing: { before: 200, after: 200 },
    children: [new TextRun({
      text: 'I consent to Cascade Water Alliance entering the property where the project is located to inspect the project site or any work.',
      size: 20,
    })],
  }));

  // Signature block - Owner (if different)
  children.push(createDocxSignatureBlock('Owner\u2019s Signature (if different than applicant)') as unknown as Paragraph);

  // Horizontal rule after Part D
  children.push(createDocxHorizontalRule());

  // PART E
  children.push(createDocxSectionHeading('PART E \u2013 APPLICATION TERMS AND CONDITIONS', DOCX_COLORS.headerBandCwa));

  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: 'Cascade Water Alliance (Cascade) is authorized to determine the conditions under which uses and/or improvements on Lake Tapps Reservoir property are appropriate under the rights granted in the 1954 Deed and 1958 Easement. For more information see Lake Tapps Reservoir Property Management Policy, CWAC 7.05.',
      size: 20,
    })],
  }));

  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({
      text: 'Cascade may deny a request for any use, activity, and/or improvement if it determines, in its sole discretion, that such use, activity, and/or improvement is not consistent with this policy. If Cascade determines, in its sole discretion, that such use, activity, and/or improvement is acceptable, a license (or other permission) will be issued, conditioned on the following, as well as the conditions listed for use, activity, and/or individual improvement type as footnotes to Table 1:',
      size: 20,
    })],
  }));

  const conditionsDocx = [
    '1. Unless an individual license provides otherwise, the license will continue unless terminated by a breach of the license by the applicant or a determination by Cascade that termination of the license is necessary for the use of the Lake Tapps Reservoir for the operation as a municipal water supply. All other permissions are terminated as provided in the document.',
    '2. Applicant showing it will protect against the operational dangers, problems, and/or concerns raised by Cascade (e.g., dike integrity, water quality, recreational safety), including providing professional opinions if required by Cascade, at applicant\u2019s expense (e.g., dam engineer opinion).',
    '3. Applicant will obtain and at all times comply with the requirements of all applicable jurisdictions (e.g., Washington Department of Fish and Wildlife, United States Army Corps of Engineers, Bonney Lake and/or Pierce County) for approvals and permits (e.g., building, zoning, shoreline, and/or environmental protection). Generally, modifications or repairs to uses, activities, and/or improvements that require a federal, state or local agency approval, require permission.',
    '4. Applicant\u2019s release of Cascade from all liability associated with the use and/or improvement, including flooding damage/destruction from Cascade\u2019s right to raise the water level of the Reservoir to 545 feet or from wave action or damage/destruction from Cascade\u2019s lowering or raising of the water level of the Reservoir.',
    '5. Applicant\u2019s full indemnification of Cascade.',
    '6. Applicant\u2019s proof of insurance (homeowner\u2019s insurance and contractor\u2019s proof of insurance if construction is involved) for specific use and/or improvement, naming Cascade as an additional insured, to be updated annually by the applicant.',
    '7. The holder of a license may not sublet or assign the rights or obligations of the license; however, a license transfers with the licensee\u2019s property and a purchaser or tenant must comply with the obligations. Cascade reserves the right to record any license against the licensee\u2019s property so subsequent owners are on notice of their responsibilities. For all other permissions, the terms of assumption and assignment will be as provided in the document.',
    '8. Other specific requirements as may be required by Cascade to achieve the goals of this policy.',
    '9. Due to Cascade\u2019s status as a public entity, and pursuant to Chapter 82.29A RCW, Cascade may be required by agencies administering State law or regulations to collect leasehold excise tax for some permissions, based on the fair market value of the right being utilized. Improvements are subject to either leasehold excise tax or property tax. The Pierce County assessor\u2019s office conducts inspections, reviews permit records, and uses other tools to ensure property tax is levied on owner\u2019s property as a whole (regardless of whether the improvements are located on the owner\u2019s property or Cascade\u2019s Property). Based on discussions with Pierce County, Cascade currently anticipates that the improvements will be subject to property tax rather than leasehold excise tax; however, this may change in the future. The permission will provide that the permittee must pay any leasehold excise tax or property tax determined due by taxing authorities on the permission itself or on the improvements constructed on Cascade\u2019s Property under the license.',
    '10. With the number of applications for permissions currently anticipated, Cascade will not charge an administrative fee for permissions but may require that the applicant pay for any professional services required in processing an application. If the number of applications becomes too great, Cascade may reevaluate this policy.',
    '11. Any permission granted by Cascade grants nonexclusive rights consistent with the Deeds. Permissions do not grant rights to use Cascade\u2019s Property to the exclusion of other homeowners. Permissions do not establish property lines (or lateral lines) beneath the 545-foot contour line, as such property is owned by Cascade. Permits and approvals by local jurisdictions may establish construction setbacks or limit areas of use. Generally, Cascade will not intervene in disputes between homeowners',
    '12. The maintenance of the integrity of the dikes is paramount use. The Deeds grant to a few homeowners only the right to cross the dikes to reach the water. Use, activities, and/or improvements on the dikes may be restricted in any manner that Cascade deems appropriate including, but not limited to, for dike integrity.',
  ];

  for (const condition of conditionsDocx) {
    children.push(new Paragraph({
      spacing: { after: 100 },
      indent: { left: 360 },
      children: [new TextRun({ text: condition, size: 20 })],
    }));
  }

  // Site Plan attachment (if available)
  if (sitePlanDrawing?.exportedImage) {
    children.push(new Paragraph({
      spacing: { before: 600, after: 200 },
      children: [new TextRun({ text: 'ATTACHMENT \u2013 SITE PLAN DRAWING', bold: true, size: 24 })],
    }));
    children.push(new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: sitePlanDrawing.name || 'Site Plan', size: 20 })],
    }));

    try {
      const imageBytes = base64ToUint8Array(sitePlanDrawing.exportedImage);
      children.push(new Paragraph({
        children: [new ImageRun({
          data: imageBytes,
          transformation: { width: 500, height: 375 },
        })],
        spacing: { after: 200 },
      }));

      if (sitePlanDrawing.scale) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `Scale: ${sitePlanDrawing.scale.scaleRatio}`, size: 18, color: '666666' })],
          spacing: { after: 200 },
        }));
      }
    } catch (error) {
      console.error('Failed to add site plan image to DOCX:', error);
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: DOCX_PAGE_MARGINS,
        },
      },
      headers: {
        default: createDocxHeader('CWA License Application', logoBytes),
      },
      footers: {
        default: createDocxFooter(footerTitle),
      },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

// Download helper
export function downloadFile(data: Uint8Array | Blob, filename: string, mimeType: string): void {
  let blob: Blob;
  if (data instanceof Blob) {
    blob = data;
  } else {
    // Create a new Uint8Array to ensure it's a standard ArrayBuffer
    const arr = new Uint8Array(data);
    blob = new Blob([arr as BlobPart], { type: mimeType });
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

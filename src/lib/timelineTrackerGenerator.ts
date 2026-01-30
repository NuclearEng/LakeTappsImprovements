import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, Packer, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import type { Project } from '@/types';
import {
  COLORS, PAGE_WIDTH, PAGE_HEIGHT, MARGIN_LEFT, TABLE_WIDTH,
  drawColoredHeaderBand, drawHorizontalRule, drawStandardFooter, wrapText,
  DOCX_COLORS, DOCX_PAGE_MARGINS, createDocxHeader, createDocxFooter,
  createDocxSectionHeading, createDocxHorizontalRule,
} from './documentStyles';

// ── Permit metadata ──────────────────────────────────────────────────────────

interface PermitInfo {
  name: string;
  agency: string;
  estimatedTimeline: string;
  isInWater: boolean;
}

const PERMIT_INFO: Record<string, PermitInfo> = {
  cwa_license: {
    name: 'CWA License Agreement',
    agency: 'Cascade Water Alliance',
    estimatedTimeline: '4-8 weeks',
    isInWater: false,
  },
  shoreline_exemption: {
    name: 'Shoreline Exemption',
    agency: 'City of Bonney Lake',
    estimatedTimeline: '2-4 weeks',
    isInWater: false,
  },
  shoreline_substantial: {
    name: 'Shoreline Substantial Dev.',
    agency: 'City of Bonney Lake',
    estimatedTimeline: '8-16 weeks',
    isInWater: false,
  },
  shoreline_conditional: {
    name: 'Shoreline Conditional Use',
    agency: 'City of Bonney Lake',
    estimatedTimeline: '12-20 weeks',
    isInWater: false,
  },
  shoreline_variance: {
    name: 'Shoreline Variance',
    agency: 'City of Bonney Lake',
    estimatedTimeline: '12-20 weeks',
    isInWater: false,
  },
  building_permit: {
    name: 'Building Permit',
    agency: 'City of Bonney Lake',
    estimatedTimeline: '4-8 weeks',
    isInWater: false,
  },
  pierce_building_permit: {
    name: 'Building Permit',
    agency: 'Pierce County',
    estimatedTimeline: '4-8 weeks',
    isInWater: false,
  },
  lni_electrical_permit: {
    name: 'Electrical Permit',
    agency: 'WA L&I',
    estimatedTimeline: '1-2 weeks',
    isInWater: false,
  },
  hpa: {
    name: 'Hydraulic Project Approval',
    agency: 'WA Dept Fish & Wildlife',
    estimatedTimeline: '6-12 weeks',
    isInWater: true,
  },
  section_10: {
    name: 'Section 10 Permit',
    agency: 'US Army Corps of Engineers',
    estimatedTimeline: '8-16 weeks',
    isInWater: true,
  },
  section_404: {
    name: 'Section 404 Permit',
    agency: 'US Army Corps of Engineers',
    estimatedTimeline: '8-16 weeks',
    isInWater: true,
  },
  water_quality_401: {
    name: '401 Water Quality Cert.',
    agency: 'WA Dept of Ecology',
    estimatedTimeline: '8-12 weeks',
    isInWater: true,
  },
  solar_building_permit: {
    name: 'Solar Building Permit',
    agency: 'Pierce County',
    estimatedTimeline: '3-6 weeks',
    isInWater: false,
  },
  utility_interconnection: {
    name: 'Utility Interconnection',
    agency: 'Puget Sound Energy',
    estimatedTimeline: '4-8 weeks',
    isInWater: false,
  },
  adu_building_permit: {
    name: 'ADU Building Permit',
    agency: 'Pierce County',
    estimatedTimeline: '4-8 weeks',
    isInWater: false,
  },
  planning_approval: {
    name: 'Planning Approval',
    agency: 'Pierce County',
    estimatedTimeline: '4-8 weeks',
    isInWater: false,
  },
  septic_permit: {
    name: 'Septic Permit',
    agency: 'Tacoma-Pierce County Health',
    estimatedTimeline: '4-8 weeks',
    isInWater: false,
  },
  adu_shoreline_permit: {
    name: 'ADU Shoreline Permit',
    agency: 'City of Bonney Lake',
    estimatedTimeline: '8-16 weeks',
    isInWater: false,
  },
};

function getAllPermits(project: Project): string[] {
  const permits: string[] = [...(project.requiredPermits || [])];
  if (project.solarPermits) permits.push(...project.solarPermits);
  if (project.aduPermits) permits.push(...project.aduPermits);
  return permits;
}

function getPermitStatus(project: Project, permitKey: string): string {
  const permitApp = project.permits?.[permitKey];
  if (!permitApp) return 'Not Started';
  const map: Record<string, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    ready: 'Ready to Submit',
    submitted: 'Submitted',
    approved: 'Approved',
    denied: 'Denied',
  };
  return map[permitApp.status] || permitApp.status;
}

function getSubmittedDate(project: Project, permitKey: string): string {
  const permitApp = project.permits?.[permitKey];
  if (!permitApp?.submittedAt) return '';
  try {
    return new Date(permitApp.submittedAt).toLocaleDateString();
  } catch {
    return '';
  }
}

// ── PDF Generation ───────────────────────────────────────────────────────────

export async function generateTimelineTrackerPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const allPermits = getAllPermits(project);
  const HEADER_BG = { r: 0.84, g: 0.88, b: 0.96 };
  const hasInWaterPermits = allPermits.some(p => PERMIT_INFO[p]?.isInWater);

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 50;

  // Title
  y = drawColoredHeaderBand(page, y, 'PERMIT TIMELINE TRACKER', HEADER_BG, boldFont, 14);
  y -= 4;
  page.drawText(`Project: ${project.owner.firstName} ${project.owner.lastName} | Generated: ${new Date().toLocaleDateString()}`, {
    x: MARGIN_LEFT, y, size: 9, font, color: rgb(COLORS.medGray.r, COLORS.medGray.g, COLORS.medGray.b),
  });
  y -= 25;

  // Table header
  const colWidths = [120, 100, 70, 70, 70, 60, TABLE_WIDTH - 490];
  const colHeaders = ['Permit', 'Agency', 'Est. Time', 'Target Date', 'Submitted', 'Status', 'Notes'];
  const headerHeight = 20;

  // Draw header row
  let xPos = MARGIN_LEFT;
  for (let i = 0; i < colHeaders.length; i++) {
    page.drawRectangle({
      x: xPos, y: y - headerHeight, width: colWidths[i], height: headerHeight,
      color: rgb(0.85, 0.85, 0.85), borderColor: rgb(0.6, 0.6, 0.6), borderWidth: 0.5,
    });
    page.drawText(colHeaders[i], {
      x: xPos + 3, y: y - headerHeight + 6, size: 8, font: boldFont,
    });
    xPos += colWidths[i];
  }
  y -= headerHeight;

  // Data rows
  const rowHeight = 18;
  for (const permitKey of allPermits) {
    const info = PERMIT_INFO[permitKey] || {
      name: permitKey.replace(/_/g, ' '),
      agency: 'N/A',
      estimatedTimeline: 'N/A',
      isInWater: false,
    };

    if (y - rowHeight < 80) break; // protect footer

    const status = getPermitStatus(project, permitKey);
    const submittedDate = getSubmittedDate(project, permitKey);
    const permitApp = project.permits?.[permitKey];
    const notes = permitApp?.notes || '';

    const rowData = [
      info.name,
      info.agency,
      info.estimatedTimeline,
      '', // Target date (blank for user to fill)
      submittedDate,
      status,
      notes,
    ];

    // Alternate row background
    const rowIndex = allPermits.indexOf(permitKey);
    const rowBg = rowIndex % 2 === 0 ? rgb(1, 1, 1) : rgb(0.97, 0.97, 0.97);

    xPos = MARGIN_LEFT;
    for (let i = 0; i < rowData.length; i++) {
      page.drawRectangle({
        x: xPos, y: y - rowHeight, width: colWidths[i], height: rowHeight,
        color: rowBg, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5,
      });
      // Truncate text that would overflow
      let cellText = rowData[i];
      const maxTextWidth = colWidths[i] - 6;
      while (cellText.length > 0 && font.widthOfTextAtSize(cellText, 7.5) > maxTextWidth) {
        cellText = cellText.slice(0, -1);
      }
      page.drawText(cellText, {
        x: xPos + 3, y: y - rowHeight + 5, size: 7.5, font,
      });
      xPos += colWidths[i];
    }
    y -= rowHeight;
  }

  // In-water work window note
  if (hasInWaterPermits) {
    y -= 20;
    y = drawHorizontalRule(page, y);
    y -= 4;
    page.drawText('IN-WATER WORK WINDOW NOTE', { x: MARGIN_LEFT, y, size: 10, font: boldFont });
    y -= 14;
    const noteText = 'Lake Tapps in-water work is typically restricted to a seasonal work window (generally July 1 - September 15, when lake levels are lowered). Ensure all in-water permits are obtained before the work window opens. Consult WDFW and CWA for current year dates.';
    const noteLines = wrapText(noteText, font, 9, TABLE_WIDTH);
    for (const line of noteLines) {
      page.drawText(line, { x: MARGIN_LEFT, y, size: 9, font, color: rgb(0.4, 0.1, 0.1) });
      y -= 13;
    }
  }

  drawStandardFooter(page, font, 1, 1, 'Permit Timeline Tracker');

  return pdfDoc.save();
}

// ── DOCX Generation ──────────────────────────────────────────────────────────

export async function generateTimelineTrackerDOCX(project: Project): Promise<Blob> {
  const allPermits = getAllPermits(project);
  const hasInWaterPermits = allPermits.some(p => PERMIT_INFO[p]?.isInWater);
  const children: Paragraph[] = [];

  const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: '999999' };
  const tableBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

  // Title
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: 'PERMIT TIMELINE TRACKER', bold: true, size: 28, color: DOCX_COLORS.cwa })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new TextRun({
      text: `Project: ${project.owner.firstName} ${project.owner.lastName} | Generated: ${new Date().toLocaleDateString()}`,
      size: 18, color: '999999',
    })],
  }));

  // Build table rows
  const colWidths = [18, 18, 12, 12, 12, 12, 16]; // percentages
  const colHeaders = ['Permit', 'Agency', 'Est. Time', 'Target Date', 'Submitted', 'Status', 'Notes'];

  // Header row
  const headerRow = new TableRow({
    children: colHeaders.map((header, i) => new TableCell({
      borders: tableBorders,
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      shading: { fill: 'D9D9D9' },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: header, bold: true, size: 16 })],
      })],
    })),
  });

  // Data rows
  const dataRows: TableRow[] = allPermits.map((permitKey, index) => {
    const info = PERMIT_INFO[permitKey] || {
      name: permitKey.replace(/_/g, ' '),
      agency: 'N/A',
      estimatedTimeline: 'N/A',
      isInWater: false,
    };

    const status = getPermitStatus(project, permitKey);
    const submittedDate = getSubmittedDate(project, permitKey);
    const permitApp = project.permits?.[permitKey];
    const notes = permitApp?.notes || '';
    const fillColor = index % 2 === 0 ? 'FFFFFF' : 'F7F7F7';

    const rowValues = [
      info.name,
      info.agency,
      info.estimatedTimeline,
      '', // Target date blank
      submittedDate,
      status,
      notes,
    ];

    return new TableRow({
      children: rowValues.map((value, i) => new TableCell({
        borders: tableBorders,
        width: { size: colWidths[i], type: WidthType.PERCENTAGE },
        shading: { fill: fillColor },
        children: [new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [new TextRun({ text: value, size: 16 })],
        })],
      })),
    });
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
  children.push(table as unknown as Paragraph);

  // In-water work window note
  if (hasInWaterPermits) {
    children.push(createDocxHorizontalRule());
    children.push(createDocxSectionHeading('In-Water Work Window Note', DOCX_COLORS.headerBandCwa));
    children.push(new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({
        text: 'Lake Tapps in-water work is typically restricted to a seasonal work window (generally July 1 - September 15, when lake levels are lowered). Ensure all in-water permits are obtained before the work window opens. Consult WDFW and CWA for current year dates.',
        size: 20,
        italics: true,
        color: DOCX_COLORS.noteRed,
      })],
    }));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: DOCX_PAGE_MARGINS,
          size: { orientation: 'landscape' as unknown as undefined },
        },
      },
      headers: { default: createDocxHeader('Permit Timeline Tracker') },
      footers: { default: createDocxFooter('Permit Timeline Tracker') },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

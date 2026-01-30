import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, Packer, AlignmentType } from 'docx';
import type { Project } from '@/types';
import {
  COLORS, PAGE_WIDTH, PAGE_HEIGHT, MARGIN_LEFT, MARGIN_RIGHT, TABLE_WIDTH,
  drawColoredHeaderBand, drawHorizontalRule, drawStandardFooter, wrapText,
  DOCX_COLORS, DOCX_PAGE_MARGINS, createDocxHeader, createDocxFooter,
  createDocxSectionHeading, createDocxHorizontalRule,
} from './documentStyles';

// ── Helpers ──────────────────────────────────────────────────────────────────

const HEADER_BG = { r: 0.84, g: 0.88, b: 0.96 };

function formatCurrency(value: number): string {
  return value ? `$${value.toLocaleString()}` : 'N/A';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function formatImprovementType(t: string): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatPermitType(t: string): string {
  const map: Record<string, string> = {
    cwa_license: 'CWA License Agreement',
    shoreline_exemption: 'Shoreline Exemption',
    shoreline_substantial: 'Shoreline Substantial Development',
    shoreline_conditional: 'Shoreline Conditional Use',
    shoreline_variance: 'Shoreline Variance',
    building_permit: 'Building Permit (Bonney Lake)',
    pierce_building_permit: 'Building Permit (Pierce County)',
    lni_electrical_permit: 'L&I Electrical Permit',
    hpa: 'Hydraulic Project Approval (WDFW)',
    section_10: 'Section 10 Permit (USACE)',
    section_404: 'Section 404 Permit (USACE)',
    water_quality_401: 'Water Quality 401 Certification',
    solar_building_permit: 'Solar Building Permit',
    utility_interconnection: 'Utility Interconnection',
    adu_building_permit: 'ADU Building Permit',
    planning_approval: 'Planning Approval',
    septic_permit: 'Septic Permit',
    adu_shoreline_permit: 'ADU Shoreline Permit',
  };
  return map[t] || formatImprovementType(t);
}

function getAllPermits(project: Project): string[] {
  const permits: string[] = [...(project.requiredPermits || [])];
  if (project.solarPermits) permits.push(...project.solarPermits);
  if (project.aduPermits) permits.push(...project.aduPermits);
  return permits;
}

// ── PDF Generation ───────────────────────────────────────────────────────────

export async function generateProjectSummaryPDF(project: Project): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const { owner, details, site, insurance } = project;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 50;

  // Title
  y = drawColoredHeaderBand(page, y, 'PROJECT SUMMARY SHEET', HEADER_BG, boldFont, 14);
  y -= 4;
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: MARGIN_LEFT, y, size: 9, font, color: rgb(COLORS.medGray.r, COLORS.medGray.g, COLORS.medGray.b),
  });
  y -= 20;

  // ── Owner Information ──
  y = drawColoredHeaderBand(page, y, 'Owner Information', HEADER_BG, boldFont, 11);
  y -= 6;

  const ownerFields = [
    ['Name:', `${owner.firstName} ${owner.lastName}`],
    ['Email:', owner.email || 'N/A'],
    ['Phone:', owner.phone || 'N/A'],
    ['Address:', `${owner.address || ''}, ${owner.city || ''}, ${owner.state || 'WA'} ${owner.zip || ''}`],
    ['Parcel Number:', owner.parcelNumber || 'N/A'],
    ['Ownership Type:', formatImprovementType(owner.ownershipType || 'individual')],
  ];

  for (const [label, value] of ownerFields) {
    page.drawText(label, { x: MARGIN_LEFT + 5, y, size: 9, font: boldFont });
    page.drawText(value, { x: 170, y, size: 9, font });
    y -= 14;
  }

  y -= 4;
  y = drawHorizontalRule(page, y);

  // ── Project Description ──
  y = drawColoredHeaderBand(page, y, 'Project Description', HEADER_BG, boldFont, 11);
  y -= 6;

  const improvementNames = (details.improvementTypes || []).map(formatImprovementType).join(', ') || 'N/A';
  const projectFields = [
    ['Category:', formatImprovementType(details.category || '')],
    ['Improvements:', improvementNames],
    ['Estimated Cost:', formatCurrency(details.estimatedCost)],
    ['Start Date:', formatDate(details.startDate)],
    ['Completion Date:', formatDate(details.completionDate)],
    ['In-Water Work:', details.inWater ? 'Yes' : 'No'],
  ];

  for (const [label, value] of projectFields) {
    page.drawText(label, { x: MARGIN_LEFT + 5, y, size: 9, font: boldFont });
    const lines = wrapText(value, font, 9, TABLE_WIDTH - 130);
    for (const line of lines) {
      page.drawText(line, { x: 170, y, size: 9, font });
      y -= 14;
    }
  }

  if (details.description) {
    page.drawText('Description:', { x: MARGIN_LEFT + 5, y, size: 9, font: boldFont });
    y -= 14;
    const descLines = wrapText(details.description, font, 9, TABLE_WIDTH - 20);
    for (const line of descLines) {
      page.drawText(line, { x: MARGIN_LEFT + 10, y, size: 9, font });
      y -= 13;
    }
  }

  y -= 4;
  y = drawHorizontalRule(page, y);

  // ── Site Information ──
  y = drawColoredHeaderBand(page, y, 'Site Information', HEADER_BG, boldFont, 11);
  y -= 6;

  const siteFields = [
    ['Property Address:', site.propertyAddress || 'N/A'],
    ['Lake Address:', site.lakeAddress || 'N/A'],
    ['Water Frontage:', site.waterFrontage ? `${site.waterFrontage} ft` : 'N/A'],
    ['Elevation:', site.elevation ? `${site.elevation} ft` : 'N/A'],
    ['Lot Size:', site.lotSize || 'N/A'],
  ];

  for (const [label, value] of siteFields) {
    page.drawText(label, { x: MARGIN_LEFT + 5, y, size: 9, font: boldFont });
    page.drawText(value, { x: 170, y, size: 9, font });
    y -= 14;
  }

  y -= 4;
  y = drawHorizontalRule(page, y);

  // ── Required Permits ──
  y = drawColoredHeaderBand(page, y, 'Required Permits', HEADER_BG, boldFont, 11);
  y -= 6;

  const allPermits = getAllPermits(project);
  if (allPermits.length > 0) {
    for (const permit of allPermits) {
      page.drawText(`\u2022  ${formatPermitType(permit)}`, { x: MARGIN_LEFT + 10, y, size: 9, font });
      y -= 14;
    }
  } else {
    page.drawText('None determined', { x: MARGIN_LEFT + 10, y, size: 9, font });
    y -= 14;
  }

  y -= 4;
  y = drawHorizontalRule(page, y);

  // ── Insurance Summary ──
  y = drawColoredHeaderBand(page, y, 'Insurance Summary', HEADER_BG, boldFont, 11);
  y -= 6;

  if (insurance.hasInsurance) {
    const insFields = [
      ['Provider:', insurance.provider || 'N/A'],
      ['Policy Number:', insurance.policyNumber || 'N/A'],
      ['Effective:', formatDate(insurance.effectiveDate || '')],
      ['Expiration:', formatDate(insurance.expirationDate || '')],
      ['Coverage:', insurance.coverageAmount ? formatCurrency(insurance.coverageAmount) : 'N/A'],
    ];
    for (const [label, value] of insFields) {
      page.drawText(label, { x: MARGIN_LEFT + 5, y, size: 9, font: boldFont });
      page.drawText(value, { x: 170, y, size: 9, font });
      y -= 14;
    }
  } else {
    page.drawText('No insurance information provided.', { x: MARGIN_LEFT + 10, y, size: 9, font });
    y -= 14;
  }

  // ── Agent / Contractor (if present) ──
  if (project.agent) {
    y -= 4;
    y = drawHorizontalRule(page, y);
    y = drawColoredHeaderBand(page, y, 'Authorized Agent', HEADER_BG, boldFont, 11);
    y -= 6;
    const agentFields = [
      ['Name:', project.agent.name || 'N/A'],
      ['Company:', project.agent.company || 'N/A'],
      ['Phone:', project.agent.phone || 'N/A'],
      ['Email:', project.agent.email || 'N/A'],
    ];
    for (const [label, value] of agentFields) {
      page.drawText(label, { x: MARGIN_LEFT + 5, y, size: 9, font: boldFont });
      page.drawText(value, { x: 170, y, size: 9, font });
      y -= 14;
    }
  }

  if (project.contractor) {
    y -= 4;
    y = drawHorizontalRule(page, y);
    y = drawColoredHeaderBand(page, y, 'Contractor', HEADER_BG, boldFont, 11);
    y -= 6;
    const contractorFields = [
      ['Name:', project.contractor.name || 'N/A'],
      ['WA License #:', project.contractor.waLicenseNumber || 'N/A'],
      ['Phone:', project.contractor.phone || 'N/A'],
      ['Email:', project.contractor.email || 'N/A'],
    ];
    for (const [label, value] of contractorFields) {
      page.drawText(label, { x: MARGIN_LEFT + 5, y, size: 9, font: boldFont });
      page.drawText(value, { x: 170, y, size: 9, font });
      y -= 14;
    }
  }

  drawStandardFooter(page, font, 1, 1, 'Project Summary Sheet');

  return pdfDoc.save();
}

// ── DOCX Generation ──────────────────────────────────────────────────────────

export async function generateProjectSummaryDOCX(project: Project): Promise<Blob> {
  const { owner, details, site, insurance } = project;
  const children: Paragraph[] = [];

  // Title
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [new TextRun({ text: 'PROJECT SUMMARY SHEET', bold: true, size: 28, color: DOCX_COLORS.cwa })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString()}`, size: 18, color: '999999' })],
  }));

  // Helper to add a field
  const field = (label: string, value: string): Paragraph => new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label} `, bold: true, size: 20 }),
      new TextRun({ text: value || 'N/A', size: 20 }),
    ],
  });

  // Owner Information
  children.push(createDocxSectionHeading('Owner Information', DOCX_COLORS.headerBandCwa));
  children.push(field('Name:', `${owner.firstName} ${owner.lastName}`));
  children.push(field('Email:', owner.email));
  children.push(field('Phone:', owner.phone));
  children.push(field('Address:', `${owner.address || ''}, ${owner.city || ''}, ${owner.state || 'WA'} ${owner.zip || ''}`));
  children.push(field('Parcel Number:', owner.parcelNumber));
  children.push(field('Ownership Type:', formatImprovementType(owner.ownershipType || 'individual')));
  children.push(createDocxHorizontalRule());

  // Project Description
  const improvementNames = (details.improvementTypes || []).map(formatImprovementType).join(', ') || 'N/A';
  children.push(createDocxSectionHeading('Project Description', DOCX_COLORS.headerBandCwa));
  children.push(field('Category:', formatImprovementType(details.category || '')));
  children.push(field('Improvements:', improvementNames));
  children.push(field('Estimated Cost:', formatCurrency(details.estimatedCost)));
  children.push(field('Start Date:', formatDate(details.startDate)));
  children.push(field('Completion Date:', formatDate(details.completionDate)));
  children.push(field('In-Water Work:', details.inWater ? 'Yes' : 'No'));
  if (details.description) {
    children.push(field('Description:', details.description));
  }
  children.push(createDocxHorizontalRule());

  // Site Information
  children.push(createDocxSectionHeading('Site Information', DOCX_COLORS.headerBandCwa));
  children.push(field('Property Address:', site.propertyAddress));
  children.push(field('Lake Address:', site.lakeAddress || 'N/A'));
  children.push(field('Water Frontage:', site.waterFrontage ? `${site.waterFrontage} ft` : 'N/A'));
  children.push(field('Elevation:', site.elevation ? `${site.elevation} ft` : 'N/A'));
  children.push(field('Lot Size:', site.lotSize || 'N/A'));
  children.push(createDocxHorizontalRule());

  // Required Permits
  children.push(createDocxSectionHeading('Required Permits', DOCX_COLORS.headerBandCwa));
  const allPermits = getAllPermits(project);
  if (allPermits.length > 0) {
    for (const permit of allPermits) {
      children.push(new Paragraph({
        spacing: { after: 60 },
        indent: { left: 360 },
        children: [new TextRun({ text: `\u2022  ${formatPermitType(permit)}`, size: 20 })],
      }));
    }
  } else {
    children.push(new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: 'None determined', size: 20 })],
    }));
  }
  children.push(createDocxHorizontalRule());

  // Insurance Summary
  children.push(createDocxSectionHeading('Insurance Summary', DOCX_COLORS.headerBandCwa));
  if (insurance.hasInsurance) {
    children.push(field('Provider:', insurance.provider || 'N/A'));
    children.push(field('Policy Number:', insurance.policyNumber || 'N/A'));
    children.push(field('Effective:', formatDate(insurance.effectiveDate || '')));
    children.push(field('Expiration:', formatDate(insurance.expirationDate || '')));
    children.push(field('Coverage:', insurance.coverageAmount ? formatCurrency(insurance.coverageAmount) : 'N/A'));
  } else {
    children.push(new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: 'No insurance information provided.', size: 20 })],
    }));
  }

  // Agent / Contractor
  if (project.agent) {
    children.push(createDocxHorizontalRule());
    children.push(createDocxSectionHeading('Authorized Agent', DOCX_COLORS.headerBandCwa));
    children.push(field('Name:', project.agent.name));
    children.push(field('Company:', project.agent.company));
    children.push(field('Phone:', project.agent.phone));
    children.push(field('Email:', project.agent.email));
  }

  if (project.contractor) {
    children.push(createDocxHorizontalRule());
    children.push(createDocxSectionHeading('Contractor', DOCX_COLORS.headerBandCwa));
    children.push(field('Name:', project.contractor.name));
    children.push(field('WA License #:', project.contractor.waLicenseNumber));
    children.push(field('Phone:', project.contractor.phone));
    children.push(field('Email:', project.contractor.email));
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: DOCX_PAGE_MARGINS } },
      headers: { default: createDocxHeader('Project Summary Sheet') },
      footers: { default: createDocxFooter('Project Summary Sheet') },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

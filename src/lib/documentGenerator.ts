import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, HeadingLevel, Packer, ImageRun } from 'docx';
import type { Project, SitePlanDrawing } from '@/types';

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

// PDF Generation
export async function generateCWALicensePDF(project: Project, sitePlanDrawing?: SitePlanDrawing): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { owner, details, site } = project;

  // Title
  page.drawText('CASCADE WATER ALLIANCE', {
    x: 50,
    y: 740,
    size: 16,
    font: boldFont,
    color: rgb(0, 0.35, 0.6),
  });

  page.drawText('License Application for Lake Tapps Improvements', {
    x: 50,
    y: 720,
    size: 14,
    font: boldFont,
  });

  // Section: Property Owner Information
  let yPosition = 680;
  page.drawText('PROPERTY OWNER INFORMATION', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
  });

  yPosition -= 25;
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
    page.drawText(value, { x: 150, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Section: Project Information
  yPosition -= 15;
  page.drawText('PROJECT INFORMATION', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
  });

  yPosition -= 25;
  const projectFields = [
    ['Project Type:', details.category === 'new_construction' ? 'New Construction' : 'Modification'],
    ['Improvement Types:', details.improvementTypes?.join(', ') || 'N/A'],
    ['Estimated Cost:', `$${details.estimatedCost.toLocaleString()}`],
    ['Planned Start Date:', details.startDate || 'TBD'],
    ['Work in Water:', details.inWater ? 'Yes' : 'No'],
    ['Below 544\' Elevation:', details.belowHighWaterLine ? 'Yes' : 'No'],
  ];

  for (const [label, value] of projectFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 180, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Project Description
  yPosition -= 10;
  page.drawText('Project Description:', { x: 50, y: yPosition, size: 10, font: boldFont });
  yPosition -= 15;

  // Wrap description text
  const description = details.description || 'No description provided';
  const maxWidth = 500;
  const words = description.split(' ');
  let line = '';

  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const textWidth = font.widthOfTextAtSize(testLine, 10);

    if (textWidth > maxWidth) {
      page.drawText(line, { x: 50, y: yPosition, size: 10, font });
      yPosition -= 14;
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) {
    page.drawText(line, { x: 50, y: yPosition, size: 10, font });
    yPosition -= 14;
  }

  // Site Information
  yPosition -= 20;
  page.drawText('SITE INFORMATION', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
  });

  yPosition -= 25;
  const siteFields = [
    ['Property Address:', site.propertyAddress || 'N/A'],
    ['Water Frontage:', site.waterFrontage ? `${site.waterFrontage} feet` : 'N/A'],
    ['Elevation:', site.elevation ? `${site.elevation} feet` : 'N/A'],
  ];

  for (const [label, value] of siteFields) {
    page.drawText(label, { x: 50, y: yPosition, size: 10, font: boldFont });
    page.drawText(value, { x: 150, y: yPosition, size: 10, font });
    yPosition -= 18;
  }

  // Site Plan Drawing (if available)
  if (sitePlanDrawing?.exportedImage) {
    // Check if we need a new page for the drawing
    if (yPosition < 350) {
      // Add new page for site plan
      const sitePlanPage = pdfDoc.addPage([612, 792]);

      sitePlanPage.drawText('SITE PLAN DRAWING', {
        x: 50,
        y: 740,
        size: 12,
        font: boldFont,
      });

      sitePlanPage.drawText(sitePlanDrawing.name || 'Site Plan', {
        x: 50,
        y: 720,
        size: 10,
        font,
      });

      try {
        const imageBytes = base64ToUint8Array(sitePlanDrawing.exportedImage);
        const pngImage = await pdfDoc.embedPng(imageBytes);
        const { width: imgWidth, height: imgHeight } = pngImage.scaleToFit(500, 450);

        sitePlanPage.drawImage(pngImage, {
          x: 56,
          y: 250,
          width: imgWidth,
          height: imgHeight,
        });

        // Add scale info
        if (sitePlanDrawing.scale) {
          sitePlanPage.drawText(`Scale: ${sitePlanDrawing.scale.scaleRatio}`, {
            x: 50,
            y: 230,
            size: 9,
            font,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
      } catch (error) {
        console.error('Failed to embed site plan image:', error);
      }
    } else {
      // Add drawing on current page
      yPosition -= 20;
      page.drawText('SITE PLAN DRAWING', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
      });
      yPosition -= 15;
      page.drawText(sitePlanDrawing.name || 'Site Plan', {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });

      try {
        const imageBytes = base64ToUint8Array(sitePlanDrawing.exportedImage);
        const pngImage = await pdfDoc.embedPng(imageBytes);
        const maxImageHeight = yPosition - 150;
        const { width: imgWidth, height: imgHeight } = pngImage.scaleToFit(500, Math.min(300, maxImageHeight));

        yPosition -= (imgHeight + 10);
        page.drawImage(pngImage, {
          x: 56,
          y: yPosition,
          width: imgWidth,
          height: imgHeight,
        });

        yPosition -= 20;
        if (sitePlanDrawing.scale) {
          page.drawText(`Scale: ${sitePlanDrawing.scale.scaleRatio}`, {
            x: 50,
            y: yPosition,
            size: 9,
            font,
            color: rgb(0.4, 0.4, 0.4),
          });
          yPosition -= 20;
        }
      } catch (error) {
        console.error('Failed to embed site plan image:', error);
      }
    }
  }

  // Signature section
  yPosition -= 40;
  page.drawText('SIGNATURE', { x: 50, y: yPosition, size: 12, font: boldFont });
  yPosition -= 25;
  page.drawText('I certify that the information provided is true and accurate.', {
    x: 50, y: yPosition, size: 10, font,
  });

  yPosition -= 40;
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: 300, y: yPosition },
    thickness: 1,
  });
  page.drawText('Signature', { x: 50, y: yPosition - 15, size: 9, font });

  page.drawLine({
    start: { x: 350, y: yPosition },
    end: { x: 550, y: yPosition },
    thickness: 1,
  });
  page.drawText('Date', { x: 350, y: yPosition - 15, size: 9, font });

  // Footer
  page.drawText('Generated by Lake Tapps Permit Workflow Application', {
    x: 50,
    y: 30,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: 450,
    y: 30,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdfDoc.save();
}

// DOCX Generation
export async function generateCWALicenseDOCX(project: Project, sitePlanDrawing?: SitePlanDrawing): Promise<Blob> {
  const { owner, details, site } = project;

  // Build document children dynamically
  const children: Paragraph[] = [
    // Header
    new Paragraph({
      children: [
        new TextRun({
          text: 'CASCADE WATER ALLIANCE',
          bold: true,
          size: 32,
          color: '005999',
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'License Application for Lake Tapps Improvements',
          bold: true,
          size: 28,
        }),
      ],
      spacing: { after: 400 },
    }),

    // Property Owner Section
    new Paragraph({
      text: 'PROPERTY OWNER INFORMATION',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
    createFieldParagraph('Name:', `${owner.firstName} ${owner.lastName}`),
    createFieldParagraph('Address:', owner.address),
    createFieldParagraph('City, State, ZIP:', `${owner.city}, ${owner.state} ${owner.zip}`),
    createFieldParagraph('Phone:', owner.phone),
    createFieldParagraph('Email:', owner.email),
    createFieldParagraph('Parcel Number:', owner.parcelNumber || 'N/A'),

    // Project Information Section
    new Paragraph({
      text: 'PROJECT INFORMATION',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
    createFieldParagraph('Project Type:', details.category === 'new_construction' ? 'New Construction' : 'Modification'),
    createFieldParagraph('Improvement Types:', details.improvementTypes?.join(', ') || 'N/A'),
    createFieldParagraph('Estimated Cost:', `$${details.estimatedCost.toLocaleString()}`),
    createFieldParagraph('Planned Start Date:', details.startDate || 'TBD'),
    createFieldParagraph('Work in Water:', details.inWater ? 'Yes' : 'No'),
    createFieldParagraph('Below 544\' Elevation:', details.belowHighWaterLine ? 'Yes' : 'No'),

    new Paragraph({
      children: [
        new TextRun({ text: 'Project Description:', bold: true }),
      ],
      spacing: { before: 200 },
    }),
    new Paragraph({
      text: details.description || 'No description provided',
      spacing: { after: 200 },
    }),

    // Site Information Section
    new Paragraph({
      text: 'SITE INFORMATION',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
    createFieldParagraph('Property Address:', site.propertyAddress || 'N/A'),
    createFieldParagraph('Water Frontage:', site.waterFrontage ? `${site.waterFrontage} feet` : 'N/A'),
    createFieldParagraph('Elevation:', site.elevation ? `${site.elevation} feet` : 'N/A'),
  ];

  // Add Site Plan Drawing section if available
  if (sitePlanDrawing?.exportedImage) {
    children.push(
      new Paragraph({
        text: 'SITE PLAN DRAWING',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: sitePlanDrawing.name || 'Site Plan',
        spacing: { after: 200 },
      })
    );

    // Add the image
    try {
      const imageBytes = base64ToUint8Array(sitePlanDrawing.exportedImage);
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imageBytes,
              transformation: {
                width: 500,
                height: 375,
              },
            }),
          ],
          spacing: { after: 200 },
        })
      );

      // Add scale info
      if (sitePlanDrawing.scale) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Scale: ${sitePlanDrawing.scale.scaleRatio}`,
                size: 18,
                color: '666666',
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }
    } catch (error) {
      console.error('Failed to add site plan image to DOCX:', error);
    }
  }

  // Signature Section
  children.push(
    new Paragraph({
      text: 'SIGNATURE',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 600, after: 200 },
    }),
    new Paragraph({
      text: 'I certify that the information provided is true and accurate.',
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '_'.repeat(50) + '    ' }),
        new TextRun({ text: '_'.repeat(30) }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Signature', size: 18 }),
        new TextRun({ text: '                                                           ' }),
        new TextRun({ text: 'Date', size: 18 }),
      ],
      spacing: { after: 400 },
    }),

    // Footer
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated by Lake Tapps Permit Workflow Application on ${new Date().toLocaleDateString()}`,
          size: 16,
          color: '808080',
        }),
      ],
      spacing: { before: 600 },
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  return Packer.toBlob(doc);
}

function createFieldParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: label + ' ', bold: true }),
      new TextRun({ text: value }),
    ],
    spacing: { after: 100 },
  });
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

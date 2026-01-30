'use client';

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import {
  generateCWALicensePDF,
  generateCWALicenseDOCX,
  downloadFile,
} from '@/lib/documentGenerator';
import {
  generateSolarBuildingPermitPDF,
  generateSolarBuildingPermitDOCX,
  generateUtilityInterconnectionPDF,
  generateUtilityInterconnectionDOCX,
} from '@/lib/solarPermitGenerator';
import {
  generateADUBuildingPermitPDF,
  generateADUBuildingPermitDOCX,
  generatePlanningApprovalPDF,
  generatePlanningApprovalDOCX,
  generateSepticPermitPDF,
  generateSepticPermitDOCX,
  generateADUShorelinePermitPDF,
  generateADUShorelinePermitDOCX,
} from '@/lib/aduPermitGenerator';
import {
  generateBuildingPermitPDF,
  generateBuildingPermitDOCX,
} from '@/lib/buildingPermitGenerator';
import {
  generateLNIElectricalPermitPDF,
  generateLNIElectricalPermitDOCX,
} from '@/lib/electricalPermitGenerator';
import {
  generateDORSalesTaxRefundPDF,
  generateDORSalesTaxRefundDOCX,
} from '@/lib/dorSalesTaxRefundGenerator';
import {
  generateProjectSummaryPDF,
  generateProjectSummaryDOCX,
} from '@/lib/projectSummaryGenerator';
import {
  generateSubmissionChecklistPDF,
  generateSubmissionChecklistDOCX,
} from '@/lib/submissionChecklistGenerator';
import {
  generateTimelineTrackerPDF,
  generateTimelineTrackerDOCX,
} from '@/lib/timelineTrackerGenerator';
import {
  generateAgencyContactListPDF,
  generateAgencyContactListDOCX,
} from '@/lib/agencyContactListGenerator';
import {
  generateJARPAPDF,
  generateJARPADOCX,
} from '@/lib/jarpaFormGenerator';
import {
  generateCert401PDF,
  generateCert401DOCX,
} from '@/lib/cert401Generator';

type FileFormat = 'pdf' | 'docx';

interface GeneratedDoc {
  pdf: Uint8Array | null;
  docx: Blob | null;
}

interface DocumentConfig {
  id: string;
  name: string;
  description: string;
  primaryFormat: 'PDF';
  backupFormat: 'DOCX';
  agency: string;
  submitMethod: string;
  preferredFormat: string;
}

export default function GenerateDocsStage() {
  const { project, addNotification, addActionPrompt } = useStore();
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<Record<string, GeneratedDoc>>({});

  if (!project) return null;

  const workflowType = project.workflowType;

  // Get workflow-specific documents
  const getDocuments = (): DocumentConfig[] => {
    switch (workflowType) {
      case 'solar':
        return [
          {
            id: 'solar_building_permit',
            name: 'Solar Building Permit Application',
            description: 'Building permit for residential rooftop PV installation — includes Pierce County code compliance checklist and submittal requirements per Technical Bulletin (2021 Codes)',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Pierce County Planning & Public Works',
            submitMethod: 'Online at piercecountywa.gov or in person',
            preferredFormat: 'PDF (recommended)',
          },
          {
            id: 'lni_electrical_permit',
            name: 'WA State Electrical Work Permit (L&I)',
            description: 'Property owner electrical permit for solar installation (Form F500-094-000)',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'WA Dept. of Labor & Industries',
            submitMethod: 'Online at secure.lni.wa.gov/epispub or in person',
            preferredFormat: 'PDF (recommended)',
          },
          {
            id: 'utility_interconnection',
            name: project.details.utilityProvider === 'tacoma_power'
              ? 'Tacoma Power Net Metering Application'
              : 'PSE Interconnection & Net Metering Application',
            description: project.details.utilityProvider === 'tacoma_power'
              ? 'Net metering application per RCW 80.60 with Tacoma Power permitting steps via Accela, construction standards, and incentives reference'
              : 'Interconnection application with PSE Rate Schedule 150 (Net Metering) & 152 checklist, incentives reference, and firefighter accessibility requirements',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: project.details.utilityProvider === 'tacoma_power'
              ? 'Tacoma Power (Tacoma Public Utilities)'
              : 'Puget Sound Energy (PSE)',
            submitMethod: project.details.utilityProvider === 'tacoma_power'
              ? 'Accela portal — CityofTacoma.org/Permits'
              : 'PSE online portal — pse.com/green-options',
            preferredFormat: 'PDF (recommended)',
          },
          {
            id: 'project_summary',
            name: 'Project Summary Sheet',
            description: 'Single-page overview of your solar project for reference',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
          {
            id: 'submission_checklist',
            name: 'Submission Checklist',
            description: 'Printable checklist of all required submissions',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
          {
            id: 'timeline_tracker',
            name: 'Timeline Tracker',
            description: 'Track permit processing dates and deadlines',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
          {
            id: 'agency_contacts',
            name: 'Agency Contact List',
            description: 'Reference list of all relevant agency contacts',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
          {
            id: 'dor_sales_tax_refund',
            name: (project.details.solarSystemSize || 0) >= 500
              ? 'DOR Sales Tax Refund (Form 40 2432A — Category 1)'
              : 'DOR Sales Tax Refund (Form 40 2432)',
            description: 'Application for sales tax refund on qualified renewable energy equipment (RCW 82.08.962)',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'WA Dept. of Revenue',
            submitMethod: 'Mail to DOR or online via My DOR portal',
            preferredFormat: 'PDF (recommended)',
          },
        ];
      case 'adu':
        const aduDocs: DocumentConfig[] = [
          {
            id: 'adu_building_permit',
            name: 'ADU Building Permit Application',
            description: 'Building permit for ADU per PCC 18A.37.120 & Residential Construction Guide — includes compliance checklist, permit exemption notice, fire flow, drainage thresholds, and submittal requirements',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Pierce County Planning & Public Works',
            submitMethod: 'Online at piercecountywa.gov or in person',
            preferredFormat: 'PDF (recommended)',
          },
          {
            id: 'planning_approval',
            name: 'Planning Department Approval',
            description: 'Zoning compliance review per PCC 18A.37.120 & 18A.15.040 — ADU is a permitted use in all residential zones, no special use permit required',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Pierce County Planning & Public Works',
            submitMethod: 'Online at piercecountywa.gov or in person',
            preferredFormat: 'PDF (recommended)',
          },
        ];
        // Add septic permit if needed
        if (!project.details.onSewer) {
          aduDocs.push({
            id: 'septic_permit',
            name: 'Septic System Permit',
            description: 'Permit for septic system installation or expansion',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Pierce County Health Department',
            submitMethod: 'In person or mail',
            preferredFormat: 'PDF (recommended)',
          });
        }
        // Add shoreline permit if needed
        if (project.details.nearShoreline) {
          aduDocs.push({
            id: 'adu_shoreline_permit',
            name: 'Shoreline Substantial Development Permit (ADU)',
            description: 'ADUs are NOT exempt from shoreline permit per PCC 18S.60.020 — required for ADU within 200 ft of water regardless of project cost',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'City of Bonney Lake',
            submitMethod: 'Online portal',
            preferredFormat: 'PDF (recommended)',
          });
        }
        // Add LNI electrical permit if needed
        if (project.details.hasElectricalWork) {
          aduDocs.push({
            id: 'lni_electrical_permit',
            name: 'WA State Electrical Work Permit (L&I)',
            description: 'Property owner electrical permit for ADU (Form F500-094-000)',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'WA Dept. of Labor & Industries',
            submitMethod: 'Online at secure.lni.wa.gov/epispub or in person',
            preferredFormat: 'PDF (recommended)',
          });
        }
        // Common supplementary documents
        aduDocs.push(
          {
            id: 'project_summary',
            name: 'Project Summary Sheet',
            description: 'Single-page overview of your ADU project for reference',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
          {
            id: 'submission_checklist',
            name: 'Submission Checklist',
            description: 'Printable checklist of all required submissions',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
          {
            id: 'timeline_tracker',
            name: 'Timeline Tracker',
            description: 'Track permit processing dates and deadlines',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
          {
            id: 'agency_contacts',
            name: 'Agency Contact List',
            description: 'Reference list of all relevant agency contacts',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
        );
        return aduDocs;
      default: { // waterfront
        const waterfrontDocs: DocumentConfig[] = [
          {
            id: 'cwa_license',
            name: 'CWA License Application',
            description: 'Cascade Water Alliance license application form',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Cascade Water Alliance',
            submitMethod: 'Email to panderson@cascadewater.org',
            preferredFormat: 'PDF (recommended for email submission)',
          },
          {
            id: 'shoreline',
            name: 'Shoreline Permit Application',
            description: 'City of Bonney Lake shoreline permit',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'City of Bonney Lake',
            submitMethod: 'Online portal at web.ci.bonney-lake.wa.us',
            preferredFormat: 'PDF (recommended for portal upload)',
          },
          {
            id: 'hpa_jarpa',
            name: 'JARPA Application',
            description: 'Joint Aquatic Resource Permit Application for WDFW HPA',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'WA Dept. of Fish & Wildlife',
            submitMethod: 'Online via APPS portal or email',
            preferredFormat: 'PDF (recommended for APPS submission)',
          },
        ];
        // Add Pierce County building permit for structural work
        if (project.requiredPermits.includes('pierce_building_permit' as any)) {
          waterfrontDocs.push({
            id: 'pierce_building_permit',
            name: 'Pierce County Building Permit Application',
            description: 'Residential construction permit per Pierce County Residential Construction Guide — includes site plan, construction plan, WSEC, drainage, and fire flow requirements',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Pierce County Development Center',
            submitMethod: 'Online at piercecountywa.gov/903 or in person',
            preferredFormat: 'PDF (recommended)',
          });
        }
        // Add LNI electrical permit if needed
        if (project.requiredPermits.includes('lni_electrical_permit' as any)) {
          waterfrontDocs.push({
            id: 'lni_electrical_permit',
            name: 'WA State Electrical Work Permit (L&I)',
            description: 'Property owner electrical permit (Form F500-094-000)',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'WA Dept. of Labor & Industries',
            submitMethod: 'Online at secure.lni.wa.gov/epispub or in person',
            preferredFormat: 'PDF (recommended)',
          });
        }
        // Supplementary waterfront documents
        waterfrontDocs.push({
          id: 'jarpa_form',
          name: 'JARPA Application (Pre-filled)',
          description: 'Joint Aquatic Resource Permits Application pre-filled with your project data',
          primaryFormat: 'PDF',
          backupFormat: 'DOCX',
          agency: 'WA Dept. of Fish & Wildlife',
          submitMethod: 'Online via APPS portal or email',
          preferredFormat: 'PDF (recommended)',
        });
        if (project.requiredPermits.includes('section_404' as any)) {
          waterfrontDocs.push({
            id: 'cert_401',
            name: '401 Water Quality Certification Request',
            description: 'Request letter to WA Dept. of Ecology for Section 401 certification',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'WA Dept. of Ecology',
            submitMethod: 'Online or mail',
            preferredFormat: 'PDF (recommended)',
          });
        }
        // Common supplementary documents
        waterfrontDocs.push(
          {
            id: 'project_summary',
            name: 'Project Summary Sheet',
            description: 'Single-page overview of your project for reference',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
          {
            id: 'submission_checklist',
            name: 'Submission Checklist',
            description: 'Printable checklist of all required submissions',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
          {
            id: 'timeline_tracker',
            name: 'Timeline Tracker',
            description: 'Track permit processing dates and deadlines',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
          {
            id: 'agency_contacts',
            name: 'Agency Contact List',
            description: 'Reference list of all relevant agency contacts',
            primaryFormat: 'PDF',
            backupFormat: 'DOCX',
            agency: 'Reference Document',
            submitMethod: 'For your records',
            preferredFormat: 'PDF',
          },
        );
        return waterfrontDocs;
      }
    }
  };

  const documents = getDocuments();

  const handleGenerate = async (docId: string) => {
    setGenerating(docId);

    try {
      let pdfData: Uint8Array | null = null;
      let docxData: Blob | null = null;

      // Get site plan drawing if available
      const sitePlanDrawing = project.sitePlanDrawing;

      // Generate documents based on workflow type and document ID
      // Shared generators (available across workflows)
      if (docId === 'pierce_building_permit') {
        pdfData = await generateBuildingPermitPDF(project);
        docxData = await generateBuildingPermitDOCX(project);
      } else if (docId === 'lni_electrical_permit') {
        pdfData = await generateLNIElectricalPermitPDF(project);
        docxData = await generateLNIElectricalPermitDOCX(project);
      } else if (docId === 'dor_sales_tax_refund') {
        pdfData = await generateDORSalesTaxRefundPDF(project);
        docxData = await generateDORSalesTaxRefundDOCX(project);
      } else if (workflowType === 'waterfront') {
        if (docId === 'cwa_license') {
          pdfData = await generateCWALicensePDF(project, sitePlanDrawing);
          docxData = await generateCWALicenseDOCX(project, sitePlanDrawing);
        } else if (docId === 'shoreline') {
          pdfData = await generateCWALicensePDF(project, sitePlanDrawing);
          docxData = await generateCWALicenseDOCX(project, sitePlanDrawing);
        } else if (docId === 'hpa_jarpa') {
          pdfData = await generateCWALicensePDF(project, sitePlanDrawing);
          docxData = await generateCWALicenseDOCX(project, sitePlanDrawing);
        }
      } else if (workflowType === 'solar') {
        if (docId === 'solar_building_permit') {
          pdfData = await generateSolarBuildingPermitPDF(project);
          docxData = await generateSolarBuildingPermitDOCX(project);
        } else if (docId === 'utility_interconnection') {
          pdfData = await generateUtilityInterconnectionPDF(project);
          docxData = await generateUtilityInterconnectionDOCX(project);
        }
      } else if (workflowType === 'adu') {
        if (docId === 'adu_building_permit') {
          pdfData = await generateADUBuildingPermitPDF(project);
          docxData = await generateADUBuildingPermitDOCX(project);
        } else if (docId === 'planning_approval') {
          pdfData = await generatePlanningApprovalPDF(project);
          docxData = await generatePlanningApprovalDOCX(project);
        } else if (docId === 'septic_permit') {
          pdfData = await generateSepticPermitPDF(project);
          docxData = await generateSepticPermitDOCX(project);
        } else if (docId === 'adu_shoreline_permit') {
          pdfData = await generateADUShorelinePermitPDF(project);
          docxData = await generateADUShorelinePermitDOCX(project);
        }
      }

      // Supplementary document generators (shared across workflows)
      if (docId === 'project_summary') {
        pdfData = await generateProjectSummaryPDF(project);
        docxData = await generateProjectSummaryDOCX(project);
      } else if (docId === 'submission_checklist') {
        pdfData = await generateSubmissionChecklistPDF(project);
        docxData = await generateSubmissionChecklistDOCX(project);
      } else if (docId === 'timeline_tracker') {
        pdfData = await generateTimelineTrackerPDF(project);
        docxData = await generateTimelineTrackerDOCX(project);
      } else if (docId === 'agency_contacts') {
        pdfData = await generateAgencyContactListPDF(project);
        docxData = await generateAgencyContactListDOCX(project);
      } else if (docId === 'jarpa_form') {
        pdfData = await generateJARPAPDF(project);
        docxData = await generateJARPADOCX(project);
      } else if (docId === 'cert_401') {
        pdfData = await generateCert401PDF(project);
        docxData = await generateCert401DOCX(project);
      }

      setGeneratedDocs((prev) => ({
        ...prev,
        [docId]: { pdf: pdfData, docx: docxData },
      }));
    } catch (error) {
      console.error('Error generating documents:', error);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: `Failed to generate document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        dismissible: true,
        duration: 5000,
      });
      setGenerating(null);
      return;
    }

    setGenerating(null);
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      addNotification({
        type: 'success',
        title: 'Documents Generated',
        message: `${doc.name} has been created in both PDF and DOCX formats.`,
        dismissible: true,
        duration: 5000,
      });

      // Show action prompt
      addActionPrompt({
        type: 'download',
        title: `Download ${doc.name}`,
        agency: doc.agency,
        instructions: [
          `Download the ${doc.primaryFormat} (primary) for submission`,
          `${doc.backupFormat} (backup) is also available if needed`,
          `Submit via: ${doc.submitMethod}`,
          'Keep copies in both formats for your records',
        ],
        contactInfo: {
          name: doc.agency,
          email: docId === 'cwa_license' ? 'panderson@cascadewater.org' :
                 docId === 'shoreline' ? 'permits@cobl.us' : 'permits@city.gov',
          phone: docId === 'cwa_license' ? '(425) 453-0930' :
                 docId === 'shoreline' ? '(253) 447-4356' : '(253) 447-4356',
          submissionMethod: docId === 'cwa_license' ? 'email' : 'online',
        },
      });
    }
  };

  const handleDownload = (docId: string, format: FileFormat) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    const generatedDoc = generatedDocs[docId];
    if (!generatedDoc) return;

    const filename = `${doc.name.replace(/\s+/g, '_')}_${project.owner.lastName}`;

    try {
      if (format === 'pdf' && generatedDoc.pdf) {
        downloadFile(generatedDoc.pdf, `${filename}.pdf`, 'application/pdf');
        addNotification({
          type: 'success',
          title: 'Download Complete',
          message: `${doc.name} (PDF) has been downloaded.`,
          dismissible: true,
          duration: 3000,
        });
      } else if (format === 'docx' && generatedDoc.docx) {
        downloadFile(generatedDoc.docx, `${filename}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        addNotification({
          type: 'success',
          title: 'Download Complete',
          message: `${doc.name} (DOCX) has been downloaded.`,
          dismissible: true,
          duration: 3000,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Download Failed',
          message: `${format.toUpperCase()} file not available. Please regenerate the document.`,
          dismissible: true,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: `Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`,
        dismissible: true,
        duration: 5000,
      });
    }
  };

  const getDocStatus = (docId: string) => {
    return generatedDocs[docId] || { pdf: null, docx: null };
  };

  const isDocGenerated = (docId: string) => {
    const status = getDocStatus(docId);
    return status.pdf !== null && status.docx !== null;
  };

  const totalGenerated = Object.values(generatedDocs).filter(
    (doc) => doc.pdf !== null && doc.docx !== null
  ).length;

  // Get workflow-specific colors
  const getWorkflowColors = () => {
    switch (workflowType) {
      case 'solar':
        return {
          gradient: 'from-amber-50 to-orange-50',
          border: 'border-amber-200/50',
          bg: 'bg-amber-100',
          text: 'text-amber-600',
          textDark: 'text-amber-900',
          ring: 'ring-amber-200',
        };
      case 'adu':
        return {
          gradient: 'from-emerald-50 to-teal-50',
          border: 'border-emerald-200/50',
          bg: 'bg-emerald-100',
          text: 'text-emerald-600',
          textDark: 'text-emerald-900',
          ring: 'ring-emerald-200',
        };
      default:
        return {
          gradient: 'from-blue-50 to-indigo-50',
          border: 'border-blue-200/50',
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          textDark: 'text-blue-900',
          ring: 'ring-blue-200',
        };
    }
  };

  const colors = getWorkflowColors();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
          Generate Documents
        </h1>
        <p className="text-slate-600 leading-relaxed">
          Generate your permit application documents ready for submission. Each document is generated in both PDF (primary) and DOCX (backup) formats.
        </p>
      </div>

      {/* Format Info */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${colors.gradient} border ${colors.border} rounded-xl p-5 mb-6`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex gap-4">
          <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center`}>
            <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className={`font-semibold ${colors.textDark}`}>Multiple Formats Available</h3>
            <p className={`text-sm ${colors.text.replace('600', '800')} mt-1`}>
              Each document is generated in two formats:
            </p>
            <ul className={`text-sm ${colors.text.replace('600', '800')} mt-3 space-y-2`}>
              <li className="flex items-center gap-2">
                <span className={`px-2 py-0.5 ${colors.bg} rounded text-xs font-semibold`}>PDF</span>
                <span>Recommended for most submissions, preserves formatting</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`px-2 py-0.5 ${colors.bg} rounded text-xs font-semibold`}>DOCX</span>
                <span>Editable format if modifications are needed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4 stagger-animation">
        {documents.map((doc) => {
          const isGenerated = isDocGenerated(doc.id);
          const isGenerating = generating === doc.id;

          return (
            <div key={doc.id} className={`card transition-all duration-300 ${isGenerated ? `ring-2 ${colors.ring} bg-opacity-30` : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isGenerated ? `bg-gradient-to-br ${colors.gradient.replace('50', '100').replace('50', '200')}` : 'bg-gradient-to-br from-slate-100 to-slate-200'
                  }`}>
                    {isGenerated ? (
                      <svg className={`w-7 h-7 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{doc.name}</h3>
                    <p className="text-slate-600">{doc.description}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {doc.preferredFormat}
                    </p>
                  </div>
                </div>

                {!isGenerated && (
                  <button
                    onClick={() => handleGenerate(doc.id)}
                    disabled={isGenerating}
                    className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                      isGenerating
                        ? 'bg-slate-100 text-slate-500 cursor-wait'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 spinner border-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Generate
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Download buttons when generated */}
              {isGenerated && (
                <div className={`border-t ${colors.border} pt-4 mt-4 animate-fade-in`}>
                  <p className="text-sm text-slate-600 mb-3 font-medium">Download your documents:</p>
                  <div className="flex flex-wrap gap-3">
                    {/* Primary Format - PDF */}
                    <button
                      onClick={() => handleDownload(doc.id, 'pdf')}
                      className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                      <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">Primary</span>
                    </button>

                    {/* Backup Format - DOCX */}
                    <button
                      onClick={() => handleDownload(doc.id, 'docx')}
                      className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-slate-700 hover:text-slate-900 bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98] transition-all duration-200"
                    >
                      <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download DOCX
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">Backup</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submission info */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-slate-500">Submit to:</span>
                  <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium">{doc.agency}</span>
                  <span className="text-slate-400 hidden sm:inline">|</span>
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {doc.submitMethod}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 card bg-gradient-to-r from-slate-50 to-slate-100/50 border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              {totalGenerated} of {documents.length} documents generated
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Each document includes both PDF (primary) and DOCX (backup) formats.
            </p>
          </div>
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center">
              <span className="text-xl font-bold text-primary-600">
                {Math.round((totalGenerated / documents.length) * 100)}%
              </span>
            </div>
            {/* Progress ring */}
            <svg className="absolute inset-0 w-16 h-16 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="url(#progress-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(totalGenerated / documents.length) * 176} 176`}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {totalGenerated === documents.length && (
        <div className={`mt-6 relative overflow-hidden card bg-gradient-to-r ${colors.gradient} ${colors.border} animate-fade-in`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex gap-4">
            <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${colors.bg} rounded-full flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className={`font-semibold ${colors.textDark} text-lg`}>All Documents Ready!</h3>
              <p className={`${colors.text.replace('600', '800')} mt-1 leading-relaxed`}>
                All your permit documents have been generated in both PDF and DOCX formats.
                Continue to the next step to submit your applications.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

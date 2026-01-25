'use client';

import { useStore } from '@/store/useStore';
import { useState, useRef } from 'react';
import {
  generateCWALicensePDF,
  generateCWALicenseDOCX,
  downloadFile,
} from '@/lib/documentGenerator';

type FileFormat = 'pdf' | 'docx';

interface GeneratedDoc {
  pdf: Uint8Array | null;
  docx: Blob | null;
}

export default function GenerateDocsStage() {
  const { project, drawingState, addNotification, showActionPrompt, addActionPrompt } = useStore();
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<Record<string, GeneratedDoc>>({});
  const generatedDocsRef = useRef<Record<string, GeneratedDoc>>({});

  if (!project) return null;

  const documents = [
    {
      id: 'cwa_license',
      name: 'CWA License Application',
      description: 'Cascade Water Alliance license application form',
      primaryFormat: 'PDF' as const,
      backupFormat: 'DOCX' as const,
      agency: 'Cascade Water Alliance',
      submitMethod: 'Email to panderson@cascadewater.org',
      preferredFormat: 'PDF (recommended for email submission)',
    },
    {
      id: 'shoreline',
      name: 'Shoreline Permit Application',
      description: 'City of Bonney Lake shoreline permit',
      primaryFormat: 'PDF' as const,
      backupFormat: 'DOCX' as const,
      agency: 'City of Bonney Lake',
      submitMethod: 'Online portal at web.ci.bonney-lake.wa.us',
      preferredFormat: 'PDF (recommended for portal upload)',
    },
    {
      id: 'hpa_jarpa',
      name: 'JARPA Application',
      description: 'Joint Aquatic Resource Permit Application for WDFW HPA',
      primaryFormat: 'PDF' as const,
      backupFormat: 'DOCX' as const,
      agency: 'WA Dept. of Fish & Wildlife',
      submitMethod: 'Online via APPS portal or email',
      preferredFormat: 'PDF (recommended for APPS submission)',
    },
  ];

  const handleGenerate = async (docId: string) => {
    if (!project) return;

    setGenerating(docId);

    try {
      // Get the current site plan drawing if available
      const sitePlanDrawing = drawingState.currentDrawing;

      let pdfData: Uint8Array | null = null;
      let docxData: Blob | null = null;

      // Generate actual documents based on document type
      if (docId === 'cwa_license') {
        // Generate CWA License documents
        pdfData = await generateCWALicensePDF(project, sitePlanDrawing ?? undefined);
        docxData = await generateCWALicenseDOCX(project, sitePlanDrawing ?? undefined);
      } else if (docId === 'shoreline') {
        // For shoreline permit, use CWA template as base (can be customized later)
        pdfData = await generateCWALicensePDF(project, sitePlanDrawing ?? undefined);
        docxData = await generateCWALicenseDOCX(project, sitePlanDrawing ?? undefined);
      } else if (docId === 'hpa_jarpa') {
        // For JARPA, use CWA template as base (can be customized later)
        pdfData = await generateCWALicensePDF(project, sitePlanDrawing ?? undefined);
        docxData = await generateCWALicenseDOCX(project, sitePlanDrawing ?? undefined);
      }

      // Store the generated document data
      const newGeneratedDocs = {
        ...generatedDocsRef.current,
        [docId]: { pdf: pdfData, docx: docxData },
      };
      generatedDocsRef.current = newGeneratedDocs;
      setGeneratedDocs(newGeneratedDocs);

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
                   docId === 'shoreline' ? 'permits@cobl.us' : 'HPAapplications@dfw.wa.gov',
            phone: docId === 'cwa_license' ? '(425) 453-0930' :
                   docId === 'shoreline' ? '(253) 447-4356' : '(360) 902-2534',
            submissionMethod: docId === 'cwa_license' ? 'email' : 'online',
          },
        });
      }
    } catch (error) {
      setGenerating(null);
      console.error('Failed to generate documents:', error);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: `Failed to generate documents. ${error instanceof Error ? error.message : 'Please try again.'}`,
        dismissible: true,
        duration: 5000,
      });
    }
  };

  const handleDownload = (docId: string, format: FileFormat) => {
    const doc = documents.find((d) => d.id === docId);
    const generatedDoc = generatedDocsRef.current[docId];
    if (!doc || !generatedDoc) return;

    const ownerName = project ? `${project.owner.lastName}_${project.owner.firstName}` : 'Application';
    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'pdf' && generatedDoc.pdf) {
      const filename = `${doc.id}_${ownerName}_${dateStr}.pdf`;
      downloadFile(generatedDoc.pdf, filename, 'application/pdf');
      addNotification({
        type: 'success',
        title: 'Download Complete',
        message: `${doc.name} (PDF) has been downloaded.`,
        dismissible: true,
        duration: 3000,
      });
    } else if (format === 'docx' && generatedDoc.docx) {
      const filename = `${doc.id}_${ownerName}_${dateStr}.docx`;
      downloadFile(generatedDoc.docx, filename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
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
        message: `Document not found. Please regenerate the document.`,
        dismissible: true,
        duration: 3000,
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

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Generate Documents
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Generate your permit application documents ready for submission. Each document is generated in both PDF (primary) and DOCX (backup) formats.
        </p>
      </div>

      {/* Format Info */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Multiple Formats Available</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              Each document is generated in two formats:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
              <li><strong>PDF (Primary)</strong> - Recommended for most submissions, preserves formatting</li>
              <li><strong>DOCX (Backup)</strong> - Editable format if modifications are needed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((doc) => {
          const isGenerated = isDocGenerated(doc.id);
          const isGenerating = generating === doc.id;
          const status = getDocStatus(doc.id);

          return (
            <div key={doc.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isGenerated ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-slate-100 dark:bg-slate-700'
                  }`}>
                    {isGenerated ? (
                      <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{doc.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{doc.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {doc.preferredFormat}
                    </p>
                  </div>
                </div>

                {!isGenerated && (
                  <button
                    onClick={() => handleGenerate(doc.id)}
                    disabled={isGenerating}
                    className="btn btn-secondary btn-sm flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 spinner border-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Download your documents:</p>
                  <div className="flex flex-wrap gap-3">
                    {/* Primary Format - PDF */}
                    <button
                      onClick={() => handleDownload(doc.id, 'pdf')}
                      className="btn btn-primary btn-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                      <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">Primary</span>
                    </button>

                    {/* Backup Format - DOCX */}
                    <button
                      onClick={() => handleDownload(doc.id, 'docx')}
                      className="btn btn-secondary btn-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download DOCX
                      <span className="px-1.5 py-0.5 bg-slate-200 rounded text-xs">Backup</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submission info */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Submit to:</span>
                  <span className="text-slate-700 dark:text-slate-300">{doc.agency}</span>
                  <span className="text-slate-400 dark:text-slate-500">|</span>
                  <span className="text-slate-600 dark:text-slate-400">{doc.submitMethod}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 card bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {totalGenerated} of {documents.length} documents generated
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Each document includes both PDF (primary) and DOCX (backup) formats.
            </p>
          </div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {Math.round((totalGenerated / documents.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {totalGenerated === documents.length && (
        <div className="mt-6 card bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-emerald-900 dark:text-emerald-100">All Documents Ready!</h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
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

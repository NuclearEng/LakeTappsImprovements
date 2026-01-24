'use client';

import { useStore } from '@/store/useStore';
import { useState } from 'react';

type FileFormat = 'pdf' | 'docx';

interface GeneratedDoc {
  pdf: boolean;
  docx: boolean;
}

export default function GenerateDocsStage() {
  const { project, addNotification, showActionPrompt, addActionPrompt } = useStore();
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<Record<string, GeneratedDoc>>({});

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
    setGenerating(docId);

    // Simulate document generation for both formats
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setGenerating(null);
    setGeneratedDocs((prev) => ({
      ...prev,
      [docId]: { pdf: true, docx: true },
    }));

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
  };

  const handleDownload = (docId: string, format: FileFormat) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    // In a real implementation, this would trigger actual file download
    addNotification({
      type: 'info',
      title: 'Download Started',
      message: `Downloading ${doc.name} (${format.toUpperCase()})...`,
      dismissible: true,
      duration: 3000,
    });
  };

  const getDocStatus = (docId: string) => {
    return generatedDocs[docId] || { pdf: false, docx: false };
  };

  const isDocGenerated = (docId: string) => {
    const status = getDocStatus(docId);
    return status.pdf && status.docx;
  };

  const totalGenerated = Object.values(generatedDocs).filter(
    (doc) => doc.pdf && doc.docx
  ).length;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Generate Documents
        </h1>
        <p className="text-slate-600">
          Generate your permit application documents ready for submission. Each document is generated in both PDF (primary) and DOCX (backup) formats.
        </p>
      </div>

      {/* Format Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-blue-900">Multiple Formats Available</h3>
            <p className="text-sm text-blue-800 mt-1">
              Each document is generated in two formats:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
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
                    isGenerated ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}>
                    {isGenerated ? (
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{doc.name}</h3>
                    <p className="text-sm text-slate-600">{doc.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
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
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <p className="text-sm text-slate-600 mb-3">Download your documents:</p>
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
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">Submit to:</span>
                  <span className="text-slate-700">{doc.agency}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600">{doc.submitMethod}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 card bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">
              {totalGenerated} of {documents.length} documents generated
            </p>
            <p className="text-sm text-slate-600">
              Each document includes both PDF (primary) and DOCX (backup) formats.
            </p>
          </div>
          <div className="text-2xl font-bold text-primary-600">
            {Math.round((totalGenerated / documents.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {totalGenerated === documents.length && (
        <div className="mt-6 card bg-emerald-50 border-emerald-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-emerald-900">All Documents Ready!</h3>
              <p className="text-sm text-emerald-800 mt-1">
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

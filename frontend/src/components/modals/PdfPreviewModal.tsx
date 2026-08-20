import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Loader2, Printer } from 'lucide-react';
import { Button } from '../ui/Button';

interface PdfPreviewModalProps {
  verificationId: string;
  externalId?: string;
  isPublic?: boolean;
  shareToken?: string;
  onClose: () => void;
}

export function PdfPreviewModal({
  verificationId,
  externalId,
  isPublic = false,
  shareToken,
  onClose
}: PdfPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPdf() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const endpoint = isPublic && shareToken
          ? `http://localhost:8000/api/v1/verifications/shared/public/${shareToken}/pdf`
          : `http://localhost:8000/api/v1/verifications/${verificationId}/report/pdf`;

        const headers: Record<string, string> = {};
        if (token && !isPublic) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const resp = await fetch(endpoint, { headers });
        if (!resp.ok) {
          throw new Error('Unable to generate PDF document');
        }
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err: any) {
        setError(err.message || 'Unable to generate the PDF. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchPdf();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [verificationId, isPublic, shareToken]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `RentVerify_Report_${externalId || verificationId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-surface-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 text-primary-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Verification Report Preview</h3>
              <p className="text-xs text-slate-500 font-mono">Report ID: {externalId || verificationId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={loading || !pdfUrl}
              className="text-xs font-semibold"
            >
              <Download className="mr-1.5 h-4 w-4" /> Download PDF
            </Button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-slate-100 p-4 overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="text-center space-y-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
              <p className="text-sm font-bold text-slate-800">Generating PDF Report...</p>
              <p className="text-xs text-slate-500">Compiling ReportLab layout from PostgreSQL database</p>
            </div>
          )}

          {error && (
            <div className="text-center space-y-3 p-8 bg-white rounded-2xl shadow-sm border border-red-200 max-w-md">
              <div className="mx-auto h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">!</div>
              <h4 className="text-sm font-bold text-slate-900">PDF Generation Failed</h4>
              <p className="text-xs text-red-600">{error}</p>
              <Button variant="outline" onClick={onClose} className="text-xs">Close</Button>
            </div>
          )}

          {!loading && !error && pdfUrl && (
            <iframe
              src={pdfUrl}
              className="h-full w-full rounded-xl border border-slate-300 bg-white shadow-inner"
              title="PDF Report Document"
            />
          )}
        </div>
      </div>
    </div>
  );
}

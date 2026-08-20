import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  ShieldCheck, FileText, UserCircle, Building2, Calendar, 
  Brain, Download, Eye, Loader2, AlertCircle, CheckCircle2, Lock
} from 'lucide-react';
import { PdfPreviewModal } from '../components/modals/PdfPreviewModal';

interface SharedReportData {
  verification_id: string;
  external_id: string;
  generated_date: string;
  decision: string;
  explanation: string;
  tenant_info: {
    name: string;
    property: string;
    monthly_rent_formatted: string;
    period: string;
    duration: string;
    landlord_organization: string;
  };
  payment_summary: {
    expected_payments: number;
    verified_payments: number;
    on_time_payments: number;
    late_payments: number;
    partial_payments: number;
    missed_payments: number;
    on_time_rate: string;
  };
  ai_analysis: {
    rent_transactions: number;
    non_rent_transactions: number;
    confidence_percentage: number;
    normal_payments: number;
    anomalies_detected: number;
    review_recommendation: string;
  };
  result_status: string;
}

export function SharedReportView() {
  const { shareToken } = useParams();
  const [data, setData] = useState<SharedReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    async function fetchSharedReport() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`http://localhost:8000/api/v1/verifications/shared/public/${shareToken}`);
        if (!resp.ok) {
          throw new Error('Shared report link not found or expired');
        }
        const result = await resp.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Unable to load shared report');
      } finally {
        setLoading(false);
      }
    }
    if (shareToken) {
      fetchSharedReport();
    }
  }, [shareToken]);

  const handleDownloadPdf = () => {
    if (!shareToken || !data) return;
    const downloadUrl = `http://localhost:8000/api/v1/verifications/shared/public/${shareToken}/pdf`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `RentVerify_Report_${data.external_id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
          <h3 className="text-sm font-bold text-slate-800">Loading Shared Report...</h3>
          <p className="text-xs text-slate-500">Fetching verified financial details</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-white p-8 rounded-2xl border border-red-200 shadow-sm max-w-md w-full">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
          <p className="text-xs text-red-600">{error || 'This shared verification report is invalid or expired.'}</p>
          <Link to="/" className="inline-block text-xs font-bold text-primary-600 hover:underline">
            Return to RentVerify Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Branding Banner */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">RentVerify</h1>
              <p className="text-xs text-slate-500">Official Shared Verification Report • Read Only</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowPdfModal(true)} className="text-xs font-semibold">
              <Eye className="mr-1.5 h-4 w-4" /> View PDF
            </Button>
            <Button variant="primary" onClick={handleDownloadPdf} className="text-xs font-semibold bg-primary-600 text-white">
              <Download className="mr-1.5 h-4 w-4" /> Download Report
            </Button>
          </div>
        </div>

        {/* Verification Decision Header */}
        <Card className={`p-6 border shadow-sm ${
          data.decision === 'APPROVED' ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Badge variant={data.decision === 'APPROVED' ? 'success' : 'warning'} className="text-sm font-extrabold px-3 py-1">
                  VERIFICATION DECISION: {data.decision}
                </Badge>
                <span className="text-xs text-slate-500 font-mono">ID: {data.external_id}</span>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">{data.explanation}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Generated Date</span>
              <span className="text-xs font-bold text-slate-800">{data.generated_date}</span>
            </div>
          </div>
        </Card>

        {/* Tenant & Lease Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-primary-600" /> Tenant & Property Details
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tenant Name</span>
                <span className="font-bold text-slate-900">{data.tenant_info.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Property Address</span>
                <span className="font-bold text-slate-900">{data.tenant_info.property}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Monthly Rent</span>
                <span className="font-bold text-slate-900">{data.tenant_info.monthly_rent_formatted}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Landlord Organization</span>
                <span className="font-bold text-slate-900">{data.tenant_info.landlord_organization}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" /> Verification Period
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Period</span>
                <span className="font-bold text-slate-900">{data.tenant_info.period}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lease Duration</span>
                <span className="font-bold text-slate-900">{data.tenant_info.duration}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Audit Status</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Summary */}
        <Card className="p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Payment Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-surface-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Expected</span>
              <span className="text-lg font-bold text-slate-900">{data.payment_summary.expected_payments}</span>
            </div>
            <div className="p-3 bg-surface-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Verified</span>
              <span className="text-lg font-bold text-slate-900">{data.payment_summary.verified_payments}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">On-Time</span>
              <span className="text-lg font-bold text-emerald-800">{data.payment_summary.on_time_payments}</span>
            </div>
            <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
              <span className="text-[10px] font-bold uppercase text-primary-700 block">On-Time Rate</span>
              <span className="text-lg font-bold text-primary-800">{data.payment_summary.on_time_rate}</span>
            </div>
          </div>
        </Card>

        {/* AI Verification Analysis */}
        <Card className="p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Brain className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              AI Verification Analysis (Scikit-Learn)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-3 bg-surface-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 block">Rent Transaction Classification</span>
              <div className="flex justify-between text-slate-600">
                <span>Rent Transactions:</span>
                <span className="font-bold text-slate-900">{data.ai_analysis.rent_transactions}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Non-Rent Transactions:</span>
                <span className="font-bold text-slate-900">{data.ai_analysis.non_rent_transactions}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>AI Confidence:</span>
                <span className="font-bold text-emerald-700">{data.ai_analysis.confidence_percentage}%</span>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-surface-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 block">Payment Anomaly Detection</span>
              <div className="flex justify-between text-slate-600">
                <span>Normal Payments:</span>
                <span className="font-bold text-slate-900">{data.ai_analysis.normal_payments}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Anomalies Detected:</span>
                <span className="font-bold text-slate-900">{data.ai_analysis.anomalies_detected}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Recommendation:</span>
                <span className="font-bold text-slate-900">{data.ai_analysis.review_recommendation}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* PDF Modal */}
      {showPdfModal && (
        <PdfPreviewModal
          verificationId={data.verification_id}
          externalId={data.external_id}
          isPublic={true}
          shareToken={shareToken}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}

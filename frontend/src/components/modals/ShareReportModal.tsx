import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Mail, Share2, Link as LinkIcon, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface ShareReportModalProps {
  verificationId: string;
  externalId?: string;
  onClose: () => void;
}

export function ShareReportModal({ verificationId, externalId, onClose }: ShareReportModalProps) {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    async function createShareLink() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`http://localhost:8000/api/v1/verifications/${verificationId}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!resp.ok) {
          throw new Error('Unable to create share link');
        }
        const data = await resp.json();
        setShareUrl(data.share_url);
      } catch (err: any) {
        setEmailError('Unable to create the share link. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    createShareLink();
  }, [verificationId]);

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleEmailReport = async () => {
    setEmailSending(true);
    setEmailSuccess(null);
    setEmailError(null);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`http://localhost:8000/api/v1/verifications/${verificationId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipient_email: recipientEmail || undefined })
      });
      if (!resp.ok) {
        throw new Error('Unable to send report email');
      }
      const data = await resp.json();
      setEmailSuccess(data.message || 'Report email sent successfully');
      setRecipientEmail('');
    } catch (err: any) {
      setEmailError(err.message || 'Unable to send the report email.');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-surface-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 text-primary-600">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Share Verification Report</h3>
              <p className="text-xs text-slate-500 font-mono">Verification ID: {externalId || verificationId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="text-center py-6 space-y-3">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary-600" />
              <p className="text-xs font-semibold text-slate-600">Creating Secure Share Link...</p>
            </div>
          ) : (
            <>
              {/* Share URL Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Secure Share Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-none"
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleCopyLink}
                    className={`shrink-0 text-xs font-semibold ${
                      copied ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-primary-600 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1.5 h-4 w-4" /> ✓ Link copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-4 w-4" /> Copy Link
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Anyone with this link can view a read-only copy of the verification report.
                </p>
              </div>

              {/* Email Section */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Email Verification Report
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Enter recipient email (optional)"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                  <Button
                    variant="outline"
                    onClick={handleEmailReport}
                    disabled={emailSending}
                    className="shrink-0 text-xs font-semibold"
                  >
                    {emailSending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-1.5 h-3.5 w-3.5" /> Email Report
                      </>
                    )}
                  </Button>
                </div>

                {emailSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    {emailSuccess}
                  </div>
                )}

                {emailError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {emailError}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 px-6 py-4 bg-surface-50">
          <Button variant="outline" onClick={onClose} className="text-xs font-semibold">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

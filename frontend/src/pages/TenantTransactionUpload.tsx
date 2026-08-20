import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, RefreshCw, ArrowLeft, FileText } from 'lucide-react';

export function TenantTransactionUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<number>(0); // 0: Select, 1: Uploading, 2: Validating, 3: Processing, 4: Completed
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleCSV = `transaction_id,date,amount,description,payer,payee
TXN9001,2026-01-03,25000.00,RENT PAYMENT JAN 2026,Alex Johnson,Apex Realty
TXN9002,2026-02-04,25000.00,RENT PAYMENT FEB 2026,Alex Johnson,Apex Realty
TXN9003,2026-03-05,25000.00,RENT PAYMENT MAR 2026,Alex Johnson,Apex Realty`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_rental_transactions.csv';
    a.click();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a valid .csv file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a valid .csv file');
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setError(null);
    setStep(1); // Uploading

    setTimeout(() => {
      setStep(2); // Validating
    }, 600);

    setTimeout(() => {
      setStep(3); // Processing
    }, 1200);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const token = localStorage.getItem('rv_token');
    try {
      const res = await fetch('/api/v1/tenant/transactions/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const json = await res.json();
      setTimeout(() => {
        setStep(4); // Completed
        if (res.ok) {
          setResult(json);
        } else {
          setError(json.detail || 'Failed to process CSV file');
        }
      }, 1800);
    } catch (err: any) {
      setStep(0);
      setError('Connection error uploading CSV.');
    }
  };

  const handleDownloadErrorReport = () => {
    if (!result || !result.invalid_rows) return;
    let csvText = "row_number,transaction_id,error_reason\n";
    result.invalid_rows.forEach((r: any) => {
      csvText += `${r.row_number},${r.transaction_id || ''},"${r.error_reason}"\n`;
    });
    const blob = new Blob([csvText], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'csv_error_report.csv';
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/tenant/transactions')} className="p-2 rounded-xl border border-surface-200 hover:bg-surface-100 text-slate-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upload Rental Payment Data</h1>
          <p className="text-xs text-slate-500">Upload your rental transaction CSV to complete the verification.</p>
        </div>
      </div>

      {/* Progress Steps Header */}
      {step > 0 && (
        <Card className="p-6 border border-surface-200">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className={`p-2 rounded-xl border font-bold ${step >= 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-surface-50 text-slate-400'}`}>
              Step 1: Uploading
            </div>
            <div className={`p-2 rounded-xl border font-bold ${step >= 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-surface-50 text-slate-400'}`}>
              Step 2: Validating
            </div>
            <div className={`p-2 rounded-xl border font-bold ${step >= 3 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-surface-50 text-slate-400'}`}>
              Step 3: Processing
            </div>
            <div className={`p-2 rounded-xl border font-bold ${step === 4 ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-surface-50 text-slate-400'}`}>
              Step 4: Completed
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-danger-50 border border-danger-200 text-danger-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-danger-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 0: Upload Area */}
      {step === 0 && (
        <div className="space-y-6">
          <Card className="p-8 border-2 border-dashed border-surface-300 rounded-3xl text-center space-y-4 hover:border-emerald-500 transition-colors">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`p-6 rounded-2xl ${dragActive ? 'bg-emerald-50/60' : ''}`}
            >
              <FileSpreadsheet className="mx-auto h-12 w-12 text-emerald-600 mb-2" />
              <h3 className="text-base font-bold text-slate-900">Drag & Drop Bank Statement CSV</h3>
              <p className="text-xs text-slate-500 mt-1">Maximum file size: 10 MB | Format: .csv</p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="mt-4 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  Browse Computer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadSample}
                  className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download Example CSV
                </Button>
              </div>

              {selectedFile && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          </Card>

          {/* Format Specification Box */}
          <Card className="p-6 border border-surface-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Supported Columns & Format Specification</h4>
            <p className="text-xs text-slate-500">Ensure your CSV header row contains the following required column names:</p>
            <div className="flex flex-wrap gap-2 text-xs font-mono font-bold text-slate-800">
              <span className="bg-surface-100 px-2.5 py-1 rounded-lg border">transaction_id</span>
              <span className="bg-surface-100 px-2.5 py-1 rounded-lg border">date</span>
              <span className="bg-surface-100 px-2.5 py-1 rounded-lg border">amount</span>
              <span className="bg-surface-100 px-2.5 py-1 rounded-lg border">description</span>
              <span className="bg-surface-100 px-2.5 py-1 rounded-lg border">payer</span>
              <span className="bg-surface-100 px-2.5 py-1 rounded-lg border">payee</span>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              variant="primary"
              disabled={!selectedFile}
              onClick={handleUploadSubmit}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-8 h-11 shadow-lg shadow-emerald-600/25"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload CSV
            </Button>
          </div>
        </div>
      )}

      {/* Steps 1-3 Loading Spinner */}
      {step > 0 && step < 4 && (
        <Card className="p-12 text-center space-y-4">
          <RefreshCw className="mx-auto h-10 w-10 text-emerald-600 animate-spin" />
          <h3 className="text-base font-bold text-slate-900">
            {step === 1 ? 'Step 1: Uploading CSV Data...' : step === 2 ? 'Step 2: Validating Columns & Formatting...' : 'Step 3: Running AI Verification Engine...'}
          </h3>
          <p className="text-xs text-slate-500">Parsing transaction rows and calculating rent consistency score.</p>
        </Card>
      )}

      {/* Step 4: Results Display */}
      {step === 4 && result && (
        <div className="space-y-6">
          <Card className="p-6 border border-emerald-200 bg-emerald-50/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">CSV Processing Completed</h3>
                <p className="text-xs text-slate-500">Verification ID: <span className="font-mono font-bold text-slate-800">{result.verification_id}</span></p>
              </div>
            </div>

            {/* Results Counters */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="bg-white p-4 rounded-2xl border border-surface-200 text-center">
                <span className="text-xs font-bold uppercase text-slate-400 block">Transactions Uploaded</span>
                <span className="text-2xl font-extrabold text-slate-900">{result.total_uploaded}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 text-center">
                <span className="text-xs font-bold uppercase text-emerald-700 block">Valid Transactions</span>
                <span className="text-2xl font-extrabold text-emerald-600">{result.valid_count}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-amber-200 text-center">
                <span className="text-xs font-bold uppercase text-amber-700 block">Invalid Transactions</span>
                <span className="text-2xl font-extrabold text-amber-600">{result.invalid_count}</span>
              </div>
            </div>
          </Card>

          {/* Invalid Rows Table */}
          {result.invalid_rows && result.invalid_rows.length > 0 && (
            <Card className="p-6 border border-amber-200 bg-white space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Invalid Rows & Reasons ({result.invalid_rows.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-surface-100 font-bold text-[10px] text-slate-400 uppercase">
                    <tr>
                      <th className="p-2.5">Row #</th>
                      <th className="p-2.5">Transaction ID</th>
                      <th className="p-2.5">Error Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {result.invalid_rows.map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold font-mono text-slate-800">Row {row.row_number}</td>
                        <td className="p-2.5 font-mono">{row.transaction_id || 'N/A'}</td>
                        <td className="p-2.5 text-amber-700 font-medium">{row.error_reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {result.invalid_rows && result.invalid_rows.length > 0 ? (
              <Button
                variant="outline"
                onClick={handleDownloadErrorReport}
                className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
              >
                <Download className="mr-2 h-4 w-4" /> Download Error Report
              </Button>
            ) : <div />}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setStep(0); setSelectedFile(null); setResult(null); }}
                className="text-xs"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Upload Again
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/tenant/verification-history')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-6 shadow-md shadow-emerald-600/20"
              >
                View Verification History
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

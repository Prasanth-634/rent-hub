export type Role = 'LANDLORD' | 'TENANT' | 'LENDER' | 'ADMIN' | 'API_CUSTOMER';

export interface User {
  id: str;
  email: str;
  full_name: str;
  role: Role;
  is_active: boolean;
  organization_id?: str;
}

export type str = string;

export interface Property {
  id: string;
  organization_id: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  created_at: string;
}

export interface Tenant {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface Lease {
  id: string;
  property_id: string;
  tenant_id: string;
  monthly_rent_minor_units: number;
  currency: string;
  due_day: number;
  start_date: string;
  end_date: string;
  status: string;
}

export interface Consent {
  id: string;
  verification_id: string;
  tenant_id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';
  scope: string;
  granted_at?: string;
  expires_at?: string;
}

export interface Transaction {
  id: string;
  verification_id: string;
  external_transaction_id?: string;
  transaction_date: string;
  amount_minor_units: number;
  currency: string;
  description?: string;
  payer?: string;
  payee?: string;
  is_rent_predicted: boolean;
  rent_probability: number;
  anomaly_score: number;
  anomaly_flag: boolean;
}

export interface VerificationResult {
  id: string;
  verification_id: string;
  months_expected: number;
  months_matched: number;
  on_time_count: number;
  late_count: number;
  partial_count: number;
  missed_count: number;
  duplicate_count: number;
  confidence_level: number;
  status: 'VERIFIED' | 'REQUIRES_REVIEW' | 'UNVERIFIED';
  explanation_json?: any;
  finalized_at: string;
}

export interface VerificationRequest {
  id: string;
  external_id: string;
  requester_organization_id: string;
  tenant_id: string;
  lease_id: string;
  period_start: string;
  period_end: string;
  status: 'PENDING_CONSENT' | 'CONSENT_GRANTED' | 'UPLOAD_PENDING' | 'PROCESSING' | 'COMPLETED' | 'REQUIRES_REVIEW' | 'REJECTED';
  created_at: string;
  completed_at?: string;
  result?: VerificationResult;
  consents: Consent[];
}

export interface AuditLog {
  id: string;
  actor_user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata_json?: any;
  created_at: string;
}


export interface AITransactionResult {
  id?: string;
  transaction_id: string;
  verification_id?: string;
  classification: 'RENT' | 'NON_RENT';
  classification_confidence: number;
  is_anomaly: boolean;
  anomaly_score: number;
  review_reason?: string;
  model_version: string;
  anomaly_model_version: string;
  created_at?: string;
}

export interface AIVerificationSummary {
  rent_transactions_detected: number;
  non_rent_transactions: number;
  anomalies_detected: number;
  ai_confidence_percentage: number;
  review_status: 'VERIFIED' | 'REVIEW_RECOMMENDED';
  review_recommendation: string;
  explanation: string;
  model_version: string;
  anomaly_model_version: string;
}

export interface VerificationAIResultsResponse {
  verification_id: string;
  summary: AIVerificationSummary;
  transactions: Array<any>;
}

export interface AdminAIMonitoringStats {
  total_transactions_processed: number;
  rent_classifications_count: number;
  non_rent_classifications_count: number;
  anomalies_detected_count: number;
  model_version: string;
  anomaly_model_version: string;
  failed_predictions_count: number;
  average_processing_time_ms: number;
  last_retrained_at?: string;
}

export type SecurityIncident = {
  id?: string;
  type: IncidentType;
  description: string;
  severity?: SeverityLevel;
  timestamp?: Date;
  status: IncidentStatus;
  contactMethod?: ContactMethod;
  contactDetails?: string;
  clientType: ClientType;
  serviceType: ServiceType;
};

export enum ClientType {
  INDIVIDUAL = "Individual",
  BUSINESS = "Business"
}

export enum ServiceType {
  SUPPORT = "Support / Incident",
  SOLUTIONS = "Custom Solutions",
  ASSESSMENT = "Security Assessment"
}

export enum IncidentType {
  PHISHING = "Phishing Attempt",
  MALWARE = "Malware Detection",
  DATA_BREACH = "Potential Data Breach",
  UNAUTHORIZED_ACCESS = "Unauthorized Access",
  SUSPICIOUS_ACTIVITY = "Suspicious Activity",
  SOCIAL_ENGINEERING = "Social Engineering",
  OTHER = "Other Security Concern"
}

export enum SeverityLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical"
}

export enum IncidentStatus {
  SUBMITTED = "Submitted",
  ANALYZING = "Analyzing",
  TRIAGED = "Triaged",
  ESCALATED = "Escalated",
  RESOLVED = "Resolved"
}

export enum ContactMethod {
  WHATSAPP = "WhatsApp",
  TELEGRAM = "Telegram"
}

export type AIAnalysisResult = {
  summary: string;
  recommendations: string[];
  severity: SeverityLevel;
  escalationRequired: boolean;
  contactRecommendation: string;
  aiResponses?: {
    chatgpt: string;
    gemini: string;
  };
};
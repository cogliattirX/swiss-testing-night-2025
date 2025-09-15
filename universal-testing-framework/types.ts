/**
 * Universal Website Testing Framework
 * AI-Powered Website Analysis and Test Generation
 */

export interface WebsiteAnalysis {
  url: string;
  timestamp: Date;
  structure: WebsiteStructure;
  technologies: TechnologyStack;
  accessibility: AccessibilityMetrics;
  performance: PerformanceMetrics;
  security: SecurityFindings;
  recommendations: QualityRecommendation[];
}

export interface WebsiteStructure {
  navigation: NavigationElement[];
  forms: FormElement[];
  interactive: InteractiveElement[];
  content: ContentElement[];
  layout: LayoutStructure;
}

export interface NavigationElement {
  type: 'menu' | 'breadcrumb' | 'pagination' | 'footer' | 'sidebar';
  selector: string;
  text: string;
  href?: string;
  level: number;
  accessibility: {
    hasAriaLabel: boolean;
    hasKeyboardSupport: boolean;
    roleAttribute?: string;
  };
}

export interface FormElement {
  selector: string;
  action?: string;
  method: string;
  fields: FormField[];
  validation: ValidationRules;
  accessibility: FormAccessibility;
}

export interface FormField {
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file';
  name: string;
  selector: string;
  required: boolean;
  label?: string;
  placeholder?: string;
  validation: FieldValidation;
}

export interface InteractiveElement {
  type: 'button' | 'link' | 'modal' | 'dropdown' | 'slider' | 'tabs' | 'accordion';
  selector: string;
  text: string;
  action: string;
  accessibility: ElementAccessibility;
}

export interface ContentElement {
  type: 'heading' | 'paragraph' | 'image' | 'video' | 'list' | 'table' | 'article';
  selector: string;
  content: string;
  semantics: SemanticInfo;
  accessibility: ContentAccessibility;
}

export interface TechnologyStack {
  framework?: string;
  cms?: string;
  analytics: string[];
  libraries: string[];
  hosting?: string;
  cdn?: string;
  security: SecurityTech[];
}

export interface SecurityTech {
  type: 'ssl' | 'headers' | 'csp' | 'authentication' | 'authorization';
  implementation: string;
  strength: 'weak' | 'moderate' | 'strong';
  recommendations: string[];
}

export interface AccessibilityMetrics {
  score: number; // 0-100
  wcagLevel: 'A' | 'AA' | 'AAA' | 'none';
  violations: AccessibilityViolation[];
  compliance: {
    perceivable: number;
    operable: number;
    understandable: number;
    robust: number;
  };
}

export interface AccessibilityViolation {
  rule: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  selector: string;
  description: string;
  recommendation: string;
}

export interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay  
    cls: number; // Cumulative Layout Shift
  };
  loadTimes: {
    firstByte: number;
    firstContentfulPaint: number;
    domComplete: number;
    loadComplete: number;
  };
  resourceMetrics: {
    totalSize: number;
    requests: number;
    cacheEfficiency: number;
    compressionRatio: number;
  };
  score: number; // 0-100
}

export interface SecurityFindings {
  score: number; // 0-100
  vulnerabilities: SecurityVulnerability[];
  headers: SecurityHeaders;
  encryption: EncryptionInfo;
  privacy: PrivacyFindings;
}

export interface SecurityVulnerability {
  type: 'xss' | 'csrf' | 'injection' | 'disclosure' | 'authentication' | 'authorization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  remediation: string;
}

export interface QualityRecommendation {
  category: 'security' | 'performance' | 'accessibility' | 'functionality' | 'seo' | 'ux';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  effort: 'small' | 'medium' | 'large';
  impact: 'low' | 'medium' | 'high';
}

// Additional supporting interfaces
export interface ValidationRules {
  required: string[];
  patterns: Record<string, RegExp>;
  customValidation: ValidationFunction[];
}

export interface FieldValidation {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  customRules: string[];
}

export interface FormAccessibility {
  hasLabels: boolean;
  hasFieldsets: boolean;
  hasErrorMessages: boolean;
  keyboardNavigable: boolean;
  screenReaderFriendly: boolean;
}

export interface ElementAccessibility {
  hasAriaLabel: boolean;
  hasRole: boolean;
  keyboardAccessible: boolean;
  focusVisible: boolean;
  semanticallyCorrect: boolean;
}

export interface ContentAccessibility {
  hasAltText: boolean;
  hasHeadingStructure: boolean;
  hasLandmarks: boolean;
  colorContrastRatio?: number;
  readabilityScore?: number;
}

export interface SemanticInfo {
  htmlTag: string;
  ariaRole?: string;
  semanticMeaning: string;
  structuralImportance: 'low' | 'medium' | 'high';
}

export interface LayoutStructure {
  responsive: boolean;
  breakpoints: number[];
  gridSystem?: string;
  flexboxUsage: boolean;
  mobileFirst: boolean;
}

export interface SecurityHeaders {
  csp: string | null;
  xFrameOptions: string | null;
  xContentTypeOptions: string | null;
  strictTransportSecurity: string | null;
  referrerPolicy: string | null;
  score: number;
}

export interface EncryptionInfo {
  https: boolean;
  tlsVersion: string;
  certificateValidity: boolean;
  certificateIssuer: string;
  hsts: boolean;
}

export interface PrivacyFindings {
  cookieCompliance: boolean;
  gdprCompliance: boolean;
  dataCollection: string[];
  thirdPartyTrackers: string[];
  privacyPolicyPresent: boolean;
}

export type ValidationFunction = (value: string, field: FormField) => boolean | string;

/**
 * Main Website Analysis Result
 * Used for AI-powered test generation and quality reporting
 */
export interface UniversalTestResult {
  analysis: WebsiteAnalysis;
  generatedTests: GeneratedTest[];
  qualityReport: QualityReport;
  executionMetrics: ExecutionMetrics;
}

export interface GeneratedTest {
  name: string;
  category: 'functional' | 'performance' | 'accessibility' | 'security' | 'responsive';
  persona: string; // Which QA persona generated this test
  code: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  dependencies: string[];
}

export interface QualityReport {
  overallScore: number;
  categoryScores: {
    functionality: number;
    performance: number;
    accessibility: number;
    security: number;
    usability: number;
  };
  executiveSummary: string;
  keyFindings: string[];
  priorityActions: QualityRecommendation[];
  detailedAnalysis: DetailedAnalysis;
}

export interface DetailedAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  competitorComparison?: ComparisonMetrics;
}

export interface ExecutionMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionTime: number;
  coverage: CoverageMetrics;
  reliability: number;
}

export interface CoverageMetrics {
  functional: number;
  performance: number;
  accessibility: number;
  security: number;
  responsive: number;
}

export interface ComparisonMetrics {
  industry: string;
  performancePercentile: number;
  accessibilityPercentile: number;
  securityPercentile: number;
  recommendations: string[];
}

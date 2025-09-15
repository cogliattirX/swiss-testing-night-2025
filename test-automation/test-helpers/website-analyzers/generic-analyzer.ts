import { Page, expect } from '@playwright/test';
import { createObservableActions } from '../observability';

export interface WebsiteQualityReport {
  website: {
    url: string;
    title: string;
    analysisDate: string;
    loadTime: number;
  };
  accessibility: {
    score: number;
    issues: AccessibilityIssue[];
    recommendations: string[];
  };
  performance: {
    score: number;
    metrics: PerformanceMetrics;
    recommendations: string[];
  };
  functionality: {
    score: number;
    workingFeatures: string[];
    brokenFeatures: string[];
    recommendations: string[];
  };
  usability: {
    score: number;
    findings: string[];
    recommendations: string[];
  };
  security: {
    score: number;
    findings: string[];
    recommendations: string[];
  };
  overallScore: number;
  evidence: {
    screenshots: string[];
    videos: string[];
    traces: string[];
  };
}

export interface AccessibilityIssue {
  type: 'missing-alt' | 'low-contrast' | 'missing-labels' | 'keyboard-nav' | 'aria-violations';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  element?: string;
  recommendation: string;
}

export interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  timeToInteractive: number;
  domContentLoaded: number;
  resourceCount: number;
  totalSize: number;
}

export class GenericWebsiteAnalyzer {
  private page: Page;
  private actions: any;
  private startTime: number = 0;
  
  constructor(page: Page) {
    this.page = page;
    this.actions = createObservableActions(page);
  }

  async analyzeWebsite(url: string): Promise<WebsiteQualityReport> {
    console.log(`🔍 Starting comprehensive analysis of: ${url}`);
    
    this.startTime = Date.now();
    
    // Initialize report structure
    const report: WebsiteQualityReport = {
      website: {
        url,
        title: '',
        analysisDate: new Date().toISOString(),
        loadTime: 0
      },
      accessibility: { score: 0, issues: [], recommendations: [] },
      performance: { score: 0, metrics: {} as PerformanceMetrics, recommendations: [] },
      functionality: { score: 0, workingFeatures: [], brokenFeatures: [], recommendations: [] },
      usability: { score: 0, findings: [], recommendations: [] },
      security: { score: 0, findings: [], recommendations: [] },
      overallScore: 0,
      evidence: { screenshots: [], videos: [], traces: [] }
    };

    try {
      // Load website and capture initial metrics
      await this.actions.observableGoto(url, `Analyzing website: ${url}`);
      
      const loadTime = Date.now() - this.startTime;
      report.website.loadTime = loadTime;
      report.website.title = await this.page.title();
      
      console.log(`✅ Website loaded in ${loadTime}ms`);
      
      // Take initial screenshot
      const screenshotPath = `analysis-${Date.now()}-initial.png`;
      await this.actions.screenshot(screenshotPath, 'Initial website state');
      report.evidence.screenshots.push(screenshotPath);
      
      // Run all analysis modules
      await this.analyzePerformance(report);
      await this.analyzeAccessibility(report);
      await this.analyzeFunctionality(report);
      await this.analyzeUsability(report);
      await this.analyzeSecurity(report);
      
      // Calculate overall score
      report.overallScore = this.calculateOverallScore(report);
      
      console.log(`📊 Analysis complete. Overall score: ${report.overallScore}/100`);
      
      return report;
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    }
  }

  private async analyzePerformance(report: WebsiteQualityReport): Promise<void> {
    console.log('🚀 Analyzing performance...');
    
    try {
      // Get basic performance metrics
      const performanceMetrics = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          resourceCount: performance.getEntriesByType('resource').length,
          totalSize: performance.getEntriesByType('resource').reduce((sum, r) => sum + (r as any).transferSize || 0, 0)
        };
      });
      
      report.performance.metrics = {
        firstContentfulPaint: performanceMetrics.firstContentfulPaint,
        largestContentfulPaint: 0, // Would need more complex measurement
        cumulativeLayoutShift: 0,   // Would need more complex measurement  
        totalBlockingTime: 0,       // Would need more complex measurement
        timeToInteractive: 0,       // Would need more complex measurement
        domContentLoaded: performanceMetrics.domContentLoaded,
        resourceCount: performanceMetrics.resourceCount,
        totalSize: performanceMetrics.totalSize
      };
      
      // Score performance (basic scoring)
      let score = 100;
      if (report.website.loadTime > 3000) score -= 30;
      if (report.website.loadTime > 5000) score -= 20;
      if (performanceMetrics.resourceCount > 100) score -= 15;
      if (performanceMetrics.totalSize > 5000000) score -= 15; // 5MB
      
      report.performance.score = Math.max(0, score);
      
      // Add recommendations
      if (report.website.loadTime > 3000) {
        report.performance.recommendations.push('Optimize page load time (currently > 3 seconds)');
      }
      if (performanceMetrics.resourceCount > 50) {
        report.performance.recommendations.push(`Reduce number of HTTP requests (currently ${performanceMetrics.resourceCount})`);
      }
      if (performanceMetrics.totalSize > 2000000) {
        report.performance.recommendations.push(`Optimize resource sizes (currently ${(performanceMetrics.totalSize / 1024 / 1024).toFixed(1)}MB)`);
      }
      
    } catch (error) {
      console.error('Performance analysis failed:', error);
      report.performance.score = 0;
      report.performance.recommendations.push('Performance analysis failed - consider reviewing console errors');
    }
  }

  private async analyzeAccessibility(report: WebsiteQualityReport): Promise<void> {
    console.log('♿ Analyzing accessibility...');
    
    try {
      // Check for common accessibility issues
      const accessibilityIssues = await this.page.evaluate(() => {
        const issues: any[] = [];
        
        // Check for images without alt text
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        imagesWithoutAlt.forEach((img, index) => {
          issues.push({
            type: 'missing-alt',
            severity: 'high',
            description: `Image missing alt attribute`,
            element: `img:nth-of-type(${index + 1})`,
            recommendation: 'Add descriptive alt attribute to image'
          });
        });
        
        // Check for form inputs without labels
        const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        inputsWithoutLabels.forEach((input, index) => {
          const hasLabel = document.querySelector(`label[for="${input.id}"]`);
          if (!hasLabel && input.id) {
            issues.push({
              type: 'missing-labels',
              severity: 'high',
              description: `Form input missing accessible label`,
              element: `#${input.id}`,
              recommendation: 'Add label or aria-label to form input'
            });
          }
        });
        
        // Check for proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
          issues.push({
            type: 'aria-violations',
            severity: 'medium',
            description: 'No heading elements found',
            recommendation: 'Add proper heading structure for screen readers'
          });
        }
        
        return issues;
      });
      
      report.accessibility.issues = accessibilityIssues;
      
      // Score accessibility
      let score = 100;
      accessibilityIssues.forEach(issue => {
        switch (issue.severity) {
          case 'critical': score -= 25; break;
          case 'high': score -= 15; break;
          case 'medium': score -= 10; break;
          case 'low': score -= 5; break;
        }
      });
      
      report.accessibility.score = Math.max(0, score);
      
      // Add general recommendations
      if (accessibilityIssues.length > 0) {
        report.accessibility.recommendations.push('Address identified accessibility issues');
        report.accessibility.recommendations.push('Consider running automated accessibility tools like axe-core');
        report.accessibility.recommendations.push('Test with screen readers and keyboard navigation');
      } else {
        report.accessibility.recommendations.push('Continue following WCAG guidelines');
      }
      
    } catch (error) {
      console.error('Accessibility analysis failed:', error);
      report.accessibility.score = 50; // Default partial score
    }
  }

  private async analyzeFunctionality(report: WebsiteQualityReport): Promise<void> {
    console.log('⚙️ Analyzing functionality...');
    
    try {
      // Test basic functionality
      const functionalityTests = await this.page.evaluate(() => {
        const workingFeatures: string[] = [];
        const brokenFeatures: string[] = [];
        
        // Check for forms
        const forms = document.querySelectorAll('form');
        if (forms.length > 0) {
          workingFeatures.push(`Found ${forms.length} form(s)`);
        }
        
        // Check for navigation
        const navElements = document.querySelectorAll('nav, .nav, .navigation, .menu');
        if (navElements.length > 0) {
          workingFeatures.push(`Found ${navElements.length} navigation element(s)`);
        }
        
        // Check for interactive elements
        const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
        if (buttons.length > 0) {
          workingFeatures.push(`Found ${buttons.length} button(s)`);
        }
        
        // Check for links
        const links = document.querySelectorAll('a[href]');
        if (links.length > 0) {
          workingFeatures.push(`Found ${links.length} link(s)`);
        }
        
        // Check for broken images
        const images = document.querySelectorAll('img');
        let brokenImages = 0;
        images.forEach(img => {
          if (!img.complete || img.naturalWidth === 0) {
            brokenImages++;
          }
        });
        
        if (brokenImages > 0) {
          brokenFeatures.push(`${brokenImages} broken image(s) detected`);
        }
        
        return { workingFeatures, brokenFeatures };
      });
      
      report.functionality.workingFeatures = functionalityTests.workingFeatures;
      report.functionality.brokenFeatures = functionalityTests.brokenFeatures;
      
      // Test common interactive elements
      try {
        // Try to find and test a search box
        const searchInput = this.page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i]').first();
        if (await searchInput.isVisible({ timeout: 1000 })) {
          await searchInput.fill('test');
          report.functionality.workingFeatures.push('Search functionality appears functional');
        }
      } catch (e) {
        // Search not available or not working
      }
      
      // Score functionality
      let score = Math.min(100, functionalityTests.workingFeatures.length * 20);
      score -= functionalityTests.brokenFeatures.length * 15;
      report.functionality.score = Math.max(0, score);
      
      // Add recommendations
      if (functionalityTests.brokenFeatures.length > 0) {
        report.functionality.recommendations.push('Fix identified broken features');
      }
      if (functionalityTests.workingFeatures.length < 3) {
        report.functionality.recommendations.push('Consider adding more interactive features');
      }
      
    } catch (error) {
      console.error('Functionality analysis failed:', error);
      report.functionality.score = 50;
    }
  }

  private async analyzeUsability(report: WebsiteQualityReport): Promise<void> {
    console.log('👤 Analyzing usability...');
    
    try {
      const usabilityChecks = await this.page.evaluate(() => {
        const findings: string[] = [];
        
        // Check viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
          findings.push('Missing viewport meta tag - not mobile optimized');
        } else {
          findings.push('Viewport meta tag present - mobile consideration detected');
        }
        
        // Check for readable font sizes
        const bodyStyle = window.getComputedStyle(document.body);
        const fontSize = parseInt(bodyStyle.fontSize);
        if (fontSize < 14) {
          findings.push(`Font size may be too small (${fontSize}px) for readability`);
        } else {
          findings.push(`Font size appears appropriate (${fontSize}px)`);
        }
        
        // Check for reasonable contrast (basic check)
        const backgroundColor = bodyStyle.backgroundColor;
        const color = bodyStyle.color;
        if (backgroundColor && color) {
          findings.push('Text and background colors are defined');
        }
        
        // Check page structure
        const hasHeader = document.querySelector('header, .header');
        const hasMain = document.querySelector('main, .main, .content');
        const hasFooter = document.querySelector('footer, .footer');
        
        if (hasHeader && hasMain && hasFooter) {
          findings.push('Good page structure with header, main, and footer');
        } else {
          findings.push('Consider improving page structure (header/main/footer)');
        }
        
        return findings;
      });
      
      report.usability.findings = usabilityChecks;
      
      // Score usability based on findings
      let score = 80; // Start with good base score
      usabilityChecks.forEach(finding => {
        if (finding.includes('Missing') || finding.includes('too small') || finding.includes('Consider')) {
          score -= 15;
        } else {
          score += 5;
        }
      });
      
      report.usability.score = Math.min(100, Math.max(0, score));
      
      // Add recommendations
      report.usability.recommendations.push('Test with real users for comprehensive usability assessment');
      report.usability.recommendations.push('Verify mobile responsiveness across different devices');
      report.usability.recommendations.push('Check loading times on slower connections');
      
    } catch (error) {
      console.error('Usability analysis failed:', error);
      report.usability.score = 50;
    }
  }

  private async analyzeSecurity(report: WebsiteQualityReport): Promise<void> {
    console.log('🔒 Analyzing security...');
    
    try {
      const securityChecks = await this.page.evaluate(() => {
        const findings: string[] = [];
        
        // Check HTTPS
        if (location.protocol === 'https:') {
          findings.push('Website uses HTTPS encryption');
        } else {
          findings.push('⚠️ Website does not use HTTPS - security risk');
        }
        
        // Check for forms and their security
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
          const method = form.method.toLowerCase();
          const action = form.action;
          
          if (method === 'post' && action.startsWith('https://')) {
            findings.push(`Form ${index + 1}: Uses secure POST method`);
          } else if (method === 'get' && form.querySelector('input[type="password"]')) {
            findings.push(`⚠️ Form ${index + 1}: Password field in GET form - security risk`);
          }
        });
        
        // Check for password fields
        const passwordFields = document.querySelectorAll('input[type="password"]');
        if (passwordFields.length > 0) {
          findings.push(`Found ${passwordFields.length} password field(s) - verify they're properly secured`);
        }
        
        return findings;
      });
      
      report.security.findings = securityChecks;
      
      // Score security
      let score = 70; // Start with reasonable base
      securityChecks.forEach(finding => {
        if (finding.includes('⚠️')) {
          score -= 25;
        } else if (finding.includes('HTTPS') || finding.includes('secure')) {
          score += 15;
        }
      });
      
      report.security.score = Math.min(100, Math.max(0, score));
      
      // Add recommendations
      report.security.recommendations.push('Conduct thorough security audit with specialized tools');
      report.security.recommendations.push('Verify all data transmission is encrypted');
      report.security.recommendations.push('Review authentication and authorization mechanisms');
      
    } catch (error) {
      console.error('Security analysis failed:', error);
      report.security.score = 50;
    }
  }

  private calculateOverallScore(report: WebsiteQualityReport): number {
    const weights = {
      accessibility: 0.25,
      performance: 0.25,
      functionality: 0.20,
      usability: 0.15,
      security: 0.15
    };
    
    return Math.round(
      report.accessibility.score * weights.accessibility +
      report.performance.score * weights.performance +
      report.functionality.score * weights.functionality +
      report.usability.score * weights.usability +
      report.security.score * weights.security
    );
  }
}

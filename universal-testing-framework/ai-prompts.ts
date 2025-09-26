/**
 * AI-Powered Website Quality Assessment Prompts
 * Standardized prompts for GitHub Copilot to analyze any website
 */

import { WebsiteAnalysis } from './types';

export class UniversalWebsiteAnalyzer {
  
  /**
   * Generate comprehensive website analysis prompt for GitHub Copilot
   */
  static generateAnalysisPrompt(targetUrl: string, analysisScope: string[] = ['all']): string {
    const contextBlock = this.getStandardContext(targetUrl);
    const scopeRequirements = this.getScopeRequirements(analysisScope);
    
    return `
As an AI-Testing Specialist leading a comprehensive QA team analysis,
I need to analyze website ${targetUrl} and create a complete quality assessment.

${contextBlock}

Team Assembly for this analysis:
- 🤖 AI-Testing Specialist (Lead): Overall strategy and AI-powered insights
- 🔒 Security Testing Specialist: Vulnerability assessment and compliance
- ♿ Accessibility Testing Expert: WCAG compliance and inclusive design
- 📱 Cross-Platform Testing Engineer: Multi-browser and responsive testing
- 🎯 Performance Testing Engineer: Core Web Vitals and optimization
- 📊 Test Data Management Specialist: Privacy and data handling
- 🔧 QA Tools Integration Expert: Technical implementation
- 🎓 QA Workshop Facilitator: Executive summary and recommendations

Analysis Requirements:
${scopeRequirements}

Deliverables Required:
1. **Website Structure Discovery**: Navigation, forms, interactive elements, content analysis
2. **Technology Stack Identification**: Frameworks, CMS, libraries, hosting analysis
3. **Multi-Persona Quality Assessment**: Each specialist provides domain expertise
4. **Comprehensive Test Strategy**: Automated test recommendations with implementation plan
5. **Executive Quality Report**: Business-focused summary with actionable recommendations
6. **Risk Assessment**: Priority matrix for identified issues and improvements

Output Format:
- Technical analysis suitable for development teams
- Executive summary for business stakeholders  
- Implementation roadmap with effort estimates
- Comparative analysis against industry standards

Generate comprehensive analysis following the Universal Website Testing Framework standards.
`;
  }

  /**
   * Generate test creation prompt for specific website areas
   */
  static generateTestCreationPrompt(
    targetUrl: string, 
    analysisResults: Partial<WebsiteAnalysis>,
    testCategory: string
  ): string {
    const contextBlock = this.getStandardContext(targetUrl);
    
    return `
As a Test Automation Engineer with AI-Testing Specialist support,
generate comprehensive ${testCategory} test suite for ${targetUrl}.

${contextBlock}

Website Analysis Context:
${JSON.stringify(analysisResults, null, 2)}

Test Generation Requirements:
1. **Framework Compliance**: Use Playwright + TypeScript with Page Object Model
2. **Selector Strategy**: Prefer data-test attributes, fallback to stable CSS selectors
3. **Test Isolation**: Each test must be atomic and independent
4. **Error Handling**: Comprehensive try-catch blocks and meaningful assertions
5. **Performance**: Tests should execute efficiently for CI/CD integration
6. **Maintainability**: Clear naming, documentation, and reusable patterns

Specific ${testCategory} Test Requirements:
${this.getCategorySpecificRequirements(testCategory)}

Quality Standards:
- All tests must pass reliably across multiple environments
- Include both positive and negative test scenarios  
- Add meaningful assertions with descriptive error messages
- Follow accessibility testing patterns where applicable
- Include performance benchmarks for critical user journeys

Generate production-ready test code with proper TypeScript types and comprehensive coverage.
`;
  }

  /**
   * Generate quality report generation prompt
   */
  static generateQualityReportPrompt(
    targetUrl: string,
    testResults: any[],
    analysisData: Partial<WebsiteAnalysis>
  ): string {
    const contextBlock = this.getStandardContext(targetUrl);
    
    return `
As a QA Workshop Facilitator collaborating with all QA team personas,
generate an executive quality assessment report for ${targetUrl}.

${contextBlock}

Input Data:
- Test Execution Results: ${testResults.length} tests executed
- Website Analysis: ${JSON.stringify(analysisData, null, 2)}
- Team Perspectives: All 8 QA personas have provided input

Report Requirements:
1. **Executive Summary** (Business-focused):
   - Overall quality score (0-100) with justification
   - Key strengths and critical concerns
   - ROI impact of identified improvements
   - Competitive positioning insights

2. **Technical Findings** (Development-focused):
   - Category scores: Security, Performance, Accessibility, Functionality, UX
   - Detailed test results with pass/fail analysis
   - Technology stack assessment and recommendations
   - Implementation complexity estimates

3. **Actionable Recommendations** (Priority-ordered):
   - Critical issues requiring immediate attention
   - Medium-term optimization opportunities  
   - Long-term strategic improvements
   - Resource requirements and timelines

4. **Risk Assessment**:
   - Security vulnerabilities and compliance gaps
   - Performance bottlenecks and user experience impacts
   - Accessibility barriers and legal compliance concerns
   - Business continuity and reputation risks

Target Audiences:
- C-level executives: Business impact and ROI focus
- Engineering teams: Technical implementation details
- Product managers: User experience and competitive analysis
- Compliance teams: Regulatory and accessibility requirements

Generate comprehensive quality report suitable for multi-stakeholder presentation.
`;
  }

  /**
   * Generate improvement roadmap prompt
   */
  static generateImprovementRoadmapPrompt(
    targetUrl: string,
    qualityFindings: any,
    organizationContext: string = 'general'
  ): string {
    const contextBlock = this.getStandardContext(targetUrl);
    
    return `
As a QA Workshop Facilitator with input from Project Management and DevOps expertise,
create implementation roadmap for ${targetUrl} quality improvements.

${contextBlock}

Quality Assessment Context:
${JSON.stringify(qualityFindings, null, 2)}

Organization Context: ${organizationContext}

Roadmap Requirements:
1. **Prioritization Matrix**:
   - Impact vs. Effort analysis for all recommendations
   - Risk-based prioritization for security and compliance issues
   - Quick wins vs. strategic long-term improvements
   - Dependencies and prerequisite identification

2. **Implementation Phases**:
   - Phase 1 (0-30 days): Critical security fixes and quick wins
   - Phase 2 (1-3 months): Performance optimization and accessibility improvements
   - Phase 3 (3-6 months): Advanced functionality and UX enhancements
   - Phase 4 (6+ months): Strategic platform improvements

3. **Resource Planning**:
   - Developer effort estimates (hours/story points)
   - Required expertise and potential skill gaps
   - Third-party tool or service requirements
   - Budget implications for each improvement category

4. **Success Metrics**:
   - KPIs for measuring improvement effectiveness
   - Testing and validation strategies for each phase
   - Rollback plans for high-risk changes
   - Continuous monitoring and measurement approach

5. **Stakeholder Communication**:
   - Executive status reporting templates
   - Technical team implementation guides
   - User communication for customer-facing changes
   - Compliance and audit documentation requirements

Generate actionable implementation roadmap with clear timelines, responsibilities, and success criteria.
`;
  }

  /**
   * Standard context block for all prompts
   */
  private static getStandardContext(targetUrl: string): string {
    return `
Context for Copilot:
- Project: Swiss Testing Night 2025 - Universal Website Testing Framework
- Target: ${targetUrl}
- Framework: Playwright + TypeScript + Universal Testing Framework
- Architecture: Page Object Model with AI-powered test generation
- Standards: Atomic, isolated, deterministic tests with comprehensive assertions
- Personas: Use all relevant personas from copilot-context/enhanced-qa-team-personas.md
- Strategy: Follow universal-testing-framework approach for comprehensive analysis
- Quality: Production-ready code suitable for CI/CD integration
- Workshop: Results must be demonstrable and educational for QA professionals
- Scope: Complete website quality assessment with actionable business insights
`;
  }

  /**
   * Get scope-specific requirements based on analysis focus
   */
  private static getScopeRequirements(scope: string[]): string {
    const allRequirements = {
      functionality: `
- Navigation flow testing and user journey validation
- Form functionality and validation testing
- Interactive element behavior verification
- Content accuracy and loading validation
- Search and filtering functionality assessment`,
      
      performance: `
- Core Web Vitals measurement (LCP, FID, CLS)
- Page load time analysis and optimization opportunities
- Resource utilization and caching effectiveness
- Mobile performance and responsive design validation
- Third-party script impact assessment`,
      
      accessibility: `
- WCAG 2.1 AA compliance verification
- Screen reader compatibility testing
- Keyboard navigation and focus management
- Color contrast and visual accessibility validation
- Semantic HTML structure and landmark usage`,
      
      security: `
- HTTPS implementation and SSL configuration analysis
- Security headers assessment (CSP, HSTS, X-Frame-Options)
- Input validation and XSS protection testing
- Authentication and session management evaluation
- Data privacy and GDPR compliance assessment`,
      
      responsive: `
- Multi-device and browser compatibility testing
- Responsive design breakpoint validation
- Mobile-first approach assessment
- Touch interaction and gesture support
- Progressive Web App feature evaluation`,
      
      seo: `
- Technical SEO audit (meta tags, structured data)
- Page speed impact on search rankings
- Mobile-friendliness assessment
- Content structure and semantic markup
- Internal linking and navigation optimization`
    };

    if (scope.includes('all')) {
      return Object.values(allRequirements).join('\n');
    }

    return scope.map(s => allRequirements[s] || '').filter(Boolean).join('\n');
  }

  /**
   * Get category-specific test requirements
   */
  private static getCategorySpecificRequirements(category: string): string {
    const requirements = {
      functional: `
- Test all navigation elements and user flows
- Validate form submissions and error handling
- Verify interactive element behavior
- Test search and filtering functionality
- Validate content loading and display`,
      
      performance: `
- Measure and assert Core Web Vitals thresholds
- Test page load times under various conditions
- Validate resource loading optimization
- Test mobile performance benchmarks
- Monitor third-party script performance impact`,
      
      accessibility: `
- Validate WCAG 2.1 AA compliance programmatically
- Test keyboard navigation paths
- Verify screen reader announcements
- Check color contrast ratios
- Validate semantic HTML structure`,
      
      security: `
- Test HTTPS enforcement and redirect behavior
- Validate security headers presence and configuration
- Test input sanitization and XSS protection
- Verify authentication flow security
- Check for information disclosure vulnerabilities`,
      
      responsive: `
- Test responsive breakpoints and layout adaptation
- Validate mobile touch interactions
- Test cross-browser compatibility
- Verify responsive image loading
- Test mobile-specific functionality`
    };

    return requirements[category] || 'Generate comprehensive tests for the specified category.';
  }
}

/**
 * Pre-built prompt templates for common scenarios
 */
export const UNIVERSAL_PROMPTS = {
  
  /**
   * Quick website analysis for workshop demonstrations
   */
  QUICK_ANALYSIS: (url: string) => `
As an AI-Testing Specialist, quickly analyze ${url} for workshop demonstration.

Context for Copilot:
- Target: ${url}
- Framework: Universal Website Testing Framework  
- Scope: High-level quality assessment for 30-minute workshop demo
- Output: Executive summary with key findings and test recommendations

Generate:
1. Technology stack identification
2. Critical functionality assessment  
3. Top 3 quality concerns
4. Recommended test priorities
5. 5-minute demo script for workshop facilitator
`,

  /**
   * Comprehensive enterprise-grade analysis
   */
  ENTERPRISE_ANALYSIS: (url: string) => `
As a comprehensive QA team, conduct enterprise-grade analysis of ${url}.

Context for Copilot:
- Target: ${url}
- Framework: Universal Website Testing Framework
- Scope: Production-ready comprehensive assessment
- Stakeholders: C-level, Engineering, Product, Compliance teams
- Timeline: Full assessment with implementation roadmap

All 8 personas must contribute specialized analysis:
🤖 AI-Testing Specialist: Strategy and automation roadmap
🔒 Security Testing Specialist: Comprehensive vulnerability assessment
♿ Accessibility Testing Expert: WCAG compliance and legal requirements  
📱 Cross-Platform Testing Engineer: Multi-device compatibility matrix
🎯 Performance Testing Engineer: Core Web Vitals and optimization plan
📊 Test Data Management Specialist: Privacy and compliance audit
🔧 QA Tools Integration Expert: Technical implementation architecture
🎓 QA Workshop Facilitator: Executive communication and change management

Generate enterprise-grade assessment suitable for board-level presentation.
`,

  /**
   * Competitive analysis prompt
   */
  COMPETITIVE_ANALYSIS: (primaryUrl: string, competitorUrls: string[]) => `
As a QA team with Business Analysis expertise, conduct competitive analysis.

Primary Target: ${primaryUrl}
Competitors: ${competitorUrls.join(', ')}

Context for Copilot:
- Framework: Universal Website Testing Framework
- Analysis Type: Competitive benchmarking and gap analysis
- Output: Strategic recommendations for competitive advantage

Generate:
1. Feature comparison matrix across all sites
2. Quality benchmark comparison (performance, accessibility, security)
3. User experience differential analysis
4. Technology stack comparison and recommendations
5. Competitive positioning strategy for quality improvements
`
};

export default UniversalWebsiteAnalyzer;

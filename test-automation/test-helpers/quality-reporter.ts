import { Page, test } from '@playwright/test';
import { GenericWebsiteAnalyzer, WebsiteQualityReport } from './website-analyzers/generic-analyzer';
import { createObservableActions } from './observability';
import * as fs from 'fs';
import * as path from 'path';

export class WebsiteQualityReporter {
  private static reportDir = 'test-results/quality-reports';
  private static evidenceDir = 'test-results/evidence';

  static async generateQualityReport(page: Page, url: string): Promise<WebsiteQualityReport> {
    console.log(`📋 Generating comprehensive quality report for: ${url}`);
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Create analyzer and run analysis
    const analyzer = new GenericWebsiteAnalyzer(page);
    const report = await analyzer.analyzeWebsite(url);
    
    // Generate evidence
    await this.generateEvidence(page, report);
    
    // Save detailed report
    await this.saveReport(report);
    
    // Generate summary
    this.generateSummary(report);
    
    return report;
  }

  private static ensureDirectories(): void {
    [this.reportDir, this.evidenceDir, `${this.evidenceDir}/screenshots`, `${this.evidenceDir}/videos`, `${this.evidenceDir}/traces`].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private static async generateEvidence(page: Page, report: WebsiteQualityReport): Promise<void> {
    const timestamp = Date.now();
    const baseFilename = `${new URL(report.website.url).hostname}-${timestamp}`;
    
    try {
      // Full page screenshot
      const screenshotPath = `${this.evidenceDir}/screenshots/${baseFilename}-full.png`;
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        animations: 'disabled'
      });
      report.evidence.screenshots.push(screenshotPath);
      
      // Mobile viewport screenshot
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileScreenshotPath = `${this.evidenceDir}/screenshots/${baseFilename}-mobile.png`;
      await page.screenshot({ 
        path: mobileScreenshotPath, 
        fullPage: true,
        animations: 'disabled'
      });
      report.evidence.screenshots.push(mobileScreenshotPath);
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Video recording (if available)
      if (page.video()) {
        const videoPath = await page.video()?.path();
        if (videoPath) {
          report.evidence.videos.push(videoPath);
        }
      }
      
      console.log(`📸 Evidence collected: ${report.evidence.screenshots.length} screenshots, ${report.evidence.videos.length} videos`);
      
    } catch (error) {
      console.error('Evidence generation failed:', error);
    }
  }

  private static async saveReport(report: WebsiteQualityReport): Promise<void> {
    const timestamp = Date.now();
    const hostname = new URL(report.website.url).hostname;
    const filename = `${hostname}-quality-report-${timestamp}.json`;
    const filepath = path.join(this.reportDir, filename);
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      console.log(`💾 Detailed report saved: ${filepath}`);
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  }

  private static generateSummary(report: WebsiteQualityReport): void {
    console.log(`\n📊 ═══════════════════════════════════════════════════════════════`);
    console.log(`📋 WEBSITE QUALITY REPORT`);
    console.log(`🌐 URL: ${report.website.url}`);
    console.log(`📝 Title: ${report.website.title}`);
    console.log(`⏱️  Load Time: ${report.website.loadTime}ms`);
    console.log(`📅 Analysis Date: ${new Date(report.website.analysisDate).toLocaleString()}`);
    console.log(`═══════════════════════════════════════════════════════════════`);
    
    console.log(`\n🎯 OVERALL SCORE: ${report.overallScore}/100`);
    this.printScoreBar(report.overallScore);
    
    console.log(`\n📈 DETAILED SCORES:`);
    console.log(`   ♿ Accessibility: ${report.accessibility.score}/100`);
    this.printScoreBar(report.accessibility.score, '   ');
    console.log(`   🚀 Performance:  ${report.performance.score}/100`);
    this.printScoreBar(report.performance.score, '   ');
    console.log(`   ⚙️  Functionality: ${report.functionality.score}/100`);
    this.printScoreBar(report.functionality.score, '   ');
    console.log(`   👤 Usability:    ${report.usability.score}/100`);
    this.printScoreBar(report.usability.score, '   ');
    console.log(`   🔒 Security:     ${report.security.score}/100`);
    this.printScoreBar(report.security.score, '   ');
    
    // Key findings
    console.log(`\n🔍 KEY FINDINGS:`);
    
    if (report.accessibility.issues.length > 0) {
      console.log(`   ♿ Accessibility Issues (${report.accessibility.issues.length}):`);
      report.accessibility.issues.slice(0, 3).forEach(issue => {
        console.log(`      • ${issue.description} (${issue.severity})`);
      });
    }
    
    if (report.functionality.brokenFeatures.length > 0) {
      console.log(`   ⚠️  Broken Features:`);
      report.functionality.brokenFeatures.forEach(feature => {
        console.log(`      • ${feature}`);
      });
    }
    
    if (report.functionality.workingFeatures.length > 0) {
      console.log(`   ✅ Working Features:`);
      report.functionality.workingFeatures.slice(0, 3).forEach(feature => {
        console.log(`      • ${feature}`);
      });
    }
    
    // Performance metrics
    console.log(`\n📊 PERFORMANCE METRICS:`);
    console.log(`   • Load Time: ${report.website.loadTime}ms`);
    console.log(`   • DOM Content Loaded: ${report.performance.metrics.domContentLoaded}ms`);
    console.log(`   • First Contentful Paint: ${report.performance.metrics.firstContentfulPaint}ms`);
    console.log(`   • Resource Count: ${report.performance.metrics.resourceCount}`);
    console.log(`   • Total Size: ${(report.performance.metrics.totalSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Top recommendations
    console.log(`\n💡 TOP RECOMMENDATIONS:`);
    const allRecommendations = [
      ...report.accessibility.recommendations,
      ...report.performance.recommendations,
      ...report.functionality.recommendations,
      ...report.usability.recommendations,
      ...report.security.recommendations
    ].slice(0, 5);
    
    allRecommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    // Evidence
    console.log(`\n📁 EVIDENCE COLLECTED:`);
    console.log(`   📸 Screenshots: ${report.evidence.screenshots.length}`);
    console.log(`   🎥 Videos: ${report.evidence.videos.length}`);
    console.log(`   🔍 Traces: ${report.evidence.traces.length}`);
    
    console.log(`\n═══════════════════════════════════════════════════════════════\n`);
  }

  private static printScoreBar(score: number, prefix: string = ''): void {
    const barLength = 20;
    const filledLength = Math.round((score / 100) * barLength);
    const emptyLength = barLength - filledLength;
    
    let color = '🔴'; // Red for poor scores
    if (score >= 70) color = '🟢'; // Green for good scores
    else if (score >= 50) color = '🟡'; // Yellow for average scores
    
    const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
    console.log(`${prefix}${color} [${bar}] ${score}%`);
  }

  static getScoreInterpretation(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    if (score >= 50) return 'Below Average';
    return 'Poor';
  }

  static generateMarkdownReport(report: WebsiteQualityReport): string {
    const timestamp = new Date(report.website.analysisDate).toLocaleString();
    
    return `# Website Quality Report

## Summary
- **URL**: ${report.website.url}
- **Title**: ${report.website.title}
- **Analysis Date**: ${timestamp}
- **Load Time**: ${report.website.loadTime}ms
- **Overall Score**: ${report.overallScore}/100 (${this.getScoreInterpretation(report.overallScore)})

## Detailed Scores

| Category | Score | Status |
|----------|-------|--------|
| ♿ Accessibility | ${report.accessibility.score}/100 | ${this.getScoreInterpretation(report.accessibility.score)} |
| 🚀 Performance | ${report.performance.score}/100 | ${this.getScoreInterpretation(report.performance.score)} |
| ⚙️ Functionality | ${report.functionality.score}/100 | ${this.getScoreInterpretation(report.functionality.score)} |
| 👤 Usability | ${report.usability.score}/100 | ${this.getScoreInterpretation(report.usability.score)} |
| 🔒 Security | ${report.security.score}/100 | ${this.getScoreInterpretation(report.security.score)} |

## Key Findings

### Accessibility Issues
${report.accessibility.issues.length > 0 ? 
  report.accessibility.issues.map(issue => `- **${issue.severity.toUpperCase()}**: ${issue.description}`).join('\n') :
  '✅ No critical accessibility issues detected'
}

### Performance Metrics
- **Load Time**: ${report.website.loadTime}ms
- **DOM Content Loaded**: ${report.performance.metrics.domContentLoaded}ms
- **First Contentful Paint**: ${report.performance.metrics.firstContentfulPaint}ms
- **Resource Count**: ${report.performance.metrics.resourceCount}
- **Total Size**: ${(report.performance.metrics.totalSize / 1024 / 1024).toFixed(2)}MB

### Working Features
${report.functionality.workingFeatures.map(feature => `- ✅ ${feature}`).join('\n')}

### Broken Features
${report.functionality.brokenFeatures.length > 0 ?
  report.functionality.brokenFeatures.map(feature => `- ❌ ${feature}`).join('\n') :
  '✅ No broken features detected'
}

## Recommendations

### Accessibility
${report.accessibility.recommendations.map(rec => `- ${rec}`).join('\n')}

### Performance
${report.performance.recommendations.map(rec => `- ${rec}`).join('\n')}

### Functionality
${report.functionality.recommendations.map(rec => `- ${rec}`).join('\n')}

### Usability
${report.usability.recommendations.map(rec => `- ${rec}`).join('\n')}

### Security
${report.security.recommendations.map(rec => `- ${rec}`).join('\n')}

## Evidence
- **Screenshots**: ${report.evidence.screenshots.length} files
- **Videos**: ${report.evidence.videos.length} files
- **Traces**: ${report.evidence.traces.length} files

---
*Report generated by Swiss Testing Night 2025 AI Quality Assessment Framework*
`;
  }
}

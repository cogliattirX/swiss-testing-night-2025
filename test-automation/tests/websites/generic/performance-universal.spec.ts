import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * Universal Performance Testing Suite
 * 
 * As a Performance Testing Engineer, this suite provides comprehensive
 * performance analysis for any website with Core Web Vitals measurement.
 */

test.describe('Universal Performance Testing', () => {
  const testUrls = [
    'https://www.saucedemo.com/',
    'https://example.com/',
    // Add more URLs as needed for testing
  ];

  testUrls.forEach(url => {
    test(`Performance analysis for ${new URL(url).hostname}`, async ({ page }) => {
      const actions = createObservableActions(page);
      let performanceMetrics: any = {};
      
      console.log(`\n🚀 PERFORMANCE ANALYSIS FOR: ${url}`);
      console.log(`═══════════════════════════════════════════════════════════`);
      
      await test.step('🎯 Core Web Vitals Measurement', async () => {
        // Start performance measurement
        const startTime = Date.now();
        
        await actions.observableGoto(url, `Loading ${url} for performance analysis`);
        
        const loadTime = Date.now() - startTime;
        performanceMetrics.loadTime = loadTime;
        
        console.log(`⏱️  Page Load Time: ${loadTime}ms`);
        
        // Get Core Web Vitals using Performance API
        const vitals = await page.evaluate(() => {
          return new Promise<any>((resolve) => {
            const metrics: any = {};
            
            // First Contentful Paint (FCP)
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
              if (fcpEntry) {
                metrics.fcp = Math.round(fcpEntry.startTime);
              }
            }).observe({ entryTypes: ['paint'] });
            
            // Largest Contentful Paint (LCP)
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              if (lastEntry) {
                metrics.lcp = Math.round(lastEntry.startTime);
              }
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            
            // Cumulative Layout Shift (CLS)
            new PerformanceObserver((list) => {
              let cls = 0;
              for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                  cls += (entry as any).value;
                }
              }
              metrics.cls = cls;
            }).observe({ entryTypes: ['layout-shift'] });
            
            // First Input Delay (FID) - simulation
            metrics.fid = 0; // Would need real user interaction
            
            // Get navigation timing
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigation) {
              metrics.domContentLoaded = Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
              metrics.domInteractive = Math.round(navigation.domInteractive - navigation.fetchStart);
              metrics.loadComplete = Math.round(navigation.loadEventEnd - navigation.fetchStart);
            }
            
            setTimeout(() => resolve(metrics), 2000); // Wait for metrics to be collected
          });
        });
        
        performanceMetrics = { ...performanceMetrics, ...(vitals as any) };
        
        console.log(`🎨 First Contentful Paint: ${(vitals as any).fcp || 'N/A'}ms`);
        console.log(`📊 Largest Contentful Paint: ${(vitals as any).lcp || 'N/A'}ms`);
        console.log(`📐 Cumulative Layout Shift: ${(vitals as any).cls || 'N/A'}`);
        console.log(`⚡ DOM Content Loaded: ${(vitals as any).domContentLoaded || 'N/A'}ms`);
        console.log(`🔄 DOM Interactive: ${(vitals as any).domInteractive || 'N/A'}ms`);
      });
      
      await test.step('📊 Resource Analysis', async () => {
        const resources = await page.evaluate(() => {
          const resourceEntries = performance.getEntriesByType('resource');
          
          const analysis = {
            totalResources: resourceEntries.length,
            scripts: 0,
            stylesheets: 0,
            images: 0,
            fonts: 0,
            other: 0,
            totalSize: 0,
            largestResource: { name: '', size: 0, duration: 0 },
            slowestResource: { name: '', size: 0, duration: 0 }
          };
          
          resourceEntries.forEach((resource: any) => {
            const duration = resource.responseEnd - resource.requestStart;
            const size = resource.transferSize || 0;
            
            // Categorize resources
            if (resource.name.includes('.js')) analysis.scripts++;
            else if (resource.name.includes('.css')) analysis.stylesheets++;
            else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)/)) analysis.images++;
            else if (resource.name.match(/\.(woff|woff2|ttf|otf)/)) analysis.fonts++;
            else analysis.other++;
            
            analysis.totalSize += size;
            
            // Track largest and slowest resources
            if (size > analysis.largestResource.size) {
              analysis.largestResource = { name: resource.name, size, duration };
            }
            
            if (duration > analysis.slowestResource.duration) {
              analysis.slowestResource = { name: resource.name, size, duration };
            }
          });
          
          return analysis;
        });
        
        performanceMetrics.resources = resources;
        
        console.log(`📁 Total Resources: ${resources.totalResources}`);
        console.log(`📜 Scripts: ${resources.scripts}`);
        console.log(`🎨 Stylesheets: ${resources.stylesheets}`);
        console.log(`🖼️  Images: ${resources.images}`);
        console.log(`🔤 Fonts: ${resources.fonts}`);
        console.log(`📦 Total Size: ${(resources.totalSize / 1024 / 1024).toFixed(2)}MB`);
        
        if (resources.largestResource.name) {
          console.log(`🐘 Largest Resource: ${resources.largestResource.name.split('/').pop()} (${(resources.largestResource.size / 1024).toFixed(2)}KB)`);
        }
        
        if (resources.slowestResource.name) {
          console.log(`🐌 Slowest Resource: ${resources.slowestResource.name.split('/').pop()} (${resources.slowestResource.duration.toFixed(2)}ms)`);
        }
      });
      
      await test.step('📱 Mobile Performance Test', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        
        const mobileStartTime = Date.now();
        await page.reload();
        const mobileLoadTime = Date.now() - mobileStartTime;
        
        performanceMetrics.mobileLoadTime = mobileLoadTime;
        
        console.log(`📱 Mobile Load Time: ${mobileLoadTime}ms`);
        
        await actions.screenshot(`${new URL(url).hostname}-mobile-performance`, 'Mobile performance test state');
        
        // Reset to desktop
        await page.setViewportSize({ width: 1280, height: 720 });
      });
      
      await test.step('⚡ Performance Scoring & Recommendations', async () => {
        let performanceScore = 100;
        const recommendations: string[] = [];
        
        // Score FCP (First Contentful Paint)
        const fcp = performanceMetrics.fcp || performanceMetrics.loadTime;
        if (fcp > 3000) {
          performanceScore -= 30;
          recommendations.push('Optimize First Contentful Paint (>3s is poor)');
        } else if (fcp > 1800) {
          performanceScore -= 15;
          recommendations.push('Improve First Contentful Paint (1.8-3s needs improvement)');
        }
        
        // Score LCP (Largest Contentful Paint)
        const lcp = performanceMetrics.lcp || performanceMetrics.loadTime;
        if (lcp > 4000) {
          performanceScore -= 25;
          recommendations.push('Optimize Largest Contentful Paint (>4s is poor)');
        } else if (lcp > 2500) {
          performanceScore -= 10;
          recommendations.push('Improve Largest Contentful Paint (2.5-4s needs improvement)');
        }
        
        // Score CLS (Cumulative Layout Shift)
        const cls = performanceMetrics.cls || 0;
        if (cls > 0.25) {
          performanceScore -= 20;
          recommendations.push('Reduce Cumulative Layout Shift (>0.25 is poor)');
        } else if (cls > 0.1) {
          performanceScore -= 10;
          recommendations.push('Improve Cumulative Layout Shift (0.1-0.25 needs improvement)');
        }
        
        // Score total load time
        if (performanceMetrics.loadTime > 5000) {
          performanceScore -= 15;
          recommendations.push('Optimize total page load time (>5s is slow)');
        } else if (performanceMetrics.loadTime > 3000) {
          performanceScore -= 5;
          recommendations.push('Consider improving total page load time (>3s)');
        }
        
        // Score mobile performance
        if (performanceMetrics.mobileLoadTime > performanceMetrics.loadTime * 1.5) {
          performanceScore -= 10;
          recommendations.push('Optimize mobile performance (significantly slower than desktop)');
        }
        
        // Score resource efficiency
        if (performanceMetrics.resources) {
          const totalSizeMB = performanceMetrics.resources.totalSize / 1024 / 1024;
          if (totalSizeMB > 5) {
            performanceScore -= 15;
            recommendations.push('Reduce total resource size (>5MB is heavy)');
          } else if (totalSizeMB > 2) {
            performanceScore -= 5;
            recommendations.push('Consider reducing resource size (>2MB)');
          }
          
          if (performanceMetrics.resources.totalResources > 100) {
            performanceScore -= 10;
            recommendations.push('Reduce number of HTTP requests (>100 is excessive)');
          }
        }
        
        performanceScore = Math.max(0, performanceScore);
        
        let grade = 'F';
        if (performanceScore >= 90) grade = 'A+';
        else if (performanceScore >= 85) grade = 'A';
        else if (performanceScore >= 80) grade = 'B+';
        else if (performanceScore >= 75) grade = 'B';
        else if (performanceScore >= 70) grade = 'C+';
        else if (performanceScore >= 65) grade = 'C';
        else if (performanceScore >= 60) grade = 'D';
        
        console.log(`\n🏆 PERFORMANCE SUMMARY`);
        console.log(`═══════════════════════════════════════════════════════════`);
        console.log(`🎯 Performance Score: ${performanceScore}/100 (Grade: ${grade})`);
        console.log(`⏱️  Desktop Load: ${performanceMetrics.loadTime}ms`);
        console.log(`📱 Mobile Load: ${performanceMetrics.mobileLoadTime}ms`);
        console.log(`🎨 First Contentful Paint: ${performanceMetrics.fcp || 'N/A'}ms`);
        console.log(`📊 Largest Contentful Paint: ${performanceMetrics.lcp || 'N/A'}ms`);
        console.log(`📐 Cumulative Layout Shift: ${performanceMetrics.cls || 'N/A'}`);
        
        if (recommendations.length > 0) {
          console.log(`\n💡 PERFORMANCE RECOMMENDATIONS:`);
          recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
          });
        } else {
          console.log(`\n✅ Excellent performance! No major recommendations.`);
        }
        
        console.log(`═══════════════════════════════════════════════════════════\n`);
        
        // Assert performance meets basic standards
        expect(performanceScore).toBeGreaterThan(40); // Minimum acceptable score
        
        if (performanceScore < 70) {
          console.warn(`⚠️  Performance score below 70. Consider optimization.`);
        }
      });
    });
  });

  test('Performance regression detection', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Baseline Performance Measurement', async () => {
      console.log('\n📈 PERFORMANCE REGRESSION TESTING');
      console.log('═══════════════════════════════════════════════════════════');
      
      const baselineUrl = 'https://www.saucedemo.com/';
      const measurements: number[] = [];
      
      // Take multiple measurements for statistical validity
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        await actions.observableGoto(baselineUrl, `Performance measurement ${i + 1}/3`);
        const loadTime = Date.now() - startTime;
        measurements.push(loadTime);
        console.log(`Measurement ${i + 1}: ${loadTime}ms`);
        
        if (i < 2) await page.waitForTimeout(1000); // Brief pause between measurements
      }
      
      const averageTime = measurements.reduce((a, b) => a + b) / measurements.length;
      const maxTime = Math.max(...measurements);
      const minTime = Math.min(...measurements);
      const variance = measurements.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / measurements.length;
      const stdDev = Math.sqrt(variance);
      
      console.log(`\n📊 Statistical Analysis:`);
      console.log(`   Average: ${averageTime.toFixed(2)}ms`);
      console.log(`   Min: ${minTime}ms`);
      console.log(`   Max: ${maxTime}ms`);
      console.log(`   Standard Deviation: ${stdDev.toFixed(2)}ms`);
      console.log(`   Variance: ${variance.toFixed(2)}`);
      
      // Performance assertions
      expect(averageTime).toBeLessThan(10000); // Average should be under 10 seconds
      expect(maxTime).toBeLessThan(15000); // No measurement should exceed 15 seconds
      expect(stdDev).toBeLessThan(2000); // Consistency check - std dev under 2 seconds
      
      console.log('✅ Performance regression test completed');
    });
  });
});

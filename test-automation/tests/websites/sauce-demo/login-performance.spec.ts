import { test, expect } from '@playwright/test';

/**
 * Performance Test für Login-Seite
 * 
 * Warum Performance-Tests wichtig sind:
 * 1. Benutzererfahrung: Langsame Seiten führen zu 53% Abbruchrate (Google)
 * 2. Conversion Rate: 1 Sekunde Verzögerung = 7% weniger Conversions
 * 3. SEO: Google verwendet Page Speed als Ranking-Faktor
 * 4. Mobile: 70% der Nutzer erwarten Sub-3-Sekunden-Ladezeiten
 * 5. Kosten: Langsame Seiten verbrauchen mehr Server-Ressourcen
 */

interface PerformanceMetrics {
  // Core Web Vitals - Google's wichtigste UX-Metriken
  lcp: number;  // Largest Contentful Paint - Wahrnehmbare Ladezeit
  fid: number;  // First Input Delay - Interaktivität
  cls: number;  // Cumulative Layout Shift - Visuelle Stabilität
  
  // Weitere wichtige Metriken
  fcp: number;  // First Contentful Paint - Erste sichtbare Inhalte
  ttfb: number; // Time to First Byte - Server-Response-Zeit
  
  // Navigation Timing
  domContentLoaded: number;
  loadComplete: number;
  
  // Ressourcen-Metriken
  transferSize: number;
  resourceCount: number;
}

test.describe('Login Page Performance Tests', () => {
  
  test('sollte Core Web Vitals für Login-Seite messen', async ({ page }) => {
    console.log('🚀 Starte Performance-Messung für Login-Seite...');
    
    // Performance-Observer einrichten
    await page.addInitScript(() => {
      window.performanceMetrics = {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0,
        domContentLoaded: 0,
        loadComplete: 0,
        transferSize: 0,
        resourceCount: 0
      };

      // Core Web Vitals messen
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            window.performanceMetrics.lcp = entry.startTime;
          }
          if (entry.entryType === 'first-input') {
            window.performanceMetrics.fid = (entry as any).processingStart - entry.startTime;
          }
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            window.performanceMetrics.cls += (entry as any).value;
          }
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            window.performanceMetrics.fcp = entry.startTime;
          }
        }
      }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint'] });

      // Navigation Timing
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        window.performanceMetrics.ttfb = navigation.responseStart - navigation.requestStart;
        window.performanceMetrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        window.performanceMetrics.loadComplete = navigation.loadEventEnd - navigation.fetchStart;
        
        // Ressourcen-Metriken
        const resources = performance.getEntriesByType('resource');
        window.performanceMetrics.resourceCount = resources.length;
        window.performanceMetrics.transferSize = resources.reduce((total, resource) => {
          return total + ((resource as PerformanceResourceTiming).transferSize || 0);
        }, 0);
      });
    });

    const startTime = Date.now();
    
    // Seite laden mit Performance-Tracking
    await page.goto('/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Kurz warten, damit alle Metriken erfasst werden
    await page.waitForTimeout(2000);
    
    // Performance-Metriken abrufen
    const metrics = await page.evaluate((): PerformanceMetrics => {
      return window.performanceMetrics;
    });
    
    const totalLoadTime = Date.now() - startTime;
    
    // Performance-Report erstellen
    console.log('📊 PERFORMANCE REPORT - LOGIN SEITE');
    console.log('=====================================');
    console.log(`⏱️  Gesamt-Ladezeit: ${totalLoadTime}ms`);
    console.log('');
    console.log('🎯 CORE WEB VITALS (Google\'s UX-Metriken):');
    console.log(`   LCP (Largest Contentful Paint): ${metrics.lcp.toFixed(2)}ms`);
    console.log(`   ➜ Bewertung: ${evaluateLCP(metrics.lcp)}`);
    console.log(`   FID (First Input Delay): ${metrics.fid.toFixed(2)}ms`);
    console.log(`   ➜ Bewertung: ${evaluateFID(metrics.fid)}`);
    console.log(`   CLS (Cumulative Layout Shift): ${metrics.cls.toFixed(3)}`);
    console.log(`   ➜ Bewertung: ${evaluateCLS(metrics.cls)}`);
    console.log('');
    console.log('📈 WEITERE METRIKEN:');
    console.log(`   FCP (First Contentful Paint): ${metrics.fcp.toFixed(2)}ms`);
    console.log(`   TTFB (Time to First Byte): ${metrics.ttfb.toFixed(2)}ms`);
    console.log(`   DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`   Load Complete: ${metrics.loadComplete.toFixed(2)}ms`);
    console.log('');
    console.log('📦 RESSOURCEN:');
    console.log(`   Anzahl Ressourcen: ${metrics.resourceCount}`);
    console.log(`   Transfer-Größe: ${(metrics.transferSize / 1024).toFixed(2)} KB`);
    console.log('');
    
    // Business Impact berechnen
    const businessImpact = calculateBusinessImpact(metrics, totalLoadTime);
    console.log('💼 BUSINESS IMPACT:');
    console.log(`   Geschätzte Conversion-Rate: ${businessImpact.conversionRate}%`);
    console.log(`   Geschätzte Abbruchrate: ${businessImpact.bounceRate}%`);
    console.log(`   SEO-Score: ${businessImpact.seoScore}/100`);
    console.log(`   Mobile UX-Score: ${businessImpact.mobileScore}/100`);
    console.log('');
    
    // Empfehlungen
    const recommendations = generateRecommendations(metrics, totalLoadTime);
    console.log('🎯 EMPFEHLUNGEN:');
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    // Assertions für automatisierte Tests
    expect(metrics.lcp).toBeLessThan(2500); // Google Empfehlung: < 2.5s
    expect(metrics.fid).toBeLessThan(100);  // Google Empfehlung: < 100ms
    expect(metrics.cls).toBeLessThan(0.1);  // Google Empfehlung: < 0.1
    expect(totalLoadTime).toBeLessThan(3000); // Business Requirement: < 3s
    
    // Metriken für weitere Analyse speichern
    test.info().attach('performance-metrics.json', {
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        url: page.url(),
        metrics,
        totalLoadTime,
        businessImpact,
        recommendations
      }, null, 2),
      contentType: 'application/json'
    });
  });
  
  test('sollte Performance unter verschiedenen Netzwerkbedingungen testen', async ({ page }) => {
    const networkConditions = [
      { name: 'Fast 3G', downloadThroughput: 1.5 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 562.5 },
      { name: 'Slow 3G', downloadThroughput: 500 * 1024 / 8, uploadThroughput: 500 * 1024 / 8, latency: 2000 },
      { name: 'Offline', downloadThroughput: 0, uploadThroughput: 0, latency: 0 }
    ];
    
    for (const condition of networkConditions.slice(0, 2)) { // Skip offline for login test
      console.log(`\n🌐 Teste Performance unter ${condition.name} Bedingungen...`);
      
      // Network throttling einrichten
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: condition.downloadThroughput,
        uploadThroughput: condition.uploadThroughput,
        latency: condition.latency
      });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForSelector('#login-button', { timeout: 15000 });
      const loadTime = Date.now() - startTime;
      
      console.log(`   Ladezeit unter ${condition.name}: ${loadTime}ms`);
      
      // Erwartungen basierend auf Netzwerkbedingungen anpassen
      if (condition.name === 'Fast 3G') {
        expect(loadTime).toBeLessThan(5000);
      } else if (condition.name === 'Slow 3G') {
        expect(loadTime).toBeLessThan(10000);
      }
    }
  });
});

// Hilfsfunktionen für Bewertungen
function evaluateLCP(lcp: number): string {
  if (lcp <= 2500) return '✅ GUT (≤ 2.5s)';
  if (lcp <= 4000) return '⚠️ VERBESSERUNGSBEDARF (2.5-4s)';
  return '❌ SCHLECHT (> 4s)';
}

function evaluateFID(fid: number): string {
  if (fid <= 100) return '✅ GUT (≤ 100ms)';
  if (fid <= 300) return '⚠️ VERBESSERUNGSBEDARF (100-300ms)';
  return '❌ SCHLECHT (> 300ms)';
}

function evaluateCLS(cls: number): string {
  if (cls <= 0.1) return '✅ GUT (≤ 0.1)';
  if (cls <= 0.25) return '⚠️ VERBESSERUNGSBEDARF (0.1-0.25)';
  return '❌ SCHLECHT (> 0.25)';
}

// Business Impact Berechnung
function calculateBusinessImpact(metrics: PerformanceMetrics, totalLoadTime: number) {
  // Basierend auf Studien von Google, Amazon, etc.
  const baseConversionRate = 100;
  const conversionLoss = Math.max(0, (totalLoadTime - 1000) / 1000 * 7); // 7% pro Sekunde
  const conversionRate = Math.max(0, baseConversionRate - conversionLoss);
  
  const bounceRate = Math.min(100, 25 + (totalLoadTime - 1000) / 1000 * 15); // 15% pro Sekunde
  
  // SEO Score basierend auf Core Web Vitals
  let seoScore = 100;
  if (metrics.lcp > 2500) seoScore -= 30;
  if (metrics.fid > 100) seoScore -= 20;
  if (metrics.cls > 0.1) seoScore -= 25;
  if (totalLoadTime > 3000) seoScore -= 25;
  
  // Mobile UX Score
  let mobileScore = 100;
  if (totalLoadTime > 3000) mobileScore -= 40;
  if (metrics.lcp > 2500) mobileScore -= 30;
  if (metrics.transferSize > 500 * 1024) mobileScore -= 20; // 500KB
  
  return {
    conversionRate: Math.round(conversionRate * 100) / 100,
    bounceRate: Math.round(bounceRate * 100) / 100,
    seoScore: Math.max(0, Math.round(seoScore)),
    mobileScore: Math.max(0, Math.round(mobileScore))
  };
}

// Empfehlungen generieren
function generateRecommendations(metrics: PerformanceMetrics, totalLoadTime: number): string[] {
  const recommendations: string[] = [];
  
  if (metrics.lcp > 2500) {
    recommendations.push('LCP optimieren: Bilder komprimieren, kritische Ressourcen priorisieren');
  }
  
  if (metrics.fid > 100) {
    recommendations.push('FID verbessern: JavaScript-Execution reduzieren, Web Workers nutzen');
  }
  
  if (metrics.cls > 0.1) {
    recommendations.push('CLS reduzieren: Größen für Bilder/Videos definieren, dynamische Inhalte vermeiden');
  }
  
  if (metrics.ttfb > 600) {
    recommendations.push('Server-Performance verbessern: Caching, CDN, Datenbank-Optimierung');
  }
  
  if (metrics.transferSize > 500 * 1024) {
    recommendations.push('Bundle-Größe reduzieren: Code-Splitting, Tree-Shaking, Kompression');
  }
  
  if (totalLoadTime > 3000) {
    recommendations.push('Gesamt-Ladezeit optimieren: Resource Hints, Service Worker, Progressive Loading');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Performance ist bereits sehr gut! Weiter so!');
  }
  
  return recommendations;
}

// TypeScript Erweiterung für window object
declare global {
  interface Window {
    performanceMetrics: PerformanceMetrics;
  }
}
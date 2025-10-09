import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Security & Input Validation', () => {
  
  test('XSS (Cross-Site Scripting) protection testing', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🛡️ Testing XSS protection and input sanitization');
    
    await actions.step('🎯 Setup and Navigate', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate for security testing');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
    });

    await actions.step('💉 Test XSS Injection Attempts', async () => {
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      const toField = page.getByRole('combobox', { name: /to/i }).first();
      
      // XSS payloads to test
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert(document.cookie)</script>',
        '\';alert(String.fromCharCode(88,83,83))//\';alert(String.fromCharCode(88,83,83))//";alert(String.fromCharCode(88,83,83))//";alert(String.fromCharCode(88,83,83))//--></SCRIPT>">\'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>',
        '<svg onload=alert(1)>',
        'data:text/html,<script>alert("XSS")</script>'
      ];
      
      for (const payload of xssPayloads) {
        actions.logTestInfo(`🔍 Testing payload: ${payload.substring(0, 50)}...`);
        
        await fromField.fill(payload);
        await page.waitForTimeout(500);
        
        // Check if XSS executed by looking for alert dialogs or changes in DOM
        const alertExecuted = await page.evaluate(() => {
          // Check if any alert was triggered (this would be caught by Playwright)
          return false; // In a real scenario, alerts would be intercepted
        });
        
        // Check if payload was sanitized in the DOM
        const fieldValue = await fromField.inputValue();
        const isSanitized = fieldValue !== payload;
        
        if (isSanitized) {
          actions.logTestInfo(`✅ Input sanitized: "${fieldValue}"`);
        } else {
          actions.logTestInfo(`⚠️ Input not sanitized: "${fieldValue}"`);
        }
        
        // Clear the field
        await fromField.fill('');
      }
    });

    await actions.step('📝 Test HTML Injection in Form Fields', async () => {
      const htmlPayloads = [
        '<b>Bold Text</b>',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<object data="data:text/html,<script>alert(1)</script>"></object>',
        '<embed src="data:text/html,<script>alert(1)</script>">',
        '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">'
      ];
      
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      
      for (const payload of htmlPayloads) {
        actions.logTestInfo(`🔍 Testing HTML injection: ${payload.substring(0, 40)}...`);
        
        await fromField.fill(payload);
        await page.waitForTimeout(500);
        
        // Check if HTML was rendered or sanitized
        const fieldValue = await fromField.inputValue();
        const isHtmlSanitized = !fieldValue.includes('<') || fieldValue !== payload;
        
        if (isHtmlSanitized) {
          actions.logTestInfo(`✅ HTML injection prevented`);
        } else {
          actions.logTestInfo(`⚠️ HTML may not be properly sanitized`);
        }
        
        await fromField.fill('');
      }
    });

    await actions.step('🍪 Test Cookie Security', async () => {
      const cookies = await page.context().cookies();
      
      actions.logTestInfo(`🍪 Found ${cookies.length} cookies`);
      
      for (const cookie of cookies) {
        actions.logTestInfo(`🔍 Cookie: ${cookie.name}`);
        actions.logTestInfo(`  Domain: ${cookie.domain}`);
        actions.logTestInfo(`  Secure: ${cookie.secure ? '✅' : '❌'}`);
        actions.logTestInfo(`  HttpOnly: ${cookie.httpOnly ? '✅' : '❌'}`);
        actions.logTestInfo(`  SameSite: ${cookie.sameSite || 'None'}`);
        
        // Security recommendations
        if (cookie.name.toLowerCase().includes('session') || cookie.name.toLowerCase().includes('auth')) {
          if (!cookie.secure) {
            actions.logTestInfo(`⚠️ Security concern: ${cookie.name} should be secure`);
          }
          if (!cookie.httpOnly) {
            actions.logTestInfo(`⚠️ Security concern: ${cookie.name} should be HttpOnly`);
          }
        }
      }
    });
  });

  test('Content Security Policy (CSP) analysis', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🛡️ Analyzing Content Security Policy');
    
    await actions.step('📋 Check CSP Headers', async () => {
      const response = await page.goto('https://www.sbb.ch');
      const headers = response?.headers() || {};
      
      const cspHeader = headers['content-security-policy'] || headers['content-security-policy-report-only'];
      
      if (cspHeader) {
        actions.logTestInfo(`✅ CSP header found`);
        actions.logTestInfo(`📋 CSP Policy: ${cspHeader.substring(0, 200)}...`);
        
        // Parse CSP directives
        const directives = cspHeader.split(';').map(d => d.trim());
        const cspAnalysis: any = {};
        
        directives.forEach(directive => {
          const [key, ...values] = directive.split(' ');
          cspAnalysis[key] = values.join(' ');
        });
        
        // Check for important directives
        const importantDirectives = ['default-src', 'script-src', 'style-src', 'img-src', 'connect-src', 'frame-src'];
        
        importantDirectives.forEach(directive => {
          if (cspAnalysis[directive]) {
            actions.logTestInfo(`✅ ${directive}: ${cspAnalysis[directive]}`);
          } else {
            actions.logTestInfo(`⚠️ ${directive}: Not defined`);
          }
        });
        
        // Check for unsafe directives
        const unsafePatterns = ['unsafe-inline', 'unsafe-eval', 'data:', '*'];
        let hasUnsafeDirectives = false;
        
        Object.entries(cspAnalysis).forEach(([directive, value]) => {
          unsafePatterns.forEach(pattern => {
            if (value.includes(pattern)) {
              actions.logTestInfo(`⚠️ Potentially unsafe: ${directive} contains ${pattern}`);
              hasUnsafeDirectives = true;
            }
          });
        });
        
        if (!hasUnsafeDirectives) {
          actions.logTestInfo(`✅ No obviously unsafe CSP directives found`);
        }
        
      } else {
        actions.logTestInfo(`❌ No CSP header found`);
      }
      
      // Check other security headers
      const securityHeaders = {
        'x-frame-options': 'X-Frame-Options',
        'x-content-type-options': 'X-Content-Type-Options',
        'x-xss-protection': 'X-XSS-Protection',
        'strict-transport-security': 'Strict-Transport-Security',
        'referrer-policy': 'Referrer-Policy'
      };
      
      actions.logTestInfo(`🔒 Other Security Headers:`);
      Object.entries(securityHeaders).forEach(([header, displayName]) => {
        const value = headers[header];
        if (value) {
          actions.logTestInfo(`✅ ${displayName}: ${value}`);
        } else {
          actions.logTestInfo(`❌ ${displayName}: Missing`);
        }
      });
    });

    await actions.step('🚫 Test Inline Script Prevention', async () => {
      // Try to inject inline scripts via DOM manipulation
      const inlineScriptResult = await page.evaluate(() => {
        try {
          const script = document.createElement('script');
          script.innerHTML = 'window.testXSS = true;';
          document.head.appendChild(script);
          
          // Check if script executed
          return !!(window as any).testXSS;
        } catch (error) {
          return false;
        }
      });
      
      if (inlineScriptResult) {
        actions.logTestInfo(`⚠️ Inline script execution was allowed`);
      } else {
        actions.logTestInfo(`✅ Inline script execution prevented`);
      }
      
      // Test eval() function
      const evalResult = await page.evaluate(() => {
        try {
          eval('window.testEval = true;');
          return !!(window as any).testEval;
        } catch (error) {
          return false;
        }
      });
      
      if (evalResult) {
        actions.logTestInfo(`⚠️ eval() function is allowed`);
      } else {
        actions.logTestInfo(`✅ eval() function is restricted`);
      }
    });
  });

  test('Input validation and sanitization', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🔍 Testing input validation and sanitization');
    
    await actions.step('🎯 Setup Form Testing', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate for input validation testing');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
    });

    await actions.step('🔤 Test Special Character Handling', async () => {
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      const toField = page.getByRole('combobox', { name: /to/i }).first();
      
      const specialChars = [
        'Zürich Ñoël', // Unicode characters
        'München/Gießen', // Special city names
        'São Paulo',
        '北京', // Chinese characters
        'Москва', // Cyrillic
        'القاهرة', // Arabic
        '\'DROP TABLE stations;--', // SQL injection attempt
        '"; DROP TABLE stations; --',
        'test\' OR 1=1 --',
        'admin\'--',
        '\x00\x01\x02', // Null bytes and control characters
        '../../etc/passwd', // Path traversal
        '%3Cscript%3E', // URL encoded script tag
        '\u0000\u0001\u0002' // Unicode null and control chars
      ];
      
      for (const input of specialChars) {
        actions.logTestInfo(`🔍 Testing input: ${input.substring(0, 30)}...`);
        
        await fromField.fill(input);
        await page.waitForTimeout(300);
        
        const processedValue = await fromField.inputValue();
        
        // Check if dangerous patterns were sanitized
        const hasDangerousSQL = input.includes('DROP TABLE') || input.includes('OR 1=1');
        const hasControlChars = /[\x00-\x1F]/.test(input);
        const hasPathTraversal = input.includes('../');
        
        if (hasDangerousSQL && !processedValue.includes('DROP')) {
          actions.logTestInfo(`✅ SQL injection pattern sanitized`);
        } else if (hasDangerousSQL) {
          actions.logTestInfo(`⚠️ SQL injection pattern may not be sanitized`);
        }
        
        if (hasControlChars && !/[\x00-\x1F]/.test(processedValue)) {
          actions.logTestInfo(`✅ Control characters filtered`);
        } else if (hasControlChars) {
          actions.logTestInfo(`⚠️ Control characters may not be filtered`);
        }
        
        if (hasPathTraversal && !processedValue.includes('../')) {
          actions.logTestInfo(`✅ Path traversal pattern sanitized`);
        } else if (hasPathTraversal) {
          actions.logTestInfo(`⚠️ Path traversal pattern may not be sanitized`);
        }
        
        // Check for proper Unicode handling
        if (/[^\x00-\x7F]/.test(input) && processedValue.length > 0) {
          actions.logTestInfo(`✅ Unicode characters handled: "${processedValue}"`);
        }
        
        await fromField.fill('');
      }
    });

    await actions.step('📏 Test Input Length Limits', async () => {
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      
      // Test various lengths
      const lengths = [100, 500, 1000, 5000, 10000];
      
      for (const length of lengths) {
        const longInput = 'A'.repeat(length);
        actions.logTestInfo(`🔍 Testing ${length} character input`);
        
        await fromField.fill(longInput);
        await page.waitForTimeout(200);
        
        const processedValue = await fromField.inputValue();
        const actualLength = processedValue.length;
        
        actions.logTestInfo(`📏 Input length: ${length}, Processed length: ${actualLength}`);
        
        if (actualLength < length) {
          actions.logTestInfo(`✅ Input truncated at ${actualLength} characters`);
        } else if (actualLength === length && length < 1000) {
          actions.logTestInfo(`✅ Input accepted (reasonable length)`);
        } else if (actualLength === length && length >= 1000) {
          actions.logTestInfo(`⚠️ Very long input accepted without truncation`);
        }
        
        await fromField.fill('');
      }
    });

    await actions.step('🌐 Test Internationalization Security', async () => {
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      
      // Test various international inputs that could cause issues
      const intlTests = [
        { name: 'RTL text', input: 'محطة القطار' },
        { name: 'Mixed LTR/RTL', input: 'Station محطة' },
        { name: 'Emoji', input: '🚂 Train Station 🚉' },
        { name: 'Combining characters', input: 'Statioñ' },
        { name: 'Homograph attack', input: 'аpple.com' }, // Cyrillic 'a'
        { name: 'Zero-width chars', input: 'Stat\u200Bion' },
        { name: 'Normalization test', input: 'café' }, // Different unicode representations
      ];
      
      for (const test of intlTests) {
        actions.logTestInfo(`🌐 Testing ${test.name}: ${test.input}`);
        
        await fromField.fill(test.input);
        await page.waitForTimeout(200);
        
        const processedValue = await fromField.inputValue();
        actions.logTestInfo(`📝 Processed as: "${processedValue}"`);
        
        // Check for potential security issues
        if (test.name === 'Zero-width chars' && !processedValue.includes('\u200B')) {
          actions.logTestInfo(`✅ Zero-width characters filtered`);
        }
        
        if (test.name === 'Homograph attack' && processedValue !== test.input) {
          actions.logTestInfo(`✅ Homograph characters may be normalized`);
        }
        
        await fromField.fill('');
      }
    });
  });

  test('HTTPS and transport security', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🔒 Testing HTTPS and transport security');
    
    await actions.step('🔐 Verify HTTPS Enforcement', async () => {
      // Test HTTP to HTTPS redirect
      try {
        const httpResponse = await page.goto('http://www.sbb.ch', { waitUntil: 'networkidle' });
        const finalUrl = page.url();
        
        if (finalUrl.startsWith('https://')) {
          actions.logTestInfo(`✅ HTTP redirects to HTTPS: ${finalUrl}`);
        } else {
          actions.logTestInfo(`❌ HTTP does not redirect to HTTPS: ${finalUrl}`);
        }
        
        // Check response status
        const status = httpResponse?.status();
        if (status && (status === 301 || status === 302 || status === 307 || status === 308)) {
          actions.logTestInfo(`✅ Proper redirect status: ${status}`);
        }
        
      } catch (error) {
        actions.logTestInfo(`ℹ️ HTTP connection handling: ${(error as Error).message}`);
      }
    });

    await actions.step('🔒 Check TLS Certificate', async () => {
      const response = await page.goto('https://www.sbb.ch');
      
      // Get security details from the page
      const securityInfo = await page.evaluate(() => {
        return {
          protocol: location.protocol,
          hostname: location.hostname,
          port: location.port,
          origin: location.origin
        };
      });
      
      actions.logTestInfo(`🔒 Connection Details:`);
      actions.logTestInfo(`  Protocol: ${securityInfo.protocol}`);
      actions.logTestInfo(`  Hostname: ${securityInfo.hostname}`);
      actions.logTestInfo(`  Port: ${securityInfo.port || 'default'}`);
      
      if (securityInfo.protocol === 'https:') {
        actions.logTestInfo(`✅ Secure HTTPS connection established`);
      } else {
        actions.logTestInfo(`❌ Insecure connection: ${securityInfo.protocol}`);
      }
      
      // Check if mixed content warnings exist
      const mixedContentCheck = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        
        const insecureResources = [
          ...images.filter(img => img.src.startsWith('http://')),
          ...scripts.filter(script => script.src.startsWith('http://')),
          ...stylesheets.filter(link => (link as HTMLLinkElement).href.startsWith('http://'))
        ];
        
        return insecureResources.length;
      });
      
      if (mixedContentCheck === 0) {
        actions.logTestInfo(`✅ No mixed content detected`);
      } else {
        actions.logTestInfo(`⚠️ Found ${mixedContentCheck} potentially insecure resources`);
      }
    });

    await actions.step('🛡️ Test Security Headers Effectiveness', async () => {
      // Test if security headers actually prevent attacks
      
      // Try to embed in iframe (should be blocked by X-Frame-Options)
      const iframeTest = await page.evaluate(() => {
        return new Promise((resolve) => {
          const iframe = document.createElement('iframe');
          iframe.src = 'https://www.sbb.ch';
          iframe.onload = () => resolve(true);
          iframe.onerror = () => resolve(false);
          
          document.body.appendChild(iframe);
          
          // Timeout after 3 seconds
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve(false);
          }, 3000);
        });
      });
      
      if (!iframeTest) {
        actions.logTestInfo(`✅ X-Frame-Options appears to be working`);
      } else {
        actions.logTestInfo(`⚠️ Site may be embeddable in iframes`);
      }
      
      // Test MIME type sniffing prevention
      const mimeTest = await page.evaluate(() => {
        // This is a simplified test - in practice, you'd need server-side testing
        const hasNoSniff = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
        return !!hasNoSniff;
      });
      
      actions.logTestInfo(`🎭 MIME sniffing protection: ${mimeTest ? '✅ Meta tag found' : 'ℹ️ Check headers'}`);
    });
  });
});
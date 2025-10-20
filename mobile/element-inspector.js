// 🔍 Live Element Inspector Script
// Führen Sie diesen in der Browser Console aus während der manuellen Tests

const elementInspector = {
    // Start element tracking
    startTracking() {
        console.log('🎬 Element Tracking gestartet...');
        this.actions = [];
        this.setupClickListener();
    },
    
    // Track click events
    setupClickListener() {
        document.addEventListener('click', (event) => {
            const element = event.target;
            const selector = this.generateSelector(element);
            const action = {
                type: 'click',
                selector: selector,
                text: element.textContent?.trim(),
                timestamp: Date.now()
            };
            
            this.actions.push(action);
            console.log('🖱️ Click recorded:', action);
        });
    },
    
    // Generate optimal selector
    generateSelector(element) {
        // Content description (preferred for mobile)
        if (element.getAttribute('content-desc')) {
            return `//android.widget.*[@content-desc="${element.getAttribute('content-desc')}"]`;
        }
        
        // Resource ID  
        if (element.id) {
            return `//*[@resource-id="${element.id}"]`;
        }
        
        // Text content
        if (element.textContent) {
            return `//*[contains(@text, "${element.textContent.trim()}")]`;
        }
        
        // Fallback: generate XPath
        return this.generateXPath(element);
    },
    
    // Generate test code
    generateTestCode() {
        console.log('📝 Generiere Test Code...');
        
        let testCode = `
describe('Generated E2E Test', () => {
    it('should complete recorded workflow', async () => {
        console.log('🚀 Starting recorded test workflow...');
        
`;
        
        this.actions.forEach((action, index) => {
            testCode += `        // Step ${index + 1}: ${action.type}
        const element${index} = await $('${action.selector}');
        await element${index}.${action.type}();
        await browser.pause(1000);
        console.log('✅ Step ${index + 1} completed: ${action.text || 'Element interaction'}');
        
`;
        });
        
        testCode += `    });
});`;
        
        console.log('📋 Generated Test Code:');
        console.log(testCode);
        return testCode;
    },
    
    // Export actions as JSON
    exportActions() {
        const exportData = {
            timestamp: new Date().toISOString(),
            totalActions: this.actions.length,
            actions: this.actions
        };
        
        console.log('📤 Export Data:', JSON.stringify(exportData, null, 2));
        return exportData;
    }
};

// Start tracking
elementInspector.startTracking();

// Expose globally for manual control
window.testRecorder = elementInspector;
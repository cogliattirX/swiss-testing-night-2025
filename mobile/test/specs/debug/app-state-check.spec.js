// Debug Script - Check Current App State
describe('Debug: App State Check', () => {
    
    it('should capture current app state and available elements', async () => {
        console.log('🔍 Starting App State Diagnosis...');
        
        // Wait for app to load
        await browser.pause(3000);
        
        // Get current activity
        try {
            const currentActivity = await browser.getCurrentActivity();
            console.log(`📱 Current Activity: ${currentActivity}`);
        } catch (error) {
            console.log(`❌ Could not get current activity: ${error.message}`);
        }
        
        // Get page source
        try {
            const pageSource = await browser.getPageSource();
            console.log('📄 Page Source (first 500 chars):');
            console.log(pageSource.substring(0, 500));
            
            // Look for key elements
            const keyElements = [
                'Products',
                'My Demo App',
                'Catalog',
                'Login',
                'Cart',
                'Menu',
                'hamburger'
            ];
            
            console.log('\n🔎 Searching for key elements in page source:');
            keyElements.forEach(element => {
                const found = pageSource.includes(element);
                console.log(`${found ? '✅' : '❌'} "${element}": ${found ? 'FOUND' : 'NOT FOUND'}`);
            });
            
        } catch (error) {
            console.log(`❌ Could not get page source: ${error.message}`);
        }
        
        // Try to find any TextView elements
        try {
            const textViews = await $$('//android.widget.TextView');
            console.log(`\n📱 Found ${textViews.length} TextView elements`);
            
            for (let i = 0; i < Math.min(textViews.length, 10); i++) {
                try {
                    const text = await textViews[i].getText();
                    console.log(`📝 TextView ${i + 1}: "${text}"`);
                } catch (err) {
                    console.log(`📝 TextView ${i + 1}: Could not get text`);
                }
            }
        } catch (error) {
            console.log(`❌ Could not find TextViews: ${error.message}`);
        }
        
        // Try to find any Button elements
        try {
            const buttons = await $$('//android.widget.Button');
            console.log(`\n🔘 Found ${buttons.length} Button elements`);
            
            for (let i = 0; i < Math.min(buttons.length, 5); i++) {
                try {
                    const text = await buttons[i].getText();
                    console.log(`🔘 Button ${i + 1}: "${text}"`);
                } catch (err) {
                    console.log(`🔘 Button ${i + 1}: Could not get text`);
                }
            }
        } catch (error) {
            console.log(`❌ Could not find Buttons: ${error.message}`);
        }
        
        console.log('\n🏁 App State Diagnosis Complete');
    });
});
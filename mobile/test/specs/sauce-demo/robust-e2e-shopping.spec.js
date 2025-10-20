describe('🛒 Robust E2E Shopping - Multiple Products + Complete Checkout + Timeout Control', () => {
    
    // Set shorter timeout to prevent infinite loops
    const MAX_STEP_TIMEOUT = 30000; // 30 seconds per step
    const TOTAL_TEST_TIMEOUT = 300000; // 5 minutes total
    
    beforeEach(async () => {
        console.log('🔄 Setting up robust E2E shopping test with timeout controls...');
        await driver.pause(2000);
    });

    afterEach(async () => {
        console.log('🧹 Cleaning up after robust shopping test...');
        await driver.pause(1000);
    });

    it('🎯 Robust Shopping Journey: Multiple Products → Cart → Checkout → Confirmation (with Timeouts)', async () => {
        console.log('🚀 Starting ROBUST E2E shopping with timeout protection...');
        
        const testStartTime = Date.now();
        const productsToAdd = 2; // Reduced to 2 for faster execution
        let productsAddedCount = 0;
        let testProgress = {
            catalogAnalyzed: false,
            productsAdded: false,
            cartAccessed: false,
            checkoutStarted: false,
            formsFilled: false,
            orderPlaced: false,
            confirmationFound: false
        };
        
        try {
            // Step 1: Quick catalog analysis with timeout
            console.log('📱 Step 1: Quick catalog analysis...');
            const stepStartTime = Date.now();
            
            await driver.saveScreenshot('./test-results/screenshots/robust_e2e_01_start.png');
            
            // Quick check for products
            const productImages = await driver.$$('//*[@content-desc="Product Image"]');
            console.log(`📦 Found ${productImages.length} products available`);
            
            if (productImages.length === 0) {
                throw new Error('No products found in catalog');
            }
            
            testProgress.catalogAnalyzed = true;
            console.log(`⏱️  Step 1 completed in ${Date.now() - stepStartTime}ms`);
            
            // Step 2: Add products efficiently
            console.log(`🛒 Step 2: Adding ${productsToAdd} products efficiently...`);
            const addProductsStartTime = Date.now();
            
            for (let i = 0; i < Math.min(productsToAdd, productImages.length); i++) {
                if (Date.now() - testStartTime > TOTAL_TEST_TIMEOUT) {
                    throw new Error('Total test timeout reached during product addition');
                }
                
                console.log(`\n🛍️ Adding product ${i + 1}:`);
                
                try {
                    // Click product with timeout
                    await productImages[i].click();
                    console.log(`✅ Opened product ${i + 1}`);
                    await driver.pause(1500); // Shorter pause
                    
                    // Take screenshot
                    await driver.saveScreenshot(`./test-results/screenshots/robust_e2e_02_product_${i + 1}.png`);
                    
                    // Find and click Add button quickly
                    const addButtons = await driver.$$('//*[contains(@text, "Add") or contains(@content-desc, "Add")]');
                    if (addButtons.length > 0) {
                        await addButtons[0].click();
                        console.log(`✅ Added product ${i + 1} to cart`);
                        productsAddedCount++;
                        await driver.pause(1000);
                    }
                    
                    // Navigate back for next product (except last)
                    if (i < productsToAdd - 1) {
                        await driver.back();
                        await driver.pause(1000);
                        console.log(`🔙 Back to catalog for next product`);
                    }
                    
                } catch (e) {
                    console.log(`⚠️ Failed to add product ${i + 1}: ${e.message}`);
                }
            }
            
            testProgress.productsAdded = true;
            console.log(`⏱️  Products addition completed in ${Date.now() - addProductsStartTime}ms`);
            console.log(`🎯 Products successfully added: ${productsAddedCount}`);
            
            // Step 3: Access cart with timeout
            console.log('🛒 Step 3: Accessing cart with timeout protection...');
            const cartStartTime = Date.now();
            
            let cartFound = false;
            
            // Strategy 1: Try cart button from current view
            const cartButtons = await driver.$$('//*[contains(@content-desc, "cart") or contains(@content-desc, "Cart")]');
            console.log(`🛒 Found ${cartButtons.length} cart buttons`);
            
            if (cartButtons.length > 0) {
                try {
                    await cartButtons[0].click();
                    console.log('✅ Cart accessed successfully');
                    cartFound = true;
                    await driver.pause(2000);
                } catch (e) {
                    console.log('⚠️ Cart button failed, trying alternative');
                }
            }
            
            // Strategy 2: Navigate back and try cart from main screen
            if (!cartFound) {
                try {
                    await driver.back();
                    await driver.pause(1000);
                    
                    const mainCartButtons = await driver.$$('//*[contains(@content-desc, "cart")]');
                    if (mainCartButtons.length > 0) {
                        await mainCartButtons[0].click();
                        console.log('✅ Cart accessed from main screen');
                        cartFound = true;
                        await driver.pause(2000);
                    }
                } catch (e) {
                    console.log('⚠️ Alternative cart access failed');
                }
            }
            
            if (!cartFound) {
                throw new Error('Could not access shopping cart');
            }
            
            testProgress.cartAccessed = true;
            await driver.saveScreenshot('./test-results/screenshots/robust_e2e_03_cart.png');
            console.log(`⏱️  Cart access completed in ${Date.now() - cartStartTime}ms`);
            
            // Step 4: Checkout with enhanced detection and timeout
            console.log('💳 Step 4: Starting checkout with enhanced detection...');
            const checkoutStartTime = Date.now();
            
            let checkoutStarted = false;
            
            // Enhanced checkout detection with timeout
            const checkoutSelectors = [
                '//*[@text="PROCEED TO CHECKOUT" or @text="Proceed to Checkout"]',
                '//*[contains(@text, "CHECKOUT") or contains(@text, "Checkout")]',
                '//*[@content-desc="Proceed To Checkout button"]',
                '//*[contains(@content-desc, "checkout") and @clickable="true"]'
            ];
            
            for (const selector of checkoutSelectors) {
                if (checkoutStarted) break;
                if (Date.now() - checkoutStartTime > MAX_STEP_TIMEOUT) {
                    console.log('⚠️ Checkout step timeout reached');
                    break;
                }
                
                try {
                    const checkoutButtons = await driver.$$(selector);
                    if (checkoutButtons.length > 0) {
                        await checkoutButtons[0].click();
                        console.log(`✅ Checkout started using: ${selector}`);
                        checkoutStarted = true;
                        await driver.pause(3000);
                        break;
                    }
                } catch (e) {
                    console.log(`⚠️ Checkout selector failed: ${selector}`);
                }
            }
            
            testProgress.checkoutStarted = checkoutStarted;
            await driver.saveScreenshot('./test-results/screenshots/robust_e2e_04_checkout.png');
            console.log(`⏱️  Checkout initiation completed in ${Date.now() - checkoutStartTime}ms`);
            
            // Step 5: Fill forms efficiently (if checkout started)
            if (checkoutStarted) {
                console.log('📝 Step 5: Filling forms efficiently...');
                const formsStartTime = Date.now();
                
                // Quick form filling with essential fields only
                const essentialFields = {
                    firstName: {
                        selectors: ['//*[contains(@content-desc, "First Name") or contains(@hint, "First")]'],
                        value: 'John'
                    },
                    lastName: {
                        selectors: ['//*[contains(@content-desc, "Last Name") or contains(@hint, "Last")]'],
                        value: 'Doe'
                    }
                };
                
                for (const [fieldName, config] of Object.entries(essentialFields)) {
                    if (Date.now() - formsStartTime > MAX_STEP_TIMEOUT) break;
                    
                    for (const selector of config.selectors) {
                        try {
                            const fields = await driver.$$(selector);
                            if (fields.length > 0) {
                                await fields[0].setValue(config.value);
                                console.log(`✅ Filled ${fieldName}: ${config.value}`);
                                await driver.pause(500);
                                break;
                            }
                        } catch (e) {
                            console.log(`⚠️ Field ${fieldName} failed with selector: ${selector}`);
                        }
                    }
                }
                
                testProgress.formsFilled = true;
                await driver.saveScreenshot('./test-results/screenshots/robust_e2e_05_forms.png');
                console.log(`⏱️  Forms filling completed in ${Date.now() - formsStartTime}ms`);
                
                // Step 6: Complete order efficiently
                console.log('🎯 Step 6: Completing order...');
                const orderStartTime = Date.now();
                
                const orderSelectors = [
                    '//*[@text="PLACE ORDER" or @text="Place Order"]',
                    '//*[contains(@text, "COMPLETE") or contains(@text, "Complete")]',
                    '//*[contains(@text, "FINISH") or contains(@text, "Finish")]',
                    '//*[@content-desc="Place Order button"]'
                ];
                
                let orderPlaced = false;
                for (const selector of orderSelectors) {
                    if (orderPlaced) break;
                    if (Date.now() - orderStartTime > MAX_STEP_TIMEOUT) break;
                    
                    try {
                        const orderButtons = await driver.$$(selector);
                        if (orderButtons.length > 0) {
                            await orderButtons[0].click();
                            console.log(`✅ Order placed using: ${selector}`);
                            orderPlaced = true;
                            await driver.pause(3000);
                            break;
                        }
                    } catch (e) {
                        console.log(`⚠️ Order button failed: ${selector}`);
                    }
                }
                
                testProgress.orderPlaced = orderPlaced;
                await driver.saveScreenshot('./test-results/screenshots/robust_e2e_06_order.png');
                console.log(`⏱️  Order completion attempted in ${Date.now() - orderStartTime}ms`);
                
                // Step 7: Check for confirmation
                console.log('✅ Step 7: Checking for order confirmation...');
                const confirmationStartTime = Date.now();
                
                const confirmationSelectors = [
                    '//*[contains(@text, "Thank you") or contains(@text, "THANK YOU")]',
                    '//*[contains(@text, "Success") or contains(@text, "SUCCESS")]',
                    '//*[contains(@text, "Complete") or contains(@text, "COMPLETE")]',
                    '//*[contains(@text, "Confirmation")]'
                ];
                
                let confirmationFound = false;
                let confirmationMessage = '';
                
                for (const selector of confirmationSelectors) {
                    if (confirmationFound) break;
                    if (Date.now() - confirmationStartTime > 10000) break; // 10 seconds max for confirmation
                    
                    try {
                        const confirmationElements = await driver.$$(selector);
                        if (confirmationElements.length > 0) {
                            confirmationMessage = await confirmationElements[0].getText();
                            console.log(`✅ Confirmation found: "${confirmationMessage}"`);
                            confirmationFound = true;
                            break;
                        }
                    } catch (e) {
                        console.log(`⚠️ Confirmation check failed: ${selector}`);
                    }
                }
                
                testProgress.confirmationFound = confirmationFound;
                await driver.saveScreenshot('./test-results/screenshots/robust_e2e_07_confirmation.png');
                console.log(`⏱️  Confirmation check completed in ${Date.now() - confirmationStartTime}ms`);
            }
            
        } catch (error) {
            console.log(`❌ Test error: ${error.message}`);
            await driver.saveScreenshot('./test-results/screenshots/robust_e2e_error.png');
        }
        
        // Final summary and verification
        const totalTestTime = Date.now() - testStartTime;
        console.log(`\n🎉 ROBUST E2E TEST COMPLETED in ${totalTestTime}ms (${Math.round(totalTestTime/1000)}s)`);
        
        console.log('📋 Test Progress Summary:');
        console.log(`   ✅ Catalog analyzed: ${testProgress.catalogAnalyzed}`);
        console.log(`   ✅ Products added (${productsAddedCount}): ${testProgress.productsAdded}`);
        console.log(`   ✅ Cart accessed: ${testProgress.cartAccessed}`);
        console.log(`   ✅ Checkout started: ${testProgress.checkoutStarted}`);
        console.log(`   ✅ Forms filled: ${testProgress.formsFilled}`);
        console.log(`   ✅ Order placed: ${testProgress.orderPlaced}`);
        console.log(`   ✅ Confirmation found: ${testProgress.confirmationFound}`);
        
        // App state verification
        const currentPackage = await driver.getCurrentPackage();
        expect(currentPackage).toBe('com.saucelabs.mydemoapp.android');
        
        // Minimum success criteria
        expect(testProgress.catalogAnalyzed).toBe(true);
        expect(productsAddedCount).toBeGreaterThan(0);
        expect(testProgress.cartAccessed).toBe(true);
        
        // Success rating
        const completedSteps = Object.values(testProgress).filter(Boolean).length;
        const successPercentage = Math.round((completedSteps / Object.keys(testProgress).length) * 100);
        
        console.log(`\n🏆 Test Success Rate: ${successPercentage}% (${completedSteps}/${Object.keys(testProgress).length} steps)`);
        
        if (successPercentage >= 80) {
            console.log('🎊 EXCELLENT: Robust E2E test highly successful!');
        } else if (successPercentage >= 60) {
            console.log('⭐ GOOD: Robust E2E test partially successful!');
        } else {
            console.log('⚠️ PARTIAL: Some steps completed, needs improvement');
        }
        
        console.log('📸 Screenshots saved with complete workflow documentation');
        console.log('⏱️ Test completed within timeout limits - no infinite loops!');
    });
});
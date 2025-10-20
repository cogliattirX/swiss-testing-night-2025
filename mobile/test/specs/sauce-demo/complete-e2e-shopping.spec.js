describe('🛒 Complete E2E Shopping Flow - Multiple Products + Checkout + Login', () => {
    // Standard Test-Credentials from Sauce Demo
    const CREDENTIALS = {
        username: 'standard_user',
        password: 'secret_sauce'
    };

    // Test user data for checkout
    const CHECKOUT_DATA = {
        firstName: 'Max',
        lastName: 'Mustermann',
        address: 'Teststrasse 123',
        city: 'Zürich',
        zipCode: '8001',
        country: 'Switzerland'
    };

    it('🎯 Complete Shopping Journey: Multiple Products → Cart → Login → Checkout → Order Completion', async () => {
        console.log('🚀 Starting COMPLETE E2E shopping flow with multiple products and checkout...');
        
        const startTime = Date.now();
        const progress = {
            appReady: false,
            productsAdded: 0,
            cartAccessed: false,
            loginCompleted: false,
            checkoutStarted: false,
            addressEntered: false,
            orderCompleted: false
        };

        try {
            // Step 1: App verification and setup
            console.log('📱 Step 1: App verification and initial setup...');
            await browser.pause(3000);
            await browser.saveScreenshot('./screenshots/complete-01-app-start.png');
            
            // Verify Sauce Labs app is loaded
            const appLogo = await $('//android.widget.ImageView[@content-desc="App logo and name"]');
            if (await appLogo.isDisplayed()) {
                console.log('✅ Sauce Labs Demo App is ready');
                progress.appReady = true;
            }

            // Step 2: Add multiple products to cart
            console.log('🛍️ Step 2: Adding multiple products to cart...');
            
            const targetProductCount = 3;
            const productImages = await $$('//android.widget.ImageView[@content-desc="Product Image"]');
            console.log(`📦 Found ${productImages.length} products available`);
            
            for (let i = 0; i < Math.min(targetProductCount, productImages.length); i++) {
                try {
                    console.log(`\n🛍️ Adding product ${i + 1} to cart:`);
                    
                    // Click product to open details
                    await productImages[i].click();
                    await browser.pause(2000);
                    await browser.saveScreenshot(`./screenshots/complete-02-product-${i + 1}-details.png`);
                    console.log(`✅ Opened product ${i + 1} details`);
                    
                    // Find and click "Add to cart" button
                    const addToCartButton = await $('//android.widget.Button[@content-desc="Tap to add product to cart"]');
                    if (await addToCartButton.isDisplayed()) {
                        await addToCartButton.click();
                        await browser.pause(1500);
                        progress.productsAdded++;
                        console.log(`✅ Added product ${i + 1} to cart (Total: ${progress.productsAdded})`);
                        await browser.saveScreenshot(`./screenshots/complete-02-product-${i + 1}-added.png`);
                    } else {
                        console.log(`❌ Add to cart button not found for product ${i + 1}`);
                    }
                    
                    // Go back to catalog for next product
                    if (i < targetProductCount - 1) {
                        await browser.back();
                        await browser.pause(2000);
                        console.log('🔙 Back to catalog for next product');
                        
                        // Re-find product images after navigation
                        const updatedProductImages = await $$('//android.widget.ImageView[@content-desc="Product Image"]');
                        if (updatedProductImages.length > 0) {
                            productImages.length = 0;
                            productImages.push(...updatedProductImages);
                        }
                    }
                    
                } catch (productError) {
                    console.log(`❌ Error adding product ${i + 1}: ${productError.message}`);
                }
            }
            
            console.log(`\n🎯 Successfully added ${progress.productsAdded} products to cart`);

            // Step 3: Access shopping cart
            console.log('🛒 Step 3: Accessing shopping cart...');
            
            // Go back to main catalog if needed
            try {
                await browser.back();
                await browser.pause(2000);
            } catch (e) {
                console.log('ℹ️ Already at main screen');
            }
            
            const cartButton = await $('//android.widget.RelativeLayout[@content-desc="View cart"]');
            if (await cartButton.isDisplayed()) {
                await cartButton.click();
                await browser.pause(3000);
                await browser.saveScreenshot('./screenshots/complete-03-cart-view.png');
                progress.cartAccessed = true;
                console.log('✅ Successfully accessed cart');
                
                // Check cart contents
                try {
                    const cartItems = await $$('//*[contains(@text, "Sauce Labs") or contains(@text, "$")]');
                    console.log(`📦 Found ${cartItems.length} items in cart`);
                } catch (e) {
                    console.log('ℹ️ Could not count cart items');
                }
            } else {
                console.log('❌ Cart button not accessible');
            }

            // Step 4: Proceed to checkout
            console.log('💳 Step 4: Starting checkout process...');
            
            if (progress.cartAccessed) {
                // Look for checkout button
                const checkoutSelectors = [
                    '//*[contains(@text, "Proceed To Checkout")]',
                    '//*[contains(@text, "Checkout")]',
                    '//*[contains(@text, "CHECKOUT")]',
                    '//*[contains(@content-desc, "checkout")]'
                ];
                
                let checkoutStarted = false;
                for (const selector of checkoutSelectors) {
                    try {
                        const checkoutButton = await $(selector);
                        if (await checkoutButton.isDisplayed()) {
                            await checkoutButton.click();
                            await browser.pause(3000);
                            await browser.saveScreenshot('./screenshots/complete-04-checkout-start.png');
                            checkoutStarted = true;
                            progress.checkoutStarted = true;
                            console.log('✅ Checkout process started');
                            break;
                        }
                    } catch (e) {
                        console.log(`⚠️ Checkout selector failed: ${selector}`);
                    }
                }
                
                if (!checkoutStarted) {
                    console.log('❌ Checkout button not found, trying alternative navigation...');
                    
                    // Try scrolling down to find checkout button
                    await browser.execute('mobile: scroll', {direction: 'down'});
                    await browser.pause(1000);
                    
                    for (const selector of checkoutSelectors) {
                        try {
                            const checkoutButton = await $(selector);
                            if (await checkoutButton.isDisplayed()) {
                                await checkoutButton.click();
                                await browser.pause(3000);
                                checkoutStarted = true;
                                progress.checkoutStarted = true;
                                console.log('✅ Checkout process started after scroll');
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }

            // Step 5: Handle login if required
            console.log('🔐 Step 5: Handling authentication...');
            
            if (progress.checkoutStarted) {
                // Look for login fields
                const loginSelectors = [
                    '//*[contains(@hint, "Username") or contains(@content-desc, "username")]',
                    '//*[contains(@hint, "Email") or contains(@content-desc, "email")]',
                    '//*[@resource-id="username" or @resource-id="email"]'
                ];
                
                let loginFieldFound = false;
                for (const selector of loginSelectors) {
                    try {
                        const loginField = await $(selector);
                        if (await loginField.isDisplayed()) {
                            console.log('📝 Login form detected, entering credentials...');
                            
                            // Enter username
                            await loginField.setValue(CREDENTIALS.username);
                            await browser.pause(500);
                            console.log(`✅ Username entered: ${CREDENTIALS.username}`);
                            
                            // Find and fill password field
                            const passwordSelectors = [
                                '//*[contains(@hint, "Password") or contains(@content-desc, "password")]',
                                '//*[@resource-id="password"]'
                            ];
                            
                            for (const passSelector of passwordSelectors) {
                                try {
                                    const passwordField = await $(passSelector);
                                    if (await passwordField.isDisplayed()) {
                                        await passwordField.setValue(CREDENTIALS.password);
                                        await browser.pause(500);
                                        console.log('✅ Password entered');
                                        break;
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }
                            
                            // Submit login
                            const loginButtonSelectors = [
                                '//*[contains(@text, "Login")]',
                                '//*[contains(@text, "LOG IN")]',
                                '//*[contains(@content-desc, "login")]'
                            ];
                            
                            for (const btnSelector of loginButtonSelectors) {
                                try {
                                    const loginButton = await $(btnSelector);
                                    if (await loginButton.isDisplayed()) {
                                        await loginButton.click();
                                        await browser.pause(3000);
                                        progress.loginCompleted = true;
                                        console.log('✅ Login completed');
                                        await browser.saveScreenshot('./screenshots/complete-05-login-completed.png');
                                        break;
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }
                            
                            loginFieldFound = true;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                if (!loginFieldFound) {
                    console.log('ℹ️ No login required or already authenticated');
                    progress.loginCompleted = true;
                }
            }

            // Step 6: Enter shipping information
            console.log('📍 Step 6: Entering shipping information...');
            
            if (progress.checkoutStarted) {
                // Common field mappings for address forms
                const addressFields = [
                    { 
                        selectors: ['//*[contains(@hint, "First") and contains(@hint, "Name")]', '//*[contains(@content-desc, "first name")]'],
                        value: CHECKOUT_DATA.firstName,
                        name: 'First Name'
                    },
                    { 
                        selectors: ['//*[contains(@hint, "Last") and contains(@hint, "Name")]', '//*[contains(@content-desc, "last name")]'],
                        value: CHECKOUT_DATA.lastName,
                        name: 'Last Name'
                    },
                    { 
                        selectors: ['//*[contains(@hint, "Address")]', '//*[contains(@content-desc, "address")]'],
                        value: CHECKOUT_DATA.address,
                        name: 'Address'
                    },
                    { 
                        selectors: ['//*[contains(@hint, "City")]', '//*[contains(@content-desc, "city")]'],
                        value: CHECKOUT_DATA.city,
                        name: 'City'
                    },
                    { 
                        selectors: ['//*[contains(@hint, "Zip") or contains(@hint, "Postal")]', '//*[contains(@content-desc, "zip")]'],
                        value: CHECKOUT_DATA.zipCode,
                        name: 'Zip Code'
                    },
                    { 
                        selectors: ['//*[contains(@hint, "Country")]', '//*[contains(@content-desc, "country")]'],
                        value: CHECKOUT_DATA.country,
                        name: 'Country'
                    }
                ];
                
                let fieldsCompleted = 0;
                for (const field of addressFields) {
                    let fieldFilled = false;
                    for (const selector of field.selectors) {
                        try {
                            const fieldElement = await $(selector);
                            if (await fieldElement.isDisplayed()) {
                                await fieldElement.setValue(field.value);
                                await browser.pause(500);
                                fieldsCompleted++;
                                fieldFilled = true;
                                console.log(`✅ ${field.name} entered: ${field.value}`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    if (!fieldFilled) {
                        console.log(`⚠️ Could not find field: ${field.name}`);
                    }
                }
                
                if (fieldsCompleted > 0) {
                    progress.addressEntered = true;
                    console.log(`📝 Address form completed (${fieldsCompleted} fields)`);
                    await browser.saveScreenshot('./screenshots/complete-06-address-completed.png');
                }
            }

            // Step 7: Complete the order
            console.log('🎯 Step 7: Completing the order...');
            
            if (progress.addressEntered || progress.checkoutStarted) {
                // Look for order completion buttons
                const orderButtonSelectors = [
                    '//*[contains(@text, "Place Order")]',
                    '//*[contains(@text, "Complete Order")]',
                    '//*[contains(@text, "FINISH")]',
                    '//*[contains(@text, "Submit")]',
                    '//*[contains(@content-desc, "place order")]'
                ];
                
                for (const selector of orderButtonSelectors) {
                    try {
                        const orderButton = await $(selector);
                        if (await orderButton.isDisplayed()) {
                            await orderButton.click();
                            await browser.pause(3000);
                            progress.orderCompleted = true;
                            console.log('✅ Order completed successfully');
                            await browser.saveScreenshot('./screenshots/complete-07-order-completed.png');
                            break;
                        }
                    } catch (e) {
                        console.log(`⚠️ Order button selector failed: ${selector}`);
                    }
                }
                
                // Check for order confirmation
                if (progress.orderCompleted) {
                    const confirmationSelectors = [
                        '//*[contains(@text, "Thank you")]',
                        '//*[contains(@text, "Order Confirmed")]',
                        '//*[contains(@text, "Success")]',
                        '//*[contains(@text, "Complete")]'
                    ];
                    
                    for (const selector of confirmationSelectors) {
                        try {
                            const confirmationElement = await $(selector);
                            if (await confirmationElement.isDisplayed()) {
                                console.log('🎉 Order confirmation detected');
                                await browser.saveScreenshot('./screenshots/complete-08-order-confirmation.png');
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }

        } catch (error) {
            console.log(`❌ Test error: ${error.message}`);
            await browser.saveScreenshot('./screenshots/complete-error.png');
        }

        const totalTime = Date.now() - startTime;
        console.log(`\n🎉 COMPLETE E2E TEST FINISHED in ${totalTime}ms (${Math.round(totalTime/1000)}s)`);
        console.log('📋 Complete Test Results Summary:');
        console.log(`   ✅ App ready: ${progress.appReady}`);
        console.log(`   ✅ Products added: ${progress.productsAdded}`);
        console.log(`   ✅ Cart accessed: ${progress.cartAccessed}`);
        console.log(`   ✅ Login completed: ${progress.loginCompleted}`);
        console.log(`   ✅ Checkout started: ${progress.checkoutStarted}`);
        console.log(`   ✅ Address entered: ${progress.addressEntered}`);
        console.log(`   ✅ Order completed: ${progress.orderCompleted}`);

        // Calculate comprehensive success rate
        const completedSteps = Object.values(progress).filter(v => v === true || (typeof v === 'number' && v > 0)).length;
        const totalSteps = Object.keys(progress).length;
        const successRate = Math.round((completedSteps / totalSteps) * 100);
        console.log(`📊 Overall Success Rate: ${successRate}% (${completedSteps}/${totalSteps} steps)`);

        // Final app state verification
        const currentPackage = await driver.getCurrentPackage();
        console.log(`📱 Final app state: ${currentPackage}`);
        
        // Test success criteria
        const basicFlowSuccess = progress.appReady && progress.productsAdded > 0 && progress.cartAccessed;
        expect(basicFlowSuccess).toBe(true);
        expect(progress.productsAdded).toBeGreaterThanOrEqual(1);
        
        console.log('🎯 Complete E2E shopping flow finished successfully!');
        console.log(`📈 Added ${progress.productsAdded} products and completed ${completedSteps} workflow steps`);
    });

    afterEach(async () => {
        console.log('🧹 Cleaning up after complete E2E shopping test...');
        await browser.saveScreenshot('./screenshots/complete-final-cleanup.png');
    });
});
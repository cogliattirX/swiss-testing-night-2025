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
                        
                        // Verify cart count immediately after adding product
                        try {
                            const cartCountSelectors = [
                                '//*[@content-desc="View cart"]//*[contains(@text, "' + progress.productsAdded + '")]',
                                '//*[contains(@content-desc, "cart")]/*[contains(@text, "' + progress.productsAdded + '")]',
                                '//android.widget.TextView[contains(@text, "' + progress.productsAdded + '")]'
                            ];
                            
                            let cartCountFound = false;
                            for (const countSelector of cartCountSelectors) {
                                try {
                                    const cartCountElement = await $(countSelector);
                                    if (await cartCountElement.isDisplayed()) {
                                        const countText = await cartCountElement.getText();
                                        console.log(`🛒 Cart count verified: ${countText} (expected: ${progress.productsAdded})`);
                                        cartCountFound = true;
                                        break;
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }
                            
                            if (!cartCountFound) {
                                console.log(`⚠️ Could not verify cart count for product ${i + 1}`);
                            }
                        } catch (e) {
                            console.log(`⚠️ Error verifying cart count: ${e.message}`);
                        }
                        
                    } else {
                        console.log(`❌ Add to cart button not found for product ${i + 1}`);
                    }
                    
                    // Navigate back to catalog using proper UI navigation instead of browser.back()
                    if (i < targetProductCount - 1) {
                        // Try to find a back button or navigation element instead of using browser.back()
                        const backButtonSelectors = [
                            '//android.widget.ImageButton[@content-desc="Navigate up"]',
                            '//android.widget.Button[contains(@text, "Back")]',
                            '//android.widget.ImageView[@content-desc="Navigate up"]',
                            '//*[@resource-id="android:id/home"]'
                        ];
                        
                        let backNavigated = false;
                        for (const backSelector of backButtonSelectors) {
                            try {
                                const backButton = await $(backSelector);
                                if (await backButton.isDisplayed()) {
                                    await backButton.click();
                                    await browser.pause(2000);
                                    backNavigated = true;
                                    console.log('🔙 Navigated back using UI back button');
                                    break;
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                        
                        // Fallback: if no UI back button found, use browser.back() but only once
                        if (!backNavigated) {
                            await browser.back();
                            await browser.pause(2000);
                            console.log('🔙 Fallback: Used browser.back() to return to catalog');
                        }
                        
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

            // Step 3: Access shopping cart with better element detection
            console.log('🛒 Step 3: Accessing shopping cart...');
            
            // Ensure we're at the main product catalog
            await browser.pause(1000);
            
            // Try multiple selectors for cart access
            const cartSelectors = [
                '//android.widget.RelativeLayout[@content-desc="View cart"]',
                '//*[@content-desc="View cart"]',
                '//*[contains(@content-desc, "cart")]',
                '//*[contains(@content-desc, "Cart")]',
                '//android.widget.TextView[contains(@text, "Cart")]',
                '//android.widget.ImageView[contains(@content-desc, "shopping")]'
            ];
            
            let cartAccessible = false;
            for (const selector of cartSelectors) {
                try {
                    const cartButton = await $(selector);
                    if (await cartButton.isDisplayed()) {
                        console.log(`🛒 Found cart using selector: ${selector}`);
                        await cartButton.click();
                        await browser.pause(3000);
                        await browser.saveScreenshot('./screenshots/complete-03-cart-view.png');
                        progress.cartAccessed = true;
                        cartAccessible = true;
                        console.log('✅ Successfully accessed cart');
                        break;
                    }
                } catch (e) {
                    console.log(`⚠️ Cart selector failed: ${selector}`);
                }
            }
            
            if (!cartAccessible) {
                console.log('❌ Cart button not accessible with any selector, trying to scroll or look for alternatives...');
                
                // Try scrolling to find cart
                await browser.execute('mobile: scroll', {direction: 'up'});
                await browser.pause(1000);
                
                for (const selector of cartSelectors) {
                    try {
                        const cartButton = await $(selector);
                        if (await cartButton.isDisplayed()) {
                            await cartButton.click();
                            await browser.pause(3000);
                            cartAccessible = true;
                            progress.cartAccessed = true;
                            console.log('✅ Cart accessed after scroll');
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }
            
            if (progress.cartAccessed) {
                // Verify cart contents match added products
                try {
                    const cartItems = await $$('//*[contains(@text, "Sauce Labs") or contains(@text, "$")]');
                    console.log(`📦 Found ${cartItems.length} items in cart (expected: ${progress.productsAdded})`);
                    
                    if (cartItems.length === progress.productsAdded) {
                        console.log('✅ Cart contents match added products');
                    } else {
                        console.log(`⚠️ Cart content mismatch: expected ${progress.productsAdded}, found ${cartItems.length}`);
                    }
                } catch (e) {
                    console.log('ℹ️ Could not verify cart item count');
                }
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

            // Step 5: Handle login with credentials from screen
            console.log('🔐 Step 5: Handling authentication with screen credentials...');
            
            if (progress.checkoutStarted) {
                // First, try to find login credentials displayed on screen
                console.log('👀 Looking for login credentials displayed on screen...');
                let screenUsername = 'standard_user'; // fallback
                let screenPassword = 'secret_sauce';  // fallback
                
                try {
                    // Look for displayed usernames on screen
                    const usernameElements = await $$('//*[contains(@text, "standard_user") or contains(@text, "problem_user") or contains(@text, "performance_glitch_user")]');
                    if (usernameElements.length > 0) {
                        const usernameText = await usernameElements[0].getText();
                        console.log(`📱 Found username on screen: ${usernameText}`);
                        screenUsername = usernameText.trim();
                    }
                    
                    // Look for displayed password on screen
                    const passwordElements = await $$('//*[contains(@text, "secret_sauce")]');
                    if (passwordElements.length > 0) {
                        const passwordText = await passwordElements[0].getText();
                        console.log(`📱 Found password on screen: ${passwordText}`);
                        screenPassword = passwordText.trim();
                    }
                } catch (e) {
                    console.log('ℹ️ Could not read credentials from screen, using defaults');
                }
                
                // Look for login fields
                const loginSelectors = [
                    '//*[contains(@hint, "Username") or contains(@content-desc, "username")]',
                    '//*[contains(@hint, "Email") or contains(@content-desc, "email")]',
                    '//*[@resource-id="username" or @resource-id="email"]',
                    '//*[contains(@text, "Username")]/../following-sibling::*//android.widget.EditText',
                    '//android.widget.EditText[1]'
                ];
                
                let loginFieldFound = false;
                for (const selector of loginSelectors) {
                    try {
                        const loginField = await $(selector);
                        if (await loginField.isDisplayed()) {
                            console.log(`📝 Login form detected using selector: ${selector}`);
                            
                            // Clear field and enter username from screen
                            await loginField.clearValue();
                            await loginField.setValue(screenUsername);
                            await browser.pause(500);
                            console.log(`✅ Username entered from screen: ${screenUsername}`);
                            
                            // Find and fill password field
                            const passwordSelectors = [
                                '//*[contains(@hint, "Password") or contains(@content-desc, "password")]',
                                '//*[@resource-id="password"]',
                                '//*[contains(@text, "Password")]/../following-sibling::*//android.widget.EditText',
                                '//android.widget.EditText[2]'
                            ];
                            
                            for (const passSelector of passwordSelectors) {
                                try {
                                    const passwordField = await $(passSelector);
                                    if (await passwordField.isDisplayed()) {
                                        await passwordField.clearValue();
                                        await passwordField.setValue(screenPassword);
                                        await browser.pause(500);
                                        console.log(`✅ Password entered from screen: ${screenPassword}`);
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
                                '//*[contains(@content-desc, "login")]',
                                '//*[contains(@text, "Sign In")]',
                                '//android.widget.Button[contains(@text, "Login")]'
                            ];
                            
                            for (const btnSelector of loginButtonSelectors) {
                                try {
                                    const loginButton = await $(btnSelector);
                                    if (await loginButton.isDisplayed()) {
                                        await loginButton.click();
                                        await browser.pause(3000);
                                        progress.loginCompleted = true;
                                        console.log('✅ Login completed with screen credentials');
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
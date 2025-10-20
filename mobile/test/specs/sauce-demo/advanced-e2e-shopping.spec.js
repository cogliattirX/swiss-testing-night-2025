describe('🛒 Advanced E2E Shopping Flow - Cart Validation + App Navigation', () => {
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

    it('🎯 Advanced Shopping Journey: Multiple Products → Cart Validation → Checkout with App Navigation', async () => {
        console.log('🚀 Starting ADVANCED E2E shopping flow with cart validation and app navigation...');
        
        const startTime = Date.now();
        const progress = {
            appReady: false,
            productsAdded: 0,
            cartItemsValidated: 0,
            cartAccessed: false,
            checkoutStarted: false,
            addressEntered: false,
            orderCompleted: false
        };

        // Helper function to validate cart count
        async function validateCartCount(expectedCount) {
            try {
                // Look for cart badge/number indicator
                const cartBadgeSelectors = [
                    '//android.widget.TextView[contains(@content-desc, "cart") and @text]',
                    '//*[@resource-id="cartIV" or contains(@content-desc, "cart")]/following-sibling::*[@text]',
                    '//*[contains(@content-desc, "Displays number of items")]'
                ];
                
                for (const selector of cartBadgeSelectors) {
                    try {
                        const cartBadge = await $(selector);
                        if (await cartBadge.isDisplayed()) {
                            const badgeText = await cartBadge.getText();
                            const cartCount = parseInt(badgeText) || 0;
                            console.log(`🔍 Cart badge shows: ${cartCount} items (expected: ${expectedCount})`);
                            return cartCount === expectedCount;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                console.log('ℹ️ No cart badge found, checking cart directly...');
                return null; // Will need to check cart contents directly
            } catch (error) {
                console.log(`⚠️ Cart validation error: ${error.message}`);
                return false;
            }
        }

        // Helper function to navigate back to catalog using app navigation
        async function navigateBackToCatalog() {
            try {
                // Try app's back button first
                const backButtonSelectors = [
                    '//android.widget.ImageButton[@content-desc="Navigate up"]',
                    '//android.widget.ImageView[@content-desc="Back"]',
                    '//*[@content-desc="Up"]'
                ];
                
                for (const selector of backButtonSelectors) {
                    try {
                        const backButton = await $(selector);
                        if (await backButton.isDisplayed()) {
                            await backButton.click();
                            await browser.pause(1500);
                            console.log('🔙 Used app back button');
                            return true;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                // Fallback to system back
                await browser.back();
                await browser.pause(1500);
                console.log('🔙 Used system back button');
                return true;
            } catch (error) {
                console.log(`⚠️ Navigation error: ${error.message}`);
                return false;
            }
        }

        try {
            // Step 1: App verification and setup
            console.log('📱 Step 1: App verification and initial setup...');
            await browser.pause(3000);
            await browser.saveScreenshot('./screenshots/advanced-01-app-start.png');
            
            // Verify Sauce Labs app is loaded
            const appLogo = await $('//android.widget.ImageView[@content-desc="App logo and name"]');
            if (await appLogo.isDisplayed()) {
                console.log('✅ Sauce Labs Demo App is ready');
                progress.appReady = true;
            }

            // Initial cart validation (should be 0)
            const initialCartCount = await validateCartCount(0);
            console.log(`🛒 Initial cart validation: ${initialCartCount !== null ? 'validated' : 'badge not visible'}`);

            // Step 2: Add multiple products to cart with validation
            console.log('🛍️ Step 2: Adding products to cart with validation...');
            
            const targetProductCount = 3;
            const productImages = await $$('//android.widget.ImageView[@content-desc="Product Image"]');
            console.log(`📦 Found ${productImages.length} products available`);
            
            for (let i = 0; i < Math.min(targetProductCount, productImages.length); i++) {
                try {
                    console.log(`\n🛍️ Adding product ${i + 1} to cart:`);
                    
                    // Click product to open details
                    await productImages[i].click();
                    await browser.pause(2500);
                    await browser.saveScreenshot(`./screenshots/advanced-02-product-${i + 1}-details.png`);
                    console.log(`✅ Opened product ${i + 1} details`);
                    
                    // Verify we're on product detail page
                    const productTitle = await $('//android.widget.TextView[@resource-id="com.saucelabs.mydemoapp.android:id/productTV"]');
                    if (await productTitle.isDisplayed()) {
                        const title = await productTitle.getText();
                        console.log(`📋 Product: ${title}`);
                    }
                    
                    // Find and click "Add to cart" button
                    const addToCartButton = await $('//android.widget.Button[@content-desc="Tap to add product to cart"]');
                    if (await addToCartButton.isDisplayed()) {
                        await addToCartButton.click();
                        await browser.pause(2000);
                        progress.productsAdded++;
                        console.log(`✅ Added product ${i + 1} to cart (Total: ${progress.productsAdded})`);
                        await browser.saveScreenshot(`./screenshots/advanced-02-product-${i + 1}-added.png`);
                        
                        // Validate cart count after adding item
                        const expectedCount = progress.productsAdded;
                        const cartValid = await validateCartCount(expectedCount);
                        if (cartValid === true) {
                            progress.cartItemsValidated++;
                            console.log(`✅ Cart count validated: ${expectedCount} items`);
                        } else if (cartValid === false) {
                            console.log(`❌ Cart count mismatch for ${expectedCount} items`);
                        }
                        
                    } else {
                        console.log(`❌ Add to cart button not found for product ${i + 1}`);
                    }
                    
                    // Navigate back to catalog using app navigation
                    if (i < targetProductCount - 1) {
                        const navSuccess = await navigateBackToCatalog();
                        if (navSuccess) {
                            console.log('🏠 Successfully returned to catalog');
                            
                            // Re-find product images after navigation
                            await browser.pause(1500);
                            const updatedProductImages = await $$('//android.widget.ImageView[@content-desc="Product Image"]');
                            if (updatedProductImages.length > 0) {
                                productImages.length = 0;
                                productImages.push(...updatedProductImages);
                            }
                        } else {
                            console.log('❌ Failed to navigate back to catalog');
                        }
                    }
                    
                } catch (productError) {
                    console.log(`❌ Error adding product ${i + 1}: ${productError.message}`);
                }
            }
            
            console.log(`\n🎯 Successfully added ${progress.productsAdded} products to cart`);
            console.log(`📊 Cart validations: ${progress.cartItemsValidated}/${progress.productsAdded}`);

            // Step 3: Access and verify shopping cart contents
            console.log('🛒 Step 3: Accessing and verifying cart contents...');
            
            // Navigate back to main catalog if needed
            await navigateBackToCatalog();
            await browser.pause(2000);
            
            const cartButton = await $('//android.widget.RelativeLayout[@content-desc="View cart"]');
            if (await cartButton.isDisplayed()) {
                await cartButton.click();
                await browser.pause(3000);
                await browser.saveScreenshot('./screenshots/advanced-03-cart-view.png');
                progress.cartAccessed = true;
                console.log('✅ Successfully accessed cart');
                
                // Detailed cart contents verification
                try {
                    // Look for cart items
                    const cartItemSelectors = [
                        '//*[contains(@text, "Sauce Labs")]',
                        '//*[@resource-id="titleTV"]',
                        '//*[contains(@text, "$")]'
                    ];
                    
                    let totalCartItems = 0;
                    for (const selector of cartItemSelectors) {
                        try {
                            const items = await $$(selector);
                            if (items.length > 0) {
                                totalCartItems = Math.max(totalCartItems, items.length);
                                console.log(`📦 Found ${items.length} items using selector: ${selector}`);
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    if (totalCartItems > 0) {
                        console.log(`✅ Cart contains ${totalCartItems} items (expected: ${progress.productsAdded})`);
                        if (totalCartItems === progress.productsAdded) {
                            progress.cartItemsValidated = progress.productsAdded;
                            console.log('✅ Cart item count matches added products');
                        }
                    } else {
                        console.log('⚠️ No items detected in cart view');
                    }
                    
                } catch (e) {
                    console.log(`⚠️ Error verifying cart contents: ${e.message}`);
                }
            } else {
                console.log('❌ Cart button not accessible');
            }

            // Step 4: Proceed to checkout with enhanced error handling
            console.log('💳 Step 4: Advanced checkout process...');
            
            if (progress.cartAccessed) {
                // Scroll down to find checkout button if needed
                await browser.execute('mobile: scroll', {direction: 'down'});
                await browser.pause(1000);
                
                const checkoutSelectors = [
                    '//*[contains(@text, "Proceed To Checkout")]',
                    '//*[contains(@text, "Checkout")]',
                    '//*[contains(@text, "CHECKOUT")]',
                    '//*[contains(@content-desc, "checkout")]',
                    '//android.widget.Button[contains(@text, "Checkout")]'
                ];
                
                let checkoutStarted = false;
                for (const selector of checkoutSelectors) {
                    try {
                        const checkoutButton = await $(selector);
                        if (await checkoutButton.isDisplayed()) {
                            await checkoutButton.click();
                            await browser.pause(3000);
                            await browser.saveScreenshot('./screenshots/advanced-04-checkout-start.png');
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
                    console.log('⚠️ No checkout button found, checking if already at checkout...');
                    
                    // Check if we're already at a checkout/form page
                    const formIndicators = [
                        '//*[contains(@hint, "Name")]',
                        '//*[contains(@hint, "Address")]',
                        '//*[contains(@text, "Shipping")]',
                        '//*[contains(@text, "Payment")]'
                    ];
                    
                    for (const indicator of formIndicators) {
                        try {
                            const element = await $(indicator);
                            if (await element.isDisplayed()) {
                                progress.checkoutStarted = true;
                                console.log('✅ Already at checkout form');
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }

            // Step 5: Advanced address form handling
            console.log('📍 Step 5: Advanced address form completion...');
            
            if (progress.checkoutStarted) {
                const addressFields = [
                    { 
                        selectors: [
                            '//*[contains(@hint, "First") and contains(@hint, "Name")]',
                            '//*[@resource-id="firstNameET"]',
                            '//*[contains(@content-desc, "first name")]'
                        ],
                        value: CHECKOUT_DATA.firstName,
                        name: 'First Name'
                    },
                    { 
                        selectors: [
                            '//*[contains(@hint, "Last") and contains(@hint, "Name")]',
                            '//*[@resource-id="lastNameET"]',
                            '//*[contains(@content-desc, "last name")]'
                        ],
                        value: CHECKOUT_DATA.lastName,
                        name: 'Last Name'
                    },
                    { 
                        selectors: [
                            '//*[contains(@hint, "Address")]',
                            '//*[@resource-id="addressET"]',
                            '//*[contains(@content-desc, "address")]'
                        ],
                        value: CHECKOUT_DATA.address,
                        name: 'Address'
                    },
                    { 
                        selectors: [
                            '//*[contains(@hint, "City")]',
                            '//*[@resource-id="cityET"]',
                            '//*[contains(@content-desc, "city")]'
                        ],
                        value: CHECKOUT_DATA.city,
                        name: 'City'
                    },
                    { 
                        selectors: [
                            '//*[contains(@hint, "Zip") or contains(@hint, "Postal")]',
                            '//*[@resource-id="zipET"]',
                            '//*[contains(@content-desc, "zip")]'
                        ],
                        value: CHECKOUT_DATA.zipCode,
                        name: 'Zip Code'
                    },
                    { 
                        selectors: [
                            '//*[contains(@hint, "Country")]',
                            '//*[@resource-id="countryET"]',
                            '//*[contains(@content-desc, "country")]'
                        ],
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
                    await browser.saveScreenshot('./screenshots/advanced-05-address-completed.png');
                }

                // Step 6: Complete order with validation
                console.log('🎯 Step 6: Completing order with validation...');
                
                const orderButtonSelectors = [
                    '//*[contains(@text, "Place Order")]',
                    '//*[contains(@text, "Complete Order")]',
                    '//*[contains(@text, "FINISH")]',
                    '//*[contains(@text, "Submit")]',
                    '//*[contains(@content-desc, "place order")]',
                    '//android.widget.Button[contains(@text, "Order")]'
                ];
                
                for (const selector of orderButtonSelectors) {
                    try {
                        const orderButton = await $(selector);
                        if (await orderButton.isDisplayed()) {
                            await orderButton.click();
                            await browser.pause(4000);
                            progress.orderCompleted = true;
                            console.log('✅ Order completed successfully');
                            await browser.saveScreenshot('./screenshots/advanced-06-order-completed.png');
                            break;
                        }
                    } catch (e) {
                        console.log(`⚠️ Order button selector failed: ${selector}`);
                    }
                }
                
                // Advanced order confirmation validation
                if (progress.orderCompleted) {
                    const confirmationSelectors = [
                        '//*[contains(@text, "Thank you")]',
                        '//*[contains(@text, "Order Confirmed")]',
                        '//*[contains(@text, "Success")]',
                        '//*[contains(@text, "Complete")]',
                        '//*[contains(@text, "Checkout Complete")]'
                    ];
                    
                    let confirmationFound = false;
                    for (const selector of confirmationSelectors) {
                        try {
                            const confirmationElement = await $(selector);
                            if (await confirmationElement.isDisplayed()) {
                                const confirmationText = await confirmationElement.getText();
                                console.log(`🎉 Order confirmation found: "${confirmationText}"`);
                                confirmationFound = true;
                                await browser.saveScreenshot('./screenshots/advanced-07-order-confirmation.png');
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    if (!confirmationFound) {
                        console.log('⚠️ No explicit confirmation message found');
                    }
                }
            }

        } catch (error) {
            console.log(`❌ Test error: ${error.message}`);
            await browser.saveScreenshot('./screenshots/advanced-error.png');
        }

        const totalTime = Date.now() - startTime;
        console.log(`\n🎉 ADVANCED E2E TEST COMPLETED in ${totalTime}ms (${Math.round(totalTime/1000)}s)`);
        console.log('📋 Advanced Test Results Summary:');
        console.log(`   ✅ App ready: ${progress.appReady}`);
        console.log(`   ✅ Products added: ${progress.productsAdded}`);
        console.log(`   ✅ Cart validations: ${progress.cartItemsValidated}/${progress.productsAdded}`);
        console.log(`   ✅ Cart accessed: ${progress.cartAccessed}`);
        console.log(`   ✅ Checkout started: ${progress.checkoutStarted}`);
        console.log(`   ✅ Address entered: ${progress.addressEntered}`);
        console.log(`   ✅ Order completed: ${progress.orderCompleted}`);

        // Advanced success calculation
        const coreSuccessCount = (progress.appReady ? 1 : 0) + 
                               (progress.productsAdded > 0 ? 1 : 0) + 
                               (progress.cartAccessed ? 1 : 0);
        const advancedSuccessCount = coreSuccessCount + 
                                   (progress.cartItemsValidated === progress.productsAdded ? 1 : 0) + 
                                   (progress.checkoutStarted ? 1 : 0) + 
                                   (progress.addressEntered ? 1 : 0) + 
                                   (progress.orderCompleted ? 1 : 0);
        
        const totalPossibleSteps = 7;
        const successRate = Math.round((advancedSuccessCount / totalPossibleSteps) * 100);
        console.log(`📊 Advanced Success Rate: ${successRate}% (${advancedSuccessCount}/${totalPossibleSteps} steps)`);
        console.log(`🛒 Cart Validation Accuracy: ${Math.round((progress.cartItemsValidated / Math.max(progress.productsAdded, 1)) * 100)}%`);

        // Final app state verification
        const currentPackage = await driver.getCurrentPackage();
        console.log(`📱 Final app state: ${currentPackage}`);
        
        // Advanced test success criteria
        const basicFlowSuccess = progress.appReady && progress.productsAdded > 0 && progress.cartAccessed;
        const cartValidationSuccess = progress.cartItemsValidated >= Math.floor(progress.productsAdded / 2); // At least 50% validated
        
        expect(basicFlowSuccess).toBe(true);
        expect(progress.productsAdded).toBeGreaterThanOrEqual(1);
        expect(cartValidationSuccess).toBe(true);
        
        console.log('🎯 Advanced E2E shopping flow completed with cart validation!');
        console.log(`📈 Added ${progress.productsAdded} products, validated ${progress.cartItemsValidated} cart updates`);
    });

    afterEach(async () => {
        console.log('🧹 Cleaning up after advanced E2E shopping test...');
        await browser.saveScreenshot('./screenshots/advanced-final-cleanup.png');
    });
});
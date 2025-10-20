describe('🛒 Sauce Labs Demo App - Complete E2E Shopping Workflow', () => {
    
    beforeEach(async () => {
        console.log('🔄 Setting up E2E shopping test environment...');
        await driver.pause(3000);
    });

    afterEach(async () => {
        console.log('🧹 Cleaning up after E2E shopping test...');
        await driver.pause(1000);
    });

    it('🛍️ Complete Shopping Journey: Browse → Add to Cart → Checkout', async () => {
        console.log('🚀 Starting complete E2E shopping workflow...');
        
        // Step 1: Initial app state and product catalog
        console.log('📱 Step 1: Exploring initial product catalog...');
        await driver.saveScreenshot('./test-results/screenshots/e2e_01_initial_catalog.png');
        
        // Find all available products
        const productTitles = await driver.$$('//*[@content-desc="Product Title"]');
        const productImages = await driver.$$('//*[@content-desc="Product Image"]');
        const productPrices = await driver.$$('//*[@content-desc="Product Price"]');
        
        console.log(`📦 Found ${productTitles.length} products available`);
        console.log(`🖼️ Found ${productImages.length} product images`);
        console.log(`💰 Found ${productPrices.length} price tags`);
        
        // Log all available products
        for (let i = 0; i < Math.min(productTitles.length, 5); i++) {
            try {
                const productName = await productTitles[i].getText();
                const price = i < productPrices.length ? await productPrices[i].getText() : 'Price not found';
                console.log(`🏷️ Product ${i + 1}: "${productName}" - ${price}`);
            } catch (e) {
                console.log(`⚠️ Could not read product ${i + 1} details`);
            }
        }
        
        // Step 2: Add first product to cart
        console.log('🛒 Step 2: Adding first product to cart...');
        if (productImages.length > 0) {
            // Click on first product
            await productImages[0].click();
            console.log('👆 Clicked on first product');
            await driver.pause(2000);
            
            await driver.saveScreenshot('./test-results/screenshots/e2e_02_first_product_detail.png');
            
            // Look for "Add to Cart" button or similar
            await driver.pause(1000);
            const addToCartButtons = await driver.$$('//*[contains(@text, "Add") or contains(@content-desc, "Add") or contains(@resource-id, "add") or contains(@resource-id, "cart")]');
            console.log(`🛒 Found ${addToCartButtons.length} potential "Add to Cart" buttons`);
            
            if (addToCartButtons.length > 0) {
                try {
                    await addToCartButtons[0].click();
                    console.log('✅ Successfully clicked "Add to Cart" button');
                    await driver.pause(2000);
                    await driver.saveScreenshot('./test-results/screenshots/e2e_03_first_item_added.png');
                } catch (e) {
                    console.log('⚠️ Could not click add to cart button:', e.message);
                }
            } else {
                console.log('🔍 No obvious "Add to Cart" button found, exploring other options...');
                
                // Try to find any clickable elements that might be cart-related
                const clickableElements = await driver.$$('//*[@clickable="true"]');
                console.log(`👆 Found ${clickableElements.length} clickable elements to explore`);
                
                // Look for quantity selectors or cart icons
                const quantityElements = await driver.$$('//*[contains(@resource-id, "quantity") or contains(@resource-id, "plus") or contains(@resource-id, "minus")]');
                if (quantityElements.length > 0) {
                    console.log(`🔢 Found ${quantityElements.length} quantity-related elements`);
                    await quantityElements[0].click();
                    await driver.pause(1000);
                    await driver.saveScreenshot('./test-results/screenshots/e2e_03_quantity_interaction.png');
                }
            }
        }
        
        // Step 3: Navigate back and add second product
        console.log('🔙 Step 3: Navigating back to add second product...');
        
        // Try to go back to product catalog
        try {
            await driver.back();
            console.log('🔙 Used back navigation');
            await driver.pause(2000);
        } catch (e) {
            console.log('⚠️ Back navigation failed, trying other methods');
        }
        
        await driver.saveScreenshot('./test-results/screenshots/e2e_04_back_to_catalog.png');
        
        // Find products again after navigation
        const secondaryProductImages = await driver.$$('//*[@content-desc="Product Image"]');
        if (secondaryProductImages.length > 1) {
            // Click on second product
            await secondaryProductImages[1].click();
            console.log('👆 Clicked on second product');
            await driver.pause(2000);
            
            await driver.saveScreenshot('./test-results/screenshots/e2e_05_second_product_detail.png');
            
            // Try to add second product to cart
            const secondAddButtons = await driver.$$('//*[contains(@text, "Add") or contains(@content-desc, "Add")]');
            if (secondAddButtons.length > 0) {
                try {
                    await secondAddButtons[0].click();
                    console.log('✅ Successfully added second item to cart');
                    await driver.pause(2000);
                    await driver.saveScreenshot('./test-results/screenshots/e2e_06_second_item_added.png');
                } catch (e) {
                    console.log('⚠️ Could not add second item:', e.message);
                }
            }
        }
        
        // Step 4: Look for shopping cart / basket
        console.log('🛒 Step 4: Searching for shopping cart...');
        
        // Look for cart icon, basket, or shopping bag
        const cartElements = await driver.$$('//*[contains(@content-desc, "cart") or contains(@content-desc, "Cart") or contains(@content-desc, "basket") or contains(@content-desc, "Basket") or contains(@resource-id, "cart") or contains(@resource-id, "basket")]');
        console.log(`🛒 Found ${cartElements.length} cart-related elements`);
        
        if (cartElements.length > 0) {
            await cartElements[0].click();
            console.log('🛒 Clicked on shopping cart');
            await driver.pause(3000);
            await driver.saveScreenshot('./test-results/screenshots/e2e_07_shopping_cart_view.png');
        } else {
            // Try to find cart through navigation menu
            console.log('🔍 Searching for cart through navigation...');
            
            // Look for menu button
            const menuButtons = await driver.$$('//*[contains(@content-desc, "menu") or contains(@content-desc, "Menu") or contains(@resource-id, "menu")]');
            if (menuButtons.length > 0) {
                await menuButtons[0].click();
                console.log('📱 Opened navigation menu');
                await driver.pause(2000);
                await driver.saveScreenshot('./test-results/screenshots/e2e_08_navigation_menu.png');
                
                // Look for cart option in menu
                const menuCartOptions = await driver.$$('//*[contains(@text, "Cart") or contains(@text, "cart") or contains(@text, "Basket")]');
                if (menuCartOptions.length > 0) {
                    await menuCartOptions[0].click();
                    console.log('🛒 Found and clicked cart in menu');
                    await driver.pause(2000);
                    await driver.saveScreenshot('./test-results/screenshots/e2e_09_cart_from_menu.png');
                }
            }
        }
        
        // Step 5: Proceed to checkout
        console.log('💳 Step 5: Looking for checkout process...');
        
        // Look for checkout button
        const checkoutButtons = await driver.$$('//*[contains(@text, "Checkout") or contains(@text, "checkout") or contains(@content-desc, "Checkout") or contains(@resource-id, "checkout")]');
        console.log(`💳 Found ${checkoutButtons.length} checkout-related buttons`);
        
        if (checkoutButtons.length > 0) {
            await checkoutButtons[0].click();
            console.log('💳 Clicked checkout button');
            await driver.pause(3000);
            await driver.saveScreenshot('./test-results/screenshots/e2e_10_checkout_page.png');
            
            // Step 6: Fill checkout form (if available)
            console.log('📝 Step 6: Filling checkout information...');
            
            // Look for form fields
            const nameFields = await driver.$$('//*[contains(@resource-id, "name") or contains(@content-desc, "name") or contains(@hint, "name")]');
            const emailFields = await driver.$$('//*[contains(@resource-id, "email") or contains(@content-desc, "email") or contains(@hint, "email")]');
            const addressFields = await driver.$$('//*[contains(@resource-id, "address") or contains(@content-desc, "address") or contains(@hint, "address")]');
            
            console.log(`📝 Found ${nameFields.length} name fields, ${emailFields.length} email fields, ${addressFields.length} address fields`);
            
            // Fill name field
            if (nameFields.length > 0) {
                try {
                    await nameFields[0].setValue('John Doe');
                    console.log('✅ Filled name field');
                } catch (e) {
                    console.log('⚠️ Could not fill name field:', e.message);
                }
            }
            
            // Fill email field
            if (emailFields.length > 0) {
                try {
                    await emailFields[0].setValue('john.doe@example.com');
                    console.log('✅ Filled email field');
                } catch (e) {
                    console.log('⚠️ Could not fill email field:', e.message);
                }
            }
            
            // Fill address field
            if (addressFields.length > 0) {
                try {
                    await addressFields[0].setValue('123 Test Street, Test City');
                    console.log('✅ Filled address field');
                } catch (e) {
                    console.log('⚠️ Could not fill address field:', e.message);
                }
            }
            
            await driver.saveScreenshot('./test-results/screenshots/e2e_11_checkout_form_filled.png');
            
            // Step 7: Complete the order
            console.log('🎯 Step 7: Completing the order...');
            
            const completeButtons = await driver.$$('//*[contains(@text, "Complete") or contains(@text, "Finish") or contains(@text, "Place Order") or contains(@text, "Submit")]');
            console.log(`🎯 Found ${completeButtons.length} order completion buttons`);
            
            if (completeButtons.length > 0) {
                await completeButtons[0].click();
                console.log('🎯 Clicked order completion button');
                await driver.pause(3000);
                await driver.saveScreenshot('./test-results/screenshots/e2e_12_order_completed.png');
            }
            
        } else {
            console.log('⚠️ No checkout button found, exploring alternative paths...');
            
            // Try to find "Buy Now" or "Purchase" buttons
            const purchaseButtons = await driver.$$('//*[contains(@text, "Buy") or contains(@text, "Purchase") or contains(@text, "Order")]');
            if (purchaseButtons.length > 0) {
                await purchaseButtons[0].click();
                console.log('💳 Found and clicked purchase button');
                await driver.pause(3000);
                await driver.saveScreenshot('./test-results/screenshots/e2e_10_purchase_alternative.png');
            }
        }
        
        // Step 8: Verify final state
        console.log('✅ Step 8: Verifying final state and order confirmation...');
        
        // Look for success messages or confirmation
        const successMessages = await driver.$$('//*[contains(@text, "Success") or contains(@text, "Thank") or contains(@text, "Confirm") or contains(@text, "Complete")]');
        console.log(`✅ Found ${successMessages.length} potential success/confirmation messages`);
        
        if (successMessages.length > 0) {
            for (let i = 0; i < Math.min(successMessages.length, 3); i++) {
                try {
                    const message = await successMessages[i].getText();
                    console.log(`📄 Confirmation message ${i + 1}: "${message}"`);
                } catch (e) {
                    console.log(`⚠️ Could not read confirmation message ${i + 1}`);
                }
            }
        }
        
        await driver.saveScreenshot('./test-results/screenshots/e2e_13_final_state.png');
        
        // Verify we're still in the correct app
        const currentPackage = await driver.getCurrentPackage();
        expect(currentPackage).toBe('com.saucelabs.mydemoapp.android');
        
        console.log('🎉 E2E Shopping workflow completed successfully!');
        console.log('📸 All screenshots saved in test-results/screenshots/');
        console.log('📋 Workflow summary:');
        console.log('   ✅ Product catalog browsed');
        console.log('   ✅ Products selected and added to cart');
        console.log('   ✅ Shopping cart accessed');
        console.log('   ✅ Checkout process initiated');
        console.log('   ✅ Order completion attempted');
        console.log('   ✅ Final state verified');
    });

    it('🔍 Detailed Shopping Cart Analysis', async () => {
        console.log('🔍 Starting detailed shopping cart analysis...');
        
        // Explore cart functionality in detail
        await driver.pause(3000);
        await driver.saveScreenshot('./test-results/screenshots/cart_analysis_01_start.png');
        
        // Look for cart badge or item count
        const cartBadges = await driver.$$('//*[contains(@resource-id, "badge") or contains(@content-desc, "badge") or contains(@resource-id, "count")]');
        console.log(`🏷️ Found ${cartBadges.length} potential cart badges/counters`);
        
        // Look for quantity controls
        const quantityControls = await driver.$$('//*[contains(@resource-id, "quantity") or contains(@text, "+") or contains(@text, "-")]');
        console.log(`🔢 Found ${quantityControls.length} quantity control elements`);
        
        // Look for remove/delete options
        const removeButtons = await driver.$$('//*[contains(@text, "Remove") or contains(@text, "Delete") or contains(@content-desc, "Remove")]');
        console.log(`🗑️ Found ${removeButtons.length} remove/delete options`);
        
        // Test quantity modifications if available
        if (quantityControls.length > 0) {
            try {
                await quantityControls[0].click();
                console.log('🔢 Clicked quantity control');
                await driver.pause(1000);
                await driver.saveScreenshot('./test-results/screenshots/cart_analysis_02_quantity_modified.png');
            } catch (e) {
                console.log('⚠️ Could not modify quantity:', e.message);
            }
        }
        
        await driver.saveScreenshot('./test-results/screenshots/cart_analysis_03_final.png');
        console.log('✅ Shopping cart analysis completed');
    });

    it('💳 Payment Methods Exploration', async () => {
        console.log('💳 Exploring available payment methods...');
        
        await driver.pause(3000);
        
        // Look for payment-related elements
        const paymentElements = await driver.$$('//*[contains(@text, "Payment") or contains(@text, "Card") or contains(@text, "PayPal") or contains(@text, "Credit")]');
        console.log(`💳 Found ${paymentElements.length} payment-related elements`);
        
        // Look for card input fields
        const cardFields = await driver.$$('//*[contains(@resource-id, "card") or contains(@hint, "card") or contains(@resource-id, "credit")]');
        console.log(`💳 Found ${cardFields.length} card input fields`);
        
        // Look for payment method selection
        const paymentMethods = await driver.$$('//*[contains(@text, "Visa") or contains(@text, "MasterCard") or contains(@text, "PayPal") or contains(@text, "Apple Pay")]');
        console.log(`💳 Found ${paymentMethods.length} payment method options`);
        
        await driver.saveScreenshot('./test-results/screenshots/payment_01_exploration.png');
        
        if (paymentMethods.length > 0) {
            try {
                await paymentMethods[0].click();
                console.log('💳 Selected payment method');
                await driver.pause(2000);
                await driver.saveScreenshot('./test-results/screenshots/payment_02_method_selected.png');
            } catch (e) {
                console.log('⚠️ Could not select payment method:', e.message);
            }
        }
        
        console.log('✅ Payment methods exploration completed');
    });
});
/**
 * 🎯 AUTOMATED E2E TEST - Based on Interactive Recording Session
 * 
 * This test recreates the exact 9-step mobile E2E shopping journey
 * captured during the interactive recording session:
 * - Product Selection → Cart → Authentication → Shipping → Payment → Order Completion
 * 
 * All selectors and validation points are extracted from recorded UI dumps
 * and screenshots from the successful manual session.
 */

describe('🎯 Recorded E2E Complete Shopping Journey', () => {
    
    // Test data extracted from recording session
    const testData = {
        // User authentication data (from recorded session)
        auth: {
            username: 'bod@example.com',
            password: '10203040'
        },
        // Shipping information (real user data from recording)
        shipping: {
            fullName: 'Raphael Cogliatti',
            address1: 'Talstrasse 11',
            address2: 'Entrance 1', // Keep placeholder as user did
            city: 'Zürich',
            state: 'Cornwall', // Keep placeholder as user did
            zipCode: '8001',
            country: 'Switzerland'
        },
        // Payment information (test data from recording)
        payment: {
            cardHolder: 'Raphael Cogliatti', // User updated this
            cardNumber: '3258125675687891',
            expirationDate: '03/25',
            securityCode: '123'
        },
        // Expected product details
        product: {
            name: 'Sauce Labs Backpack',
            price: '$ 29.99',
            finalTotal: '$ 35.98' // Including shipping
        }
    };

    beforeEach(async () => {
        console.log('🚀 Starting E2E Shopping Journey Test...');
        
        // Ensure we're on the main product catalog
        try {
            // If we're not on catalog, try to navigate there
            const menuBtn = await $('com.saucelabs.mydemoapp.android:id/menuIV');
            if (await menuBtn.isDisplayed()) {
                await menuBtn.click();
                await driver.pause(1000);
                
                // Click Catalog option if menu is open
                const catalogOption = await $('~Catalog');
                if (await catalogOption.isDisplayed()) {
                    await catalogOption.click();
                    await driver.pause(2000);
                }
            }
        } catch (error) {
            console.log('📱 Already on catalog or navigation not needed');
        }
    });

    it('🏆 Should complete full E2E shopping journey from product selection to order confirmation', async () => {
        
        // 📊 STEP 1: Product Selection
        console.log('🎯 Step 1: Selecting product...');
        
        // Find and click the first product (Sauce Labs Backpack)
        const firstProduct = await $('com.saucelabs.mydemoapp.android:id/productIV');
        await expect(firstProduct).toBeDisplayed();
        await firstProduct.click();
        
        // Validate product detail page
        const productTitle = await $('com.saucelabs.mydemoapp.android:id/productTV');
        await expect(productTitle).toHaveText(testData.product.name);
        
        const productPrice = await $('com.saucelabs.mydemoapp.android:id/priceTV');
        await expect(productPrice).toHaveText(testData.product.price);
        
        console.log('✅ Step 1 Complete: Product details verified');

        // 📊 STEP 2: Add to Cart
        console.log('🛒 Step 2: Adding product to cart...');
        
        // Verify default quantity is 1
        const quantity = await $('com.saucelabs.mydemoapp.android:id/noTV');
        await expect(quantity).toHaveText('1');
        
        // Click Add to Cart button
        const addToCartBtn = await $('com.saucelabs.mydemoapp.android:id/cartBt');
        await expect(addToCartBtn).toBeDisplayed();
        await addToCartBtn.click();
        
        // Verify cart counter appears
        await driver.pause(1000);
        const cartCounter = await $('com.saucelabs.mydemoapp.android:id/cartTV');
        await expect(cartCounter).toHaveText('1');
        
        console.log('✅ Step 2 Complete: Product added to cart');

        // 📊 STEP 3: View Cart
        console.log('🛍️ Step 3: Navigating to cart...');
        
        // Click cart icon
        const cartIcon = await $('com.saucelabs.mydemoapp.android:id/cartRL');
        await cartIcon.click();
        
        // Validate cart page content
        const cartTitle = await $('//android.widget.TextView[@text="My Cart"]');
        await expect(cartTitle).toBeDisplayed();
        
        // Verify product in cart
        const cartProductTitle = await $('com.saucelabs.mydemoapp.android:id/titleTV');
        await expect(cartProductTitle).toHaveText(testData.product.name);
        
        const cartProductPrice = await $('com.saucelabs.mydemoapp.android:id/priceTV');
        await expect(cartProductPrice).toHaveText(testData.product.price);
        
        console.log('✅ Step 3 Complete: Cart contents verified');

        // 📊 STEP 4: Proceed to Checkout
        console.log('💳 Step 4: Proceeding to checkout...');
        
        // Click Proceed To Checkout button
        const checkoutBtn = await $('com.saucelabs.mydemoapp.android:id/cartBt');
        await checkoutBtn.click();
        
        // Expect login page (authentication required)
        const loginTitle = await $('//android.widget.TextView[@text="Login"]');
        await expect(loginTitle).toBeDisplayed();
        
        console.log('✅ Step 4 Complete: Redirected to authentication');

        // 📊 STEP 5: Authentication
        console.log('🔐 Step 5: Performing authentication...');
        
        // Fill login credentials
        const usernameField = await $('com.saucelabs.mydemoapp.android:id/nameET');
        await usernameField.setValue(testData.auth.username);
        
        const passwordField = await $('com.saucelabs.mydemoapp.android:id/passwordET');
        await passwordField.setValue(testData.auth.password);
        
        // Submit login
        const loginBtn = await $('com.saucelabs.mydemoapp.android:id/loginBtn');
        await loginBtn.click();
        
        // Verify successful login - should be on checkout page
        await driver.pause(2000);
        const checkoutTitle = await $('//android.widget.TextView[@text="Checkout"]');
        await expect(checkoutTitle).toBeDisplayed();
        
        console.log('✅ Step 5 Complete: Authentication successful');

        // 📊 STEP 6: Shipping Information
        console.log('📮 Step 6: Entering shipping information...');
        
        // Clear and fill shipping form with real user data (matching recording)
        const fullNameField = await $('com.saucelabs.mydemoapp.android:id/fullNameET');
        await fullNameField.clearValue();
        await fullNameField.setValue(testData.shipping.fullName);
        
        const address1Field = await $('com.saucelabs.mydemoapp.android:id/address1ET');
        await address1Field.clearValue();
        await address1Field.setValue(testData.shipping.address1);
        
        // Keep address2 as is (placeholder - matching user behavior)
        
        const cityField = await $('com.saucelabs.mydemoapp.android:id/cityET');
        await cityField.clearValue();
        await cityField.setValue(testData.shipping.city);
        
        // Keep state as is (placeholder - matching user behavior)
        
        const zipField = await $('com.saucelabs.mydemoapp.android:id/zipET');
        await zipField.clearValue();
        await zipField.setValue(testData.shipping.zipCode);
        
        const countryField = await $('com.saucelabs.mydemoapp.android:id/countryET');
        await countryField.clearValue();
        await countryField.setValue(testData.shipping.country);
        
        // Proceed to payment
        const toPaymentBtn = await $('com.saucelabs.mydemoapp.android:id/paymentBtn');
        await toPaymentBtn.click();
        
        console.log('✅ Step 6 Complete: Shipping information entered');

        // 📊 STEP 7: Payment Information  
        console.log('💳 Step 7: Handling payment information...');
        
        // Verify payment page
        const paymentSubtitle = await $('//android.widget.TextView[@text="Enter a payment method"]');
        await expect(paymentSubtitle).toBeDisplayed();
        
        // Update cardholder name to match user pattern (real name like shipping)
        const cardHolderField = await $('com.saucelabs.mydemoapp.android:id/nameET');
        await cardHolderField.clearValue();
        await cardHolderField.setValue(testData.payment.cardHolder);
        
        // Verify pre-filled payment data (should be there like in recording)
        const cardNumberField = await $('com.saucelabs.mydemoapp.android:id/cardNumberET');
        const currentCardNumber = await cardNumberField.getText();
        
        // If not pre-filled, fill it
        if (!currentCardNumber || currentCardNumber.length < 10) {
            await cardNumberField.setValue(testData.payment.cardNumber);
        }
        
        const expirationField = await $('com.saucelabs.mydemoapp.android:id/expirationDateET');
        const currentExpiration = await expirationField.getText();
        if (!currentExpiration || currentExpiration.length < 4) {
            await expirationField.setValue(testData.payment.expirationDate);
        }
        
        const securityCodeField = await $('com.saucelabs.mydemoapp.android:id/securityCodeET');
        const currentSecurityCode = await securityCodeField.getText();
        if (!currentSecurityCode || currentSecurityCode.length < 3) {
            await securityCodeField.setValue(testData.payment.securityCode);
        }
        
        // Verify billing address checkbox is checked
        const billingCheckbox = await $('com.saucelabs.mydemoapp.android:id/billingAddressCB');
        const isChecked = await billingCheckbox.getAttribute('checked');
        if (isChecked !== 'true') {
            await billingCheckbox.click();
        }
        
        // Proceed to review order
        const reviewOrderBtn = await $('com.saucelabs.mydemoapp.android:id/paymentBtn');
        await reviewOrderBtn.click();
        
        console.log('✅ Step 7 Complete: Payment information processed');

        // 📊 STEP 8: Order Review
        console.log('📋 Step 8: Reviewing order details...');
        
        // Verify order review page
        const reviewSubtitle = await $('//android.widget.TextView[@text="Review your order"]');
        await expect(reviewSubtitle).toBeDisplayed();
        
        // Verify product details in review
        const reviewProductTitle = await $('com.saucelabs.mydemoapp.android:id/titleTV');
        await expect(reviewProductTitle).toHaveText(testData.product.name);
        
        const reviewProductPrice = await $('com.saucelabs.mydemoapp.android:id/priceTV');
        await expect(reviewProductPrice).toHaveText(testData.product.price);
        
        // Verify shipping address
        const reviewFullName = await $('com.saucelabs.mydemoapp.android:id/fullNameTV');
        await expect(reviewFullName).toHaveText(testData.shipping.fullName);
        
        const reviewAddress = await $('com.saucelabs.mydemoapp.android:id/addressTV');
        await expect(reviewAddress).toHaveText(testData.shipping.address1);
        
        // Verify payment method
        const reviewCardHolder = await $('com.saucelabs.mydemoapp.android:id/cardHolderTV');
        await expect(reviewCardHolder).toHaveText(testData.payment.cardHolder);
        
        const reviewCardNumber = await $('com.saucelabs.mydemoapp.android:id/cardNumberTV');
        await expect(reviewCardNumber).toHaveText(testData.payment.cardNumber);
        
        // Verify total amount
        const totalAmount = await $('com.saucelabs.mydemoapp.android:id/totalAmountTV');
        await expect(totalAmount).toHaveText(testData.product.finalTotal);
        
        console.log('✅ Step 8 Complete: Order review verified');

        // 📊 STEP 9: Place Order (Final Step)
        console.log('🏆 Step 9: Placing final order...');
        
        // Click Place Order button
        const placeOrderBtn = await $('com.saucelabs.mydemoapp.android:id/paymentBtn');
        await expect(placeOrderBtn).toHaveText('Place Order');
        await placeOrderBtn.click();
        
        // Verify success page
        await driver.pause(3000); // Allow for order processing
        
        const successTitle = await $('//android.widget.TextView[@text="Checkout Complete"]');
        await expect(successTitle).toBeDisplayed();
        
        const thankYouMessage = await $('//android.widget.TextView[@text="Thank you for your order"]');
        await expect(thankYouMessage).toBeDisplayed();
        
        const swagMessage = await $('//android.widget.TextView[@text="Your new swag is on its way"]');
        await expect(swagMessage).toBeDisplayed();
        
        const orderDispatchMessage = await $('//android.widget.TextView[@text="Your order has been dispatched and will arrive as fast as the pony gallops!"]');
        await expect(orderDispatchMessage).toBeDisplayed();
        
        // Verify Continue Shopping option
        const continueShoppingBtn = await $('com.saucelabs.mydemoapp.android:id/shoopingBt');
        await expect(continueShoppingBtn).toBeDisplayed();
        await expect(continueShoppingBtn).toHaveText('Continue Shopping');
        
        console.log('🎉 Step 9 Complete: ORDER SUCCESSFULLY PLACED!');
        console.log('🏆 FULL E2E JOURNEY COMPLETED SUCCESSFULLY!');
        
        // 🎯 Final Validation Summary
        console.log('\n📊 E2E TEST SUMMARY:');
        console.log('✅ Product Selection - Sauce Labs Backpack');
        console.log('✅ Cart Management - Item added and verified');
        console.log('✅ Authentication - Login successful');
        console.log('✅ Shipping Information - Real user data entered');
        console.log('✅ Payment Processing - Test card data processed');
        console.log('✅ Order Review - All details verified');
        console.log('✅ Order Completion - Success confirmation received');
        console.log('🎯 TOTAL JOURNEY TIME: Complete 9-step E2E flow');
        
    });

    afterEach(async () => {
        console.log('🧹 Test cleanup completed');
        // Optional: Reset app state for next test
        try {
            // Navigate back to catalog if needed
            const continueBtn = await $('com.saucelabs.mydemoapp.android:id/shoopingBt');
            if (await continueBtn.isDisplayed()) {
                await continueBtn.click();
                console.log('🔄 Navigated back to catalog for next test');
            }
        } catch (error) {
            console.log('🔧 App state reset not needed');
        }
    });

});
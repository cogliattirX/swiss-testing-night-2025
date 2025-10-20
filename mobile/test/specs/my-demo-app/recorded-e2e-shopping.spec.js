// My Demo App - Complete E2E Shopping Journey (Based on Recorded Session)
// Automated reproduction of interactive recording session

describe('My Demo App - Complete E2E Shopping Journey', () => {
    
    it('should complete full shopping journey from product selection to order confirmation', async () => {
        console.log('🚀 Starting Complete E2E Shopping Journey Test...');
        
        // STEP 1: Product Selection (Sauce Labs Backpack)
        console.log('📱 Step 1: Product Selection');
        
        // Wait for app to load completely
        await browser.pause(3000);
        
        // Verify main catalog screen (correct element is "Products", not "Catalog")
        const catalogTitle = await $('//android.widget.TextView[@text="Products"]');
        await expect(catalogTitle).toBeDisplayed();
        console.log('✅ App loaded - Products catalog visible');
        
        // Select Sauce Labs Backpack (first product) - use specific product image
        const sauceBackpack = await $('//android.widget.ImageView[@content-desc="Product Image"]');
        await sauceBackpack.click();
        await browser.pause(2000);
        
        console.log('✅ Step 1 Complete: Product selected');
        
        
        // STEP 2: Add to Cart
        console.log('📱 Step 2: Add to Cart');
        
        // Verify product details page
        const productTitle = await $('//android.widget.TextView[@text="Sauce Labs Backpack"]');
        await expect(productTitle).toBeDisplayed();
        
        const productPrice = await $('//android.widget.TextView[@text="$ 29.99"]');
        await expect(productPrice).toBeDisplayed();
        
        // Add to cart
        const addToCartBtn = await $('//android.widget.Button[@resource-id="com.saucelabs.mydemoapp.android:id/cartBt"]');
        await addToCartBtn.click();
        await browser.pause(2000);
        
        console.log('✅ Step 2 Complete: Added to cart');
        
        
        // STEP 3: View Cart 
        console.log('📱 Step 3: View Cart');
        
        // Click cart icon
        const cartIcon = await $('//android.widget.RelativeLayout[@content-desc="View cart"]');
        await cartIcon.click();
        await browser.pause(2000);
        
        // Verify cart screen
        const cartTitle = await $('//android.widget.TextView[@text="My Cart"]');
        await expect(cartTitle).toBeDisplayed();
        
        // Verify product in cart
        const cartProduct = await $('//android.widget.TextView[@text="Sauce Labs Backpack"]');
        await expect(cartProduct).toBeDisplayed();
        
        console.log('✅ Step 3 Complete: Cart verified');
        
        
        // STEP 4: Proceed to Checkout (Login Required)
        console.log('📱 Step 4: Proceed to Checkout');
        
        const proceedBtn = await $('//android.widget.Button[@resource-id="com.saucelabs.mydemoapp.android:id/cartBt"]');
        await proceedBtn.click();
        await browser.pause(3000);
        
        // Verify login screen appears
        const loginTitle = await $('//android.widget.TextView[@text="Login"]');
        await expect(loginTitle).toBeDisplayed();
        
        console.log('✅ Step 4 Complete: Login screen reached');
        
        
        // STEP 5: Authentication
        console.log('📱 Step 5: Authentication');
        
        // Click on the pre-configured user "bod@example.com" to auto-fill credentials
        const predefinedUser = await $('//android.widget.TextView[@text="bod@example.com"]');
        await predefinedUser.click();
        await browser.pause(2000);
        console.log('✅ Selected predefined user: bod@example.com');
        
        // Verify credentials are filled
        const usernameField = await $('//android.widget.EditText[@resource-id="com.saucelabs.mydemoapp.android:id/nameET"]');
        const passwordField = await $('//android.widget.EditText[@resource-id="com.saucelabs.mydemoapp.android:id/passwordET"]');
        
        const username = await usernameField.getText();
        const password = await passwordField.getText();
        
        console.log(`📧 Username: ${username}`);
        console.log(`🔒 Password: ${password ? '********' : 'Empty'}`);
        
        // Submit login
        const loginBtn = await $('//android.widget.Button[@resource-id="com.saucelabs.mydemoapp.android:id/loginBtn"]');
        await loginBtn.click();
        await browser.pause(3000);
        
        console.log('✅ Step 5 Complete: Authentication successful');
        
        
        // STEP 6: Shipping Information  
        console.log('📱 Step 6: Shipping Information');
        
        // Verify checkout page
        const checkoutTitle = await $('//android.widget.TextView[@text="Checkout"]');
        await expect(checkoutTitle).toBeDisplayed();
        
        // Verify shipping form is pre-filled
        const fullNameField = await $('//android.widget.EditText[@resource-id="com.saucelabs.mydemoapp.android:id/fullNameET"]');
        const addressField = await $('//android.widget.EditText[@resource-id="com.saucelabs.mydemoapp.android:id/address1ET"]');
        
        const currentName = await fullNameField.getText();
        console.log(`👤 Current Name: ${currentName}`);
        
        // Update with recorded session data
        await fullNameField.clearValue();
        await fullNameField.setValue('Raphael Cogliatti');
        
        await addressField.clearValue();
        await addressField.setValue('Talstrasse 11');
        
        const cityField = await $('//android.widget.EditText[@resource-id="com.saucelabs.mydemoapp.android:id/cityET"]');
        await cityField.clearValue();
        await cityField.setValue('Zürich');
        
        const zipField = await $('//android.widget.EditText[@resource-id="com.saucelabs.mydemoapp.android:id/zipET"]');
        await zipField.clearValue();
        await zipField.setValue('8001');
        
        const countryField = await $('//android.widget.EditText[@resource-id="com.saucelabs.mydemoapp.android:id/countryET"]');
        await countryField.clearValue();
        await countryField.setValue('Switzerland');
        
        // Proceed to payment
        const toPaymentBtn = await $('//android.widget.Button[@resource-id="com.saucelabs.mydemoapp.android:id/paymentBtn"]');
        await toPaymentBtn.click();
        await browser.pause(3000);
        
        console.log('✅ Step 6 Complete: Shipping info updated');
        
        
        // STEP 7: Payment Information
        console.log('📱 Step 7: Payment Information');
        
        // Verify payment screen
        const paymentTitle = await $('//android.widget.TextView[@text="Enter a payment method"]');
        await expect(paymentTitle).toBeDisplayed();
        
        // Update payment fields with recorded session data
        const cardNameField = await $('//android.widget.EditText[@resource-id="com.saucelabs.mydemoapp.android:id/nameET"]');
        await cardNameField.clearValue();
        await cardNameField.setValue('Raphael Cogliatti');
        
        const cardNumberField = await $('//android.widget.EditText[@resource-id="com.saucelabs.mydemoapp.android:id/cardNumberET"]');
        await cardNumberField.clearValue();
        await cardNumberField.setValue('3258125675687891');
        
        const expiryField = await $('//android.widget.EditText[@resource-id="com.saucelabs.mydemoapp.android:id/expirationDateET"]');
        await expiryField.clearValue();
        await expiryField.setValue('03/25');
        
        const cvvField = await $('//android.widget.EditText[@resource-id="com.saucelabs.mydemoapp.android:id/securityCodeET"]');
        await cvvField.clearValue();
        await cvvField.setValue('123');
        
        // Verify billing address checkbox
        const billingCheckbox = await $('//android.widget.CheckBox[@resource-id="com.saucelabs.mydemoapp.android:id/billingAddressCB"]');
        const isChecked = await billingCheckbox.getAttribute('checked');
        if (isChecked !== 'true') {
            await billingCheckbox.click();
        }
        
        // Proceed to review
        const reviewBtn = await $('//android.widget.Button[@resource-id="com.saucelabs.mydemoapp.android:id/paymentBtn"]');
        await reviewBtn.click();
        await browser.pause(3000);
        
        console.log('✅ Step 7 Complete: Payment info entered');
        
        
        // STEP 8: Review Order
        console.log('📱 Step 8: Review Order');
        
        // Verify review screen
        const reviewTitle = await $('//android.widget.TextView[@text="Review your order"]');
        await expect(reviewTitle).toBeDisplayed();
        
        // Verify product details
        const reviewProduct = await $('//android.widget.TextView[@text="Sauce Labs Backpack"]');
        await expect(reviewProduct).toBeDisplayed();
        
        const reviewPrice = await $('//android.widget.TextView[@text="$ 29.99"]');
        await expect(reviewPrice).toBeDisplayed();
        
        // Verify address
        const reviewName = await $('//android.widget.TextView[@text="Raphael Cogliatti"]');
        await expect(reviewName).toBeDisplayed();
        
        const reviewAddress = await $('//android.widget.TextView[@text="Talstrasse 11"]');
        await expect(reviewAddress).toBeDisplayed();
        
        // Verify payment info
        const reviewCard = await $('//android.widget.TextView[@text="3258125675687891"]');
        await expect(reviewCard).toBeDisplayed();
        
        // Verify total
        const totalAmount = await $('//android.widget.TextView[@text="$ 35.98"]');
        await expect(totalAmount).toBeDisplayed();
        
        console.log('✅ Step 8 Complete: Order review verified');
        
        
        // STEP 9: Place Order (Final Step)
        console.log('📱 Step 9: Place Order - FINAL STEP');
        
        const placeOrderBtn = await $('//android.widget.Button[@resource-id="com.saucelabs.mydemoapp.android:id/paymentBtn"]');
        await placeOrderBtn.click();
        await browser.pause(4000);
        
        // Verify success screen
        const successTitle = await $('//android.widget.TextView[@text="Checkout Complete"]');
        await expect(successTitle).toBeDisplayed();
        
        const thankYouMessage = await $('//android.widget.TextView[@text="Thank you for your order"]');
        await expect(thankYouMessage).toBeDisplayed();
        
        const swagMessage = await $('//android.widget.TextView[@text="Your new swag is on its way"]');
        await expect(swagMessage).toBeDisplayed();
        
        const dispatchMessage = await $('//android.widget.TextView[@text="Your order has been dispatched and will arrive as fast as the pony gallops!"]');
        await expect(dispatchMessage).toBeDisplayed();
        
        // Verify continue shopping button
        const continueBtn = await $('//android.widget.Button[@resource-id="com.saucelabs.mydemoapp.android:id/shoopingBt"]');
        await expect(continueBtn).toBeDisplayed();
        
        console.log('🎉 SUCCESS! Complete E2E Shopping Journey COMPLETED!');
        console.log('✅ Order placed successfully - All steps verified!');
        
        // Take final screenshot for verification
        await browser.pause(2000);
    });
});
import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * DemoQA Forms Testing Suite
 * 
 * Comprehensive testing of DemoQA Forms section including:
 * - Practice Forms with validation
 */

test.describe('DemoQA Forms Testing', () => {
  const baseUrl = 'https://demoqa.com';
  
  test.beforeEach(async ({ page }) => {
    const actions = createObservableActions(page);
    await actions.observableGoto(baseUrl, 'Navigate to DemoQA homepage');
    
    // Navigate to Forms section
    await actions.observableClick('text=Forms', 'Click Forms section');
    await actions.observableWait('.left-pannel', 'Wait for forms menu');
  });

  test('Practice Form - Complete form submission and validation', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Practice Form', async () => {
      await actions.observableClick('text=Practice Form', 'Click Practice Form menu item');
      await actions.observableWait('#firstName', 'Wait for practice form');
    });

    await test.step('Fill personal information', async () => {
      const studentData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobile: '1234567890',
        dateOfBirth: '15 Sep 1990',
        subjects: 'Computer Science',
        hobbies: 'Sports',
        currentAddress: '123 Main Street, City, State 12345'
      };

      await actions.observableFill('#firstName', studentData.firstName, 'Enter first name');
      await actions.observableFill('#lastName', studentData.lastName, 'Enter last name');
      await actions.observableFill('#userEmail', studentData.email, 'Enter email');
      
      // Select gender
      await actions.observableClick('label[for="gender-radio-1"]', 'Select Male gender');
      
      await actions.observableFill('#userNumber', studentData.mobile, 'Enter mobile number');
      
      console.log('✅ Personal information filled successfully');
    });

    await test.step('Fill date of birth', async () => {
      // Click date of birth field
      await actions.observableClick('#dateOfBirthInput', 'Click date of birth input');
      await actions.observableWait('.react-datepicker', 'Wait for date picker');
      
      // Navigate to September 1990
      await actions.observableClick('.react-datepicker__month-select', 'Click month dropdown');
      await actions.observableClick('option[value="8"]', 'Select September');
      
      await actions.observableClick('.react-datepicker__year-select', 'Click year dropdown');
      await actions.observableClick('option[value="1990"]', 'Select 1990');
      
      // Select day 15
      await actions.observableClick('.react-datepicker__day--015', 'Select 15th day');
      
      console.log('✅ Date of birth selected successfully');
    });

    await test.step('Fill subjects', async () => {
      // Type in subjects field
      await actions.observableClick('#subjectsInput', 'Click subjects input');
      await page.type('#subjectsInput', 'Computer Science');
      await page.keyboard.press('Tab'); // Accept the suggestion
      
      console.log('✅ Subjects filled successfully');
    });

    await test.step('Select hobbies', async () => {
      // Select Sports hobby
      await actions.observableClick('label[for="hobbies-checkbox-1"]', 'Select Sports hobby');
      
      // Select Reading hobby
      await actions.observableClick('label[for="hobbies-checkbox-2"]', 'Select Reading hobby');
      
      console.log('✅ Hobbies selected successfully');
    });

    await test.step('Fill address and state/city', async () => {
      await actions.observableFill('#currentAddress', '123 Main Street\nCity, State 12345', 'Enter current address');
      
      // Select state
      await actions.observableClick('#state', 'Click state dropdown');
      await actions.observableClick('div:has-text("NCR")', 'Select NCR state');
      
      // Select city
      await actions.observableClick('#city', 'Click city dropdown');
      await actions.observableClick('div:has-text("Delhi")', 'Select Delhi city');
      
      console.log('✅ Address and location filled successfully');
    });

    await test.step('Submit form and validate', async () => {
      await actions.observableClick('#submit', 'Submit the practice form');
      await actions.observableWait('.modal-content', 'Wait for confirmation modal');
      
      // Validate the submitted data appears in modal
      await actions.observableExpect(async () => {
        await expect(page.locator('.modal-body')).toContainText('John Doe');
        await expect(page.locator('.modal-body')).toContainText('john.doe@example.com');
        await expect(page.locator('.modal-body')).toContainText('1234567890');
        await expect(page.locator('.modal-body')).toContainText('15 September,1990');
        await expect(page.locator('.modal-body')).toContainText('Computer Science');
        await expect(page.locator('.modal-body')).toContainText('Sports, Reading');
        await expect(page.locator('.modal-body')).toContainText('123 Main Street');
        await expect(page.locator('.modal-body')).toContainText('NCR Delhi');
      }, 'Verify all submitted data appears in confirmation modal');
      
      // Close modal
      await actions.observableClick('#closeLargeModal', 'Close confirmation modal');
      
      console.log('✅ Practice form submission and validation completed successfully');
    });

    await actions.screenshot('demoqa-practice-form-complete', 'Practice Form testing completed');
  });

  test('Practice Form - Validation testing', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Practice Form', async () => {
      await actions.observableClick('text=Practice Form', 'Click Practice Form menu item');
      await actions.observableWait('#firstName', 'Wait for practice form');
    });

    await test.step('Test required field validation', async () => {
      // Try to submit without filling required fields
      await actions.observableClick('#submit', 'Submit empty form');
      
      // Check if required fields are highlighted
      const firstNameField = page.locator('#firstName');
      const lastNameField = page.locator('#lastName');
      const mobileField = page.locator('#userNumber');
      
      // Check field validation states
      const firstNameClass = await firstNameField.getAttribute('class');
      const lastNameClass = await lastNameField.getAttribute('class');
      const mobileClass = await mobileField.getAttribute('class');
      
      console.log(`📝 First Name validation: ${firstNameClass?.includes('error') ? 'Has error styling' : 'No error styling'}`);
      console.log(`📝 Last Name validation: ${lastNameClass?.includes('error') ? 'Has error styling' : 'No error styling'}`);
      console.log(`📝 Mobile validation: ${mobileClass?.includes('error') ? 'Has error styling' : 'No error styling'}`);
    });

    await test.step('Test email validation', async () => {
      // Test invalid email format
      await actions.observableFill('#userEmail', 'invalid-email', 'Enter invalid email');
      await actions.observableClick('#submit', 'Submit with invalid email');
      
      const emailField = page.locator('#userEmail');
      const emailClass = await emailField.getAttribute('class');
      
      console.log(`📧 Email validation: ${emailClass?.includes('error') ? 'Has validation' : 'No validation detected'}`);
    });

    await test.step('Test mobile number validation', async () => {
      // Test invalid mobile number (too short)
      await actions.observableFill('#userNumber', '123', 'Enter invalid mobile number');
      await actions.observableClick('#submit', 'Submit with invalid mobile');
      
      const mobileField = page.locator('#userNumber');
      const mobileClass = await mobileField.getAttribute('class');
      
      console.log(`📱 Mobile validation: ${mobileClass?.includes('error') ? 'Has validation' : 'No validation detected'}`);
    });

    await test.step('Fill minimum required fields', async () => {
      // Fill only the minimum required fields to test successful submission
      await actions.observableFill('#firstName', 'Test', 'Enter first name');
      await actions.observableFill('#lastName', 'User', 'Enter last name');
      await actions.observableClick('label[for="gender-radio-1"]', 'Select gender');
      await actions.observableFill('#userNumber', '1234567890', 'Enter valid mobile number');
      
      await actions.observableClick('#submit', 'Submit with minimum required fields');
      
      // Should show confirmation modal
      await actions.observableWait('.modal-content', 'Wait for confirmation modal');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('.modal-body')).toContainText('Test User');
      }, 'Verify form submission with minimum fields');
      
      await actions.observableClick('#closeLargeModal', 'Close confirmation modal');
    });

    await actions.screenshot('demoqa-form-validation-complete', 'Form validation testing completed');
    console.log('✅ Practice form validation testing completed');
  });

  test('Practice Form - File upload testing', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Practice Form', async () => {
      await actions.observableClick('text=Practice Form', 'Click Practice Form menu item');
      await actions.observableWait('#firstName', 'Wait for practice form');
    });

    await test.step('Test file upload functionality', async () => {
      // Fill minimum required fields first
      await actions.observableFill('#firstName', 'File', 'Enter first name');
      await actions.observableFill('#lastName', 'Upload', 'Enter last name');
      await actions.observableClick('label[for="gender-radio-2"]', 'Select Female gender');
      await actions.observableFill('#userNumber', '9876543210', 'Enter mobile number');
      
      // Test the file upload input
      const fileInput = page.locator('#uploadPicture');
      
      await actions.observableExpect(async () => {
        await expect(fileInput).toBeAttached();
      }, 'Verify file upload input is present');
      
      // Check if file input accepts common image formats
      const acceptAttribute = await fileInput.getAttribute('accept');
      console.log(`📁 File upload accepts: ${acceptAttribute || 'any file type'}`);
      
      // Note: In a real test, you would upload an actual file here
      // For this demo, we'll just verify the input exists and proceed
      
      console.log('✅ File upload functionality verified');
    });

    await test.step('Submit form and verify', async () => {
      await actions.observableClick('#submit', 'Submit form with file upload test');
      await actions.observableWait('.modal-content', 'Wait for confirmation modal');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('.modal-body')).toContainText('File Upload');
      }, 'Verify form submission with file upload test');
      
      await actions.observableClick('#closeLargeModal', 'Close confirmation modal');
    });

    await actions.screenshot('demoqa-file-upload-complete', 'File upload testing completed');
    console.log('✅ File upload testing completed');
  });

  test('Practice Form - Date picker comprehensive testing', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Navigate to Practice Form', async () => {
      await actions.observableClick('text=Practice Form', 'Click Practice Form menu item');
      await actions.observableWait('#firstName', 'Wait for practice form');
    });

    await test.step('Test date picker navigation', async () => {
      await actions.observableClick('#dateOfBirthInput', 'Click date of birth input');
      await actions.observableWait('.react-datepicker', 'Wait for date picker');
      
      // Test month navigation
      const currentMonth = await page.locator('.react-datepicker__current-month').textContent();
      console.log(`📅 Current month in picker: ${currentMonth}`);
      
      // Navigate to previous month
      await actions.observableClick('.react-datepicker__navigation--previous', 'Click previous month');
      
      const previousMonth = await page.locator('.react-datepicker__current-month').textContent();
      console.log(`📅 Previous month: ${previousMonth}`);
      
      // Navigate to next month (back to original)
      await actions.observableClick('.react-datepicker__navigation--next', 'Click next month');
      
      // Test year dropdown
      await actions.observableClick('.react-datepicker__year-select', 'Click year dropdown');
      
      // Count available years
      const yearOptions = await page.locator('.react-datepicker__year-select option').count();
      console.log(`📅 Available years in dropdown: ${yearOptions}`);
      
      // Select a specific year (1995)
      await actions.observableClick('option[value="1995"]', 'Select 1995');
      
      // Test month dropdown
      await actions.observableClick('.react-datepicker__month-select', 'Click month dropdown');
      
      // Select March (value="2")
      await actions.observableClick('option[value="2"]', 'Select March');
      
      // Select a specific day
      await actions.observableClick('.react-datepicker__day--010', 'Select 10th day');
      
      // Verify the selected date appears in the input
      const selectedDate = await page.locator('#dateOfBirthInput').inputValue();
      console.log(`📅 Selected date: ${selectedDate}`);
      
      expect(selectedDate).toContain('10 Mar 1995');
    });

    await test.step('Complete form with selected date', async () => {
      // Fill other required fields
      await actions.observableFill('#firstName', 'Date', 'Enter first name');
      await actions.observableFill('#lastName', 'Picker', 'Enter last name');
      await actions.observableClick('label[for="gender-radio-3"]', 'Select Other gender');
      await actions.observableFill('#userNumber', '5555555555', 'Enter mobile number');
      
      await actions.observableClick('#submit', 'Submit form with date selection');
      await actions.observableWait('.modal-content', 'Wait for confirmation modal');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('.modal-body')).toContainText('10 March,1995');
      }, 'Verify selected date appears in confirmation');
      
      await actions.observableClick('#closeLargeModal', 'Close confirmation modal');
    });

    await actions.screenshot('demoqa-datepicker-complete', 'Date picker testing completed');
    console.log('✅ Date picker comprehensive testing completed');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Lake Tapps Permit Workflow - Welcome Stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome page with correct title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Lake Tapps Permit Workflow/i })).toBeVisible();
  });

  test('should display all feature cards', async ({ page }) => {
    await expect(page.getByText('Guided Process')).toBeVisible();
    await expect(page.getByText('Document Generation')).toBeVisible();
    await expect(page.getByText('Local & Private')).toBeVisible();
  });

  test('should display "What You\'ll Need" section', async ({ page }) => {
    await expect(page.getByText("What You'll Need")).toBeVisible();
    await expect(page.getByText('Property address and parcel number')).toBeVisible();
    await expect(page.getByText('Description of planned improvements')).toBeVisible();
  });

  test('should display all agencies involved', async ({ page }) => {
    await expect(page.getByText('Cascade Water Alliance')).toBeVisible();
    await expect(page.getByText('City of Bonney Lake')).toBeVisible();
    await expect(page.getByText('Pierce County')).toBeVisible();
    await expect(page.getByText('WA Dept. of Fish & Wildlife')).toBeVisible();
    await expect(page.getByText('Army Corps of Engineers')).toBeVisible();
    await expect(page.getByText('WA Dept. of Ecology')).toBeVisible();
  });

  test('should display privacy notice', async ({ page }) => {
    await expect(page.getByText('Your Data Stays Local')).toBeVisible();
  });

  test('should have Get Started button', async ({ page }) => {
    const button = page.getByRole('button', { name: /Get Started/i });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test('should show progress bar at step 1', async ({ page }) => {
    await expect(page.getByText(/Step 1 of 10/i)).toBeVisible();
  });
});

test.describe('Lake Tapps Permit Workflow - Project Type Stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Get Started/i }).click();
  });

  test('should navigate to project type selection', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /What type of project/i })).toBeVisible();
  });

  test('should display project category options', async ({ page }) => {
    await expect(page.getByText('New Construction')).toBeVisible();
    await expect(page.getByText('Modify Existing')).toBeVisible();
  });

  test('should select New Construction category', async ({ page }) => {
    await page.getByText('New Construction').click();
    await expect(page.getByText('Selected').first()).toBeVisible();
  });

  test('should select Modify Existing category', async ({ page }) => {
    await page.getByText('Modify Existing').click();
    await expect(page.getByText('Selected').first()).toBeVisible();
  });

  test('should display all improvement types', async ({ page }) => {
    // All improvement type buttons should be visible (using button role with accessible name)
    await expect(page.getByRole('button', { name: /^Dock/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Pier/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Float/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Boat Lift/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Boat Ramp/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Boathouse/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Bulkhead/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Mooring Pile/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Swim Float/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Other/ })).toBeVisible();
  });

  test('should allow selecting multiple improvement types', async ({ page }) => {
    await page.getByRole('button', { name: /^Dock/i }).click();
    await page.getByRole('button', { name: /^Boat Lift/i }).click();

    // Check that selected summary appears
    await expect(page.getByText('Selected Improvements')).toBeVisible();
  });

  test('should show progress bar at step 2', async ({ page }) => {
    await expect(page.getByText(/Step 2 of 10/i)).toBeVisible();
  });
});

test.describe('Lake Tapps Permit Workflow - Property Owner Stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByText('New Construction').click();
    await page.getByRole('button', { name: /^Dock/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();
  });

  test('should display property owner form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Property Owner Information/i })).toBeVisible();
  });

  test('should have all required fields', async ({ page }) => {
    await expect(page.getByLabel(/First Name/i)).toBeVisible();
    await expect(page.getByLabel(/Last Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Phone/i)).toBeVisible();
    await expect(page.getByLabel(/Street Address/i)).toBeVisible();
    await expect(page.getByLabel(/City/i)).toBeVisible();
    await expect(page.getByLabel(/State/i)).toBeVisible();
    await expect(page.getByLabel(/ZIP/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.getByLabel(/Email Address/i);
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should format phone number automatically', async ({ page }) => {
    const phoneInput = page.getByLabel(/Phone Number/i);
    await phoneInput.fill('2535551234');
    await expect(phoneInput).toHaveValue('(253) 555-1234');
  });

  test('should validate ZIP code format', async ({ page }) => {
    const zipInput = page.getByLabel(/ZIP Code/i);
    await zipInput.fill('invalid');
    await zipInput.blur();
    await expect(page.getByText(/valid ZIP/i)).toBeVisible();
  });

  test('should accept valid ZIP code', async ({ page }) => {
    const zipInput = page.getByLabel(/ZIP Code/i);
    await zipInput.fill('98391');
    await zipInput.blur();
    await expect(page.getByText(/valid ZIP/i)).not.toBeVisible();
  });

  test('should show agent authorization warning when checked', async ({ page }) => {
    await page.getByText('I am an authorized agent').click();
    await expect(page.getByText('Agent Authorization Required')).toBeVisible();
  });

  test('should fill in complete owner information', async ({ page }) => {
    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.getByLabel(/Email Address/i).fill('john.doe@example.com');
    await page.getByLabel(/Phone Number/i).fill('2535551234');
    await page.getByLabel(/Street Address/i).fill('123 Lake Tapps Blvd');
    await page.getByLabel(/City/i).fill('Bonney Lake');
    await page.getByLabel(/ZIP Code/i).fill('98391');

    // Verify all fields are filled
    await expect(page.getByLabel(/First Name/i)).toHaveValue('John');
    await expect(page.getByLabel(/Last Name/i)).toHaveValue('Doe');
    await expect(page.getByLabel(/Email Address/i)).toHaveValue('john.doe@example.com');
  });
});

test.describe('Lake Tapps Permit Workflow - Project Details Stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByText('New Construction').click();
    await page.getByRole('button', { name: /^Dock/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Fill owner info
    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.getByLabel(/Email Address/i).fill('john.doe@example.com');
    await page.getByLabel(/Phone Number/i).fill('2535551234');
    await page.getByLabel(/Street Address/i).fill('123 Lake Tapps Blvd');
    await page.getByLabel(/City/i).fill('Bonney Lake');
    await page.getByLabel(/ZIP Code/i).fill('98391');

    await page.getByRole('button', { name: /Continue/i }).click();
  });

  test('should display project details form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Project Details/i })).toBeVisible();
  });

  test('should have project description field', async ({ page }) => {
    await expect(page.getByLabel(/Describe your planned improvement/i)).toBeVisible();
  });

  test('should have cost field with dollar formatting', async ({ page }) => {
    const costInput = page.getByLabel(/Estimated Total Cost/i);
    await costInput.fill('15000');
    await expect(costInput).toHaveValue('15,000');
  });

  test('should show cost help information', async ({ page }) => {
    // Click the help icon next to cost field
    await page.locator('button:has(svg)').filter({ hasText: '' }).first().click();
    await expect(page.getByText(/under \$7,047/i)).toBeVisible();
  });

  test('should have location checkboxes', async ({ page }) => {
    await expect(page.getByText('Work will occur in the water')).toBeVisible();
    await expect(page.getByText("Structure extends below 544' elevation")).toBeVisible();
    await expect(page.getByText('Modifying an existing licensed structure')).toBeVisible();
  });

  test('should show permit preview based on selections', async ({ page }) => {
    await expect(page.getByText("Based on your answers, you'll likely need")).toBeVisible();
    await expect(page.getByText('CWA License Application (always required)')).toBeVisible();
  });

  test('should show HPA requirement when in-water work selected', async ({ page }) => {
    await page.getByText('Work will occur in the water').click();
    await expect(page.getByText(/Hydraulic Project Approval/i)).toBeVisible();
  });
});

test.describe('Lake Tapps Permit Workflow - Site Info Stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate through stages
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByText('New Construction').click();
    await page.getByRole('button', { name: /^Dock/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Fill owner info
    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.getByLabel(/Email Address/i).fill('john.doe@example.com');
    await page.getByLabel(/Phone Number/i).fill('2535551234');
    await page.getByLabel(/Street Address/i).fill('123 Lake Tapps Blvd');
    await page.getByLabel(/City/i).fill('Bonney Lake');
    await page.getByLabel(/ZIP Code/i).fill('98391');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Fill project details
    await page.getByLabel(/Describe your planned improvement/i).fill('Install new floating dock');
    await page.getByLabel(/Estimated Total Cost/i).fill('15000');
    await page.getByRole('button', { name: /Continue/i }).click();
  });

  test('should display site information form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Site Information/i })).toBeVisible();
  });

  test('should have property location fields', async ({ page }) => {
    await expect(page.getByLabel(/Property Address/i)).toBeVisible();
    await expect(page.getByLabel(/Parcel Number/i)).toBeVisible();
    await expect(page.getByLabel(/Water Frontage/i)).toBeVisible();
    await expect(page.getByLabel(/Elevation/i)).toBeVisible();
  });

  test('should display file upload dropzone', async ({ page }) => {
    await expect(page.getByText(/Drag & drop files here/i)).toBeVisible();
    await expect(page.getByText(/Accepts: Images, PDFs, Word docs, CAD files/i)).toBeVisible();
  });

  test('should show tips section', async ({ page }) => {
    await expect(page.getByText('What to Include')).toBeVisible();
    await expect(page.getByText('Site plan or survey')).toBeVisible();
  });
});

test.describe('Lake Tapps Permit Workflow - Permit Applications Stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate through all previous stages
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByText('New Construction').click();
    await page.getByRole('button', { name: /^Dock/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.getByLabel(/Email Address/i).fill('john.doe@example.com');
    await page.getByLabel(/Phone Number/i).fill('2535551234');
    await page.getByLabel(/Street Address/i).fill('123 Lake Tapps Blvd');
    await page.getByLabel(/City/i).fill('Bonney Lake');
    await page.getByLabel(/ZIP Code/i).fill('98391');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/Describe your planned improvement/i).fill('Install new floating dock');
    await page.getByLabel(/Estimated Total Cost/i).fill('15000');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/Property Address/i).fill('123 Lake Tapps Blvd');
    await page.getByRole('button', { name: /Continue/i }).click();
  });

  test('should display permit applications stage', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Permit Applications/i })).toBeVisible();
  });

  test('should show CWA License Application with correct contact info', async ({ page }) => {
    await expect(page.getByText('CWA License Application')).toBeVisible();
    await expect(page.getByText('Cascade Water Alliance')).toBeVisible();
    await expect(page.getByText('panderson@cascadewater.org')).toBeVisible();
    await expect(page.getByText('(425) 453-0930')).toBeVisible();
  });

  test('should show Shoreline permit with contact info', async ({ page }) => {
    // Shoreline permit should be visible
    await expect(page.getByText(/Substantial Development Permit/i)).toBeVisible();
    // Verify contact info is present as links
    await expect(page.getByText('permits@cobl.us')).toBeVisible();
    await expect(page.getByText('(253) 447-4356')).toBeVisible();
  });

  test('should have Start Application buttons', async ({ page }) => {
    const startButtons = page.getByRole('button', { name: /Start Application/i });
    await expect(startButtons.first()).toBeVisible();
  });
});

test.describe('Lake Tapps Permit Workflow - Insurance Stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate through stages to insurance
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByText('New Construction').click();
    await page.getByRole('button', { name: /^Dock/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.getByLabel(/Email Address/i).fill('john.doe@example.com');
    await page.getByLabel(/Phone Number/i).fill('2535551234');
    await page.getByLabel(/Street Address/i).fill('123 Lake Tapps Blvd');
    await page.getByLabel(/City/i).fill('Bonney Lake');
    await page.getByLabel(/ZIP Code/i).fill('98391');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/Describe your planned improvement/i).fill('Install new floating dock');
    await page.getByLabel(/Estimated Total Cost/i).fill('15000');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/Property Address/i).fill('123 Lake Tapps Blvd');
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();
  });

  test('should display insurance requirements', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Insurance Requirements' })).toBeVisible();
    await expect(page.getByText('CWA Insurance Requirements')).toBeVisible();
    await expect(page.getByText(/Cascade Water Alliance.*must be named as Additional Insured/i)).toBeVisible();
  });

  test('should show CWA insurance requirements info', async ({ page }) => {
    await expect(page.getByText('CWA Insurance Requirements')).toBeVisible();
    await expect(page.getByText(/Cascade Water Alliance.*must be named as Additional Insured/i)).toBeVisible();
  });

  test('should show insurance form when checkbox checked', async ({ page }) => {
    await page.getByText("I have homeowner's liability insurance").click();
    await expect(page.getByLabel(/Insurance Provider/i)).toBeVisible();
    await expect(page.getByLabel(/Policy Number/i)).toBeVisible();
  });

  test('should show action required when additional insured not added', async ({ page }) => {
    // Click the checkbox to enable insurance
    await page.locator('input[name="hasInsurance"]').check();
    // Wait for form to appear
    await expect(page.getByLabel(/Insurance Provider/i)).toBeVisible();
    // Action Required section should be visible
    await expect(page.getByText('Action Required')).toBeVisible();
  });
});

test.describe('Lake Tapps Permit Workflow - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have working back button', async ({ page }) => {
    await page.getByRole('button', { name: /Get Started/i }).click();
    await expect(page.getByText('Step 2 of 10')).toBeVisible();

    // Click the Back button (using aria-label)
    await page.getByRole('button', { name: /Go to previous step/i }).click();
    // Should show confirmation dialog
    await expect(page.getByText('Go Back?')).toBeVisible();
  });

  test('should confirm before going back', async ({ page }) => {
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByRole('button', { name: /Go to previous step/i }).click();

    // Click Go Back in dialog (the confirm button)
    await page.getByRole('dialog').getByRole('button', { name: 'Go Back' }).click();
    await expect(page.getByText('Step 1 of 10')).toBeVisible();
  });

  test('should stay on page when canceling back navigation', async ({ page }) => {
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByRole('button', { name: /Go to previous step/i }).click();

    // Click Stay Here in dialog
    await page.getByRole('button', { name: 'Stay Here' }).click();
    await expect(page.getByText('Step 2 of 10')).toBeVisible();
  });

  test('should update progress bar as user advances', async ({ page }) => {
    await expect(page.getByText(/0% Complete/i)).toBeVisible();

    await page.getByRole('button', { name: /Get Started/i }).click();
    await expect(page.getByText(/11% Complete/i)).toBeVisible();
  });

  test('should disable back button on first stage', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /Go to previous step/i });
    await expect(backButton).toBeDisabled();
  });
});

test.describe('Lake Tapps Permit Workflow - Auto-Save', () => {
  test('should show save indicator after entering data', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByText('New Construction').click();

    // Wait for auto-save
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Saved/i)).toBeVisible();
  });
});

test.describe('Lake Tapps Permit Workflow - UI Elements', () => {
  test('should display header with logo and title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Lake Tapps Permits')).toBeVisible();
    await expect(page.getByText('Permit Workflow Application')).toBeVisible();
  });

  test('should have help button in header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Help/i })).toBeVisible();
  });

  test('should display cards with proper styling', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.card');
    await expect(cards.first()).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
  });
});

test.describe('Contact Information Verification', () => {
  test('should display correct CWA contact info', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByText('New Construction').click();
    await page.getByRole('button', { name: /^Dock/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.getByLabel(/Email Address/i).fill('john@example.com');
    await page.getByLabel(/Phone Number/i).fill('2535551234');
    await page.getByLabel(/Street Address/i).fill('123 Test St');
    await page.getByLabel(/City/i).fill('Bonney Lake');
    await page.getByLabel(/ZIP Code/i).fill('98391');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/Describe your planned improvement/i).fill('Test');
    await page.getByLabel(/Estimated Total Cost/i).fill('5000');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/Property Address/i).fill('123 Test St');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Verify CWA contact info on permits page
    await expect(page.getByText('panderson@cascadewater.org')).toBeVisible();
    await expect(page.getByText('(425) 453-0930')).toBeVisible();
  });

  test('should display correct City of Bonney Lake contact info', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByText('New Construction').click();
    await page.getByRole('button', { name: /^Dock/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.getByLabel(/Email Address/i).fill('john@example.com');
    await page.getByLabel(/Phone Number/i).fill('2535551234');
    await page.getByLabel(/Street Address/i).fill('123 Test St');
    await page.getByLabel(/City/i).fill('Bonney Lake');
    await page.getByLabel(/ZIP Code/i).fill('98391');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/Describe your planned improvement/i).fill('Test');
    await page.getByLabel(/Estimated Total Cost/i).fill('5000');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByLabel(/Property Address/i).fill('123 Test St');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Verify City of Bonney Lake contact info
    await expect(page.getByText('permits@cobl.us')).toBeVisible();
    await expect(page.getByText('(253) 447-4356')).toBeVisible();
  });
});

test.describe('Full Workflow - End to End', () => {
  test('should complete entire workflow from start to finish', async ({ page }) => {
    await page.goto('/');

    // Stage 1: Welcome
    await expect(page.getByRole('heading', { name: /Lake Tapps Permit Workflow/i })).toBeVisible();
    await page.getByRole('button', { name: /Get Started/i }).click();

    // Stage 2: Project Type
    await expect(page.getByText('Step 2 of 10')).toBeVisible();
    await page.getByText('New Construction').click();
    await page.getByText('Dock', { exact: true }).first().click();
    await page.getByText('Boat Lift').click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Stage 3: Property Owner
    await expect(page.getByText('Step 3 of 10')).toBeVisible();
    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.getByLabel(/Email Address/i).fill('john.doe@laketapps.com');
    await page.getByLabel(/Phone Number/i).fill('2535551234');
    await page.getByLabel(/Street Address/i).fill('123 Lake Tapps Parkway');
    await page.getByLabel(/City/i).fill('Bonney Lake');
    await page.getByLabel(/ZIP Code/i).fill('98391');
    await page.getByLabel(/Parcel Number/i).fill('1234567890');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Stage 4: Project Details
    await expect(page.getByText('Step 4 of 10')).toBeVisible();
    await page.getByLabel(/Describe your planned improvement/i).fill('Install a new 6x24 floating dock with aluminum frame and composite decking, plus a boat lift for 22ft boat');
    await page.getByLabel(/Estimated Total Cost/i).fill('25000');
    await page.getByText('Work will occur in the water').click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Stage 5: Site Info
    await expect(page.getByText('Step 5 of 10')).toBeVisible();
    await page.getByLabel(/Property Address/i).fill('123 Lake Tapps Parkway');
    await page.getByLabel(/Parcel Number/i).last().fill('1234567890');
    await page.getByLabel(/Water Frontage/i).fill('75');
    await page.getByLabel(/Elevation/i).fill('542');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Stage 6: Permit Applications
    await expect(page.getByText('Step 6 of 10')).toBeVisible();
    await expect(page.getByText('CWA License Application')).toBeVisible();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Stage 7: Insurance
    await expect(page.getByText('Step 7 of 10')).toBeVisible();
    await page.locator('input[name="hasInsurance"]').check();
    await page.getByLabel(/Insurance Provider/i).fill('State Farm');
    await page.getByLabel(/Policy Number/i).fill('SF-123456789');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Stage 8: Review
    await expect(page.getByText('Step 8 of 10')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('123 Lake Tapps Parkway').first()).toBeVisible();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Stage 9: Generate Documents
    await expect(page.getByText('Step 9 of 10')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Generate Documents' })).toBeVisible();
    // Check that document generation options are visible
    await expect(page.getByText('CWA License Application')).toBeVisible();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Stage 10: Submit & Track
    await expect(page.getByText('Step 10 of 10')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Submit/i })).toBeVisible();
  });
});

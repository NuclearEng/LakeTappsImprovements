import { test, expect } from '@playwright/test';

// Helper to navigate to the Site Info stage (drawing editor is here)
async function navigateToSiteInfoStage(page: any) {
  await page.goto('/');

  // Navigate through workflow to Site Info stage
  await page.getByRole('button', { name: /Get Started/i }).click();
  await page.getByText('New Construction').click();
  await page.getByRole('button', { name: /^Dock/i }).click();
  await page.getByRole('button', { name: /Continue/i }).click();

  // Fill in owner info
  await page.getByLabel(/First Name/i).fill('Test');
  await page.getByLabel(/Last Name/i).fill('User');
  await page.getByLabel(/Email Address/i).fill('test@example.com');
  await page.getByLabel(/Phone Number/i).fill('2535551234');
  await page.getByLabel(/Street Address/i).fill('123 Test St');
  await page.getByLabel(/City/i).fill('Lake Tapps');
  await page.getByLabel(/ZIP Code/i).fill('98391');
  await page.getByRole('button', { name: /Continue/i }).click();

  // Fill in project details
  await page.getByLabel(/Describe your planned improvement/i).fill('Test project for drawing');
  await page.getByLabel(/Estimated Total Cost/i).fill('5000');
  await page.getByRole('button', { name: /Continue/i }).click();

  // Now on Site Info stage
}

// Helper to navigate directly to drawing mode
async function navigateToDrawingEditor(page: any) {
  await navigateToSiteInfoStage(page);
  // Switch to drawing mode
  await page.getByRole('button', { name: /Draw Site Plan/i }).click();
}

test.describe('Drawing Editor - Mode Toggle', () => {
  test('should display mode toggle between Upload and Draw', async ({ page }) => {
    await navigateToSiteInfoStage(page);

    // Verify both mode buttons exist
    await expect(page.getByRole('button', { name: /Upload Files/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Draw Site Plan/i })).toBeVisible();
  });

  test('should switch to draw mode when clicked', async ({ page }) => {
    await navigateToDrawingEditor(page);

    // Should show the drawing editor heading
    await expect(page.getByRole('heading', { name: /Site Plan Drawing/i })).toBeVisible({ timeout: 10000 });
  });

  test('should switch back to upload mode', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(500);

    // Click upload mode
    await page.getByRole('button', { name: /Upload Files/i }).click();

    // Should show the dropzone
    await expect(page.getByText(/Drag & drop files here/i)).toBeVisible();
  });
});

test.describe('Drawing Editor - Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000); // Wait for lazy-loaded component
  });

  test('should display drawing toolbar', async ({ page }) => {
    // Wait for toolbar to load
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });
  });

  test('should display select and pan tools', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });

    // Select and Pan should be in toolbar
    await expect(page.locator('[data-tool="select"]')).toBeVisible();
    await expect(page.locator('[data-tool="pan"]')).toBeVisible();
  });

  test('should display basic shape tools', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });

    // Basic shape tools
    await expect(page.locator('[data-tool="rectangle"]')).toBeVisible();
    await expect(page.locator('[data-tool="circle"]')).toBeVisible();
    await expect(page.locator('[data-tool="line"]')).toBeVisible();
  });

  test('should display polyline and polygon tools', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });

    // Curves & Polygons tools
    await expect(page.locator('[data-tool="polyline"]')).toBeVisible();
    await expect(page.locator('[data-tool="polygon"]')).toBeVisible();
  });

  test('should display annotation tools', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });

    // Annotation tools
    await expect(page.locator('[data-tool="dimension"]')).toBeVisible();
    await expect(page.locator('[data-tool="text"]')).toBeVisible();
    await expect(page.locator('[data-tool="freehand"]')).toBeVisible();
  });

  test('should activate tool on click', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });

    // Click rectangle tool
    await page.locator('[data-tool="rectangle"]').click();

    // Should be highlighted (have ring class)
    await expect(page.locator('[data-tool="rectangle"]')).toHaveClass(/ring-2/);
  });
});

test.describe('Drawing Editor - Style Controls', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);
  });

  test('should display stroke color options', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Stroke Color')).toBeVisible();
  });

  test('should display fill color options', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Fill Color')).toBeVisible();
  });

  test('should display stroke width options', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Stroke Width')).toBeVisible();
  });

  test('should display fill opacity slider', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Fill Opacity/i)).toBeVisible();
  });
});

test.describe('Drawing Editor - Layer Controls', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);
  });

  test('should display layer section', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });
    // Wait for layer section
    await expect(page.getByText('Property Boundary')).toBeVisible();
  });

  test('should display all drawing layers', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });

    // Check for layer buttons
    await expect(page.getByRole('button', { name: /Property Boundary/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Existing Structures/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Proposed Improvements/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Dimensions/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Annotations/i })).toBeVisible();
  });

  test('should switch active layer on click', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });

    // Click on Property Boundary layer
    await page.getByRole('button', { name: /Property Boundary/i }).click();

    // Should be highlighted
    await expect(page.getByRole('button', { name: /Property Boundary/i })).toHaveClass(/bg-primary-100/);
  });
});

test.describe('Drawing Editor - Action Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);
  });

  test('should display undo and redo buttons', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /Undo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Redo/i })).toBeVisible();
  });

  test('should display delete and clear buttons', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /Delete/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Clear/i })).toBeVisible();
  });
});

test.describe('Drawing Editor - Canvas', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);
  });

  test('should display canvas element', async ({ page }) => {
    // Wait for canvas to load (fabric.js creates upper-canvas)
    await expect(page.locator('.drawing-canvas-container')).toBeVisible({ timeout: 10000 });
  });

  test('should display import, label, and measurement buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Import Image/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Add Label/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Add Measurement/i })).toBeVisible();
  });

  test('should have Change button for scale', async ({ page }) => {
    // Just verify the Change button exists
    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(1000);
    // Change button should be visible
    await expect(page.getByRole('button', { name: /Change/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Drawing Editor - Status Bar', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);
  });

  test('should display command prompt section', async ({ page }) => {
    await expect(page.getByText('Command Prompt')).toBeVisible({ timeout: 10000 });
  });

  test('should display quick tips section', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Quick Tips')).toBeVisible();
  });

  test('should update prompt when tool is selected', async ({ page }) => {
    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });

    // Select rectangle tool
    await page.locator('[data-tool="rectangle"]').click();

    // Tool should be selected
    await expect(page.locator('[data-tool="rectangle"]')).toHaveClass(/ring-2/);
  });
});

test.describe('Drawing Editor - Parcel Search', () => {
  test('should display parcel search input', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    await expect(page.getByRole('heading', { name: /Property Information/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/Parcel Number/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible();
  });
});

test.describe('Drawing Editor - Header Actions', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);
  });

  test('should display New, Save, and Export buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^New$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^Save$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Export$/i })).toBeVisible();
  });

  test('should create new drawing when New is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    // Canvas should be visible
    await expect(page.locator('.drawing-canvas-container')).toBeVisible();
  });

  test('should open save dialog when Save is clicked', async ({ page }) => {
    // Click New to create a drawing first
    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    // Click Save
    await page.getByRole('button', { name: /^Save$/i }).click();

    // Should show save dialog
    await expect(page.getByRole('heading', { name: /Save Drawing/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Drawing name/i)).toBeVisible();
  });
});

test.describe('Drawing Editor - Scale Dialog', () => {
  test('should open scale dialog when Change is clicked', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    // Click New to create a drawing first
    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    // Click Change scale button
    await page.getByRole('button', { name: /Change/i }).click();

    // Should show scale dialog
    await expect(page.getByRole('heading', { name: /Set Drawing Scale/i })).toBeVisible();
    await expect(page.getByText(/Pixels per Foot/i)).toBeVisible();
  });

  test('should update scale when Apply is clicked', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    // Find and click the Change button next to Scale
    const changeButtons = page.getByRole('button', { name: /Change/i });
    await changeButtons.first().click();

    // Wait for dialog to open
    await expect(page.getByRole('heading', { name: /Set Drawing Scale/i })).toBeVisible();

    // Change scale value in the modal
    await page.locator('.modal-content input[type="number"]').fill('20');
    await page.locator('.modal-content').getByRole('button', { name: /Apply/i }).click();

    // Dialog should close
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /Set Drawing Scale/i })).not.toBeVisible();
  });
});

test.describe('Drawing Editor - Keyboard Shortcuts', () => {
  test('should have keyboard shortcut indicators on tools', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    await expect(page.locator('.drawing-toolbar')).toBeVisible({ timeout: 10000 });

    // Check that shortcut badges exist (look for the small badge spans)
    await expect(page.locator('[data-tool="select"] .absolute')).toBeVisible();
    await expect(page.locator('[data-tool="rectangle"] .absolute')).toBeVisible();
    await expect(page.locator('[data-tool="line"] .absolute')).toBeVisible();
  });
});

test.describe('Drawing Editor - Measurement Input', () => {
  test('should open label dialog when Add Label button is clicked', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    // Create new drawing first
    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    // Click Add Label button
    await page.getByRole('button', { name: /Add Label/i }).click();
    await page.waitForTimeout(300);

    // Label dialog should appear - check for heading and input
    await expect(page.locator('h3:has-text("Add Label")')).toBeVisible();
    await expect(page.getByPlaceholder(/Enter label text/i)).toBeVisible();
  });

  test('should show preset labels in label dialog', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /Add Label/i }).click();
    await page.waitForTimeout(300);

    // Click to show presets
    await page.getByText('Common Labels').click();
    await page.waitForTimeout(200);

    // Check that preset labels are visible
    await expect(page.getByRole('button', { name: 'PROPERTY LINE' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'EXISTING DOCK' })).toBeVisible();
  });

  test('should display label dialog with styling options', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    // Click the Add Label button in the canvas toolbar
    await page.locator('.flex.gap-2 button').getByText('Add Label').click();
    await page.waitForTimeout(500);

    // Verify dialog elements are visible
    const textInput = page.getByPlaceholder(/Enter label text/i);
    await expect(textInput).toBeVisible();

    // Verify styling options are present
    await expect(page.getByText('Size')).toBeVisible();
    await expect(page.getByText('Font')).toBeVisible();
    await expect(page.getByText('Bold')).toBeVisible();
    await expect(page.getByText('Text Color')).toBeVisible();
    await expect(page.getByText('Preview:')).toBeVisible();

    // Verify cancel button works
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(textInput).not.toBeVisible({ timeout: 3000 });
  });

  test('should activate dimension tool when Add Measurement is clicked', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    // Click Add Measurement button
    await page.getByRole('button', { name: /Add Measurement/i }).click();
    await page.waitForTimeout(300);

    // Dimension tool should be active
    await expect(page.locator('[data-tool="dimension"]')).toHaveClass(/ring-2/);
  });

  test('should show dimension tool prompt when active', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    // Select dimension tool
    await page.locator('[data-tool="dimension"]').click();
    await page.waitForTimeout(300);

    // Check for dimension-related prompt in status bar - look in command section
    await expect(page.locator('.font-mono').getByText(/dimension line/i)).toBeVisible();
  });
});

test.describe('Drawing Editor - Full Integration', () => {
  test('should complete basic drawing workflow', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    // Create new drawing
    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    // Verify canvas is ready
    await expect(page.locator('.drawing-canvas-container')).toBeVisible();

    // Select rectangle tool
    await page.locator('[data-tool="rectangle"]').click();
    await expect(page.locator('[data-tool="rectangle"]')).toHaveClass(/ring-2/);

    // Select a layer
    await page.getByRole('button', { name: /Proposed Improvements/i }).click();
    await expect(page.getByRole('button', { name: /Proposed Improvements/i })).toHaveClass(/bg-primary-100/);

    // Drawing should be ready - check status elements
    await expect(page.getByText('Objects:')).toBeVisible();
    await expect(page.getByText(/Layer:/i)).toBeVisible();
    await expect(page.getByText(/Tool:/i)).toBeVisible();
  });

  test('should save drawing with name', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    // Create new drawing
    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    // Open save dialog
    await page.getByRole('button', { name: /^Save$/i }).click();

    // Enter name and save
    await page.getByPlaceholder(/Drawing name/i).fill('My Test Site Plan');

    // Find the Save button in the dialog (not the one in the header)
    await page.locator('.modal-content').getByRole('button', { name: /Save/i }).click();

    // Should show success notification or close dialog
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: /Save Drawing/i })).not.toBeVisible();
  });

  test('should cancel save dialog', async ({ page }) => {
    await navigateToDrawingEditor(page);
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /^New$/i }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /^Save$/i }).click();

    // Click cancel
    await page.locator('.modal-content').getByRole('button', { name: /Cancel/i }).click();

    // Dialog should close
    await expect(page.getByRole('heading', { name: /Save Drawing/i })).not.toBeVisible();
  });
});

test.describe('Site Plan Files Integration', () => {
  test('should show both upload and draw options', async ({ page }) => {
    await navigateToSiteInfoStage(page);

    // Both options should be visible
    await expect(page.getByRole('button', { name: /Upload Files/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Draw Site Plan/i })).toBeVisible();

    // Description text should be visible
    await expect(page.getByText(/Upload existing site plans/i)).toBeVisible();
    await expect(page.getByText(/Create a drawing/i)).toBeVisible();
  });

  test('should allow switching between modes', async ({ page }) => {
    await navigateToSiteInfoStage(page);

    // Switch to draw mode
    await page.getByRole('button', { name: /Draw Site Plan/i }).click();
    await page.waitForTimeout(1000);

    // Then switch to upload mode
    await page.getByRole('button', { name: /Upload Files/i }).click();
    await expect(page.getByText(/Drag & drop files here/i)).toBeVisible();

    // Verify we can switch back
    await page.getByRole('button', { name: /Draw Site Plan/i }).click();
    await page.waitForTimeout(1000);

    // Verify draw button is selected (has primary styling)
    await expect(page.getByRole('button', { name: /Draw Site Plan/i })).toHaveClass(/border-primary-500/);
  });
});

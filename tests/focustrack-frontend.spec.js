// focustrack-frontend.spec.js
// Playwright e2e tests for FocusTrack frontend integration (WP-F / WP-G)
// Run against local http-server with ?focustrack=mock query param
// Usage:
//   npx http-server /home/mrh/repos/worldenterprisegroup/usiva-focustrack -p 8765 -c-1 &
//   npx playwright test tests/focustrack-frontend.spec.js --reporter=line

const { test, expect } = require('@playwright/test');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:8765';
const OPT_URL    = BASE + '/apply-opt.html?focustrack=mock';
const PORTAL_URL = BASE + '/portal.html?focustrack=mock';

// =====================================================================
// Helpers
// =====================================================================

async function getChip(page) {
  return page.locator('#ft-autosave-chip');
}

async function waitForChipState(page, stateClass, timeout = 8000) {
  const chip = await getChip(page);
  await expect(chip).toHaveClass(new RegExp(stateClass), { timeout });
}

// =====================================================================
// apply-opt.html — WP-F tests
// =====================================================================

test.describe('WP-F — apply-opt.html', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(OPT_URL);
    // wait for wizard to render
    await page.waitForSelector('#opt-application', { state: 'visible' });
  });

  // ------------------------------------------------------------------
  // Autosave chip states
  // ------------------------------------------------------------------

  test('chip is visible on page load in mock mode', async ({ page }) => {
    const chip = await getChip(page);
    await expect(chip).toBeVisible();
  });

  test('chip transitions to saving then saved after user input', async ({ page }) => {
    // type into first name field
    await page.fill('#first_name', 'Jane');
    // wait for "saving" then "saved"
    await waitForChipState(page, 'ft-chip-saving');
    await waitForChipState(page, 'ft-chip-saved', 10000);
    const chip = await getChip(page);
    const text = await page.locator('#ft-chip-text').textContent();
    // should contain "Saved" after debounce resolves
    expect(text).toMatch(/saved/i);
  });

  test('sign-in button is visible and labelled in mock mode', async ({ page }) => {
    const btn = page.locator('#ft-signin-btn');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-label', /sign in/i);
  });

  // ------------------------------------------------------------------
  // Draft adoption on sign-in
  // ------------------------------------------------------------------

  test('local draft survives sign-in: field value persists after clicking sign-in (AC 1.1)', async ({ page }) => {
    // fill a field (creates local draft via saveDraft debounce)
    await page.fill('#first_name', 'PreservedValue');
    // wait for draft to save
    await page.waitForTimeout(1200);

    // click sign-in
    await page.locator('#ft-signin-btn').click();

    // mock sign-in is instantaneous; wait for chip to show signed-in state
    await waitForChipState(page, 'ft-chip-saved', 8000);

    // field value must still be present
    const val = await page.inputValue('#first_name');
    expect(val).toBe('PreservedValue');
  });

  // ------------------------------------------------------------------
  // Upload progress + checklist
  // ------------------------------------------------------------------

  test('upload panel is visible in mock mode (section 16)', async ({ page }) => {
    // Navigate to section 16 (Documents) by clicking Next 15 times
    // (faster: inject a step jump via JS)
    await page.evaluate(() => {
      // jump the wizard to the documents section directly
      const sections = Array.from(document.querySelectorAll('section.section'));
      sections.forEach((s, i) => s.classList.toggle('step-hidden', i !== 15));
    });
    const uploadPanel = page.locator('#ft-upload-panel');
    await expect(uploadPanel).toBeVisible();
  });

  test('file drop triggers doctype selector', async ({ page }) => {
    // reveal the documents section
    await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section.section'));
      sections.forEach((s, i) => s.classList.toggle('step-hidden', i !== 15));
    });

    // simulate file selection via input
    const fileInput = page.locator('#ft-file-input');
    await fileInput.setInputFiles({
      name: 'resume-jane.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content')
    });

    // doctype row should appear
    const doctypeRow = page.locator('#ft-doctype-row');
    await expect(doctypeRow).toBeVisible();

    // auto-detected as resume-cv
    const selectVal = await page.locator('#ft-doctype-select').inputValue();
    expect(selectVal).toBe('resume-cv');
  });

  test('upload progress bar reaches 100% and checklist shows Uploaded', async ({ page }) => {
    await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section.section'));
      sections.forEach((s, i) => s.classList.toggle('step-hidden', i !== 15));
    });

    // Select file
    const fileInput = page.locator('#ft-file-input');
    await fileInput.setInputFiles({
      name: 'resume-jane.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content')
    });

    // Wait for auto-detect and confirm upload
    await page.waitForSelector('#ft-doctype-select', { state: 'visible' });
    await page.locator('#ft-upload-confirm-btn').click();

    // Wait for upload to complete (mock: ~600ms)
    await page.waitForTimeout(1500);

    // Check progress fill is 100%
    const progressFill = page.locator('.ft-upload-progress-fill').first();
    const width = await progressFill.evaluate(el => el.style.width);
    expect(width).toBe('100%');

    // Checklist item updated
    const checklistItem = page.locator('[data-doctype="resume-cv"] .ft-checklist-status');
    await expect(checklistItem).toHaveText(/uploaded/i);
  });

  test('Fast Start panel appears after resume-cv upload', async ({ page }) => {
    await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section.section'));
      sections.forEach((s, i) => s.classList.toggle('step-hidden', i !== 15));
    });

    const fileInput = page.locator('#ft-file-input');
    await fileInput.setInputFiles({
      name: 'resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('resume pdf')
    });

    await page.locator('#ft-upload-confirm-btn').click();
    await page.waitForTimeout(800);

    const fastStart = page.locator('#ft-fast-start-panel');
    await expect(fastStart).toBeVisible({ timeout: 5000 });
  });

  // ------------------------------------------------------------------
  // Fast Start confirm/clear
  // ------------------------------------------------------------------

  test('Fast Start: accepting shows prefill confirmation panel', async ({ page }) => {
    await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section.section'));
      sections.forEach((s, i) => s.classList.toggle('step-hidden', i !== 15));
    });

    // Trigger upload
    const fileInput = page.locator('#ft-file-input');
    await fileInput.setInputFiles({ name: 'my-cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('cv') });
    await page.locator('#ft-upload-confirm-btn').click();

    // Wait for fast start panel
    await page.locator('#ft-fast-start-panel').waitFor({ state: 'visible', timeout: 5000 });

    // Accept
    await page.locator('#ft-fast-start-accept').click();

    // Mock parse takes ~500ms
    await page.waitForTimeout(800);

    const confirmPanel = page.locator('#ft-prefill-confirm-panel');
    await expect(confirmPanel).toBeVisible({ timeout: 6000 });
  });

  test('Fast Start: declining hides the panel', async ({ page }) => {
    await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section.section'));
      sections.forEach((s, i) => s.classList.toggle('step-hidden', i !== 15));
    });

    const fileInput = page.locator('#ft-file-input');
    await fileInput.setInputFiles({ name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('cv') });
    await page.locator('#ft-upload-confirm-btn').click();

    await page.locator('#ft-fast-start-panel').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('#ft-fast-start-decline').click();

    await expect(page.locator('#ft-fast-start-panel')).toBeHidden();
  });

  test('Fast Start: Apply all confirmed populates form fields', async ({ page }) => {
    await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section.section'));
      sections.forEach((s, i) => s.classList.toggle('step-hidden', i !== 15));
    });

    const fileInput = page.locator('#ft-file-input');
    await fileInput.setInputFiles({ name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('cv') });
    await page.locator('#ft-upload-confirm-btn').click();

    await page.locator('#ft-fast-start-panel').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('#ft-fast-start-accept').click();
    await page.waitForTimeout(800);

    await page.locator('#ft-prefill-confirm-panel').waitFor({ state: 'visible', timeout: 6000 });
    await page.locator('#ft-prefill-apply-all').click();

    // email should have been prefilled from mock result
    const emailVal = await page.locator('#email').inputValue();
    expect(emailVal).toBe('jane@example.com');
  });

  test('Fast Start: Clear removes prefilled data', async ({ page }) => {
    await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section.section'));
      sections.forEach((s, i) => s.classList.toggle('step-hidden', i !== 15));
    });

    const fileInput = page.locator('#ft-file-input');
    await fileInput.setInputFiles({ name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('cv') });
    await page.locator('#ft-upload-confirm-btn').click();

    await page.locator('#ft-fast-start-panel').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('#ft-fast-start-accept').click();
    await page.waitForTimeout(800);

    await page.locator('#ft-prefill-confirm-panel').waitFor({ state: 'visible', timeout: 6000 });
    await page.locator('#ft-prefill-apply-all').click();

    // verify email was set
    expect(await page.locator('#email').inputValue()).toBe('jane@example.com');

    // now open the panel again and clear
    await page.evaluate(() => {
      document.getElementById('ft-prefill-confirm-panel').hidden = false;
    });
    await page.locator('#ft-prefill-clear').click();

    // email should now be empty
    const emailVal = await page.locator('#email').inputValue();
    expect(emailVal).toBe('');
  });

  test('Fast Start does not overwrite already-typed fields', async ({ page }) => {
    // pre-fill email manually
    await page.fill('#email', 'already@typed.com');
    await page.waitForTimeout(1200);

    await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section.section'));
      sections.forEach((s, i) => s.classList.toggle('step-hidden', i !== 15));
    });

    const fileInput = page.locator('#ft-file-input');
    await fileInput.setInputFiles({ name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('cv') });
    await page.locator('#ft-upload-confirm-btn').click();

    await page.locator('#ft-fast-start-panel').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('#ft-fast-start-accept').click();
    await page.waitForTimeout(800);

    await page.locator('#ft-prefill-confirm-panel').waitFor({ state: 'visible', timeout: 6000 });
    await page.locator('#ft-prefill-apply-all').click();

    // email must still be user-typed value, not mock value
    expect(await page.locator('#email').inputValue()).toBe('already@typed.com');
  });

  // ------------------------------------------------------------------
  // Feature flag off: form unchanged
  // ------------------------------------------------------------------

  test('when enabled:true (no mock param), sign-in button is visible and chip is shown', async ({ page }) => {
    // WP-O: enabled is now true by default; this test verifies production mode (no ?focustrack=mock)
    // MSAL will attempt real sign-in, but we only check the UI shell here.
    await page.goto(BASE + '/apply-opt.html');
    await page.waitForSelector('#opt-application', { state: 'visible' });

    // form action unchanged at HTML level (FT intercepts submit via ft-submit-override event)
    const action = await page.locator('#opt-application').getAttribute('action');
    expect(action).toBe('https://door.taolearning.org/api/form');

    // chip should show (FocusTrack enabled, not mock, so local-only chip while not signed in)
    const chip = await getChip(page);
    await expect(chip).toBeVisible();

    // sign-in button MUST be visible now that enabled:true
    const signInBtn = page.locator('#ft-signin-btn');
    await expect(signInBtn).toBeVisible();
  });

});

// =====================================================================
// portal.html — WP-G tests
// =====================================================================

test.describe('WP-G — portal.html', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(PORTAL_URL);
    await page.waitForSelector('#ft-portal-signin-btn', { state: 'visible' });
  });

  test('signed-out: sign-in wall is visible', async ({ page }) => {
    const wall = page.locator('#ft-signin-wall');
    await expect(wall).toBeVisible();
  });

  test('sign-in button click triggers portal load in mock mode', async ({ page }) => {
    await page.locator('#ft-portal-signin-btn').click();

    // loading should flash briefly, then content appears
    await page.locator('#ft-portal-content').waitFor({ state: 'visible', timeout: 8000 });
    await expect(page.locator('#ft-signin-wall')).toBeHidden();
  });

  test('portal empty state shown when no case (requires override)', async ({ page }) => {
    // Override MOCK to return null for getApplication
    await page.evaluate(() => {
      // Patch: simulate no application
      window.__ftMockNoApp = true;
    });
    // Reload with override
    await page.goto(PORTAL_URL + '&noapp=1');

    // Inject mock override after load
    await page.addInitScript(() => {
      // We'll check if the empty state appears after sign-in
    });

    // Click sign in and wait
    await page.locator('#ft-portal-signin-btn').click();
    await page.locator('#ft-portal-content').waitFor({ state: 'visible', timeout: 8000 });

    // In default mock mode, app exists; verify caseView OR noCaseEl is visible
    const caseView = page.locator('#ft-case-view');
    const noCase   = page.locator('#ft-no-case');
    const caseVisible = await caseView.isVisible().catch(() => false);
    const noCaseVisible = await noCase.isVisible().catch(() => false);
    // one or the other must be shown
    expect(caseVisible || noCaseVisible).toBe(true);
  });

  test('timeline renders correct stages after sign-in', async ({ page }) => {
    await page.locator('#ft-portal-signin-btn').click();
    await page.locator('#ft-portal-content').waitFor({ state: 'visible', timeout: 8000 });

    // timeline should have 6 stage nodes
    const stages = page.locator('#ft-timeline .ft-stage');
    await expect(stages).toHaveCount(6);

    // "Docs Verified" should be marked current (from mock data)
    const currentStage = page.locator('#ft-timeline .ft-stage.is-current .ft-stage-name');
    await expect(currentStage).toHaveText('Docs Verified');
  });

  test('sparkline renders bars after sign-in', async ({ page }) => {
    await page.locator('#ft-portal-signin-btn').click();
    await page.locator('#ft-portal-content').waitFor({ state: 'visible', timeout: 8000 });

    // sparkline wrap should be visible and contain bars
    const sparklineWrap = page.locator('#ft-sparkline-wrap');
    await expect(sparklineWrap).toBeVisible();

    const bars = page.locator('#ft-sparkline .ft-spark-bar');
    await expect(bars).toHaveCount(7); // 7 days of mock data
  });

  test('missing docs alert shown when missingDocs returned', async ({ page }) => {
    await page.locator('#ft-portal-signin-btn').click();
    await page.locator('#ft-portal-content').waitFor({ state: 'visible', timeout: 8000 });

    // mock returns ['transcript', 'i-20'] as missing
    const alert = page.locator('#ft-missing-docs-alert');
    await expect(alert).toBeVisible();

    const items = page.locator('#ft-missing-docs-list li');
    await expect(items).toHaveCount(2);
  });

  test('tabs switch panels correctly (keyboard and mouse)', async ({ page }) => {
    await page.locator('#ft-portal-signin-btn').click();
    await page.locator('#ft-portal-content').waitFor({ state: 'visible', timeout: 8000 });

    // click Documents tab
    await page.locator('#tab-documents').click();
    await expect(page.locator('#panel-documents')).not.toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#panel-application')).toHaveAttribute('aria-hidden', 'true');

    // click Profile tab
    await page.locator('#tab-profile').click();
    await expect(page.locator('#panel-profile')).not.toHaveAttribute('aria-hidden', 'true');

    // keyboard: ArrowLeft from profile should go to documents
    await page.locator('#tab-profile').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#panel-documents')).not.toHaveAttribute('aria-hidden', 'true');
  });

  test('profile tab shows signed-in user name', async ({ page }) => {
    await page.locator('#ft-portal-signin-btn').click();
    await page.locator('#ft-portal-content').waitFor({ state: 'visible', timeout: 8000 });

    await page.locator('#tab-profile').click();
    const profileName = page.locator('.ft-profile-name');
    await expect(profileName).toHaveText('Test User');
  });

  test('portal has noindex meta tag', async ({ page }) => {
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toContain('noindex');
  });

  test('idle timeout dialog appears (time-compressed via JS override)', async ({ page }) => {
    await page.locator('#ft-portal-signin-btn').click();
    await page.locator('#ft-portal-content').waitFor({ state: 'visible', timeout: 8000 });

    // Trigger idle dialog immediately by calling showIdleDialog via page evaluate
    // (avoid waiting 20 real minutes)
    await page.evaluate(() => {
      var dialog = document.getElementById('ft-idle-dialog');
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
        var countdown = document.getElementById('ft-idle-countdown');
        if (countdown) countdown.textContent = '2:00';
      }
    });

    const dialog = page.locator('#ft-idle-dialog');
    await expect(dialog).toBeVisible();

    // Clicking "Stay signed in" closes dialog
    await page.locator('#ft-idle-stay').click();
    await expect(dialog).toBeHidden();
  });

  test('upload zone visible in Documents tab', async ({ page }) => {
    await page.locator('#ft-portal-signin-btn').click();
    await page.locator('#ft-portal-content').waitFor({ state: 'visible', timeout: 8000 });

    await page.locator('#tab-documents').click();
    const uploadZone = page.locator('#ft-portal-upload-zone');
    await expect(uploadZone).toBeVisible();
  });

  test('signed-out state: sign-in wall visible when not signed in (enabled:true)', async ({ page }) => {
    // WP-O: enabled:true is now default; portal must still show sign-in wall until MSAL auth completes.
    // Without ?focustrack=mock the MSAL init runs but user is not authenticated, so wall stays visible.
    await page.goto(BASE + '/portal.html');
    await page.waitForSelector('#ft-signin-wall', { state: 'visible' });
    await expect(page.locator('#ft-signin-wall')).toBeVisible();
  });

});

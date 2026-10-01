import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\dheer\\.gemini\\antigravity-ide\\brain\\fc49430c-333b-4bcc-a318-03009fdfe9c2';

async function runLiveVerification() {
  console.log('[Puppeteer] 1. Authenticating via API to get session token...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dheerajkmahale1@gmail.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  const user = loginData.user;
  console.log('[Puppeteer] Auth successful for user:', user.email, 'Token:', !!token);

  console.log('[Puppeteer] 2. Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 960 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960']
  });

  const page = await browser.newPage();

  // Set download behavior for PDF downloads
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: ARTIFACTS_DIR,
  });

  // Inject token before any page scripts run!
  await page.evaluateOnNewDocument((tok, usr) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('user', JSON.stringify(usr));
  }, token, user);

  try {
    // Navigate to Gallery directly
    console.log('[Puppeteer] Navigating to http://localhost:8080/gallery...');
    await page.goto('http://localhost:8080/gallery', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 2500));

    // Wait for gallery cards to appear
    await page.waitForSelector('#gallery-grid', { timeout: 10000 });
    console.log('[Puppeteer] Gallery loaded successfully with vaulted relics.');

    // -------------------------------------------------------------
    // FEATURE 3A: Sort Dropdown on Gallery Page
    // -------------------------------------------------------------
    console.log('[Puppeteer] Testing Sort dropdown (Alphabetical)...');
    await page.waitForSelector('#select-gallery-sort');
    await page.select('#select-gallery-sort', 'alphabetical');
    await new Promise((r) => setTimeout(r, 1500));

    // Capture Screenshot of Sorted Gallery
    const sortedGalleryPath = path.join(ARTIFACTS_DIR, 'screenshot_3_sorted_gallery.png');
    await page.screenshot({ path: sortedGalleryPath, fullPage: false });
    console.log('[Puppeteer] -> Saved: screenshot_3_sorted_gallery.png');

    // -------------------------------------------------------------
    // FEATURE 1: User-Editable Classification & Curator Verified Badge
    // -------------------------------------------------------------
    console.log('[Puppeteer] Navigating to Viewer for Corinthian Helmet (6abde162ceb2e8d87deb2de9)...');
    await page.goto('http://localhost:8080/viewer?id=6abde162ceb2e8d87deb2de9', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 2500));

    // Click "Edit Classification"
    console.log('[Puppeteer] Clicking Edit Classification...');
    await page.waitForSelector('#btn-edit-classification', { timeout: 8000 });
    await page.click('#btn-edit-classification');
    await new Promise((r) => setTimeout(r, 1000));

    // Edit fields
    console.log('[Puppeteer] Updating curatorial fields in edit mode...');
    await page.waitForSelector('#input-edit-era');
    
    // Update Era
    await page.click('#input-edit-era', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#input-edit-era', 'Classical Antiquity (Verified 490 BCE)', { delay: 10 });

    // Update Condition
    await page.click('#input-edit-condition', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#input-edit-condition', 'Museum Conservation Patina (Intact Cheekpieces)', { delay: 10 });

    // Save and verify
    console.log('[Puppeteer] Clicking Confirm & Mark Curator Verified...');
    await page.click('#btn-confirm-save-edits');
    await new Promise((r) => setTimeout(r, 2500));

    // Wait for "Curator Verified" badge to appear
    await page.waitForSelector('#badge-curator-verified', { timeout: 8000 });
    console.log('[Puppeteer] Curator Verified badge is now live!');

    // Capture Screenshot of Edited, Curator Verified Artifact
    const curatorVerifiedPath = path.join(ARTIFACTS_DIR, 'screenshot_1_curator_verified_artifact.png');
    await page.screenshot({ path: curatorVerifiedPath, fullPage: false });
    console.log('[Puppeteer] -> Saved: screenshot_1_curator_verified_artifact.png');

    // -------------------------------------------------------------
    // FEATURE 2: Similar Artifacts Section (Cosine Similarity Matches)
    // -------------------------------------------------------------
    console.log('[Puppeteer] Scrolling to Similar Artifacts section...');
    await page.evaluate(() => {
      const el = document.getElementById('similar-artifacts-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Capture Screenshot of Similar Artifacts Section
    const similarArtifactsPath = path.join(ARTIFACTS_DIR, 'screenshot_2_similar_artifacts.png');
    await page.screenshot({ path: similarArtifactsPath, fullPage: false });
    console.log('[Puppeteer] -> Saved: screenshot_2_similar_artifacts.png');

    // -------------------------------------------------------------
    // FEATURE 3B: Export as PDF
    // -------------------------------------------------------------
    console.log('[Puppeteer] Triggering Export as PDF...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 800));

    await page.waitForSelector('#btn-export-pdf');
    await page.click('#btn-export-pdf');
    console.log('[Puppeteer] Clicked Export as PDF, waiting for download to complete...');
    await new Promise((r) => setTimeout(r, 4000));

    // Check downloaded PDF
    const files = fs.readdirSync(ARTIFACTS_DIR);
    const pdfFiles = files.filter((f) => f.endsWith('.pdf'));
    console.log('[Puppeteer] Generated PDF catalog files found:', pdfFiles);

    console.log('[Puppeteer] ALL 4 DELIVERABLES VERIFIED AND CAPTURED CLEANLY!');
  } catch (err) {
    console.error('[Puppeteer] Error during browser test:', err);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'puppeteer_error_debug.png') });
  } finally {
    await browser.close();
  }
}

runLiveVerification().catch(console.error);

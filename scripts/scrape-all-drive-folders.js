const { chromium } = require('@playwright/test');
const fs = require('fs');

async function scrapeAllDriveFolders() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  
  const driveUrl = 'https://drive.google.com/drive/folders/1VQ6IHTjk5sJYjJckZY1kzeRJAI5d09Od?usp=drive_link';
  console.log('Opening Drive folder in Edge...');
  await page.goto(driveUrl, { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(3000);

  // Focus on the list/grid view
  await page.click('body');
  await page.keyboard.press('Home');
  await page.waitForTimeout(1000);

  const foundFolders = new Map();

  function extractCurrent() {
    return page.evaluate(() => {
      const items = [];
      // Google Drive items have role="row" or [data-id]
      const rows = document.querySelectorAll('[data-id]');
      rows.forEach(el => {
        const id = el.getAttribute('data-id');
        const text = (el.innerText || el.getAttribute('aria-label') || '').trim();
        if (id && text) {
          items.push({ id, text });
        }
      });
      return items;
    });
  }

  console.log('Starting scrolling capture across the entire list...');
  let consecutiveNoNew = 0;
  let totalSteps = 0;

  while (consecutiveNoNew < 25 && totalSteps < 150) {
    totalSteps++;
    const current = await extractCurrent();
    let newInThisStep = 0;
    for (const item of current) {
      if (!foundFolders.has(item.id)) {
        foundFolders.set(item.id, item.text);
        newInThisStep++;
      }
    }

    if (newInThisStep === 0) {
      consecutiveNoNew++;
    } else {
      consecutiveNoNew = 0;
    }

    // Scroll down
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(400);

    if (totalSteps % 10 === 0) {
      console.log(`Step ${totalSteps}: ${foundFolders.size} unique items collected so far...`);
    }
  }

  console.log(`Finished scrolling! Total unique Drive items: ${foundFolders.size}`);
  await browser.close();

  // Convert to clean list
  const results = [];
  for (const [id, rawText] of foundFolders.entries()) {
    const firstLine = rawText.split('\n')[0].trim();
    // Match plate
    const m = rawText.match(/[A-Za-z]{2,4}\s*[-]?\s*[0-9]{2,4}/);
    const plate = m ? m[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
    results.push({ id, name: firstLine, plate, rawText });
  }

  return results;
}

scrapeAllDriveFolders().then(res => {
  fs.writeFileSync('scratch/all_drive_folders.json', JSON.stringify(res, null, 2), 'utf8');
  console.log(`Saved ${res.length} items to scratch/all_drive_folders.json`);
}).catch(console.error);

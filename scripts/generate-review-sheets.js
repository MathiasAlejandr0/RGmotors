const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Simple static file server
const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/review-covers.html';

  if (reqUrl === '/api/vehicles') {
    const vehicles = fs.readFileSync(path.join(__dirname, '../data/vehicles.json'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(vehicles);
    return;
  }

  const filePath = path.join(__dirname, '../public', reqUrl);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.json': 'application/json'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3456, async () => {
  console.log('Server running on http://localhost:3456');

  const scratchDir = path.join(__dirname, '../scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3456/review-covers.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const totalCards = await page.locator('.vehicle-card').count();
  console.log(`Found ${totalCards} vehicles with photos.`);

  // Capture batches of 5 cars
  const batchSize = 5;
  const numBatches = Math.ceil(totalCards / batchSize);

  for (let b = 0; b < numBatches; b++) {
    const startIdx = b * batchSize;
    const endIdx = Math.min(startIdx + batchSize, totalCards);

    // Hide all cards except startIdx...endIdx - 1
    await page.evaluate(({ start, end }) => {
      document.querySelectorAll('.vehicle-card').forEach((el, i) => {
        el.style.display = (i >= start && i < end) ? 'block' : 'none';
      });
      window.scrollTo(0, 0);
    }, { start: startIdx, end: endIdx });

    await page.waitForTimeout(500);
    const screenshotPath = path.join(scratchDir, `batch-${b + 1}.jpg`);
    await page.screenshot({ path: screenshotPath, fullPage: true, quality: 75 });
    console.log(`Captured batch ${b + 1} (${startIdx + 1} - ${endIdx}) to ${screenshotPath}`);
  }

  await browser.close();
  server.close();
  console.log('Done capturing all batches!');
  process.exit(0);
});

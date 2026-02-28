// scripts/sync-sheets.js
// ─────────────────────────────────────────────────────────────────────────────
// Executed by the GitHub Action (.github/workflows/sync-sheets.yml).
// Reads Google Sheets → writes data/cars.json + data/settings.json
//
// Required env vars (set as GitHub Secrets):
//   GOOGLE_SERVICE_ACCOUNT_JSON — base64-encoded service account JSON
//   GOOGLE_SHEET_ID             — spreadsheet ID from the URL
//
// Sheet structure:
//   Fleet tab    → columns A:L (see FLEET_COLUMNS below)
//   Settings tab → columns A:B (key / value pairs)
//
// CdC v4 §3.2
// ─────────────────────────────────────────────────────────────────────────────

const { google } = require('googleapis');
const fs         = require('fs');
const path       = require('path');

// ── Column order in the Fleet sheet (A through L) ────────────────────────────
const FLEET_COLUMNS = [
  'id',            // A
  'category',      // B
  'name',          // C
  'price',         // D
  'unit',          // E
  'features',      // F — pipe-separated string "Climatisation|Bluetooth|..."
  'badge',         // G
  'imagePublicId', // H — Cloudinary public_id
  'imageAlt',      // I
  'active',        // J — "TRUE" or "FALSE"
  'createdAt',     // K
  'updatedAt'      // L
];

async function main() {

  // ── Authenticate via Service Account ────────────────────────────────────────
  const encoded     = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId     = process.env.GOOGLE_SHEET_ID;

  if (!encoded || !sheetId) {
    console.error('[sync-sheets] Missing env vars: GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SHEET_ID');
    process.exit(1);
  }

  const credentials = JSON.parse(
    Buffer.from(encoded, 'base64').toString('utf8')
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // ── Read Fleet tab ───────────────────────────────────────────────────────────
  const fleetRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range:         'Fleet!A:L'
  });

  const fleetRows = fleetRes.data.values || [];

  if (fleetRows.length === 0) {
    console.warn('[sync-sheets] Fleet sheet is empty — writing empty cars array');
  }

  // First row is headers — skip it
  const [, ...dataRows] = fleetRows;

  const cars = dataRows
    .map(row => {
      // Skip completely empty rows (happens when a car is "deleted" by clearing the row)
      if (!row || row.every(cell => !cell)) return null;

      const car = {};
      FLEET_COLUMNS.forEach((col, i) => {
        car[col] = row[i] !== undefined ? String(row[i]).trim() : '';
      });

      // Normalize types
      car.active   = car.active === 'TRUE';
      car.features = car.features
        ? car.features.split('|').map(f => f.trim()).filter(Boolean)
        : [];

      return car;
    })
    .filter(Boolean); // remove null rows

  console.log(`[sync-sheets] Read ${cars.length} cars from Fleet sheet`);

  // ── Read Settings tab ────────────────────────────────────────────────────────
  const settingsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range:         'Settings!A:B'
  });

  const settingsRows = settingsRes.data.values || [];
  const settings     = {};

  settingsRows.forEach(([key, val]) => {
    if (key) settings[String(key).trim()] = val ? String(val).trim() : '';
  });

  console.log(`[sync-sheets] Read ${Object.keys(settings).length} settings`);

  // ── Write data/cars.json ─────────────────────────────────────────────────────
  const carsJson = {
    version:   Date.now().toString(),
    updatedAt: new Date().toISOString(),
    cars
  };

  const carsPath = path.join(process.cwd(), 'data', 'cars.json');
  fs.mkdirSync(path.dirname(carsPath), { recursive: true });
  fs.writeFileSync(carsPath, JSON.stringify(carsJson, null, 2));
  console.log(`[sync-sheets] Wrote ${carsPath}`);

  // ── Write data/settings.json ─────────────────────────────────────────────────
  const settingsJson = {
    ...settings,
    updatedAt: new Date().toISOString()
  };

  const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify(settingsJson, null, 2));
  console.log(`[sync-sheets] Wrote ${settingsPath}`);

  console.log('[sync-sheets] Done ✓');
}

main().catch(err => {
  console.error('[sync-sheets] Fatal error:', err.message);
  process.exit(1);
});

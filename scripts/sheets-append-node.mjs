
import { google } from 'googleapis';
import { readFileSync } from 'fs';
const SPREADSHEET_ID =
  process.env.GOOGLE_SPREADSHEET_ID || '1hpkMLCCJxAUx3pXpzewEySK9NprdBFKytyecFG-yW9w';
const SHEET_TAB = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
const CRED = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!CRED) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to the service account JSON file path.');
  process.exit(1);
}

const keys = JSON.parse(readFileSync(CRED, 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

const exampleRow = [
  'TestScout',
  '1',
  '2706',
  'At Hub',
  'false',
  'false',
  'false',
  '',
  '',
  '',
  '',
  '',
  '3',
  '3',
  '',
  'false',
  'false',
  'false',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
];

const range = `${SHEET_TAB}!A:A`;

await sheets.spreadsheets.values.append({
  spreadsheetId: SPREADSHEET_ID,
  range,
  valueInputOption: 'USER_ENTERED',
  insertDataOption: 'INSERT_ROWS',
  requestBody: {
    values: [exampleRow],
  },
});

console.log('Appended one row via Sheets API.');

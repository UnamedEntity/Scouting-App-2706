/**
 * Deploy as Web app: Execute as "Me", Who has access: "Anyone" (or your team).
 * Replace SPREADSHEET_ID with your sheet if not sent by the client.
 * Enable: Extensions → Apps Script
 */
const DEFAULT_SPREADSHEET_ID = '1hpkMLCCJxAUx3pXpzewEySK9NprdBFKytyecFG-yW9w';
const DEFAULT_SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    var body = e.postData && e.postData.contents ? e.postData.contents : '{}';
    var data = JSON.parse(body);

    var spreadsheetId = data.spreadsheetId || DEFAULT_SPREADSHEET_ID;
    var sheetName = data.sheetName || DEFAULT_SHEET_NAME;
    var row = data.row;

    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    var firstRow = sheet.getLastRow() === 0;
    if (firstRow && data.headers && data.headers.length) {
      sheet.appendRow(data.headers);
    }

    if (row && row.length) {
      sheet.appendRow(row);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: 'No row array in payload' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Scouting sheet endpoint (POST JSON).').setMimeType(
    ContentService.MimeType.TEXT
  );
}

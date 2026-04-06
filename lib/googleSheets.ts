/**
 * Match scouting row layout aligned with Google Sheets append (values as a single row).
 * Same order as CSV / QR export.
 */
export const MATCH_SCOUTING_FIELD_ORDER = [
  'nameOfScout',
  'matchNumber',
  'teamNumber',
  'startLocation',
  'autoMortality',
  'underTrench',
  'overBump',
  'intakeLocations',
  'shootLocationAuto',
  'climbOptions',
  'autoPath',
  'autoNotes',
  'shooterScale',
  'accuracyScale',
  'shootingLocationTeleop',
  'teleopMortality',
  'bump',
  'trench',
  'intakeLocation',
  'inactivePeriod',
  'actualClimb',
  'typeOfRobot',
  'defenseScale',
  'penaltyNotes',
  'endNotes',
] as const;

export type MatchScoutingField = (typeof MATCH_SCOUTING_FIELD_ORDER)[number];

export type MatchScoutingData = Partial<
  Record<MatchScoutingField, string | number | boolean | string[]>
>;

/** Escape a single CSV cell (same rules as QR CSV line). */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let stringValue = String(value);
  stringValue = stringValue.replace(/"/g, '""');
  if (/[",\n]/.test(stringValue)) {
    stringValue = `"${stringValue}"`;
  }
  return stringValue;
}

/** One row for Sheets: each column is a string; arrays joined with | */
export function formatMatchRowValues(data: Partial<MatchScoutingData>): string[] {
  return MATCH_SCOUTING_FIELD_ORDER.map((key) => {
    const value = data[key];
    const processed = Array.isArray(value) ? value.join('|') : value;
    return processed === null || processed === undefined ? '' : String(processed);
  });
}

/**
 * POST body: scouting fields at top level (legacy scripts), plus
 * `row` / `headers` / spreadsheet ids for Sheets-style append (same shape as API values).
 */
export type SheetAppendPayload = Partial<MatchScoutingData> & {
  spreadsheetId: string;
  sheetName: string;
  headers: readonly string[];
  row: string[];
  scoutingData: Partial<MatchScoutingData>;
};

export function buildMatchSheetAppendPayload(
  data: Partial<MatchScoutingData>,
  spreadsheetId: string,
  sheetName: string
): SheetAppendPayload {
  return {
    ...data,
    spreadsheetId,
    sheetName,
    headers: [...MATCH_SCOUTING_FIELD_ORDER],
    row: formatMatchRowValues(data),
    scoutingData: data,
  };
}

export type SubmitToSheetResult =
  | { ok: true; status?: number }
  | { ok: false; error: string };

/**
 * POST structured row to a Google Apps Script web app (or any endpoint that writes to Sheets).
 * Script should read JSON and append `row` to the sheet identified by spreadsheetId / sheetName.
 */
export async function submitMatchScoutingToSheet(
  webAppUrl: string,
  payload: SheetAppendPayload
): Promise<SubmitToSheetResult> {
  if (!webAppUrl?.trim()) {
    return { ok: false, error: 'Missing Google web app URL (set extra.googleScriptUrl in app.json).' };
  }
  try {
    // Use text/plain (not application/json) so the browser sends a "simple" request.
    // JSON + application/json triggers a CORS preflight that Google Apps Script web apps
    // do not answer, so fetch fails on web. The script still reads e.postData.contents as JSON.
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    let parsed: { status?: string } | null = null;
    try {
      parsed = text ? (JSON.parse(text) as { status?: string }) : null;
    } catch {
      /* Apps Script may return plain text */
    }
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}: ${text.slice(0, 200)}` };
    }
    if (parsed?.status === 'error') {
      return { ok: false, error: text.slice(0, 200) };
    }
    return { ok: true, status: response.status };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}

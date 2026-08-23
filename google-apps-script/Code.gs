/**
 * Amplify RSVP  ->  Google Sheet
 *
 * This is the source of truth for the Apps Script behind the RSVP form. It is
 * kept in the repo so the script has version history; Google is only where it
 * runs. If you edit it in the Apps Script editor, paste the change back here.
 *
 * TO UPDATE THE LIVE SCRIPT (keeps the same /exec URL):
 *   1. The Sheet  ▸  Extensions  ▸  Apps Script.
 *   2. Select all, paste this file over it, Save.
 *   3. Deploy  ▸  Manage deployments  ▸  pencil (edit) icon
 *        ▸  Version: "New version"  ▸  Deploy.
 *
 *   Use "Manage deployments", NOT "New deployment". A new deployment gets a
 *   NEW /exec URL, which would silently orphan the site — the form would post
 *   into nothing. The URL the site uses is hardcoded in:
 *      src/pages/api/rsvp.ts
 *
 * TO CHECK IT WORKED: open the /exec URL in a browser. You should see
 *   "Amplify RSVP endpoint is live."
 *
 * CONTRACT — do not change without changing src/pages/api/rsvp.ts to match.
 * The site reads the JSON body of the reply and only tells the person they are
 * on the list when it sees {ok: true}. Apps Script always answers HTTP 200,
 * even for failures, so that flag is the only thing distinguishing a saved row
 * from a lost one.
 */

var SHEET_NAME = 'RSVPs';

// Column order. To add a question later, append its key to the END of this
// list and redeploy — the header row repairs itself on the next submission.
// Do not insert into the middle: existing rows would fall out of alignment
// with their headers.
var HEADERS = [
  'timestamp', 'name', 'age', 'describe', 'school', 'area', 'music',
  'instruments', 'listen', 'why', 'find', 'showup', 'first',
  'dream', 'telegram', 'heard', 'mailing_list', 'event'
];

/**
 * Writes the header row if it is missing or out of date. The previous version
 * only did this on a completely empty sheet, so adding a column to a sheet
 * that already held RSVPs left the new column with a blank header.
 */
function ensureHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  var current = (sheet.getLastRow() > 0 && lastCol > 0)
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0]
    : [];

  var upToDate = current.length === HEADERS.length && HEADERS.every(function (h, i) {
    return current[i] === h;
  });
  if (upToDate) return;

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // avoid two submissions clobbering each other
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    ensureHeaders(sheet);

    var data = JSON.parse(e.postData.contents);
    var row = HEADERS.map(function (h) {
      return data[h] != null ? data[h] : '';
    });
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Lets you sanity-check the deployment by opening the URL in a browser.
function doGet() {
  return ContentService.createTextOutput('Amplify RSVP endpoint is live.');
}

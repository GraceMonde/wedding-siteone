// Paste this into Extensions > Apps Script inside your Google Sheet.
// After changing it: Deploy > Manage deployments > edit (pencil) > Version: New version > Deploy.
const TAB = "RSVPs";
const HEADERS = ["Time", "Name", "Attending", "Note"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.appendRow(HEADERS);
  } else {
    const lastColumn = sh.getLastColumn();
    const headers = lastColumn
      ? sh.getRange(1, 1, 1, lastColumn).getValues()[0]
      : [];
    if (!headers.length) {
      sh.appendRow(HEADERS);
    } else if (!headers.includes("Note")) {
      // Add Note to existing RSVP sheets so new notes are not silently dropped.
      sh.getRange(1, lastColumn + 1).setValue("Note");
    }
  }
  return sh;
}

// Called when a guest submits the RSVP form
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const name = String(d.name || "").trim().slice(0, 100);
  if (!name) return json_({ ok: false, error: "Name is required" }); // blanks are never saved

  const values = {
    Time: new Date(),
    Name: name,
    Attending: d.attending === "yes" ? "yes" : "no",
    Note: String(d.note || "").slice(0, 500)
  };

  // Write each value under its own column header, so an older tab that still
  // has a "Guests" column keeps working (that column is just left blank).
  const sh = sheet_();
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  sh.appendRow(headers.map(h => (h in values ? values[h] : "")));
  return json_({ ok: true });
}

// Called by guests.html.
function doGet() {
  const rows = sheet_().getDataRange().getValues();
  const headers = rows.shift();
  const nameCol = headers.indexOf("Name");
  const attendingCol = headers.indexOf("Attending");
  const noteCol = headers.indexOf("Note");
  return json_(rows.map(r => ({
    name: r[nameCol],
    attending: r[attendingCol],
    note: noteCol < 0 ? "" : r[noteCol]
  })));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ── Plugueo · Casa Mantenimiento · Apps Script API ───────────────────────
//
// Setup instructions:
// 1. In Google Sheets: Extensions → Apps Script
// 2. Paste this entire file
// 3. Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the deployment URL into index.html (APPS_SCRIPT_URL constant)
// 5. Run setupWeeklyTrigger() once to activate Sunday email reminders

const SHEET_LOG    = "📋 Log";
const SHEET_ESTADO = "📊 Estado";
const SS           = SpreadsheetApp.getActiveSpreadsheet();

// ── POST: log a new maintenance entry ────────────────────────────────────
function doPost(e) {
  try {
    const data    = JSON.parse(e.postData.contents);
    const sheet   = SS.getSheetByName(SHEET_LOG);

    const timestamp = Utilities.formatDate(new Date(), "America/Asuncion", "yyyy-MM-dd HH:mm");
    const fecha     = data.date    || Utilities.formatDate(new Date(), "America/Asuncion", "dd/MM/yyyy");
    const item      = data.item    || "";
    const seccion   = data.section || "";
    const label     = data.label   || "";
    const user      = data.user    || "Daniel";

    // Calculate days since last entry for this item
    const allData = sheet.getDataRange().getValues();
    let lastDate  = null;
    for (let i = allData.length - 1; i >= 2; i--) {
      if (allData[i][2] === item) {
        lastDate = new Date(allData[i][1].split("/").reverse().join("-"));
        break;
      }
    }
    const daysSince = lastDate
      ? Math.floor((new Date() - lastDate) / 86400000)
      : "";

    sheet.appendRow([timestamp, fecha, item, seccion, daysSince, label, user]);
    updateEstado(item, fecha);

    const output = ContentService.createTextOutput(JSON.stringify({ ok: true }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;

  } catch(err) {
    const output = ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: err.message })
    );
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

// ── GET: return current status of all items ───────────────────────────────
function doGet(e) {
  try {
    const sheet = SS.getSheetByName(SHEET_ESTADO);
    const data  = sheet.getDataRange().getValues();
    const items = [];

    for (let i = 3; i < data.length; i++) {
      const row = data[i];
      if (!row[1]) continue;
      items.push({
        section:  row[0],
        item:     row[1],
        frequency: row[2],
        lastDate: row[3]
          ? Utilities.formatDate(new Date(row[3]), "America/Asuncion", "dd/MM/yyyy")
          : null,
        status:   row[6],
      });
    }

    const output = ContentService.createTextOutput(
      JSON.stringify({ ok: true, items })
    );
    output.setMimeType(ContentService.MimeType.JSON);
    return output;

  } catch(err) {
    const output = ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: err.message })
    );
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

// ── Update last date in Estado sheet ─────────────────────────────────────
function updateEstado(itemName, fecha) {
  const sheet = SS.getSheetByName(SHEET_ESTADO);
  const data  = sheet.getDataRange().getValues();
  for (let i = 3; i < data.length; i++) {
    if (data[i][1] === itemName) {
      const dateObj = new Date(fecha.split("/").reverse().join("-"));
      sheet.getRange(i + 1, 4).setValue(dateObj);
      sheet.getRange(i + 1, 4).setNumberFormat("DD/MM/YYYY");
      break;
    }
  }
}

// ── Weekly email report ───────────────────────────────────────────────────
function sendWeeklyReport() {
  const sheet   = SS.getSheetByName(SHEET_ESTADO);
  const data    = sheet.getDataRange().getValues();
  const overdue  = [];
  const upcoming = [];

  for (let i = 3; i < data.length; i++) {
    const status   = data[i][6];
    const daysLeft = data[i][5];
    const item     = data[i][1];
    if (status === "VENCIDO") overdue.push(item);
    if (typeof daysLeft === "number" && daysLeft >= 0 && daysLeft <= 7)
      upcoming.push(`${item} (en ${daysLeft}d)`);
  }

  if (!overdue.length && !upcoming.length) return;

  const email = Session.getActiveUser().getEmail();
  const body  = [
    overdue.length  ? "⚠ VENCIDOS:\n" + overdue.join("\n") : "",
    upcoming.length ? "\n📅 PRÓXIMOS 7 DÍAS:\n" + upcoming.join("\n") : "",
  ].filter(Boolean).join("\n");

  GmailApp.sendEmail(email, "🏠 Mantenimiento Casa · Resumen semanal", body);
}

// ── Run once to activate Sunday 9am trigger ───────────────────────────────
function setupWeeklyTrigger() {
  ScriptApp.newTrigger("sendWeeklyReport")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(9)
    .create();
  Logger.log("Weekly trigger configured ✓");
}

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  Resilienzpfade – Waldbaden · Google Apps Script v2      ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * SETUP (einmalig):
 * 1. Code hier einfügen → Speichern
 * 2. Funktion "setupSheets" ausführen → legt alle Sheets + Drive-Ordner an
 * 3. Bereitstellen → Neue Bereitstellung → Web-App
 *    · Ausführen als: Ich  |  Zugriff: Jeder
 * 4. URL in index.html bei APPS_URL eintragen
 */

const SHEET_ID         = '171ttO0cWO0rhjWjyWX0h7-0evVzI-RfQMPu0w_JL2vU';
const EMAIL_EMPFAENGER = 'laura.naturlauf@gmail.com';

// ─────────────────────────────────────────────────────────────
// HILFS-FUNKTIONEN
// ─────────────────────────────────────────────────────────────

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(ss, name) {
  const s = ss.getSheetByName(name);
  if (!s) throw new Error('Sheet "' + name + '" fehlt – bitte setupSheets() ausführen.');
  return s;
}

/**
 * Google Sheets liefert Datum-/Zeit-Zellen als Date-Objekte.
 * Zeit-Werte liegen auf 1899-12-30 → als HH:MM ausgeben.
 * Datums-Werte → YYYY-MM-DD.
 */
function cellToString(cell) {
  if (cell instanceof Date && !isNaN(cell)) {
    if (cell.getFullYear() < 1901) {
      // Zeit-Zelle (z.B. 10:00 → 1899-12-30 10:00:00)
      return String(cell.getHours()).padStart(2,'0') + ':' + String(cell.getMinutes()).padStart(2,'0');
    }
    // Datums-Zelle
    return cell.getFullYear() + '-'
      + String(cell.getMonth()+1).padStart(2,'0') + '-'
      + String(cell.getDate()).padStart(2,'0');
  }
  return String(cell == null ? '' : cell);
}

function getDriveFolder() {
  const props    = PropertiesService.getScriptProperties();
  let   folderId = props.getProperty('GALLERY_FOLDER_ID');
  if (folderId) {
    try { return DriveApp.getFolderById(folderId); } catch(e) {}
  }
  const folder = DriveApp.createFolder('Resilienzpfade-Galerie');
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  props.setProperty('GALLERY_FOLDER_ID', folder.getId());
  return folder;
}

// ─────────────────────────────────────────────────────────────
// GET – Daten lesen
// ─────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    const action    = (e.parameter && e.parameter.action)  || '';
    const sheetName = (e.parameter && e.parameter.sheet)   || '';
    const ss        = SpreadsheetApp.openById(SHEET_ID);

    // ── Inhalte als Key-Value-Map liefern ─────────────────────
    if (action === 'getInhalte') {
      const sheet  = getSheet(ss, 'Inhalte');
      const rows   = sheet.getLastRow() > 1
        ? sheet.getRange(2, 1, sheet.getLastRow()-1, 2).getValues()
        : [];
      const content = {};
      rows.forEach(function(r) { if (r[0]) content[String(r[0])] = String(r[1]||''); });
      return jsonResponse({ content: content });
    }

    // ── Normaler Sheet-Zugriff (Kurse, Galerie) ───────────────
    if (action === 'get' && sheetName) {
      const sheet = getSheet(ss, sheetName);
      if (sheet.getLastRow() < 1) return jsonResponse({ values: [] });
      const values = sheet.getDataRange().getValues();
      const formatted = values.map(function(row) {
        return row.map(function(cell) { return cellToString(cell); });
      });
      return jsonResponse({ values: formatted });
    }

    return jsonResponse({ error: 'Ungültige Anfrage', values: [] });

  } catch (err) {
    Logger.log('doGet: ' + err.message);
    return jsonResponse({ error: err.message, values: [] });
  }
}

// ─────────────────────────────────────────────────────────────
// POST – Daten schreiben
// ─────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const raw    = (e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const data   = JSON.parse(raw);
    const action = data.action || '';
    const ss     = SpreadsheetApp.openById(SHEET_ID);

    // ── Kurs anlegen ──────────────────────────────────────────
    if (action === 'addKurs') {
      getSheet(ss,'Kurse').appendRow([
        data.name||'', data.datum||'', data.uhrzeit||'',
        data.ort||'', data.treffpunkt||'',
        data.verfueg||'Verfügbar', data.preis||'',
      ]);
      return jsonResponse({ status:'ok' });
    }

    // ── Bild-URL anlegen ──────────────────────────────────────
    if (action === 'addBild') {
      getSheet(ss,'Galerie').appendRow([data.url||'', data.alt||'']);
      return jsonResponse({ status:'ok' });
    }

    // ── Bild-Datei hochladen (Base64 → Google Drive) ──────────
    if (action === 'addBildFile') {
      if (!data.base64) throw new Error('Kein Bild-Inhalt übergeben');

      const mimeType = data.mimeType || 'image/jpeg';
      const filename = data.filename || ('foto-' + Date.now() + '.jpg');
      const folder   = getDriveFolder();

      const decoded  = Utilities.base64Decode(data.base64);
      const blob     = Utilities.newBlob(decoded, mimeType, filename);
      const file     = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      const url = 'https://drive.google.com/uc?export=view&id=' + file.getId();
      getSheet(ss,'Galerie').appendRow([url, data.alt||filename]);
      return jsonResponse({ status:'ok', url: url });
    }

    // ── Inhalte speichern ─────────────────────────────────────
    if (action === 'updateInhalte') {
      const sheet   = getSheet(ss, 'Inhalte');
      const updates = data.updates || {};
      if (!Object.keys(updates).length) return jsonResponse({ status:'ok', updated:0 });

      const rows    = sheet.getLastRow() > 1
        ? sheet.getRange(2, 1, sheet.getLastRow()-1, 2).getValues()
        : [];

      // Bestehende Keys → Zeilennummer (1-basiert, ab Zeile 2)
      const keyRow = {};
      rows.forEach(function(r, i) { if (r[0]) keyRow[String(r[0])] = i + 2; });

      Object.keys(updates).forEach(function(key) {
        const val = updates[key];
        if (keyRow[key]) {
          sheet.getRange(keyRow[key], 2).setValue(val);
        } else {
          sheet.appendRow([key, val]);
          keyRow[key] = sheet.getLastRow();
        }
      });

      return jsonResponse({ status:'ok', updated: Object.keys(updates).length });
    }

    // ── Zeile löschen ─────────────────────────────────────────
    if (action === 'deleteRow') {
      const rowNum = parseInt(data.row);
      if (!data.sheet || isNaN(rowNum) || rowNum < 2) throw new Error('Ungültige Löschanfrage');
      const sheet = getSheet(ss, data.sheet);
      if (rowNum > sheet.getLastRow()) throw new Error('Zeile nicht vorhanden');
      sheet.deleteRow(rowNum);
      return jsonResponse({ status:'ok' });
    }

    // ── Privatkurs-Anfrage ────────────────────────────────────
    if (action === 'anfrage') {
      try {
        getSheet(ss,'Anfragen').appendRow([
          new Date().toLocaleString('de-DE'),
          data.name||'', data.email||'', data.phone||'',
          data.type||'', data.date||'', data.message||'',
        ]);
      } catch(sheetErr) { Logger.log('Anfragen-Sheet: ' + sheetErr.message); }

      MailApp.sendEmail({
        to:      EMAIL_EMPFAENGER,
        subject: '[Resilienzpfade] Neue Anfrage von ' + (data.name||'Unbekannt'),
        body: [
          'Neue Privatanfrage über resilienzpfade:\n',
          'Name:    '      + (data.name   ||'-'),
          'E-Mail:  '      + (data.email  ||'-'),
          'Telefon: '      + (data.phone  ||'-'),
          'Kurstyp: '      + (data.type   ||'-'),
          'Wunsch: '       + (data.date   ||'-'),
          '\nNachricht:\n' + (data.message||'-'),
        ].join('\n'),
        replyTo: data.email||'',
      });

      if (data.email && data.email.indexOf('@') !== -1) {
        try {
          MailApp.sendEmail({
            to:      data.email,
            subject: 'Deine Anfrage ist angekommen – Resilienzpfade',
            body: [
              'Hallo ' + ((data.name||'').split(' ')[0]) + ',\n',
              'ich habe deine Anfrage erhalten und melde mich innerhalb von 1–2 Werktagen.\n',
              'Kurstyp:      ' + (data.type   ||'-'),
              'Wunschdatum:  ' + (data.date   ||'-'),
              'Deine Nachricht:\n' + (data.message||'-'),
              '\nBis bald im Wald,\nLaura\n',
              '─────────────────────────',
              'Resilienzpfade · Laura Demory',
              'laura.naturlauf@gmail.com · 0176 31152691',
            ].join('\n'),
          });
        } catch(mErr) { Logger.log('Bestätigungsmail: ' + mErr.message); }
      }
      return jsonResponse({ status:'ok' });
    }

    return jsonResponse({ error:'Unbekannte Aktion: ' + action });

  } catch(err) {
    Logger.log('doPost: ' + err.message);
    return jsonResponse({ error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────
// SETUP – einmalig manuell ausführen!
// ─────────────────────────────────────────────────────────────

function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Tabellenblätter
  var sheets = [
    { name:'Kurse',    headers:['Name','Datum','Uhrzeit','Ort','Treffpunkt','Verfuegbarkeit','Preis'] },
    { name:'Galerie',  headers:['URL','Alt-Text'] },
    { name:'Anfragen', headers:['Datum','Name','Email','Telefon','Typ','Wunschdatum','Nachricht'] },
    { name:'Inhalte',  headers:['Schluessel','Wert'] },
  ];

  sheets.forEach(function(cfg) {
    var sheet = ss.getSheetByName(cfg.name) || ss.insertSheet(cfg.name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(cfg.headers);
      var hdr = sheet.getRange(1, 1, 1, cfg.headers.length);
      hdr.setFontWeight('bold');
      hdr.setBackground('#1c3d28');
      hdr.setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      sheet.setColumnWidths(1, cfg.headers.length, 180);
    }
  });

  // Inhalte-Defaults befüllen (nur wenn leer)
  var inhSheet = ss.getSheetByName('Inhalte');
  if (inhSheet.getLastRow() <= 1) {
    var defaults = [
      ['hero_line1',      'Im Wald'],
      ['hero_line2',      'zu sich finden'],
      ['hero_sub',        'Waldbaden als Weg zur inneren Stille, Kraft und Heilung'],
      ['feat1_titel',     'Tiefe Achtsamkeit'],
      ['feat1_text',      'Mit allen Sinnen im Moment ankommen. Den Alltag loslassen und im Hier und Jetzt sein – ganz ohne Anstrengung.'],
      ['feat2_titel',     'Shinrin-Yoku'],
      ['feat2_text',      'Die japanische Praxis des „Waldbades" ist wissenschaftlich belegt: Sie senkt Cortisol, stärkt das Immunsystem und beruhigt das Nervensystem.'],
      ['feat3_titel',     'Innere Resilienz'],
      ['feat3_text',      'Regelmäßiges Waldbaden baut innere Stärke auf – eine natürliche Ressource, um Herausforderungen mit neuem Blick zu begegnen.'],
      ['cta_titel',       'Bereit für deinen ersten Schritt?'],
      ['cta_text',        'Entdecke unsere Gruppen- und Privatkurse in den Wäldern rund um Waiblingen und Lauf.'],
      ['wb_intro1',       'Waldbaden – auf Japanisch Shinrin-Yoku (森林浴) – bedeutet wörtlich „ein Bad in der Waldatmosphäre nehmen". Die Methode wurde in den 1980er Jahren in Japan entwickelt und ist heute durch hunderte Studien wissenschaftlich belegt.'],
      ['wb_intro2',       'Beim Waldbaden geht es nicht ums Wandern oder Sporttreiben. Es geht darum, langsam und bewusst durch den Wald zu gehen, alle Sinne zu öffnen und sich von der Waldatmosphäre tragen zu lassen.'],
      ['wb_passiert',     'Du verlangsamst dein Tempo und kommst in tiefe Entspannung\nDu öffnest alle Sinne: Hören, Riechen, Sehen, Tasten\nDu trittst mit der Natur in echten Kontakt – nicht als Tourist, sondern als Teil davon\nGedanken dürfen kommen und gehen – du musst nichts festhalten'],
      ['wb_vt1',          'Stressreduktion'],
      ['wb_vx1',          'Der Cortisolspiegel sinkt nachweislich. Blutdruck und Herzrate normalisieren sich nach wenigen Minuten im Wald.'],
      ['wb_vt2',          'Immunsystem'],
      ['wb_vx2',          'Bäume geben Phytonzide ab – ätherische Öle, die unsere natürlichen Killerzellen aktivieren und das Immunsystem stärken.'],
      ['wb_vt3',          'Mentale Gesundheit'],
      ['wb_vx3',          'Angstzustände und depressive Verstimmungen werden durch regelmäßige Waldbäder messbar gelindert.'],
      ['wb_ablauf',       'Ankommen – kurze Einführung, gemeinsames Durchatmen\nSinnesübungen – geleitete Übungen zur Wahrnehmungsschärfung\nStilles Gehen – jeder findet seinen eigenen Rhythmus\nNaturkontakt – Berühren, Riechen, Hören, Innehalten\nStille teilen – wer möchte, erzählt von seinen Eindrücken\nAbschluss – Kräutertee im Wald, sanfter Ausklang'],
      ['about_bio',       'Mein Name ist Laura Demory, und mein Weg zum Waldbaden begann mit einer persönlichen Suche nach Stille und Verbindung. In einer Zeit, die von Beschleunigung und Druck geprägt war, fand ich im Wald meinen Anker.\n\nHeute begleite ich Menschen auf ihrem Weg zurück zur Natur – und zu sich selbst. Waldbaden ist für mich keine Methode, es ist eine Lebenshaltung.\n\nIch komme aus dem Raum Waiblingen und kenne die Wälder hier wie meine Westentasche. Jeder Baum, jeder Lichtstrahl hat seine Geschichte – und ich freue mich, sie mit euch zu teilen.'],
      ['about_qual',      'Zertifizierte Waldbade-Guide\nResilienz-Coach\nFortbildungen in Naturpädagogik\nErste Hilfe (gültig)\nLangjährige Praxis in Achtsamkeit & Meditation'],
      ['about_phil',      'Ich glaube daran, dass jeder Mensch einen tiefen Zugang zur Natur in sich trägt. Manchmal ist dieser Zugang verschüttet – durch Alltag, Stress, oder einfach mangelnde Übung. Waldbaden öffnet diesen Weg wieder.\n\nMeine Kurse sind offen für alle – egal ob du zum ersten Mal bewusst in den Wald gehst oder schon lange die Natur liebst. Es braucht keine Vorkenntnisse. Nur die Bereitschaft, dich einzulassen.'],
      ['privat_intro',    'Du möchtest ein individuelles Waldbaden-Erlebnis – allein, zu zweit oder mit einer kleinen Gruppe? Ich plane einen maßgeschneiderten Kurs ganz nach euren Wünschen.'],
      ['privat_at1',      'Für Paare'],
      ['privat_ax1',      'Ein gemeinsamer Nachmittag im Wald – nachhaltig, ruhig und unvergesslich.'],
      ['privat_at2',      'Für Gruppen'],
      ['privat_ax2',      'Freundinnen-Treffen, Geburtstag oder einfach gemeinsam in die Natur – ich begleite euch.'],
      ['privat_at3',      'Für Unternehmen'],
      ['privat_ax3',      'Betriebliche Gesundheitsförderung oder Team-Event auf ganz besondere, nachhaltige Art.'],
      ['kontakt_intro',   'Du hast Fragen zu meinen Kursen, möchtest dich anmelden oder einfach mehr erfahren? Ich freue mich über deine Nachricht!'],
      ['impressum_text',  '## Angaben gemäß § 5 TMG\nResilienzpfade\nLaura Demory\nGehrengrabenstraße 1b\n77886 Lauf\n\nTelefon: 0176 31152691\nE-Mail: laura.naturlauf@gmail.com\n\n## Haftungsausschluss\nDie Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte verantwortlich.\n\n## Haftung für Links\nUnser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.\n\n## Urheberrecht\nDie durch die Seitenbetreiberin erstellten Inhalte unterliegen dem deutschen Urheberrecht. Die Vervielfältigung bedarf der schriftlichen Zustimmung.'],
      ['datenschutz_text','## 1. Datenschutz auf einen Blick\nDiese Datenschutzerklärung klärt über Art, Umfang und Zweck der Verarbeitung von personenbezogenen Daten auf.\n\n## 2. Verantwortliche Stelle\nLaura Demory, Gehrengrabenstraße 1b, 77886 Lauf\nE-Mail: laura.naturlauf@gmail.com · Telefon: 0176 31152691\n\n## 3. Datenerfassung\nDiese Website verwendet keine Cookies und kein Tracking. Personenbezogene Daten werden ausschließlich über das Kontaktformular erfasst, wenn Sie uns freiwillig Angaben mitteilen.\n\n## 4. Kontaktformular\nAnfragen über das Formular werden zwecks Bearbeitung gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung).\n\n## 5. Hosting\nDiese Website wird über GitHub Pages gehostet. Dabei können serverseitig IP-Adressen protokolliert werden. Mehr Infos: docs.github.com/en/site-policy\n\n## 6. Ihre Rechte\nSie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung. Wenden Sie sich an: laura.naturlauf@gmail.com\n\n## 7. Beschwerderecht\nSie können sich bei der Datenschutz-Aufsichtsbehörde Baden-Württemberg beschweren.'],
    ];
    defaults.forEach(function(row) { inhSheet.appendRow(row); });
  }

  // Drive-Ordner für Galerie anlegen
  getDriveFolder();

  SpreadsheetApp.getUi().alert('✓ Setup abgeschlossen! Alle Sheets und der Drive-Ordner sind bereit.');
  Logger.log('Setup OK');
}

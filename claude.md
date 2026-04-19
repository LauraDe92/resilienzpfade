# Resilienzpfade – Waldbaden WebApp · Projektdokumentation

## Projektüberblick
Statische Single-Page-App (SPA) für Waldbaden-Kurse von Laura Demory.
Hosting: GitHub Pages + Domain resilienzpfade.de | Datenbank: Google Sheets via Apps Script | Mobile-optimiert.

---

## Technischer Stack

| Schicht | Technologie |
|---------|-------------|
| Frontend | Vanilla HTML/CSS/JS, eine Datei (index.html) |
| Hosting | GitHub Pages, Domain resilienzpfade.de via IONOS |
| Backend | Google Apps Script (Web-App) |
| Datenbank | Google Sheets |
| Bildhosting | Google Drive (via Apps Script) |
| Fonts | Cormorant Garamond + DM Sans (Google Fonts) |

---

## Repository-Struktur (GitHub)

```
/
├── index.html      ← Gesamte WebApp (SPA)
├── CNAME           ← resilienzpfade.de (für GitHub Pages)
├── Header.png      ← Hero-Hintergrundbild
├── icon.svg        ← Favicon (Cache-Busting: ?v=2 in index.html)
└── Code.gs         ← NUR zur Referenz, läuft in Google Apps Script
```

---

## Konfiguration (index.html)

```javascript
const APPS_URL = 'https://script.google.com/macros/s/AKfycbyTtp1GQliXe3UQYTe285UoxC3ktuQ_r9rz2BmOL3EEvEeV1wbLaEV0gY61Q8pUexIrGQ/exec';
const ADMIN_PW = '130892';
```

**E-Mail-Empfänger (Code.gs):** `laura.naturlauf@gmail.com`

**Favicon:** `?v=2` – bei neuem Icon auf `?v=3` erhöhen.

---

## Google Sheet

**Sheet-ID:** `171ttO0cWO0rhjWjyWX0h7-0evVzI-RfQMPu0w_JL2vU`

| Blatt | Spalten | Zweck |
|-------|---------|-------|
| Kurse | Name, Datum, Uhrzeit, Ort, Treffpunkt, Verfuegbarkeit, Preis, Kursinhalt | Kursangebote |
| Galerie | URL, Alt-Text | Galeriebilder (Drive-thumbnail-URLs) |
| Anfragen | Datum, Name, Email, Telefon, Typ, Wunschdatum, Nachricht | Buchungen + Privatanfragen |
| Inhalte | Schluessel, Wert | Seitentexte, Infoboxen, Portrait-URL |
| Newsletter | Datum, Name, Email | Abonnenten für Kurs-Benachrichtigungen |

---

## Seiten / Navigation

| Route (#hash) | Seite | Beschreibung |
|---------------|-------|--------------|
| home | Startseite | Hero, Features, CTA |
| waldbaden | Waldbaden | Konzept, Vorteile, Ablauf |
| about | Über mich | Bio, Qualifikationen, Philosophie, Portrait |
| kurse | Gruppenkurse | Dynamisch aus Sheet geladen |
| privat | Privatkurse | Anfrage-Formular (ohne Unternehmens-Rubrik) |
| galerie | Galerie | Dynamisch aus Sheet, Fallback: Unsplash |
| kontakt | Kontakt | Adresse, Telefon, E-Mail |
| impressum | Impressum | Aus Inhalte-Sheet editierbar |
| datenschutz | Datenschutz | Aus Inhalte-Sheet editierbar |
| qr | QR-Code | Website teilen + Download |
| admin | Admin | Passwortgeschützt |

**Navigation:** QR-Code als Icon-Link (Desktop) + „QR-Code teilen" im Hamburger-Menü.

---

## Buchungssystem – Gruppenkurse

Modal mit folgenden Feldern:
- Vorname*, Nachname*, E-Mail*
- Telefon (optional)
- Anmerkungen (Freitext)
- WhatsApp-Checkbox → Handynummer* (Pflicht bei Haken)
- **Newsletter-Checkbox**: „Ich möchte per E-Mail informiert werden, wenn neue Kurse verfügbar sind"
- **Haftungsausschluss-Box** (Inhaltstext via Admin editierbar)
- **Kosten-Box** (Inhaltstext via Admin editierbar)

Apps Script Endpoint: `action: 'buchung'`

### Newsletter-Logik
- Opt-in-Haken gesetzt → E-Mail wird in Sheet „Newsletter" gespeichert (Duplikat-Prüfung aktiv)
- Wenn Admin im Admin-Bereich einen **neuen Kurs anlegt** (`action: 'addKurs'`), werden automatisch alle Newsletter-Abonnenten per E-Mail benachrichtigt
- Benachrichtigungs-E-Mail enthält: Kursname, Datum, Uhrzeit, Ort, Preis, Kursinhalt, Link zur Website

---

## Buchungssystem – Privatkurse

Felder: Name*, E-Mail*, Telefon (opt.), Kurstyp (Dropdown), Wunschdatum, Nachricht*, WhatsApp-Checkbox → Handynummer*

Dropdown-Optionen: Privatkurs (1–2 Personen) · Privatkurs (kleine Gruppe) · Sonstiges

Apps Script Endpoint: `action: 'anfrage'`

---

## Kurs-Verwaltung (Admin)

### Neuen Kurs anlegen
Felder: Name*, Datum*, Uhrzeit Von/Bis, Ort, Treffpunkt, Preis, Verfügbarkeit, Kursinhalt/Beschreibung

Uhrzeit wird als `"10:00 – 12:00"` in einer Spalte gespeichert (rückwärtskompatibel).

### Bestehenden Kurs bearbeiten
„Bearbeiten"-Button in der Kursliste füllt das Formular vor. Speichern schreibt via `action: 'updateKurs'` die gesamte Sheet-Zeile neu.

---

## Content-System

Key-Value in Sheet „Inhalte". Beim Laden gecacht in `sessionStorage`.

**Render-Typen:** `text` · `paras` · `list-li` · `qual-list` · `md` · `portrait`

### Content-Keys (Auswahl)

| Key | Wo sichtbar |
|-----|-------------|
| `buchung_haftung` | Anmeldeformular Gruppenkurse (Infobox) |
| `buchung_kosten` | Anmeldeformular Gruppenkurse (Infobox) |
| `about_portrait` | Über-mich-Seite (Portrait-Foto) |
| `impressum_text` | Impressum-Seite |
| `datenschutz_text` | Datenschutz-Seite |

**Fallback-Texte** (solange kein Sheet-Eintrag vorhanden):
- Haftung: *„Die Teilnahme erfolgt auf eigene Verantwortung …"*
- Kosten: *„Der Kurspreis ist spätestens am Kurstag …"*

---

## Admin-Bereich

**URL:** `#admin` (Footer) · **Passwort:** `130892`

| Tab | Funktion |
|-----|----------|
| Kurse | Anlegen / Bearbeiten / Löschen |
| Galerie | Upload (Drive) oder URL / Löschen |
| Inhalte | 8 Unter-Tabs: Startseite, Waldbaden, Über mich, Privatkurse, Kontakt, **Buchung**, Impressum, Datenschutz |

**Buchungs-Tab (neu):** Texte für Haftungsausschluss und Kosten editierbar – werden live im Anmeldeformular angezeigt.

---

## Galerie – Google Drive Bilder

URL-Format: `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1200`
`fixDriveUrl()` konvertiert alte `uc?export=view`-URLs automatisch.

---

## E-Mail-Konfiguration

| Mail | An | Reply-To |
|------|----|----------|
| Buchungs-Benachrichtigung an Laura | laura.naturlauf@gmail.com | Kunde |
| Buchungs-Bestätigung an Kunden | Kunde | laura.naturlauf@gmail.com |
| Newsletter (neuer Kurs) | Alle Abonnenten | laura.naturlauf@gmail.com |

**⚠️ FROM-Adresse:** Gmail-Alias `laura.naturlauf@gmail.com` unter lademory92@gmail.com einrichten:
Einstellungen → Konten und Import → „E-Mail senden als" → bestätigen.

---

## Apps Script Endpunkte

**GET:**
- `?action=get&sheet=Kurse`
- `?action=get&sheet=Galerie`
- `?action=getInhalte`

**POST:**
- `{action:'addKurs', name, datum, uhrzeit, ort, treffpunkt, verfueg, preis, kursinhalt}` → löst Newsletter-Versand aus
- `{action:'updateKurs', row, name, datum, uhrzeit, ort, treffpunkt, verfueg, preis, kursinhalt}`
- `{action:'addBild', url, alt}`
- `{action:'addBildFile', base64, mimeType, filename, alt}` → `{status:'ok', url}`
- `{action:'updateInhalte', updates:{key:value,...}}`
- `{action:'deleteRow', sheet, row}`
- `{action:'anfrage', name, email, phone, type, date, whatsapp, handynummer, message}`
- `{action:'buchung', vorname, nachname, email, phone, kursname, datum, uhrzeit, ort, whatsapp, handynummer, newsletter, message}`

---

## Design-Prinzipien

- Keine Emojis in Inhalts-/Feature-Bereichen – SVG-Linien-Icons in Gold
- Checkboxen vollständig selbst gestylt
- Typografie: Cormorant Garamond + DM Sans
- Farbpalette: Waldgrün #1c3d28 · Gold #b5893a · Creme #f5ede0
- Mobile: vollständig responsive, Hamburger-Navigation

---

## Impressum

```
Resilienzpfade · Laura Demory
Gehrengrabenstraße 1b · 77886 Lauf
Tel: 0176 31152691 · E-Mail: laura.naturlauf@gmail.com
```

---

## Versions-History

| Version | Änderungen |
|---------|------------|
| v1 | Grundversion |
| v2 | Uhrzeit-Format, Bild-Upload, Inhalte-CMS |
| v3 | Buchungsmodal, WhatsApp-Felder, Toast, APPS_URL |
| v4 | replyTo-Fix, Gmail-Alias-Anleitung, Bugs behoben |
| v5 | Drive-Bilder, © 2026, Portrait-Upload, QR-Seite |
| v6 | SVG-Icons, Abstände, Custom-Checkbox, QR neu gestylt |
| v7 | Unternehmen entfernt, Icon Cache-Busting, Kurs-Bearbeiten, Zeitraum, Kursinhalt |
| v8 | Newsletter Opt-in + Auto-Versand; Haftung/Kosten-Infoboxen im Modal; Admin-Tab Buchung |

---

## Offene Punkte

- [ ] Gmail-Alias einrichten → FROM-Adresse korrekt
- [ ] Newsletter-Sheet: bei Bedarf Abmelde-Link ergänzen (Datenschutz)
- [ ] Portrait-Foto hochladen (Admin → Inhalte → Über mich)
- [ ] SEO: sitemap.xml + robots.txt

---

## Deployment-Checkliste

1. Code.gs in Apps Script → `setupSheets()` ausführen (erstellt auch Newsletter-Sheet)
2. Als Web-App neu deployen (neue Version veröffentlichen)
3. GitHub: `index.html` + `CNAME` hochladen
4. GitHub Pages: Settings → Pages → Branch main / root → Domain resilienzpfade.de
5. Gmail-Alias einrichten

## ⚠️ Wichtige Hinweise

**Niemals** eine aus dem Browser gespeicherte HTML hochladen – Cloudflare obfusziert E-Mail-Adressen. Immer die Claude-Output-Datei direkt verwenden.

**Newsletter-Datenschutz:** Abonnenten sollten über die Datenschutzerklärung über die Speicherung informiert sein. Opt-out-Möglichkeit (Abmelde-Link) bei wachsender Abonnentenliste empfohlen.

# Resilienzpfade – Waldbaden WebApp · Projektdokumentation

## Projektüberblick
Statische Single-Page-App (SPA) für Waldbaden-Kurse von Laura Demory.
Hosting: GitHub Pages | Datenbank: Google Sheets via Apps Script | Mobile-optimiert.

---

## Technischer Stack

| Schicht | Technologie |
|---------|-------------|
| Frontend | Vanilla HTML/CSS/JS, eine Datei (index.html) |
| Hosting | GitHub Pages (main branch, root) |
| Backend | Google Apps Script (Web-App) |
| Datenbank | Google Sheets |
| Bildhosting | Google Drive (via Apps Script) |
| Fonts | Cormorant Garamond + DM Sans (Google Fonts) |

---

## Repository-Struktur (GitHub)

```
/
├── index.html      ← Gesamte WebApp (SPA)
├── Header.png      ← Hero-Hintergrundbild
├── icon.svg        ← Favicon / App-Icon (v=2 Cache-Busting aktiv)
└── Code.gs         ← NUR zur Referenz, läuft in Google Apps Script
```

---

## Konfiguration (index.html)

```javascript
const APPS_URL = 'https://script.google.com/macros/s/AKfycbyTtp1GQliXe3UQYTe285UoxC3ktuQ_r9rz2BmOL3EEvEeV1wbLaEV0gY61Q8pUexIrGQ/exec';
const ADMIN_PW = '130892';
```

**Favicon:** `<link rel="icon" href="icon.svg?v=2">` – die `?v=2`-Versionsangabe erzwingt bei GitHub Pages das Nachladen des Icons. Bei zukünftigen Icon-Updates auf `?v=3`, `?v=4` usw. erhöhen.

**E-Mail-Empfänger (Code.gs):** `laura.naturlauf@gmail.com`

---

## Google Sheet

**Sheet-ID:** `171ttO0cWO0rhjWjyWX0h7-0evVzI-RfQMPu0w_JL2vU`

| Blatt | Spalten | Zweck |
|-------|---------|-------|
| Kurse | Name, Datum, Uhrzeit, Ort, Treffpunkt, Verfuegbarkeit, Preis | Kursangebote |
| Galerie | URL, Alt-Text | Galeriebilder (Drive-thumbnail-URLs) |
| Anfragen | Datum, Name, Email, Telefon, Typ, Wunschdatum, Nachricht | Buchungen + Privatanfragen |
| Inhalte | Schluessel, Wert | Seitentexte + about_portrait URL |

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

**Navigation:** QR-Code als Icon-Link in der Desktop-Nav und als "QR-Code teilen" im Hamburger-Menü.

---

## Privatkurse

Angebotskarten: Für Einzelpersonen · Für Gruppen (Unternehmens-Karte entfernt)
Dropdown-Optionen: Privatkurs (1–2 Personen) · Privatkurs (kleine Gruppe) · Sonstiges

---

## Design-Prinzipien

- **Keine Emojis** in Inhalts-/Feature-Bereichen – elegante SVG-Linien-Icons in Gold
- **Reduzierte Abstände** zwischen Sektionen
- **Checkboxen** vollständig selbst gestylt (kein natives Browser-Rendering)
- **Typografie:** Cormorant Garamond + DM Sans
- **Farbpalette:** Waldgrün #1c3d28 · Gold #b5893a · Creme #f5ede0

---

## Buchungssystem

### Gruppenkurse
Modal mit: Vorname*, Nachname*, E-Mail*, Telefon (opt.), Anmerkungen, WhatsApp-Checkbox → Handynummer*
Apps Script Endpoint: `action: 'buchung'`

### Privatkurse
Felder: Name*, E-Mail*, Telefon (opt.), Kurstyp (Dropdown), Wunschdatum, Nachricht*, WhatsApp-Checkbox → Handynummer*
Apps Script Endpoint: `action: 'anfrage'`

---

## Galerie – Google Drive Bilder

Gespeichertes URL-Format: `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1200`
`fixDriveUrl()` konvertiert auch ältere `uc?export=view`-URLs automatisch.

**Wichtig:** Immer die aktuelle `index.html` aus den Claude-Outputs auf GitHub hochladen – nie eine ältere Version. Die APPS_URL und alle Bugfixes gehen sonst verloren.

---

## Profilfoto (Über mich)

Admin → Inhalte → Über mich → Profilfoto
Key `about_portrait` im Inhalte-Sheet. Sofortige Anzeige ohne Neu-Deployment.

---

## QR-Code-Seite

Route: `#qr` — Desktop-Nav-Icon + Hamburger-Menü.
Generiert via `api.qrserver.com`. Stilistisch angepasst (weißer Rahmen, Gold-Akzent, Cormorant).
Nur: QR-Anzeige + "Als Bild speichern"-Button.

---

## E-Mail-Konfiguration

| Mail | An | Reply-To |
|------|----|----------|
| Benachrichtigung an Laura | laura.naturlauf@gmail.com | Kunde |
| Bestätigung an Kunden | Kunde | laura.naturlauf@gmail.com |

**⚠️ FROM-Adresse:** Gmail-Alias einrichten unter lademory92@gmail.com:
Einstellungen → Konten und Import → "E-Mail senden als" → laura.naturlauf@gmail.com → bestätigen.

---

## Admin-Bereich

**URL:** `#admin` (Footer-Link) · **Passwort:** `130892`

| Tab | Funktion |
|-----|----------|
| Kurse | Anlegen / Löschen |
| Galerie | Upload (Drive) oder URL / Löschen |
| Inhalte | Alle Seitentexte + Profilfoto (7 Unter-Tabs) |

---

## UX – Formular-Feedback

| Situation | Verhalten |
|-----------|-----------|
| Validierungsfehler | Alert scrollt in sichtbaren Bereich |
| Erfolgreiche Buchung (Modal) | Modal schließt, Toast unten (7 Sek.) |
| Erfolgreiche Privatanfrage | Alert scrollt in Sichtfeld |

---

## Apps Script Endpunkte

**GET:** `?action=get&sheet=Kurse` · `?action=get&sheet=Galerie` · `?action=getInhalte`

**POST:**
- `{action:'addKurs', name, datum, uhrzeit, ort, treffpunkt, verfueg, preis}`
- `{action:'addBild', url, alt}`
- `{action:'addBildFile', base64, mimeType, filename, alt}` → `{status:'ok', url}`
- `{action:'updateInhalte', updates:{key:value,...}}`
- `{action:'deleteRow', sheet, row}`
- `{action:'anfrage', name, email, phone, type, date, whatsapp, handynummer, message}`
- `{action:'buchung', vorname, nachname, email, phone, kursname, datum, uhrzeit, ort, whatsapp, handynummer, message}`

---

## Content-System

Key-Value in Sheet "Inhalte". Render-Typen: `text` `paras` `list-li` `qual-list` `md` `portrait`
Portrait-Key: `about_portrait` → Drive-thumbnail-URL

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
| v4 | replyTo-Fix, Gmail-Alias-Anleitung, init()-Bug, onclick-Bug |
| v5 | Drive-Bilder (thumbnail), © 2026, Portrait-Upload, QR-Seite |
| v6 | Breaking-Change-Fix; SVG-Icons; Abstände; Custom-Checkbox; QR neu |
| v7 | Unternehmen-Rubrik entfernt; Paare aus Kurse-Text; Icon Cache-Busting (v=2) |

---

## Offene Punkte

- [ ] Gmail-Alias einrichten → FROM-Adresse korrekt
- [ ] Portrait-Foto hochladen (Admin → Inhalte → Über mich)
- [ ] Online-Buchungssystem mit Zahlungsintegration
- [ ] Automatische Erinnerungs-Mails (Apps Script Trigger)
- [ ] SEO: sitemap.xml + robots.txt

---

## ⚠️ Wichtige Deployment-Hinweise

**Niemals eine ältere index.html hochladen!** Die aktuelle Datei enthält:
- APPS_URL (Datenbankverbindung)
- fixDriveUrl (Galerie-Bilder)
- Alle Bugfixes seit v1

Bei Unsicherheit: immer die zuletzt von Claude ausgegebene index.html verwenden.

Favicon-Update: icon.svg ersetzen + in index.html `?v=N` hochzählen → erzwingt Neuladen.

## Deployment-Checkliste

1. Code.gs in Apps Script → `setupSheets()` ausführen
2. Als Web-App bereitstellen (URL bereits in index.html)
3. GitHub: `index.html` + `Header.png` + `icon.svg` hochladen
4. GitHub Pages: Settings → Pages → Branch main / root
5. Gmail-Alias einrichten

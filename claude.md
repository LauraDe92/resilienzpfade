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
├── Header.png      ← Hero-Hintergrundbild (von Laura hochgeladen)
├── icon.svg        ← Favicon / App-Icon
└── Code.gs         ← NUR zur Referenz, läuft in Google Apps Script
```

---

## Konfiguration (index.html)

```javascript
const APPS_URL = 'https://script.google.com/macros/s/AKfycbyTtp1GQliXe3UQYTe285UoxC3ktuQ_r9rz2BmOL3EEvEeV1wbLaEV0gY61Q8pUexIrGQ/exec';
const ADMIN_PW = '130892';
```

**E-Mail-Empfänger (Code.gs):** `laura.naturlauf@gmail.com`

---

## Google Sheet

**Sheet-ID:** `171ttO0cWO0rhjWjyWX0h7-0evVzI-RfQMPu0w_JL2vU`

**Tabellenblätter** (angelegt via `setupSheets()`):

| Blatt | Spalten | Zweck |
|-------|---------|-------|
| Kurse | Name, Datum, Uhrzeit, Ort, Treffpunkt, Verfuegbarkeit, Preis | Kursangebote |
| Galerie | URL, Alt-Text | Galeriebilder (Drive-URLs oder extern) |
| Anfragen | Datum, Name, Email, Telefon, Typ, Wunschdatum, Nachricht | Eingehende Buchungen & Privatanfragen (WhatsApp-Info steht in Nachricht) |
| Inhalte | Schluessel, Wert | Alle editierbaren Seitentexte (Key-Value) |

---

## Seiten / Navigation

| Route (#hash) | Seite | Beschreibung |
|---------------|-------|--------------|
| home | Startseite | Hero, Features, CTA |
| waldbaden | Waldbaden | Konzept, Vorteile, Ablauf |
| about | Über mich | Bio, Qualifikationen, Philosophie |
| kurse | Gruppenkurse | Dynamisch aus Sheet geladen |
| privat | Privatkurse | Anfrage-Formular |
| galerie | Galerie | Dynamisch aus Sheet, Fallback: Unsplash |
| kontakt | Kontakt | Adresse, Telefon, E-Mail |
| impressum | Impressum | Aus Inhalte-Sheet editierbar |
| datenschutz | Datenschutz | Aus Inhalte-Sheet editierbar |
| admin | Admin | Passwortgeschützt |

---

## Buchungssystem (v3)

### Gruppenkurse
Beim Klick auf "Jetzt anmelden" bei einem Kurs öffnet sich ein **Modal-Formular** direkt auf der Seite.

**Felder:**
- Vorname * / Nachname *
- E-Mail *
- Telefonnummer (optional)
- Freitextfeld / Anmerkungen
- Checkbox "WhatsApp-Gruppe" → bei Haken: Pflichtfeld Handynummer *

**Apps Script Endpoint:** `action: 'buchung'`
Schreibt in Anfragen-Sheet mit Typ = `'Buchung: [Kursname]'`.
Sendet Benachrichtigung an Laura + Bestätigungsmail an Teilnehmer.

### Privatkurse
Formularfelder:
- Name * / E-Mail * / Telefon (optional) / Kurstyp / Wunschdatum / Nachricht *
- Checkbox "WhatsApp-Gruppe" → bei Haken: Pflichtfeld Handynummer *

**Apps Script Endpoint:** `action: 'anfrage'`

---

## Admin-Bereich

**URL:** Website öffnen → Footer → "Admin" (kleiner Link) → `#admin`
**Passwort:** `130892`

### Admin-Tabs

**1. Kurse** – Neuen Kurs anlegen / löschen

**2. Galerie** – Foto hochladen (Gerät → Drive) oder URL eintragen / löschen

**3. Inhalte** – Alle Seitentexte editierbar (7 Seiten-Tabs)

---

## UX – Feedback nach Formularabsenden (Bug 3)

- Bei **Validierungsfehlern**: Alert-Element scrollt automatisch in den sichtbaren Bereich
- Bei **erfolgreicher Buchung** (Modal): Toast-Notification unten im Bildschirm, Modal schließt sich
- Bei **erfolgreicher Privatanfrage**: Alert-Element scrollt in Sichtfeld

---

## Apps Script Endpunkte

**GET:**
- `?action=get&sheet=Kurse` → Kurs-Zeilen als Array
- `?action=get&sheet=Galerie` → Galerie-Zeilen als Array
- `?action=getInhalte` → Alle Inhalte als {key: value} Objekt

**POST (JSON body):**
- `{action:'addKurs', name, datum, uhrzeit, ort, treffpunkt, verfueg, preis}`
- `{action:'addBild', url, alt}`
- `{action:'addBildFile', base64, mimeType, filename, alt}` → lädt in Drive hoch
- `{action:'updateInhalte', updates:{key:value,...}}`
- `{action:'deleteRow', sheet, row}`
- `{action:'anfrage', name, email, phone, type, date, whatsapp, handynummer, message}` → Privatanfrage
- `{action:'buchung', vorname, nachname, email, phone, kursname, datum, uhrzeit, ort, whatsapp, handynummer, message}` → Gruppenkurs-Buchung

---

## E-Mail Absender (Bug 4)

In Code.gs werden alle `MailApp.sendEmail`-Aufrufe mit `from: EMAIL_EMPFAENGER` und `name: 'Laura – Resilienzpfade'` abgesetzt.

> ⚠️ **Wichtig:** Damit die FROM-Adresse wirklich als `laura.naturlauf@gmail.com` erscheint, muss diese Adresse im Google-Konto (lademory92@gmail.com) unter **Gmail → Einstellungen → Konten → E-Mail senden als** als verifizierter Alias eingetragen sein. Ohne Alias-Einrichtung sendet Google automatisch von lademory92@gmail.com, aber `replyTo` zeigt trotzdem auf laura.naturlauf@gmail.com.

---

## Content-System

Texte in Sheet "Inhalte" als Key-Value-Paare. Beim Seitenaufruf geladen, im sessionStorage gecacht.

**Render-Typen:** `text`, `paras`, `list-li`, `qual-list`, `md`

---

## Design

- **Typografie:** Cormorant Garamond + DM Sans
- **Farbpalette:** Waldgrün `#1c3d28`, Gold `#b5893a`, Creme `#f5ede0`
- **Mobile:** Vollständig responsive, Hamburger-Navigation

---

## Impressum

```
Resilienzpfade
Laura Demory
Gehrengrabenstraße 1b
77886 Lauf
Tel: 0176 31152691
E-Mail: laura.naturlauf@gmail.com
```

---

## Bugfixes v3 (gegenüber v2)

1. **Kurs-Buchungsformular:** Klick auf "Jetzt anmelden" öffnet jetzt ein eigenes Modal-Formular (nicht mehr Weiterleitung zu Privatkursen). Felder: Vorname, Nachname, E-Mail, Telefon, Freitext, WhatsApp-Checkbox → Handynummer-Pflichtfeld.
2. **WhatsApp im Privatanfrage-Formular:** WhatsApp-Checkbox + bedingtes Handynummer-Pflichtfeld ergänzt.
3. **Erfolgs-/Fehlermeldungen sichtbar:** Nach Absenden scrollt die Meldung automatisch ins Bild (scrollIntoView). Bei Modal-Buchungen: Toast-Notification am unteren Bildrand.
4. **Absende-E-Mail:** `from: EMAIL_EMPFAENGER` + `name: 'Laura – Resilienzpfade'` in allen MailApp-Aufrufen. Funktioniert vollständig, sobald `laura.naturlauf@gmail.com` als Gmail-Alias im Konto eingetragen ist.
5. **APPS_URL fest eingetragen:** `https://script.google.com/macros/s/AKfycbyTtp1GQliXe3UQYTe285UoxC3ktuQ_r9rz2BmOL3EEvEeV1wbLaEV0gY61Q8pUexIrGQ/exec`

---

## Offene Punkte / Mögliche Erweiterungen

- [ ] Foto-Portrait auf "Über mich"-Seite (aktuell Emoji-Platzhalter)
- [ ] Online-Buchungssystem mit Zahlungsintegration
- [ ] Automatische Erinnerungs-Mails vor Kursbeginn (Apps Script Trigger)
- [ ] SEO: sitemap.xml + robots.txt
- [ ] Google Analytics (falls gewünscht, dann Datenschutz anpassen)
- [ ] Gmail-Alias `laura.naturlauf@gmail.com` in lademory92-Konto eintragen (für korrekten E-Mail-Absender)

---

## Deployment-Checkliste (Erstkonfiguration)

1. Code.gs in Apps Script einfügen → `setupSheets()` ausführen
2. Apps Script als Web-App bereitstellen → URL kopieren (bereits in index.html eingetragen)
3. GitHub Repo: index.html + Header.png + icon.svg hochladen
4. GitHub Pages aktivieren: Settings → Pages → Branch main / root
5. Website unter `https://[username].github.io/[repo]/` erreichbar

---

*Zuletzt aktualisiert: v3 – Buchungsmodal, WhatsApp-Felder, Toast-Notifications, E-Mail-Absender, APPS_URL fest*

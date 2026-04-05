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

## Google Sheet

**Sheet-ID:** `171ttO0cWO0rhjWjyWX0h7-0evVzI-RfQMPu0w_JL2vU`

**Tabellenblätter** (angelegt via `setupSheets()`):

| Blatt | Spalten | Zweck |
|-------|---------|-------|
| Kurse | Name, Datum, Uhrzeit, Ort, Treffpunkt, Verfuegbarkeit, Preis | Kursangebote |
| Galerie | URL, Alt-Text | Galeriebilder (Drive-URLs oder extern) |
| Anfragen | Datum, Name, Email, Telefon, Typ, Wunschdatum, Nachricht | Eingehende Privatanfragen |
| Inhalte | Schluessel, Wert | Alle editierbaren Seitentexte (Key-Value) |

**Drive-Ordner** für Galerie-Uploads wird automatisch angelegt und Ordner-ID in PropertiesService gespeichert.

---

## Konfiguration (index.html)

```javascript
const APPS_URL = 'HIER_APPS_SCRIPT_URL_EINTRAGEN'; // ← einzige manuelle Änderung nach Deployment
const ADMIN_PW = '130892';
```

**E-Mail-Empfänger (Code.gs):** `laura.naturlauf@gmail.com`

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

## Admin-Bereich

**URL:** Website öffnen → Footer → "Admin" (kleiner Link) → `#admin`
**Passwort:** `130892`
**Sicherheit:** Client-seitig (sessionStorage), ausreichend für private Verwaltungsseite.

### Admin-Tabs

**1. Kurse**
- Neuen Kurs anlegen (Name, Datum, Uhrzeit, Ort, Treffpunkt, Preis, Verfügbarkeit)
- Bestehende Kurse löschen

**2. Galerie**
- Upload vom Handy/Gerät (Foto → Base64 → Apps Script → Google Drive → URL ins Sheet)
  - Bilder werden client-seitig auf max. 1400px / 82% Qualität verkleinert vor Upload
- Alternativ: Bild-URL direkt eintragen
- Bestehende Bilder löschen

**3. Inhalte** ← NEU in v2
- Alle Seitentexte editierbar, gegliedert in 7 Seiten-Tabs:
  - Startseite (Hero, Features, CTA)
  - Waldbaden (Einleitung, Passiert-Liste, Vorteile, Ablauf-Liste)
  - Über mich (Bio, Qualifikationen, Philosophie)
  - Privatkurse (Intro, 3 Angebotskarten)
  - Kontakt (Intro-Text)
  - Impressum (Volltext mit ## für Überschriften)
  - Datenschutz (Volltext mit ## für Überschriften)

---

## Content-System

Texte werden in Sheet "Inhalte" als Key-Value-Paare gespeichert.
Beim Seitenaufruf werden sie geladen, im sessionStorage gecacht und auf die DOM-Elemente angewendet.

**Render-Typen:**
- `text` → textContent direkt
- `paras` → Absätze durch Leerzeile getrennt → `<p>` Tags
- `list-li` → eine Zeile pro Punkt → `<li>` in bestehendem `<ul>/<ol>`
- `qual-list` → eine Zeile pro Punkt → `<li>` in Qualifikationsliste
- `md` → Markdown-lite (## = h3, Leerzeile = Absatzende) → innerHTML

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
- `{action:'anfrage', name, email, phone, type, date, message}` → speichert + Mail

---

## Bugfixes v2 (gegenüber v1)

1. **Uhrzeit-Bug behoben:** Google Sheets liefert Zeitwerte als `Date(1899-12-30 HH:MM)`. In `cellToString()` wird Jahr < 1901 erkannt und als `HH:MM` formatiert.
2. **Bild-Upload vom Handy:** Neuer Upload-Modus "Vom Gerät" – File-Input → Canvas-Resize → Base64 → Drive.
3. **Alle Texte im Admin editierbar:** Inhalte-Tab mit 7 Seiten-Sektionen, gespeichert in "Inhalte"-Sheet.
4. **Euro-Zeichen:** `fmtPreis()` hängt automatisch ` €` an, wenn kein Währungssymbol im Preis-String.

---

## Design

- **Typografie:** Cormorant Garamond (Display/Serif) + DM Sans (Body)
- **Farbpalette:** Waldgrün `#1c3d28` (Primär), Gold `#b5893a` (Akzent), Creme `#f5ede0` (Hintergrund)
- **Stil:** Organisch-luxuriös, zeitlos, naturverbunden
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

## Offene Punkte / Mögliche Erweiterungen

- [ ] Foto-Portrait auf "Über mich"-Seite (aktuell Emoji-Platzhalter)
- [ ] Online-Buchungssystem mit Zahlungsintegration
- [ ] Automatische Erinnerungs-Mails vor Kursbeginn (Apps Script Trigger)
- [ ] SEO: sitemap.xml + robots.txt
- [ ] Google Analytics (falls gewünscht, dann Datenschutz anpassen)

---

## Deployment-Checkliste (Erstkonfiguration)

1. Code.gs in Apps Script einfügen → `setupSheets()` ausführen
2. Apps Script als Web-App bereitstellen → URL kopieren
3. In index.html: `APPS_URL = 'URL_hier'` eintragen
4. GitHub Repo: index.html + Header.png + icon.svg hochladen
5. GitHub Pages aktivieren: Settings → Pages → Branch main / root
6. Website unter `https://[username].github.io/[repo]/` erreichbar

---

*Zuletzt aktualisiert: v2 – Alle 4 Bugfixes + Content-Management-System implementiert*

# Waldbaden-Webapp - Vollständige Dokumentation

## Projektüberblick
Eine dynamische WebApp für Waldbaden-Kurse mit Fokus auf Kursmanagement, Teilnehmerkommunikation und rechtssicherer Darstellung. Die App nutzt Google Sheets als Datenbank und ist für Mobile optimiert.

---

## Seitenstruktur
   Seite | Beschreibung | Admin-Bereich |
 |-------|--------------|---------------|
 | **Startseite** | Hero-Bereich mit Call-to-Action | ✅ Text-Inhalte |
 | **Waldbaden** | Konzept, Ablauf, Vorteile | ✅ Vollständiger Text |
 | **Über mich** | Qualifikation, Philosophie | ✅ Vollständiger Text |
 | **Gruppenkurse** | Kursübersicht, Buchung | ✅ Kursmanagement |
 | **Privatkurse** | Kontaktformular | ✅ - |
 | **Galerie** | Bilder von Kursen | ✅ Bilder verwalten |
 | **Kontakt** | Kontaktinformationen | ✅ E-Mail & Telefon |
 | **Impressum** | Rechtliche Angaben | ✅ Vollständiger Text |
 | **Datenschutz** | Datenschutzhinweise | ✅ Vollständiger Text |
 | **Admin-Bereich** | Passwortgeschützt | ✅ Alle Inhalte |

---

## Technische Umsetzung

### Frontend
- **Sprache:** HTML5, CSS3, JavaScript (Vanilla)
- **Framework:** Kein Framework (reines HTML/CSS/JS für schnelle Prototypen)
- **Responsive Design:** Optimiert für Handy-Display (Media Queries)
- **Bilder:** Echte Waldbilder (Unsplash API)
- **Favicon:** Baum-Icon (SVG)

### Backend & Datenbank
- **Frontend-Hosting:** GitHub Pages
- **Datenbank:** Google Sheets (über Google Sheets API)
- **Admin-Zugriff:** Passwortgeschützter Bereich (serverseitige Prüfung empfohlen)
- **E-Mail-Automatisierung:** Google Apps Script (für Buchungsbestätigungen)
- Google Sheets: 
   - Bereitstellungs-ID: AKfycbwZlZ8qVcsr1Aa54_nQk8SuPj3swVB0MvpD1VVnk0w4zDxSjyif2MC9JgUEfa9GPCM8og
   - Web-App URL: https://script.google.com/macros/s/AKfycbwZlZ8qVcsr1Aa54_nQk8SuPj3swVB0MvpD1VVnk0w4zDxSjyif2MC9JgUEfa9GPCM8og/exec

### Sicherheit & Recht
- **Admin-Bereich:** Passwortschutz (Standard: "admin123")
- **Impressum:** Vollständige Kontaktdaten
- **Datenschutz:** Kein Tracking, keine Datenweitergabe
- **Cookie-Hinweis:** Nur informativ (keine Cookies genutzt)

---

## Design & UX

### Farbschema
- **Hauptfarbe:** Waldgrün (#2a5c3a)
- **Hintergrund:** Hellgrau/Eisweiß (#f9f9f9)
- **Akzentfarben:** Braun, Beige, Hellgrün
- **Buttons:** Dunkelgrün (#2a5c3a) mit Hover-Effekten

### Typografie
- **Schriftart:** Segoe UI, Tahoma, Verdana (systembasiert)
- **Größen:**
  - Titel: 1.8em - 2.5em
  - Fließtext: 1em
  - Buttons: 0.9em - 1em

### Interaktionen
- **Buttons:** Hover-Effekte (Farbwechsel, leichte Verschiebung)
- **Navigation:** Unterstrichene Links bei Hover
- **Formulare:** Klare Label, responsive Felder
- **Galerie:** Bilder mit Hover-Effekt (leichtes Zoomen)

### Header
- **Hintergrund:** Header.png
- **Overlay:** Halbdurchsichtiger Farbverlauf (#2a5c3a)
- **Text:** Weiß mit Textschatten für bessere Lesbarkeit
- **Inhalt:** Titel + kurzer Slogan

---

## Admin-Bereich - Vollständige Funktionen

### 1. Kurse verwalten
- **Felder:** Kursname, Datum, Uhrzeit, Ort, Treffpunkt, Verfügbarkeit
- **Funktionen:** Kurse erstellen, bearbeiten
- **Anzeige:** Kursliste mit allen Details

### 2. Seiteninhalte bearbeiten
 | Seite | Bearbeitbare Felder |
 |-------|---------------------|
 | **Startseite** | Titel, Text |
 | **Waldbaden** | Vollständiger Text |
 | **Über mich** | Vollständiger Text |
 | **Galerie** | Bild-URLs hinzufügen/löschen |
 | **Kontakt** | E-Mail, Telefon |
 | **Impressum** | Vollständiger Text |
 | **Datenschutz** | Vollständiger Text |

---

## Rechtliche Anforderungen

### Impressum (§5 TMG)
```html
Resilienzpfade
Laura Demory
Gehrengrabenstraße 1b
77886 Lauf
Telefon: 0176 31152691
E-Mail: laura.naturlauf@gmail.com
Haftungsausschluss: Standardformulierung für eigene Inhalte

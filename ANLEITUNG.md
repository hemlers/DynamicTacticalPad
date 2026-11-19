# Dynamisches Taktikboard bei GitHub und Netlify

Diese Anleitung bringt die Tafel ins Internet. Danach hat jeder Trainer einen Link, und alle Tafeln lernen gemeinsam aus den Verschiebungen. Szenen, Ordner und Texte bleiben bei jedem Trainer im eigenen Browser.

Du brauchst etwa 20 Minuten und musst nichts programmieren. Die Menünamen bei GitHub und Netlify können sich mit der Zeit leicht ändern. Wenn ein Knopf anders heißt, such nach dem ähnlichsten Begriff.

## Was in diesem Ordner liegt

| Datei | Wofür |
|---|---|
| `public/index.html` | die Tafel selbst |
| `public/manifest.webmanifest`, `public/icon-*.png`, `public/logo.svg` | Logo und Angaben, damit man die Tafel als App auf Handy oder Desktop ablegen kann |
| `netlify/functions/gespuer.mjs` | der kleine Server-Teil für das gemeinsame Lernen |
| `netlify.toml` | sagt Netlify, wo was liegt |
| `package.json` | sagt Netlify, welches Zusatzpaket die Funktion braucht |
| `ANLEITUNG.md` | diese Anleitung |

## 1. GitHub: Projekt anlegen

1. Auf github.com ein kostenloses Konto anlegen und anmelden.
2. Oben rechts auf **+** und dann **New repository**.
3. Name: `dynamisches-taktikboard`. Sichtbarkeit: **Private** reicht, Netlify kommt trotzdem dran. Auf **Create repository**.
4. Auf der leeren Seite auf **uploading an existing file** klicken.
5. Die ZIP-Datei auf deinem Rechner entpacken. Öffne den entpackten Ordner und ziehe **seinen Inhalt** (die Ordner `public` und `netlify` sowie die Dateien `netlify.toml`, `package.json`, `ANLEITUNG.md`) in das Upload-Feld. Wichtig: nicht den äußeren Ordner selbst, sonst liegt alles eine Ebene zu tief.
6. Unten auf **Commit changes**.

Prüfen: In der Dateiliste bei GitHub müssen `netlify.toml` und der Ordner `public` ganz oben stehen.

## 2. Netlify: Seite verbinden

1. Auf netlify.com mit **Sign up with GitHub** anmelden. Der kostenlose Plan reicht.
2. **Add new project** (oder **Add new site**), dann **Import an existing project**, dann **GitHub**.
3. Netlify fragt, ob es auf GitHub zugreifen darf. Erlaube den Zugriff auf das Repository `dynamisches-taktikboard`.
4. Das Repository auswählen. Die Einstellungen liest Netlify aus `netlify.toml`, du musst nichts eintragen. Auf **Deploy** klicken.
5. Nach ein bis zwei Minuten steht oben ein Link wie `https://irgendein-name.netlify.app`. Das ist deine Tafel.

Schöneren Namen geben: **Project configuration** (oder **Site configuration**) → **Change project name**, z. B. `taktikboard-koenigstein`. Der Link heißt dann `https://taktikboard-koenigstein.netlify.app`.

Neue Projekte sind bei Netlify anfangs manchmal privat. Wenn andere den Link nicht öffnen können, such in den Einstellungen nach **Visibility** oder **Publish** und stell das Projekt auf öffentlich.

## 3. Admin-Schlüssel setzen

Mit dem Schlüssel kannst nur du das gemeinsame Gelernte sichern, leeren oder zurückholen. Trainer können Gelerntes nicht löschen.

1. In Netlify: **Project configuration** → **Environment variables** → **Add a variable**.
2. Key: `ADMIN_SCHLUESSEL`, Value: ein eigenes Passwort, z. B. `Koenig-Stein-2026!`. Speichern.
3. **Deploys** → **Trigger deploy** → **Deploy project**, damit der Schlüssel aktiv wird.

## 4. Link an die Trainer geben

Den Link einfach per WhatsApp oder E-Mail schicken. Jeder Trainer:

- öffnet die Tafel im Browser, am besten am Laptop oder Tablet,
- baut seine Szenen selbst oder mit Claude (Szenen → Szene hinzufügen),
- speichert alles in seinem eigenen Browser. Wer den Browserverlauf mit „Website-Daten“ löscht, verliert seine Szenen. Unter ⋯ → **Tafel als HTML speichern** → „Mit meinen Szenen“ macht man sich eine Sicherung.

Gemeinsames Lernen: Wenn ein Trainer Spieler verschiebt, merkt sich die Tafel den Versatz pro Rolle und Situation und schickt nur diese Zahlen an den gemeinsamen Speicher. Alle Tafeln holen sich den Stand beim Öffnen und alle fünf Minuten. Eigenes Gelerntes zählt doppelt so stark wie das der anderen. Unter **Bearbeiten → ⋯ → Gelerntes ansehen** sieht jeder Trainer den Stand und kann „Mit allen Trainern lernen“ ausschalten.

## Als App auf Handy oder Desktop ablegen

- **iPhone/iPad (Safari):** Teilen-Knopf → „Zum Home-Bildschirm“.
- **Android (Chrome):** Menü ⋮ → „Zum Startbildschirm hinzufügen“ oder „App installieren“.
- **Laptop (Chrome oder Edge):** In der Adresszeile auf das Symbol „Installieren“ tippen oder Menü → „App installieren“. Die Tafel öffnet sich dann in einem eigenen Fenster mit Logo, ohne Adresszeile.

## 5. Tafel aktualisieren

Wenn du von Claude eine neue `index.html` bekommst:

1. Auf GitHub im Repository den Ordner `public` öffnen.
2. **Add file** → **Upload files**, die neue `index.html` hineinziehen, **Commit changes**.
3. Netlify baut die Seite automatisch neu. Nach einer Minute haben alle die neue Version. Szenen und Gelerntes der Trainer bleiben erhalten.

Jede neue Version kostet bei Netlify 15 Credits. Im kostenlosen Plan gibt es 300 Credits im Monat, das reicht für viele Updates plus die Nutzung durch die Trainer.

## 6. Gemeinsames Gelerntes verwalten (nur du)

Diese Adressen im Browser öffnen. `DEIN-LINK` und `DEIN-SCHLUESSEL` ersetzen:

| Was | Adresse |
|---|---|
| Stand ansehen | `https://DEIN-LINK/api/gespuer?aktion=stand&schluessel=DEIN-SCHLUESSEL` |
| Sicherung anlegen | `https://DEIN-LINK/api/gespuer?aktion=sichern&schluessel=DEIN-SCHLUESSEL` |
| Sicherungen auflisten | `https://DEIN-LINK/api/gespuer?aktion=sicherungen&schluessel=DEIN-SCHLUESSEL` |
| Alles leeren (vorher automatisch gesichert) | `https://DEIN-LINK/api/gespuer?aktion=leeren&schluessel=DEIN-SCHLUESSEL` |
| Letzte Sicherung zurückholen | `https://DEIN-LINK/api/gespuer?aktion=zurueck&schluessel=DEIN-SCHLUESSEL` |
| Bestimmte Sicherung zurückholen | `…?aktion=zurueck&name=sicherung/2026-11-19T12-00-00&schluessel=DEIN-SCHLUESSEL` |

Tipp: Einmal im Monat „Sicherung anlegen“ öffnen.

## Schutz und Grenzen

- Geteilt werden nur Zahlen pro Rolle und Situation, keine Szenen, Namen, Texte oder Teamnamen der Gegner.
- Eine einzelne Korrektur über 15 m wird verworfen, und eine Tafel zählt pro Situation höchstens 50 Korrekturen. So kann niemand allein das Gelernte verbiegen.
- Wer den Link hat, kann die Tafel nutzen und mitlernen. Gib ihn nur an Trainer weiter, denen du vertraust. Suchmaschinen nehmen die Seite nicht auf.
- Ohne Internet funktioniert die Tafel nicht, weil das 3D-Modul beim Öffnen nachgeladen wird.

## Wenn etwas nicht klappt

- **Seite lädt, aber „Gemeinsamer Speicher nicht erreichbar“:** In Netlify unter **Logs → Functions** nachsehen, ob `gespuer` dort steht. Wenn nicht: Liegt `netlify.toml` ganz oben im Repository (Schritt 1)?
- **Deploy schlägt fehl:** Unter **Deploys** den roten Eintrag öffnen und den Text an Claude geben.
- **Admin-Adresse sagt „Kein Zugriff“:** Schlüssel prüfen und nach dem Setzen neu deployen (Schritt 3).

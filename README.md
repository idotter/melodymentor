# MelodyMentor

MelodyMentor ist eine SvelteKit-Anwendung, mit der Lehrpersonen KI-generierte Songs ihrer Klassen verwalten und präsentieren können. Die Plattform verbindet Supabase als Authentifizierungs- und Daten-Backend mit einem modernen Tailwind-basierten UI, damit Klassen spielerisch eine Hitparade für ihre Projekte erstellen können.

## Inhaltsverzeichnis
- [Hauptfunktionen](#hauptfunktionen)
- [Technologie-Stack](#technologie-stack)
- [Projektstruktur](#projektstruktur)
- [Seiten und Workflows](#seiten-und-workflows)
- [Supabase-Integration](#supabase-integration)
- [UI-Design und Interaktionen](#ui-design-und-interaktionen)
- [Lokale Entwicklung](#lokale-entwicklung)
- [Deployment-Hinweise](#deployment-hinweise)

## Hauptfunktionen
- **Globale Charts**: Startseite mit einer Top-10-Liste aller bewerteten Songs (RPC `get_top_songs_global`).
- **Klassencodes & Beitritt**: Schüler*innen treten über Klassencodes anonym bei; anonyme Sessions werden automatisch erstellt.
- **Dashboard für Lehrpersonen**: Übersicht über eigene Klassen, inklusive Erstellung neuer Klassen samt zufällig generiertem Code.
- **Klassenhitparade**: Detailseite je Klasse mit Audio-Player, Bewertungsfunktion (1–5 Sterne) und Upload-Bereich für neue Songs.
- **Bewertungslogik**: Lehrer*innen und Schüler*innen können Songs bewerten; die Anzeige kombiniert Durchschnittsbewertung und persönliche Wertung (`get_songs_with_ratings`).
- **Song-Upload**: Speichern von Metadaten in `songs`, Upload in den Supabase-Storage-Bucket `songs` und automatische Statusvergabe (`pending` vs. `approved`).
- **Authentifizierung**: E-Mail/Passwort-Login für Lehrpersonen, anonyme Sessions für Lernende, inklusive Registrierungs-Flow mit E-Mail-Bestätigung.
- **Begleitmaterial**: Statische Seite mit Unterrichtsideen und Tool-Empfehlungen für den Einsatz von KI-Musik.

## Technologie-Stack
- **Framework**: [SvelteKit](https://kit.svelte.dev/) mit serverseitigen Hooks und Seiten-`load`-Funktionen.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) plus individuelle PostCSS-Keyframes.
- **Backend & Auth**: [Supabase](https://supabase.com/) (`@supabase/ssr` + `@supabase/supabase-js`).
- **Bundling**: [Vite](https://vitejs.dev/).
- **Weitere Libraries**: `canvas-confetti` für UI-Effekte.

## Projektstruktur
```
src/
├─ app.css                # Globale Tailwind-Initialisierung
├─ hooks.server.ts        # Supabase-Client & Session-Verwaltung auf Server-Seite
├─ lib/
│  └─ supabaseClient.ts   # Browser-Supabase-Client für Komponenten
├─ routes/
│  ├─ +layout.(ts|svelte|server.ts)
│  ├─ +page.(svelte|server.ts)          # Öffentliche Startseite & Join-Flow
│  ├─ dashboard/                        # Geschützter Bereich für Lehrpersonen
│  ├─ klassen/[id]/                     # Klassenhitparade inkl. Aktionen
│  ├─ login/ & register/                # Auth-Formulare
│  └─ materialien/ & check-email/       # Statische Inhalte
```
Wichtige Konfigurationsdateien:
- `svelte.config.js` (Adapter Vercel)
- `tailwind.config.js`, `postcss.config.js`
- `tsconfig.json`
- `package.json`

## Seiten und Workflows
### Basislayout (`src/routes/+layout.*`)
- `+layout.server.ts`: injiziert `session` aus `event.locals` in alle Seiten.
- `+layout.ts`: initialisiert den Browser-Supabase-Client, synchronisiert Cookies und leitet `session` sowie `user` in die Frontend-Komponenten weiter.
- `+layout.svelte`: setzt globale Styles und lauscht auf Auth-Status-Änderungen, um `supabase:auth` zu invalidieren.

### Öffentliche Startseite (`src/routes/+page.*`)
- Server: leitet eingeloggte Lehrer*innen aufs Dashboard um, lädt globale Top-Songs über RPC `get_top_songs_global(limit_count := 10)`.
- Client: animierte Landing-Page mit Konfetti-Beta-Badge, Top-10-Liste, Join-Formular (`?/joinClass`) und Links zu Login/Materialien.

### Klassenbeitritt (`?/joinClass` Action)
- Validiert Klassencode gegen Tabelle `classes`.
- Erstellt anonyme Supabase-Session (`signInAnonymously`) und leitet zur Klassenseite (`/klassen/:id`).

### Dashboard (`src/routes/dashboard`)
- `+layout.server.ts`: schützt alle Unterseiten vor unauthentifizierten Zugriffen.
- `+page.server.ts`: listet alle Klassen des eingeloggten Lehrers (`classes` by `owner_id`), bietet Actions `?/logout` und `?/createClass`.
- `+page.svelte`: UI für Klassenübersicht, Erstellung, Logout.

### Klassenhitparade (`src/routes/klassen/[id]`)
- Server: lädt Klassenmetadaten und Songs via RPC `get_songs_with_ratings(p_class_id, p_user_id)`; fällt auf Platzhalter-UUID zurück, falls kein User.
- Actions:
  - `saveSongMetadata`: persistiert Songtitel, Interpret, Datei-URL, setzt Status (Owner → `approved`, sonst `pending`).
  - `deleteSong`: entfernt Song aus Storage und Datenbank (nur Owner im UI sichtbar).
  - `rateSong`: speichert/updatet Bewertung in `ratings` (Upsert `song_id, user_id`).
- Client: zeigt Ranking mit Audio-Player (Supabase Public URL), Bewertungssterne (Form `?/rateSong` + `invalidateAll`) und Upload-Formular (nur Lehrpersonen).

### Authentifizierung (`src/routes/login`, `src/routes/register`, `src/routes/check-email`)
- **Login**: Server-Action `signInWithPassword`; erfolgreiche Anmeldung → Redirect `/dashboard`.
- **Registrierung**: erstellt Supabase-User, aktualisiert `profiles.full_name`, verschickt Magic-Link (Redirect `/check-email`).
- **Check-Email**: Hinweis-Seite nach Registrierung.

### Unterrichtsmaterialien (`src/routes/materialien/+page.svelte`)
- Statische Ressourcensammlung mit Unterrichtsideen, Tool-Links und Hinweisen (rechtlich & methodisch).

## Supabase-Integration
### Environment Variablen
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

Diese Werte werden sowohl im Server-Hook (`hooks.server.ts`) als auch in den Layout-`load`-Funktionen und im Browser-Client benötigt. Für serverseitige Funktionen werden Cookies übergeben, damit Auth-Status erhalten bleibt.

### Hooks & Locals
- `event.locals.supabase`: Server-Client mit Cookie-Verwaltung.
- `event.locals.user`: Ergebnis von `supabase.auth.getUser()`.
- `event.locals.session`: Ergebnis von `supabase.auth.getSession()`.

### Datenbank-Tabellen (Erwartet)
- `classes` (`id`, `name`, `owner_id`, `class_code`)
- `songs` (`id`, `class_id`, `title`, `artist`, `audio_url`, `status`, `uploader_info` …)
- `ratings` (`song_id`, `user_id`, `rating_value`, Timestamps)
- `profiles` (`id`, `full_name`, …)

### RPC-Funktionen
- `get_top_songs_global(limit_count integer default 10)` → `[{ id, title, artist, average_rating, class_id, class_name }]`
- `get_songs_with_ratings(p_class_id uuid|int, p_user_id uuid)` → Songliste inkl. Durchschnitt und persönlicher Bewertung (`user_rating`).

### Storage
- Bucket `songs`: Upload-Pfad `${user.id}/${class_id}/${timestamp}-${filename}`.
- Public URL wird über `supabase.storage.from('songs').getPublicUrl(path)` generiert.

## UI-Design und Interaktionen
- Konfetti-Badge auf Startseite (`canvas-confetti`).
- Animierte Rankings & Buttons (custom Keyframes in `+page.svelte`).
- Responsive Layouts (Grid- und Flex-Kombinationen), Sticky Upload-Panel auf Klassenseite.
- Formulare nutzen `enhance`/`invalidateAll`, um ohne vollständiges Reload zu reagieren.

## Lokale Entwicklung
1. **Installieren**: `npm install`
2. **Environment**: `.env` oder `.env.local` mit `PUBLIC_SUPABASE_URL` & `PUBLIC_SUPABASE_ANON_KEY` befüllen; zusätzlich Service-Role-Key für RPC-Setup nur serverseitig verwenden.
3. **Supabase vorbereiten**:
   - Tabellen `classes`, `songs`, `ratings`, `profiles` inkl. Row-Level-Security-Regeln erstellen.
   - Storage-Bucket `songs` anlegen.
   - RPC-Funktionen `get_top_songs_global` & `get_songs_with_ratings` deployen.
4. **Starten**: `npm run dev` (öffnet Vite-Dev-Server).
5. **Build/Test**: `npm run build`, `npm run preview`.

## Deployment-Hinweise
- Vercel-Adapter (`@sveltejs/adapter-vercel`) ist vorbereitet.
- Supabase-URL/Keys als Environment-Variablen auf der Zielplattform setzen.
- Sicherstellen, dass Supabase Storage & RLS-Regeln für Produktionsdomain konfiguriert sind.
- Optional: Edge-Funktionen für weitere Aggregationen oder Moderationsprozesse ergänzen.

---

**Kontakt & Weiterentwicklung**
- Erweiterungen: Moderationsansicht für pending Songs, Reporting, Export-Funktionen.
- Feedback & Ideen willkommen!

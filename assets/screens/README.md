# Screens on the site

iPad captures for the `#screens` rail of `index.html`. The rail shows 02, 03, 04, 08 and 09; 01, 05, 06 and 07 stay on disk but are off the rail because they show empty forms. Originals (2160×1620) live in `../iPad screens/`; the files here are resized to 1440×1080, PNG for flat UI and JPG where photos make PNG heavy.

| File | Caption on site |
|---|---|
| 01-sign-in.png | Sign in, or unlock offline with PIN |
| 02-fleet.jpg | Fleet overview |
| 03-records.png | Records per aircraft |
| 04-preflight.png | Preflight: oil, fuel, tyre pressure |
| 05-flight-data.jpg | Flight & Flight Data |
| 06-engine.png | Engine parameters |
| 07-all-weather.jpg | All Weather Operations |
| 08-review.png | Review and signatures |
| 09-paper-form.jpg | Paper backup form |

To change captions or add more, edit the `<figure class="shot">` entries in `index.html` (section `#screens`). A missing file shows a labelled placeholder.

These captures came from a test tenant. Real people's names and a sync-error toast were painted over in 01, 02, 05, 08 and 09 (fictional crew: Marko Petrović, Ana Kovač; reason "iPad battery failed"). The originals in `../iPad screens/` are unedited and must not be published. Replace all of these with captures from a demo tenant (fictional crew and registrations, happy-path filled states) when they are available.

The rail serves WebP (`NN-name-960.webp`, `NN-name-1440.webp`) through `<picture>`, with the PNG/JPG as fallback. When a capture is replaced, regenerate both WebP widths (quality 80) from the new 1440×1080 file.

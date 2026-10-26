# eTLB — Electronic Aircraft Technical Log — Handoff dokument

Ovaj fajl je instrukcija za Claude agenta koji radi na projektu.
Pročitaj ga ceo pre nego što napišeš i jednu liniju koda.

> **Jezik:** dokumentacija i task fajlovi su na srpskom, **UI aplikacije i sav kod (nazivi klasa, polja, endpointa, stringovi u UI-u) su na engleskom.** Domenski termini se ne prevode (Preflight, Block OFF, Defect, Deferred, Release to Service...).

---

## 1. Kontekst projekta

Elektronska verzija Aircraft Technical Log (ATL) knjige za avio-operatera **Prince Aviation**.
Zamenjuje papirni ATL obrazac koji piloti i tehničko osoblje popunjavaju pre, tokom i posle svakog leta.

Primarni uređaj je **iPad (landscape)**. Aplikacija se koristi u avionu, gde interneta često nema, pa **mora raditi potpuno offline** i sinhronizovati se kada mreža postoji.

> **Odluka 2026-09-24 — dva cilja iz istog koda.** Klijentska aplikacija (piloti, tehničari) se isporučuje i kao **iPad aplikacija** i kao **web klijent u browseru (PWA)**, iz istog Expo koda, i **oba moraju raditi potpuno offline** — lokalna SQLite baza, outbox i sync engine su isti, samo je storage driver platformski. **Web admin panel** (CAMO / Admin) je isključivo web i ne mora raditi offline. Detalji: [12](Docs/12-mobile-app.md) §Web klijent, [11](Docs/11-offline-sync.md) §Lokalna baza.

Sistem je **multitenant** — jedan tenant = jedna aviokompanija (Prince Aviation je prvi).

Izvorni zahtev klijenta: `Docs/Zahtevi za eTLB.docx` (originalna verzija) + **revizija „Functional Requirements" od 2026-09-01, dostavljena e-mailom** — izmene iz revizije su ugrađene u task fajlove ispod. Task fajlovi su razrada tog dokumenta i **oni su merodavni** za implementaciju.

> ⚠️ **Putanje su `Docs/` sa velikim D, i fajlovi NISU u podfolderu `tasks/`.** Windows to prašta, Linux CI ne — ne pisati `docs/tasks/`.

```
Docs/
├── 00-overview.md                 ← POČNI OVDE — tok podataka, moduli, ključna pravila
├── 01-arhitektura.md              ← slojevi, DB model, multitenancy, temporal tables
├── 02-auth-korisnici.md           ← auth, uloge, permisije, PIN, potpisi
├── 03-sifarnici.md                ← ATA, aerodromi, fluid types, enumeracije
├── 04-flota-konfiguracija.md      ← avioni, tipovi, dinamička polja (gume, motori, ulje)
├── 05-atl-log.md                  ← životni ciklus ATL zapisa, numeracija, potpisi, zaključenje
├── 06-preflight.md                ← sekcija 2 iz zahteva
├── 07-flight-i-flight-data.md     ← sekcije 3 i 4 iz zahteva
├── 08-engine-parametri-awo.md     ← sekcije 5 i 6 iz zahteva
├── 09-defekti-mel.md              ← sekcija 7 + non-airworthiness lista
├── 10-odrzavanje-extensions.md    ← next maintenance, extensions (CAMO)
├── 11-offline-sync.md             ← lokalna baza, outbox, konflikti, sync API
├── 12-mobile-app.md               ← React Native / Expo struktura, navigacija, offline UI
├── 13-izvestaji-pdf.md            ← PDF ATL zapisa, izveštaji, export
├── 14-web-admin.md                ← web admin panel (CAMO / Admin / SuperAdmin)
├── 15-notifikacije-isporuka.md    ← e-mail notifikacije, slanje PDF-a CAMO-u, delivery monitor
├── 16-regulatorno-i-isporuka.md   ← regulatorni okvir, retencija, backup, okruženja, DoD po fazi
├── 17-dizajn-ui.md                ← **UI dizajn je gotov** — mapa 41 ekrana → moduli, design tokens
├── Zahtevi za eTLB.docx           ← originalni zahtev klijenta (pre revizije)
├── tools/gen-workitems.py         ← generator Azure DevOps work item-a iz .md checkbox-ova
└── eTLB-workitems-1-*.csv         ← izvoz u Azure Boards (F0–F3), `eTLB-workitems-2-*.csv` (F4–F7 + R)
                                     NIJE izvor istine; regeneriše se sa `python Docs/tools/gen-workitems.py`
```

**UI dizajn aplikacije je kompletno napravljen** i živi u folderu `Ui dizajn aplicije/` u korenu repozitorijuma:

```
Ui dizajn aplicije/
├── README.md              ← handoff: design tokens, tipografija, opis svih 41 ekrana,
│                            ponašanje, state model, spisak nedostavljenih asseta
├── eATL iPad.dc.html      ← svih 41 ekrana (01–27 iPad, 28–41 admin), <section data-screen-label="NN">
├── support.js             ← runtime design fajla, NIJE deo isporuke
└── image-slot.js          ← drop-slot za nedostavljeni artwork, NIJE deo isporuke
```

**Pre svakog UI taska pročitaj `Ui dizajn aplicije/README.md` i otvori odgovarajući ekran u `.dc.html`.**
Mapa ekrana po modulima i pravila prenošenja tokena su u [Docs/17-dizajn-ui.md](Docs/17-dizajn-ui.md).

---

## 2. Dogovoreni tech stack

### Backend
| Stavka | Odluka |
|---|---|
| Framework | **ASP.NET Core Web API (.NET 10 LTS)** |
| ORM | **Entity Framework Core 10** + **Npgsql** |
| Baza | **PostgreSQL 16+** (Azure Database for PostgreSQL — Flexible Server) |
| Istorija podataka | **`temporal_tables` ekstenzija** (istorijske tabele) + aplikativni `AuditLog` |
| Auth | **ASP.NET Core Identity + JWT** (access ~15 min, refresh 30 dana) |
| Validacija | **FluentValidation** (u API sloju) |
| Mapiranje | **ručne `ToDto()` / `ToEntity()` extension metode** — bez AutoMapper-a |
| Fajlovi | **Azure Blob Storage** (potpisi, fotografije defekata, PDF); backup na disk |
| PDF | **QuestPDF** |
| Excel | **ClosedXML** |
| Logging | Serilog → Azure Application Insights |
| Arhitektura | Clean Architecture po **slojevima unutar jednog projekta** (`ETLB.API`): `Domain / Application / Infrastructure / Controllers` — vidi §3 i §4 |

### Frontend — klijentska aplikacija (iPad + web klijent, isti kod)
| Stavka | Odluka |
|---|---|
| Framework | **React Native + Expo (najnoviji stabilni SDK)** |
| Build | **Expo Go za razvoj, Expo Dev Client + EAS Build za isporuku** — vidi `clients/mobile/README.md` |
| Jezik | **TypeScript, strict mode** |
| Navigacija | **Expo Router** (file-based) |
| Lokalna baza | **`expo-sqlite` + Drizzle ORM** |
| Server state | **TanStack Query** (sa persist-om) |
| Lokalni state | **Zustand** (sesija, sync status, UI) |
| Forme | **React Hook Form + Zod** |
| UI | **React Native Paper** sa custom temom |
| Potpis | `react-native-signature-canvas` (crtanje na profilu) |
| Kamera | `expo-camera` + `expo-image-manipulator` (kompresija) |
| Secure storage | `expo-secure-store` (tokeni, PIN hash) |
| **Web cilj** | **Expo web (`react-native-web`) + PWA** (manifest, service worker, HTTPS) — isti ekrani; platformske razlike idu u `.web.ts(x)` varijante fajla, ne u `if (Platform.OS)` po ekranima |
| Lokalna baza na webu | **`expo-sqlite` web driver (wa-sqlite nad OPFS)** — ista Drizzle šema i migracije; hosting šalje COOP/COEP zaglavlja. Plan B: `sql.js` + OPFS persist. **Ne IndexedDB kao model** |
| Secure storage na webu | Web Crypto (`CryptoKey`, non-extractable) + IndexedDB; PHC zapis PIN-a i refresh token šifrovani tim ključem — slabije od Keychain-a, prihvaćeni rizik dokumentovan u [02](Docs/02-auth-korisnici.md) |
| QR na webu | `BarcodeDetector` API gde postoji, inače `@zxing/browser`, nad `getUserMedia` |
| Potpis na webu | HTML canvas (`signature_pad`) u `SignaturePad.web.tsx`, isti PNG izlaz |
| Hosting web klijenta | Azure Static Web Apps po okruženju; HTTPS obavezan (service worker, kamera), COOP/COEP u konfiguraciji hostinga |

### Frontend — web admin panel
| Stavka | Odluka |
|---|---|
| Framework | **React 19 + Vite + TypeScript (strict)** |
| Rute | **TanStack Router** (typed rute) |
| UI | **MUI v6 + MUI DataGrid** |
| Server state | **TanStack Query** |
| Forme | **React Hook Form + Zod** (iste Zod šeme kao mobilna app) |
| Grafikoni | **Recharts** |
| Testovi | Vitest + React Testing Library, Playwright za E2E |
| Razlog | isti jezik, ekosistem i deljeni paket kao mobilna aplikacija — jedna implementacija domenske logike, jedan set tipova, jedan mentalni model |

### Deljeni paket

`clients/packages/shared` je jedini izvor za stvari koje **moraju** biti identične na oba klijenta i na serveru:

- TypeScript tipovi generisani iz OpenAPI specifikacije backend-a
- Zod šeme za validaciju formi
- Čista domenska logika: `MaintenanceCalculator`, kanonizacija payload-a za hash i QR verifikaciju, konverzija jedinica (kg↔lbs, PSI↔bar), `HH:MM` ↔ minuti
- Konstante permisija i enum mapiranja

Ako se ista logika napiše dva puta, implementacije se raziđu i to se otkrije u produkciji. Zato: **domenska logika ide u `shared`, nikad u `clients/mobile/` ili `clients/web-admin/` direktno.**

---

## 3. Struktura repozitorijuma

> ⚠️ **Od 2026-09 je jedan projekat, ne četiri.** `ETLB.Domain`, `ETLB.Application` i
> `ETLB.Infrastructure` su spojeni u `ETLB.API` (nije bilo potrebe da budu odvojivi/reusable
> asemblji). Slojevi i dalje postoje, ali kao **folderi i namespace-ovi unutar
> `src/ETLB.API/`**, ne kao zasebni `.csproj`. Pravila zavisnosti iz §4 i dalje važe —
> proveravaju se preko namespace-a (`tests/ETLB.UnitTests/Architecture/*`), ne preko
> granice asemblija.

```
eTLB/
├── src/
│   └── ETLB.API/                 ← jedan projekat, slojevi kao folderi/namespace-ovi:
│       ├── Domain/               ← ETLB.Domain.* — entiteti, enumeracije, domenska pravila
│       ├── Application/          ← ETLB.Application.* — interfejsi, DTO-ovi
│       ├── Infrastructure/       ← ETLB.Infrastructure.* — EF Core, repozitorijumi, Blob
│       ├── Controllers/          ← ETLB.API.Controllers — kontroleri
│       └── Program.cs
├── clients/                       ← sve front-end (odvojeno od backend `src/`)
│   ├── packages/
│   │   └── shared/                ← @etlb/shared: tipovi, Zod šeme, čista domenska logika
│   ├── mobile/                    ← Expo / React Native aplikacija
│   │   ├── src/
│   │   │   ├── app/               ← Expo Router rute (testovi ruta žive u src/__tests__/app/, ne ovde)
│   │   │   ├── api/               ← HTTP klijent, generisani tipovi
│   │   │   ├── db/                ← Drizzle šeme, migracije, repozitorijumi
│   │   │   ├── sync/              ← outbox, sync engine, konflikti
│   │   │   ├── features/          ← preflight, flight, defects, maintenance...
│   │   │   ├── components/
│   │   │   └── stores/
│   │   └── e2e/                   ← Maestro flow-ovi
│   └── web-admin/                 ← React + Vite admin panel
│       └── e2e/                   ← Playwright
├── tests/
│   ├── ETLB.UnitTests/
│   └── ETLB.IntegrationTests/    ← Testcontainers + PostgreSQL
│   (frontend testovi žive uz kod: clients/mobile Jest+RNTL, clients/web-admin Vitest+RTL)
├── Docs/                         ← specifikacija i task fajlovi (00–17) + izvorni .docx
├── Ui dizajn aplicije/           ← GOTOV UI dizajn: handoff README + 41 ekran (.dc.html)
├── pnpm-workspace.yaml           ← clients/packages/*, clients/mobile, clients/web-admin
├── package.json                  ← workspace root, deljene skripte
└── CLAUDE.md
```

---

## 4. Nepregovarljiva pravila arhitekture

> Pravila ispod govore o **slojevima** (Domain/Application/Infrastructure/API). Fizički su
> to od 2026-09 folderi i namespace-ovi u jednom projektu (`ETLB.API`), ne zasebni
> asemblji (§3) — granica se i dalje poštuje, samo se proverava preko namespace-a
> (`tests/ETLB.UnitTests/Architecture/LayerDependencyTests.cs`,
> `ApiLayerTests.cs`), ne preko `ProjectReference`-a. Ne dodavati referencu iz
> `Domain/`/`Application/` ka `Infrastructure/`/`Controllers/` samo zato što compajler to
> sada dozvoljava.

- **Kontroler nema biznis logiku.** Kontroler sme samo: da primi request, pusti validaciju (FluentValidation), pozove servis, mapira rezultat u HTTP odgovor. Nijedan `if` sa domenskim značenjem, nijedan `DbContext`, nijedan `Include`.
- **Tok je uvek:** `Controller → Service (Application) → Repository (Infrastructure) → DbContext`. Kontroler ne sme videti repozitorijum, servis ne sme videti `DbContext`.
- **Repozitorijum ne zna za HTTP** i ne vraća DTO — vraća entitete ili projekcije.
- **Unit of Work** drži transakciju; `SaveChanges` se poziva iz servisa preko `IUnitOfWork`, nikad iz repozitorijuma.
- **Svaki entitet nosi `TenantId`**, osim globalnih šifarnika i `Tenant`. Filtriranje ide kroz EF global query filter + PostgreSQL RLS. **Nikad ručno ne piši `Where(x => x.TenantId == ...)` u servisu** — filter to radi.
- **Svaki entitet ima:** `Id (uuid v7)`, `CreatedById`, `CreatedAtUtc`, `ModifiedById`, `ModifiedAtUtc`, `IsDeleted` (soft delete), `RowVersion` (xmin) i `SyncVersion` (bigint, kursor za sync).
- **`SET LOCAL`, nikad `SET`.** Tenant se postavlja u PostgreSQL session varijablu isključivo kroz `SET LOCAL` unutar transakcije. Npgsql pooling vraća konekciju sa zaostalim `SET`, i RLS onda savršeno propušta tuđe redove. Test sa pool-om je obavezan deo F0.
- **Nema `any` u TypeScriptu, nema `object`/`dynamic` u C#** gde postoji konkretan tip.
- **Svaki API endpoint ima typed klijent** i na mobilnoj i na web strani.
- **Sve što ulazi u ATL zapis mora proći kroz lokalnu bazu na uređaju**, nikad direktno u API. Ekran piše u SQLite, sync engine šalje na server. Ovo važi bez izuzetka jer je to jedini način da offline radi isto kao online. **Važi jednako za web klijent:** browser piše u lokalni SQLite nad OPFS, ne u API, i ne u TanStack Query cache kao izvor istine.
- **Domenska logika koja postoji i na klijentu i na serveru ide u `clients/packages/shared`.** Kalkulacija preostalog resursa održavanja, kanonizacija payload-a, konverzija jedinica i `HH:MM` konverzija se pišu **jednom**. Ako se implementiraju i u C# i u TypeScript-u (neizbežno za neke), moraju imati **testove koji porede rezultate na istom skupu ulaza**.
- **UI se ne izmišlja.** Dizajn je gotov: raspored, boje, tipografija, tekstovi labela, semantika statusa i empty/error/blocked stanja dolaze iz `Ui dizajn aplicije/`. Ako ekran za nešto ne postoji, to je otvoreno pitanje — ne improvizuj izgled.
- **HTML dizajn fajl je referenca, ne kod.** Ekrani se **rekreiraju** u React Native Paper (iPad) i MUI v6 (admin) — HTML/CSS se ne portuje i web layout ne ulazi u React Native. `support.js` i `image-slot.js` nisu deo isporuke.
- **Nijedan hex u komponenti.** Design tokens iz README-a idu u jedan tema fajl po klijentu (`clients/mobile/src/theme`, `clients/web-admin/src/theme`); komponente koriste isključivo tokene. Semantičke boje (zeleno / amber / crveno / ljubičasto za override i paper origin) se **nikad ne koriste dekorativno**.
- **Tri stanja vrednosti su vizuelno različita i moraju takva ostati:** *uneto*, *preuzeto/automatsko* (plavi `AUTO` / `PREV` / `CARRIED` marker) i *izračunato* (nije fokusabilno, `— : —` dok ulaza nema). To je UI projekcija `IsManuallyOverridden` i `IsCarriedOver` polja.
- **Blokada nikad nije tiho onemogućeno dugme** — ekran imenuje uzrok, šta bi ga otklonilo i legitiman izlaz.
- **Ni `clients/mobile/` ni `clients/web-admin/` ne smeju imati sopstvenu kopiju tipa koji dolazi iz API-ja.** Tipovi se generišu iz OpenAPI specifikacije u `clients/packages/shared` skriptom koja radi u CI-ju.

---

## 5. Ključna poslovna pravila (ne zaboravi)

### Struktura zapisa
- **Broj zapisa:** `{REGISTRACIJA}-{NNNNNN}` (npr. `YU-RDA-000001`), per avion, **kontinuirana sekvenca po vazduhoplovu**, dodeljuje ga server.
- **Header ATL-a se konfiguriše po operativnom entitetu (SI / SR)** — logo, adresa i CAMO Approval Number po entitetu, ne po tenantu.
- **Terminologija: Commander, ne PIC.** Sav kod, UI i dokumentacija koriste `Commander`.
- **Jedan ATL zapis = jedan let.** Sadrži Preflight → Flight → Flight Data → (opciono Engine params, All Weather) → (opciono Defects).
- Piloti biraju avion, pa vide listu svih zapisa tog aviona (najnoviji gore).
- **Najviše jedan zapis u statusu `Draft` ili `PreflightSigned`** po avionu. Zapisi koji čekaju potpis tehničara ne blokiraju nove letove.
- **Potpisan zapis se pri sync-u nikad ne odbija**, ni kada je duplikat — prihvata se, flaguje i razrešava ručno.
- Preflight se radi **pred svaki let**.

### Prenos podataka iz prethodnog leta
- `Flight Time Since Previous ATL` i `Landings Since Previous ATL` se preuzimaju iz **poslednjeg zaključenog zapisa istog aviona**.
- `FROM` aerodrom se preuzima iz `TO` aerodroma poslednjeg zaključenog zapisa.
- `Fuel Onboard` na kraju prethodnog leta je predlog za sledeći Preflight.
- Svi preuzeti podaci su **predlog koji pilot može da promeni**, a promena se beleži (`IsManuallyOverridden = true`).

### Potvrda aviona (QR)
- Pilot vidi celu flotu i bira avion; pre otvaranja novog ATL zapisa mora **potvrditi da je u tom avionu skeniranjem QR koda** zalepljenog u kokpitu.
- Svaki avion ima svoj QR kod. Payload je **potpisan ECDSA P-256 (ES256) ključem tenanta**; privatni ključ ostaje u Key Vault-u, uređaji dobijaju samo javni ključ, pa **verifikacija radi offline**. (Ed25519 je odbačen jer ga Azure Key Vault ne podržava — vidi [04](Docs/04-flota-konfiguracija.md).)
- Svrha nije zaštita od napada (u kokpitu je ovlašćeno lice) nego **sprečavanje greške** — pogrešno izabran avion na floti sa sličnim registracijama.
- **Bez validne potvrde zapis se ne kreira.** Potvrda važi za jedan zapis i istekne posle 60 minuta.
- Skeniran QR drugog aviona → jasna greška sa oba naziva i ponuda prebacivanja.
- **Manual override je obavezan izlaz** (oštećena nalepnica, prljav objektiv, odbijena permisija kamere). Traži obavezan razlog, PIN potvrdu, i beleži se u zapis, PDF i audit. Nadzor override-a je zaseban ekran u admin panelu.
- Generisanje novog koda poništava stari. Poništeni kodovi ostaju u bazi jer su vezani za stare potvrde.

### Potpisi i zaključenje
- Korisnik **sam nacrta svoj potpis prstom (ili Apple Pencil-om) na svom profilu** i sačuva ga; čuva se kao **PNG slika** (transparentna pozadina) u Blob Storage-u. **Klijent ne dostavlja skenirane potpise — nema uvoza, svaki potpisnik crta svoj** (revizija 2026-09-09).
- Part-66 broj dozvole (`AuthorizationNumber`) je **tekstualno polje**, obavezno za maintenance staff. Kompanijski pečat ostaje **slika koju admin upload-uje** — jedini asset koji se i dalje čeka.
- Pri potpisivanju zapisa korisnik unosi **svoj PIN**; sistem tada učitava sačuvani potpis i vezuje ga za zapis.
- Uz potpis se čuva: ime, uloga u trenutku potpisa, **snapshot slike potpisa**, `SignedAtUtc` (server), `DeviceTimeUtc`, i **hash sadržaja zapisa**.
- Potpisi čine **hash lanac** (`PreviousHash` → `ContentHash`) da bi naknadna izmena bila dokaziva.
- **ATL se ne može zaključiti bez `TechnicalStaffClose` potpisa tehničara** (Technical Staff — **ne CAMO**) i `CommanderFlight` potpisa Commandera. **Potpis tehničara na Preflight release-u NE zadovoljava uslov** — potpis dat pre leta ne overava ono što se tokom leta dogodilo. Ako tehničara nema, zapis čeka u `FlightCompleted` i **to ne blokira sledeći let**. Odlučeno 2026-09-11 — vidi [ADR-0011](Docs/arc42/adr/0011-zakljucenje-i-amendment.md).
- **Posle potpisa zapis je nepromenljiv.** Ispravka ide isključivo kroz **Amendment** — novi zapis vezan za originalni, sa razlogom izmene i novim potpisom. Original ostaje netaknut i vidljiv.
- **Obim amendmenta se izvodi iz mape hash obuhvata, ne iz zasebne tabele:** izmena polja poništava svaki potpis čiji hash obuhvat pokriva to polje; ti potpisi se ponavljaju, ostali se prenose kao snapshot. `TechnicalStaffClose` hashuje ceo zapis, pa se **ponavlja uvek**. `AircraftId` je jedino polje koje amendment ne sme da menja. **Nema odobrenja drugog lica** ([ADR-0011](Docs/arc42/adr/0011-zakljucenje-i-amendment.md)). **Original postaje `Amended` tek kada tehničar zaključi amendment**; amendment se otvara samo nad `Closed` zapisom, ne blokira sledeći let, i u prvoj fazi (2026-10-16) ispravlja Flight / Flight Data / `Remarks` — Preflight se prenosi sa release potpisom kao snapshot.
- **Void** = poništavanje pogrešno otvorenog zapisa **koji još nije potpisan**. Zapis ne nestaje iz baze, dobija `Status = Voided`, razlog i korisnika. Posle prvog potpisa void više nije moguć — jedino Amendment.

### Obavezna polja i validacija potpisa
- **Sistem ne sme dozvoliti potpis sekcije dok obavezna polja nisu popunjena** (`shall`). Validator vraća listu polja koja nedostaju; ista funkcija radi na klijentu (offline) i na serveru.
- Obavezno u Preflight-u: `Date`, `Oil Uplift` (`OK` ili qt), `Fuel Uplift` + `Fuel Onboard`, `Tire Pressure` (pre prvog leta u danu), next maintenance snapshot, i **nijedan neobrađen otvoren defekt**.
- Obavezno u Flight / Flight Data: Commander, **`SIC`**, `STW` (na tipovima gde je primenljiv), sve četiri kategorije putnika (`0` kada nema), `TO`, `Nature of Flight`, `Fuel at Cut-Off`, `Block OFF`/`Block ON`/`Block Time`, `Take-Off`/`Landing`/`Total Flight Time`.
- **`SIC` je obavezno polje posade, ali uloga `Sic` ostaje read-only** — SIC se navodi u posadi, ne popunjava i ne potpisuje ništa. Slobodan unos imena zadovoljava obaveznost.

### Gorivo i ulje
- **Fuel uplift se unosi u litrima, sistem konvertuje u lb**; gustina se snapshotuje u zapis. Tip goriva je **JET-A1 automatski**, drugi unosi Commander.
- **Radna jedinica goriva u ATL zapisu je uvek `lb`.** `Aircraft.FuelUnit` je jedinica prikaza u izveštajima, **ne** jedinica skladištenja — nikad ne čuvati gorivo „u jedinici aviona".
- **`Ramp Fuel`** (bivši `Fuel at Take-Off`) se automatski prenosi iz Preflight `Fuel Onboard` u lb. **`Fuel Used`** se prikazuje u lb i u litrima.
- **Oil uplift je obavezan**: `OK` (nije bilo dolivanja) ili količina u **quarts**.

### Tire pressure
- **Obavezan za sve avione** (MTOM ograničenje ukinuto — **ne implementirati prag od 5700 kg**), **pre prvog leta u kalendarskom danu (UTC)**; naredni letovi istog dana preuzimaju vrednosti (fizička kopija sa `IsCarriedOver`, ne join), novi dan ih ponovo traži.
- Konfiguriše se po **tipu aviona, konfiguraciji stajnog trapa i poziciji gume**. Falcon 2000: **NLG LH/RH + MLG Inboard/Outboard po nozi (6 pozicija)**; Citation 560XL: NLG / LH MLG / RH MLG.
- **Unos je dropdown iz predefinisane liste *ili* ručni unos** — ručni unos nije ograničen na ponuđene vrednosti.

### Vreme
- Sva vremena se čuvaju kao **UTC**.
- Redosled vremena je normativan: `Block OFF` → `Take-Off` → `Landing` → `Block ON`. Prikaz u `HH:MM`, čuvanje u minutima.
- Uz svako vreme koje sistem automatski upisuje beleži se i `DeviceTimeUtc` i **offset sata uređaja u odnosu na server** (izmeren pri poslednjem sync-u).
- Ako je offset veći od 60 sekundi, zapis se **flaguje** i vidi se u admin panelu. Pilot smije ručno da promeni vreme, ali se to obeležava.

### Defekti
- Defekt je **entitet vezan za avion**, ne kopija po zapisu. Prijavljen je na jednom ATL zapisu i **ostaje vidljiv na svakom sledećem Preflight-u dok se ne zatvori**.
- Statusi: `Open`, `Deferred`, `Rectified`, `Closed`.
- Non-airworthiness stavke su odvojena lista sa svojim statusima: `Open`, `PlannedForMaintenance`, `AwaitingParts`, `Rectified`, `Closed`.
- Pilot prijavljuje defekt i može da priloži fotografije (slika iPad-om). **Rectify / close / CRS sme isključivo maintenance staff — niko drugi, ni CAMO.** Potpis je obavezan, uz kompanijski pečat i Part-66 broj dozvole; posle akcije ide **CRS blok**. **Deferral po MEL/CDL stavci iz biblioteke smeju maintenance staff i Commander** (klijent 2026-10-02: „pilot takođe može da zatvori defect otvaranjem MEL/CDL"); **deferral van biblioteke je zabranjen** — svaki deferral referencira stavku iz biblioteke.
- **MEL biblioteka je operatorska i po operativnom entitetu** (`MelCdlDocument`: entitet SR/SI + tip + varijanta XLS/XLS+ + revizija; stavke i podstavke ispod), ne globalni šifarnik — SR i SI imaju **različite MEL dokumente za isti tip** (dokumenti 2026-10-02). Održavaju je **Admin i CAMO staff**; nova revizija se **uvozi odjednom** (Excel šablon, format čeka klijenta), ne stavku po stavku (klijent 2026-10-02 — poništava „uvoz ukinut" od 2026-09-24). **CDL je AFM supplement proizvođača bez kategorije i roka** — deferral po CDL stavci nosi trajno ograničenje, ne rok.
- **Rok deferral-a: dan otkrića se ne računa** — interval teče od 00:00 UTC narednog dana i ističe u 23:59:59 poslednjeg dana. Ne `AddDays(n)`.
- **MEL biblioteka po tipu aviona** je deo sistema. Rok deferral-a se računa automatski po kategoriji (B/C/D); **kategoriju A definiše posada** po tekstu MEL stavke. **DDL se popunjava automatski.**
- **Istekao MEL rok tvrdo blokira popunjavanje ATL-a** za sve osim maintenance staff-a — nema „continue anyway".
- **Non-airworthiness lista nije vidljiva nigde na ATL-u** ni u njegovom PDF-u. Ima zaseban ekran „sa strane", **popunjava je Commander** (i Admin — potvrđeno 2026-10-02; maintenance staff i CAMO ne; ATA dropdown + slobodan opis). **Kad se delovi nabave, stavka se jednim klikom prebacuje u airworthiness** sa datumom prebacivanja i od tada se vidi na ATL-u i u PDF-u (klijent 2026-10-02; ko sme i da li kao defekt ili `Remarks` — čeka odgovor, vidi [09](Docs/09-defekti-mel.md)).

### Održavanje
- `Next Maintenance` (po flight time, datumu i landings) unosi **CAMO ručno** po avionu.
- Extension unosi i menja **CAMO uloga** (i Admin, po pretpostavci „full authorisation" — vidi §8 3.1), **isključivo u web admin panelu** — ne sa iPad-a, ne offline. Extension **ne traži potpis PIN-om**: evidentira se `ApprovedByUserId`, osnov, referentni dokument i audit. CAMO ne potpisuje ništa u sistemu.
- **Extension je delta na Next maintenance, ne apsolutni limit** (npr. 1000 FH + 30 FH extension = 1030 FH). Next maintenance je obavezan, a extension se upisuje kao **`0` kada produženja nema**.
- Preflight prikazuje koliko je ostalo do sledećeg održavanja i upozorava kada je ispod praga.

### Uloge (klijentova podela)
| Commander (Pilot in Command) | Maintenance staff | CAMO staff | Administrator |
|---|---|---|---|
| Preflight | Preflight | Next maintenance filling | Full authorisation |
| Flight LOG | Certification of defects | | |
| Non-airworthiness | | | |

- **SIC nije na spisku** — read-only, ne popunjava ništa.
- **CAMO ne zatvara defekte**; maintenance staff ne unosi next maintenance. **CAMO čita sve, održava MEL/CDL biblioteku i ispravlja greške unosa kroz void/amendment** (klijent 2026-10-02). **SIC vidi ATL zapis**, ne unosi ništa. **Void/amendment:** CAMO, Admin i Commander (samo svoj zapis, ograničeno unazad).
- Puna matrica modul × uloga je u [02-auth-korisnici.md](Docs/02-auth-korisnici.md).

### Konfiguracija po avionu
- Tire pressure pozicije, engine parametri i oil uplift polja se **definišu po avionu** (ne hardkodovano), jer se flota razlikuje (Citation 560XL: NLG/LH MLG/RH MLG; Falcon 2000: inboard/outboard po nogi).
- Jedinice (kg/lbs za gorivo, PSI/bar za pritisak) se biraju **po avionu**.

---

## 6. Kako Claude agent treba da radi

- **Za svaki UI task pročitaj `Ui dizajn aplicije/README.md` i otvori ekran iz mape u [Docs/17-dizajn-ui.md](Docs/17-dizajn-ui.md).** Dizajn je merodavan isto kao task fajl.
- **Uvek pročitaj task fajl modula pre implementacije.** Checkbox-ovi su tracker napretka — označi `- [x]` tek kada je task završen *i pokriven testovima*.
- **Checkbox u `.md` fajlu je izvor istine, Azure work item je njegova kopija.** Posle izmene specifikacije regeneriši CSV-ove sa `python Docs/tools/gen-workitems.py` — ne uređuj CSV ručno.
- **Prati redosled faza** iz `00-overview.md`. Ne preskači. **Brojevi fajlova nisu redosled izrade** — redosled rada, preduslovi po modulu i dve zavisnosti koje presecaju granicu faze su u [00-overview.md](Docs/00-overview.md) §Redosled izrade.
- **Svaki novi sinhronizovani entitet dobija sync mapu i test kroz outbox u istom tasku**, ne u nekoj kasnijoj „sync fazi" — te faze nema.
- **Ne izmišljaj poslovna pravila.** Ako nešto nije u task fajlu ni u zahtevima, dodaj u sekciju „Otvorena pitanja" i pitaj, ne pretpostavljaj.
- **Testovi su deo taska, ne posle njega.** Za svaki task napiši test za **svaki segment** tog taska:
  - backend: unit testovi servisa (AAA obrazac, sveža in-memory ili Testcontainers baza po testu), integracioni testovi za endpointe
  - frontend (mobile i web-admin): **svih 5 nivoa — unit, component/UI, integration, E2E, design-conformance — je definisano u [Docs/00-overview.md §Test strategija (frontend)](Docs/00-overview.md#test-strategija-frontend).** Pročitaj tu sekciju pre svakog frontend taska; ona kaže koji nivo se piše kad, ne samo da se piše.
  - **Task nije završen dok `dotnet test` i `pnpm test` (typecheck + lint + test, svi paketi) ne prođu zeleno.**
  - **E2E (Playwright) postoji za oba klijenta** (`pnpm --filter web-admin e2e`, `pnpm --filter mobile e2e:web`; README u `clients/web-admin/e2e/` i `clients/mobile/e2e-web/`). Diže API nad svežom bazom `etlb_e2e` i koristi probne korisnike iz `Seed:SampleUsers` (`clients/packages/e2e-support/src/users.ts`). **Nov ekran ili tok dobija E2E spec kad je tok end-to-end proveriv**; selektori su uloge/labele/tekst iz dizajna, ne `data-testid`.
  - Ne testira se DataAnnotations/Zod deklaracija — testira se logika u telu metode/hook-a/komponente.
- **Za sync i generator broja zapisa piši testove pre koda (TDD).** To je logika sa najviše rubnih slučajeva.
- **Audit je obavezan.** Svaka izmena bilo kog entiteta mora biti zapisana: ko, kada, šta pre, šta posle. Ako pišeš put koji zaobilazi `AuditInterceptor` (npr. raw SQL), moraš ručno upisati audit zapis.
- **Migracije se primenjuju automatski na startu aplikacije** (`db.Database.Migrate()` u startup-u, sa lock-om da paralelne instance ne trče istovremeno).
- Commit poruke na engleskom, u formatu `feat(preflight): ...`, `fix(sync): ...`, `test(defects): ...`.

---

## 7. Faze isporuke

| Faza | Sadržaj | Fajlovi |
|---|---|---|
| **F0 — Temelj** | solution, projekti, EF, multitenancy, temporal tables, audit, CI | 01 |
| **F1 — Identitet** | Identity + JWT, uloge, PIN, potpis na profilu, hash lanac | 02 |
| **F2 — Skelet klijenata** | pnpm monorepo, `packages/shared`, **design tokens i deljene UI primitive iz gotovog dizajna**, Expo app skeleton, login, lokalna baza, sync engine, React admin skeleton, **web klijent: PWA skelet, OPFS storage driver, web secure storage, hosting** *(dodato 2026-09-24)* | 12, 11, 14, **17** |
| **F3 — Referentni podaci** | šifarnici, flota, konfiguracija polja po avionu, **QR kodovi aviona** | 03, 04 |
| **F4 — Srž ATL-a** | **potvrda aviona (QR)**, životni ciklus zapisa, numeracija, Preflight, Flight, Flight Data, potpisi, zaključenje, **web varijante QR skenera, potpisa i kamere** | 05, 06, 07, 12 |
| **F5 — Tehnički moduli** | defekti + MEL/CDL, non-airworthiness, održavanje i extensions, **automatske notifikacije**, **fallback na papir** | 09, 10, 15, 16 |
| **F6 — Opcione sekcije** | engine parametri, all weather operations | 08 |
| **F7 — Izlaz** | PDF ATL zapisa (po klijentovom šablonu), automatsko arhiviranje i slanje CAMO-u e-mailom, izveštaji sa **obaveznim Excel exportom**, web admin dovršen | 13, 14, 15 |

MVP granica je kraj **F5**. F6 i F7 su potrebni za produkcijsku upotrebu ali ne blokiraju prve testove sa pilotima.

**Definition of Done po fazi i redosled koraka unutar F0 su u [16-regulatorno-i-isporuka.md](Docs/16-regulatorno-i-isporuka.md) §6.** Faza nije gotova dok DoD nije ispunjen.

---

## 8. Odgovori klijenta i preostala otvorena pitanja

### Revizija zahteva „Functional Requirements" (2026-09-01)

Klijent je dostavio revidiran dokument zahteva. Najvažnije izmene u odnosu na original:

- **Terminologija: PIC → Commander** kroz ceo dokument i kroz sav kod. **`should` → `shall`** — preporuke su postale normativni zahtevi.
- **Header po operativnom entitetu:** Prince Aviation ima **dva entiteta, SI i SR**, svaki sa svojim logom, adresom i CAMO Approval Number-om. Uveden `OperatingEntity` ispod tenanta ([01](Docs/01-arhitektura.md)).
- **Validacija obaveznih polja je blokirajuća:** sistem **ne sme dozvoliti potpis** sekcije dok obavezna polja nisu popunjena. Novo obavezna: `Date`, `Oil Uplift`, `TO` aerodrom, `Nature of Flight`, `Fuel at Cut-Off`, sve četiri kategorije putnika (`0` kada nema).
- **Oil Uplift:** obavezan, unos je **`OK`** ili količina u **quarts**.
- **Gorivo:** uplift se **unosi u litrima i automatski konvertuje u lb**; `Fuel at Take-Off` → **`Ramp Fuel`** (auto iz Preflight `Fuel Onboard`); `Fuel Used` se prikazuje u lb i litrima; tip goriva je **JET-A1 automatski**, drugi unosi Commander.
- **Tire pressure:** MTOM ograničenje **ukinuto** — obavezan za sve avione, **pre prvog leta u danu**, sa prenosom vrednosti na naredne letove istog dana. Falcon 2000: **NLG LH/RH** umesto Inboard/Outboard **samo na NLG** — MLG ostaje Inboard/Outboard po nozi. Unos: **dropdown ili ručno**.
- **Defekti:** otvoren defekt koji nije rektifikovan ni odložen **blokira potpis Preflight-a**. **Automatske e-mail notifikacije** (LINE / CAMO / OPS) pri novom defektu i pri otvaranju MEL stavke. DDL se ažurira i pri otvaranju i pri zatvaranju MEL stavke.
- **Engine parametri:** konačna lista — Flight Level, TAT, OAT, Mach (po zapisu) + N1, ITT, N2, Fuel Flow, Oil Temperature, Oil Pressure (**po motoru, broj sekcija = broj motora**). **`TAT` i `OAT` prihvataju negativne vrednosti.**
- **Crew:** obavezni su **Commander, SIC i `STW`** (STW na tipovima gde je primenljiv — Citation 560XL, Falcon); `IFSH` = in-flight service host.
- **Novi izveštaji (Excel):** Oil Consumption (po motoru + zbirno, grafik, **CAMO-only**), Fuel Consumption, Tire Pressure (**CAMO**), Defect Reporting.
- **Vremena:** `Block OFF` pre `Block ON`; `Take-Off` posle `Block OFF`; `Landing` posle `Take-Off` i pre `Block ON`; prikaz `HH:MM`.

### Odgovoreno (2026-09-01)

| # | Pitanje | Odgovor | Upisano u |
|---|---|---|---|
| **1.3** | Format `Aircraft Technical Log No.` | **`{REGISTRACIJA}-{NNNNNN}`** (npr. `YU-RDA-000001`), redni broj **per avion**, **bez reseta po godini**, **dodeljuje sistem automatski** | 05 |
| **3.1** | Uloge i permisije | **Commander:** Preflight, Flight LOG, non-airworthiness. **Maintenance staff:** Preflight, certification of defects. **CAMO staff:** samo next maintenance filling. **Administrator:** full authorisation. **SIC nije na spisku — ne popunjava ništa** | 02 |
| **4.2** | Offline obim | Offline i za čitanje: **poslednjih 30–50 ATL zapisa po avionu**, **svi otvoreni defekti**, **MEL biblioteka** | 11 |
| **5.2** | Maintenance extension | Extension je **delta na Next maintenance** (npr. +30 FH, +1 M ili +3 dana), prikazuje se kao zasebno polje kada je primenljiv. **Next maintenance je obavezan; extension je obavezan i iznosi `0` kada ga nema** | 10 |
| **5.3** | MEL/CDL biblioteka | **Da** — biblioteka po tipu aviona, kategorije i rokovi, **automatski izračun roka isteka osim za kategoriju A** (nju posada definiše po tekstu MEL stavke). **DDL se popunjava automatski** posle MEL/CDL unosa. **Istekao MEL tvrdo blokira popunjavanje ATL-a svima osim maintenance staff-u** | 09, 03 |
| **5.6** | Ko zatvara defekt | **Bilo koju maintenance akciju sme isključivo maintenance staff, niko više.** Potpis je obavezan. **Revidirano 2026-09-09: klijent ne dostavlja skenirane potpise** — potpisnik ga sam nacrta na svom profilu. Za maintenance staff dodatno: **Part-66 broj** (tekstualno polje) i **kompanijski pečat** (slika, upload iz admin panela) | 09, 02 |
| **5.7** | CRS blok | **Da, potreban je** | 09, 13 |
| **6.5** | Spisak flote | Dostavljen **kao prilog (još nije u repou)** | 04 |
| **9.1** | PDF ATL zapisa | **Da.** Svaki ATL se generiše u PDF, **automatski se skladišti na serveru** i **automatski šalje e-mailom CAMO-u**, koji ga proverava i skladišti i na lokalnom serveru. **Šabloni su priloženi (još nisu u repou)** | 13 |
| **9.2** | Izveštaji | **Excel export je potreban za sve izveštaje.** **Non-airworthiness lista ne sme biti vidljiva nigde na ATL-u** — zaseban ekran „sa strane", pilot je popunjava, sa **padajućim menijem ATA poglavlja**, **slobodnim opisom problema**, i **mogućnošću prebacivanja stavke u polje sa primedbama (Remarks)** | 13, 09 |
| **10.3** | De-icing `Place` | **Isti šifarnik kao aerodromi** | 03 |

### Odgovoreno (2026-10-02)

Klijent je e-mailom odgovorio na [Docs/pitanja-za-klijenta-2026-09-24.md](Docs/pitanja-za-klijenta-2026-09-24.md). **Doslovni odgovori, tumačenje i nova dodatna pitanja: [Docs/odgovori-klijenta-2026-10-02.md](Docs/odgovori-klijenta-2026-10-02.md).** Sažetak:

| # | Pitanje | Odgovor | Upisano u |
|---|---|---|---|
| **B2** | Kategorija A | **Bez gornje granice**, posada unosi rok po tekstu stavke | 09 |
| **B3 / A6.6** | Ko održava MEL/CDL | **Admin i CAMO staff.** Nova revizija se **ne unosi stavku po stavku** — klijent traži uvoz celog dokumenta; format otvoren (poništena odluka „uvoz ukinut" 2026-09-24) | 09, 14, 02 |
| **B4** | Stavke van biblioteke | **Zabranjeno** — deferral samo po stavci iz biblioteke | 09 |
| **A2 / A3** | Entiteti SI / SR | SI: Prince Aviation SI, Ltd., Ob grabnu 20, 1217 Vodice, CAMO SI.CAMO.008, kod `VIO`. SR: Prince Aviation doo, Bulevar maršala Tolbuhina 40-42, 11070 Beograd, CAMO RS.MG.004, kod `PNC`. Logoi u prilogu (čeka se) | 01, 13 |
| **A4** | Konfiguracija polja | Engine parametri **isti za celu flotu**, jedinice potvrđene, **Fuel Flow u pph**, **bez opsega**. APU oil polje na **svim** avionima sa stanjem **`N/A`**. Tire pressure vrednosti u prilogu (čeka se). **Gustina goriva fiksna** | 08, 06, 04, 07 |
| **A6.1** | Administrator | **Unosi i menja sve podatke** (o operativnim potpisima nije rečeno — pretpostavka „bez potpisa" ostaje) | 02 |
| **A6.2** | Void i amendment | **CAMO staff, Admin, Commander** (Commander samo svoj zapis, „najviše 5 1 log unazad" — 1 ili 5, čeka razjašnjenje) | 02, 05 |
| **A6.3** | Non-airworthiness | Stavka se **jednim klikom prebacuje u airworthy** sa datumom prebacivanja i vidi se u PDF-u | 09, 13 |
| **A6.4** | CAMO staff | **Čita sve** i **ispravlja greške unosa kroz amendment** (original ostaje) | 02 |
| **A6.5** | SIC | **Ne popunjava ništa, ali vidi TLB** | 02 |
| **A7** | SIC obavezan | **Potvrđeno**, flota nema single-pilot | 07 |
| **A8** | Declaration tekst | **Dostavljen, po entitetu SI / SR**, „promeniće se" → konfigurabilan po `OperatingEntity` | 06, 01 |
| **A9** | AOG posledica | (a) potvrđeno; (b) **Commander sme deferral po MEL/CDL stavci**; bez MEL/CDL stavke zatvara samo maintenance staff | 06, 09, 02 |
| **C1** | Extension approval | **Nije razumeo pitanje** — preformulisano | 10 |
| **C2** | Prekoračen limit | **Potvrda + komentar** | 10 |
| **C3** | Alarm „čeka tehničara" | **Nije potreban** (klijent razumeo drugačije — preformulisano) | 05 |

> ⚠️ **Prilozi:** stigli 2026-10-02 i sačuvani u `Docs/prilozi/` — **spisak flote**, **tire pressure tabele** (Falcon 2000LXS, Citation 560XL; ne i 525 M2), **osnovni logo** (`PA_LOGO_MAIN_BLUE.svg`; SI varijanta nije) i **MEL/CDL dokumenti** (`prilozi/mel-cdl/`, nalaz u `prilozi/mel-cdl-nalaz-2026-10-02.md` — **MEL je po operativnom entitetu**, nedostaju MEL Falcon 2000LXS i MEL/CDL za YU-SFF). **Još nisu stigli: SI logo, PDF šabloni, MEL Falcon.** Bez njih se ne implementiraju: SI logo u header-u, izgled PDF-a, MEL za Falcon.
>
> **Seed aerodroma je rešen (2026-09-23):** klijent je odlučio da se ubace svi aerodromi Evrope i dela Azije realnog za flotu (bez Dalekog istoka) — izvor OurAirports, vidi [03](Docs/03-sifarnici.md) §2.
>
> **Potpisi nisu više blokada** (revizija 2026-09-09): korisnik crta potpis na svom profilu, ne uvozi se ništa. Od potpisnih asseta ostaje samo **kompanijski pečat maintenance staff-a**.
>
> Isto važi i za assete koje dizajn ostavlja kao prazne slotove: **ilustracije aviona** (ekrani 02, 03), **kompanijski pečati** (22, 25, 26, 39, CRS blok — *potpisi se više ne čekaju, korisnik ih crta na ekranu 20*), **logotipi po operativnom entitetu** (40) i **PDF šablon** (22, 40 — u dizajnu su samo shematski i shema **nije** ciljni dokument). Vidi [17-dizajn-ui.md](Docs/17-dizajn-ui.md) §„Šta dizajn svesno NE pokriva".

### Odluka 2026-09-24 — web klijent za pilote i tehničare

Klijentska aplikacija se koristi i **iz browsera**, ne samo sa iPad-a, sa **istim offline ponašanjem**. Izabran je jedan kod (Expo, cilj `web` + PWA), ne druga aplikacija. Taskovi su dodati u [12](Docs/12-mobile-app.md) §Web klijent, [11](Docs/11-offline-sync.md) §Lokalna baza i §Sync engine, [02](Docs/02-auth-korisnici.md) §PIN, [16](Docs/16-regulatorno-i-isporuka.md) §Okruženja i [17](Docs/17-dizajn-ui.md). Ranije urađen web build „za pregled rasporeda" (`sql.js` u memoriji, `localStorage`) **nije** isporuka i zamenjuje se ovim.

### Preostala otvorena pitanja

Ne implementiraj ove delove dok ne stigne odgovor.

- [x] **3.1** ~~Potvrditi četiri stavke koje klijentova tabela ne pokriva~~ — **odgovoreno 2026-10-02 (A6)**, matrica u [02](Docs/02-auth-korisnici.md) ažurirana i `RolePermissions` usklađen. Admin: podaci i konfiguracija potvrđeni; o operativnim potpisima klijent se nije izjasnio, pa pretpostavka „Admin ne potpisuje" ostaje.
- [ ] **A6.2** Commander void/amendment „najviše **5 1** log unazad" — 1 ili 5? Do odgovora 1
- [ ] **A6.3** Ko sme da prebaci non-airworthiness stavku u airworthy, i da li ulazi kao defekt ili kao `Remarks`
- [ ] **A3** Potvrditi da su `PNC` / `VIO` oznake entiteta SR / SI za header, i da li treba zajednička oznaka tenanta (sada `PA`)
- [ ] **B3** Format uvoza MEL/CDL revizije (PDF / Word / Excel) — predložen Excel šablon izvoz → izmena → upload
- [ ] **A8** Pravopis SR deklaracije („herby", „thislog") pre štampe
- [ ] **5.2 / C1** Da li extension ima **approval workflow** — klijent nije razumeo pitanje; preformulisano i ponovo poslato
- [ ] **C3** Da li admin panel treba upozorenje kad zapis dugo čeka `TechnicalStaffClose` posle leta — klijent je pitanje razumeo kao čekanje na rektifikaciju; preformulisano
- [x] **5.3** Izvor MEL biblioteke — **ručni unos (klijent, 2026-09-24):** biblioteka se ne uvozi, stavke se unose u admin panelu od početka korišćenja aplikacije; uvoz iz Excel/CSV je ukinut iz obima
- [x] **5.3** ~~Kategorija A gornja granica; ko održava MEL~~ — **2026-10-02: bez gornje granice; Admin i CAMO staff**
- [x] **6.5** Spisak flote — **dostavljen 2026-10-02**, prepisan u [04](Docs/04-flota-konfiguracija.md) §Avioni: 8 aviona (5 SR, 3 SI), tri tipa — Citation 560XLS/XLS+, **Cessna 525 M2 (nov, bez APU)**, **Falcon 2000LXS (nov)**. TSN/CSN stižu pri puštanju u rad. Otvoreno: pozicije guma, STW i MEL za 525 M2; da li su LXS i XLS+ zasebni tipovi
- [ ] **Operativni entiteti SI i SR** — **podaci dostavljeni 2026-10-02** (vidi [01](Docs/01-arhitektura.md)); **logoi najavljeni u prilogu, još nisu stigli**. Seed čeka logoe ili ide bez njih sa praznim `LogoBlobUri`.
- [x] **MEL / CDL dokumenti** — stigli 2026-10-02 (3 MEL-a, 4 CDL-a), nalaz u [Docs/prilozi/mel-cdl-nalaz-2026-10-02.md](Docs/prilozi/mel-cdl-nalaz-2026-10-02.md). **Nedostaju: MEL Falcon 2000LXS, MEL/CDL za YU-SFF.** Model `MelCdlItem` promenjen 2026-10-02 (dokument po entitetu, varijanta, podstavke, CDL ograničenja) — [09](Docs/09-defekti-mel.md); RIE i uvoz revizije ostaju F5
- [ ] **9.1** Dostaviti PDF šablone (prilog); CAMO e-mail adrese; šta znači „skladišti se i na lokalnom serveru" (da li aplikacija gura fajl ili CAMO čuva ručno)
- [ ] **9.2** Primeri pojedinačnih izveštaja
- [ ] **QR** — gde se fizički lepi nalepnica u kokpitu, ko je odgovoran za zamenu, i da li treba rezervni papirni QR u dokumentaciji aviona
- [x] **QR** — da li override sme da uradi svaki pilot ili traži odobrenje (npr. poziv dežurnom tehničaru). **Odluka 2026-09-25: svaki pilot, uz obavezan razlog i PIN potvrdu**, bez odobrenja drugog lica; override se vidi u zapisu, PDF-u, auditu i u override monitoru admin panela (vidi [05](Docs/05-atl-log.md) §Potvrda aviona)
- [ ] **DCU** — kada i kako se uvodi automatski prenos engine parametara (za sada isključivo ručni unos)
- [ ] **Regulatorno** — da li nadležna vlast (CAD Srbija / EASA) traži formalno odobrenje elektronskog ATL-a i da li postoji lista zahteva koju moramo ispuniti (vidi [16](Docs/16-regulatorno-i-isporuka.md))
- [ ] **Podizvođački Part-145 tehničar** — ko potpisuje CRS na outstationu gde radi tuđa organizacija (vidi [02](Docs/02-auth-korisnici.md))
- [x] **AOG posledica** — **odgovoreno 2026-10-02 (A9):** prihvata blokadu bez „continue anyway", ali Commander sme sam deferral po MEL/CDL stavci — prizemljenje samo kad stavke nema (vidi [06](Docs/06-preflight.md) §2.5, [09](Docs/09-defekti-mel.md))
- [ ] **Notifikacije** — e-mail adrese grupa LINE / CAMO / OPS i da li mejl mora ići sa domena Prince Aviation-a (vidi [15](Docs/15-notifikacije-isporuka.md))
- [ ] **Retencija i RTO/RPO** — konačni brojevi (vidi [16](Docs/16-regulatorno-i-isporuka.md))
- [x] **SIC obavezan** — **potvrđeno 2026-10-02 (A7):** flota nema single-pilot, SIC uvek obavezan; slobodan unos imena nije osporen (vidi [07](Docs/07-flight-i-flight-data.md) §3.3)

## 9. Tehnički rizici koje treba proveriti odmah

- [ ] **`temporal_tables` na Azure PostgreSQL Flexible Server** — proveriti da li je ekstenzija na `azure.extensions` allowlist-i (`SHOW azure.extensions;`) pre nego što se model osloni na nju. **Preporuka: plan B (sopstveni `versioning()` trigger) je podrazumevani plan** — verovatnoća da ekstenzija nije dostupna je visoka, a prelazak unazad znači prepisivanje migracija na sistemu u produkciji.
- [ ] **🔴 Ed25519 nije podržan u Azure Key Vault-u.** Key Vault (standardni tier) podržava RSA i NIST krive (P-256/384/521). Zbog toga je QR potpisivanje **prebačeno na ECDSA P-256 (ES256)** — vidi [04](Docs/04-flota-konfiguracija.md). Potvrditi probnim potpisom kroz Key Vault SDK i verifikacijom u `@noble/curves/p256` **pre F3**.
- [x] **ES256 proba, .NET → noble (2026-09-23).** Prolazi (`infra/es256-probe/`). **Nalaz:** noble podrazumevano odbija potpis sa `s > n/2`, a .NET i Key Vault ne normalizuju `s` — server **mora normalizovati na low-S** posle potpisivanja, klijent verifikuje sa `lowS: false`. **Key Vault deo prošao 2026-09-24** (nalog dobio Owner na subscription-i): provider registrovan, trezor `kv-etlb-dev` u RG `eATL` (West Europe, RBAC, soft delete + purge protection), ključ `etlb-es256-probe` P-256, potpis verifikovan u noble (`infra/es256-probe/vector-keyvault.json`). Pristup trezoru ide RBAC ulogama (`Key Vault Crypto Officer` za upravljanje ključevima, `Key Vault Crypto User` za API koji samo potpisuje). **2026-09-25: QR modul potpisuje kroz `KeyVaultSigningKeyStore`**; razvojna konfiguracija pokazuje na `kv-etlb-dev`, bez `KeyVault:VaultUri` API pada na lokalni razvojni trezor (privatni ključ u bazi sa prefiksom `dev-pkcs8:`, samo za test). Proba: `ETLB_KEYVAULT_URI=... dotnet test --filter KeyVaultSigningKeyStore`.
- [x] **`temporal_tables` — provera odložena (2026-09-02).** Azure PG instanca još ne postoji; nalog ima `Contributor` samo na tuđoj grupi `PrinceAviationOwners`, pa grupa `eATL` čeka rolu na nivou subscription-e. **Radi se plan B (sopstveni `versioning()` trigger)**, razvoj na lokalnom PostgreSQL-u u Docker-u. Provera pre prvog `staging` deploy-a — vidi [01](Docs/01-arhitektura.md).
- [ ] **🔴 FluentAssertions 8.x je komercijalna licenca.** Od v8 paket je prešao pod Xceed licencu koja se plaća po developeru za komercijalnu upotrebu; eTLB je komercijalan projekat. **Pinovano na `7.2.0`** (zadnja Apache 2.0 verzija) u oba test projekta — ne nadograđivati bez kupljene licence. Besplatne alternative: `AwesomeAssertions` (MIT fork 7.x) ili `Shouldly`.
- [ ] **QuestPDF licenca** — Community licenca važi samo ispod praga prihoda; ovo je komercijalni projekat. Proveriti obavezu plaćanja i uneti u budžet — vidi [13](Docs/13-izvestaji-pdf.md).
- [ ] **Azure Communication Services — Email**, SPF i DKIM za domen sa kojeg se šalju PDF-ovi. Bez toga mejlovi tiho odlaze u spam i ceo tok isporuke CAMO-u otkazuje bez ijedne greške u logu — vidi [15](Docs/15-notifikacije-isporuka.md).
- [ ] **EAS Build cena** — postoji besplatan plan sa ograničenim brojem build-ova mesečno i redom čekanja; `eas build --local` je besplatan ali traži macOS za iOS. **Apple Developer Program ($99/god) je obavezan** za instalaciju na iPad bez obzira na način build-a.
- [x] **Expo Go je uveden kao razvojni put (2026-09-22).** Provereno: svi native moduli koje koristimo (`expo-sqlite`, `expo-secure-store`, `expo-local-authentication`, `expo-crypto`, `expo-network`, `expo-router`) su u Expo SDK-u i rade u Expo Go — dakle **lokalna baza, Keychain, PIN i Face ID se testiraju bez Apple naloga**. Iz projekta su uklonjeni `@expo/ui` i `expo-glass-effect` (traže custom build) i još tri neiskorišćena paketa. Pokretanje: `pnpm --filter mobile start:go`.
- [ ] **Prelazak na Dev Client** ostaje neizbežan za: `expo-background-task` i svaku instalaciju na tuđ uređaj. Crtanje potpisa (`react-native-signature-canvas` preko `react-native-webview`, koji **jeste** u Expo Go) je ugrađeno 2026-09-22 i **čeka potvrdu na fizičkom uređaju**; ako WebView u Expo Go ne prođe, i to ide na Dev Client. Traži Apple Developer Program (~99 $/god) i `eas device:create`; **macOS nije potreban**, build ide kroz EAS cloud.
- [ ] **Verzije moraju ostati usklađene sa SDK-om** (`npx expo install --check`): Expo Go nosi zaključanu verziju SDK-a, pa se razilaženje vidi kao nerazumljiva greška u runtime-u, a ne kao greška pri build-u.
- [ ] **Web klijent — browseri i uređaji:** da li posada koristi iPad Safari, Chrome na laptopu ili oboje; određuje matricu testiranja i da li je OPFS / `SharedArrayBuffer` podrška zagarantovana. I: da li klijent prihvata da web klijent bez instalacije („Add to Home Screen") može izgubiti lokalne podatke po pravilima browsera (Safari briše skladište sajta bez interakcije 7 dana; instalirana PWA je izuzeta)
- [ ] **Web klijent — dizajn:** iPad raspored fiksne širine u browseru ili posebna desktop varijanta ekrana 01–27 (pitanje za dizajnera, vidi [17](Docs/17-dizajn-ui.md))
- [ ] **Region podataka** — da li klijent ili regulator traže da podaci fizički ostanu u EU/Srbiji (utiče na izbor Azure regiona i na to da li je ACS Email upotrebljiv) — vidi [16](Docs/16-regulatorno-i-isporuka.md).
- [ ] **🔴 Web klijent offline — OPFS + `SharedArrayBuffer`.** `expo-sqlite` na webu (wa-sqlite) traži COOP/COEP zaglavlja i OPFS; podržano u Safari 17+/Chrome, ali **proveriti na stvarnom iPad Safariju i u instaliranoj PWA pre nego što se web driver proglasi gotovim** — ako ne prođe, plan B je `sql.js` + ručni OPFS persist. Proba ide u F2, pre prvog web ekrana koji piše podatke.
- [ ] **Web klijent — brisanje skladišta od strane browsera.** Safari ITP briše script-writable storage sajta posle 7 dana bez interakcije (instalirana PWA je izuzeta); Chrome može evict-ovati pod pritiskom prostora. Obavezno `navigator.storage.persist()`, uputstvo za instalaciju PWA, i jasan indikator nesinhronizovanih mutacija — nikad tiho.
- [ ] **Web klijent — nema background sync-a na iOS Safariju.** Sync radi samo dok je tab u prvom planu; isto ograničenje kao Expo Go bez `expo-background-task`, dokumentovati posadi.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: static HTML/CSS/JS with GSAP + ScrollTrigger (and Lenis smooth scroll) loaded from a CDN. No build step; chosen because scroll-scrubbed, pinned, sequenced animation is the heart of the site and GSAP is the most capable tool for it. Deployable to any static host.

## Users

Aviation operators (B2B): accountable managers, CAMO / continuing-airworthiness staff, technical and flight-ops directors at airlines and business-jet operators evaluating a replacement for the paper Aircraft Technical Log. They need to believe eATL is airworthiness-grade (traceable, tamper-evident, regulator-friendly) and that it works in the cockpit, offline.

## Product Purpose

eATL (electronic Aircraft Technical Log) replaces the paper ATL book that commanders and technical staff fill in before, during and after every flight. One ATL record = one flight: Preflight → Flight → Flight Data → (Engine parameters, All Weather) → (Defects). Success for the site: an operator understands what eATL does and emails to start a conversation.

## Positioning

Built from the paper ATL outward, by people who mapped every field of a real operator's log: works fully offline in the aircraft, confirms the right aircraft with a signed QR code in the cockpit, chains every signature into a hash chain, blocks signing until mandatory fields are complete, and corrects signed records only by Amendment.

## Operating Context

- Primary device: iPad in landscape, in the cockpit; also a browser/PWA client from the same code. Web admin panel for CAMO / Admin.
- Fully offline: local SQLite, outbox, sync engine; syncs when network exists.
- Multitenant: one tenant = one operator; operating entities with their own header, logo, CAMO approval number.
- Roles: Commander, Maintenance staff (Part-66), CAMO staff, Administrator; SIC is read-only.

## Capabilities and Constraints

- Aircraft confirmation by QR sticker in the cockpit, payload signed ECDSA P-256 (ES256), verified offline; confirmation valid 60 min; manual override with mandatory reason + PIN, logged.
- Record number `{REGISTRATION}-{NNNNNN}`, continuous per aircraft, server-assigned.
- Signatures: user draws own signature on profile; signing with PIN; snapshot + content hash; hash chain (PreviousHash → ContentHash). Signed record is immutable; corrections only via Amendment; unsigned mistakes via Void.
- Close requires TechnicalStaffClose + CommanderFlight signatures.
- Mandatory-field validation blocks signing, same validator offline and on server.
- Carry-over from previous flight (flight time, landings, FROM airport, fuel onboard), shown as AUTO / PREV / CARRIED; overrides recorded.
- Fuel uplift in litres converted to lb; oil uplift OK or quarts; tire pressure before first flight of the UTC day, carried over the rest of the day; per-aircraft tire positions, engine params, units.
- Defects as aircraft entities: Open / Deferred / Rectified / Closed; MEL/CDL library per operating entity; deferral only from library; automatic deadline (B/C/D), category A by crew; expired MEL hard-blocks the ATL; CRS block; non-airworthiness list kept off the ATL.
- Next maintenance + extensions (delta) by CAMO in web admin; remaining resource shown on Preflight.
- Device clock offset > 60 s flagged; all times UTC.
- PDF of each ATL record, archived and emailed to CAMO; Excel reports (oil, fuel, tire pressure, defects).
- Terminology: Commander (never PIC). Product name is eATL (formerly eTLB); not specific to one operator.

## Brand Commitments

- Name: eATL — electronic Aircraft Technical Log. "by NextBridge IT".
- Logo assets in `assets/`: app mark (tilted white log sheet with navy aircraft, grey lines, green status dot on brand blue `#2D6BA8`-ish), favicon, splash.
- Site language: English. Primary CTA: contact e-mail.
- User asked for an aggressive, animation-heavy site ("najbrutalniji"): e.g. aircraft standing, data appearing on paper while scrolling.

## Evidence on Hand

- Real product rules above (from project spec). App screenshots: not yet provided; the site must have a gallery section with replaceable screenshot slots.
- No customers, testimonials, certifications, pricing or regulator approvals may be claimed. Regulatory approval of electronic ATL is an open question; do not claim EASA/CAA approval.
- Contact e-mail address not yet confirmed — placeholder to replace.

## Product Principles

1. The paper log is the reference: every claim maps to a real field, signature or rule of the ATL.
2. Prove with mechanism (hash chain, QR, offline, blocking validation), never with adjectives.
3. Airworthiness-grade honesty: no invented certifications or customers.
4. Cockpit reality first: offline, iPad, gloves-and-sunlight constraints.

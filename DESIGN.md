---
name: eATL
description: The electronic Aircraft Technical Log, told as a night apron where the aircraft fills in its own record.
colors:
  night: "#050e1a"
  navy-900: "#081a2e"
  navy-800: "#0c2440"
  navy-700: "#143661"
  line: "rgba(160, 192, 228, 0.14)"
  line-strong: "rgba(160, 192, 228, 0.28)"
  ink: "#eef3f9"
  ink-2: "#b2c4d9"
  ink-3: "#8199b6"
  brand: "#2d6ba8"
  brand-hi: "#5c9be0"
  paper: "#fafaf7"
  paper-2: "#eef0f2"
  paper-ink: "#0f2d4a"
  paper-ink-2: "#4a5f78"
  paper-rule: "#d5dbe3"
  taxi: "#e8b931"
  ok: "#34a86c"
  ok-paper: "#1f7a4d"
  warn: "#e3a33a"
  bad: "#e5533d"
  ok-ink: "#19663f"
  warn-ink: "#84550a"
  bad-ink: "#a72f1c"
  on-brand: "#eef4fb"
  on-brand-2: "#cfe0f5"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.8rem, 5.5vw, 5.75rem)"
    fontWeight: 850
    lineHeight: 0.95
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 115"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.1rem, 4.6vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 112"
  statement:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.8rem, 4vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 105"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 750
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 108"
  lede:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.05rem, 1.35vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.3
  data:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.92rem"
    fontWeight: 500
    letterSpacing: "0"
    fontFeature: "'tnum' 1"
  marker:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.7rem"
    fontWeight: 700
    letterSpacing: "0.06em"
rounded:
  marker: "4px"
  control: "10px"
  card: "14px"
  placard: "16px"
  sheet: "18px"
  panel: "20px"
  device: "34px"
  full: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  container: "1320px"
  section: "clamp(88px, 11vw, 168px)"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.brand}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-sm:
    padding: "0 18px"
    height: "40px"
  button-lg:
    padding: "0 36px"
    height: "60px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    padding: "9px 16px"
  chip-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.night}"
  status-pill:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.paper-ink-2}"
    typography: "{typography.marker}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  field-marker:
    backgroundColor: "transparent"
    textColor: "{colors.brand}"
    typography: "{typography.marker}"
    rounded: "{rounded.marker}"
    padding: "1px 5px"
  record-card:
    backgroundColor: "{colors.navy-800}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px 20px 18px"
  atl-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.sheet}"
    padding: "26px 26px 22px"
  panel:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "22px"
---

# Design System: eATL

## Overview

**Creative North Star: "The Night Apron Logbook"**

The whole system is a parked aircraft under floodlight at night and the paper log that belongs to it. The ground is deep apron navy, lit by a soft blue floodlight wash with faint concrete-slab seams and grain; on it sit two kinds of object: the aircraft (cool silver, lifted by a soft cast shadow) and the record (warm white paper, slightly rotated, lifted the same way). Everything the product proves (fields, times, hashes, registrations) is set in monospace on paper or in hairline-ruled navy panels, so the page reads as an operational document rather than a brochure.

The category is honoured on purpose: deep-navy aviation SaaS, iPad frames, a scroll-told product story. What lifts it is fidelity. Scenes pin and scrub with scroll instead of stacking as feature cards; the aircraft drives the record through leader lines; status color appears only when it means something. Density is generous in the dark sections (one idea per screen-height) and tight, ledger-like, inside the paper and device surfaces.

The world alternates its ground deliberately: night, navy-900 bands, two full-bleed paper sections that read like the printed log itself, and a closing brand-blue field.

**Key Characteristics:**
- Night navy ground with tonal bands rather than cards on cards.
- Paper surfaces carry the record; they are the only warm-white objects.
- Archivo set wide and heavy for display; Geist for prose; JetBrains Mono for every operational value.
- Blue is the system's voice (actions, leader lines, AUTO/PREV/CARRIED markers); green, amber, red are strictly semantic.
- Taxi-line yellow exists only as ground marking.
- Motion is scroll-scrubbed and pinned, with a long expo-out settle.

## Colors

A cold, low-chroma navy family, one cobalt brand blue with a lit counterpart, warm paper, and a reserved semantic trio.

### Primary
- **eATL Cobalt** (brand): the brand blue from the app mark. Fills the closing CTA field, the jet's nacelle and fin bands (the aircraft is a to-scale plan view of a Cessna Citation 560XL), the active tab underline on the device screen, timeline and calendar fills, and the AUTO/PREV/CARRIED field markers on paper.
- **Floodlit Cobalt** (brand-hi): the lit version of the brand for use on dark ground: leader lines and hotspot dots in the hero, the active lifecycle step dot, the QR scanline, the amended-block border, and the global focus ring.

### Tertiary
- **Taxi-Line Yellow** (taxi): apron lead-in line, stop bar and stand number only.

### Neutral
- **Apron Night** (night): the page ground and the hero apron base.
- **Hangar Navy** (navy-900): alternating section bands (lifecycle, chain, screens) and inset panels such as the outbox.
- **Cockpit Navy** (navy-800): raised record blocks and empty screenshot slots.
- **Deck Navy** (navy-700): inactive switch track, inactive step dots, scrollbar thumb.
- **Hairline** (line) and **Strong Hairline** (line-strong): translucent blue-grey rules; `line` divides rows and bands, `line-strong` outlines ghost buttons, chips, blocks and panels.
- **Floodlight White** (ink), **Mist** (ink-2), **Haze** (ink-3): primary text, secondary text and ledes, tertiary metadata on dark ground.
- **Log Paper** (paper) and **Paper Shade** (paper-2): the record surfaces and the paper sections; paper-2 for neutral pills and row hover.
- **Log Ink** (paper-ink), **Faded Ink** (paper-ink-2), **Ruling** (paper-rule): text, labels and cell rules on paper.

### Semantic
- **Signed Green** (ok, with ok-paper on light surfaces), **Deferral Amber** (warn), **Broken Red** (bad): valid/signed/sent, pending/offline/deferred, broken/rejected. Used as dots, small fills, borders and hash text, never as decoration.
- **Status ink on paper** (ok-ink, warn-ink, bad-ink): the text colour of pills and notices on light surfaces, each at 4.5:1 or better on its own tinted fill.
- **On brand** (on-brand, on-brand-2): prose and secondary marks on the closing cobalt field.

### Named Rules
**The Ground Marking Rule.** Taxi-line yellow appears only as painted ground (lead-in line, stop bar, stand number). It is never a UI accent, button or highlight.

**The Status Means Status Rule.** Green, amber and red appear only where the product state they represent is being shown. A section that has no status has none of them.

**The Lit Blue Rule.** On dark ground, interactive and connecting blue is the floodlit cobalt; the deeper cobalt is reserved for fills and for blue on paper.

## Typography

**Display Font:** Archivo, variable width (with Helvetica Neue, Arial)
**Body Font:** Geist (with Helvetica Neue, Arial)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, SFMono-Regular, Menlo)

**Character:** Archivo pushed wide (105 to 120 percent width) and very heavy gives the stencil-on-fuselage, stand-number voice; Geist keeps the prose quiet and technical; mono carries every registration, time, quantity and hash with tabular figures.

### Hierarchy
- **Display** (850, wide 115%, tight 0.95 leading): the hero headline and the CTA headline (CTA runs a touch wider and larger, up to 6rem at 118%).
- **Headline** (800, wide 112%, 1.02 leading, max 16ch, balanced): every section heading.
- **Statement** (700, 105%, 1.12): the single scroll-revealed manifesto paragraph, word by word.
- **Title** (750, 108%): lifecycle step names, scan results, rules-list questions (scaled up to 2.3rem there), matrix headers, platform terms.
- **Lede** (Geist 400, max 46 to 54ch, Mist): one supporting paragraph under each headline.
- **Body** (Geist 400, 1.0625rem, 1.6), in rem so it follows the reader's browser font size.
- **Label** (Geist, 0.72rem, Faded Ink): field labels inside the ATL sheet cells.
- **Data** (JetBrains Mono 500, tabular figures): field values, times, registrations, hashes.
- **Marker** (JetBrains Mono 700, 0.7rem, uppercase, +0.06em): AUTO / PREV / CARRIED / CALC field markers and status pills (pills at 500 weight, 0.72rem, +0.04em).

### Named Rules
**The Data Is Mono Rule.** Any value an operator would write in the log (registration, ICAO code, UTC time, quantity, hash, record number) is set in JetBrains Mono with tabular figures. Prose never is.

**The Wide Means Loud Rule.** Archivo's width scales with importance: 120% for painted ground text, 115 to 118% for display, 112% for headlines, 105 to 110% for titles and brand.

## Layout

A single scrolling story of full-height scenes. Content sits in a centered container (1320px max) inside a fluid gutter (16 to 56px); full-bleed bands carry the ground changes. Section rhythm is a fluid vertical padding (88 to 168px). Pinned scenes (hero, lifecycle, screens rail) are 100svh.

Two-column scenes use asymmetric fractional grids: 5/7 (lifecycle, MEL), 4/7 (platform), 1/1 (QR, offline), with fluid gaps of 40 to 100px. The roles matrix and rules list are full-container ledgers with heavy top and bottom rules.

Single breakpoint at 860px: grids collapse to one column, nav links move into a Menu dropdown (brand, Menu and Talk to us remain), the hero stacks copy over the jet with the sheet below, the ATL grid goes from three to two columns, the chain track turns vertical, and the screens rail becomes a native scroll-snap carousel.

## Elevation & Depth

Hybrid. The dark world is flat and tonal: sections separate by ground color and hairlines, and dark panels have no shadow. Physical objects that sit on the apron (the jet, the paper sheet, the placard, device frames) are lifted with soft, long, downward ambient shadows, as if under floodlight. Paper objects are also slightly rotated (-3 to +2 degrees) to read as dropped onto the scene.

### Shadow Vocabulary
- **Paper lift** (`box-shadow: 0 2px 4px rgba(0,0,0,.2), 0 30px 60px -12px rgba(0,0,0,.6)`): the ATL sheet.
- **Placard lift** (`box-shadow: 0 30px 60px -18px rgba(0,0,0,.7)`): the QR placard.
- **Device bezel** (`box-shadow: inset 0 0 0 1.5px #3a4352, 0 40px 80px -20px rgba(0,0,0,.7)`): graphite iPad and screenshot frames.
- **Aircraft cast** (`filter: drop-shadow(18px 26px 24px rgba(0,0,0,.55))`): the jet on the apron; on the blue CTA field the cast is navy-tinted.
- **Scan glow** (`box-shadow: 0 0 18px 2px rgba(92,155,224,.6)`): the moving QR scanline only.

### Named Rules
**The Objects Lift, The Ground Doesn't Rule.** Only things that physically exist on the apron (aircraft, paper, devices) get shadows. UI panels, cards and controls on navy stay flat and use hairlines.

## Shapes

Soft, product-grade rounding that grows with object size: 4px field markers, 10px controls and notices, 12 to 14px cards and record blocks, 16 to 20px paper and panels, 28 to 34px device bezels. Every interactive control and status pill is a full capsule. Small status indicators are circles (7 to 10px). Rules are hairline (1px) on dark ground and on paper cells, with 1.5 to 2px ink rules marking the head of a ledger.

## Components

### Buttons
Capsule, confident, paper on night.
- **Shape:** full capsule (999px), min height 48px; small 40px (44px on phones), large 60px.
- **Primary:** Log Paper fill with Log Ink text, Geist 600.
- **Hover / Focus:** fill brightens to pure white and text shifts to cobalt; 0.25s expo-out; 1px press on active; floodlit-cobalt 2px focus ring offset 3px.
- **Ghost:** transparent with a strong-hairline border and Floodlight White text; hover raises the border to Mist and adds a faint white wash.

### Chips
- **Style:** transparent capsule, strong-hairline border, Mist text, 9px 16px.
- **State:** selected chip inverts to a Floodlight White fill with Apron Night text.

### Status Pills and Field Markers
- **Pills:** mono uppercase capsule with a leading currentColor dot; neutral on Paper Shade, tinted translucent green/amber/red fills for signed/deferred/broken.
- **Field markers:** tiny mono uppercase outlined tags beside a value: AUTO / PREV / CARRIED in cobalt solid outline, CALC in Faded Ink dashed outline.

### Cards / Containers
- **Record blocks:** Cockpit Navy fill, strong-hairline border, 14px radius; border turns red with a faint red wash when broken, floodlit cobalt when amended.
- **Panels:** Hangar Navy, strong-hairline border, 20px radius, row lists divided by hairlines.
- **Shadow Strategy:** flat (see Elevation).

### Inputs / Fields
- **Switch:** 64 x 36 capsule track in Deck Navy with a Floodlight White knob; the on state fills amber (airplane mode = offline).
- **Focus:** floodlit cobalt ring on the track.

### Navigation
Fixed top bar: app mark plus wide Archivo wordmark left, four Mist links (hover to white), small primary capsule "Talk to us" right; the same label is used for every contact action on the page. Transparent over the hero; once scrolled it becomes 94% Apron Night with a hairline bottom border (no backdrop blur: over the paper sections it read as a grey slab). Below 860px the links move into a dropdown opened by a ghost "Menu" capsule (aria-expanded, closes on link and Escape).

### ATL Sheet (signature component)
The paper record: Log Paper, 18px radius, paper lift, rotated -3 degrees. A head with label and mono record number over a 2px ink rule; a three-column grid of hairline-ruled cells (two on mobile), each a small Faded Ink label over a mono value; a cell flashes pale blue when its leader line lands. The footer carries a drawn signature in pen-blue, a mono PIN/hash stack, and a green seal dot that pops in when signed. In the hero, values travel as paper slips: a slip pops off the part with a short paper-white tick to a ring on the source, then arcs into its cell, which types the value and flashes pale blue as it lands. No long leader lines cross the screen. The hero is one flight told in four pinned chapters, each with its own staging: Preflight (registration and fuel slips on stand, then close-ups: a main wheel with an inflation gauge whose needle reads NLG, LH and RH MLG in turn, and the oil tank sight glass, full on ENG 1, topped up from a quart can on ENG 2), Flight (off blocks and take-off: the shadow separates from the aircraft, the apron gives way to a streaming cloud deck, times stamp into their cells), Engine (cruise readouts slip into the ambient row, then the camera zooms into engine 2, the PW545 cutaway rotates level and comes apart module by module, each module sending its ENG 2 value as a slip) and All Weather (fog, runway 30 with approach lights sliding in, radio altitude counting to minimums). The sheet carries Preflight / Flight / Engine / All Weather tabs and switches page with a top-down clip reveal; a four-step chapter rail sits bottom-left on desktop.

### Device Frame
Graphite iPad bezel (34px, 18px screen radius) with an inset 1.5px edge highlight, holding a light app UI: Log Ink title bar, white tab strip with cobalt active underline, ruled rows. Used for the lifecycle demo and the screenshot rail. The lifecycle follows one defect, not the flight the hero already showed: Reported, Deferred (MEL C), Record closed (the defect stays on the DDL), Rectified with a CRS. A rail on the step list fills dot to dot with the scroll; passed dots stay lit. On phones the device drops its 4:3 ratio and is as tall as its content.

## Do's and Don'ts

### Do:
- **Do** set every operational value (registration, ICAO, UTC time, quantity, hash) in JetBrains Mono with tabular figures.
- **Do** use the floodlit cobalt for leader lines, active indicators and focus on dark ground, and the deeper cobalt for fills and blue on paper.
- **Do** separate dark sections by ground tone (night, navy-900) and hairlines rather than by shadows or nested cards.
- **Do** lift and slightly rotate physical objects (paper, placard, aircraft) with the long soft shadows from the Shadow Vocabulary.
- **Do** label any synthetic record shown on the page as demo data, in small Mist or Faded Ink text beside it.
- **Do** tell a mechanism with a pinned or scroll-scrubbed scene, settling on the expo-out curve, and give every scene a complete static end state under reduced motion.
- **Do** move things with transforms. Animating `left`/`top` or blurring many moving layers showed up as layout shift and jank; a long jump in the hero (back to the top, or across more than two stops) lands at once instead of rewinding.

### Don't:
- **Don't** use taxi-line yellow for anything that is not ground marking.
- **Don't** use green, amber or red where no status is being shown.
- **Don't** add shadows to dark UI panels, cards or controls; only physical objects lift.
- **Don't** set prose or headings in mono, or operational values in Geist.
- **Don't** set display type at Archivo's normal width; the system's display voice is wide (105% and up) and heavy (700 and up).

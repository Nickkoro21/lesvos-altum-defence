# MSc Thesis Defence · 7-Band vs RGB Semantic Segmentation

**Development of a GIS Application for the Automatic Classification of Multispectral & Thermal UAV Images Using Convolutional Neural Networks**

An offline, self-contained [reveal.js](https://revealjs.com/) presentation for the MSc thesis defence — *Geography & Applied Geoinformatics*, **University of the Aegean**.

### ▶ [**Open the live presentation →**](https://nickkoro21.github.io/lesvos-altum-defence/)

🇬🇧 **EN** / 🇬🇷 **ΕΛ** — fully bilingual, switch language in place on any slide.

---

## About

The study trains the **same** segmentation network (DeepLabV3 + PointRend / ResNet-101) twice over UAV imagery of **Pamfila, Lesvos** (GSD 4.52 cm), and tests — rigorously — whether extra channels change the map:

- **7-Band composite** — Blue · Green · Red · RedEdge · NIR · **nDSM** (geometry) · **Thermal** (LWIR)
- **RGB baseline** — colour only

### Key finding

| Metric (M4, 2,100 paired points) | 7-Band | RGB | Δ |
|---|---|---|---|
| Overall Accuracy | **93.90%** | 83.29% | +10.61 |
| Cohen's κ | **92.89%** | 82.09% | +10.80 |
| Macro-F1 | **93.99%** | 83.71% | +10.28 |
| mIoU | **88.87%** | 73.78% | +15.09 |

The advantage is **structural** (McNemar *p* ≈ 8.6×10⁻⁴⁰; all bootstrap 95% CIs > 0) and is driven by **geometry (nDSM)** and **heat (LWIR)** — not by spectrum. After Holm correction, only **Building, Vehicle and Shadow-Noise** gain significantly, so the *multispectral* gain is **not** the vegetation bands — **H3 overturned**.

## Controls

| Action | Key |
|---|---|
| Next / previous | `→` `←` / `Space` |
| Switch language (EN ⇄ ΕΛ) | `l` (or the **EN / ΕΛ** button, top-right) |
| Slide menu / jump | `m` (or the **☰** button) |
| Overview | `Esc` |

The deck also has live, interactive widgets (animated McNemar table, paired-bootstrap simulation, a 3-tab confusion-matrix heat-map, and links to companion web apps).

## Built with

- **reveal.js 5.x** — vendored, no CDN, runs fully offline
- **KaTeX** — offline math rendering
- Vanilla JS for the language toggle, slide menu and animations (`deck/js/deck.js`)
- Headless **Puppeteer** tooling for deterministic rendering & an overflow/overlap audit (`deck/shoot.js`, `deck/audit.js`)

## Run locally

```bash
cd deck
npm install        # only needed for the render/audit tooling
node server.js     # serves the deck at http://localhost:8000
```

Or just open `deck/index.html` in a browser — everything is self-contained.

## Author

**Nikolaos Koroniadis** — MSc *Geography & Applied Geoinformatics*, University of the Aegean
Supervisor: Assist. Prof. Dr. Christos Vasilakos · Mytilene, 2026

### Companion deliverables

- [Interactive methodology map](https://nickkoro21.github.io/lesvos-altum-segmentation/)
- [7-Band vs RGB dashboard](https://nickkoro21.github.io/thesis-7band-vs-rgb/)
- [PostProcessing Toolbox (ArcGIS, MIT)](https://github.com/Nickkoro21/PostProcessing-Toolbox)
- [Spectral 3D Explorer](https://huggingface.co/spaces/NickKoro21/spectral-3d-explorer)

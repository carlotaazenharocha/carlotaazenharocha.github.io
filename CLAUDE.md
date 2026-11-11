# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Architecture portfolio website for Carlota Azenha da Rocha. Static site with bilingual support (English/Portuguese), no build tools or dependencies.

**Stack:** HTML5, CSS3, Vanilla JavaScript (ES6), JSON data files, GitHub Pages hosting.

## Local Development

```bash
# Start local server (required for JSON fetch to work)
python3 -m http.server 8000
# Visit http://localhost:8000

# Alternative: VS Code Live Server extension
```

## Architecture

### Pages
- **index.html** - Homepage with project grid (loaded dynamically from JSON)
- **project.html** - Project detail template (uses query param `?id=01-atlas-case-studies`)
- **about.html** - CV/bio page with participations list and sidebar contact info
- **participation.html** - Participation detail template (uses query param `?id=participation-id`)

### Core Files
- **js/main.js** - All dynamic functionality: language switching, JSON loading, content rendering
- **css/style.css** - Single stylesheet with responsive breakpoints (768px, 1024px)
- **projects.json** - Project data with bilingual content `{"en": "...", "pt": "..."}`
- **participations.json** - Academic activities & formative experiences with bilingual content
- **translations.json** - UI strings for both languages

### Data Flow
1. Page loads → JavaScript fetches JSON files
2. Language preference read from `localStorage`
3. Content rendered based on current language
4. Language toggle updates preference and re-renders (no page reload)

## Current Projects (8 total)

| ID | Title (EN) | Location |
|----|-----------|----------|
| 01-atlas-case-studies | Atlas Case Studies | Évora |
| 02-rock-oporto-palace | Rock Oporto Palace | Porto |
| 03-beber-a-terra | Drink the Soil | Alcácer do Sal |
| 04-centro-interpretativo | Interpretive Centre in Évora Monte | Évoramonte |
| 05-dispositivo-urbano | Urban Device | Porto |
| 06-solar-sao-joao | Solar de S. João Square | Almeida |
| 07-capillas-san-bruno | Capillas de San Bruno | Seville |
| 10-master-lisboa | Water Reservoir Tower | Lisbon |

## Adding a New Project

1. Create folder: `projects/NN-project-name/` (NN = number)
2. Add images: `thumbnail.jpg` (or use hero), `hero.jpg`, additional content images
3. Add entry to `projects.json` following existing structure
4. Push to GitHub → auto-deploys to GitHub Pages

## Key Implementation Details

- **Bilingual System**: `getText(obj)` extracts correct language from `{"en": "...", "pt": "..."}` objects
- **Project Navigation**: URL query params (`?id=project-id`) determine which project to display
- **Lazy Loading**: Images use `loading="lazy"` and IntersectionObserver
- **No Build Step**: Edit files directly, refresh browser to test

## JSON Structure

**projects.json** entry:
```json
{
  "id": "01-project-name",
  "title": {"en": "Title", "pt": "Título"},
  "year": "2024",
  "location": {"en": "Porto, Portugal", "pt": "Porto, Portugal"},
  "typology": {"en": "Residential", "pt": "Residencial"},
  "concept": {"en": "Description...", "pt": "Descrição..."},
  "thumbnail": "projects/01-project-name/thumbnail.jpg",
  "hero": "projects/01-project-name/hero.jpg",
  "images": [{"src": "...", "caption": {"en": "...", "pt": "..."}, "layout": "full"}]
}
```

## Participations Structure

**participations.json** entry:
```json
{
  "id": "participation-id",
  "type": "workshop|seminar|exchange|volunteering|project|program",
  "title": {"en": "Title", "pt": "Título"},
  "date": "2024-02",
  "dateDisplay": {"en": "February 2024", "pt": "Fevereiro de 2024"},
  "location": {"en": "City, Country", "pt": "Cidade, País"},
  "institution": {"en": "Institution", "pt": "Instituição"},
  "description": {"en": "Full description...", "pt": "Descrição completa..."},
  "tags": ["tag1", "tag2"],
  "images": [{"src": "path/image.jpg", "caption": {"en": "...", "pt": "..."}}],
  "externalLinks": [{"url": "https://...", "label": {"en": "...", "pt": "..."}}]
}
```

Participations are displayed on the About page with type badges and link to detail pages.

## Deployment

GitHub Pages deploys automatically from main branch. Configuration in `_config.yml`.

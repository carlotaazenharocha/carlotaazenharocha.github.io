# Complete File Structure Reference

```
portfolio-template/
│
├── index.html                    # Homepage with projects grid
├── project.html                  # Project detail page template
├── about.html                    # About page
├── projects.json                 # ★ EDIT THIS - Your project data
│
├── css/
│   └── style.css                 # Main stylesheet
│
├── js/
│   └── main.js                   # Dynamic project loader
│
├── projects/                     # ★ ADD YOUR IMAGES HERE
│   ├── PLACEHOLDER.md            # Instructions for adding images
│   │
│   ├── 01-urban-housing/         # Example project folder
│   │   ├── thumbnail.jpg         # For homepage grid
│   │   ├── hero.jpg              # Top image on project page
│   │   ├── plan-ground.jpg       # Project images
│   │   ├── section-aa.jpg
│   │   ├── model-01.jpg
│   │   └── render-exterior.jpg
│   │
│   ├── 02-cultural-center/
│   │   ├── thumbnail.jpg
│   │   ├── hero.jpg
│   │   └── ...
│   │
│   └── 03-riverside-pavilion/
│       └── ...
│
├── assets/
│   ├── images/                   # General site images (logo, etc.)
│   └── cv.pdf                    # ★ ADD YOUR CV HERE
│
├── README.md                     # Full documentation
├── QUICKSTART.md                 # 10-minute setup guide
├── _config.yml                   # GitHub Pages config
└── .gitignore                    # Git ignore file
```

---

## Files You Need to Edit

### 1. `projects.json` ★★★
**Most important file** - Contains all project data

### 2. `about.html` ★★
Edit your bio, education, experience, contact info

### 3. All HTML files ★
Search and replace:
- "Your Name" → Your actual name
- "your.email@example.com" → Your email
- "Barcelona, Spain" → Your location

### 4. Add images to `projects/` folders ★★★

### 5. Add `assets/cv.pdf` ★

---

## Files You Don't Need to Edit

- `css/style.css` (unless changing design)
- `js/main.js` (handles dynamic loading)
- `_config.yml` (GitHub Pages setup)
- `.gitignore` (version control)

---

## Recommended Workflow

1. **First**: Edit `projects.json` with your projects
2. **Second**: Create folders in `projects/` and add images
3. **Third**: Edit `about.html` with your info
4. **Fourth**: Replace "Your Name" everywhere
5. **Fifth**: Add `cv.pdf`
6. **Finally**: Test locally, then deploy

---

## Image Naming Convention

Keep it simple and consistent:

```
thumbnail.jpg          # Homepage grid
hero.jpg              # Project page top
plan-ground.jpg       # Descriptive names
plan-first.jpg
section-aa.jpg
section-bb.jpg
elevation-north.jpg
model-01.jpg
model-02.jpg
render-exterior.jpg
render-interior.jpg
detail-facade.jpg
```

Lowercase, use hyphens, no spaces.

---

## Size Recommendations

- **Thumbnails**: 1200×900px (4:3 ratio)
- **Hero images**: 2000×1200px (horizontal)
- **Plans/Sections**: 2000px wide max
- **Detail shots**: 1600px wide
- **File size**: 100-500 KB (compress!)

---

## Project Folder Example

```
projects/01-urban-housing/
├── thumbnail.jpg         # 1200×900, ~150 KB
├── hero.jpg             # 2000×1200, ~400 KB
├── plan-ground.jpg      # 2000×1400, ~350 KB
├── section-aa.jpg       # 2000×800, ~250 KB
├── model-exterior.jpg   # 1600×1200, ~300 KB
└── render-interior.jpg  # 1800×1200, ~400 KB
```

Total: ~2 MB per project (reasonable for web)

---

## Need More Projects?

Just duplicate the pattern:

1. Create new folder: `projects/05-new-project/`
2. Add images
3. Add entry to `projects.json`
4. Push to GitHub

Portfolio updates automatically!

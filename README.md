# Architecture Portfolio Template

Minimalist, editorial-style static portfolio website for architecture graduates.

---

## Features

- **Minimalist Design**: Clean, editorial aesthetic inspired by architecture magazines
- **Image-First**: Projects showcased through high-quality images
- **Responsive**: Mobile, tablet, and desktop optimized
- **Static Site**: Pure HTML/CSS/JavaScript — no frameworks, fast loading
- **Easy to Update**: JSON-based project management
- **GitHub Pages Ready**: Deploy in minutes

---

## File Structure

```
portfolio/
├── index.html              # Homepage (projects grid)
├── project.html            # Project detail template
├── about.html              # About page
├── projects.json           # Project data (edit this!)
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   └── main.js            # Dynamic content loader
├── projects/              # Project images go here
│   ├── 01-urban-housing/
│   │   ├── thumbnail.jpg
│   │   ├── hero.jpg
│   │   ├── plan-ground.jpg
│   │   └── ...
│   ├── 02-cultural-center/
│   └── ...
└── assets/
    ├── images/            # General site images
    └── cv.pdf            # Your CV (PDF)
```

---

## Quick Start

### 1. Clone or Download

Download this template and open it in VS Code.

### 2. Replace Placeholder Content

#### **Edit `projects.json`**

This file contains all your project data. Edit it to match your work:

```json
{
  "projects": [
    {
      "id": "01",
      "title": "Your Project Title",
      "year": "2024",
      "location": "City, Country",
      "typology": "Residential / Cultural / Public",
      "thumbnail": "projects/01-project-name/thumbnail.jpg",
      "hero": "projects/01-project-name/hero.jpg",
      "concept": "Your project description here...",
      "images": [
        {
          "src": "projects/01-project-name/plan.jpg",
          "caption": "Ground floor plan, 1:200",
          "layout": "full"
        }
      ]
    }
  ]
}
```

**Image layout options:**
- `"layout": "full"` → Full-width image
- `"layout": "inset"` → Centered, narrower image (for details)

#### **Add Your Images**

1. Create folders in `projects/` for each project
2. Name them clearly: `01-project-name/`, `02-project-name/`, etc.
3. Add your images:
   - `thumbnail.jpg` → For homepage grid (4:3 aspect ratio recommended)
   - `hero.jpg` → Top image on project page (horizontal)
   - Other images: plans, sections, renders, models, etc.

**Image Guidelines:**
- Format: JPG or PNG
- Max width: 2000px (for web performance)
- Compress images before uploading (use tools like TinyPNG, Squoosh)

#### **Edit About Page**

Open `about.html` and replace:
- Your name
- Introduction text
- Education
- Experience
- Workshops & participations
- Publications
- Thesis
- Contact information (email, location, LinkedIn)

#### **Add Your CV (PDF)**

Place your CV PDF in `assets/cv.pdf`

#### **Update Site Title**

In all HTML files, replace:
- `"Your Name"` in the header
- `"Your Full Name"` in About page
- Footer copyright

---

## Local Testing

### Option 1: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. Site opens in browser at `http://localhost:5500`

### Option 2: Python HTTP Server

```bash
cd portfolio-template
python3 -m http.server 8000
```

Open browser: `http://localhost:8000`

---

## Deployment to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to GitHub.com and create a new repository
2. Name it: `your-username.github.io` (or any name)
3. Keep it **public**

### Step 2: Push Your Code

```bash
cd portfolio-template
git init
git add .
git commit -m "Initial portfolio commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **main** branch
4. Click **Save**
5. Your site will be live at: `https://your-username.github.io/your-repo`

---

## Content Update Workflow

### Adding a New Project

1. **Create project folder**: `projects/05-new-project/`
2. **Add images** to this folder
3. **Edit `projects.json`**: Add new project entry
4. **Commit and push** to GitHub:

```bash
git add .
git commit -m "Add new project: Project Name"
git push
```

GitHub Pages updates automatically (takes 1-2 minutes).

---

## Customization

### Change Colors

Edit `css/style.css`:

```css
/* Find these variables and change them */
body {
  color: #1a1a1a;           /* Text color */
  background-color: #ffffff; /* Background */
}

a:hover {
  opacity: 0.6;              /* Hover effect */
}
```

### Change Typography

Replace Google Fonts link in HTML files:

```html
<!-- Current: Inter -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

<!-- Example: Roboto -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
```

Then update CSS:

```css
body {
  font-family: 'Roboto', sans-serif; /* Change font here */
}
```

### Adjust Grid Columns

In `css/style.css`, find `.projects-grid`:

```css
.projects-grid {
  grid-template-columns: repeat(2, 1fr); /* Change to 3 for 3 columns */
}
```

---

## Image Optimization Tips

Before uploading images:

1. **Resize** to max 2000px width
2. **Compress** using:
   - [TinyPNG](https://tinypng.com/)
   - [Squoosh](https://squoosh.app/)
   - Photoshop "Export for Web"
3. **Target**: ~200-500 KB per image
4. **Thumbnails**: ~100 KB

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Design Philosophy

This template follows architectural portfolio best practices:

- **Content over decoration**: Images tell the story
- **Editorial layout**: Inspired by architecture magazines (El Croquis, A+U)
- **Typography hierarchy**: Clear, readable, minimal
- **White space**: Generous margins and spacing
- **Subtle interactions**: No heavy animations or effects
- **Professional presentation**: Clean, confident, focused

---

## Troubleshooting

### Images not loading locally?

Make sure you're using a local server (Live Server or Python HTTP server), not just opening `index.html` directly in the browser.

### Projects not appearing?

Check `projects.json` for syntax errors:
- Missing commas
- Missing quotes
- Incorrect brackets

Use a JSON validator: [JSONLint](https://jsonlint.com/)

### GitHub Pages not updating?

- Wait 1-2 minutes after pushing
- Check GitHub Actions tab for deployment status
- Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

---

## License

This template is free to use for your personal portfolio. No attribution required.

---

## Support

For questions or issues, check:
- GitHub Pages documentation: https://pages.github.com/
- W3C HTML validation: https://validator.w3.org/
- CSS validation: https://jigsaw.w3.org/css-validator/

---

**Good luck with your applications!**

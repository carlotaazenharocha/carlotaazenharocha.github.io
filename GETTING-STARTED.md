# Architecture Portfolio - Getting Started

Welcome! This template is ready to customize and deploy.

---

## 📋 What You Have

A complete, professional architecture portfolio website with:

✅ Minimalist, editorial design  
✅ Responsive (mobile, tablet, desktop)  
✅ Projects grid homepage  
✅ Individual project pages  
✅ About page with CV  
✅ JSON-based content management  
✅ Ready for GitHub Pages deployment  

---

## 🚀 Three-Step Setup

### Step 1: Customize Content (10 min)

#### A. Replace placeholder names
Search and replace in ALL files:
- `"Your Name"` → Your actual name
- `"your.email@example.com"` → Your email
- Adjust location, LinkedIn URL in `about.html`

#### B. Edit `projects.json`
This is your **main content file**. Replace the 4 placeholder projects with your own:

```json
{
  "id": "01",
  "title": "Your Project Name",
  "year": "2024",
  "location": "City, Country",
  "typology": "Residential",
  "thumbnail": "projects/01-your-project/thumbnail.jpg",
  "hero": "projects/01-your-project/hero.jpg",
  "concept": "Brief description of your project concept...",
  "images": [
    {
      "src": "projects/01-your-project/plan.jpg",
      "caption": "Ground floor plan, 1:200",
      "layout": "full"
    }
  ]
}
```

#### C. Add your images
1. Create folders: `projects/01-project-name/`, `02-project-name/`, etc.
2. Add images for each project:
   - `thumbnail.jpg` (for homepage grid)
   - `hero.jpg` (top of project page)
   - Other images (plans, sections, renders)

#### D. Update About page
Edit `about.html`:
- Introduction paragraph
- Education
- Experience
- Workshops & participations
- Publications
- Thesis (if applicable)

#### E. Add CV PDF
Place your CV in: `assets/cv.pdf`

---

### Step 2: Test Locally (2 min)

**Option A: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

**Option B: Python Server**
```bash
python3 -m http.server 8000
```
Visit: `http://localhost:8000`

---

### Step 3: Deploy to GitHub Pages (5 min)

#### A. Create GitHub repository
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it: `your-username.github.io` (or any name)
4. Make it **public**
5. Click "Create repository"

#### B. Push your code
```bash
# In your portfolio folder
git init
git add .
git commit -m "Initial portfolio commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### C. Enable GitHub Pages
1. Go to repository **Settings**
2. Click **Pages** (left sidebar)
3. Under "Source", select **main** branch
4. Click **Save**
5. Wait 1-2 minutes

**✨ Your portfolio is live at:**  
`https://your-username.github.io/your-repo`

---

## 📁 Understanding the Structure

```
portfolio-template/
├── index.html           → Homepage (projects grid)
├── project.html         → Project detail template
├── about.html           → About / CV page
├── projects.json        → ★ YOUR PROJECT DATA ★
├── css/style.css        → Styling
├── js/main.js          → Dynamic loading
├── projects/           → ★ YOUR IMAGES GO HERE ★
│   ├── 01-project-name/
│   │   ├── thumbnail.jpg
│   │   ├── hero.jpg
│   │   └── other-images.jpg
│   └── 02-project-name/
└── assets/
    └── cv.pdf          → Your CV
```

---

## 🎨 Design Principles

This template follows architecture portfolio best practices:

- **Image-first**: Projects speak through visuals
- **Editorial layout**: Inspired by A+U, El Croquis, 2G
- **Generous white space**: Let the work breathe
- **Clean typography**: Inter typeface throughout
- **Subtle interactions**: Minimal hover effects
- **Professional restraint**: No decorative elements

---

## 📸 Image Guidelines

### Recommended sizes:
- **Thumbnails**: 1200×900px (4:3 ratio), ~150 KB
- **Hero images**: 2000×1200px (landscape), ~400 KB
- **Plans/Sections**: 2000px width max, ~300 KB
- **Details**: 1600px width, ~250 KB

### Optimize before uploading:
- [TinyPNG](https://tinypng.com/)
- [Squoosh](https://squoosh.app/)
- Photoshop "Export for Web"

Target: 100-500 KB per image

---

## 🔄 Updating Your Portfolio

### Adding a new project:

1. Create folder: `projects/05-new-project/`
2. Add images to folder
3. Edit `projects.json` - add new entry
4. Commit and push:
```bash
git add .
git commit -m "Add new project"
git push
```

GitHub Pages updates automatically (1-2 min).

---

## 🎯 Customization Options

### Change grid columns
In `css/style.css`, find `.projects-grid`:
```css
grid-template-columns: repeat(2, 1fr); /* Change to 3 for 3 columns */
```

### Change colors
In `css/style.css`:
```css
body {
  color: #1a1a1a;           /* Text */
  background-color: #ffffff; /* Background */
}
```

### Change typeface
Replace Google Fonts link in HTML files and update:
```css
body {
  font-family: 'Your-Font', sans-serif;
}
```

---

## ❓ Troubleshooting

**Images not loading locally?**
→ Use a local server (Live Server or Python), don't open `index.html` directly

**Projects not appearing?**
→ Check `projects.json` syntax at [JSONLint](https://jsonlint.com/)

**GitHub Pages not updating?**
→ Wait 1-2 minutes, check Actions tab, hard refresh browser

**Layout broken on mobile?**
→ The template is responsive by default, check your custom CSS

---

## 📚 Documentation Files

- **QUICKSTART.md** → 10-minute setup
- **README.md** → Full documentation
- **STRUCTURE.md** → File organization reference
- This file → Getting started guide

---

## ✅ Pre-Deployment Checklist

Before deploying, make sure you've:

- [ ] Replaced "Your Name" everywhere
- [ ] Edited `projects.json` with your projects
- [ ] Added all project images
- [ ] Updated About page content
- [ ] Added your CV PDF
- [ ] Tested locally (all links work, images load)
- [ ] Compressed images (under 500 KB each)
- [ ] Checked mobile view

---

## 🎓 Best Practices for Architecture Portfolios

1. **Quality over quantity**: 4-6 strong projects better than 10 weak ones
2. **Tell a story**: Each project should have a clear narrative
3. **Show process**: Include diagrams, sketches, development work
4. **Technical drawings**: Plans, sections, details show rigor
5. **Context**: Explain typology, location, constraints
6. **Keep it current**: Update regularly with new work

---

## 🌐 After Deployment

Share your portfolio:
- Add to LinkedIn profile
- Include in email signature
- Put on your CV
- Share in job applications

Track visitors (optional):
- Add Google Analytics
- Use GitHub traffic insights

---

## 📧 Support

For issues:
- Check the README.md
- Validate JSON: [JSONLint](https://jsonlint.com/)
- Validate HTML: [W3C Validator](https://validator.w3.org/)
- GitHub Pages docs: [pages.github.com](https://pages.github.com/)

---

**Good luck with your applications!**

Your portfolio represents your work — keep it clean, professional, and focused on the architecture.

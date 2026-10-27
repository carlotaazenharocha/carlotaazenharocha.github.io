# Quick Start Guide

Get your portfolio online in 10 minutes.

---

## Step 1: Edit Your Information (2 minutes)

### Replace Name & Contact

Open these files and search/replace "Your Name":

1. `index.html` - Header logo
2. `about.html` - Contact section
3. All files - Footer

Update contact info in `about.html`:
- Email
- Location
- LinkedIn URL

---

## Step 2: Add Your Content (5 minutes)

### Edit `projects.json`

```json
{
  "id": "01",
  "title": "Your Project Title",      ← Change this
  "year": "2024",                      ← Change this
  "location": "City, Country",         ← Change this
  "typology": "Residential",           ← Change this
  "thumbnail": "projects/01-name/thumbnail.jpg",
  "hero": "projects/01-name/hero.jpg",
  "concept": "Your description...",    ← Change this
  "images": [...]                      ← Add your images
}
```

### Add Images

1. Create folder: `projects/01-your-project/`
2. Add images:
   - `thumbnail.jpg` (for homepage)
   - `hero.jpg` (project page top)
   - Other images (plans, sections, renders)

Repeat for each project.

---

## Step 3: Test Locally (1 minute)

### VS Code:
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### Python:
```bash
python3 -m http.server 8000
```
Open: `http://localhost:8000`

---

## Step 4: Deploy to GitHub Pages (2 minutes)

### Create Repository on GitHub

1. Go to GitHub.com
2. Click "New repository"
3. Name: `your-username.github.io`
4. Create repository

### Push Your Code

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-username.github.io.git
git push -u origin main
```

### Enable GitHub Pages

1. Go to repository Settings
2. Click "Pages"
3. Select "main" branch
4. Save

**Your site is live at:** `https://your-username.github.io`

---

## Next Steps

- Upload your CV PDF to `assets/cv.pdf`
- Edit About page with your full bio
- Optimize images (compress them!)
- Share your portfolio link

---

## Need Help?

Read the full `README.md` for detailed instructions.

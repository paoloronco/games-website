# PC Games Viewer

A simple web application that loads data from **Excel (XLSX)** or **CSV** files and displays it in an interactive table with **search** and **sorting** features.  
The project is lightweight, written in vanilla JavaScript, and styled with CSS.

## Features
- Load data automatically from `data.xlsx` (or fallback to `data.csv`)
- Display all rows in a clean, responsive table
- Search across all columns
- Sort by clicking on column headers
- Detect links in cells and display them as clickable
- Dark/Light mode support (via system preferences)

## Demo / Run locally
You need to run a simple local server to test the app (because browsers block `fetch` from local files).

For example, with Python:
```bash
python -m http.server 8000
```
Then open <http://localhost:8000> in your browser.

## Project Structure
```
.
├── index.html       # Main HTML page
├── styles.css       # App styling (dark/light mode)
├── app.js           # Core logic (load, render, search, sort)
├── xlsx.full.min.js # SheetJS library (for XLSX parsing)
├── data.xlsx        # Dataset (your PC games list)
```
> The app fetches `data.xlsx` (or `data.csv`) from the same directory as `index.html`, so keep files together and use **relative paths**.

## How It Works
1. On page load, the app tries to read `data.xlsx` using [SheetJS](https://sheetjs.com/).
2. If `data.xlsx` is not found, it falls back to `data.csv`.
3. The header row is read and used as table columns.
4. Data is rendered in a table; click any header to sort.
5. The search box filters results across all columns.

## Requirements
- A modern browser (Chrome, Firefox, Edge, Safari).
- A simple static server (e.g., `python -m http.server`).

## Deploy

### Quick deploy to Vercel (recommended)
1. Push this repo to GitHub/GitLab/Bitbucket.
2. Go to <https://vercel.com/new>, import the repository.
3. Framework preset: **Other** (or **Static**). Output directory: **/** (project root).
4. Deploy. Vercel will serve `index.html` and all static assets.  
   Ensure `data.xlsx` (or `data.csv`) is committed so it’s available at runtime.


> Notes for Vercel
> - The app is pure static: no server functions required.
> - Keep `data.xlsx`/`data.csv` in the repo. If you update the dataset, redeploy.
> - Relative paths are important: the code fetches `./data.xlsx` or `./data.csv`.

### Alternative deployments
- **Netlify**
  - Drag-and-drop the folder in <https://app.netlify.com/drop> or connect your repo.
  - Build command: *none*, Publish directory: project root.
- **GitHub Pages**
  - Push to a public repo, enable *Settings → Pages* with the root (`/`) or `docs/` folder.
  - Visit the Pages URL; relative paths ensure assets load correctly.
- **Cloudflare Pages**
  - Create a project, connect the repo, **Build command:** none, **Build output directory:** `/`.
- **Static hosting (Nginx/Apache/S3)**
  - Upload all files to the document root/bucket. Make sure `index.html` is the default and `data.xlsx` is accessible at `/<path>/data.xlsx`.
- **Docker (optional)**
  ```dockerfile
  FROM nginx:alpine
  COPY . /usr/share/nginx/html
  # serves index.html and static assets at port 80
  ```

## Customization
- Adjust the XLSX parsing options in `app.js` (`XLSX_CONFIG`: sheet name, header row, start column).
- Tweak styles in `styles.css`.

## License
MIT License.

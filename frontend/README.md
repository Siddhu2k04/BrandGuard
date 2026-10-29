# BrandGuard — Organized React Frontend

Responsive BrandGuard UI built with React, Vite, JavaScript, and CSS. Components and pages are separated into folders so the project is easier to maintain.

## Screens and connected workflow

1. **Login** — select Company or Employee and enter an email/password. Demo login routes the selected role to its correct first page.
2. **Company Login → Company Guidelines** — select a PDF, enter a title and optional description, then save it. The latest guideline PDF is stored in browser IndexedDB and appears on the employee upload page.
3. **Employee Login → Upload Content** — submit an image, text, or URL, enter a title/description, and upload. The item is saved in IndexedDB.
4. **Analysis Results** — opens after submission, loads the submitted item, displays preliminary text-level checks, and allows downloading a report.
5. **Dashboard / Settings** — role-aware navigation and local saved-record counts.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL Vite prints in the terminal. To create a production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
brandguard-react/
├── public/
│   ├── assets/login-bg.jpg
│   └── login-bg.jpg
├── src/
│   ├── components/
│   │   ├── AppShell.jsx
│   │   ├── Brand.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── GuidelinesPage.jsx
│   │   ├── UploadPage.jsx
│   │   ├── AnalysisPage.jsx
│   │   └── UtilityPages.jsx
│   ├── utils/
│   │   ├── storage.js
│   │   └── analyze.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
└── README.md
```

## Important production notes

- This is a **frontend demo**, not production authentication. Any non-empty email and password will pass the login form. Do not use it to protect real data.
- PDFs and uploads persist in the current browser using IndexedDB, not on a server. They are not shared between different computers or browsers.
- The analysis is a transparent local text heuristic. It does not inspect image pixels, fetch webpage content, extract PDF rules, or use an AI model. Replace `src/utils/analyze.js` with a call to your actual analysis API.
- For a real multi-user deployment, connect secure server-side authentication, role permissions, shared file storage, a database, and an AI analysis service. Never place secret API keys in frontend code.

# FlowSense

<p align="left">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-⚡-7C3AED?logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3.0-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-Local-000000?logo=express&logoColor=white" />
  <img alt="jsPDF" src="https://img.shields.io/badge/jsPDF-2.5-FFDD00?logo=javascript&logoColor=black" />
  <img alt="docx" src="https://img.shields.io/badge/docx-1.0-0078D7?logo=word&logoColor=white" />
  <img alt="FileSaver" src="https://img.shields.io/badge/FileSaver-2.0-FF6C37?logo=github&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-Internal-orange" />
</p>

**Quick links:** [Issues](https://github.com/Keertilata20/flowsense-app/issues) • [Pull requests](https://github.com/Keertilata20/flowsense-app/pulls) • [Actions](https://github.com/Keertilata20/flowsense-app/actions) • [Releases](https://github.com/Keertilata20/flowsense-app/releases)

FlowSense is a calm, document-first writing workspace for university students. It brings long-form writing, personal organization, and lightweight writing support into one warm, focused environment.

> Write first. Organize naturally. Improve thoughtfully.

## Table of contents

- [Product overview](#product-overview)
- [Core features](#core-features)
- [Current capabilities](#current-capabilities)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Design principles](#design-principles)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Product overview

FlowSense is designed to feel closer to a professional writing tool than a notes inbox. Documents can be written on paginated A4-style paper, organized into Spaces, tagged, searched, revisited, and exported.

The application is local-first: drafts, Spaces, metadata, and preferences are stored in the browser so the core writing flow remains fast and available without an account or cloud setup.

## Core features

- ✍️  Focused, paginated A4 writing canvas built for long-form documents
- 🗂️  Lightweight organization with Spaces, tags, and quick moving/duplication
- 🔎  Fast, instant search across titles, content, tags, and Spaces
- 📄  Export to PDF, Word, and plain text with clear multi-page output
- 🧭  Simple insights: today’s words, most active Space, and document stats
- ⚡  Local-first autosave and optional local writing suggestions (no account required)

## Current capabilities

### Writing workspace

- A4-inspired paginated writing canvas with fixed margins and page numbers
- Long-form typography with a warm paper palette
- Editable document title, Space, status, and tags
- Statuses for Draft, In Progress, Finished, and Archived
- Favorite documents and Focus Mode
- Autosave feedback with `Saving...` and `Saved just now` states
- Keyboard shortcuts: `Cmd/Ctrl + S` to save and `Cmd/Ctrl + Shift + F` for Focus Mode

### Document organization

- Personal Library with Recent Documents and Favorites
- Default Spaces for Projects, Career, Research, and Personal
- Custom Spaces with Lucide-based icons
- Optional `No space yet` assignment for uncategorized writing
- Move documents between Spaces
- Duplicate, rename, delete, and favorite documents
- Multi-select with bulk move and bulk delete
- Backward-compatible migration for older saved drafts

### Search and relationships

- Instant search across document titles, content, tags, and Spaces
- Sorting by recently edited, oldest, alphabetical, and word count
- Related Documents based on shared Space or tags

### Export and writing support

- PDF export with explicit multi-page output and page numbers
- Word document export
- Plain text export
- Optional writing suggestions through the existing local API service

### Insights

- Words written today
- Total document count
- Average document length
- Most active Space
- Longest document
- Favorite document context
- Writing-practice summary

## Project structure

```text
src/
├── components/
│   ├── editor/       # A4 editor, metadata, tags, related documents, toolbar
│   ├── home/         # Continuation-focused Home experience
│   ├── insights/     # Writing dashboard
│   ├── layout/       # Navigation and application shell
│   └── library/      # Library, Spaces, cards, search, and actions
├── hooks/
│   ├── useDocuments.ts
│   └── useSpaces.ts
├── styles/
└── App.tsx
```

The document model is normalized in `src/components/library/types.ts`. Legacy records using `text` and `savedAt` are migrated into the current `content`, metadata, Space, status, and tag fields when loaded.

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Express local API service
- jsPDF
- docx
- FileSaver

## Getting started

### Requirements

- Node.js 18 or newer
- npm

### Install dependencies

```bash
npm install
```

### Start the frontend

```bash
npm run dev
```

### Start the local writing service

In a separate terminal:

```bash
node server.js
```

The frontend uses `http://localhost:3001` by default for writing suggestions. Set `VITE_API_URL` in `.env` to use another local endpoint.

### Production build

```bash
npm run build
```

### Quality checks

```bash
npm run lint
```

## Design principles

FlowSense follows a small set of product principles:

1. Writing should always be more prominent than assistance.
2. Organization should be available without becoming overhead.
3. Metadata should support retrieval, not distract from writing.
4. The interface should feel warm, quiet, and intentional.
5. New features should extend the document model instead of creating parallel state.

## Roadmap

Planned work includes richer tag management, more advanced document relationships, improved writing analytics, and future intelligent assistance. These features should build on the existing normalized model.

## Contributing

Thanks for taking an interest in FlowSense — contributions are welcome. A short guideline to get started:

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Install dependencies: `npm install`
3. Run the app locally: `npm run dev`
4. Make changes, add tests where appropriate, and keep commits small and focused
5. Open a pull request with a clear title and description referencing any related issues

Please follow these basics when opening a PR:

- Write a short summary of the change and why it’s needed
- Link to any related issue(s)
- Include screenshots or recordings for UI changes
- Ensure linting passes: `npm run lint`

If you want to propose a larger design or API change, open an issue first to discuss.

## License

This project is currently an internal product prototype. Add a project-specific license before external distribution.

---

Built with ❤️ by Keerti • Internal prototype.

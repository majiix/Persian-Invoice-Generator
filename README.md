<div align="center">

# 🧾 Persian Invoice Generator

**A modern, client-side, open-source web application for creating, customizing, previewing, and exporting official and unofficial invoices with full Persian (RTL) and Solar Hijri (Jalali) calendar support.**

[🇮🇷 نسخه فارسی (Persian)](README.fa.md) • [🌐 Live Demo](https://majiix.github.io/Persian-Invoice-Generator/)

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Website-2563eb?style=for-the-badge&logo=githubpages&logoColor=white)](https://majiix.github.io/Persian-Invoice-Generator/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 Overview

**Persian Invoice Generator** is a lightweight, privacy-focused, and fully responsive tool tailored for businesses, freelancers, and agencies. It operates **100% client-side** in your browser without requiring registration, accounts, or sending sensitive financial data to any backend server.

---

## ✨ Features

### 1. Modern Editor & UI
- **Native RTL Layout & Persian Typography** using the [Vazirmatn](https://github.com/rastikerdar/vazirmatn) font.
- **Dark and Light Themes** with smooth transitions.
- **Collapsible Accordion Panels** with a quick "Expand / Collapse All" toggle.
- **Jalali (Solar) & Gregorian Calendars** with convenient due-date shortcuts (+7 days, +14 days).
- **Number-to-Words Conversion** in Persian (e.g., *62,000,000 Toman $\to$ شصت و دو میلیون تومان*).
- **Instant Digit Switching** between Persian (`۱۲۳`) and English (`123`) numerals.

### 2. Calculations, Tax & Discounts
- Add unlimited line items with item duplication and quick deletion.
- **Quantity Stepper** (`+` / `-`) supporting custom units (Item, Project, Month, Hours, etc.).
- **Flexible Discounts**: Fixed amount or percentage (`%`).
- **Smart VAT / Tax Calculation**:
  - **Overall (Default)**: Enter a single overall tax rate applied to the entire invoice subtotal.
  - **Per-Item**: Apply specific tax rates to individual line items.
- Full toggle support to cleanly enable or disable tax and discount columns.

### 3. Customizable Templates
- **3 Built-in Professional Layouts**:
  - **Classic**: Formal, structured table layout suitable for tax authorities.
  - **Modern**: Elegant, card-based corporate design.
  - **Minimal**: Clean typographic layout.
- Upload custom business logos, digital stamps, and signatures (stored locally as Base64).
- Visibility controls for invoice status badges (Paid / Unpaid / Draft) and signature boxes.

### 4. Multiple Bank Accounts
- Add multiple bank cards, account numbers, and IBAN (Sheba) records with bank and holder details.

### 5. Dynamic Multi-Page Attachments
- Dedicated attachment sheet for project specifications, contractual clauses, or terms of service.
- **Automatic Smart Pagination**: Long texts automatically distribute across consecutive A4 pages (Page 2 of N, 3 of N, etc.) with seamless headers and signature blocks.
- Built-in legal and technical contractual presets.

### 6. High-Quality Export Engines
- **Multi-page PDF**: Sharp, high-resolution multi-page PDF generation without broken or overlapping Persian text.
- **Microsoft Word (.docx)**: Clean RTL document with bidirectional tables, styled headers, and page breaks.
- **PNG Image**: Instant high-DPI image download.
- **JSON Backup & Import**: Export full invoice data as JSON and restore it anytime with schema validation.
- **Unsaved Changes Guard**: Warns users before closing the tab if the latest changes haven't been exported.

---

## 🚀 Step-by-Step Usage Guide

1. Visit [majiix.github.io/Persian-Invoice-Generator](https://majiix.github.io/Persian-Invoice-Generator/).
2. Fill in the **Invoice Details** (Invoice number, title, dates, currency, tax mode).
3. Enter **Seller** and **Buyer** information (upload logos and save as default if desired).
4. Add your **Line Items** (quantity, unit price, discounts). Totals update instantly in real time.
5. (Optional) Add your **Bank Accounts** and enable the **Attachment Sheet** for contracts/terms.
6. Choose a template (Classic, Modern, Minimal) in the live preview and export to **PDF**, **Word**, **Image**, or **Print**.

---

## 🛠️ Local Development & Setup

### Prerequisites
- **Node.js** v18+
- **npm**, **yarn**, or **pnpm**

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/majiix/Persian-Invoice-Generator.git
cd Persian-Invoice-Generator

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

The optimized static assets will be output to the `dist/` directory.

---

## 📁 Project Structure

```text
Persian-Invoice-Generator/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages automated deployment
├── docs/
│   └── project.md              # Architecture & feature documentation
├── src/
│   ├── components/
│   │   ├── editor/             # Invoice form sections and accordion panels
│   │   ├── preview/            # Live preview pane & export toolbar
│   │   ├── templates/          # Invoice templates (Classic, Modern, Minimal, SecondPage)
│   │   ├── invoice-list/       # Saved invoices manager drawer
│   │   └── common/             # Header, ThemeToggle, Toast, Modals
│   ├── types/
│   │   └── invoice.ts          # TypeScript type definitions
│   ├── utils/
│   │   ├── calculations.ts     # Pricing, discount, and tax calculations
│   │   ├── exporters.ts        # PDF, Word (.docx), Image, and JSON export engines
│   │   ├── jalaliDate.ts       # Solar Hijri (Jalali) calendar utilities
│   │   ├── numberToWords.ts    # Persian number-to-words converter
│   │   ├── persianDigits.ts    # Persian numeral formatting
│   │   └── storage.ts          # LocalStorage persistence & presets
│   ├── styles/
│   │   ├── global.css          # Design tokens, typography & print media queries
│   │   └── app.css             # Component styles & responsive layouts
│   ├── App.tsx                 # Root application component
│   └── main.tsx                # React 19 entry point
├── README.md                   # English documentation
├── README.fa.md                # Persian documentation
├── package.json
└── vite.config.ts
```

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. **Fork** the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Commit your changes: `git commit -m "feat: add my feature"`.
4. Test and verify your build: `npm run build`.
5. Push to the branch: `git push origin feature/my-feature`.
6. Open a **Pull Request**.

---

## 📄 License

This project is open-source and released under the [MIT License](LICENSE).

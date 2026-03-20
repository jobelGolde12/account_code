# Account Code Validation System (CodeMatch System) - Detailed Documentation

## 1. Project Overview
The **Account Code Validation System (CodeMatch)** is a modern, responsive web application designed to solve the common issues associated with manual account code management in spreadsheets, such as Excel. Its primary goal is to provide a single source of truth for account codes and names, ensuring data integrity through automated validation and strict business rules.

### 1.1 Objectives
*   **Centralized Storage:** A robust database for all account codes and names.
*   **Uniqueness Enforcement:** Hard prevention of duplicate account codes.
*   **Automatic Validation:** Eliminating manual mismatch errors by using the account code as the primary key for lookups.
*   **Role-Based Access Control (RBAC):** Admin-only access for data management (CRUD and imports).
*   **Data Cleaning:** Automatic normalization of inputs to ensure consistency.

---

## 2. Technical Stack
*   **Framework:** Next.js 15+ (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Vanilla CSS for custom components)
*   **Database:** Turso (SQLite)
*   **ORM:** Drizzle ORM
*   **Authentication:** Custom Middleware-based RBAC or NextAuth.js
*   **Validation:** Zod
*   **Icons:** Lucide React
*   **Data Handling:** React Server Actions

---

## 3. Project Structure
The project follows the Next.js App Router conventions:

```text
/app
  ├── (auth)
  │   └── login/             # Admin login page
  ├── (dashboard)
  │   ├── layout.tsx         # Dashboard layout (Sidebar + Navbar)
  │   ├── page.tsx           # Main Stats/Overview
  │   ├── accounts/          # Account CRUD management
  │   ├── import/            # Excel/CSV import tool
  │   └── validate/          # Core validation tool (The "Excel Fix")
  ├── api/                   # API routes (if needed)
  ├── layout.tsx             # Root layout
  └── globals.css            # Tailwind & global styles
/components
  ├── ui/                    # Reusable UI components (Buttons, Inputs, Modals)
  ├── Navbar.tsx             # Top navigation
  ├── Sidebar.tsx            # Side navigation
  ├── AccountTable.tsx       # Data table for accounts
  └── AccountForm.tsx        # Add/Edit form
/lib
  ├── db.ts                  # Turso/Drizzle client
  ├── auth.ts                # Auth utilities
  ├── validation.ts          # Zod schemas & cleaning logic
  └── utils.ts               # General utility functions
/drizzle
  ├── schema.ts              # Database schema definition
  └── migrations/            # SQL migration files
```

---

## 4. Database Design
The system uses a single primary table for accounts, with strict constraints to ensure data integrity.

### 4.1 Table: `accounts`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | integer | Primary Key, Auto-increment | Unique identifier |
| `code` | text | UNIQUE, NOT NULL | The account code (e.g., "1010") |
| `account_name` | text | NOT NULL | The descriptive name of the account |
| `created_at` | timestamp | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | timestamp | DEFAULT CURRENT_TIMESTAMP | Record last update time |

---

## 5. Core System Logic

### 5.1 The "Excel Fix" Implementation
The core problem in Excel is that users must manually ensure a code matches a name. This system flips that:
1.  **Input:** User enters an `Account Code`.
2.  **Processing:** System queries the DB for that specific code.
3.  **Output:** 
    *   If found: Return the `Account Name` automatically.
    *   If not found: Display "Invalid Code" error.
*Result: Mismatches are impossible because the system dictates the name based on the code.*

### 5.2 Data Cleaning Logic
Before any insertion or update, text is passed through a `cleanText` utility:
*   **Trim:** Remove leading/trailing whitespace.
*   **Normalize Dashes:** Replace special dashes (–, —) with standard hyphens (-).
*   **Whitespace:** Collapse multiple spaces into a single space.
*   **Invisible Characters:** Strip non-printable characters.

---

## 6. Features & Functionality

### 6.1 Admin Dashboard
*   **Stats Cards:** Display "Total Accounts", "Recent Imports", and "Failed Validation Attempts".
*   **Account Management:** Full CRUD (Create, Read, Update, Delete) with server-side pagination and search.
*   **Import Engine:** 
    *   Supports `.csv` and `.xlsx`.
    *   Parses rows, cleans data, and performs a "bulk upsert" (Update if code exists, insert if new).

### 6.2 Validation Tool
*   A dedicated interface where users can quickly test codes.
*   Real-time feedback as the user types (or on submit).

---

## 7. Authentication & Security
*   **RBAC:** Simple Admin/Guest model.
*   **Middleware:** Protects all `/dashboard/**` routes.
*   **Environment Variables:** `ADMIN_USERNAME` and `ADMIN_PASSWORD` stored securely.
*   **Zod Validation:** Every Server Action validates input shapes before touching the DB.

---

## 8. Implementation Plan

### Phase 1: Foundation (Days 1-2)
1.  Initialize Next.js project with TypeScript and Tailwind.
2.  Set up Turso Database and Drizzle ORM.
3.  Define `accounts` schema and run initial migrations.
4.  Configure `lib/validation.ts` with Zod and cleaning logic.

### Phase 2: Core Infrastructure (Days 3-4)
1.  Implement Authentication Middleware and Login page.
2.  Create the Dashboard Layout (Sidebar + Navbar).
3.  Build the base `AccountTable` with Server Components.

### Phase 3: CRUD & Features (Days 5-7)
1.  Develop `Add/Edit Account` modals with Server Actions.
2.  Implement the `Import Page` with file parsing logic (using `xlsx` or `papaparse`).
3.  Build the `Validation Tool` interface.
4.  Add global search functionality.

### Phase 4: Polish & Testing (Days 8-10)
1.  Add responsive design tweaks for mobile (collapsible sidebar).
2.  Implement Lucide React icons across the UI.
3.  Execute all test cases (Duplicate codes, Invalid lookups, Auth bypass attempts).
4.  Performance optimization (Debouncing search, Paginated queries).

---

## 9. Test Cases
| Case | Input | Expected Result |
| :--- | :--- | :--- |
| Add Unique Code | `9999`, `New Account` | Success, record added to DB |
| Add Duplicate Code | `1010` (existing) | Error: "Code already exists" |
| Search Code | `1010` | Returns "Cash in Bank" |
| Invalid Code Lookup| `0000` | Error: "Account code not found" |
| Import File | CSV with mix of new/old | New added, old updated, duplicates ignored |
| Auth Check | Access `/dashboard` without login | Redirect to `/login` |

---

## 10. Future Improvements (Optional)
*   **Audit Trail:** Log which admin changed which account and when.
*   **Multi-tenant support:** Separate account sets for different departments.
*   **Export Tool:** Export the cleaned master list back to Excel/PDF.

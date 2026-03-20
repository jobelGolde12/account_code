PROJECT DOCUMENTATION
🧾 System Title:

Account Code Validation System (CodeMatch System)

Automated validation and management of account codes and account names

🎯 1. OBJECTIVE

Build a modern, responsive web app that:

Stores account codes + account names

Eliminates duplicate codes

Prevents code-account mismatch

Allows admin-only access (RBAC)

Automatically validates data (like Excel, but smarter)

🧱 2. TECH STACK

Frontend: Next.js (App Router)

Styling: Tailwind CSS

Database: Turso (SQLite)

ORM: Drizzle ORM (recommended for Turso)

Auth: Custom (simple admin login) or NextAuth (optional)

Icons: Lucide React (modern icons)

Validation: Zod

State/Data: Server Actions + React hooks

📁 3. PROJECT STRUCTURE
/app
  /login
  /dashboard
    /accounts
    /import
    /reports
  /api
/components
  Navbar.tsx
  Sidebar.tsx
  AccountTable.tsx
  AccountForm.tsx
/lib
  db.ts
  auth.ts
  validation.ts
/drizzle
  schema.ts
.env
🔐 4. ENVIRONMENT SETUP

Create .env:

TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

👉 You will replace Turso credentials later.

🗄️ 5. DATABASE DESIGN (CRITICAL)
Table: accounts
Column	Type	Description
id	integer (PK)	
code	text (UNIQUE)	
account_name	text	
created_at	timestamp	
✅ IMPORTANT RULES

code MUST be UNIQUE

account_name must be cleaned before insert

No duplicate codes allowed

⚙️ 6. DATA CLEANING LOGIC (EXCEL FIX IMPLEMENTED)

Before saving data:

Normalize function:
- Trim spaces
- Remove hidden characters
- Replace “–” with “-”
- Convert multiple spaces → single space
Example Logic (IMPORTANT)
cleanText(input):
  trim
  replace special dash
  remove invisible chars
🧠 7. CORE SYSTEM LOGIC
🔥 Fixing Your Excel Issue (MAIN FEATURE)
OLD (Excel Problem):

Code + Account Name must match manually ❌

Causes mismatch errors ❌

NEW (System Logic):

👉 ONLY validate using code

Flow:

User inputs code

System fetches account name automatically

System checks:

IF code exists → VALID
ELSE → INVALID
✅ Matching Logic
find account where code = input_code

IF found:
  return account_name
ELSE:
  show error
🔐 8. RBAC (ROLE BASED ACCESS CONTROL)
Roles:

Admin only

Behavior:

Only admin can:

Access dashboard

Add/edit/delete accounts

Import data

View reports

Middleware Protection

Protect /dashboard routes:

IF not logged in → redirect to /login
🔑 9. AUTH SYSTEM
Simple Login (Recommended)

Username & password from .env

Store session in cookies

Login Flow:

User enters credentials

Validate against .env

Set session

Redirect to dashboard

🎨 10. UI DESIGN (MODERN + RESPONSIVE)
Layout:

Sidebar (left)

Navbar (top)

Content (main)

Pages:
🔹 Login Page

Centered card

Clean UI

Input + button

🔹 Dashboard

Stats cards:

Total accounts

Valid codes

Invalid attempts

🔹 Accounts Page

Table:

Code

Account Name

Actions (Edit/Delete)

🔹 Add Account Modal

Input: Code

Input: Account Name

🔹 Import Page

Upload Excel / CSV

Auto-clean data before insert

🎯 11. FEATURES IMPLEMENTATION
✅ 1. Add Account

Validate:

Code must be unique

Account name cleaned

Save to DB

✅ 2. Edit Account

Update name only

Keep code locked (optional)

✅ 3. Delete Account

Confirm dialog

✅ 4. Search

Search by:

Code

Account Name

✅ 5. Code Validation Tool (MAIN FEATURE)

Input:

Enter Code

Output:

✔ Valid → Show account name
❌ Invalid → Show error
📊 12. IMPORT FROM EXCEL (IMPORTANT)
Process:

Upload file

Parse CSV/Excel

Clean data

Remove duplicates

Insert into DB

Duplicate Handling:
IF code exists:
  skip OR update
🧩 13. ICONS (MODERN)

Use Lucide icons:

Dashboard → LayoutDashboard

Accounts → Database

Add → Plus

Delete → Trash

Edit → Pencil

Search → Search

Upload → Upload

🎛️ 14. BUTTONS & INTERACTIONS

Ensure ALL are functional:

Add → opens modal

Edit → loads data

Delete → removes row

Search → filters instantly

Import → uploads + processes

⚡ 15. ERROR HANDLING

Handle:

Duplicate code

Empty inputs

Invalid code lookup

DB errors

📱 16. RESPONSIVENESS

Use Tailwind:

Mobile:

Sidebar collapses

Table scrolls horizontally

Desktop:

Full layout

🚀 17. PERFORMANCE

Use Server Actions

Avoid unnecessary re-renders

Paginate large tables

🧪 18. TEST CASES (IMPORTANT FOR AI)
Must pass:

✔ Add unique code → success
✔ Add duplicate code → error
✔ Search code → correct result
✔ Input invalid code → error
✔ Import file → no duplicates
✔ Login → works
✔ Unauthorized → blocked

🔒 19. SECURITY

Protect API routes

Sanitize inputs

Use server-side validation (Zod)

🧾 20. FINAL RESULT

The system will:

✅ Fix Excel mismatch issue
✅ Remove duplicate codes
✅ Auto-validate codes
✅ Be admin-secured
✅ Be modern and responsive
✅ Fully functional (no dead buttons)

🎯 BONUS (OPTIONAL IMPROVEMENTS)

Export to Excel

Activity logs

Multi-role (future)

Audit trail

✅ FINAL INSTRUCTION FOR YOUR AI AGENT

Build a Next.js (App Router) web application using Tailwind CSS and Turso database with Drizzle ORM. Implement a fully functional Account Code Validation System with admin-only RBAC authentication. Ensure all account codes are unique, all text inputs are cleaned before insertion, and validation is based solely on account code lookup. The UI must be modern, responsive, and all features (CRUD, search, import, validation) must work without bugs. Use Lucide icons and ensure no duplicate logic from Excel remains—only improved system logic.

If you want next, I can:

Generate the actual code (copy-paste ready)

Or create a UI design in Figma style

Or help you connect Turso step-by-step

Just tell me 👍
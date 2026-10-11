# Punjab Attendance & Payroll

**Punjab Attendance & Payroll** is a 100% free, mobile-first Attendance and Payroll Management application designed for every type of organization across Punjab and India, including factories, shops, offices, schools, colleges, restaurants, hospitals, and agencies.

Inspired by PagarBook's clean mobile ergonomics, the application recreates the pale blue top header, white rounded cards, fixed bottom navigation bar, and grouped settings hierarchy while keeping **100% of all features, exports, modules, and calculations free forever** with zero paywalls, zero subscription tiers, and no locked features.

---

## 🚀 Key Features

### 1. Visual Design & Shell (PagarBook-Inspired)
- **Pale blue header** (`#EFF6FF`) with building switcher (`kanishk ⌵`), greeting (`Hello, Kanishk`), and user avatar badge (`KA`).
- **Original informational banner**: Highlights free smart biometric sync, GPS geo punch, and zero fees.
- **3-Column Shortcut Grid**:
  - Staff List
  - Attendance
  - Geo
  - Reports
  - Manage Work
  - Broadcast Messages
  - Notifications
  - My Approvals
  - Payroll Engine
- **Quick Actions Section**:
  - Add Staff
  - Performance Reviews
  - Performance Goals
  - Roster Schedule
- **Fixed Bottom Navigation Bar**:
  - 🏠 Home
  - 👤 Attendance (with notification dot)
  - 📍 Geo (with notification dot)
  - ⚙️ Settings

### 2. Comprehensive Attendance Engine
- Date switcher with calendar navigation & "Today" shortcut.
- Fast status buttons: **Present (P)**, **Absent (A)**, **Half-Day (HD)**, **Paid Leave (L)**, **Weekly Off (WO)**, and **Holiday (HO)**.
- Overnight shift handling (e.g. 8 PM to 5 AM next day) with cross-midnight hour calculation.
- Detailed punch editor: check-in, check-out, late minutes, overtime hours, and punch remarks.
- One-click **"Mark All Present"** bulk attendance tool.
- Duplicate attendance prevention at the database level (`[businessId, employeeId, date]` composite unique constraint).

### 3. Multi-Compensation Employee Management
- Supports all 5 compensation structures:
  1. **Monthly Fixed Salary** (with configurable Basic, HRA, EPF, ESI, and OT rates)
  2. **Daily Wage** (e.g. ₹850/day)
  3. **Hourly Wage** (e.g. ₹150/hr)
  4. **Weekly Wage**
  5. **Piece-Rate Compensation** (work units & rate cards)
- Staff profile tabs: Overview, Salary Structure, Attendance History, and Salary Advances.
- Employee search, filtering by department, and wage-type tabs.

### 4. Decimal-Safe 12-Step Payroll Engine
- Reconciles payable days (`P + 0.5*HD + Leave + WO + Holiday`).
- Calculates base salary, piece-rate earnings from daily work logs, and overtime pay.
- Deducts employee EPF (12%), ESI (0.75%), professional tax, and automated salary advance recovery.
- Approve & lock payroll cycle to prevent changes once reviewed.
- Separate **"Record Payment"** workflow with Bank Transfer (NEFT/IMPS), UPI, Cash, and Cheque options.
- Printable, itemized digital **Payslip** breakdown.

### 5. Geo-Fencing & Workplace Location Verification
- GPS location detection with Haversine distance formula against authorized branch coordinates.
- Geofence verification badge (`Inside Allowed Radius` vs `Outside Premises`).
- Offline punch queuing with safe synchronization when back online.

### 6. Grouped Settings Layout with Live Search
- Real-time search filtering across all settings items.
- Grouped cards:
  - **Attendance Setting**: Attendance Templates, Automation Rules, Weekly Holiday, HO/WO Rules, Shifts Templates, Leave Policy.
  - **Salary Settings**: Work Rate Card, Daily Work Entry, Salary Structures, Payroll Rules, Overtime Policy.
  - **Business Settings**: Departments, KYB Verification (Pre-approved 100% Free), Business Name, Bank Account, Statement Name, Logo & Address.
  - **Organisation Settings**: Roles & Permissions, Manage Users, Admin Setting, Multi-Business Switcher.
  - **Profile / Personal Info**: Name, Phone, Email, PIN App Lock.
  - **Other**: CashBook (Income/Expense Ledger), Hire Staff (WhatsApp Job Poster Generator), Alarms, Language Switcher, Logout.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS, Lucide Icons, Vite PWA
- **Mobile Packaging**: Capacitor 6 (Android native project ready)
- **Backend**: Node.js, Express, TypeScript, tsx watch
- **Database & ORM**: MySQL (XAMPP on port 3306), Prisma ORM 5.22
- **Authentication**: JWT authentication with bcrypt password hashing and multi-tenant business context isolation

---

## 📦 Project Structure

```
Punjabi attendance/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Relational models (20+ entities)
│   │   └── seed.ts             # Realistic multi-industry demo data
│   ├── src/
│   │   ├── controllers/        # REST API controllers
│   │   ├── middleware/         # JWT auth & x-business-id context
│   │   ├── routes/             # Express API routes
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── index.ts            # Server entry point
│   ├── .env                    # MySQL DATABASE_URL & JWT_SECRET
│   └── package.json
├── frontend/
│   ├── android/                # Native Capacitor Android project
│   ├── src/
│   │   ├── components/         # TopHeader, BottomNav, InfoBanner
│   │   │   └── modals/         # 14 functional sub-screens & dialogs
│   │   ├── pages/              # HomeScreen, AttendanceScreen, GeoScreen, SettingsScreen, AuthScreen
│   │   ├── services/           # api.ts with offline punch queue
│   │   ├── types/              # TypeScript interface models
│   │   ├── App.tsx             # Main view and navigation shell
│   │   └── main.tsx
│   ├── capacitor.config.ts     # Capacitor configuration for Android
│   ├── vite.config.ts          # Vite configuration with PWA & proxy
│   └── tailwind.config.js      # Reference brand color tokens
├── README.md
└── package.json                # Root convenience scripts
```

---

## 🏃 Running the Application

### 1. Database (MySQL via XAMPP)
Ensure MySQL is running on `127.0.0.1:3306`. The database `punjab_attendance` has already been created and migrated.
If you ever want to re-seed demo data:
```bash
npm run db:seed
```

### 2. Backend Server
```bash
npm run start:backend
```
The API starts on `http://localhost:5000`. Health check endpoint: `http://localhost:5000/api/health`.

### 3. Frontend Web & PWA
```bash
npm run start:frontend
```
Open `http://localhost:3000` in your mobile or desktop browser.

### 4. Default Seeded Credentials
- **Email**: `kp@gmail.com` (or Phone: `7891012005`)
- **Password**: `password123`
- *Note*: The frontend automatically connects with the demo account for instant review.

---

## 📱 Building the Android APK (Capacitor)

The Android native project is already configured in `frontend/android`.

### Step-by-Step APK Build Instructions:

1. **Build frontend assets**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Sync web build to Android project**:
   ```bash
   npx cap sync android
   ```

3. **Open Android Studio to generate APK**:
   ```bash
   npx cap open android
   ```
   In Android Studio:
   - Click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - The generated debug APK will be located at:
     `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

4. **Command-Line APK Build (Without Android Studio GUI)**:
   If Android SDK and Gradle are installed in your PATH:
   ```bash
   cd frontend/android
   ./gradlew assembleDebug
   ```

---

## 🌟 100% Free Product Guarantee
- Zero subscription paywalls or premium crowns
- Unlimited staff members and branches
- Unlimited attendance records and GPS check-ins
- Free payroll computations and itemized payslip downloads
- Free CSV reports export (Daily Attendance, Muster Roll, CashBook, Salary Register)

# Feature Comparison: Flutter App vs Next.js App

## Executive Summary
The Flutter dental clinic app (`Z:\frontend`) has several features that need to be replicated in the Next.js application. This document outlines the feature gaps and provides a detailed implementation plan.

---

## Feature Comparison Matrix

| Feature | Flutter App | Next.js App | Status |
|---------|-------------|-------------|--------|
| **Authentication** | | | |
| Login with email/password | ✅ | ✅ | Done |
| Biometric authentication | ✅ | ❌ | Missing |
| JWT session management | ✅ | ⚠️ | Partial |
| **Dashboard** | | | |
| Stats overview (patients, appointments) | ✅ | ✅ | Done |
| Quick actions (Register, Schedule, Check-in) | ✅ | ✅ | Done |
| Recent patients list | ✅ | ✅ | Done |
| Today's appointments | ✅ | ✅ | Done |
| **Patients Module** | | | |
| Patient list with search/filter | ✅ | ✅ | Done |
| Patient registration form | ✅ | ✅ | Done |
| Face capture during registration | ✅ | ❌ | Missing |
| QR code generation | ✅ | ⚠️ | Partial |
| Patient detail view | ✅ | ✅ | Done |
| Patient history (payments) | ✅ | ❌ | Missing |
| Edit patient | ✅ | ❌ | Missing |
| **Appointments Module** | | | |
| Appointment list (calendar view) | ✅ | ✅ | Done |
| Date picker/selector | ✅ | ✅ | Done |
| Create new appointment | ✅ | ✅ | Done |
| Appointment status management | ✅ | ✅ | Done |
| Appointment details modal | ✅ | ✅ | Done |
| Edit appointment | ✅ | ❌ | Missing |
| **Check-in Module** | | | |
| QR code scanning | ✅ | ✅ | Done |
| Face recognition scanning | ✅ | ⚠️ | Partial |
| Manual search | ✅ | ✅ | Done |
| Check-in action | ✅ | ✅ | Done |
| **Settings Module** | | | |
| Profile section with edit | ✅ | ❌ | Missing |
| Dark mode toggle | ✅ | ❌ | Missing |
| Notification settings | ✅ | ✅ | Done |
| Sync data | ✅ | ❌ | Missing |
| Change password | ✅ | ❌ | Missing |
| Biometric settings | ✅ | ❌ | Missing |
| Logout | ✅ | ❌ | Missing |
| **UI/UX** | | | |
| Material Design 3 | ✅ | ⚠️ | Partial |
| Bottom navigation | ✅ | ⚠️ | Sidebar |
| Pull to refresh | ✅ | ❌ | Missing |
| Loading animations | ✅ | ✅ | Done |
| Error handling | ✅ | ✅ | Done |

---

## Detailed Implementation Plan

### Phase 1: Core Enhancements (High Priority)

#### 1.1 Patient History/Payment Tracking
**Location:** `/dashboard/patients/[id]/page.tsx`

**Flutter Feature:** `PatientHistoryList` widget shows payment history with balance tracking

**Implementation:**
- Create payment history component for patient detail page
- Add payment/receipt data model
- Display transaction history with debits/credits
- Show running balance
- Add payment status indicators (paid, partial, pending, overdue)

```typescript
// Required types
interface PaymentModel {
  id: string;
  patientId: string;
  appointmentNo: string;
  date: DateTime;
  time: string;
  description: string;
  type: 'debit' | 'credit';
  debit: number;
  credit: number;
  balance: number;
  status: PaymentStatus;
  creditDate?: DateTime;
}
```

#### 1.2 Face Capture During Patient Registration
**Location:** `/dashboard/patients/new/page.tsx`

**Flutter Feature:** Camera-based face capture with MLKit face detection

**Implementation:**
- Add camera capture component
- Integrate face detection (use face-api.js or similar)
- Extract face template/embedding
- Store face template with patient record
- Generate QR code after registration

**Dependencies needed:**
- `face-api.js` or `@vladmandic/face-api`

#### 1.3 Settings Page Enhancement
**Location:** Create `/dashboard/settings/page.tsx`

**Flutter Features:**
- Profile section with editable name
- Dark mode toggle (ThemeBloc)
- Sync data functionality
- Change password dialog
- Biometric settings
- Logout functionality

**Implementation:**
- Create comprehensive settings page
- Add theme context/provider for dark mode
- Implement profile editing
- Add logout functionality
- Add change password flow

---

### Phase 2: Advanced Features (Medium Priority)

#### 2.1 Edit Patient Functionality
**Location:** `/dashboard/patients/[id]/edit/page.tsx`

**Flutter Feature:** Edit patient information

**Implementation:**
- Create edit patient page
- Pre-populate form with existing data
- Handle form validation
- Update patient record

#### 2.2 Edit Appointment Functionality
**Location:** `/dashboard/appointments/[id]/edit/page.tsx` or modal

**Flutter Feature:** Edit appointment from list

**Implementation:**
- Add edit button to appointment cards
- Create appointment edit modal/page
- Allow changing date, time, status, notes

#### 2.3 Enhanced Face Recognition
**Location:** `/dashboard/checkin/page.tsx`

**Flutter Feature:** Full face recognition with MLKit

**Current state:** Partial implementation using canvas capture

**Implementation:**
- Integrate proper face detection library
- Match captured face against stored templates
- Display match/no-match results

---

### Phase 3: Security & Authentication (Lower Priority)

#### 3.1 Biometric Authentication
**Flutter Feature:** BiometricService using local_auth

**Web Alternative:**
- WebAuthn/FIDO2 for fingerprint/face
- OR use simple PIN as alternative to password

#### 3.2 Change Password
**Flutter Feature:** `_showChangePasswordDialog` in settings

**Implementation:**
- Add change password form
- Validate current password
- Update password via API

---

## Missing Dependencies

### NPM Packages to Install
```json
{
  "face-api.js": "^0.22.2",
  "@types/face-api.js": "^0.22.2"
}
```

---

## File Structure Updates

### New Files to Create
1. `/src/app/dashboard/settings/page.tsx` - Main settings page
2. `/src/app/dashboard/patients/[id]/edit/page.tsx` - Edit patient
3. `/src/app/dashboard/appointments/[id]/edit/page.tsx` - Edit appointment
4. `/src/components/patient/payment-history.tsx` - Payment history component
5. `/src/components/face-capture.tsx` - Face capture component
6. `/src/lib/types/payment.ts` - Payment types
7. `/src/context/ThemeContext.tsx` - Theme context for dark mode

### Files to Modify
1. `/src/app/dashboard/patients/[id]/page.tsx` - Add payment history
2. `/src/app/dashboard/patients/new/page.tsx` - Add face capture
3. `/src/app/dashboard/appointments/page.tsx` - Add edit functionality
4. `/src/app/dashboard/checkin/page.tsx` - Enhance face recognition

---

## Implementation Priority

### Priority 1 (Start Here)
1. Payment history component in patient detail
2. Settings page with profile, dark mode, logout
3. Face capture in patient registration

### Priority 2
4. Edit patient functionality
5. Edit appointment functionality
6. Enhanced face recognition in check-in

### Priority 3
7. Biometric/password change
8. Data sync functionality

---

## Notes

- The Flutter app uses GetIt for dependency injection; Next.js uses React Context
- Flutter uses BLoC pattern; Next.js uses simpler state management
- Material Design 3 is implemented in both - maintain consistency
- The mock data service should be updated to include payment history data
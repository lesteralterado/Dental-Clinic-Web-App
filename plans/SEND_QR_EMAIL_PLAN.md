# Plan: Implement "Send QR via Email" Button Functionality

## Task Overview
After the Patient Registration is complete, the "Send QR via Email" button should show proper user feedback (loading state and success message) instead of doing nothing.

## Current Implementation
The button exists in the UI but the mock service just logs to console:
```typescript
async sendQREmail(_id: string, _email: string): Promise<void> {
  // For demo, simulate sending email
  console.log('QR Email sent (demo mode)');
}
```

## Required Changes

### 1. Update Mock Service (`src/lib/mock/patients.ts`)
- Add a realistic delay (1-2 seconds) to simulate email sending
- Return proper Promise<void> to enable loading states

### 2. Update Patient Add Page (`src/app/dashboard/patients/add/page.tsx`)
- Add `sendingEmail` state variable
- Show loading spinner on button while sending
- Add success feedback (disable button after sending)
- Handle potential errors gracefully

### 3. Update Patient New Page (`src/app/dashboard/patients/new/page.tsx`)
- Apply same improvements as add page

### 4. Verify Patient Detail Page (`src/app/dashboard/patients/[id]/page.tsx`)
- Already has `sendingEmail` and `emailSent` states - verify it works correctly

## UI States Implementation

| State | Button Display |
|-------|-----------------|
| Default | "Send QR via Email" with Send icon |
| Loading | "Sending..." with spinner, disabled |
| Sent | Show success indicator or change to "Sent ✓" |

## Files to Modify

1. `src/lib/mock/patients.ts` - Update sendQREmail function
2. `src/app/dashboard/patients/add/page.tsx` - Add loading/success states
3. `src/app/dashboard/patients/new/page.tsx` - Add loading/success states

## Notes
- This is a simulated demo (no real emails)
- No external APIs or services required
- Frontend-only implementation
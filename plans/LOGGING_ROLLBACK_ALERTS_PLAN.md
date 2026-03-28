# Logging, Rollback Strategy & Alerts Implementation Plan

## Overview
This document outlines the implementation plan for three critical backend features: enhanced audit logging, database transaction rollback strategy, and system alerts.

---

## 1. Enhanced Audit Logging

### Current State
- Basic Winston logging exists (`backend/src/utils/logger.ts`)
- Logs are written to `logs/error.log` and `logs/combined.log`
- Basic timestamp and level tracking

### Requirements
- **Audit Logging**: Track all CRUD operations on sensitive resources (patients, appointments, payments)
- **User Context**: Include user ID, role, IP address in each log entry
- **Resource Tracking**: Track resource type, ID, action, and changes
- **Correlation IDs**: Link related operations across services

### Implementation
- Create `backend/src/utils/auditLogger.ts` - specialized audit logger
- Create `backend/src/middleware/auditMiddleware.ts` - request/response audit
- Integrate audit logging into services (patientService, appointmentService, paymentService)

### File Structure
```
backend/src/utils/
  ├── logger.ts          (existing)
  ├── auditLogger.ts     (new - audit-specific logging)
  └── ...

backend/src/middleware/
  ├── auditMiddleware.ts  (new - request/response audit)
  └── ...

backend/src/services/
  ├── appointmentService.ts  (add transaction support)
  ├── patientService.ts     (add transaction support)
  └── transactionManager.ts (new - rollback infrastructure)
```

---

## 2. Rollback Strategy

### Current State
- Services perform multiple database operations without transaction protection
- Example: appointment creation updates both Appointment and Patient documents
- If second operation fails, data becomes inconsistent

### Requirements
- **Transaction Manager**: Wrapper around MongoDB transactions
- **Automatic Rollback**: Automatically rollback on any operation failure
- **Multi-Step Operations**: Support complex operations that span multiple documents/collections
- **Retry Logic**: Handle transient failures with automatic retries

### Implementation
- Create `backend/src/utils/transactionManager.ts`
  - `withTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T>`
  - Automatic session management
  - Built-in retry logic for transient errors
- Update services to use transaction manager for multi-step operations

### Operations Requiring Transactions
1. **Appointment Creation**
   - Create appointment document
   - Update patient's last visit status
   - Send notification (if applicable)

2. **Appointment Check-in**
   - Update appointment status
   - Create payment record
   - Update patient status

3. **Patient Deletion**
   - Delete patient
   - Delete related appointments
   - Delete related payments

---

## 3. Alert System

### Current State
- Basic logging to files
- No proactive alerting
- No system health monitoring

### Requirements
- **Health Monitoring**: Monitor CPU, memory, database connection
- **Error Alerts**: Trigger alerts on critical errors
- **Configurable Channels**: Support email, Slack, in-app notifications
- **Alert Levels**: Info, Warning, Error, Critical

### Implementation

#### Alert Service (`backend/src/services/alertService.ts`)
- Monitor system health (check every 5 minutes)
- Track error rates
- Send alerts via configured channels

#### Health Checks
- Database connection status
- Memory usage (>80% warning, >90% critical)
- CPU usage (>80% warning, >90% critical)
- Error rate threshold

#### Alert Channels (Pluggable)
1. **Log Alert** - Write to special alerts log file
2. **Email Alert** - Send email (via existing nodemailer)
3. **In-App Alert** - Create notification in system

### Configuration
```env
# Alerts Configuration
ALERT_ENABLED=true
ALERT_EMAIL_RECIPIENTS=admin@dentalclinic.com
ALERT_EMAIL_ENABLED=false
ALERT_SLACK_WEBHOOK_URL=
ALERT_ERROR_THRESHOLD=10  # errors per minute
ALERT_MEMORY_THRESHOLD=80  # percentage
```

---

## Implementation Order

### Phase 1: Transaction Manager (Rollback)
1. Create `transactionManager.ts`
2. Update `appointmentService.ts` to use transactions
3. Test rollback scenarios

### Phase 2: Enhanced Audit Logging
1. Create `auditLogger.ts`
2. Create `auditMiddleware.ts`
3. Integrate into key services
4. Add audit log endpoint for admin review

### Phase 3: Alert System
1. Create `alertService.ts`
2. Add health monitoring to server startup
3. Configure alert channels
4. Integrate error handling to trigger alerts

---

## Dependencies
- `winston` (already installed)
- `mongoose` (already installed - supports transactions)
- `nodemailer` (already installed - can use for email alerts)

---

## Testing Checklist
- [ ] Test transaction rollback on failure
- [ ] Verify audit logs capture all operations
- [ ] Test health monitoring alerts trigger correctly
- [ ] Verify graceful shutdown with transaction completion

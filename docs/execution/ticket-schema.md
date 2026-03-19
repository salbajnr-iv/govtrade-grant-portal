# Standard Ticket Schema

Use this schema for **every** ticket on the master board.

## Required custom fields

1. **Owner (DRI)**  
   Single accountable owner for delivery and status updates.
2. **Dependency (ticket ID(s)/team/external)**  
   Upstream dependencies with owner team and current status.
3. **Acceptance Criteria (testable statements)**  
   Objective conditions required for completion and verification.
4. **Legal/Compliance Impact (None/Low/High + reviewer)**  
   Compliance risk level with named reviewer when impact is not None.
5. **Telemetry Impact (events added/changed)**  
   Event names affected, instrumentation owner, and verification note.
6. **Rollback Impact (revert path + risk)**  
   Explicit rollback procedure, prerequisites, and residual risk.

## Recommended additional fields

- **Phase**
- **Gate linkage** (example: `Gate P2->P3`)
- **Risk ID** (linked to risk register)

## Ticket template snippet

```md
### Required fields

- Owner (DRI):
- Dependency (ticket ID(s)/team/external):
- Acceptance Criteria (testable statements):
- Legal/Compliance Impact (None/Low/High + reviewer):
- Telemetry Impact (events added/changed):
- Rollback Impact (revert path + risk):

### Recommended fields

- Phase:
- Gate linkage:
- Risk ID:
```

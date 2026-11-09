# SupportDesk Database Design Notes

## 1. Entities

### User
- name
- email
- passwordHash
- role

### Ticket
- title
- description
- status
- priority
- category
- assignee
- slaDueTime

### Comment
- ticket
- author
- body
- isInternal

### Tag
- name

### Attachment
- ticket
- fileName
- filePath

### AuditLog
- actor
- action
- target
- timestamp

## 2. Primary Key Candidates
- User: id
- Ticket: id
- Comment: id
- Tag: id
- Attachment: id
- AuditLog: id

## 3. Relationships
- One User can create many Tickets.
- One User can be assigned many Tickets.
- One Ticket can have many Comments.
- One User can write many Comments.
- Tickets and Tags can have a many-to-many relationship.
- One Ticket can have many Attachments.
- One User can create many AuditLogs.

## 4. Enums
- UserRole: customer, agent, admin
- TicketStatus: open, in_progress, waiting_on_customer, resolved, closed
- TicketPriority: P1, P2, P3, P4

## 5. Open Questions
- Can a ticket have multiple assignees?
- Can a ticket have multiple attachments?
- Should comments be editable?
- What is the required SLA rule for each priority?
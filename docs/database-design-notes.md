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
## 6. Index Decisions

| Query / Use Case | Indexed Field | Reason |
|---|---|---|
| Filter tickets by status | Ticket.status | Helps find tickets with a particular status. |
| Filter tickets by priority | Ticket.priority | Helps find tickets based on priority level. |
| List tickets assigned to an agent | Ticket.assigneeId | Helps find tickets assigned to a specific agent. |
| List tickets created by a user | Ticket.creatorId | Helps find tickets created by a specific customer. |

### Unique Constraints
- User.email is unique to prevent duplicate user email addresses.
- Tag.name is unique to prevent duplicate tag names.
- TicketTag uses a composite primary key (ticketId, tagId) to prevent duplicate ticket-tag relationships.

### Index Trade-offs
- Indexes require additional storage.
- Indexes can improve read and search performance.
- Indexes may add overhead to insert, update, and delete operations.
- Only indexes that support expected application queries should be maintained.

## 7. AI Schema Review

### Reviewed Design Decisions
- Accepted separate User, Ticket, Comment, Tag, Attachment, and AuditLog models because they represent the core SupportDesk entities.
- Accepted TicketTag as a join model to represent the many-to-many relationship between tickets and tags.
- Accepted enums for UserRole, TicketStatus, and TicketPriority to restrict values to the defined options.
- Accepted unique constraints on User.email and Tag.name.
- Accepted indexes on Ticket.status, Ticket.priority, Ticket.assigneeId, and Ticket.creatorId to support ticket filtering and lookup.

### Open Questions
- Can a ticket have multiple assignees?
- Can a ticket have multiple attachments?
- Should comments be editable?
- What is the required SLA rule for each priority?

Note: These are documented design decisions based on the current Prisma schema. Further changes should be confirmed against the PRD and lead's guidance.

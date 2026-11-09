# SupportDesk Database ER Diagram

This diagram represents the database structure of the SupportDesk project.

```mermaid
erDiagram
    User ||--o{ Ticket : creates
    User ||--o{ Ticket : assigned_to
    User ||--o{ Comment : writes
    User ||--o{ AuditLog : performs

    Ticket ||--o{ Comment : has
    Ticket ||--o{ Attachment : contains
    Ticket ||--o{ TicketTag : has
    Tag ||--o{ TicketTag : assigned_to

    User {
        int id PK
        string name
        string email UK
        string passwordHash
        enum role
    }

    Ticket {
        int id PK
        string title
        string description
        enum status
        enum priority
        string category
        datetime slaDueTime
        int creatorId FK
        int assigneeId FK
    }

    Comment {
        int id PK
        string body
        boolean isInternal
        int ticketId FK
        int authorId FK
    }

    Tag {
        int id PK
        string name UK
    }

    TicketTag {
        int ticketId PK, FK
        int tagId PK, FK
    }

    Attachment {
        int id PK
        string fileName
        string filePath
        int ticketId FK
    }

    AuditLog {
        int id PK
        string action
        string targetType
        int targetId
        datetime timestamp
        int actorId FK
    }
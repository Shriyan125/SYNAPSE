# Synapse Database Entity-Relationship Diagram

This document illustrates the complete relational database design for **Synapse**, an enterprise-grade appointment management platform. The schema is implemented directly in PostgreSQL 16 using native constraints, foreign keys, cascading rules, and partial indexes without any ORM abstraction layer.

## Mermaid Crow's Foot ER Diagram

```mermaid
erDiagram
    USERS ||--o| PROVIDERS : "is registered as"
    USERS ||--o{ REFRESH_TOKENS : "owns"
    USERS ||--o{ APPOINTMENTS : "books"
    USERS ||--o{ NOTIFICATIONS : "receives"

    PROVIDERS ||--o{ PROVIDER_SERVICES : "offers"
    SERVICES ||--o{ PROVIDER_SERVICES : "is offered by"

    PROVIDERS ||--o{ AVAILABILITY_SLOTS : "schedules"
    PROVIDERS ||--o{ APPOINTMENTS : "conducts"

    SERVICES ||--o{ APPOINTMENTS : "booked for"
    AVAILABILITY_SLOTS ||--o| APPOINTMENTS : "allocates"
    APPOINTMENTS ||--o{ NOTIFICATIONS : "triggers"

    USERS {
        int id PK
        string full_name
        string email UK
        string password_hash
        string role "user | provider | admin"
        string phone
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }

    REFRESH_TOKENS {
        int id PK
        int user_id FK
        string token_hash UK
        timestamptz expires_at
        timestamptz revoked_at
        timestamptz created_at
    }

    PROVIDERS {
        int id PK
        int user_id FK, UK
        text bio
        string specialty
        int experience_years
        numeric consultation_fee
        numeric rating
        timestamptz created_at
        timestamptz updated_at
    }

    SERVICES {
        int id PK
        string name
        text description
        int duration_minutes
        numeric price
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    PROVIDER_SERVICES {
        int id PK
        int provider_id FK
        int service_id FK
        timestamptz created_at
    }

    AVAILABILITY_SLOTS {
        int id PK
        int provider_id FK
        timestamptz start_time
        timestamptz end_time
        boolean is_booked
        timestamptz created_at
        timestamptz updated_at
    }

    APPOINTMENTS {
        int id PK
        int user_id FK
        int provider_id FK
        int service_id FK
        int slot_id FK
        string status "booked | cancelled | completed"
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        int appointment_id FK
        string type
        timestamptz sent_at
        jsonb metadata
    }
```

## Key Relational Integrity Constraints
1. **User Identity & Roles**: `users.email` is strictly `UNIQUE`. Role is constrained by `CHECK (role IN ('user', 'provider', 'admin'))`.
2. **Provider One-to-One Profile**: `providers.user_id` has a `UNIQUE` constraint referencing `users.id`, preventing duplicate provider profiles per user.
3. **Many-to-Many Provider-Services**: Junction table `provider_services` enforces `UNIQUE(provider_id, service_id)` with `ON DELETE CASCADE`.
4. **Slot Chronological Validity**: `availability_slots` enforces `CHECK (end_time > start_time)`.
5. **Concurrency & Double-Booking Prevention**:
   - `appointments` maintains a **Partial Unique Index** on `slot_id` for active reservations:
     ```sql
     CREATE UNIQUE INDEX uq_active_slot_booking ON appointments(slot_id) WHERE status = 'booked';
     ```
   - This ensures at the database engine level that no two active appointments can point to the same availability slot, even under concurrent write conditions.
6. **Notification Deduplication**: `notifications` enforces `UNIQUE (appointment_id, type)` so automated cron workers never send duplicate reminders for the same window.

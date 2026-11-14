# Synapse Data Dictionary

This document details the database schema for the Synapse Appointment Management System. All tables and columns are defined in PostgreSQL 16 using standard data types, constraints, and relational rules.

---

## 1. Table: `users`
Stores registered account credentials, contact info, and role designations for all actors in the platform.

| Column | Type | Nullable | Default | Constraints & Keys | Description |
|---|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-increment | `PRIMARY KEY` | Unique identifier for each user |
| `full_name` | `VARCHAR(100)` | No | None | None | User's complete legal name |
| `email` | `VARCHAR(255)` | No | None | `UNIQUE` | Email address used for authentication |
| `password_hash` | `VARCHAR(255)` | No | None | None | Salted bcrypt hash of user password |
| `role` | `VARCHAR(20)` | No | `'user'` | `CHECK (role IN ('user', 'provider', 'admin'))` | Access-control role for authorization |
| `phone` | `VARCHAR(30)` | Yes | `NULL` | None | Contact telephone number |
| `avatar_url` | `TEXT` | Yes | `NULL` | None | URL to profile avatar image |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Timestamp of account registration |
| `updated_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Timestamp of last account update |

---

## 2. Table: `refresh_tokens`
Stores cryptographic hashes of active refresh tokens for JWT session rotation and revocation.

| Column | Type | Nullable | Default | Constraints & Keys | Description |
|---|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-increment | `PRIMARY KEY` | Unique token record ID |
| `user_id` | `INTEGER` | No | None | `FOREIGN KEY (users.id) ON DELETE CASCADE` | Associated user |
| `token_hash` | `VARCHAR(255)` | No | None | `UNIQUE` | SHA-256 / bcrypt hash of issued refresh token |
| `expires_at` | `TIMESTAMPTZ` | No | None | None | Exact expiration timestamp (7 days) |
| `revoked_at` | `TIMESTAMPTZ` | Yes | `NULL` | None | Timestamp when token was manually revoked/logged out |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Timestamp when token was issued |

---

## 3. Table: `providers`
Stores professional profiles for medical/service providers linked directly to a base user account.

| Column | Type | Nullable | Default | Constraints & Keys | Description |
|---|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-increment | `PRIMARY KEY` | Unique provider ID |
| `user_id` | `INTEGER` | No | None | `UNIQUE, FOREIGN KEY (users.id) ON DELETE CASCADE` | Link to user record |
| `bio` | `TEXT` | Yes | `NULL` | None | Professional biography & credentials |
| `specialty` | `VARCHAR(100)` | No | None | None | Medical or practice specialty (e.g. Cardiology) |
| `experience_years` | `INTEGER` | No | `0` | `CHECK (experience_years >= 0)` | Years in active practice |
| `consultation_fee` | `NUMERIC(10,2)` | No | `0.00` | `CHECK (consultation_fee >= 0)` | Base consultation fee in USD |
| `rating` | `NUMERIC(3,2)` | No | `5.00` | `CHECK (rating >= 0 AND rating <= 5.00)` | Average patient feedback rating (0.00 - 5.00) |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Profile creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Profile modification timestamp |

---

## 4. Table: `services`
Stores the catalog of bookable healthcare and medical services.

| Column | Type | Nullable | Default | Constraints & Keys | Description |
|---|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-increment | `PRIMARY KEY` | Unique service ID |
| `name` | `VARCHAR(100)` | No | None | None | Name of the service |
| `description` | `TEXT` | Yes | `NULL` | None | Comprehensive description of what is included |
| `duration_minutes`| `INTEGER` | No | None | `CHECK (duration_minutes > 0)` | Standard appointment duration in minutes |
| `price` | `NUMERIC(10,2)` | No | None | `CHECK (price >= 0)` | Service list price in USD |
| `is_active` | `BOOLEAN` | No | `true` | None | Whether the service is currently bookable |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Service registration timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Service modification timestamp |

---

## 5. Table: `provider_services`
Many-to-many junction table associating providers with the specific services they are qualified to perform.

| Column | Type | Nullable | Default | Constraints & Keys | Description |
|---|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-increment | `PRIMARY KEY` | Unique mapping record ID |
| `provider_id` | `INTEGER` | No | None | `FOREIGN KEY (providers.id) ON DELETE CASCADE` | Associated provider |
| `service_id` | `INTEGER` | No | None | `FOREIGN KEY (services.id) ON DELETE CASCADE` | Associated service |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Record creation timestamp |

*Table Constraint*: `CONSTRAINT uq_provider_service UNIQUE (provider_id, service_id)`

---

## 6. Table: `availability_slots`
Stores scheduled calendar time intervals created by providers that patients can book.

| Column | Type | Nullable | Default | Constraints & Keys | Description |
|---|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-increment | `PRIMARY KEY` | Unique availability slot ID |
| `provider_id` | `INTEGER` | No | None | `FOREIGN KEY (providers.id) ON DELETE CASCADE` | Provider opening this time slot |
| `start_time` | `TIMESTAMPTZ` | No | None | None | Starting time of the appointment window |
| `end_time` | `TIMESTAMPTZ` | No | None | `CHECK (end_time > start_time)` | Ending time of the appointment window |
| `is_booked` | `BOOLEAN` | No | `false` | None | Flag indicating if slot is reserved |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Last update timestamp |

---

## 7. Table: `appointments`
Represents booked consultations linking users, providers, services, and allocated availability slots.

| Column | Type | Nullable | Default | Constraints & Keys | Description |
|---|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-increment | `PRIMARY KEY` | Unique appointment ID |
| `user_id` | `INTEGER` | No | None | `FOREIGN KEY (users.id) ON DELETE CASCADE` | Patient who booked the appointment |
| `provider_id` | `INTEGER` | No | None | `FOREIGN KEY (providers.id) ON DELETE CASCADE` | Provider attending the consultation |
| `service_id` | `INTEGER` | No | None | `FOREIGN KEY (services.id) ON DELETE RESTRICT` | Booked clinical service |
| `slot_id` | `INTEGER` | No | None | `FOREIGN KEY (availability_slots.id) ON DELETE RESTRICT` | Reserved availability slot |
| `status` | `VARCHAR(20)` | No | `'booked'` | `CHECK (status IN ('booked', 'cancelled', 'completed'))` | Current lifecycle state |
| `notes` | `TEXT` | Yes | `NULL` | None | Patient notes or reason for visit |
| `created_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Date and time booking was created |
| `updated_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Date and time booking was last changed |

*Partial Index*: `CREATE UNIQUE INDEX uq_active_slot_booking ON appointments(slot_id) WHERE status = 'booked';`
Guarantees double-booking cannot occur even under race conditions.

---

## 8. Table: `notifications`
Audit and delivery tracking log for transactional emails and scheduled reminder dispatches.

| Column | Type | Nullable | Default | Constraints & Keys | Description |
|---|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-increment | `PRIMARY KEY` | Unique notification ID |
| `user_id` | `INTEGER` | No | None | `FOREIGN KEY (users.id) ON DELETE CASCADE` | Recipient user |
| `appointment_id` | `INTEGER` | No | None | `FOREIGN KEY (appointments.id) ON DELETE CASCADE` | Related appointment |
| `type` | `VARCHAR(50)` | No | None | `CHECK (type IN ('reminder_24h', 'reminder_1h', 'booking_confirmed', 'rescheduled', 'cancelled'))` | Trigger event classification |
| `sent_at` | `TIMESTAMPTZ` | No | `CURRENT_TIMESTAMP` | None | Timestamp dispatch was verified |
| `metadata` | `JSONB` | Yes | `'{}'::jsonb` | None | Additional delivery payload details |

*Table Constraint*: `CONSTRAINT uq_appointment_notification UNIQUE (appointment_id, type)`
Prevents sending redundant reminders.

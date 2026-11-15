# Synapse SQL Query Catalog

This document catalogues real, production-ready PostgreSQL queries executed across the Synapse application layers. Hand-crafted SQL is maintained in `src/repositories/*` with parameterized input sanitization (`$1`, `$2`, ...) to protect against SQL injection vulnerabilities.

---

### Query 1: Fetch Appointment Details with Provider, Service, and Slot Info (Multiple INNER JOINs)
- **Feature**: Patient / Provider Appointment Details & Cards (`GET /api/v1/appointments/:id`)
- **Repository**: `src/repositories/appointment.repository.js`
- **Description**: Joins the core appointment entity with provider profile, provider user account, service details, and the assigned availability slot.

```sql
SELECT 
    a.id,
    a.user_id,
    a.provider_id,
    a.service_id,
    a.slot_id,
    a.status,
    a.notes,
    a.created_at,
    a.updated_at,
    u_prov.full_name AS provider_name,
    u_prov.email AS provider_email,
    p.specialty AS provider_specialty,
    p.consultation_fee AS provider_fee,
    s.name AS service_name,
    s.duration_minutes AS service_duration,
    s.price AS service_price,
    sl.start_time AS slot_start_time,
    sl.end_time AS slot_end_time,
    u_patient.full_name AS patient_name,
    u_patient.email AS patient_email,
    u_patient.phone AS patient_phone
FROM appointments a
INNER JOIN providers p ON a.provider_id = p.id
INNER JOIN users u_prov ON p.user_id = u_prov.id
INNER JOIN services s ON a.service_id = s.id
INNER JOIN availability_slots sl ON a.slot_id = sl.id
INNER JOIN users u_patient ON a.user_id = u_patient.id
WHERE a.id = $1;
```

---

### Query 2: Find Available Slots via LEFT JOIN Anti-Pattern
- **Feature**: Slot Discovery in Booking Flow (`GET /api/v1/providers/:id/slots?available=true&date=YYYY-MM-DD`)
- **Repository**: `src/repositories/slot.repository.js`
- **Description**: Identifies unbooked slots for a specific provider on a given date by LEFT JOINing against active appointments where the right side is NULL, reinforcing the `is_booked = false` condition.

```sql
SELECT 
    s.id,
    s.provider_id,
    s.start_time,
    s.end_time,
    s.is_booked
FROM availability_slots s
LEFT JOIN appointments a 
    ON s.id = a.slot_id 
    AND a.status = 'booked'
WHERE s.provider_id = $1
  AND DATE(s.start_time AT TIME ZONE 'UTC') = $2
  AND s.is_booked = false
  AND a.id IS NULL
  AND s.start_time > CURRENT_TIMESTAMP
ORDER BY s.start_time ASC;
```

---

### Query 3: Providers Catalog with Services Aggregation (LEFT JOIN + ARRAY_AGG / JSON_AGG)
- **Feature**: Public Provider Directory (`GET /api/v1/providers`)
- **Repository**: `src/repositories/provider.repository.js`
- **Description**: Retrieves provider profiles along with an aggregated array of the specific services they are certified to offer.

```sql
SELECT 
    p.id,
    p.user_id,
    u.full_name,
    u.email,
    u.phone,
    u.avatar_url,
    p.bio,
    p.specialty,
    p.experience_years,
    p.consultation_fee,
    p.rating,
    COALESCE(
        json_agg(
            json_build_object(
                'id', s.id,
                'name', s.name,
                'duration_minutes', s.duration_minutes,
                'price', s.price
            )
        ) FILTER (WHERE s.id IS NOT NULL), '[]'::json
    ) AS offered_services
FROM providers p
INNER JOIN users u ON p.user_id = u.id
LEFT JOIN provider_services ps ON p.id = ps.provider_id
LEFT JOIN services s ON ps.service_id = s.id AND s.is_active = true
GROUP BY p.id, u.id
ORDER BY p.rating DESC, p.experience_years DESC;
```

---

### Query 4: Transactional Appointment Booking with Row Locking (SELECT FOR UPDATE)
- **Feature**: Safe Concurrent Booking (`POST /api/v1/appointments`)
- **Repository**: `src/repositories/appointment.repository.js`
- **Description**: Atomic reservation executed inside a `BEGIN ... COMMIT` block. Row locking guarantees no race condition can book the same slot twice.

```sql
-- Step 1: Lock the slot row exclusively
SELECT id, provider_id, start_time, end_time, is_booked
FROM availability_slots
WHERE id = $1
FOR UPDATE;

-- Step 2: Mark the slot as booked
UPDATE availability_slots
SET is_booked = true, updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- Step 3: Insert the appointment record
INSERT INTO appointments (user_id, provider_id, service_id, slot_id, status, notes)
VALUES ($1, $2, $3, $4, 'booked', $5)
RETURNING id, user_id, provider_id, service_id, slot_id, status, notes, created_at;
```

---

### Query 5: Appointments Count per Provider (GROUP BY & HAVING)
- **Feature**: Admin Provider Performance Report (`GET /api/v1/admin/stats`)
- **Repository**: `src/repositories/admin.repository.js`
- **Description**: Calculates completed and total booking volume per provider, filtering for providers with at least 1 booking via HAVING.

```sql
SELECT 
    p.id AS provider_id,
    u.full_name AS provider_name,
    p.specialty,
    COUNT(a.id) AS total_appointments,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed_appointments,
    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) AS cancelled_appointments,
    COALESCE(SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END), 0) AS total_revenue
FROM providers p
INNER JOIN users u ON p.user_id = u.id
LEFT JOIN appointments a ON p.id = a.provider_id
LEFT JOIN services s ON a.service_id = s.id
GROUP BY p.id, u.full_name, p.specialty
HAVING COUNT(a.id) > 0
ORDER BY total_appointments DESC;
```

---

### Query 6: Busiest Days of the Week Analysis (GROUP BY with DATE_PART / TO_CHAR)
- **Feature**: Admin Scheduling Insights (`GET /api/v1/admin/stats`)
- **Repository**: `src/repositories/admin.repository.js`
- **Description**: Identifies high-demand days of the week by aggregating appointments across historical and upcoming schedules.

```sql
SELECT 
    TO_CHAR(sl.start_time, 'Day') AS day_name,
    EXTRACT(DOW FROM sl.start_time) AS day_of_week,
    COUNT(a.id) AS appointment_count
FROM appointments a
INNER JOIN availability_slots sl ON a.slot_id = sl.id
WHERE a.status != 'cancelled'
GROUP BY day_name, day_of_week
ORDER BY appointment_count DESC;
```

---

### Query 7: Frequent Patients Analysis (Common Table Expression / CTE)
- **Feature**: Admin Frequent Patient Insights (`GET /api/v1/admin/stats`)
- **Repository**: `src/repositories/admin.repository.js`
- **Description**: Uses a CTE to group bookings by user, then retrieves patient details for users with more than 1 appointment.

```sql
WITH user_booking_stats AS (
    SELECT 
        user_id,
        COUNT(id) AS total_bookings,
        MAX(created_at) AS last_booking_date
    FROM appointments
    GROUP BY user_id
    HAVING COUNT(id) >= 2
)
SELECT 
    u.id AS user_id,
    u.full_name,
    u.email,
    u.phone,
    ubs.total_bookings,
    ubs.last_booking_date
FROM user_booking_stats ubs
INNER JOIN users u ON ubs.user_id = u.id
ORDER BY ubs.total_bookings DESC;
```

---

### Query 8: Scheduled Notification Reminders Discovery (Subquery & Time Window Matching)
- **Feature**: Automated Cron Email Reminders (`src/jobs/reminderCron.js`)
- **Repository**: `src/repositories/notification.repository.js`
- **Description**: Finds upcoming appointments occurring within a 24-hour or 1-hour window where a reminder has not yet been logged in `notifications`.

```sql
-- 24-Hour Reminder Query
SELECT 
    a.id AS appointment_id,
    a.user_id,
    u.full_name AS patient_name,
    u.email AS patient_email,
    u_prov.full_name AS provider_name,
    s.name AS service_name,
    sl.start_time,
    sl.end_time
FROM appointments a
INNER JOIN users u ON a.user_id = u.id
INNER JOIN providers p ON a.provider_id = p.id
INNER JOIN users u_prov ON p.user_id = u_prov.id
INNER JOIN services s ON a.service_id = s.id
INNER JOIN availability_slots sl ON a.slot_id = sl.id
WHERE a.status = 'booked'
  AND sl.start_time >= CURRENT_TIMESTAMP + INTERVAL '23 hours'
  AND sl.start_time <= CURRENT_TIMESTAMP + INTERVAL '25 hours'
  AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.appointment_id = a.id 
        AND n.type = 'reminder_24h'
  );
```

---

### Query 9: Paginated Appointments with Dynamic Filtering and Sorting
- **Feature**: Patient / Provider Appointments Tab List (`GET /api/v1/appointments?status=&from=&to=&page=1&limit=10&sort=start_time:asc`)
- **Repository**: `src/repositories/appointment.repository.js`
- **Description**: Fetches user-specific appointments with server-side pagination, status filtering, and chronological sorting.

```sql
SELECT 
    a.id,
    a.status,
    a.notes,
    a.created_at,
    sl.start_time,
    sl.end_time,
    s.name AS service_name,
    s.duration_minutes,
    s.price,
    u_prov.full_name AS provider_name,
    p.specialty AS provider_specialty
FROM appointments a
INNER JOIN availability_slots sl ON a.slot_id = sl.id
INNER JOIN services s ON a.service_id = s.id
INNER JOIN providers p ON a.provider_id = p.id
INNER JOIN users u_prov ON p.user_id = u_prov.id
WHERE a.user_id = $1
  AND ($2::varchar IS NULL OR a.status = $2)
  AND ($3::timestamptz IS NULL OR sl.start_time >= $3)
  AND ($4::timestamptz IS NULL OR sl.start_time <= $4)
ORDER BY sl.start_time ASC
LIMIT $5 OFFSET $6;
```

---

### Query 10: Atomic Reschedule Transaction (Release Old Slot, Lock & Claim New Slot)
- **Feature**: Reschedule Appointment (`PATCH /api/v1/appointments/:id/reschedule`)
- **Repository**: `src/repositories/appointment.repository.js`
- **Description**: Atomically frees the current slot, claims the newly requested slot with `FOR UPDATE`, and updates the appointment pointer.

```sql
-- Step 1: Verify and lock new slot
SELECT id, provider_id, is_booked, start_time
FROM availability_slots
WHERE id = $1
FOR UPDATE;

-- Step 2: Release previous slot
UPDATE availability_slots
SET is_booked = false, updated_at = CURRENT_TIMESTAMP
WHERE id = $2;

-- Step 3: Claim new slot
UPDATE availability_slots
SET is_booked = true, updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- Step 4: Update appointment record
UPDATE appointments
SET slot_id = $1, updated_at = CURRENT_TIMESTAMP
WHERE id = $3
RETURNING id, slot_id, status, updated_at;
```

---

### Query 11: System-wide KPI Overview
- **Feature**: Admin Dashboard Summary Metrics (`GET /api/v1/admin/stats`)
- **Repository**: `src/repositories/admin.repository.js`
- **Description**: Single-pass multi-metric calculation of active users, providers, completed appointments, and total platform revenue.

```sql
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_patients,
    (SELECT COUNT(*) FROM providers) AS total_providers,
    (SELECT COUNT(*) FROM appointments WHERE status = 'booked') AS active_bookings,
    (SELECT COUNT(*) FROM appointments WHERE status = 'completed') AS completed_bookings,
    (SELECT COUNT(*) FROM appointments WHERE status = 'cancelled') AS cancelled_bookings,
    (SELECT COALESCE(SUM(s.price), 0) 
     FROM appointments a 
     INNER JOIN services s ON a.service_id = s.id 
     WHERE a.status = 'completed') AS gross_revenue;
```

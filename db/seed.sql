-- Seed Data for Synapse Appointment Management System
-- All user accounts share the password: Password123!
-- Hash: $2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86

BEGIN;

-- Clean existing data
TRUNCATE TABLE notifications, appointments, availability_slots, provider_services, services, providers, refresh_tokens, users RESTART IDENTITY CASCADE;

--------------------------------------------------------------------------------
-- 1. USERS (1 Admin, 6 Providers, 12 Regular Users)
--------------------------------------------------------------------------------
INSERT INTO users (id, full_name, email, password_hash, role, phone, avatar_url) VALUES
-- Admin
(1, 'Dr. Amanda Vance', 'admin@synapse.health', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'admin', '+1-555-0100', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),

-- Providers (Users 2 to 7)
(2, 'Dr. Sarah Jenkins', 'dr.sarah@synapse.health', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'provider', '+1-555-0101', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'),
(3, 'Dr. James Wilson', 'dr.james@synapse.health', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'provider', '+1-555-0102', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'),
(4, 'Dr. Elena Rostova', 'dr.elena@synapse.health', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'provider', '+1-555-0103', 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&auto=format&fit=crop&q=80'),
(5, 'Dr. Michael Chang', 'dr.michael@synapse.health', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'provider', '+1-555-0104', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'),
(6, 'Dr. Priya Patel', 'dr.priya@synapse.health', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'provider', '+1-555-0105', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80'),
(7, 'Dr. Marcus Brody', 'dr.marcus@synapse.health', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'provider', '+1-555-0106', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80'),

-- Regular Users (Users 8 to 19)
(8, 'Alice Johnson', 'alice@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0201', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
(9, 'Bob Smith', 'bob@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0202', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
(10, 'Charlie Davis', 'charlie@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0203', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
(11, 'Diana Prince', 'diana@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0204', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
(12, 'Evan Wright', 'evan@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0205', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'),
(13, 'Fiona Gallagher', 'fiona@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0206', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'),
(14, 'George Clark', 'george@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0207', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'),
(15, 'Hannah Abbott', 'hannah@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0208', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'),
(16, 'Ian Malcolm', 'ian@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0209', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'),
(17, 'Julia Roberts', 'julia@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0210', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'),
(18, 'Kevin Hart', 'kevin@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0211', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'),
(19, 'Laura Croft', 'laura@example.com', '$2a$10$bZBn6EJPfGCv4.7STMjPOeIMTkfu.fn0Hgo1zxaUTHCB.XAI.Lv86', 'user', '+1-555-0212', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80');

SELECT setval('users_id_seq', 19);

--------------------------------------------------------------------------------
-- 2. PROVIDERS (6 Providers linked to Users 2..7)
--------------------------------------------------------------------------------
INSERT INTO providers (id, user_id, bio, specialty, experience_years, consultation_fee, rating) VALUES
(1, 2, 'Board-certified cardiologist specializing in preventive cardiology, heart rhythm diagnostics, and hypertension management.', 'Cardiology', 12, 150.00, 4.95),
(2, 3, 'Board-certified clinical dermatologist focused on acne therapeutics, mole mapping, skin cancer screenings, and eczema care.', 'Dermatology', 9, 120.00, 4.88),
(3, 4, 'Fellowship-trained neurologist with expertise in migraine management, neuromuscular disorders, and sleep health.', 'Neurology', 15, 180.00, 4.98),
(4, 5, 'Orthopedic surgeon and sports medicine consultant specializing in joint preservation, arthroscopy, and sports injuries.', 'Orthopedics', 11, 160.00, 4.82),
(5, 6, 'Dedicated pediatrician committed to family-centered care, developmental milestones, preventive vaccinations, and wellness.', 'Pediatrics', 8, 110.00, 4.92),
(6, 7, 'Psychiatrist and psychotherapist specializing in anxiety spectrum disorders, mood disorders, ADHD, and mindfulness-based CBT.', 'Psychiatry', 14, 175.00, 4.90);

SELECT setval('providers_id_seq', 6);

--------------------------------------------------------------------------------
-- 3. SERVICES (12 Services)
--------------------------------------------------------------------------------
INSERT INTO services (id, name, description, duration_minutes, price, is_active) VALUES
(1, 'General Health Consultation', 'Routine health wellness examination, vital checks, and preventative lifestyle guidance.', 30, 80.00, true),
(2, 'Comprehensive Cardiology Consultation', 'In-depth cardiovascular assessment, ECG review, and personalized prevention plan.', 45, 150.00, true),
(3, 'Preventive Heart Health Screening', 'Lipid profiling, calcium score evaluation, and cardiac risk factor stratification.', 40, 160.00, true),
(4, 'Full-Body Dermatology Screening', 'Dermoscopic evaluation of moles, lesions, and skin checks for early detection.', 30, 120.00, true),
(5, 'Acne & Skin Condition Therapy', 'Diagnostic consult and tailored treatment protocols for persistent acne, rosacea, or dermatitis.', 30, 115.00, true),
(6, 'Comprehensive Neurological Evaluation', 'Assessment of neurological symptoms, reflex testing, cranial nerve evaluation, and head imaging review.', 45, 180.00, true),
(7, 'Migraine & Chronic Headache Clinic', 'Focused clinical evaluation for migraine triggers, preventive strategies, and relief options.', 40, 170.00, true),
(8, 'Orthopedic Joint & Spine Evaluation', 'Clinical musculoskeletal exam, range of motion analysis, and radiographic imaging review.', 45, 160.00, true),
(9, 'Sports Injury & Rehab Consultation', 'Acute sports injury diagnosis, functional movement review, and return-to-sport planning.', 40, 140.00, true),
(10, 'Pediatric Wellness Checkup', 'Well-child visit including growth tracking, nutritional advice, and developmental screening.', 30, 110.00, true),
(11, 'Child Allergy & Respiratory Evaluation', 'Pediatric assessment for seasonal allergies, asthma symptoms, and eczema management.', 40, 130.00, true),
(12, 'Mental Health Intake & Psychotherapy', 'Comprehensive psychiatric diagnostic intake, mental wellness plan, and cognitive support.', 60, 175.00, true);

SELECT setval('services_id_seq', 12);

--------------------------------------------------------------------------------
-- 4. PROVIDER_SERVICES (Junction mappings)
--------------------------------------------------------------------------------
INSERT INTO provider_services (provider_id, service_id) VALUES
-- Dr. Sarah Jenkins (Cardiology)
(1, 1),
(1, 2),
(1, 3),
-- Dr. James Wilson (Dermatology)
(2, 1),
(2, 4),
(2, 5),
-- Dr. Elena Rostova (Neurology)
(3, 1),
(3, 6),
(3, 7),
-- Dr. Michael Chang (Orthopedics)
(4, 1),
(4, 8),
(4, 9),
-- Dr. Priya Patel (Pediatrics)
(5, 1),
(5, 10),
(5, 11),
-- Dr. Marcus Brody (Psychiatry)
(6, 1),
(6, 12);

--------------------------------------------------------------------------------
-- 5. AVAILABILITY_SLOTS (56 slots across Past, Today, Tomorrow, +2d, +3d, +5d)
--------------------------------------------------------------------------------
-- Slots 1..10: Past Slots (-3 days, -2 days, -1 day) for completed/cancelled history
INSERT INTO availability_slots (id, provider_id, start_time, end_time, is_booked) VALUES
(1, 1, CURRENT_DATE - INTERVAL '3 days' + TIME '09:00:00', CURRENT_DATE - INTERVAL '3 days' + TIME '09:45:00', true),
(2, 1, CURRENT_DATE - INTERVAL '3 days' + TIME '10:00:00', CURRENT_DATE - INTERVAL '3 days' + TIME '10:45:00', true),
(3, 2, CURRENT_DATE - INTERVAL '2 days' + TIME '09:30:00', CURRENT_DATE - INTERVAL '2 days' + TIME '10:00:00', true),
(4, 2, CURRENT_DATE - INTERVAL '2 days' + TIME '10:30:00', CURRENT_DATE - INTERVAL '2 days' + TIME '11:00:00', true),
(5, 3, CURRENT_DATE - INTERVAL '2 days' + TIME '14:00:00', CURRENT_DATE - INTERVAL '2 days' + TIME '14:45:00', true),
(6, 4, CURRENT_DATE - INTERVAL '1 day'  + TIME '09:00:00', CURRENT_DATE - INTERVAL '1 day'  + TIME '09:45:00', true),
(7, 4, CURRENT_DATE - INTERVAL '1 day'  + TIME '11:00:00', CURRENT_DATE - INTERVAL '1 day'  + TIME '11:45:00', true),
(8, 5, CURRENT_DATE - INTERVAL '1 day'  + TIME '10:00:00', CURRENT_DATE - INTERVAL '1 day'  + TIME '10:30:00', true),
(9, 6, CURRENT_DATE - INTERVAL '1 day'  + TIME '15:00:00', CURRENT_DATE - INTERVAL '1 day'  + TIME '16:00:00', true),
(10, 6, CURRENT_DATE - INTERVAL '1 day' + TIME '16:30:00', CURRENT_DATE - INTERVAL '1 day'  + TIME '17:30:00', false);

-- Slots 11..22: Today's Slots
INSERT INTO availability_slots (id, provider_id, start_time, end_time, is_booked) VALUES
(11, 1, CURRENT_DATE + TIME '09:00:00', CURRENT_DATE + TIME '09:45:00', true),
(12, 1, CURRENT_DATE + TIME '10:30:00', CURRENT_DATE + TIME '11:15:00', false),
(13, 1, CURRENT_DATE + TIME '14:00:00', CURRENT_DATE + TIME '14:45:00', false),
(14, 2, CURRENT_DATE + TIME '09:30:00', CURRENT_DATE + TIME '10:00:00', true),
(15, 2, CURRENT_DATE + TIME '11:00:00', CURRENT_DATE + TIME '11:30:00', false),
(16, 2, CURRENT_DATE + TIME '15:00:00', CURRENT_DATE + TIME '15:30:00', false),
(17, 3, CURRENT_DATE + TIME '10:00:00', CURRENT_DATE + TIME '10:45:00', true),
(18, 3, CURRENT_DATE + TIME '13:00:00', CURRENT_DATE + TIME '13:45:00', false),
(19, 4, CURRENT_DATE + TIME '11:00:00', CURRENT_DATE + TIME '11:45:00', true),
(20, 4, CURRENT_DATE + TIME '16:00:00', CURRENT_DATE + TIME '16:45:00', false),
(21, 5, CURRENT_DATE + TIME '09:00:00', CURRENT_DATE + TIME '09:30:00', true),
(22, 6, CURRENT_DATE + TIME '14:00:00', CURRENT_DATE + TIME '15:00:00', true);

-- Slots 23..34: Tomorrow's Slots (+1 day)
INSERT INTO availability_slots (id, provider_id, start_time, end_time, is_booked) VALUES
(23, 1, CURRENT_DATE + INTERVAL '1 day' + TIME '09:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '09:45:00', true),
(24, 1, CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '10:45:00', false),
(25, 1, CURRENT_DATE + INTERVAL '1 day' + TIME '11:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '11:45:00', false),
(26, 2, CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '10:30:00', true),
(27, 2, CURRENT_DATE + INTERVAL '1 day' + TIME '11:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '11:30:00', false),
(28, 3, CURRENT_DATE + INTERVAL '1 day' + TIME '09:30:00', CURRENT_DATE + INTERVAL '1 day' + TIME '10:15:00', true),
(29, 3, CURRENT_DATE + INTERVAL '1 day' + TIME '14:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '14:45:00', false),
(30, 4, CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '10:45:00', false),
(31, 4, CURRENT_DATE + INTERVAL '1 day' + TIME '14:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '14:45:00', true),
(32, 5, CURRENT_DATE + INTERVAL '1 day' + TIME '11:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '11:30:00', true),
(33, 6, CURRENT_DATE + INTERVAL '1 day' + TIME '13:00:00', CURRENT_DATE + INTERVAL '1 day' + TIME '14:00:00', true),
(34, 6, CURRENT_DATE + INTERVAL '1 day' + TIME '15:30:00', CURRENT_DATE + INTERVAL '1 day' + TIME '16:30:00', false);

-- Slots 35..46: +2 Days Slots
INSERT INTO availability_slots (id, provider_id, start_time, end_time, is_booked) VALUES
(35, 1, CURRENT_DATE + INTERVAL '2 days' + TIME '09:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '09:45:00', false),
(36, 1, CURRENT_DATE + INTERVAL '2 days' + TIME '10:15:00', CURRENT_DATE + INTERVAL '2 days' + TIME '11:00:00', false),
(37, 2, CURRENT_DATE + INTERVAL '2 days' + TIME '09:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '09:30:00', true),
(38, 2, CURRENT_DATE + INTERVAL '2 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '10:30:00', false),
(39, 3, CURRENT_DATE + INTERVAL '2 days' + TIME '11:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '11:45:00', false),
(40, 3, CURRENT_DATE + INTERVAL '2 days' + TIME '15:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '15:45:00', false),
(41, 4, CURRENT_DATE + INTERVAL '2 days' + TIME '09:30:00', CURRENT_DATE + INTERVAL '2 days' + TIME '10:15:00', false),
(42, 4, CURRENT_DATE + INTERVAL '2 days' + TIME '11:30:00', CURRENT_DATE + INTERVAL '2 days' + TIME '12:15:00', false),
(43, 5, CURRENT_DATE + INTERVAL '2 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '10:30:00', false),
(44, 5, CURRENT_DATE + INTERVAL '2 days' + TIME '14:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '14:30:00', false),
(45, 6, CURRENT_DATE + INTERVAL '2 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '11:00:00', false),
(46, 6, CURRENT_DATE + INTERVAL '2 days' + TIME '16:00:00', CURRENT_DATE + INTERVAL '2 days' + TIME '17:00:00', false);

-- Slots 47..56: +3 Days and +5 Days Slots
INSERT INTO availability_slots (id, provider_id, start_time, end_time, is_booked) VALUES
(47, 1, CURRENT_DATE + INTERVAL '3 days' + TIME '09:30:00', CURRENT_DATE + INTERVAL '3 days' + TIME '10:15:00', false),
(48, 1, CURRENT_DATE + INTERVAL '3 days' + TIME '11:00:00', CURRENT_DATE + INTERVAL '3 days' + TIME '11:45:00', false),
(49, 2, CURRENT_DATE + INTERVAL '3 days' + TIME '14:00:00', CURRENT_DATE + INTERVAL '3 days' + TIME '14:30:00', false),
(50, 3, CURRENT_DATE + INTERVAL '3 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '3 days' + TIME '10:45:00', false),
(51, 4, CURRENT_DATE + INTERVAL '3 days' + TIME '13:30:00', CURRENT_DATE + INTERVAL '3 days' + TIME '14:15:00', false),
(52, 5, CURRENT_DATE + INTERVAL '3 days' + TIME '09:30:00', CURRENT_DATE + INTERVAL '3 days' + TIME '10:00:00', false),
(53, 6, CURRENT_DATE + INTERVAL '3 days' + TIME '11:00:00', CURRENT_DATE + INTERVAL '3 days' + TIME '12:00:00', false),
(54, 1, CURRENT_DATE + INTERVAL '5 days' + TIME '10:00:00', CURRENT_DATE + INTERVAL '5 days' + TIME '10:45:00', false),
(55, 2, CURRENT_DATE + INTERVAL '5 days' + TIME '15:00:00', CURRENT_DATE + INTERVAL '5 days' + TIME '15:30:00', false),
(56, 3, CURRENT_DATE + INTERVAL '5 days' + TIME '14:00:00', CURRENT_DATE + INTERVAL '5 days' + TIME '14:45:00', false);

SELECT setval('availability_slots_id_seq', 56);

--------------------------------------------------------------------------------
-- 6. APPOINTMENTS (24 Appointments: Past Completed, Cancelled, and Upcoming Booked)
--------------------------------------------------------------------------------
INSERT INTO appointments (id, user_id, provider_id, service_id, slot_id, status, notes, created_at) VALUES
-- Completed past appointments (Slots 1..9, slot 10 was left free)
(1,  8, 1, 2,  1, 'completed', 'Follow-up on baseline ECG and blood pressure readings. Patient tolerating beta-blockers well.', CURRENT_DATE - INTERVAL '10 days'),
(2,  9, 1, 3,  2, 'completed', 'Annual cardiovascular screening. Calcium score low risk.', CURRENT_DATE - INTERVAL '8 days'),
(3, 10, 2, 4,  3, 'completed', 'Routine whole body mole check. No dysplastic lesions observed.', CURRENT_DATE - INTERVAL '7 days'),
(4, 11, 2, 5,  4, 'completed', 'Topical tretinoin follow-up. Significant reduction in inflammatory papules.', CURRENT_DATE - INTERVAL '7 days'),
(5, 12, 3, 6,  5, 'completed', 'Diagnostic consult for recurrent tension headache episodes.', CURRENT_DATE - INTERVAL '6 days'),
(6, 13, 4, 8,  6, 'completed', 'Right knee lateral meniscus strain exam. Physical therapy regimen prescribed.', CURRENT_DATE - INTERVAL '5 days'),
(7, 14, 4, 9,  7, 'completed', 'Post-marathon ankle soreness review. Mild tendinopathy.', CURRENT_DATE - INTERVAL '5 days'),
(8, 15, 5, 10, 8, 'completed', 'Yearly child wellness exam and immunizations administered.', CURRENT_DATE - INTERVAL '4 days'),
(9, 16, 6, 12, 9, 'completed', 'Initial therapy intake and goal orientation for work-related anxiety.', CURRENT_DATE - INTERVAL '4 days'),

-- Cancelled appointments (using historical slots or historical bookings)
(10, 8,  2, 4,  3, 'cancelled', 'Patient had an emergency family trip; cancelled in advance.', CURRENT_DATE - INTERVAL '9 days'),
(11, 9,  3, 7,  5, 'cancelled', 'Symptoms resolved spontaneously.', CURRENT_DATE - INTERVAL '8 days'),
(12, 17, 4, 8,  6, 'cancelled', 'Schedule conflict with work presentation.', CURRENT_DATE - INTERVAL '6 days'),

-- Upcoming active appointments for Today (Slots 11, 14, 17, 19, 21, 22)
(13, 8,  1, 2, 11, 'booked', 'Quarterly hypertension and heart rate review.', CURRENT_DATE - INTERVAL '2 days'),
(14, 10, 2, 4, 14, 'booked', 'Suspicious spot on right forearm for review.', CURRENT_DATE - INTERVAL '3 days'),
(15, 11, 3, 7, 17, 'booked', 'Cluster headache treatment adjustment.', CURRENT_DATE - INTERVAL '2 days'),
(16, 12, 4, 8, 19, 'booked', 'Lower lumbar strain evaluation.', CURRENT_DATE - INTERVAL '1 day'),
(17, 13, 5, 10, 21, 'booked', '6-year childhood developmental milestone exam.', CURRENT_DATE - INTERVAL '2 days'),
(18, 14, 6, 12, 22, 'booked', 'Bi-weekly cognitive behavioral therapy session.', CURRENT_DATE - INTERVAL '3 days'),

-- Upcoming active appointments for Tomorrow (Slots 23, 26, 28, 31, 32, 33)
(19, 9,  1, 3, 23, 'booked', 'Cardiac preventative consultation.', CURRENT_DATE - INTERVAL '1 day'),
(20, 15, 2, 5, 26, 'booked', 'Hormonal acne follow-up.', CURRENT_DATE - INTERVAL '2 days'),
(21, 16, 3, 6, 28, 'booked', 'Neurological screening for numbness in fingers.', CURRENT_DATE - INTERVAL '1 day'),
(22, 17, 4, 9, 31, 'booked', 'Left rotator cuff rehabilitation assessment.', CURRENT_DATE - INTERVAL '2 days'),
(23, 18, 5, 11, 32, 'booked', 'Pediatric seasonal allergy testing evaluation.', CURRENT_DATE - INTERVAL '1 day'),
(24, 19, 6, 12, 33, 'booked', 'Ongoing psychotherapy for generalized anxiety.', CURRENT_DATE - INTERVAL '2 days'),

-- Upcoming active appointment for +2 days (Slot 37)
(25, 8,  2, 4, 37, 'booked', 'Cosmetic dermatology inquiry regarding sun damage.', CURRENT_DATE - INTERVAL '1 day');

SELECT setval('appointments_id_seq', 25);

--------------------------------------------------------------------------------
-- 7. NOTIFICATIONS (Email reminder and confirmation logs)
--------------------------------------------------------------------------------
INSERT INTO notifications (user_id, appointment_id, type, sent_at, metadata) VALUES
(8,  1,  'booking_confirmed', CURRENT_DATE - INTERVAL '10 days', '{"channel": "email", "recipient": "alice@example.com"}'),
(8,  1,  'reminder_24h',      CURRENT_DATE - INTERVAL '4 days',  '{"channel": "email", "recipient": "alice@example.com"}'),
(8,  1,  'reminder_1h',       CURRENT_DATE - INTERVAL '3 days',  '{"channel": "email", "recipient": "alice@example.com"}'),
(9,  2,  'booking_confirmed', CURRENT_DATE - INTERVAL '8 days',  '{"channel": "email", "recipient": "bob@example.com"}'),
(10, 3,  'booking_confirmed', CURRENT_DATE - INTERVAL '7 days',  '{"channel": "email", "recipient": "charlie@example.com"}'),
(8,  10, 'cancelled',         CURRENT_DATE - INTERVAL '9 days',  '{"channel": "email", "reason": "Patient requested"}'),
(8,  13, 'booking_confirmed', CURRENT_DATE - INTERVAL '2 days',  '{"channel": "email", "recipient": "alice@example.com"}'),
(8,  13, 'reminder_24h',      CURRENT_DATE - INTERVAL '1 day',   '{"channel": "email", "recipient": "alice@example.com"}'),
(9,  19, 'booking_confirmed', CURRENT_DATE - INTERVAL '1 day',   '{"channel": "email", "recipient": "bob@example.com"}'),
(9,  19, 'reminder_24h',      CURRENT_TIMESTAMP - INTERVAL '2 hours', '{"channel": "email", "recipient": "bob@example.com"}');

COMMIT;

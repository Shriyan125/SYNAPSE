import cron from 'node-cron';
import { notificationRepository } from '../repositories/notification.repository.js';
import { sendReminderEmail } from '../utils/email.js';
import { logger } from '../config/logger.js';

export async function processReminders() {
  logger.debug('Running scheduled appointment reminder check...');

  try {
    // 1. Process 24-hour reminders
    const pending24h = await notificationRepository.findPendingReminders24h();
    if (pending24h.length > 0) {
      logger.info(`Found ${pending24h.length} appointment(s) needing 24-hour reminder.`);
      for (const appt of pending24h) {
        try {
          await sendReminderEmail({
            to: appt.patient_email,
            patientName: appt.patient_name,
            providerName: appt.provider_name,
            serviceName: appt.service_name,
            startTime: appt.start_time,
            reminderType: 'reminder_24h',
          });

          await notificationRepository.create({
            userId: appt.user_id,
            appointmentId: appt.appointment_id,
            type: 'reminder_24h',
            metadata: { scheduledTime: appt.start_time, recipient: appt.patient_email },
          });
        } catch (err) {
          logger.error(`Error processing 24h reminder for appointment #${appt.appointment_id}: ${err.message}`);
        }
      }
    }

    // 2. Process 1-hour reminders
    const pending1h = await notificationRepository.findPendingReminders1h();
    if (pending1h.length > 0) {
      logger.info(`Found ${pending1h.length} appointment(s) needing 1-hour reminder.`);
      for (const appt of pending1h) {
        try {
          await sendReminderEmail({
            to: appt.patient_email,
            patientName: appt.patient_name,
            providerName: appt.provider_name,
            serviceName: appt.service_name,
            startTime: appt.start_time,
            reminderType: 'reminder_1h',
          });

          await notificationRepository.create({
            userId: appt.user_id,
            appointmentId: appt.appointment_id,
            type: 'reminder_1h',
            metadata: { scheduledTime: appt.start_time, recipient: appt.patient_email },
          });
        } catch (err) {
          logger.error(`Error processing 1h reminder for appointment #${appt.appointment_id}: ${err.message}`);
        }
      }
    }
  } catch (error) {
    logger.error(`Reminder cron job execution encountered an error: ${error.message}`);
  }
}

/**
 * Initialize node-cron schedule (runs every minute in dev/prod)
 */
export function initReminderCron() {
  logger.info('Initializing Appointment Reminder Cron Job (Frequency: every minute)...');
  // Runs every minute: "* * * * *"
  const task = cron.schedule('* * * * *', async () => {
    await processReminders();
  });
  return task;
}

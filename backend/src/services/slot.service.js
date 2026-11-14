import { slotRepository } from '../repositories/slot.repository.js';
import { providerRepository } from '../repositories/provider.repository.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../utils/errors.js';

export const slotService = {
  /**
   * Get slots for a provider
   */
  async getSlots({ providerId, date = null, availableOnly = false }) {
    return slotRepository.findByProviderAndDate(providerId, date, availableOnly);
  },

  /**
   * Provider creates an availability slot
   */
  async createSlot({ user, startTime, endTime }) {
    const provider = await providerRepository.findByUserId(user.id);
    if (!provider) {
      throw new ForbiddenError('Provider profile not found for this user account');
    }

    if (new Date(startTime) <= new Date()) {
      throw new BadRequestError('Cannot create an availability slot in the past');
    }

    return slotRepository.create({
      providerId: provider.id,
      startTime,
      endTime,
    });
  },

  /**
   * Provider updates an existing slot
   */
  async updateSlot({ user, slotId, startTime, endTime }) {
    const slot = await slotRepository.findById(slotId);
    if (!slot) {
      throw new NotFoundError('Availability slot not found');
    }

    const provider = await providerRepository.findByUserId(user.id);
    if (!provider || slot.provider_id !== provider.id) {
      throw new ForbiddenError('You can only update your own availability slots');
    }

    if (slot.is_booked) {
      throw new ConflictError('Cannot modify an already booked availability slot');
    }

    if (startTime && new Date(startTime) <= new Date()) {
      throw new BadRequestError('Start time cannot be set in the past');
    }

    return slotRepository.update(slotId, { startTime, endTime });
  },

  /**
   * Provider deletes a slot
   */
  async deleteSlot({ user, slotId }) {
    const slot = await slotRepository.findById(slotId);
    if (!slot) {
      throw new NotFoundError('Availability slot not found');
    }

    const provider = await providerRepository.findByUserId(user.id);
    if (!provider || slot.provider_id !== provider.id) {
      throw new ForbiddenError('You can only delete your own availability slots');
    }

    if (slot.is_booked) {
      throw new ConflictError('Cannot delete an already booked availability slot');
    }

    const hasAppointment = await slotRepository.hasActiveAppointment(slotId);
    if (hasAppointment) {
      throw new ConflictError('Cannot delete a slot with active appointment reservations');
    }

    await slotRepository.delete(slotId);
    return { id: slotId };
  },
};

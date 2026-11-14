export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Synapse Healthcare Appointment Management API',
    version: '1.0.0',
    description:
      'Production-grade RESTful API for Synapse Appointment Management System. Supports multi-role authentication (patient, provider, admin), slot scheduling, transactional booking with concurrency locking, automated reminders, and analytics.',
    contact: {
      name: 'Synapse Engineering Team',
      email: 'support@synapse.health',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API Version 1 Base Endpoint',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT access token formatted as: Bearer <token>',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object', nullable: true },
          error: {
            type: 'object',
            nullable: true,
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
              details: { type: 'any' },
            },
          },
          meta: { type: 'object', nullable: true },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 8 },
          fullName: { type: 'string', example: 'Alice Johnson' },
          email: { type: 'string', example: 'alice@example.com' },
          role: { type: 'string', enum: ['user', 'provider', 'admin'], example: 'user' },
          phone: { type: 'string', example: '+1-555-0201' },
          avatarUrl: { type: 'string', example: 'https://images.unsplash.com/...' },
        },
      },
      Appointment: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 12 },
          userId: { type: 'integer', example: 8 },
          providerId: { type: 'integer', example: 1 },
          serviceId: { type: 'integer', example: 2 },
          slotId: { type: 'integer', example: 14 },
          status: { type: 'string', enum: ['booked', 'cancelled', 'completed'], example: 'booked' },
          notes: { type: 'string', example: 'Follow-up on baseline tests' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          serviceName: { type: 'string', example: 'Comprehensive Cardiology Consultation' },
          providerName: { type: 'string', example: 'Dr. Sarah Jenkins' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new patient or provider user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['full_name', 'email', 'password'],
                properties: {
                  full_name: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', format: 'email', example: 'jane.doe@example.com' },
                  password: { type: 'string', format: 'password', example: 'Password123!' },
                  role: { type: 'string', enum: ['user', 'provider'], default: 'user' },
                  phone: { type: 'string', example: '+1-555-0999' },
                  specialty: { type: 'string', example: 'Cardiology' },
                  bio: { type: 'string', example: 'Board-certified specialist' },
                  consultation_fee: { type: 'number', example: 150 },
                  experience_years: { type: 'integer', example: 5 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User successfully registered' },
          409: { description: 'Email address already registered' },
          422: { description: 'Validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user credentials and receive JWT access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'alice@example.com' },
                  password: { type: 'string', format: 'password', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authentication successful' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate refresh token and obtain new access token',
        responses: {
          200: { description: 'Tokens rotated successfully' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Revoke active refresh token and clear cookies',
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile retrieved' },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile updated' },
        },
      },
    },
    '/providers': {
      get: {
        tags: ['Providers'],
        summary: 'List all providers with offered services (Cached)',
        parameters: [
          { name: 'specialty', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of providers' },
        },
      },
    },
    '/providers/{id}': {
      get: {
        tags: ['Providers'],
        summary: 'Get provider details by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Provider details' },
          404: { description: 'Provider not found' },
        },
      },
    },
    '/providers/{id}/slots': {
      get: {
        tags: ['Slots'],
        summary: 'Get availability slots for a provider',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'available', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'List of slots' },
        },
      },
    },
    '/services': {
      get: {
        tags: ['Services'],
        summary: 'List all services (Cached)',
        responses: {
          200: { description: 'List of services' },
        },
      },
    },
    '/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'List own appointments with pagination and filters',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['booked', 'cancelled', 'completed'] } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'sort', in: 'query', schema: { type: 'string', default: 'start_time:asc' } },
        ],
        responses: {
          200: { description: 'Appointments list' },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Appointments'],
        summary: 'Book an appointment (Transactional with row locking)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['provider_id', 'service_id', 'slot_id'],
                properties: {
                  provider_id: { type: 'integer', example: 1 },
                  service_id: { type: 'integer', example: 2 },
                  slot_id: { type: 'integer', example: 14 },
                  notes: { type: 'string', example: 'Routine checkup notes' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Appointment successfully booked' },
          409: { description: 'Slot is already booked' },
          400: { description: 'Past slot or invalid payload' },
        },
      },
    },
    '/appointments/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'Get appointment details by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Appointment details' },
          403: { description: 'Forbidden: not authorized to view' },
          404: { description: 'Not found' },
        },
      },
    },
    '/appointments/{id}/reschedule': {
      patch: {
        tags: ['Appointments'],
        summary: 'Reschedule appointment to a new slot (Cutoff window: 2h)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['new_slot_id'],
                properties: {
                  new_slot_id: { type: 'integer', example: 25 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Appointment successfully rescheduled' },
          400: { description: 'Within 2-hour window or past slot' },
          409: { description: 'New slot already booked' },
        },
      },
    },
    '/appointments/{id}/cancel': {
      patch: {
        tags: ['Appointments'],
        summary: 'Cancel appointment (Cutoff window: 2h)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', example: 'Schedule conflict' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Appointment successfully cancelled' },
          400: { description: 'Within 2-hour window or already cancelled' },
        },
      },
    },
    '/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'System KPI stats, appointments per provider, busiest days, and frequent patients',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Admin statistics' },
          403: { description: 'Forbidden: requires admin role' },
        },
      },
    },
    '/admin/appointments': {
      get: {
        tags: ['Admin'],
        summary: 'System-wide appointments list with pagination',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All appointments' },
          403: { description: 'Forbidden: requires admin role' },
        },
      },
    },
  },
};

/**
 * src/validators/applications.schemas.js
 *
 * Zod schemas for adoption application endpoints.
 */

const { z } = require('zod');

const petIdParamsSchema = z.object({
  petId: z.string().uuid()
});

const petParamsSchema = z.object({
  petId: z.string().uuid()
});

const createApplicationBodySchema = z.object({
  applicantName: z.string().trim().min(1).max(120),
  contact: z.string().trim().min(3).max(200),
  reason: z.string().trim().min(1).max(1000)
});

const approveParamsSchema = z.object({
  applicationId: z.string().uuid()
});

const listApplicationsQuerySchema = z.object({
  status: z.enum(['SUBMITTED', 'APPROVED', 'INVALIDATED']).optional(),
  petId: z.string().uuid().optional()
});

module.exports = {
  petIdParamsSchema,
  petParamsSchema,
  createApplicationBodySchema,
  approveParamsSchema,
  listApplicationsQuerySchema
};

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


/**
 * Normalization helpers
 */
const stripControlChars = (s) => s.replace(/[\u0000-\u001F\u007F]/g, '');
const normalizeSpaces = (s) => s.trim().replace(/\s+/g, ' ');
const normalizeText = (s) => normalizeSpaces(stripControlChars(String(s)));

/**
 * Applicant name:
 * - trim + collapse whitespace
 * - allow letters (unicode), spaces, apostrophes, hyphens, periods
 * - length bounds
 */
const applicantNameSchema = z
  .string()
  .transform(normalizeText)
  .refine((s) => s.length >= 2 && s.length <= 80, 'Name must be 2–80 characters.')
  .refine(
    (s) => /^[\p{L}][\p{L}\p{M}\s.'-]*$/u.test(s),
    "Name contains invalid characters. Allowed: letters, spaces, . ' -"
  );

/**
 * Contact:
 * Accept either:
 * - Email (normalized)
 * - AU mobile (common formats) -> normalized to digits/+ form remains as provided, but spaces removed
 *
 * Accepted examples:
 * - alex.nguyen@example.com
 * - 0412345678
 * - +61412345678
 * - +61 412 345 678
 */
const emailSchema = z.preprocess(
  (v) => (typeof v === 'string' ? normalizeText(v) : v),
  z.string().email('Invalid email address.')
);

const auMobileSchema = z.preprocess(
  (v) => (typeof v === 'string' ? normalizeText(v).replace(/\s+/g, '') : v),
  z.string().refine(
    (s) => /^(?:\+?61|0)4\d{8}$/.test(s),
    'Contact must be a valid AU mobile (e.g., 0412345678 or +61412345678).'
  )
);

const contactSchema = z.union([emailSchema, auMobileSchema]);

/**
 * Reason:
 * - trim + collapse whitespace
 * - remove control chars
 * - disallow angle brackets to reduce accidental HTML injection storage
 * - length bounds
 */
const reasonSchema = z
  .string()
  .transform(normalizeText)
  .refine((s) => s.length >= 10, 'Reason must be at least 10 characters.')
  .refine((s) => s.length <= 1000, 'Reason must be at most 1000 characters.')
  .refine((s) => !/[<>]/.test(s), 'Reason must not contain < or > characters.');

const createApplicationBodySchema = z.object({
  applicantName: applicantNameSchema,
  contact: contactSchema,
  reason: reasonSchema
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

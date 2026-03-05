/**
 * src/validators/admin-pets.schemas.js
 *
 * Validation for admin pet creation.
 */

const { z } = require('zod');
const { badRequest } = require('../middleware/error.middleware');

const createPetBodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  breed: z.string().trim().min(1).max(80),
  ageYears: z.coerce.number().int().min(0).max(30),
  imageUrl: z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value;
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    },
    z
      .string()
      .url()
      .max(2048)
      .refine((value) => /^https?:\/\//i.test(value), {
        message: 'imageUrl must start with http:// or https://'
      })
      .optional()
  )
});

/**
 * Require exactly one image source:
 * - uploaded file OR imageUrl
 * - not both
 * - not neither
 */
function validatePetImageSource(req, _res, next) {
  try {
    const hasFile = Boolean(req.file);
    const hasUrl = Boolean(req.body.imageUrl);

    if (hasFile === hasUrl) {
      throw badRequest(
        'Provide exactly one image source: either imageFile upload or imageUrl.',
        {
          hasFile,
          hasImageUrl: hasUrl
        }
      );
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createPetBodySchema,
  validatePetImageSource
};
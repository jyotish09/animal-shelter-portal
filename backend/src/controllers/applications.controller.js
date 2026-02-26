/**
 * src/controllers/applications.controller.js
 */

const adoptionService = require('../services/adoption.service');

async function createApplication(req, res, next) {
  try {
    const { petId } = req.params;
    const result = await adoptionService.applyForAdoption(petId, req.body);
    return res.status(201).json({ data: result, requestId: req.id });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createApplication };

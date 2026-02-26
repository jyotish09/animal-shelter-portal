/**
 * src/controllers/admin.controller.js
 */

const adoptionService = require('../services/adoption.service');

async function listApplications(req, res, next) {
  try {
    const apps = await adoptionService.listApplications(req.query);
    return res.json({ data: apps, requestId: req.id });
  } catch (err) {
    return next(err);
  }
}

async function listApplicationsForPet(req, res, next) {
  try {
    const { petId } = req.params;
    const apps = await adoptionService.listApplicationsForPet(petId);
    return res.json({ data: apps, requestId: req.id });
  } catch (err) {
    return next(err);
  }
}

async function approveApplication(req, res, next) {
  try {
    const { applicationId } = req.params;
    const result = await adoptionService.approveApplication(applicationId);
    return res.json({ data: result, requestId: req.id });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listApplications,
  listApplicationsForPet,
  approveApplication
};

/**
 * src/services/adoption.service.js
 *
 * Adoption workflow (transactional):
 * - Apply: create SUBMITTED application; AVAILABLE -> PENDING
 * - Approve: pet -> ADOPTED; selected -> APPROVED; other SUBMITTED -> INVALIDATED
 */

const { withTransaction, getDb } = require('../config/db');
const { logger } = require('../utils/logger');
const { newId } = require('../utils/id');
const { conflict, notFound } = require('../middleware/error.middleware');
const petsRepo = require('../repositories/pets.repo');
const appsRepo = require('../repositories/applications.repo');

const log = logger.child({ module: 'adoption.service' });

async function applyForAdoption(petId, payload) {
  return withTransaction(async (db) => {
    const pet = await petsRepo.getPetById(db, petId);
    if (!pet) throw notFound('Pet not found', { petId });

    if (pet.status === 'ADOPTED') {
      throw conflict('This pet has already been adopted.', { petId });
    }

    const app = await appsRepo.createApplication(db, {
      id: newId(),
      petId,
      applicantName: payload.applicantName,
      contact: payload.contact,
      reason: payload.reason,
      status: 'SUBMITTED'
    });

    let updatedPet = pet;
    if (pet.status === 'AVAILABLE') {
      updatedPet = await petsRepo.updatePetStatus(db, petId, 'PENDING');
    }

    log.info({ petId, applicationId: app.id, petStatus: updatedPet.status }, 'Application submitted');
    return { pet: updatedPet, application: app };
  });
}

async function approveApplication(applicationId) {
  return withTransaction(async (db) => {
    const application = await appsRepo.getApplicationById(db, applicationId);
    if (!application) throw notFound('Application not found', { applicationId });

    if (application.status === 'APPROVED') {
      const pet = await petsRepo.getPetById(db, application.petId);
      return { pet, approvedApplication: application };
    }

    if (application.status === 'INVALIDATED') {
      throw conflict('This application was invalidated and cannot be approved.', { applicationId });
    }

    const pet = await petsRepo.getPetById(db, application.petId);
    if (!pet) throw notFound('Pet not found for application', { petId: application.petId });

    if (pet.status === 'ADOPTED') {
      throw conflict('This pet is already adopted. Cannot approve another application.', {
        petId: pet.id,
        applicationId
      });
    }

    const updatedPet = await petsRepo.updatePetStatus(db, pet.id, 'ADOPTED');
    const approved = await appsRepo.markApproved(db, applicationId);
    await appsRepo.invalidateOtherSubmitted(db, pet.id, applicationId);

    log.info({ petId: pet.id, applicationId }, 'Application approved; pet adopted');
    return { pet: updatedPet, approvedApplication: approved };
  });
}

async function listApplications(opts = {}) {
  const db = await getDb();
  return appsRepo.listApplications(db, opts);
}

async function listApplicationsForPet(petId) {
  const db = await getDb();
  const pet = await petsRepo.getPetById(db, petId);
  if (!pet) throw notFound('Pet not found', { petId });
  return appsRepo.listApplicationsForPet(db, petId);
}

module.exports = {
  applyForAdoption,
  approveApplication,
  listApplications,
  listApplicationsForPet
};

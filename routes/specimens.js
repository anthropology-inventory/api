const { Router } = require("express");
const { getAllSpecimens, createSpecimen, getSingleSpecimenById, updateSpecimen, getRecordCount, getTotalCost, deleteSpecimen, getRecentSpecimens, getAllSpecimensByCategory, getCurrentValue, } = require('../controllers/specimenController');
const requireAuth = require('../middleware/authMiddleware.js');

const specimensRouter = Router();

// GET all specimens
specimensRouter.get('/', requireAuth, getAllSpecimens);

// GET all specimens by category
specimensRouter.get('/totalByCategory/:cat', requireAuth, getAllSpecimensByCategory);

// GET total number of records
specimensRouter.get('/totalRecords', requireAuth, getRecordCount);

// GET total collection cost
specimensRouter.get('/totalCost', requireAuth, getTotalCost);

// GET current collection value
specimensRouter.get('/currentVal', requireAuth, getCurrentValue);

// GET recent specimens (3)
specimensRouter.get('/recent', requireAuth, getRecentSpecimens);

// GET specimen by id
specimensRouter.get('/:id', requireAuth, getSingleSpecimenById);

// POST a new specimen
specimensRouter.post('/', requireAuth, createSpecimen);

// PATCH a specimen by id
specimensRouter.patch('/:id', requireAuth, updateSpecimen);

// DELETE a specimen by id
specimensRouter.delete('/:id', requireAuth, deleteSpecimen);

module.exports = specimensRouter;
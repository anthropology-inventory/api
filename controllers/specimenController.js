const Specimen = require("../models/specimen.js");
const path = require("path");
const cloudinary = require("../utils/cloudinary");

// get all specimens
const getAllSpecimens = async (req, res) => {
    try {
        const specimens = await Specimen.find({}).sort({ createdAt: -1 });
        res.status(200);
        res.json(specimens);
    } catch (err) {
        res.status(500);
        res.json({ error: "failed to get specimens" });
    }
};

// get a single specimen by id
const getSingleSpecimenById = async (req, res) => {
    const specimenId = req.params.id;

    try {
        const specimen = await Specimen.findById(specimenId);
        res.status(200);
        res.json(specimen);
    } catch (error) {
        res.status(404);
        res.json({ error: error.message });
    }
};

// create a new specimen
const createSpecimen = async (req, res) => {
    let imageUrl = "";

    if (req.files && req.files.image) {
        try {
            const result = await cloudinary.uploader.upload(
                req.files.image.tempFilePath,
                {
                    folder: "specimen-images",
                }
            );
            imageUrl = result.secure_url;
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            return res.status(500).json({ error: "Image upload failed" });
        }
    }

    const {
        category,
        genus,
        species,
        nickName,
        specimenId,
        material,
        manufacturerId,
        manufacturer,
        countryManufactured,
        anthropologist,
        activeValue,
        paidValue,
        dateOfPurchase,
        purchaser,
        regionFound,
        countryFound,
        location,
        description,
        notes,
    } = req.body;

    // add doc to db
    try {
        const specimen = await Specimen.create({
            category,
            genus,
            species,
            nickName,
            specimenId,
            material,
            manufacturerId,
            manufacturer,
            countryManufactured,
            anthropologist,
            activeValue,
            paidValue,
            dateOfPurchase,
            purchaser,
            regionFound,
            countryFound,
            location,
            description,
            notes,
            images: imageUrl || undefined,
        });
        res.status(200);
        res.json(specimen);
    } catch (error) {
        res.status(400);
        res.json({ error: error.message });
    }
};

// delete a specimen | NOTE: does not delete images from 'uploads' folder
const deleteSpecimen = async (req, res) => {
    const specimenId = req.params.id;
    try {
        const deletedSpecimen = await Specimen.findOneAndDelete({
            _id: specimenId,
        });

        if (!deletedSpecimen) {
            return res.status(404).json({ message: "Specimen not found" });
        }

        res.status(200);
        res.json({
            message: "Successfully deleted specimen",
            data: deletedSpecimen,
        });
    } catch (error) {
        res.status(500);
        res.json({ error: error.message });
    }
};

// update a specimen | NOTE: currently works, but can only update fields that exist in the current schema.
const updateSpecimen = async (req, res) => {
    const filter = { _id: req.params.id };
    const update = { $set: req.body };
    const options = { new: true, runValidators: true };

    try {
        const updatedSpecimen = await Specimen.findOneAndUpdate(
            filter,
            update,
            options
        );

        if (!updatedSpecimen) {
            return res.status(404).json({ message: "Specimen not found" });
        }

        res.status(200);
        res.json({
            message: "Specimen updated successfully!",
            data: updatedSpecimen,
        });
    } catch (error) {
        res.status(400);
        res.json({ error: error.message });
    }
};

// Total number of records in the db
// for the dashboard
const getRecordCount = async (req, res) => {
    try {
        const count = await Specimen.countDocuments();
        res.status(200).json({ count: count });
    } catch (error) {
        console.error("Error with record count", error);
        res.status(404).json({ error: error.message });
    }
};

// Get the total collection cost
const getTotalCost = async (req, res) => {
    try {
        const results = await Specimen.find(
            { paidValue: { $gt: 1 } },
            { _id: 0, paidValue: 1 }
        );
        const values = results.map((artifact) => artifact.paidValue);
        const totalCost = values.reduce((sum, value) => sum + value, 0);
        res.status(200).json({ totalCost: totalCost });
    } catch (error) {
        console.error("Error with total cost", error);
        res.status(404).json({ error: error.message });
    }
};

// Get the total collection value
const getCurrentValue = async (req, res) => {
    try {
        const results = await Specimen.find(
            { activeValue: { $gt: 1 } },
            { _id: 0, activeValue: 1 }
        );
        const values = results.map((artifact) => artifact.activeValue);
        const currentVal = values.reduce((sum, value) => sum + value, 0);
        res.status(200).json({ currentVal: currentVal });
    } catch (error) {
        console.error("Error with current value", error);
        res.status(404).json({ error: error.message });
    }
};

// Get all the specimens within a specified category
const getAllSpecimensByCategory = async (req, res) => {
    try {
        const requestedCategory = req.params.cat;
        const results = await Specimen.countDocuments({
            category: requestedCategory,
        });
        res.status(200).json({ count: results });
    } catch (error) {
        console.error("Error with getting all specimens by category", error);
        res.status(404).json({ error: error.message });
    }
};

// Get the most recently added artifacts
const getRecentSpecimens = async (req, res) => {
    const NUMBER_OF_SPECIMENS = 5;

    try {
        const recentSpecimens = await Specimen.find({})
            .sort({ createdAt: -1 })
            .limit(NUMBER_OF_SPECIMENS);
        res.status(200);
        res.json({
            message: "Found specimens",
            data: recentSpecimens,
        });
    } catch (error) {
        console.error("Error fetching recent specimens", error);
        res.status(404).json({ error: error.message });
    }
};

module.exports = {
    getAllSpecimens,
    getSingleSpecimenById,
    createSpecimen,
    deleteSpecimen,
    updateSpecimen,
    getRecordCount,
    getTotalCost,
    getCurrentValue,
    getRecentSpecimens,
    getAllSpecimensByCategory,
};

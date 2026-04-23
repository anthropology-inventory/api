require("dotenv").config();

const mongoose = require("mongoose");
const Specimen = require("../models/specimen");
const { inspectStoredLocation } = require("../utils/location");

const shouldFix = process.argv.includes("--fix");

const formatRecord = (record) => ({
    id: String(record._id),
    specimenId: record.specimenId ?? null,
    location: record.location ?? null,
});

const main = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not set.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const specimens = await Specimen.find(
        {},
        { specimenId: 1, location: 1 }
    ).lean();

    const report = {
        total: specimens.length,
        valid: 0,
        empty: 0,
        recoverableStrings: [],
        corruptedStrings: [],
        invalidStrings: [],
        invalidObjects: [],
    };

    for (const specimen of specimens) {
        const inspection = inspectStoredLocation(specimen.location);

        switch (inspection.state) {
            case "valid":
                report.valid += 1;
                break;
            case "empty":
                report.empty += 1;
                break;
            case "recoverable-string":
                report.recoverableStrings.push({
                    ...formatRecord(specimen),
                    normalized: inspection.normalized,
                });
                break;
            case "corrupted-string":
                report.corruptedStrings.push({
                    ...formatRecord(specimen),
                    reason: inspection.reason,
                });
                break;
            case "invalid-string":
                report.invalidStrings.push({
                    ...formatRecord(specimen),
                    reason: inspection.reason,
                });
                break;
            case "invalid-object":
                report.invalidObjects.push({
                    ...formatRecord(specimen),
                    reason: inspection.reason,
                });
                break;
            default:
                break;
        }
    }

    if (shouldFix && report.recoverableStrings.length > 0) {
        for (const specimen of report.recoverableStrings) {
            await Specimen.updateOne(
                { _id: specimen.id },
                { $set: { location: specimen.normalized } }
            );
        }
    }

    const summary = {
        total: report.total,
        valid: report.valid,
        empty: report.empty,
        recoverableStringCount: report.recoverableStrings.length,
        corruptedStringCount: report.corruptedStrings.length,
        invalidStringCount: report.invalidStrings.length,
        invalidObjectCount: report.invalidObjects.length,
        fixedRecoverableStrings: shouldFix ? report.recoverableStrings.length : 0,
    };

    console.log(JSON.stringify({ summary, report }, null, 2));
};

main()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        try {
            await mongoose.disconnect();
        } catch (error) {
            // Ignore disconnect errors on exit.
        }
    });

const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const Specimen = require("../models/specimen");
const parseLocationMiddleware = require("../middleware/locationMiddleware");
const {
    createSpecimen,
    getAllSpecimens,
    getSingleSpecimenById,
    updateSpecimen,
} = require("../controllers/specimenController");

const originalCreate = Specimen.create;
const originalFind = Specimen.find;
const originalFindById = Specimen.findById;
const originalFindByIdAndUpdate = Specimen.findByIdAndUpdate;

const baseSpecimenData = () => ({
    category: "Insect",
    genus: "Apis",
    species: "mellifera",
    specimenId: "SPEC-100",
});

const createResponse = () => ({
    statusCode: 200,
    body: undefined,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(payload) {
        this.body = payload;
        return this;
    },
});

const toPlain = (value) => JSON.parse(JSON.stringify(value));

afterEach(() => {
    Specimen.create = originalCreate;
    Specimen.find = originalFind;
    Specimen.findById = originalFindById;
    Specimen.findByIdAndUpdate = originalFindByIdAndUpdate;
});

test("location middleware parses drawer-only JSON from multipart form data", () => {
    const req = {
        body: {
            location: JSON.stringify({ drawer: "Drawer 7" }),
        },
    };
    const res = createResponse();
    let nextCalled = false;

    parseLocationMiddleware(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.deepEqual(req.body.location, { drawer: "Drawer 7" });
});

test('location middleware rejects the "[object Object]" form-data bug', () => {
    const req = {
        body: {
            location: "[object Object]",
        },
    };
    const res = createResponse();

    parseLocationMiddleware(req, res, () => {
        throw new Error("next should not be called");
    });

    assert.equal(res.statusCode, 400);
    assert.match(res.body.details, /JSON\.stringify/);
});

test("schema validation accepts the new drawer-only location shape", () => {
    const specimen = new Specimen({
        ...baseSpecimenData(),
        location: { drawer: "Drawer 7" },
    });

    const validationError = specimen.validateSync();

    assert.equal(validationError, undefined);
    assert.deepEqual(specimen.location, { drawer: "Drawer 7" });
});

test("schema validation accepts legacy cabinet+shelf and cabinet+drawer shapes", () => {
    const shelfSpecimen = new Specimen({
        ...baseSpecimenData(),
        specimenId: "SPEC-101",
        location: { cabinet: "Cabinet 1", shelf: "Shelf 3" },
    });
    const drawerSpecimen = new Specimen({
        ...baseSpecimenData(),
        specimenId: "SPEC-102",
        location: { cabinet: "Cabinet 2", drawer: "Drawer 5" },
    });

    assert.equal(shelfSpecimen.validateSync(), undefined);
    assert.equal(drawerSpecimen.validateSync(), undefined);
});

test('schema validation rejects location = "[object Object]"', () => {
    const specimen = new Specimen({
        ...baseSpecimenData(),
        location: "[object Object]",
    });

    const validationError = specimen.validateSync();

    assert.ok(validationError);
    assert.match(validationError.errors.location.message, /JSON\.stringify/);
});

test("createSpecimen stores drawer-only location as a structured object", async () => {
    let createPayload;

    Specimen.create = async (payload) => {
        createPayload = payload;
        return {
            _id: new mongoose.Types.ObjectId(),
            ...payload,
        };
    };

    const req = {
        body: {
            ...baseSpecimenData(),
            location: JSON.stringify({ drawer: "Drawer 7" }),
        },
    };
    const res = createResponse();

    await createSpecimen(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(createPayload.location, { drawer: "Drawer 7" });
    assert.deepEqual(toPlain(res.body).location, { drawer: "Drawer 7" });
});

test("createSpecimen stores cabinet+shelf location as a structured object", async () => {
    let createPayload;

    Specimen.create = async (payload) => {
        createPayload = payload;
        return {
            _id: new mongoose.Types.ObjectId(),
            ...payload,
        };
    };

    const req = {
        body: {
            ...baseSpecimenData(),
            specimenId: "SPEC-103",
            location: JSON.stringify({
                cabinet: "Cabinet 2",
                shelf: "Shelf 3",
            }),
        },
    };
    const res = createResponse();

    await createSpecimen(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(createPayload.location, {
        cabinet: "Cabinet 2",
        shelf: "Shelf 3",
    });
    assert.deepEqual(toPlain(res.body).location, {
        cabinet: "Cabinet 2",
        shelf: "Shelf 3",
    });
});

test("updateSpecimen stores drawer-only location as a structured object", async () => {
    let updateArgs;

    Specimen.findByIdAndUpdate = async (...args) => {
        updateArgs = args;
        const [, update] = args;
        return {
            _id: new mongoose.Types.ObjectId(),
            ...baseSpecimenData(),
            ...update.$set,
        };
    };

    const req = {
        params: {
            id: String(new mongoose.Types.ObjectId()),
        },
        body: {
            location: JSON.stringify({ drawer: "Drawer 9" }),
        },
    };
    const res = createResponse();

    await updateSpecimen(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(updateArgs[1].$set.location, { drawer: "Drawer 9" });
    assert.deepEqual(toPlain(res.body).data.location, { drawer: "Drawer 9" });
    assert.deepEqual(updateArgs[2], { new: true, runValidators: true });
});

test("updateSpecimen stores cabinet+shelf location as a structured object", async () => {
    let updateArgs;

    Specimen.findByIdAndUpdate = async (...args) => {
        updateArgs = args;
        const [, update] = args;
        return {
            _id: new mongoose.Types.ObjectId(),
            ...baseSpecimenData(),
            ...update.$set,
        };
    };

    const req = {
        params: {
            id: String(new mongoose.Types.ObjectId()),
        },
        body: {
            location: JSON.stringify({
                cabinet: "Cabinet 4",
                shelf: "Shelf 2",
            }),
        },
    };
    const res = createResponse();

    await updateSpecimen(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(updateArgs[1].$set.location, {
        cabinet: "Cabinet 4",
        shelf: "Shelf 2",
    });
    assert.deepEqual(toPlain(res.body).data.location, {
        cabinet: "Cabinet 4",
        shelf: "Shelf 2",
    });
});

test("GET responses keep legacy cabinet+shelf locations as objects", async () => {
    Specimen.findById = async () => ({
        _id: new mongoose.Types.ObjectId(),
        ...baseSpecimenData(),
        location: { cabinet: "Cabinet 1", shelf: "Shelf 3" },
    });

    const req = {
        params: {
            id: String(new mongoose.Types.ObjectId()),
        },
    };
    const res = createResponse();

    await getSingleSpecimenById(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(toPlain(res.body).location, {
        cabinet: "Cabinet 1",
        shelf: "Shelf 3",
    });
});

test("GET responses normalize stored JSON string locations into objects", async () => {
    Specimen.findById = async () => ({
        _id: new mongoose.Types.ObjectId(),
        ...baseSpecimenData(),
        location: '{"drawer":"Drawer 11"}',
    });

    const req = {
        params: {
            id: String(new mongoose.Types.ObjectId()),
        },
    };
    const res = createResponse();

    await getSingleSpecimenById(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(toPlain(res.body).location, {
        drawer: "Drawer 11",
    });
});

test("GET responses normalize legacy plain-string drawer locations into objects", async () => {
    Specimen.findById = async () => ({
        _id: new mongoose.Types.ObjectId(),
        ...baseSpecimenData(),
        location: "Drawer 3",
    });

    const req = {
        params: {
            id: String(new mongoose.Types.ObjectId()),
        },
    };
    const res = createResponse();

    await getSingleSpecimenById(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(toPlain(res.body).location, {
        drawer: "Drawer 3",
    });
});

test("GET responses normalize legacy plain-string cabinet+shelf locations into objects", async () => {
    Specimen.findById = async () => ({
        _id: new mongoose.Types.ObjectId(),
        ...baseSpecimenData(),
        location: "Cabinet 2 / Shelf 3",
    });

    const req = {
        params: {
            id: String(new mongoose.Types.ObjectId()),
        },
    };
    const res = createResponse();

    await getSingleSpecimenById(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(toPlain(res.body).location, {
        cabinet: "Cabinet 2",
        shelf: "Shelf 3",
    });
});

test("GET responses keep legacy cabinet+drawer locations as objects", async () => {
    Specimen.find = () => ({
        sort: async () => [
            {
                _id: new mongoose.Types.ObjectId(),
                ...baseSpecimenData(),
                location: { cabinet: "Cabinet 2", drawer: "Drawer 5" },
            },
        ],
    });

    const res = createResponse();

    await getAllSpecimens({}, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(toPlain(res.body)[0].location, {
        cabinet: "Cabinet 2",
        drawer: "Drawer 5",
    });
});

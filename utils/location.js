const CABINET_VALUES = Array.from({ length: 10 }, (_, index) => `Cabinet ${index + 1}`);
const SHELF_VALUES = Array.from({ length: 6 }, (_, index) => `Shelf ${index + 1}`);
const DRAWER_VALUES = Array.from({ length: 12 }, (_, index) => `Drawer ${index + 1}`);
const LOCATION_KEYS = ["cabinet", "shelf", "drawer"];
const INVALID_FORMDATA_SENTINEL = "[object Object]";

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const isPlainObject = (value) =>
    Boolean(value) && typeof value === "object" && !Array.isArray(value);

const buildError = (details) => ({
    ok: false,
    error: "Invalid location format",
    details,
});

const canonicalizeMatchedValue = (value) =>
    value
        .trim()
        .replace(/\s+/g, " ")
        .replace(/^(cabinet|shelf|drawer)\s+(\d+)$/i, (_, label, number) => {
            const normalizedLabel =
                label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
            return `${normalizedLabel} ${number}`;
        });

const extractStructuredLocationFromLegacyString = (value) => {
    const matches = value.match(/\b(cabinet|shelf|drawer)\s+\d+\b/gi);

    if (!matches || matches.length === 0) {
        return null;
    }

    const normalized = {};

    for (const match of matches) {
        const canonicalValue = canonicalizeMatchedValue(match);
        const [key] = canonicalValue.split(" ");
        normalized[key.toLowerCase()] = canonicalValue;
    }

    return Object.keys(normalized).length > 0 ? normalized : null;
};

const normalizeLocationObject = (value) => {
    if (!isPlainObject(value)) {
        return buildError("Location must be an object.");
    }

    const unknownKeys = Object.keys(value).filter(
        (key) =>
            !LOCATION_KEYS.includes(key) &&
            value[key] !== undefined &&
            value[key] !== null &&
            !(typeof value[key] === "string" && value[key].trim() === "")
    );

    if (unknownKeys.length > 0) {
        return buildError(
            `Location contains unsupported keys: ${unknownKeys.join(", ")}.`
        );
    }

    const normalized = {};

    for (const key of LOCATION_KEYS) {
        if (!hasOwn(value, key) || value[key] === undefined || value[key] === null) {
            continue;
        }

        if (typeof value[key] !== "string") {
            return buildError(`Location field "${key}" must be a string.`);
        }

        const trimmedValue = value[key].trim();
        if (!trimmedValue) {
            continue;
        }

        normalized[key] = trimmedValue;
    }

    if (Object.keys(normalized).length === 0) {
        return {
            ok: true,
            value: null,
        };
    }

    const { cabinet, shelf, drawer } = normalized;
    const hasCabinet = Boolean(cabinet);
    const hasShelf = Boolean(shelf);
    const hasDrawer = Boolean(drawer);

    if (hasShelf && !hasCabinet) {
        return buildError("Legacy shelf locations must include a cabinet.");
    }

    if (hasShelf && hasDrawer) {
        return buildError("Location cannot contain both shelf and drawer.");
    }

    if (hasCabinet && !hasShelf && !hasDrawer) {
        return buildError("Cabinet must be paired with either a shelf or drawer.");
    }

    if (!hasCabinet && !hasDrawer) {
        return buildError("Location must include a drawer, or a cabinet with shelf/drawer.");
    }

    if (hasCabinet && !CABINET_VALUES.includes(cabinet)) {
        return buildError(`Cabinet must be one of: ${CABINET_VALUES.join(", ")}.`);
    }

    if (hasShelf && !SHELF_VALUES.includes(shelf)) {
        return buildError(`Shelf must be one of: ${SHELF_VALUES.join(", ")}.`);
    }

    if (hasDrawer && !DRAWER_VALUES.includes(drawer)) {
        return buildError(`Drawer must be one of: ${DRAWER_VALUES.join(", ")}.`);
    }

    return {
        ok: true,
        value: normalized,
    };
};

const parseLocationInput = (value) => {
    if (value === undefined) {
        return {
            ok: true,
            value: undefined,
        };
    }

    if (value === null) {
        return {
            ok: true,
            value: null,
        };
    }

    if (typeof value === "string") {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            return {
                ok: true,
                value: null,
            };
        }

        if (trimmedValue === INVALID_FORMDATA_SENTINEL) {
            return buildError(
                'Location was sent as "[object Object]". Serialize it with JSON.stringify(location) before appending to FormData.'
            );
        }

        try {
            const parsedValue = JSON.parse(trimmedValue);
            return normalizeLocationObject(parsedValue);
        } catch (error) {
            const legacyStructuredValue =
                extractStructuredLocationFromLegacyString(trimmedValue);
            if (legacyStructuredValue) {
                return normalizeLocationObject(legacyStructuredValue);
            }

            return buildError(
                "Location must be valid JSON for multipart/form-data requests."
            );
        }
    }

    return normalizeLocationObject(value);
};

const normalizeLocationForResponse = (value) => {
    const parsed = parseLocationInput(value);
    return parsed.ok ? parsed.value ?? null : null;
};

const serializeSpecimen = (specimen) => {
    if (!specimen) {
        return specimen;
    }

    const serialized =
        typeof specimen.toObject === "function"
            ? specimen.toObject()
            : { ...specimen };

    serialized.location = normalizeLocationForResponse(serialized.location);
    return serialized;
};

const serializeSpecimens = (specimens) => specimens.map(serializeSpecimen);

const inspectStoredLocation = (value) => {
    if (value === undefined || value === null) {
        return {
            state: "empty",
            normalized: null,
        };
    }

    const parsed = parseLocationInput(value);

    if (parsed.ok) {
        if (typeof value === "string") {
            return {
                state: "recoverable-string",
                normalized: parsed.value ?? null,
            };
        }

        return {
            state: "valid",
            normalized: parsed.value ?? null,
        };
    }

    if (typeof value === "string") {
        return {
            state:
                value.trim() === INVALID_FORMDATA_SENTINEL
                    ? "corrupted-string"
                    : "invalid-string",
            reason: parsed.details,
        };
    }

    return {
        state: "invalid-object",
        reason: parsed.details,
    };
};

module.exports = {
    CABINET_VALUES,
    SHELF_VALUES,
    DRAWER_VALUES,
    INVALID_FORMDATA_SENTINEL,
    parseLocationInput,
    normalizeLocationForResponse,
    serializeSpecimen,
    serializeSpecimens,
    inspectStoredLocation,
    extractStructuredLocationFromLegacyString,
};

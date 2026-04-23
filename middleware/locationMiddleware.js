/**
 * Middleware to parse and validate location from FormData
 * Converts stringified JSON location object and validates its format
 */
const { parseLocationInput } = require("../utils/location");

const parseLocationMiddleware = (req, res, next) => {
    try {
        if (Object.prototype.hasOwnProperty.call(req.body, "location")) {
            const parsedLocation = parseLocationInput(req.body.location);

            if (!parsedLocation.ok) {
                return res.status(400).json({
                    error: parsedLocation.error,
                    details: parsedLocation.details,
                });
            }

            req.body.location = parsedLocation.value;
        }

        next();
    } catch (error) {
        return res.status(400).json({
            error: "Error processing location",
            details: error.message,
        });
    }
};

module.exports = parseLocationMiddleware;

/**
 * Middleware to parse and validate location from FormData
 * Converts stringified JSON location object and validates its format
 */
const parseLocationMiddleware = (req, res, next) => {
    try {
        // Check if location exists in the request body
        if (req.body.location) {
            // If location is a string (from FormData), parse it
            if (typeof req.body.location === 'string') {
                try {
                    req.body.location = JSON.parse(req.body.location);
                } catch (e) {
                    return res.status(400).json({ 
                        error: 'Invalid location format',
                        details: 'Location must be valid JSON. Expected: {"cabinet":"Cabinet 1","shelf":"Shelf 3"} or {"cabinet":"Cabinet 1","drawer":"Drawer 5"}'
                    });
                }
            }

            // Validate location object structure
            const location = req.body.location;
            
            if (typeof location !== 'object' || location === null) {
                return res.status(400).json({ 
                    error: 'Invalid location format',
                    details: 'Location must be an object'
                });
            }

            // Validate that cabinet exists
            if (!location.cabinet || typeof location.cabinet !== 'string' || location.cabinet.trim() === '') {
                return res.status(400).json({ 
                    error: 'Invalid location format',
                    details: 'Cabinet is required and must be a non-empty string'
                });
            }

            // Validate that either shelf or drawer exists, but not both
            const hasShelf = location.shelf && location.shelf.trim() !== '';
            const hasDrawer = location.drawer && location.drawer.trim() !== '';

            if (!hasShelf && !hasDrawer) {
                return res.status(400).json({ 
                    error: 'Invalid location format',
                    details: 'Location must have either shelf or drawer (not both). Both are currently empty.'
                });
            }

            if (hasShelf && hasDrawer) {
                return res.status(400).json({ 
                    error: 'Invalid location format',
                    details: 'Location must have either shelf or drawer, not both. Currently has both.',
                    received: location
                });
            }
        }

        next();
    } catch (error) {
        return res.status(400).json({ 
            error: 'Error processing location',
            details: error.message
        });
    }
};

module.exports = parseLocationMiddleware;

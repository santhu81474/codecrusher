/**
 * Reusable request validation middleware.
 * Checks that all required body fields are present and non-empty.
 *
 * @param {string[]} requiredFields - Array of field names that must be present in req.body
 * @returns Express middleware function
 *
 * @example
 *   router.post('/create', protect, validateBody(['title', 'description']), createProject);
 */
export const validateBody = (requiredFields = []) => (req, res, next) => {
  const missing = requiredFields.filter(field => {
    const value = req.body[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });

  if (missing.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missing.join(', ')}`,
      fields: missing
    });
  }

  next();
};

/**
 * Validates that a URL parameter is a valid MongoDB ObjectId format.
 *
 * @param {string} paramName - The name of the URL param to validate (default: 'id')
 * @returns Express middleware function
 *
 * @example
 *   router.get('/:id', validateObjectId('id'), getProjectById);
 */
export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({
      message: `Invalid ${paramName} format`
    });
  }
  next();
};

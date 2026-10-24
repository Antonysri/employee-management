// ============================================================================
// 🔍 QUERY VALIDATION MIDDLEWARE
// GET requests-la URL query parameters-ai (?page=1&limit=10) Zod vechu check pannum.
// ============================================================================
const validateQuery = (schema) => {
  return (req, res, next) => {
    // 1. URL Query parameters-ai Zod schema kitta kuduthu parse & coerce panrom
    const result = schema.safeParse(req.query);

    // 2. Oru vela query params thappa irundha (e.g. limit: 500, page: -1)
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // 3. ✨ SUPERPOWER LINE:
    // Zod convert panna pure Number & default values-ai 'req.validatedQuery'-la store panrom!
    req.validatedQuery = result.data;

    // 4. Next controller kitta pass panrom
    next();
  };
};

export default validateQuery;
// ============================================================================
// 🎯 ROUTE PARAMETER VALIDATION MIDDLEWARE
// URL-la vara /:id parameters-ai Zod schema kitta kuduthu verify pannum.
// ============================================================================
const validateParams = (schema) => {
  return (req, res, next) => {
    // 1. URL-la irundhu vara req.params-ai Zod schema safeParse kitta kudukurom
    const result = schema.safeParse(req.params);

    // 2. Oru vela ID 24 characters illama thappa irundha (e.g. /123), udane 400 Bad Request!
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid route parameters',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // 3. ✨ Clean aana params-ai 'req.validatedParams'-la store panrom
    req.validatedParams = result.data;

    // 4. Controller kitta pass panrom
    next();
  };
};

export default validateParams;
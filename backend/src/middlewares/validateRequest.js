// Zod schema-va receive pannura middleware factory create panrom.
// Valid request data eppadi irukkanum-nu route schema moolama sollum.
const validateRequest = (schema) => {
  // Express middleware function-ai return panrom.
  // Request indha route-ku varumbodhu Express indha function-ai run pannum.
  return (req, res, next) => {
    // Client anuppuna JSON data req.body-la irukkum.
    // safeParse data-va check,Zod schema kitta kuduthu parse pannum; error vandhaalum throw panni crash aagaadhu.
    const result = schema.safeParse(req.body);

    // Data schema-oda match aagalana request-ai inga stop panrom.
    // Validation fail aana controller run aagaadhu.
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',

        // Zod errors-ai field name and message format-la maathrom.
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Validate aana, transform seyyappatta data-va request-la save panrom.
    // Controller indha clean data-va use pannalaam.
    req.validatedBody = result.data;

    // Request-ai next middleware illa controller-kku anupprom.
    next();
  };
};

// Routes-la use panna middleware factory-ai export panrom.
export default validateRequest;
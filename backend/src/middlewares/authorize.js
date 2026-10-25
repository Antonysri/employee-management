// backend/src/middlewares/authorize.js

// ============================================================================
// 🛡️ AUTHORIZATION / RBAC MIDDLEWARE (ROLE CHECK)
// Identity confirm aana piragu (authenticate mudinjadhum),
// intha user-ku intha endpoint-ai access panna thagudhi (Role) irukkaa nu check pannum.
// Usage: authorize('ADMIN') or authorize('ADMIN', 'HR')
// ============================================================================

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. SAFETY CHECK:
    // Idhuku munnadi authenticate middleware kandippa execute aagirukanum (req.user irukanum)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before authorization.',
      });
    }

    // 2. CHECK USER ROLE AGAINST ALLOWED ROLES:
    // Eg: allowedRoles = ['ADMIN', 'HR']. req.user.role = 'EMPLOYEE' na block pannidum!
    if (!allowedRoles.includes(req.user.role)){
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. Required role(s): [${allowedRoles.join(', ')}]. Your role: [${req.user.role}].`,
      });
    }

    // User-kitta thevaiyaana role irukku, adutha controller-ku anupu!
    next();
  };
};

export default authorize;
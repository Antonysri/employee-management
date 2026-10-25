import authService from '../services/auth.service.js';

// ============================================================================
// 🎯 AUTH CONTROLLER
// ============================================================================
const login = async (req, res, next) => {
  try {
    // 1. Zod validate panna { email, password }-ai service kitta pass panrom
    const result = await authService.login(req.validatedBody);

    // 2. 200 OK status-oda User details + Token-ai anupurom
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    // 3. 401 / 403 / 500 errors central errorHandler kitta pogum
    return next(error);
  }
};

export default {
  login,
};
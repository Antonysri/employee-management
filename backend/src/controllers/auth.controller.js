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

// 2. 🔑 SETUP PASSWORD CONTROLLER:
const setupPassword = async (req, res, next) => {
  try {
    // Note: Zod validation-la token, password, confirmPassword irukkum.
    // Service-kku namakku thevaiyana token & password mattume anupurom!
    const { token, password } = req.validatedBody;
    const result = await authService.setupPassword({ token, password });
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};


// 3. 👤 GET CURRENT USER PROFILE CONTROLLER:
const getMe = async (req, res, next) => {
  try {
    // 🛡️ authenticate middleware req.user-la user info-vai vachirukkum:
    const user = await authService.getMe(req.user._id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};


// 4. 🔁 RESEND INVITATION CONTROLLER:
const resendInvitation = async (req, res, next) => {
  try {
    const { email } = req.validatedBody;
    const result = await authService.resendInvitation(email);
    console.log(`result  ${result}`);
    return res.status(200).json({
      success: true,
      message: 'Invitation link resent successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  login,
  setupPassword,
  getMe,
  resendInvitation,
};
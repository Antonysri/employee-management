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

// backend/src/controllers/auth.controller.js
// 5.logout
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id);

    // 🍪 BACKEND தான் இந்த Command-ஐ போடும்:
    res.clearCookie('token'); // 👈 இங்கதான் Backend இந்த வேலையை பண்ணும்!

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
// ============================================================================
// 6. 📩 FORGOT PASSWORD CONTROLLER (Request 6-Digit OTP)
// ============================================================================
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.validatedBody;
    const result = await authService.forgotPassword(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return next(error); // 429 Cooldown அல்லது 500 errors central handler-க்கு போகும்
  }
};

// ============================================================================
// 7. 🔢 VERIFY RESET CODE CONTROLLER (Verify 6-Digit OTP & 5-Attempt Limit)
// ============================================================================
const verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.validatedBody;
    const result = await authService.verifyResetCode({ email, code });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        resetToken: result.resetToken, // 15-minute token for password change
      },
    });
  } catch (error) {
    return next(error); // 400 Invalid code / Expired / Blocked errors
  }
};

// ============================================================================
// 8. 🔑 RESET PASSWORD CONTROLLER (Set New Password)
// ============================================================================
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, password } = req.validatedBody;
    const result = await authService.resetPassword({ resetToken, password });

    return res.status(200).json({
      success: true,
      message: result.message,
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
  logout,
  forgotPassword,
  verifyResetCode,
  resetPassword
};
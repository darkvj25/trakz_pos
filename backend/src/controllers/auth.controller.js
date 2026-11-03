const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      const result = await authService.login(email, password);
      return sendSuccess(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return sendSuccess(res, 'User profile retrieved', user);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.user ? req.user.id : null);
      return sendSuccess(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

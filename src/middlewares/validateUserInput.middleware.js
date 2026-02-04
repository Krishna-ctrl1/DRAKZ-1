// Request validation middleware for user creation/updates
const validateUserInput = (req, res, next) => {
  const { name, email, password, role } = req.body;

  // For POST requests (create user)
  if (req.method === 'POST') {
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const validRoles = ['user', 'admin', 'advisor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${validRoles.join(', ')}`
      });
    }
  }

  // For PUT requests (update user)
  if (req.method === 'PUT') {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (role) {
      const validRoles = ['user', 'admin', 'advisor'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Role must be one of: ${validRoles.join(', ')}`
        });
      }
    }
  }

  next();
};

module.exports = validateUserInput;

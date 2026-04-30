function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    const userRole = req.user?.role; // Assuming req.user is set by authentication middleware

    if (!userRole) {
      return res.status(401).json({ message: 'Unauthorized: No role found' });
    }

    if (userRole !== requiredRole) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}
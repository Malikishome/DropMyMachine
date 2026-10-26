function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    const userRole = req.user?.role; // Assuming req.user is set by authentication middleware

    if (!userRole) { //Change this message at the end of the project to be alot more vague and not give away any information about the system, change to just "Unauthorized" or something like that
      return res.status(401).json({ message: 'Unauthorized: No role found' });
    }

    if (userRole !== requiredRole) { // Change this message at the end of the project to be alot more vague and not give away any information about the system, change to just "Forbidden" or something like that
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}

module.exports = roleMiddleware;
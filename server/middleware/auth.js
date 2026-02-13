/**
 * Authentication & Authorization Middleware
 * Implements role-based access control
 */

// Simple API key authentication (can be enhanced with JWT/OAuth)
const API_KEYS = {
  'admin': { role: 'admin', permissions: ['read', 'write', 'delete', 'analytics'] },
  'analyst': { role: 'analyst', permissions: ['read', 'analytics'] },
  'operator': { role: 'operator', permissions: ['read', 'write'] }
};

/**
 * API Key Authentication Middleware
 */
function authenticateAPIKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'API key required. Provide via X-API-Key header or api_key query parameter.'
    });
  }
  
  const keyInfo = API_KEYS[apiKey];
  if (!keyInfo) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Invalid API key.'
    });
  }
  
  req.user = {
    role: keyInfo.role,
    permissions: keyInfo.permissions
  };
  
  next();
}

/**
 * Permission Check Middleware
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Permission '${permission}' required.`
      });
    }
    
    next();
  };
}

/**
 * Role Check Middleware
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Role '${role}' required.`
      });
    }
    
    next();
  };
}

module.exports = {
  authenticateAPIKey,
  requirePermission,
  requireRole
};

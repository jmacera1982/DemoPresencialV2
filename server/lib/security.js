'use strict';

const crypto = require('crypto');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

const SESSION_COOKIE = 'numia_proxy_session';
const SESSION_MAX_MS = 12 * 60 * 60 * 1000;
const SAFE_PROXY_PATH_RE = /^[A-Za-z0-9_\-./?=&%]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TURN_CODE_RE = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * Política de rate limiting (express-rate-limit):
 * - authRateLimit: POST/DELETE /api/auth/session — intentos de login (AUTH_RATE_LIMIT_*)
 * - journeyRateLimit: POST /api/journey/run — ejecución de flujos Journey (JOURNEY_RATE_LIMIT_*)
 * - apiRateLimit: resto de /api/* — tráfico general del proxy (RATE_LIMIT_*)
 */
function createSecurity(config) {
  const demoApiToken = config.demoApiToken || '';
  const demoPortalPassword = config.demoPortalPassword || '';
  const sessionSecret = config.sessionSecret || '';
  const cookieSecure = Boolean(config.cookieSecure);
  const cookieHttpOnly = config.cookieHttpOnly !== false;
  const cookieSameSite = config.cookieSameSite || 'strict';

  if (!sessionSecret) {
    throw new Error('SESSION_SECRET es obligatorio (validación de arranque omitida)');
  }

  const sessionMiddleware = session({
    name: SESSION_COOKIE,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: cookieHttpOnly,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: SESSION_MAX_MS
    }
  });

  function isAuthConfigured() {
    return Boolean(demoApiToken || demoPortalPassword);
  }

  function hasValidSession(req) {
    return Boolean(req.session && req.session.authenticated === true);
  }

  function requireProxyAuth(req, res, next) {
    if (!isAuthConfigured()) {
      res.status(503).json({
        error: 'Proxy sin autenticación: configurá DEMO_API_TOKEN y/o DEMO_PORTAL_PASSWORD en server/.env'
      });
      return;
    }

    if (hasValidSession(req)) {
      next();
      return;
    }

    const headerToken = req.get('X-Demo-Token') || '';
    if (demoApiToken && headerToken && headerToken.length === demoApiToken.length) {
      const a = Buffer.from(headerToken, 'utf8');
      const b = Buffer.from(demoApiToken, 'utf8');
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        next();
        return;
      }
    }

    res.status(401).json({ error: 'No autorizado' });
  }

  function establishPortalSession(req) {
    req.session.authenticated = true;
    req.session.loginAt = Date.now();
  }

  function destroyPortalSession(req, callback) {
    if (!req.session) {
      callback(null);
      return;
    }

    req.session.destroy(callback);
  }

  function validatePortalPassword(password) {
    if (!demoPortalPassword) {
      return false;
    }

    const a = Buffer.from(String(password || ''), 'utf8');
    const b = Buffer.from(demoPortalPassword, 'utf8');

    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(a, b);
  }

  function sanitizeProxyPath(rawPath) {
    let pathValue = String(rawPath || '');

    try {
      pathValue = decodeURIComponent(pathValue);
    } catch (_error) {
      return null;
    }

    pathValue = pathValue.replace(/\\/g, '/').replace(/^\/+/, '');

    if (!pathValue || pathValue.indexOf('\0') !== -1) {
      return null;
    }

    if (pathValue.indexOf('..') !== -1) {
      return null;
    }

    const segments = pathValue.split('?')[0].split('/').filter(Boolean);
    if (segments.some(function (segment) {
      return segment === '.' || segment === '..';
    })) {
      return null;
    }

    if (!SAFE_PROXY_PATH_RE.test(pathValue)) {
      return null;
    }

    return pathValue;
  }

  function extractRawProxyPath(req, mountPrefix) {
    const fromPath = req.path.replace(mountPrefix, '');
    const fromWildcard = req.params && req.params[0] ? String(req.params[0]) : '';
    return sanitizeProxyPath(fromPath || fromWildcard);
  }

  function isUuid(value) {
    return typeof value === 'string' && UUID_RE.test(value);
  }

  function isTurnCode(value) {
    return typeof value === 'string' && TURN_CODE_RE.test(value);
  }

  const authRateLimit = rateLimit({
    windowMs: Number(config.authRateLimitWindowMs) || 60 * 1000,
    max: Number(config.authRateLimitMax) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos de acceso. Esperá un minuto.' }
  });

  const journeyRateLimit = rateLimit({
    windowMs: Number(config.journeyRateLimitWindowMs) || 60 * 1000,
    max: Number(config.journeyRateLimitMax) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas ejecuciones de Journey. Intentá de nuevo en un minuto.' }
  });

  const apiRateLimit = rateLimit({
    windowMs: Number(config.rateLimitWindowMs) || 60 * 1000,
    max: Number(config.rateLimitMax) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes. Intentá de nuevo en un minuto.' }
  });

  return {
    SESSION_COOKIE: SESSION_COOKIE,
    sessionMiddleware: sessionMiddleware,
    requireProxyAuth: requireProxyAuth,
    establishPortalSession: establishPortalSession,
    destroyPortalSession: destroyPortalSession,
    validatePortalPassword: validatePortalPassword,
    sanitizeProxyPath: sanitizeProxyPath,
    extractRawProxyPath: extractRawProxyPath,
    isUuid: isUuid,
    isTurnCode: isTurnCode,
    isAuthConfigured: isAuthConfigured,
    authRateLimit: authRateLimit,
    journeyRateLimit: journeyRateLimit,
    apiRateLimit: apiRateLimit,
    rateLimitPolicy: {
      auth: {
        routes: ['POST /api/auth/session', 'DELETE /api/auth/session'],
        windowMs: Number(config.authRateLimitWindowMs) || 60 * 1000,
        max: Number(config.authRateLimitMax) || 10
      },
      journey: {
        routes: ['POST /api/journey/run'],
        windowMs: Number(config.journeyRateLimitWindowMs) || 60 * 1000,
        max: Number(config.journeyRateLimitMax) || 10
      },
      api: {
        routes: ['resto de /api/*'],
        windowMs: Number(config.rateLimitWindowMs) || 60 * 1000,
        max: Number(config.rateLimitMax) || 100
      }
    }
  };
}

module.exports = {
  createSecurity: createSecurity
};

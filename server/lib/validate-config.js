'use strict';

const WEAK_SECRETS = new Set([
  'secret',
  'password',
  'changeme',
  'test',
  '12345678',
  '123456789',
  '12345678901234567890123456789012'
]);

const MIN_SESSION_SECRET_LENGTH = 32;
const MIN_API_TOKEN_LENGTH = 32;
const MIN_PORTAL_PASSWORD_LENGTH = 8;

function isWeakValue(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return !normalized || WEAK_SECRETS.has(normalized);
}

function validateRequiredSecret(name, value, minLength) {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  if (!trimmed || trimmed.length < minLength) {
    return name + ' debe tener al menos ' + minLength + ' caracteres aleatorios';
  }

  if (isWeakValue(trimmed)) {
    return name + ' es demasiado débil o predecible';
  }

  return null;
}

function validateOptionalSecret(name, value, minLength) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) {
    return null;
  }

  return validateRequiredSecret(name, value, minLength);
}

function validateStartupConfig(env) {
  const errors = [];
  const sessionError = validateRequiredSecret(
    'SESSION_SECRET',
    env.SESSION_SECRET,
    MIN_SESSION_SECRET_LENGTH
  );

  if (sessionError) {
    errors.push(sessionError);
  }

  const demoApiToken = (env.DEMO_API_TOKEN || '').trim();
  const demoPortalPassword = (env.DEMO_PORTAL_PASSWORD || '').trim();

  if (!demoApiToken && !demoPortalPassword) {
    errors.push('Configurá al menos uno: DEMO_API_TOKEN o DEMO_PORTAL_PASSWORD');
  }

  const apiTokenError = validateOptionalSecret('DEMO_API_TOKEN', demoApiToken, MIN_API_TOKEN_LENGTH);
  if (apiTokenError) {
    errors.push(apiTokenError);
  }

  const portalPasswordError = validateOptionalSecret(
    'DEMO_PORTAL_PASSWORD',
    demoPortalPassword,
    MIN_PORTAL_PASSWORD_LENGTH
  );
  if (portalPasswordError) {
    errors.push(portalPasswordError);
  }

  if (env.NODE_ENV === 'production') {
    if (String(env.COOKIE_SECURE || '').trim() !== 'true') {
      errors.push('En producción COOKIE_SECURE debe ser true (cookies solo por HTTPS)');
    }

    if (String(env.COOKIE_HTTPONLY || '').trim() !== 'true') {
      errors.push('En producción COOKIE_HTTPONLY debe ser true (protege la cookie contra robo por XSS)');
    }

    const cookieSameSite = String(env.COOKIE_SAMESITE || '').trim().toLowerCase();
    if (cookieSameSite !== 'strict') {
      errors.push('En producción COOKIE_SAMESITE debe ser strict (protege contra CSRF)');
    }
  }

  return errors;
}

function assertStartupConfig(env) {
  const errors = validateStartupConfig(env || process.env);

  if (!errors.length) {
    return;
  }

  console.error('[config] El servidor no puede iniciar:');
  errors.forEach(function (message) {
    console.error('  - ' + message);
  });
  process.exit(1);
}

module.exports = {
  validateStartupConfig: validateStartupConfig,
  assertStartupConfig: assertStartupConfig,
  MIN_SESSION_SECRET_LENGTH: MIN_SESSION_SECRET_LENGTH,
  MIN_API_TOKEN_LENGTH: MIN_API_TOKEN_LENGTH,
  MIN_PORTAL_PASSWORD_LENGTH: MIN_PORTAL_PASSWORD_LENGTH
};

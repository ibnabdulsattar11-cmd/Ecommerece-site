// Fails fast with a clear message instead of the app booting "successfully"
// and then throwing confusing errors the first time a feature is used
// (e.g. Stripe/SMTP/JWT calls failing deep inside a request).
const REQUIRED_VARS = [
  "DB_HOST",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CLIENT_URL",
];

// Missing these won't crash the app, but the related feature will silently
// misbehave — warn loudly so it's not a surprise in production.
const RECOMMENDED_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "EMAIL_FROM",
  "NOMINATIM_USER_AGENT",
];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(
      "❌ Missing required environment variables:",
      missing.join(", "),
    );
    console.error("   Check .env against .env.example, then restart.");
    process.exit(1);
  }

  const weakSecret = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"].filter(
    (key) => process.env[key] && process.env[key].length < 32,
  );
  if (weakSecret.length && process.env.NODE_ENV === "production") {
    console.error(
      "❌ These secrets are too short for production (need 32+ chars):",
      weakSecret.join(", "),
    );
    process.exit(1);
  }

  const missingRecommended = RECOMMENDED_VARS.filter(
    (key) => !process.env[key],
  );
  if (missingRecommended.length) {
    console.warn(
      "⚠️  Missing recommended environment variables (related features will fail at runtime):",
    );
    console.warn("   " + missingRecommended.join(", "));
  }
};

export default validateEnv;

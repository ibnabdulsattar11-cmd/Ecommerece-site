const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { User } = require("../models");

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || null;

          let user = await User.findOne({ where: { googleId: profile.id } });

          if (!user && email) {
            // Link Google login to an existing email/password account.
            user = await User.findOne({ where: { email } });
            if (user) {
              user.googleId = profile.id;
              await user.save();
            }
          }

          if (!user) {
            user = await User.create({
              name: profile.displayName || "Google User",
              email,
              googleId: profile.id,
              profileImage: profile.photos?.[0]?.value || null,
              isVerified: true, // Google has already verified this email
            });
          }

          if (user.isBlocked)
            return done(null, false, { message: "Account blocked" });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
} else {
  console.warn(
    "⚠️  GOOGLE_CLIENT_ID/SECRET not set — Google login is disabled (/api/auth/google will 501)",
  );
}

// Not using sessions - JWT only - so no serialize/deserialize needed,
// but passport requires these to exist if session support is ever toggled on.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});

module.exports = passport;

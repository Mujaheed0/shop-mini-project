const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const keys = require("../../config/dev.js");
const User = require("../../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientId,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      let user;
      const query = User.query().findOne({ googleId: profile.id });
      const response = await query;
      if (response) {
        user = response;
        done(null, user);
      } else {
        user = await User.query()
          .insert({
            googleId: profile.id,
          })
          .returning("*");
        done(null, user);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  console.log(id);
  const user = await User.query().findById(id);
  done(null, user);
});

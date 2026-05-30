const passport=require("passport");
const GoogleStrategy=require("passport-google-oauth20").Strategy;

passport.serializeUser(function(user,done){
    done(null,user);
});

passport.deserializeUser(function(user,done){
    done(null,user);
});

module.exports=function(sistema){
    passport.use(new GoogleStrategy({
        clientID:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:"/google/callback"
    },function(accessToken,refreshToken,profile,done){
        let email=profile.emails[0].value;
        sistema.usuarioGoogle({email:email},function(usr){
            done(null,usr);
        });
    }));
};

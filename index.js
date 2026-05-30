const express=require("express");
const bodyParser=require("body-parser");
const path=require("path");
const cookieSession=require("cookie-session");
const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy;
const modelo=require("./servidor/modelo.js");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.static(path.join(__dirname,"cliente")));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(cookieSession({
    name:"session",
    keys:[process.env.SESSION_SECRET||"secreto"],
    maxAge:24*60*60*1000
}));
app.use(function(req,res,next){
    if(req.session && !req.session.regenerate){
        req.session.regenerate=function(cb){ cb(); };
    }
    if(req.session && !req.session.save){
        req.session.save=function(cb){ cb(); };
    }
    next();
});
app.use(passport.initialize());
app.use(passport.session());

let sistema=new modelo.Sistema({test:false});

require("./servidor/passport-setup.js")(sistema);

passport.use(new LocalStrategy({usernameField:"email",passwordField:"password"},
    function(email,password,done){
        sistema.loginUsuario({email:email,password:password},function(user){
            if(!user || user.email===-1){
                return done(null,false);
            }
            return done(null,user);
        });
    }
));

const haIniciado=function(request,response,next){
    if(request.user){
        next();
    }
    else{
        response.redirect("/");
    }
};

app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}));

app.get("/google/callback",passport.authenticate("google",{
    failureRedirect:"/fallo",
    successRedirect:"/good"
}));

app.get("/good",function(request,response){
    let nick=request.user.email||request.user.nick;
    sistema.agregarUsuario(nick);
    response.cookie("nick",nick);
    response.redirect("/");
});

app.get("/fallo",function(request,response){
    response.send({nick:-1});
});

const GoogleOneTapStrategy=require("passport-google-one-tap").GoogleOneTapStrategy;
passport.use(new GoogleOneTapStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    verifyCsrfToken:false
},function(profile,done){
    let email=profile.emails[0].value;
    sistema.usuarioGoogle({email:email},function(usr){
        done(null,usr);
    });
}));

app.post("/oneTap/callback",passport.authenticate("google-one-tap",{
    failureRedirect:"/fallo",
    successRedirect:"/good"
}));

app.get("/agregarUsuario/:nick",function(request,response){
    let nick=request.params.nick;
    let res=sistema.agregarUsuario(nick);
    response.send(res);
});

app.get("/obtenerUsuarios",haIniciado,function(request,response){
    let res=sistema.obtenerUsuarios();
    response.send(res);
});

app.get("/usuarioActivo/:nick",function(request,response){
    let nick=request.params.nick;
    let res=sistema.usuarioActivo(nick);
    response.send({activo:res});
});

app.get("/eliminarUsuario/:nick",function(request,response){
    let nick=request.params.nick;
    sistema.eliminarUsuario(nick);
    response.send({nick:nick,eliminado:true});
});

app.get("/numeroUsuarios",function(request,response){
    let num=sistema.numeroUsuarios();
    response.send({num:num});
});

app.post("/registrarUsuario",function(request,response){
    sistema.registrarUsuario(request.body,function(res){
        response.send({nick:res.email});
    });
});

app.get("/confirmarUsuario/:email/:key",function(request,response){
    let email=request.params.email;
    let key=request.params.key;
    sistema.confirmarUsuario({email:email,key:key},function(usr){
        if(usr.email!==-1){
            response.cookie("nick",usr.email);
        }
        response.redirect("/");
    });
});

app.post("/loginUsuario",passport.authenticate("local",{
    failureRedirect:"/fallo",
    successRedirect:"/ok"
}));

app.get("/ok",haIniciado,function(request,response){
    response.send({nick:request.user.email||request.user.nick});
});

app.get("/cerrarSesion",haIniciado,function(request,response){
    let nick=request.user.nick||request.user.email;
    request.logout(function(){});
    response.redirect("/");
    if(nick){
        sistema.eliminarUsuario(nick);
    }
});

app.listen(PORT,function(){
    console.log("App está escuchando en el puerto "+PORT);
    console.log("Ctrl+C para salir");
});

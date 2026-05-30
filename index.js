const express=require("express");
const bodyParser=require("body-parser");
const path=require("path");
const modelo=require("./servidor/modelo.js");

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.static(path.join(__dirname,"cliente")));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

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

app.get("/obtenerUsuarios",function(request,response){
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

app.listen(PORT,function(){
  console.log("App está escuchando en el puerto "+PORT);
  console.log("Ctrl+C para salir");
});

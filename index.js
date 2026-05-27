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

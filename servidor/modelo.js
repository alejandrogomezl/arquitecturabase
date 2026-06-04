const datos=require("./cad.js");
const bcrypt=require("bcrypt");
const correo=require("./email.js");

function Sistema(test){
    this.usuarios={};
    this.cad=new datos.CAD();
    this.partidas=[];

    this.agregarUsuario=function(usr){
        let nick=typeof usr==="string"?usr:(usr.email||usr.nick);
        let res={"nick":-1};
        if(!this.usuarios[nick]){
            this.usuarios[nick]=typeof usr==="string"?new Usuario(nick):usr;
            res.nick=nick;
        }
        else{
            console.log("el nick "+nick+" ya está activo");
        }
        return res;
    };

    this.obtenerUsuarios=function(){
        return this.usuarios;
    };

    this.usuarioActivo=function(nick){
        return !!this.usuarios[nick];
    };

    this.eliminarUsuario=function(nick){
        delete this.usuarios[nick];
    };

    this.cerrarSesion=function(nick){
        this.cad.insertarLog({"tipo-operacion":"cerrarSesion","usuario":nick,"fecha-hora":new Date().toISOString()});
        this.eliminarUsuario(nick);
    };

    this.obtenerLogs=function(callback){
        this.cad.obtenerLogs(callback);
    };

    this.numeroUsuarios=function(){
        return Object.keys(this.usuarios).length;
    };

    this.usuarioGoogle=function(obj,callback){
        let modelo=this;
        this.cad.buscarOCrearUsuario(obj,function(usr){
            modelo.cad.insertarLog({"tipo-operacion":"inicioGoogle","usuario":obj.email,"fecha-hora":new Date().toISOString()});
            callback(usr);
        });
    };

    this.registrarUsuario=async function(obj,callback,baseUrl){
        let modelo=this;
        if(!obj.nick){
            obj.nick=obj.email;
        }
        this.cad.buscarUsuario({email:obj.email},async function(usr){
            if(!usr){
                let key=Date.now().toString();
                obj.confirmada=false;
                obj.key=key;
                const hash=await bcrypt.hash(obj.password,10);
                obj.password=hash;
                modelo.cad.insertarUsuario(obj,function(res){
                    modelo.cad.insertarLog({"tipo-operacion":"registroUsuario","usuario":obj.email,"fecha-hora":new Date().toISOString()});
                    callback(res);
                });
                correo.enviarEmail(obj.email,key,"Confirmar cuenta",baseUrl).catch(err=>{
                    console.log("Error enviando email:",err.message);
                });
            }
            else{
                callback({email:-1});
            }
        });
    };

    this.confirmarUsuario=function(obj,callback){
        let modelo=this;
        this.cad.buscarUsuario({email:obj.email,confirmada:false,key:obj.key},function(usr){
            if(usr){
                usr.confirmada=true;
                modelo.cad.actualizarUsuario(usr,function(res){
                    callback({email:res.email});
                });
            }
            else{
                callback({email:-1});
            }
        });
    };

    this.loginUsuario=function(obj,callback){
        let modelo=this;
        this.cad.buscarUsuario({email:obj.email,confirmada:true},function(usr){
            if(!usr){
                callback({email:-1});
                return -1;
            }
            else{
                bcrypt.compare(obj.password,usr.password,function(err,result){
                    if(result){
                        modelo.cad.insertarLog({"tipo-operacion":"inicioLocal","usuario":usr.email,"fecha-hora":new Date().toISOString()});
                        callback(usr);
                        modelo.agregarUsuario(usr.nick||usr.email);
                    }
                    else{
                        callback({email:-1});
                    }
                });
            }
        });
    };

    this.obtenerCodigo=function(){
        return Date.now().toString();
    };

    this.crearPartida=function(email){
        let usr=this.usuarios[email];
        if(!usr){ return -1; }
        let codigo=this.obtenerCodigo();
        let partida=new Partida(codigo);
        partida.jugadores.push(usr);
        this.partidas.push(partida);
        this.cad.insertarLog({"tipo-operacion":"crearPartida","usuario":email,"fecha-hora":new Date().toISOString()});
        return codigo;
    };

    this.unirAPartida=function(email,codigo){
        let usr=this.usuarios[email];
        if(!usr){ return -1; }
        let partida=null;
        for(let i=0;i<this.partidas.length;i++){
            if(this.partidas[i].codigo===codigo){ partida=this.partidas[i]; break; }
        }
        if(!partida){ return -1; }
        if(partida.jugadores.length>=partida.maxJug){ return -1; }
        for(let j=0;j<partida.jugadores.length;j++){
            if(partida.jugadores[j]===usr){ return -1; }
        }
        partida.jugadores.push(usr);
        this.cad.insertarLog({"tipo-operacion":"unirAPartida","usuario":email,"fecha-hora":new Date().toISOString()});
        return codigo;
    };

    this.obtenerProductos=function(callback){
        this.cad.obtenerProductos(callback);
    };

    this.obtenerPartidasDisponibles=function(){
        let lista=[];
        for(let i=0;i<this.partidas.length;i++){
            let p=this.partidas[i];
            if(p.jugadores.length<p.maxJug){
                let email=p.jugadores[0].email||p.jugadores[0].nick;
                lista.push({email:email,codigo:p.codigo});
            }
        }
        return lista;
    };

    if(!test.test){
        this.cad.conectar(function(db){
            console.log("Conectado a Mongo Atlas");
        });
    }
}

function Partida(codigo){
    this.codigo=codigo;
    this.jugadores=[];
    this.maxJug=2;
}

function Usuario(obj){
    if(typeof obj==="string"){
        this.nick=obj;
        this.email=obj;
    } else {
        this.nick=obj.nick||obj.email;
        this.email=obj.email;
        this.nombre=obj.nombre;
    }
}

module.exports.Sistema=Sistema;

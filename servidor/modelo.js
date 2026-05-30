const datos=require("./cad.js");
const bcrypt=require("bcrypt");
const correo=require("./email.js");

function Sistema(test){
    this.usuarios={};
    this.cad=new datos.CAD();

    this.agregarUsuario=function(nick){
        let res={"nick":-1};
        if(!this.usuarios[nick]){
            this.usuarios[nick]=new Usuario(nick);
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

    this.numeroUsuarios=function(){
        return Object.keys(this.usuarios).length;
    };

    this.usuarioGoogle=function(obj,callback){
        this.cad.buscarOCrearUsuario(obj,function(usr){
            callback(usr);
        });
    };

    this.registrarUsuario=async function(obj,callback){
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
                    callback(res);
                });
                correo.enviarEmail(obj.email,key,"Confirmar cuenta").catch(err=>{
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

    if(!test.test){
        this.cad.conectar(function(db){
            console.log("Conectado a Mongo Atlas");
        });
    }
}

function Usuario(nick){
    this.nick=nick;
}

module.exports.Sistema=Sistema;

const datos=require("./cad.js");

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

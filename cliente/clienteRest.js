function ClienteRest(){
    this.agregarUsuario=function(nick){
        $.getJSON("/agregarUsuario/"+nick,function(data){
            let msg="El nick "+nick+" está ocupado";
            if(data.nick!==-1){
                console.log("Usuario "+nick+" ha sido registrado");
                msg="Bienvenido al sistema, "+nick;
                $.cookie("nick",nick);
            } else { console.log("El nick ya está ocupado"); }
            cw.mostrarMensaje(msg);
        });
    };
    this.obtenerUsuarios=function(){ $.getJSON("/obtenerUsuarios",function(data){ console.log(data); }); };
    this.numeroUsuarios=function(){ $.getJSON("/numeroUsuarios",function(data){ console.log(data); }); };
    this.usuarioActivo=function(nick){ $.getJSON("/usuarioActivo/"+nick,function(data){ console.log(data); }); };
    this.eliminarUsuario=function(nick){ $.getJSON("/eliminarUsuario/"+nick,function(data){ console.log(data); }); };
}

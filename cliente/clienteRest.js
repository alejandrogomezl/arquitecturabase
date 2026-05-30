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
    this.registrarUsuario=function(email,password){
        $.ajax({
            type:"POST",
            url:"/registrarUsuario",
            data:JSON.stringify({"email":email,"password":password}),
            success:function(data){
                if(data.nick!==-1){
                    console.log("Usuario "+data.nick+" ha sido registrado");
                    $.cookie("nick",data.nick);
                    cw.limpiar();
                    cw.mostrarMensaje("Bienvenido al sistema, "+data.nick);
                    //cw.mostrarLogin();
                }
                else{
                    console.log("El nick está ocupado");
                }
            },
            error:function(xhr,textStatus,errorThrown){
                console.log("Status: "+textStatus);
                console.log("Error: "+errorThrown);
            },
            contentType:"application/json"
        });
    };
    this.loginUsuario=function(email,password){
        $.ajax({
            type:"POST",
            url:"/loginUsuario",
            data:JSON.stringify({"email":email,"password":password}),
            success:function(data){
                if(data.nick!==-1){
                    console.log("Usuario "+data.nick+" ha sido registrado");
                    $.cookie("nick",data.nick);
                    cw.limpiar();
                    cw.mostrarMensaje("Bienvenido al sistema, "+data.nick);
                    //cw.mostrarLogin();
                }
                else{
                    console.log("No se pudo iniciar sesión");
                    cw.mostrarLogin();
                    //cw.mostrarMensajeLogin("No se pudo iniciar sesión");
                }
            },
            error:function(xhr,textStatus,errorThrown){
                console.log("Status: "+textStatus);
                console.log("Error: "+errorThrown);
            },
            contentType:"application/json"
        });
    };
    this.cerrarSesion=function(){
        $.getJSON("/cerrarSesion",function(){
            console.log("Sesión cerrada");
            $.removeCookie("nick");
        });
    };
}

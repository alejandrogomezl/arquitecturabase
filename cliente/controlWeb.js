function ControlWeb(){
    this.mostrarAgregarUsuario=function(){
        $("#bnv").remove(); $("#mAU").remove();
        let cadena='<div class="form-group" id="mAU">';
        cadena+='<label for="nick">Nick:</label>';
        cadena+='<p><input type="text" class="form-control" id="nick" placeholder="introduce un nick"></p>';
        cadena+='<button id="btnAU" type="submit" class="btn btn-primary">Submit</button>';
        cadena+='</div>';
        $("#au").append(cadena);
        $("#btnAU").on("click",function(){
            let nick=$("#nick").val();
            rest.agregarUsuario(nick);
            $("#mAU").remove();
        });
    };
    this.comprobarSesion=function(){
        let nick=$.cookie("nick");
        if(nick){ if(typeof google!=="undefined"){ google.accounts.id.cancel(); } cw.mostrarMensaje("Bienvenido al sistema, "+nick); }
        else{ cw.mostrarRegistro(); }
    };
    this.salir=function(){
        $.removeCookie("nick");
        location.reload();
        rest.cerrarSesion();
    };
    this.mostrarMensaje=function(msg){
        $("#au").empty();
        let cadena='<div id="mMsg"><p>'+msg+'</p>';
        cadena+='<button id="btnSalir" class="btn btn-danger">Salir</button></div>';
        $("#au").append(cadena);
        $("#btnSalir").on("click",function(){ cw.salir(); });
    };
    this.limpiar=function(){
        $("#registro").empty();
    };
    this.mostrarRegistro=function(){
        $("#registro").load("./registro.html",function(){
            $("#btnRegistro").on("click",function(){
                let email=$("#email").val();
                let password=$("#password").val();
                if(email && password){
                    $("#errorRegistro").hide();
                    rest.registrarUsuario(email,password);
                }
            });
            $("#btnIrLogin").on("click",function(){
                cw.mostrarLogin();
            });
        });
    };
    this.mostrarModal=function(m){
        $("#msg").remove();
        let cadena="<div id='msg'>"+m+"</div>";
        $('#mBody').append(cadena);
        $('#miModal').modal();
    };
    this.mostrarLogin=function(){
        if($.cookie("nick")){ return true; }
        $("#fmLogin").remove();
        $("#registro").load("./login.html",function(){
            $("#btnLogin").on("click",function(){
                let email=$("#email").val();
                let pwd=$("#pwd").val();
                if(email && pwd){
                    rest.loginUsuario(email,pwd);
                    console.log(email+" "+pwd);
                }
            });
        });
    };
}

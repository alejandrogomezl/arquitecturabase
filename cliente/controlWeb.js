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
        if(nick){ cw.mostrarMensaje("Bienvenido al sistema, "+nick); }
        else{ cw.mostrarAgregarUsuario(); }
    };
    this.salir=function(){ $.removeCookie("nick"); location.reload(); };
    this.mostrarMensaje=function(msg){
        $("#au").empty();
        let cadena='<div id="mMsg"><p>'+msg+'</p>';
        cadena+='<button id="btnSalir" class="btn btn-danger">Salir</button></div>';
        $("#au").append(cadena);
        $("#btnSalir").on("click",function(){ cw.salir(); });
    };
}

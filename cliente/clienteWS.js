function ClienteWS(){
    this.socket=undefined;
    this.email=undefined;
    this.codigo=undefined;
    this.ini=function(){
        this.socket=io.connect();
        this.socket.on("partidaCreada",function(datos){
            console.log(datos.codigo);
            ws.codigo=datos.codigo;
            // cw mostrar esperando rival
        });
        this.socket.on("listaPartidas",function(lista){
            console.log(lista);
            // cw mostrarListaPartidas
        });
        this.socket.on("unidoAPartida",function(datos){
            ws.codigo=datos.codigo;
        });
    };
    this.crearPartida=function(){
        this.socket.emit("crearPartida",{"email":this.email});
    };
    this.unirAPartida=function(codigo){
        this.socket.emit("unirAPartida",{"email":this.email,"codigo":codigo});
    };
    this.ini();
}

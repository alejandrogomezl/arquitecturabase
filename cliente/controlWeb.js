function ControlWeb(){
    this.carrito=[];

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
        if(nick){ if(typeof google!=="undefined"){ google.accounts.id.cancel(); } cw.mostrarPanelPrincipal(nick); }
        else{ cw.mostrarRegistro(); }
    };

    this.salir=function(){
        $.removeCookie("nick");
        location.reload();
        rest.cerrarSesion();
    };

    this.mostrarPanelPrincipal=function(nick){
        $("#au").empty();
        let cabecera='<div id="mCabecera" class="d-flex justify-content-between align-items-center py-2">';
        cabecera+='<span class="font-weight-bold">'+nick+'</span>';
        cabecera+='<button id="btnSalir" class="btn btn-danger btn-sm">Cerrar sesión</button>';
        cabecera+='</div>';
        $("#au").append(cabecera);
        $("#btnSalir").on("click",function(){ cw.salir(); });
        rest.obtenerProductos();
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

    this.mostrarCatalogo=function(productos){
        let cw_ref=this;
        $("#registro").load("./catalogo.html",function(){
            let html="";
            for(let i=0;i<productos.length;i++){
                let p=productos[i];
                html+='<div class="col-md-4 mb-3">';
                html+='<div class="card h-100">';
                html+='<div class="card-body">';
                html+='<h5 class="card-title">'+p.icono+' '+p.nombre+'</h5>';
                html+='<p class="card-text">'+p.descripcion+'</p>';
                html+='<p class="card-text"><strong>'+p.precio+' €</strong></p>';
                html+='<button class="btn btn-primary btn-sm btn-add-cart" data-id="'+p._id+'" data-nombre="'+p.nombre+'" data-precio="'+p.precio+'" data-icono="'+p.icono+'">Añadir al carrito</button>';
                html+='</div></div></div>';
            }
            $("#listaCatalogo").append(html);
            $(".btn-add-cart").on("click",function(){
                let prod={_id:$(this).data("id"),nombre:$(this).data("nombre"),precio:$(this).data("precio"),icono:$(this).data("icono")};
                cw_ref.añadirAlCarrito(prod);
            });
            $("#btnVerCarrito").on("click",function(){
                $("#seccionCarrito").toggle();
                cw_ref.renderizarCarrito();
            });
        });
    };

    this.renderizarCarrito=function(){
        let cw_ref=this;
        let html="";
        if(cw_ref.carrito.length===0){
            html='<p class="text-muted">El carrito está vacío</p>';
        } else {
            html='<ul class="list-group">';
            for(let i=0;i<cw_ref.carrito.length;i++){
                let item=cw_ref.carrito[i];
                html+='<li class="list-group-item d-flex justify-content-between align-items-center">';
                html+=item.icono+' '+item.nombre+' — '+item.precio+' €';
                html+='<button class="btn btn-danger btn-sm btn-del-cart" data-id="'+item._id+'">Eliminar</button>';
                html+='</li>';
            }
            html+='</ul>';
        }
        $("#listaCarrito").html(html);
        $(".btn-del-cart").on("click",function(){
            let id=$(this).data("id");
            cw_ref.eliminarDelCarrito(id);
        });
    };

    this.añadirAlCarrito=function(producto){
        for(let i=0;i<this.carrito.length;i++){
            if(this.carrito[i]._id===producto._id){ return; }
        }
        this.carrito.push(producto);
        let total=this.carrito.length;
        $("#badgeCarrito").text(total).show();
    };

    this.eliminarDelCarrito=function(id){
        this.carrito=this.carrito.filter(function(p){ return p._id!==id; });
        let total=this.carrito.length;
        if(total===0){ $("#badgeCarrito").hide(); } else { $("#badgeCarrito").text(total); }
        this.renderizarCarrito();
    };
}

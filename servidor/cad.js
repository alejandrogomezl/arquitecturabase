const mongo=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectId;

function buscar(coleccion,criterio,callback){
    coleccion.find(criterio).toArray(function(error,usuarios){
        if(usuarios.length==0){
            callback(undefined);
        }
        else{
            callback(usuarios[0]);
        }
    });
}

function insertar(coleccion,elemento,callback){
    coleccion.insertOne(elemento,function(err,result){
        if(err){
            console.log("error");
        }
        else{
            console.log("Nuevo elemento creado");
            callback(elemento);
        }
    });
}

function actualizar(coleccion,obj,callback){
    coleccion.findOneAndUpdate(
        {_id:ObjectId(obj._id)},
        {$set:obj},
        {upsert:false,returnDocument:"after",projection:{email:1}},
        function(err,doc){
            if(err){ throw err; }
            else{
                console.log("Elemento actualizado");
                callback({email:doc.value.email});
            }
        }
    );
}

const PRODUCTOS_SEED=[
    {nombre:"Laptop Pro",descripcion:"Portátil de alto rendimiento",precio:999,icono:"💻"},
    {nombre:"Auriculares BT",descripcion:"Auriculares inalámbricos con cancelación de ruido",precio:149,icono:"🎧"},
    {nombre:"Ratón Ergonómico",descripcion:"Ratón inalámbrico con diseño ergonómico",precio:49,icono:"🖱️"},
    {nombre:"Teclado Mecánico",descripcion:"Teclado mecánico retroiluminado",precio:89,icono:"⌨️"},
    {nombre:"Monitor 4K",descripcion:"Monitor 27\" resolución 4K UHD",precio:399,icono:"🖥️"}
];

function CAD(){
    this.usuarios=null;
    this.logs=null;
    this.productos=null;

    this.conectar=async function(callback){
        let cad=this;
        let conStr=process.env.MONGODB_URI;
        let client=new mongo(conStr);
        await client.connect();
        const database=client.db("sistema");
        cad.usuarios=database.collection("usuarios");
        cad.logs=database.collection("logs");
        cad.productos=database.collection("productos");
        cad.seedProductos();
        callback(database);
    };

    this.seedProductos=async function(){
        let cad=this;
        if(!cad.productos){ return; }
        let count=await cad.productos.countDocuments();
        if(count===0){
            await cad.productos.insertMany(PRODUCTOS_SEED);
            console.log("Seed: 5 productos insertados");
        }
    };

    this.obtenerProductos=function(callback){
        if(!this.productos){ callback([]); return; }
        this.productos.find({}).toArray(function(err,docs){
            callback(err?[]:docs);
        });
    };

    this.buscarOCrearUsuario=function(usr,callback){
        this.usuarios.findOneAndUpdate(
            {email:usr.email},
            {$setOnInsert:{email:usr.email,nick:usr.email}},
            {upsert:true,returnDocument:"after"},
            function(err,doc){
                callback(doc.value);
            }
        );
    };

    this.buscarUsuario=function(obj,callback){
        buscar(this.usuarios,obj,callback);
    };

    this.insertarUsuario=function(usuario,callback){
        insertar(this.usuarios,usuario,callback);
    };

    this.actualizarUsuario=function(obj,callback){
        actualizar(this.usuarios,obj,callback);
    };

    this.insertarLog=function(log){
        if(!this.logs){ return; }
        this.logs.insertOne(log,function(err){
            if(err){ console.log("Error insertando log:",err.message); }
        });
    };

    this.obtenerLogs=function(callback){
        if(!this.logs){ callback([]); return; }
        this.logs.find({}).toArray(function(err,docs){
            callback(err?[]:docs);
        });
    };
}

module.exports.CAD=CAD;

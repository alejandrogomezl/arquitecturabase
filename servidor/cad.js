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

function CAD(){
    this.usuarios=null;

    this.conectar=async function(callback){
        let cad=this;
        let conStr=process.env.MONGODB_URI;
        let client=new mongo(conStr);
        await client.connect();
        const database=client.db("sistema");
        cad.usuarios=database.collection("usuarios");
        callback(database);
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
}

module.exports.CAD=CAD;

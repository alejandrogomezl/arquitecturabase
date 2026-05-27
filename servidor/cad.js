const mongo=require("mongodb").MongoClient;

function CAD(){
  this.usuarios=null;

  this.conectar=async function(callback){
    let cad=this;
    let conStr=process.env.connectionString;
    let client=new mongo(conStr);
    await client.connect();
    const database=client.db("sistema");
    cad.usuarios=database.collection("usuarios");
    callback(database);
  }
}

module.exports.CAD=CAD;

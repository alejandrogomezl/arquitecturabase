const {SecretManagerServiceClient}=require('@google-cloud/secret-manager');

function getClient(){
    return new SecretManagerServiceClient();
}

async function accessCLAVECORREO(){
    const client=getClient();
    const name='projects/procesos-475718/secrets/CLAVECORREO/versions/latest';
    const [version]=await client.accessSecretVersion({name:name});
    const datos=version.payload.data.toString("utf8");
    return datos;
}

async function accessCORREOUSER(){
    const client=getClient();
    const name='projects/procesos-475718/secrets/CORREOUSER/versions/latest';
    const [version]=await client.accessSecretVersion({name:name});
    const datos=version.payload.data.toString("utf8");
    return datos;
}

module.exports.obtenerOptions=async function(callback){
    let options={user:"",pass:""};
    options.user=await accessCORREOUSER();
    options.pass=await accessCLAVECORREO();
    callback(options);
};

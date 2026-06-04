const nodemailer=require("nodemailer");
const gv=require('./gestorVariables.js');

let options={
    user:process.env.GMAIL_USER||"",
    pass:process.env.GMAIL_APP_PASSWORD||""
};

let transporter=nodemailer.createTransport({
    service:'gmail',
    auth:options
});

module.exports.enviarEmail=async function(direccion,key,men,baseUrl){
    gv.obtenerOptions(async function(res){
        options=res;
        transporter=nodemailer.createTransport({service:'gmail',auth:options});
        const link=baseUrl+"/confirmarUsuario/"+direccion+"/"+key;
        await transporter.sendMail({
            from:options.user,
            to:direccion,
            subject:men,
            text:"Pulsa aquí para confirmar cuenta: "+link,
            html:"<p>Bienvenido a Sistema</p><p><a href='"+link+"'>Pulsa aquí para confirmar cuenta</a></p>"
        });
    });
};

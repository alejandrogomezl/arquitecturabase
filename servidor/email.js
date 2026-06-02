const nodemailer=require("nodemailer");
const gv=require('./gestorVariables.js');
const url="http://localhost:3000/";
//const url="tu-url-de-despliegue";

let options={
    user:process.env.GMAIL_USER||"",
    pass:process.env.GMAIL_APP_PASSWORD||""
};

let transporter=nodemailer.createTransport({
    service:'gmail',
    auth:options
});

module.exports.enviarEmail=async function(direccion,key,men){
    gv.obtenerOptions(async function(res){
        options=res;
        transporter=nodemailer.createTransport({service:'gmail',auth:options});
        await transporter.sendMail({
            from:options.user,
            to:direccion,
            subject:men,
            text:"Pulsa aquí para confirmar cuenta",
            html:"<p>Bienvenido a Sistema</p><p><a href='"+url+"confirmarUsuario/"+direccion+"/"+key+"'>Pulsa aquí para confirmar cuenta</a></p>"
        });
    });
};

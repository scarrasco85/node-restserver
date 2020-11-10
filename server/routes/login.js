const express = require('express');
//módulo para encriptar contraseñas
const bcrypt = require('bcrypt');
//Librería jsonwebtoken
const jwt = require('jsonwebtoken');
//Librería para verificar token google
const { OAuth2Client } = require('google-auth-library');
//Definimos CLIENT_ID de google en el archivo /config/config.js
const client = new OAuth2Client(process.env.CLIENT_ID);

//Aquí usamos la nomenclatura con 'Usuario' con mayúscula porque se usará para crear nuevos objetos del esquema
//Usuario con la palabra reservada New
const Usuario = require('../models/usuario');
const { isRegExp } = require('underscore');

const app = express();

//Creamos servicio o ruta 'POST' para el login del usuario
app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        //El error solo saltará si hay una excepción en la consulta de base de datos, es decir que si el usuario
        //introduce un email incorrecto o que no existe devolverá un objeto vacío, no un error
        if (err) {
            //Error 500 sería un error del servidor
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Comprobamos si se ha devuelto un usuario vacío
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    //Aunque no estemos validando la contraseña aún, por seguridad es importante que el usuario
                    //no sepa si está fallando el usuario o la contraseña
                    message: `Usuario o contraseña incorrectos`
                }
            });
        }
        //Validamos contraseña
        //.compareSync encripta la contraseña de primer parámetro y la compara con la contraseña encriptada ya
        //que está en la base de datos, es encriptación de una vía, no se puede volver a retornar el valor, sólo
        //comparar si encriptando se obtiene el mismo resultado. Devuelve true o false
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    //Aunque no estemos validando la contraseña aún, por seguridad es importante que el usuario
                    //no sepa si está fallando el usuario o la contraseña
                    message: `Usuario o contraseña incorrectos`
                }
            });
        }

        //Generamos token válido para 30 días. SEED y CADUCIDAD_TOKEN configuradas en archivo config/config.js
        //ya que serán variables de entorno producción y desarrollo que no queremos que se muestre en el código.
        //Crearemos una variable de entorno en heroku SEED para cuando subamos el proyecto
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token
        });
    });



});

//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    console.log({ payload });
}
//verify().catch(console.error);

//Servicio para login con Google Api
app.post('/google', (req, res) => {

    let token = req.body.idtoken;

    //Función verify de Google
    verify(token);

    res.json({
        token
    });
});



module.exports = app;
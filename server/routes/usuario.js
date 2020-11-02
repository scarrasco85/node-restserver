const express = require('express');
//Aquí usamos la nomenclatura con 'Usuario' con mayúscula porque se usará para crear nuevos objetos del esquema
//Usuario con la palabra reservada New
const Usuario = require('../models/usuario');

const app = express();


app.get('/usuario', function(req, res) {
    res.json('get usuario');
});

app.post('/usuario', function(req, res) {
    let body = req.body;

    //Esto crea una nueva instancia del esquema Usuario con todas la propiedades y métodos que trae mongoose
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: body.password,
        role: body.role
    });

    //Método .save() de mongo es para insertar en la base de datos
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }
        //Cuando sale bien en realidad podemos no mandar el status(200) ya que va implícito en la respuesta
        return res.status(200).json({
            ok: true,
            mensaje: 'Usuario creado correctamente',
            usuario: usuarioDB
        });
    });


    // if (body.nombre === undefined) {

    //     res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario'
    //     });

    // } else {

    //     res.json({
    //         persona: body
    //     });
    // }

});

app.put('/usuario/:id', function(req, res) {

    let id = req.params.id;
    res.json({
        id
    });
});

app.delete('/usuario', function(req, res) {
    res.json('delete usuario');
});

module.exports = app;
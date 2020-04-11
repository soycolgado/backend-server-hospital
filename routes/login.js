var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();
var Usuario = require('../models/usuario');

app.post('/',(req,res)=>{

    var body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioBD)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuarios',
                error: err
            });
        }

        if(!usuarioBD){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                error: {message: ''}
            });
        }

        if(!bcrypt.compareSync(body.password, usuarioBD.password)){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Credenciales incorrectas - password',
                    error: {message: ''}
                });
            
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            id: usuarioBD._id
        });

    });

});


module.exports = app;
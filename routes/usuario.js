var express = require('express');
var jwt = require('jsonwebtoken');
// var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//====================================================
//INICIO Modulo para encriptacion
//====================================================
var bcrypt = require('bcryptjs');
//====================================================
//FIN Modulo para encriptacion
//====================================================

var Usuario = require('../models/usuario');


//====================================================
//INICIO Obtener todos los usuarios
//====================================================
app.get('/',(req, res, next)=>{

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
        (err, usuarios )=>{
        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        Usuario.count({},(err, conteo)=>{
            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });
        });

    });

    
});
//====================================================
//FIN Obtener todos los usuarios
//====================================================






//====================================================
//INICIO Actualizar Usuario
//====================================================

app.put('/:id', mdAutenticacion.verificaToken,(req, res)=>{
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                error: err
            });
        }

        if(!usuario){
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${id} no existe`,
                error: {message: 'No existe un usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el Usuario',
                    error: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });


        });
        

    });
})



//====================================================
//FIN Actualizar Usuario
//====================================================



//====================================================
//INICIO Crear un nuevo Usuario
//====================================================
app.post('/',(req, res)=>{

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado)=>{
        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un usuario',
                error: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

});
//====================================================
//FIN Crear un nuevo Usuario
//====================================================

//====================================================
//INICIO Borrar un usuario
//====================================================

app.delete( '/:id',mdAutenticacion.verificaToken ,( req, res ) => {
    var id = req.params.id;
    Usuario.findByIdAndDelete( id, ( err, usuarioBorrado ) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el Usuario',
                error: err
            });
        }

        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                error: {message: 'No existe un usuario con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

//====================================================
//FIN Borrar un usuario
//====================================================

module.exports = app;
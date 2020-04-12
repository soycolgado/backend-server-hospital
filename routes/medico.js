var express = require('express');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');
//====================================================
//INICIO Obtener todos los medicos
//====================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec((err, medicos)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando medicos',
                errors: err
            });
        }

        Medico.count({}, (err, conteo)=>{
            res.status(200).json({
                ok: true,
                medicos: medicos,
                total: conteo
            });

        });

    });
});
//====================================================
//FIN Obtener todos los medicos
//====================================================


//====================================================
//INICIO Actualizar medico
//====================================================

app.put('/:id',mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;

    var body = req.body;

    Medico.findById(id, (err, medico)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                error: err
            });
        }

        if(!medico){
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id ${id} no existe`,
                error: {message: 'No existe un medico con ese ID'}
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el Usuario',
                    error: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });
});


//====================================================
//FIN Actualizar medico
//====================================================



//====================================================
//INICIO Crear Medico Nuevo
//====================================================

app.post('/', mdAutenticacion.verificaToken, (req, res, next)=>{
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id, 
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado ) => {
        if(err){
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un usuario',
                error: err
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoGuardado,
            usuarioCreador: req.usuario
        });
    });


});
//====================================================
//FIN Crear Medico Nuevo
//====================================================

//====================================================
//INICIO Borrar Medico
//====================================================

app.delete('/:id',mdAutenticacion.verificaToken,(req, res, next)=>{
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el Medico',
                error: err
            });
        }

        if(!medicoBorrado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                error: {message: 'No existe un medico con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});

//====================================================
//FIN Borrar Medico
//====================================================




module.exports = app;
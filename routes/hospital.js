var express = require('express');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');

var Hospital = require('../models/hospital');

var app = express();


//====================================================
//INICIO Obtener Hospitales
//====================================================
app.get('/',(req, res, next)=>{

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec((err, hospitales)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar los hospitales'
            });
        }

        Hospital.count({}, (err, conteo)=>{
            res.status(200).json({
                ok: true,
                hospitales: hospitales,
                total: conteo
            });
        });

    });
});
//====================================================

//FIN Obtener Hospitales
//====================================================


//====================================================
//INICIO Actualizar Hospital
//====================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                error: err
            });
        }

        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe`,
                error: {message: 'No existe el hospital con ese ID'}
            });
        }

        hospital.nombre = body.nombre;
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al Actualizar el hospital'
                });
            }
    
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                body: body
            });
        });
    });


});


//====================================================
//FIN Actualizar Hospital
//====================================================



//====================================================
//INICIO Crear nuevo Hospital
//====================================================

app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id

    });

    hospital.save((err, hospitalGuardado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital'
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioCreado: req.usuario
        });
    });
});

//====================================================
//FIN Crear nuevo Hospital
//====================================================

//====================================================
//INICIO Borrar un hospital
//====================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next)=>{
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                error: err
            });
        }

        if(!hospitalBorrado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                error: {message: 'No existe un hospital con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });

});
//====================================================
//FIN Borrar un hospital
//====================================================


module.exports = app;
var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico  = require('../models/medico');
var Usuario = require('../models/usuario');



//====================================================
//INICIO Busqueda por coleccion
//====================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa

    switch (tabla){
        case 'usuarios': 
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda no corresponden',
                error: {message: 'Tabla no valida'}
            });
    }


    promesa.then(data=>{
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });


});


//====================================================
//FIN Busqueda por coleccion
//====================================================



app.get('/todo/:busqueda', (req, res, next)=>{

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
        ])
    .then(respuestas =>{
        res.status(200).json({
            ok: true,
            mensaje: 'Peticion Realizada correctamente',
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });


    


});
//====================================================
    //INICIO funciones Hospital
    //====================================================
    function buscarHospitales(busqueda, regex){

        return new Promise((resolve, reject) =>{
            Hospital.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .exec((err, hospitales)=>{
                if(err){
                    reject('Error al cargar hospitales', err);
                }else{
                    resolve(hospitales);
                }

            });
        });
    }
    //====================================================
    //FIN funciones Hospital
    //====================================================


    //====================================================
    //INICIO funciones Medico
    //====================================================
    function buscarMedicos(busqueda, regex){

        return new Promise((resolve, reject) =>{
            Medico.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .populate('hopital')
            .exec((err, medicos)=>{
                if(err){
                    reject('Error al cargar medicos', err);
                }else{
                    resolve(medicos);
                }

            });
        });

    }
    //====================================================
    //FIN funciones Medico
    //====================================================

    //====================================================
    //INICIO funciones Usuario
    //====================================================
    function buscarUsuarios(busqueda, regex){
        return new Promise((resolve, reject) => {
            Usuario.find({}, 'nombre email role')
                    .or([{nombre: regex}, {email: regex}])
                    .exec((err, usuarios)=>{
                        if(err){
                            reject('Error al cargar los usuario ',err);
                        }else{
                            resolve(usuarios);
                        }
                    });
        });
    }
    //====================================================
    //FIN funciones Usuario
    //====================================================

module.exports = app;

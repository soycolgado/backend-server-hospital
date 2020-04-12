var express = require("express");

var fileUpLoad = require("express-fileupload");
var fs = require("fs");

var app = express();

var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");

app.use(fileUpLoad());

app.put("/:tipo/:id", (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  //Tipos de coleccion
  var tiposValidos = ["hospitales", "medicos", "usuarios"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de coleccion no es valida",
      error: { message: "Debe seleccionar un tipo valido" },
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No selecciono nada",
      error: { message: "Debe seleccionar una imagen" },
    });
  }

  //Obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split(".");
  var extensionDelArchivo = nombreCortado[nombreCortado.length - 1];

  //Solo estas extensiones aceptamos
  var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  if (extensionesValidas.indexOf(extensionDelArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extension no valida",
      error: {
        message:
          "las extensiones validas son: " + extensionesValidas.join(", "),
      },
    });
  }

  //Nombre de archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionDelArchivo}`;
  //Mover el archivo del temporal a un path
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover archivo",
        error: err,
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo === "usuarios") {
    Usuario.findById(id, (err, usuario) => {
        if(!usuario){
            return res.status(400).json({
                ok: false,
                mensaje: "Usuario no existe",
                error: {message: 'Usuario no existe'}
              });
        }

      var pathViejo = "./uploads/usuarios/" + usuario.img;
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }

      usuario.img = nombreArchivo;

      usuario.save((err, usuarioActualizado) => {

        usuarioActualizado.password = ':)';

        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de usuario actualizada",
          usuarioActualizado: usuarioActualizado
        });
      });
    });
  }
  if (tipo === "hospitales") {
    Hospital.findById(id, (err, hospital)=>{

        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: "Hospital no existe",
                error: {message: 'Hospital no existe'}
              });
        }
        var pathViejo = './uploads/hospitales/'+hospital.img;
        if(fs.existsSync(pathViejo)){
            fs.unlinkSync(pathViejo);
        }

        hospital.img = nombreArchivo;

        hospital.save((err, hospitalActualizado)=>{
            return res.status(200).json({
                ok: true,
                mensaje: "Imagen de hospital actualizada",
                hospitalActualizado: hospitalActualizado
              });
        });
    });
  }
  if (tipo === "medicos") {
      Medico.findById(id, (err, medico)=>{
        if(!medico){
            return res.status(400).json({
                ok: false,
                mensaje: "Medico no existe",
                error: {message: 'Medico no existe'}
              });
        }
        var pathViejo = './uploads/medicos/'+medico.img;

        if(fs.existsSync(pathViejo)){
            fs.unlinkSync(pathViejo);
        }

        medico.img = nombreArchivo;

        medico.save((err, medicoActualizado)=>{
            return res.status(200).json({
                ok: true,
                mensaje: "Imagen de medico actualizada",
                medicoActualizado: medicoActualizado
              });
        });

      });
  }
}

module.exports = app;

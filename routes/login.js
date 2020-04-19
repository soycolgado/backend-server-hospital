var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;
var CLIENT_ID = require("../config/config").CLIENT_ID;
var app = express();
var Usuario = require("../models/usuario");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

//====================================================
//INICIO Autenticacion de Google
//====================================================
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}
verify().catch(console.error);

app.post("/google", async (req, res) => {
  var token = req.body.token;

  var googleUser = await verify(token).catch((e) => {
    return res.status(403).json({
      ok: false,
      mensaje: "Token no valido",
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el usuario",
        error: err,
      });
    }

    if (usuarioBD) {
      if (usuarioBD.google === false) {
        return res.status(400).json({
          ok: false,
          mensaje: "Debe usar su autenticacion normal",
        });
      } else {
        //====================================================
        //INICIO Creacion de Token
        //====================================================
        var token = jwt.sign({ usuario: usuarioBD }, SEED, {
          expiresIn: 14400,
        }); // Horas
        //====================================================
        //FIN Creacion de Token
        //====================================================

        res.status(200).json({
          ok: true,
          usuario: usuarioBD,
          token: token,
          id: usuarioBD._id,
        });
      }
    }else{
        //El usuario no existe, hay que crearlo
        var usuario = new Usuario();

        usuario.nombre = googleUser.nombre;
        usuario.email = googleUser.email;
        usuario.img = googleUser.img;
        usuario.google = true;
        usuario.password = ':)';

        usuario.save((err, usuarioDB)=>{
            //====================================================
        //INICIO Creacion de Token
        //====================================================
        var token = jwt.sign({ usuario: usuarioBD }, SEED, {
            expiresIn: 14400,
          }); // Horas
          //====================================================
          //FIN Creacion de Token
          //====================================================
  
          res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id,
          });
        });
    }
  });

  // return res.status(200).json({
  //        ok: true,
  //        mensaje: 'OK',
  //        googleUser: googleUser
  // });
});

//====================================================
//FIN Autenticacion de Google
//====================================================

app.post("/", (req, res) => {
  var body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar Usuarios",
        error: err,
      });
    }

    if (!usuarioBD) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas - email",
        error: { message: "" },
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas - password",
        error: { message: "" },
      });
    }

    //====================================================
    //INICIO Creacion de Token
    //====================================================
    usuarioBD.password = ":)";
    var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // Horas
    //====================================================
    //FIN Creacion de Token
    //====================================================

    res.status(200).json({
      ok: true,
      usuario: usuarioBD,
      token: token,
      id: usuarioBD._id,
    });
  });
});

module.exports = app;

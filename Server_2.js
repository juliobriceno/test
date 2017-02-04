var express = require("express");
var app     = express();
var path    = require("path");
var bodyParser = require('body-parser');
var session = require('client-sessions');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser'); 
var fileUpload = require('express-fileupload');
var MyDrive = require('./js/drive.js');
var MySheet = require('./js/sheets.js');
var MyMongo = require('./js/mymongo.js');
var MyUnderScore = require('./js/underscore.js');

app.use(cookieParser());

app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/lib", express.static(__dirname + '/lib'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/", express.static(__dirname + '/'));
app.use(fileUpload());

app.use(bodyParser.json());

// must use cookieParser before expressSession
app.use(cookieParser());
app.use(expressSession({ secret: 'somesecrettokenhere', resave: true, saveUninitialized: true }));

var googleapis = require('googleapis')
  , drive = googleapis.drive('v3')

var key = require('./path/serviceaccount.json');
const fs = require('fs');

var jwtClient = new googleapis.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/drive'],
  null
);

app.get('/Solicitudes', function (req, res) {
    res.sendFile(path.join(__dirname + '/solicitudes.html'));
});

app.post('/GetSolicitudes', function (req, res) {
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/Solicitudes'; // Después de la URL (Fija con puerto por defecto Mongo) viene la BD
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log('Tremendo Error!!!!');
        }
        else {
            var collection = db.collection('Solicitudes');
            var filter = { $and: [{ "Fecha": { $gt: new Date(req.body.txtStartDate) } }, { "Fecha": { $lte: new Date(req.body.txtEndDate) } }] };
            if (req.body.selectedEstatus.Id != 0) {
                filter.$and.push({ "Estatus": req.body.selectedEstatus.Name });
            }
            if (req.session.user[0].Email != "admin@gmail.com") {
                filter.$and.push({ "Usuario": req.session.user[0].Email });
            }
            collection.find(filter).toArray(function (err, result) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                var Data = {};
                if (err) {
                    console.log(err);
                } else if (result.length) {
                    console.log('Found:', result);
                    Data.Solicitudes = result;
                    Data.User = req.session.user[0];
                    res.end(JSON.stringify(Data));
                } else {
                    Data.Solicitudes = [];
                    res.end(JSON.stringify(Data));
                    console.log('No document(s) found with defined "find" criteria!');
                }
            });
        }
        db.close();
    });
});

app.post('/UpdateComment', function (req, res) {
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/Solicitudes';
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log('Tremendo Error!!!!');
        }
        else {
            var Data = {};
            var collection = db.collection('Solicitudes');
            var o_id = new mongodb.ObjectID(req.body._id);
            collection.update({ "_id": o_id }, { $set: { Estatus: req.body.Estatus, Comentarios: req.body.Comentarios } }, function (err, result) {
                if (err) {
                    console.log('Tremenda ERROR compadre');
                }
                else {
                    console.log('Tremenda ACTUALIZACIONNNN compadre');
                    Data.User = req.session.user[0];
                    Data.Respuesta = 'Ok';
                    res.end(JSON.stringify(Data));
                }
            });
        }
        db.close();
    });
});

app.post('/AddSolicitud', function (req, res) {
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/Solicitudes';
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log('Tremendo Error!!!!');
        }
        else {
            var collection = db.collection('Solicitudes');
            collection.insert({ Fecha: new Date(), Solicitud: req.body.Solicitud, Tipo: req.body.Tipo, Estatus: 'En Proceso', Usuario: req.body.ActiveUser, Nomina: req.body.Nomina, Periodo: req.body.Periodo, Empleado: req.body.Empleado, UltimoArchivoId: "SD", Comentarios: [{ "Fecha": new Date(), "LeidoAdmin": "No", "LeidoUser": "No", "Comentario": req.body.Solicitud, "Usuario": req.body.ActiveUser }] }, function (err, result) {
                if (err) {
                    console.log('Tremenda ERROR compadre');
                }
                else {
                    console.log('Tremenda CREACIONNNN compadre');
                    res.end(JSON.stringify({ Respuesta: 'Ok' }));
                }
            });
        }
        db.close();
    });
});

app.post('/SaveUser', function (req, res) {
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/Solicitudes';
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log('Tremendo Error!!!!');
        }
        else {
            var collection = db.collection('Usuarios');
            collection.insert( { Email: req.body.Email, Password: req.body.Password, Level: req.body.Level } , function (err, result) {
                if (err) {
                    console.log('Tremenda ERROR compadre');
                }
                else {
                    console.log('Tremenda CREACIONNNN compadre');
                    res.end(JSON.stringify({ Respuesta: 'Ok' }));
                }
            });
        }
        db.close();
    });
});

app.post('/Login', function (req, res) {
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/Solicitudes'; // Después de la URL (Fija con puerto por defecto Mongo) viene la BD
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log('Tremendo Error!!!!');
        }
        else {
            var collection = db.collection('Usuarios'); // La tabla o collection que viene siendo la tabla
            var filter = { $and: [{ "Email": req.body.Usuario }, { "Password": req.body.Contrasena }] };
            collection.find(filter).toArray(function (err, result) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                var Data = {};
                if (err) {
                    console.log(err);
                } else if (result.length) {
                    req.session.user = result;
                    console.log('Found:', req.session.user[0].Email);
                    Data.Login = true;
                    res.end(JSON.stringify(Data));
                } else {
                    Data.Login = false;
                    res.end(JSON.stringify(Data));
                }
            });
        }
        db.close();
    });
});

app.post('/upload', function (req, res) {
    var sampleFile;

    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }

    sampleFile = req.files.file;

    jwtClient.authorize(function (err, tokens) {
        if (err) {
            return console.log(err);
        }

        var FolderId = '';

        MyDrive.createFolder(jwtClient, req.body.Empleado, '0BxzULAzVRMIhb2ZRcU5lRWlKVHc', function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(files);

                    MyDrive.createFolder(jwtClient, req.body.Periodo, files, function (err, files) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(files);
                            FolderId = files;

                            var fileMetadata = {
                                'name': sampleFile.name,
                                parents: [FolderId]
                            };
                            var media = {
                                mimeType: sampleFile.mimetype,
                                body: sampleFile.data
                            };
                            drive.files.create({
                                auth: jwtClient,
                                resource: fileMetadata,
                                media: media,
                                fields: 'id, webContentLink'
                            }, function (err, file) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    res.status(200)
                                    res.send('ok');
                                    res.end();
                                    console.log('File Id: ', file.id);
                                    console.log('weblink: ', file.webContentLink);

                                    MyMongo.Update('Solicitudes', req.body._id, { UltimoArchivoId: file.id }, function (resp)
                                        {
                                        console.log(res);
                                        return 0;
                                        }
                                    );

                                }
                            });


                        }
                    });

                }
            }
        )

    });

});

app.get('/download', function (req, res) {

    jwtClient.authorize(function (err, tokens) {
        if (err) {
            return console.log(err);
        }

        var fileId = '0BxzULAzVRMIhVV94MTM2VmJxYXh1enVhRjJvdGw5aFZubnMw';
        var dest = fs.createWriteStream('./path/recibo');
        drive.files.get({
            auth: jwtClient,
            fileId: fileId,
            alt: 'media'
        })
		.on('end', function () {
		    console.log('Done');
		    var tempFile = './path/recibo';
		    fs.readFile(tempFile, function (err, data) {
		        res.contentType("application/pdf");
		        res.send(data);
		    });
		})
		.on('error', function (err) {
		    console.log('Error during download', err);
		})
		.pipe(dest);

    });

});

app.get('/download2', function (req, res) {

    jwtClient.authorize(function (err, tokens) {
        if (err) {
            return console.log(err);
        }

        var fileId = req.query.fileid;

        drive.files.get({
            auth: jwtClient,
            fileId: fileId,
            alt: 'media'
        }, {
            encoding: null // make sure that we get the binary data
        }, function (err, buffer) {
            // I wrap this in a promise to handle the data
            if (err) console.log('Error during download', err);
            else {
                console.log('Vale aquí está tu archivo de verga');
                const fileType = require('file-type');
                res.contentType(fileType(buffer).mime);
                res.send(buffer);
                console.log(buffer);
                res.end();
            }
        });

    });

});

app.post('/GetEmpleadoFileId', function (req, res) {

    jwtClient.authorize(function (err, tokens) {
        if (err) {
            return console.log(err);
        }

        MyMongo.Find('Solicitudes', { $and: [{ "Nomina": req.body.Nomina }, { "Periodo": req.body.Periodo }, { "Empleado": req.body.Empleado }] }, function (result)
        {
            var Data = {};
            Data.FileId = result[0].UltimoArchivoId;
            res.end(JSON.stringify(Data));
        }
        );

    });

});

function getSheetValuesValidData(values) {
    var a = values;
    var objm = [];
    for (var i = 1; i < a.length; i++) {
        if (a[i][0] == "") {
            return (objm);
        }
        var obj = {};
        for (var b = 0; b < a[i].length; b++) {
            obj[a[0][b]] = a[i][b];
        }
        objm.push(obj);
    }
    return (objm);
}

app.post('/GetEmpleadosData', function (req, res) {

    jwtClient.authorize(function (err, tokens) {
        if (err) {
            return console.log(err);
        }
        else {
            MySheet.GetSheetRange(jwtClient, 'Empleados!A:C', function (sheetEmpleados) {
                var sheetEmpleados = getSheetValuesValidData(sheetEmpleados);
                var Nominas = MyUnderScore.keys(MyUnderScore.countBy(sheetEmpleados, function (sheetEmpleados) { return sheetEmpleados.Nomina; }));
                Nominas = Nominas.map(function (elem) {
                    return { "Name": elem };
                });
                var Periodos = MyUnderScore.keys(MyUnderScore.countBy(sheetEmpleados, function (sheetEmpleados) { return sheetEmpleados.Periodo; }));
                Periodos = Periodos.map(function (elem) {
                    return { "Name": elem };
                });
                var Empleados = MyUnderScore.keys(MyUnderScore.countBy(sheetEmpleados, function (sheetEmpleados) { return sheetEmpleados.Empleado; }));
                Empleados = Empleados.map(function (elem) {
                    return { "Name": elem };
                });
                var Data = {};
                Data.Nominas = Nominas;
                Data.Periodos = Periodos;
                Data.Empleados = Empleados;
                Data.tEmpleados = sheetEmpleados;
                Data.User = req.session.user[0];
                res.end(JSON.stringify(Data));
            }
            );
        }
    });

});

app.listen(3000);

function Execute () {
	var mongodb = require('mongodb');
	var MongoClient = mongodb.MongoClient;
	var url = 'mongodb://localhost:27017/Solicitudes';
	MongoClient.connect(url, function (err, db) {
	    if (err) {
	        console.log('Tremendo Error!!!!');
	    }
	    else {
	        var collection = db.collection('Solicitudes');
	        collection.insert({ Fecha: new Date(2017, 5, 20), Solicitud: 'Alguna otra solicitud', Tipo: 'Peticion', Estatus: 'Cancelada', Comentarios: [] }, function (err, result) {
	            if (err) {
	                console.log('Tremenda ERROR compadre');
	            }
	            else {
	                console.log('Tremenda CREACIONNNN compadre');
	            }
	        });
	}
      db.close();
	});
}

console.log("Running at Port 3000 Ok");
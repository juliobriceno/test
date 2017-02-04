var express = require("express");
var app     = express();
var path = require("path");
var bodyParser = require('body-parser');
var session = require('client-sessions');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var MyMongo = require('./js/mymongo.js');

app.use(cookieParser());

app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/lib", express.static(__dirname + '/lib'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/", express.static(__dirname + '/'));

app.use(bodyParser.json());

// must use cookieParser before expressSession
app.use(cookieParser());
app.use(expressSession({ secret: 'somesecrettokenhere', resave: true, saveUninitialized: true }));

app.use("/", express.static(__dirname + '/'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/Login', function (req, res) {
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/juliobricenoro'; // Después de la URL (Fija con puerto por defecto Mongo) viene la BD
    var url = 'mongodb://juliobricenoro:juliobricenoro@ds139939.mlab.com:39939/juliobricenoro';
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

const port = process.env.PORT || 3000  

app.listen(port);
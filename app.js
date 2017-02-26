var express = require("express");
var CSV = require("comma-separated-values");
var app = express();
var path = require("path");
var bodyParser = require('body-parser');
var session = require('client-sessions');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var MyMongo = require('./js/mymongo.js');
var fileUpload = require('express-fileupload');
var MyMail = require('./js/mails.js');

app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/lib", express.static(__dirname + '/lib'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/", express.static(__dirname + '/'));

app.use(bodyParser.json());
app.use(fileUpload());

// must use cookieParser before expressSession
app.use(cookieParser());
app.use(expressSession({ secret: 'somesecrettokenhere', resave: true, saveUninitialized: true }));

app.use("/", express.static(__dirname + '/'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/getproducts.html'));
});

app.get('/getPanel', function (req, res) {
    if (typeof req.session.user != 'undefined') {
        res.sendFile(path.join(__dirname + '/uploadfile.html'));
    }
    else {
        res.sendFile(path.join(__dirname + '/login.html'));
    }
});

app.post('/closeSession', function (req, res) {
    delete req.session.user;
    res.end(JSON.stringify({ result: 'Ok' }));
});

app.post('/getSession', function (req, res) {
    var Data = {};
    if (typeof req.session.user != 'undefined') {
        Data.Email = req.session.user.Email;
    }
    else {
        Data.Email = 'nc';
    }
    res.end(JSON.stringify(Data));
});

app.post('/Login', function (req, res) {
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://juliobricenoro:juliobricenoro@ds139939.mlab.com:39939/juliobricenoro';
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log('Tremendo Error!!!!');
        }
        else {
            var collection = db.collection('Users'); // La tabla o collection que viene siendo la tabla
            var filter = { $and: [{ "Email": req.body.Email }, { "Password": req.body.Password }] };
            collection.find(filter).toArray(function (err, result) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                var Data = {};
                if (err) {
                    console.log(err);
                } else if (result.length) {
                    req.session.user = result[0];
                    console.log('Found:', req.session.user.Email);
                    Data.Login = true;
                    Data.Email = req.session.user;
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

    var Data = {};

    if (typeof req.session.user == 'undefined') {
        Data.Result = 'nc';
        res.end(JSON.stringify(Data));
        return 0;
    }

    var sampleFile;

    if (!req.files) {
        res.send('No files were uploaded.');
        return 0;
    }

    sampleFile = req.files.file;

    if (sampleFile.mimetype.trim() != 'application/vnd.ms-excel' && sampleFile.mimetype.trim() != 'text/plain')
    {
        Data.Result = 'nt';
        res.end(JSON.stringify(Data));
        return 0;
    }

    if (typeof sampleFile == 'undefined') {
        Data.Result = 'nd';
        res.end(JSON.stringify(Data))
        return 0;
    }

    if (sampleFile.data.byteLength > 250000)
    {
        Data.Result = 'ns';
        res.end(JSON.stringify(Data))
        return 0;
    }

    var Products = [];

    CSV.forEach(sampleFile.data.toString('ascii'), { header: true }, function (record) {
        var Enterprise = { Enterprise: req.session.user.Enterprise, State: req.session.user.State, Email: req.session.user.Email, Phone: req.session.user.Phone };
        Object.assign(Enterprise, record);
        if (typeof record.Descripcion == 'undefined') {
            Data.Result = 'nx';
        }
        Products.push(Enterprise);
    });

    if (Data.Result == 'nx') {
        res.end(JSON.stringify(Data))
        return 0;
    }

    MyMongo.Insert('Inventary', Products, function (result) {
        Data.Result = 'Ok';
        if (result == 'Ok') { res.end(JSON.stringify(Data)) };
    }
    );

});

app.post('/Registration', function (req, res) {

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    MyMongo.Insert('Users', { 'Enterprise': req.body.Enterprise, 'State': req.body.State, 'Phone': req.body.Phone, 'Email': req.body.Email, 'Password': text }, function (result) {
        if (result == 'Ok') {
            MyMail.SendEmail("<b>Aquí está la clave:!!! " + text + "</b><p>", req.body.Email, "Acceso al sistema");
            res.end(JSON.stringify({ result: 'Ok' }))
        };
    }
    );

});

app.post('/RecoverPassword', function (req, res) {

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    MyMongo.Update('Users', { 'Email': req.body.Email }, { 'Password': text }, function (result) {
        if (result == 'Ok') {
            MyMail.SendEmail("<b>Aquí está la clave:!!! " + text + "</b><p>", req.body.Email, "Acceso al sistema");
            res.end(JSON.stringify({ result: 'Ok' }))
        };
    }
    );

});

app.post('/GetProducts', function (req, res) {

    MyMongo.Find('Inventary', { 'Descripcion': { '$regex': req.body.Nombre, $options: 'i' } }, {}, function (result) {
        var Data = {};
        Data.Products = result;
        res.end(JSON.stringify(Data));
    }
    );

});

app.post('/getUserData', function (req, res) {

    var Data = {};

    if (typeof req.session.user == 'undefined') {
        Data.Result = 'nc';
        res.end(JSON.stringify(Data));
        return 0;
    }

    Data.Result = 'Ok';
    Data.Enterprise = req.session.user.Enterprise;
    Data.State = req.session.user.State;
    Data.Phone = req.session.user.Phone;
    Data.Email = req.session.user.Email;
    res.end(JSON.stringify(Data));

});

app.post('/updateUserData', function (req, res) {

    var Data = {};

    if (typeof req.session.user == 'undefined') {
        Data.Result = 'nc';
        res.end(JSON.stringify(Data));
        return 0;
    }

    MyMongo.Update('Users', { 'Email': req.session.user.Email }, { 'Enterprise': req.body.Enterprise, 'State': req.body.State, 'Phone': req.body.Phone }, function (result) {
        if (result == 'Ok') {
            Data.Result = 'Ok';
            res.end(JSON.stringify(Data))
        };
    });
});

app.post('/updatePassword', function (req, res) {

    var Data = {};

    if (typeof req.session.user == 'undefined') {
        Data.Result = 'nc';
        res.end(JSON.stringify(Data));
        return 0;
    }

    MyMongo.Update('Users', { 'Email': req.session.user.Email }, { 'Password': req.body.Password }, function (result) {
        if (result == 'Ok') {
            Data.Result = 'Ok';
            res.end(JSON.stringify(Data))
        };
    });
});

app.post('/GetSuggestProducts', function (req, res) {

    MyMongo.Aggregate('Inventary', [{ "$group": { _id: "$Descripcion", count: { $sum: 1 } } }], function (result) {
        var Data = {};
        Data.SuggestProducts = result;
        res.end(JSON.stringify(Data));
    }
    );

});

const port = process.env.PORT || 3000

app.listen(port);
module.exports = {
    Update: function Update(pcollection, id, set, callback)
    {
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        var url = 'mongodb://localhost:27017/Solicitudes';
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Tremendo Error!!!!');
            }
            else {
                var collection = db.collection(pcollection);
                var o_id = new mongodb.ObjectID(id);
                collection.update({ "_id": o_id }, { $set: set }, function (err, result) {
                    if (err) {
                        console.log('Tremenda ERROR compadre');
                    }
                    else {
                        return callback('Ok');
                    }
                });
            }
            db.close();
        });
    },
    Find: function Find(pcollection, filter, callback)
    {
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        //var url = 'mongodb://localhost:27017/Solicitudes'; // Después de la URL (Fija con puerto por defecto Mongo) viene la BD
        var url = 'mongodb://juliobricenoro:juliobricenoro@ds139939.mlab.com:39939/juliobricenoro';
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Tremendo Error!!!!');
            }
            else {
                var collection = db.collection(pcollection);
                collection.find(filter).toArray(function (err, result) {
                    if (err) {
                        console.log(err);
                    } else if (result.length) {
                        console.log('Found:', result);
                        callback(result);
                    } else {
                        console.log('No document(s) found with defined "find" criteria!');
                    }
                });
            }
            db.close();
        });
    }
}

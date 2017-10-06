var Particle = require('particle-api-js');
const express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Devices = require('./models/devices.js');
var EventsObj = require('./models/eventsObj.js');

const app = express();
var server = require('http').createServer(app);  
var io = require('socket.io')(server);


var particle = new Particle();
var token;

// j'instance la connection mongo 
var promise = mongoose.connect('mongodb://localhost:27017/OBJ_01', {
    useMongoClient: true,
});
// quand la connection est réussie
promise.then(
    () => {
        console.log('db.connected');
        // je démarre mon serveur node sur le port 3000
        server.listen(3000, function() {
            console.log('Example app listening on port 3000!')
        });
    },
    err => {
        console.log('MONGO ERROR');
        console.log(err);
    }

);

// ecouter les evenements
io.sockets.on('connection', function (socket) {
    console.log("un client est connecté");

    socket.emit('monsocket', { hello: "world" });
  // socket.on('vote', function(msg){
  //   votes[msg.vote-1].votes++;
  //   io.sockets.emit('votes', { votes: votes });
  // })
});
// express configs
// j'utilise bodyparser dans toutes mes routes pour parser les res.body en json

// prends en charge les requetes du type ("Content-type", "application/x-www-form-urlencoded")
app.use(bodyParser.urlencoded({
    extended: true
}));
// prends en charge les requetes du type ("Content-type", "application/json")
app.use(bodyParser.json());
// je déclare mon dossier qui contient mes vues
app.set('views', './views');
// je déclare mon type de moteur de rendu
app.set('view engine', 'jade');

// je déclare mes fichiers statiques
app.use('/static', express.static('./client/assets'));
// app.use('/css', express.static('./client/css'));

// Add headers to allow CORS
// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });

// prends en charge les requetes du type ("Content-type", "application/x-www-form-urlencoded")
app.use(bodyParser.urlencoded({
    extended: true
}));
// prends en charge les requetes du type ("Content-type", "application/json")
app.use(bodyParser.json());

// serveur web
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html')
});
app.post('/particle', function(req, res) {
    console.log("une requete est arrivée");
    console.log(req);
});



particle.login({
    username: 'mayormaries@gmail.com', password: '0501sejas'}).then(
    function(data) {
        token = data.body.access_token;
        console.log(token);
        console.log('success');
        var devicesPr = particle.listDevices({
            auth: token
        });
        devicesPr.then(
            function(devices) {
                console.log('Devices: ', devices);
                // devices = JSON.parse(devices);
                console.log(devices.body);
                devices.body.forEach(function(device){
                	var toSave = new Devices(device);
                	

                	toSave.save(function(err, success){
                		if(err){
                			console.log(err);
                		}
                		else{
                			console.log('device saved');
                		}
                	})
                });
            },
            function(err) {
                console.log('List devices call failed: ', err);
            }
        );
        //Get your devices events
        particle.getEventStream({
            deviceId: '4b0042000151353532373238',
            auth: token
        }).then(function(stream) {
            stream.on('event', function(data) {
                console.log("Event: " + JSON.stringify(data));
                io.sockets.emit("emission", data);
            });
        });

    },
    function(err) {
        console.log('Could not log in.', err);
    }
);


// mesurer en continue les evenements via le particle cloud 
// // SYNTAX
// Particle.publish(const char *eventName, const char *data);
// Particle.publish(String eventName, String data);

// // EXAMPLE USAGE
// Particle.publish("temperature", "19 F");

// Particle.publish("BeamStatus", "intact");

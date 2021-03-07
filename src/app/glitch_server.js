// glitch_server.js: template for server.js for glitch.
// generated from doko-server.js
// plus: 
//   var assets = require('./assets');
//   app.use("/assets", assets);
//   const listener = app.listen(process.env.PORT, () => {
//
// serving the dr-doko-web table

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
var assets = require('./assets');

var  router = express.Router();
const bodyParser = require('body-parser')
var table_1 = require("./table");
var ti = require('./tabledata.impl')

var tabledataImpl = new ti.TabledataImpl();

 const HEROES = [
  { id: 11, name: 'Dr Nice' },
  { id: 12, name: 'Narco' },
  { id: 13, name: 'Bombasto' }
];

//var webSocket = require("ws");
// var websocketServer = new webSocket.Server({ app /* server */ });
// var websocketServer = new webSocket.Server({ port: 8081 });

//for each websocket client
// setInterval(function(){
//   websocketServer.clients.forEach( client => {
//     client.send("update");
//   }); 
// }, 500);
function updateClients() {
  //  websocketServer.clients.forEach( client => {
  //    client.send("update");
  //  });
}

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(express.static("."));
app.use(bodyParser.json())

app.use(router)
app.use("/assets", assets);

// https://expressjs.com/en/starter/basic-routing.html
router.get("/", (request, response) => {
  response.sendFile(__dirname + "/index.html");
});


router.get("/api/table", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(tabledataImpl.getTable());
});

router.get("/api/table/result", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(tabledataImpl.getResults());
});

router.get("/api/table/updateCount", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(tabledataImpl.getUpdateCount());
});

function getCallback(tabledataImpl, lastUpdateCount, response, iTry) {
  if (tabledataImpl.getUpdateCount() > lastUpdateCount) {
//    console.log("late response");
    response.json(tabledataImpl.getUpdateCount());
    iTry = 0;
  }
  else {
//    console.log("try again " + iTry.toString() + ", Count " + lastUpdateCount.toString() + " current " + tabledataImpl.getUpdateCount().toString());
    iTry--;
    if (iTry > 0) {
      setTimeout( getCallback.bind(null, tabledataImpl, lastUpdateCount, response, iTry), 100);
    }
    else {
//      console.log("late response");
      response.json(tabledataImpl.getUpdateCount());
    }

  }
}

router.get("/api/table/nextUpdateCount/:lastUpdateCount", (request, response) => {
  //async version of updateCount
  var lastUpdateCount = request.params['lastUpdateCount'];
//  console.log("get next update Count " + lastUpdateCount.toString() + " current " + tabledataImpl.getUpdateCount().toString());
  if (tabledataImpl.getUpdateCount() > lastUpdateCount) {
//    console.log("early response");
    response.json(tabledataImpl.getUpdateCount());
  }
  else {
    iTry = 100;
    setTimeout( getCallback.bind(null, tabledataImpl, lastUpdateCount, response, iTry), 100);
  }
//  console.log("get next update count finished");
});


router.put("/api/table/user/:id", (request, response) => {
  // login a user
  console.log("reveive login user " + request.params['id']);

  if (tabledataImpl.loginUser(request.body)) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});

router.delete("/api/table/user/:id", (request, response) => {
  // logoff a user
  console.log("reveive logoff user " + request.params['id']);

  if (tabledataImpl.logoffUser({name: request.params['id'], token: request.params['id'], password: 'dokoforever'})) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});


router.put("/api/table/newGame/:token", (request, response) => {
  // start new game
  console.log("reveive newGame " + request.params['token'] );

  if (tabledataImpl.newGame(request.params['token'])) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});

router.put("/api/table/announce/weiter/:token", (request, response) => {
  if (tabledataImpl.announceWeiter(request.params['token'])) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});

router.put("/api/table/announce/Solo/:token", (request, response) => {
  console.log("announce solo" + request.body.kindOfSolo.toString());

  if (tabledataImpl.announceSolo(request.body.kindOfSolo, request.params['token'])) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});

router.put("/api/table/announce/TrumpfAbgabe/:token", (request, response) => {
  if (tabledataImpl.announceTrumpfAbgabe(request.params['token'], request.body.announce)) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});


router.put("/api/table/announce/Fuchsjagd/:token", (request, response) => {

  if (tabledataImpl.announceFuchsjagd(request.params['token'], request.body.announce)) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});

router.put("/api/table/announce/Hochzeit/:token", (request, response) => {
  if (tabledataImpl.announceHochzeit(request.body.kindOfHochzeit, request.params['token'])) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});


router.put("/api/table/announce/Re/:token", (request, response) => {
  if (tabledataImpl.announceRe(request.params['token'], request.body.announce)) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});

router.put("/api/table/announce/Kontra/:token", (request, response) => {
  if (tabledataImpl.announceKontra(request.params['token'], request.body.announce)) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});


router.put("/api/table/announce/Kein/:token", (request, response) => {
  if (tabledataImpl.announceKein(request.body.kindOfKein, request.params['token'])) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});

router.put("/api/table/playCard/:token", (request, response) => {
  if (tabledataImpl.playCard(request.body.player, request.params['token'], request.body.cardindex)) {
    response.json("ok");
    updateClients();
  }
  else {
    response.json("denied");
  }
});


router.get("/api/heroes/:id", (request, response) => {
  // express helps us take JS objects and send them as JSON
  console.log("receive get one hero by id " + request.params['id']);
  response.json(HEROES.find(element => element.id == request.params['id']));
});

// send the default array of dreams to the webpage
router.put("/api/heroes/:id", (request, response) => {
  // express helps us take JS objects and send them as JSON
  console.log("receive put heroes " + request.params['id']);
  var hero = HEROES.find(element => element.id == request.params['id']);
  if (hero) {
    hero.name = request.body.name;
  }
  else {
    HEROES.push(request.body);
  }

  response.json("ok");
});

// send the default array of dreams to the webpage
router.post("/api/heroes", (request, response) => {
  // express helps us take JS objects and send them as JSON
  console.log("receive post heroes ");

  var newid = HEROES.length + 12;
  HEROES.forEach( h => newid = Math.max(newid, h.id));
  newid += 1;
  HEROES.push({id: newid, name: request.body.name});
  response.json(HEROES[HEROES.length-1]);
});

// send the default array of dreams to the webpage
router.delete("/api/heroes/:id", (request, response) => {
  // express helps us take JS objects and send them as JSON
  console.log("receive delete heroes " + request.params['id']);
  const index = HEROES.findIndex( h => h.id == request.params['id'])
  console.log("search index of " + request.params['id'] + " found at index " + index);
  if (index >= 0) {
    HEROES.splice(index, 1);
  }
  response.json({id:0, name: ""});
});

// // send the default array of dreams to the webpage
// app.get("/dreams", (request, response) => {
//   // express helps us take JS objects and send them as JSON
//   response.json(dreams);
// });

// listen for requests :)
// do this with for glitch: app.listen(process.env.PORT, () => {

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

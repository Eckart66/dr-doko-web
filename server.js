// server.js
// serving the dr-doko-web table

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const bodyParser = require('body-parser')

 const HEROES = [
  { id: 11, name: 'Dr Nice' },
  { id: 12, name: 'Narco' },
  { id: 13, name: 'Bombasto' }
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
// app.use(express.static("public"));
app.use(express.static("."));
app.use(bodyParser.json())

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  console.log("receive get ");
  response.sendFile(__dirname + "/index.html");
});


// send the default array of dreams to the webpage
app.get("/api/heroes", (request, response) => {
  // express helps us take JS objects and send them as JSON
  console.log("receive get heroes");
  response.json(HEROES);
});



// send the default array of dreams to the webpage
app.get("/api/heroes", (request, response) => {
  // express helps us take JS objects and send them as JSON
  console.log("receive get heroes");
  response.json(HEROES);
});

app.get("/api/heroes/:id", (request, response) => {
  // express helps us take JS objects and send them as JSON
  console.log("receive get one hero by id " + request.params['id']);
  response.json(HEROES.find(element => element.id == request.params['id']));
});

app.put("/api/heroes/:id", (request, response) => {
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

app.post("/api/heroes", (request, response) => {
  // express helps us take JS objects and send them as JSON
  console.log("receive post heroes ");

  var newid = HEROES.length + 12;
  HEROES.forEach( h => newid = Math.max(newid, h.id));
  newid += 1;
  HEROES.push({id: newid, name: request.body.name});
  response.json(HEROES[HEROES.length-1]);
});

app.delete("/api/heroes/:id", (request, response) => {
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
const listener = app.listen(3080, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

# dr-doko-web
An Angular Test Project to play "Doppelkopf" with friends via the Web 

This is a very raw test project, with quite ugly optical appearance by now.
The web ui is developped with Angular. The backend is implemented as a simple REST - like API with Express.js

Build and develop the project:
- You need a node.js installation ( v10 )
- install @angular cli (@angular/cli@11.0 was used)
  npm install -g @angular/cli
- install typescript (typescript@4.1.3 was used)
  npm install -g typescript

- call npm install
- call ng serve to develop the project
- in your browser navigate to `http://localhost:4200/`.

Prepare distribution: 
- call ng build
- in the src/app folder call compile the typescript files for the server to javascript: 
  tsc tabledata.impl.ts
- copy all .js files and the doko-server.js file to dist/dr-doko/web
- from here you can run the server
  node doko-server.js
  
  

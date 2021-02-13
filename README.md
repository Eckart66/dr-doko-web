# dr-doko-web
An Angular Test Project to play "Doppelkopf" with friends via the Web 

This is a very raw test project, with quite ugly optical appearance by now.
The web ui is developped with Angular. The backend is implemented as a simple REST - like API with Express.js

## Build and develop the project:
### Prepare the environment:
- You need a node.js installation ( v10 )
- install @angular cli (@angular/cli@11.0 was used)  
  ```
  npm install -g @angular/cli
  ```
  
- install typescript (typescript@4.1.3 was used)
  ```
  npm install -g typescript
  ```
  
- call 
  ```
  npm install
  ```

### Prepare distribution and run the project
- call 
  ```
  npm run build
  ```
  this calls ng build and also copies the server to the dist/dr-doko-web directory.
  In the directory dist/dr-doko-web you can now start the server 
  ```
  node doko-server.js
  ```

### Develop the project
- like above: 
  call npm run build and 
  In the directory dist/dr-doko-web start the server 
  node doko-server.js

- in the root-directory start
  ```
  ng serve
  ```

- in your browser navigate to `http://localhost:4200/`.


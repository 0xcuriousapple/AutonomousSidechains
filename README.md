## How to run

Install the required libraries:
  
    npm install
   
Run the server:

    npm run beta

Open browser go to localhost:3000

### New Instance on same machine
If you want to open it on differnt port set port="port" and then npm run beta 

### Structure
base : base modules like account,block..
bin  : www 
public : css,js, channel keys
routes : index.js:homepage, r-mainchain : handles req of main, r-sidechain : handles req of side
views  : .pug files (html templates)
app.js : start server

Currently for sidechain channel I have kept it constanr for testing purpose, no matter what you pass.
you can change this in r-sidechain


## What are sidechains
# AutonomousSidechains
Sidechains can be thought of as independent blockchains that have a very specific purpose, function independently of the main chain or other sidechains, and provide for a scalable solution for the decentralized applications of tomorrow. A sidechain is effectively a local road parallel to a highway. Perhaps this local road has several more intersections, stop signs, and traffic moving in different directions. If these intersections and stop signs were put on the highway, things would inevitably slow to a full-blown traffic jam. By appending local roads parallel to the highway, it allows specific traffic to exit and arrive at desired locations at specific times, which keeps the grand highway of the main chain uncongested.
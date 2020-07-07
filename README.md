# AutonomousSidechains

This project has been developed under research we conducted to solve scalability trilemma of blockchain.<br/>
Basically we implemented our own implemenation of <strong>plasma framework.</strong><br/>
We wrote research paper for the same, will upload it once its published.<br/>

[Presentation](https://docs.google.com/presentation/d/1DsOSvJ8OdAVjQLiqv45RebK1eojyybEQ-7y2iwzeU_I/edit?usp=sharing)

## How to run

Install the required libraries:
  
    npm install
   
Run the server:

    npm run beta

Open browser go to localhost:3000

### New Instance on same machine
If you want to open it on differnt port set port="port" and then npm run beta 

### Structure
* base : base modules like account,block..
* bin  : www 
* public : css,js, channel keys
* routes 
    * index.js:homepage, 
    * r-mainchain : handles req of main, 
    * r-sidechain : handles req of sidechain
* views  : .pug files (html templates) [2min Read : How pug works](https://freshman.tech/learn-node/)
* app.js : start server

Currently for sidechain channel I have kept it constant for testing purpose.
you can change this in r-sidechain


### What is Plasma? [Introduction](https://www.learnplasma.org/en/learn/framework.html)

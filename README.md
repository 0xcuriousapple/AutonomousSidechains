# AutonomousSidechains

This project has been developed under research we conducted to solve scalability trilemma of blockchain.<br/>
Basically we implemented our own implemenation of <strong>plasma framework.</strong><br/>
We wrote research paper for the same, will upload it once its published.<br/>

### [Project Presentation](https://docs.google.com/presentation/d/1DsOSvJ8OdAVjQLiqv45RebK1eojyybEQ-7y2iwzeU_I/edit?usp=sharing)
### [Algorithms, Code explanation & Installation Instructions](https://docs.google.com/presentation/d/1aIFxgLzPbZzdDyiI2MCerEFdT9ZTn_u_rjUqOxnWeyM/edit?usp=sharing)
## Demos
[Version 1.0](https://youtu.be/xG6YKWDomIg)
[Dashboard](https://youtu.be/U9hz8xLFXIg)
[Version 2.0](https://youtu.be/yieYNkwQEsU)
[Testing Script](https://youtu.be/3OmRe9pA0Pc)

## Abstract
Blockchain is one of the most promising technologies of
the future. But till date, it is mostly used for transactions that involve
mostly cryptocurrencies. To expand the scope of blockchain beyond
cryptocurrency, it is really important to rethink the structure of existing
blockchain architecture. One of the major factors which hold blockchain
back from being a option to host real-world applications is its lack of
Scalability. This paper presents the solution to scale blockchain using
the concept of Autonomous Sidechains based on the Plasma framework.
Instead of forcing the implementation of all transactions to the mainchain,
we propose to create a new sidechain for every decentralized application.
The sidechains created are autonomous with respect to each other, with
mainchain acting as a backbone of the entire network. This concept
increases the scalability of the blockchain by increasing the number of
transactions network can process at a time.

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

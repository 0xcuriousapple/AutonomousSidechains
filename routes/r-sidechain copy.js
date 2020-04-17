const Account = require("../base/account");
const Transaction = require("../base/transaction");

var express = require("express");
const fs = require("fs");
var router = express.Router();

const sidechain = require("../base/sidechain");
sidechainStore = {};
const account = new Account();
//console.log(account);

router.get("/", function (req, res, next) {
  res.render("v-sidechain-index", { title: "Sidechain" });
});

router.get("/new", function (req, res, next) {
  res.render("v-sidechain-new-step1", { title: "Creating New Sidechain" });
});

router.post("/new/step1", function (req, res, next) {
  // const credentials = {
  //   publishKey: req.body.pubkey,
  //   subscribeKey: req.body.pubkey,
  //   secretKey: req.body.pubkey,
  // };
  const credentials = {
    publishKey: "pub-c-b4ef5ca9-5b50-44f5-a57e-0894ab85c8b1",
    subscribeKey: "sub-c-1a6ad124-7d8f-11ea-8ca3-9e2d2a3ca26d",
    secretKey: "sec-c-NzdhNDFlOTgtNmZlMy00YWJkLTk3YzUtMWM1ZTMzM2ZiYWY4",
  };
  // console.log(req.protocol + "://" + req.get("host") + req.originalUrl);

  //Retrieving no of sidechains already there
  let id;
  const dir = "./public/rootnode-address";

  const readdir = (path) => {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (error, files) => {
        error ? reject(error) : resolve(files);
      });
    });
  };

  readdir(dir).then((files) => {
    id = files.length;
    console.log(id);

    //Saving credentials to files
    const jsonString = JSON.stringify(credentials);
    fs.writeFile(
      `./public/channel_keys/Sidechain-${id}.json`,
      jsonString,
      (err) => {
        if (err) {
          console.log("Error writing file", err);
        } else {
          console.log("Successfully wrote file");
        }
      }
    );

    //Saving root node address to file
    jsonObj = {};
    jsonObj.address = req.protocol + "://" + req.get("host") + req.originalUrl;
    fs.writeFile(
      `./public/rootnode-address/Sidechain-${id}.json`,
      JSON.stringify(jsonObj),
      (err) => {
        if (err) {
          console.log("Error writing file", err);
        } else {
          console.log("Successfully wrote file");
        }
      }
    );

    //Creating instance of side chain

    sidechain_instance = new sidechain({ id, credentials });

    //Creating tx account in this instance

    const transaction = Transaction.createTransaction({ account });

    setTimeout(() => {
      sidechain_instance.pubsub.broadcastTransaction(transaction);
    }, 500);

    //mining this transaction as there is single user only

    //Storing in map
    sidechainStore[id] = sidechain_instance;
    //console.log(Object.keys(sidechainStore).length);

    res.render("v-sidechain-new-step2", {
      title: "New sidechain is Created",
      id: id,
      pubkey: account.address,
      prikey: account.privateKey,
    });
  });
});

router.get("/join", function (req, res, next) {
  res.render("v-sidechain-join", { title: "Joining Sidechain" });
});

router.post("/sidechain-index", function (req, res, next) {
  let oldid;
  const dir = "./public/rootnode-address";
  fs.readdir(dir, (err, files) => {
    oldid = files.length;
  });
  id = req.body.id;
  if (id > oldid) throw err;
  //Retriving keys of channel by id
  let credentials;
  fs.readFile(`./public/channel_keys/Sidechain-${id}.json`, (err, data) => {
    if (err) throw err;
    credentials = JSON.parse(data);
  });

  /*Currently when peer node on sidechain arrives we are rwq blocks from root node which created that 
  particular sidechain, but this need to be devloped such that peer get blocks from other peers */

  //Retrieving root node address
  let rootnode;
  fs.readFile(`./public/rootnode-address/Sidechain-${id}.json`, (err, data) => {
    if (err) throw err;
    rootnode = JSON.parse(data);
  });

  //Synchronization with root node
  sidechain_instance = sidechainStore[id];

  //Creating tx account in this instance

  // const transaction = Transaction.createTransaction({ account });

  // setTimeout(() => {
  //   sidechain_instance.pubsub.broadcastTransaction(transaction);
  // }, 500);

  // //mining this transaction as there is single user only

  // //Storing in map
  // sidechainStore[id] = sidechain_instance;
  // console.log(Object.keys(sidechainStore).length);

  res.render("v-sidechain-new-step2", {
    title: "New sidechain is Created",
    id: id,
    pubkey: account.address,
    prikey: account.privateKey,
  });
});

module.exports = router;

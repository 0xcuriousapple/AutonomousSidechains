const Account = require("../base/account");
const Transaction = require("../base/transaction");

var express = require("express");
const fs = require("fs");
var router = express.Router();

const sidechain = require("../base/sidechain");
sidechainStore = {};

router.get("/", function (req, res, next) {
  res.render("v-sidechain-index", { title: "Sidechain" });
});

router.get("/new", function (req, res, next) {
  res.render("v-sidechain-new-step1", { title: "Sidechain" });
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

  const jsonString = JSON.stringify(credentials);
  fs.writeFile("./public/keys/newCustomer.json", jsonString, (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote file");
    }
  });

  //Creating instance of side chain
  id = Object.keys(sidechainStore).length;
  sidechain_instance = new sidechain({ id, credentials });

  //Creating tx account in this instance
  const account = new Account();
  const transaction = Transaction.createTransaction({ account });

  setTimeout(() => {
    sidechain_instance.pubsub.broadcastTransaction(transaction);
  }, 500);

  //mining this transaction as there is single user only

  //Storing in map
  sidechainStore[id] = sidechain_instance;
  console.log(Object.keys(sidechainStore).length);

  res.render("v-sidechain-new-step2", {
    title: "Sidechain",
    id: id,
    pubkey: account.address,
    prikey: account.privateKey,
  });
});

router.get("/login ", function (req, res, next) {
  res.render("v-login", { title: "Sidechain" });
});

module.exports = router;

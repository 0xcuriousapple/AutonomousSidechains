const Account = require("../base/account");
const Transaction = require("../base/transaction");
const request = require("request");

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

  //Saving credentials to file
  const jsonString = JSON.stringify(credentials);
  id = Object.keys(sidechainStore).length;
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

router.get("/join", function (req, res, next) {
  res.render("v-sidechain-join", { title: "Joining Sidechain" });
});

router.get("/explorer", (req, res, next) => {
  const { id } = req.query;
  //console.log(sidechainStore[id]);
  const { blockchain } = sidechainStore[id];
  const { chain } = blockchain;
  res.json({ chain });
});

router.get("/credentials", (req, res, next) => {
  const { id } = req.query;
  const { credentials } = sidechainStore[id];
  res.json({ credentials });
});

// request(
//   `${BASE_URL}/account/balance` + (address ? `?address=${address}` : ""),
//   (error, response, body) => {
//     return resolve(JSON.parse(body));
//   }
// );

router.post("/sync", function (req, res, next) {
  const reqpromise = (path) => {
    return new Promise((resolve, reject) => {
      request(path, (error, response, body) => {
        error ? reject(error) : resolve(JSON.parse(body));
      });
    });
  };

  reqpromise(
    `${req.body.rootnode_address}/sidechain/credentials?id=${req.body.id}`
  )
    .then((reqpromiseResponse) => {
      console.log(reqpromiseResponse);
      return reqpromise(
        `${req.body.rootnode_address}/sidechain/explorer?id=${req.body.id}`
      );
    })
    .then((reqpromiseResponse2) => {
      console.log(reqpromiseResponse2);
    });

  //sidechain_instance = new sidechain(c)
  var temp;
  request(
    `${req.body.rootnode_address}/sidechain/credentials?id=${req.body.id}`,
    (error, response, body) => {
      // /console.log(body);
      temp = body;
      console.log(temp);
    }
  );
  console.log(temp);
  const { credentials } = JSON.parse(temp);
  console.log(credentials);

  // res.render("v-sidechain-new-step2", {
  //   title: "New sidechain is Created",
  //   id: id,
  //   pubkey: account.address,
  //   prikey: account.privateKey,
  // });
});

module.exports = router;

// var temp;
// request(
//   `http://localhost:3000/sidechain/credentials?id=0`,
//   (error, response, body) => {
//     console.log(body);
//     temp = body;
//     console.log(temp);
//   }
// );
// console.log(temp);
// const { credentials } = JSON.parse(temp);
// console.log(credentials);

// const reqpromise = (path) => {
//   return new Promise((resolve, reject) => {
//     request(path, (error, response, body) => {
//       error ? reject(error) : resolve(JSON.parse(body));
//     });
//   });
// };

// reqpromise("http://localhost:3000/sidechain/credentials?id=0")
//   .then((reqpromiseResponse) => {
//     console.log(reqpromiseResponse);
//     return reqpromise("http://localhost:3000/sidechain/explorer?id=0");
//   })
//   .then((reqpromiseResponse2) => {
//     console.log(reqpromiseResponse2);
//   });

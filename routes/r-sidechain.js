const Account = require("../base/account");
const Transaction = require("../base/transaction");
const Block = require("../base/blockchain/block");

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
  res.render("v-sidechain-new", { title: "New Sidechain" });
});

router.post("/new/success", function (req, res, next) {
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
  //Saving credentials to file
  const jsonString = JSON.stringify(credentials);
  id = Object.keys(sidechainStore).length;
  name = req.body.name;
  // fs.writeFile(
  //   `./public/channel_keys/Sidechain-${id}.json`,
  //   jsonString,
  //   (err) => {
  //     if (err) {
  //       console.log("Error writing file", err);
  //     } else {
  //       console.log("Successfully wrote file");
  //     }
  //   }
  // );

  //Creating instance of side chain

  sidechain_instance = new sidechain({ id, credentials, name });

  //Creating tx account in this instance

  const transaction = Transaction.createTransaction({ account });
  sidechainStore[id] = sidechain_instance;
  setTimeout(() => {
    sidechainStore[id].pubsub.broadcastTransaction(transaction);
  }, 500);

  //mining this transaction as there is single user only

  //Storing in map

  //console.log(Object.keys(sidechainStore).length);

  res.render("v-sidechain-new-success", {
    title: "New Sidechain",
    id: id,
  });
});

router.get("/join", function (req, res, next) {
  res.render("v-sidechain-join", { title: "Join Sidechain" });
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

router.get("/name", (req, res, next) => {
  const { id } = req.query;
  const { name } = sidechainStore[id];
  res.json({ name });
});
router.post("/sync", function (req, res, next) {
  let credentials;
  let chain;
  let name;

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
      //console.log(reqpromiseResponse);
      credentials = reqpromiseResponse.credentials;
      return reqpromise(
        `${req.body.rootnode_address}/sidechain/explorer?id=${req.body.id}`
      );
    })
    .then((reqpromiseResponse2) => {
      //chain=
      chain = reqpromiseResponse2.chain;
      //console.log(reqpromiseResponse2);
      return reqpromise(
        `${req.body.rootnode_address}/sidechain/name?id=${req.body.id}`
      );
    })
    .then((reqpromiseResponse3) => {
      //console.log(credentials);
      name = reqpromiseResponse3.name;
      sidechain_instance = new sidechain({
        id: Object.keys(sidechainStore).length,
        credentials,
        name,
      });
      sidechain_instance.blockchain
        .replaceChain({ chain })
        .then(() => console.log("Synchronized blockchain with the root node"))
        .catch((error) =>
          console.error("Synchronization error:", error.message)
        );

      const transaction = Transaction.createTransaction({ account });
      setTimeout(() => {
        sidechain_instance.pubsub.broadcastTransaction(transaction);
      }, 500);
      sidechainStore[Object.keys(sidechainStore).length] = sidechain_instance;

      res.render("v-sidechain-join-success", {
        title: "Join Sidechain",
        id: Object.keys(sidechainStore).length - 1,
      });
    });
});

router.get("/active", (req, res, next) => {
  // map=[];
  // for (let [key, value] of Object.entries(sidechainStore)) {
  //   console.log(value.name);
  // }
  res.render("v-sidechain-active", {
    title: "Active Sidechains",
    map: sidechainStore,
  });
});

router.get("/active/index", (req, res, next) => {
  console.log("Sdss");
  console.log(Object.keys(sidechainStore).length);
  console.log(req.query);
  res.render("v-sidechain-active-index", {
    title: sidechainStore[req.query.id].name,
    id: req.query.id,
  });
});

router.get("/active/explorer", (req, res, next) => {
  const { id } = req.query;
  //console.log(sidechainStore[id]);
  const { blockchain } = sidechainStore[id];
  const { chain } = blockchain;
  res.json({ chain });
});

router.get("/active/mine", (req, res, next) => {
  const { id } = req.query;
  //console.log(sidechainStore[id]);

  const lastBlock =
    sidechainStore[id].blockchain.chain[
      sidechainStore[id].blockchain.chain.length - 1
    ];
  const block = Block.mineBlock({
    lastBlock,
    beneficiary: account.address,
    transactionSeries: sidechainStore[
      id
    ].transactionQueue.getTransactionSeries(),
    stateRoot: sidechainStore[id].state.getStateRoot(),
  });

  sidechainStore[id].blockchain
    .addBlock({ block, transactionQueue: sidechainStore[id].transactionQueue })
    .then(() => {
      sidechainStore[id].pubsub.broadcastBlock(block);

      res.json({ block });
    })
    .catch(next);
});

router.get("/active/wallet", (req, res, next) => {
  //console.log(account.address);
  const { id } = req.query;
  const balance = Account.calculateBalance({
    address: account.address,
    state: sidechainStore[id].state,
  });
  res.render("v-wallet", {
    title: "Wallet",
    address: account.address,

    balance: balance,
  });
});

router.get("/active/wallet/transfer", (req, res, next) => {
  //console.log(account.address);
  const { id } = req.query;
  to = req.body.to;
  value = parseInt(req.body.value);
  const transaction = Transaction.createTransaction({
    account,
    gasLimit: 0,
    to,
    value,
  });
  sidechainStore[id].pubsub.broadcastTransaction(transaction);
  res.json({ transaction });
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

// let credentials;
// let chain;

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
//     credentials = reqpromiseResponse.credentials;
//     return reqpromise("http://localhost:3000/sidechain/explorer?id=0");
//   })
//   .then((reqpromiseResponse2) => {
//     //chain=
//     chain = reqpromiseResponse2.chain;
//     console.log(reqpromiseResponse2);
//   })
//   .then(() => {
//     console.log(credentials);
//     sidechain_instance = new sidechain({
//       id: Object.keys(sidechainStore).length,
//       credentials,
//     });
//     sidechain_instance.blockchain
//       .replaceChain({ chain })
//       .then(() => console.log("Synchronized blockchain with the root node"))
//       .catch((error) => console.error("Synchronization error:", error.message));
//     sidechainStore[Object.keys(sidechainStore).length] = sidechain_instance;

//     res.render("v-sidechain-join-success", {
//       title: "Join Sidechain",
//       id: Object.keys(sidechainStore).length,
//     });
//   });

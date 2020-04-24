const Account = require("../base/account");
const Transaction = require("../base/transaction");
const Block = require("../base/blockchain/block");
const PubSub = require("../base/api/pubsub");
const request = require("request");
var express = require("express");
const fs = require("fs");
var router = express.Router();
const sidechain = require("../base/sidechain");
sidechainStore = {};

//Creating locker account (MasterAccount) for this host
const masteraccount = new Account();
masteraccount.balance = 1000;
console.log(`Tx of Creation of Master Account with address ${masteraccount.address} is broadcasted`);
const newtransaction = Transaction.createTransaction({ account: masteraccount });
setTimeout(() => {
  pubsubmain.broadcastTransaction(newtransaction);
}, 500);

router.get("/", function (req, res, next) {
  res.render("v-sidechain-index", { title: "Sidechain" });
  //console.log(account);
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

  //for testing purpose keeping it constant
  const credentials = {
    publishKey: "pub-c-b4ef5ca9-5b50-44f5-a57e-0894ab85c8b1",
    subscribeKey: "sub-c-1a6ad124-7d8f-11ea-8ca3-9e2d2a3ca26d",
    secretKey: "sec-c-NzdhNDFlOTgtNmZlMy00YWJkLTk3YzUtMWM1ZTMzM2ZiYWY4",
  };

  id = Object.keys(sidechainStore).length;
  name = req.body.name;
  conversionfactor = parseInt(req.body.conversionfactor);
  freezing_amount = parseInt(req.body.freezing_amount);

  //Creating exit account for this chain
  exitaccount = new Account();

  //Creating instance of side chain
  sidechain_instance = new sidechain({ id, credentials, name, conversionfactor, exitaccount: exitaccount.address });

  //Creating tx account in this instance and deposit
  temp = account;
  temp.balance = freezing_amount * conversionfactor;
  const transaction = Transaction.createTransaction({ account: temp });
  sidechainStore[id] = sidechain_instance;
  setTimeout(() => {
    sidechainStore[id].pubsub.broadcastTransaction(transaction);
  }, 500);

  //Broadcasting creation of exit account tx
  const exittransaction = Transaction.createTransaction({ account: exitaccount });
  setTimeout(() => {
    sidechainStore[id].pubsub.broadcastTransaction(exittransaction);
  }, 500);

  //Freezing/locking amount in main master account

  const ftransaction = Transaction.createTransaction({
    account,
    gasLimit: 0,
    to: masteraccount.address,
    value: freezing_amount,
  });
  pubsubmain.broadcastTransaction(ftransaction);



  //sending data to dashboard
  let { obj } = {
    obj: {
      name: this.name,
      address: req.protocol + '://' + req.get('host'),
      id: this.id
    },
  };
  request.post(
    "https://bkdashboard.herokuapp.com/dashboardsidechain",
    {
      json: {
        obj,
      },
    },
    (error, res, body) => {
      if (error) {
        //console.error(error);
        console.log("---Chrome : socket closed after 2 min")
      }
      else {
        console.log(`statusCode: ${res.statusCode}`);
        console.log(body);
      }
    }
  );

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
router.get("/exitaccount", (req, res, next) => {
  const { id } = req.query;
  const { exitaccount } = sidechainStore[id];
  res.json({ exitaccount });
});
router.get("/cf", (req, res, next) => {
  const { id } = req.query;
  const { conversionfactor } = sidechainStore[id];
  res.json({ conversionfactor });
});
router.post("/sync", function (req, res, next) {
  let credentials;
  let chain;
  let name;
  let freezing_amount = parseInt(req.body.freezing_amount);
  let exitaccount;
  let conversionfactor;

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
    }).then((reqpromiseResponse3) => {

      name = reqpromiseResponse3.name;
      return reqpromise(
        `${req.body.rootnode_address}/sidechain/exitaccount?id=${req.body.id}`
      );
    }).then((reqpromiseResponse4) => {

      exitaccount = reqpromiseResponse4.exitaccount;
      return reqpromise(
        `${req.body.rootnode_address}/sidechain/cf?id=${req.body.id}`
      );
    })
    .then((reqpromiseResponse5) => {
      conversionfactor = reqpromiseResponse5.conversionfactor;
      sidechain_instance = new sidechain({
        id: Object.keys(sidechainStore).length,
        credentials,
        name,
        exitaccount,
        conversionfactor
      });

      sidechain_instance.blockchain
        .replaceChain({ chain })
        .then(() => console.log("Synchronized blockchain with the root node"))
        .catch((error) =>
          console.error("Synchronization error:", error.message)
        );

      temp = account;
      temp.balance = freezing_amount * conversionfactor;
      const transaction = Transaction.createTransaction({ account: temp });
      setTimeout(() => {
        sidechain_instance.pubsub.broadcastTransaction(transaction);
      }, 500);
      sidechainStore[Object.keys(sidechainStore).length] = sidechain_instance;

      //Freezing in main
      const ftransaction = Transaction.createTransaction({
        account,
        gasLimit: 0,
        to: masteraccount.address,
        value: freezing_amount,
      });
      pubsubmain.broadcastTransaction(ftransaction);
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
    id: id,
    balance: balance,
  });
});
router.get("/active/txqueue", (req, res, next) => {
  //console.log(account.address);
  const { id } = req.query;
  res.json(sidechainStore[id].transactionQueue)
});
router.get("/active/balance", (req, res, next) => {
  //console.log(account.address);
  const { address } = req.query;
  id = 0;
  const balance = Account.calculateBalance({
    address,
    state: sidechainStore[id].state,
  });
  res.json({ balance })
});
router.post("/active/transfer", function (req, res, next) {
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

router.get("/active/exit", function (req, res, next) {
  const { id } = req.query;
  const balance = Account.calculateBalance({
    address: account.address,
    state: sidechainStore[id].state,
  });

  const conversionfactor = sidechainStore[id].conversionfactor;
  relbal = parseInt(conversionfactor) / balance;
  res.render("v-sidechain-active-exit", {
    title: "Confirm",
    relbal: relbal,
    id: id,
    balance: balance,
  });

});
router.post("/active/exitconfirm", (req, res, next) => {
  //console.log(account.address);
  const { id } = req.query;
  sidechain_instance = sidechainStore[id];

  //burn
  const balance = Account.calculateBalance({
    address: account.address,
    state: sidechainStore[id].state,
  });
  const btransaction = Transaction.createTransaction({
    account,
    gasLimit: 0,
    to: sidechain_instance.exitaccount,
    value: balance,
  });
  sidechainStore[id].pubsub.broadcastTransaction(btransaction);
  console.log(`All assets in sidechain ${id} for address ${account.address} are sent to be burned (Mining pending)`)

  //release funds
  const amount = balance / sidechain_instance.conversionfactor;
  const rtransaction = Transaction.createTransaction({
    account: masteraccount,
    gasLimit: 0,
    to: account.address,
    value: amount,
  });
  pubsubmain.broadcastTransaction(rtransaction);
  console.log(` length : ${Object.keys(sidechainStore).length}`)
  delete sidechainStore[id];
  console.log(` length : ${Object.keys(sidechainStore).length}`)
  res.json({ btransaction, rtransaction })

});
router.get("/active/convert", function (req, res, next) {
  const { id } = req.query;
  res.render("v-sidechain-active-convert", {
    title: "Conversion",
    id: id,
  });
});
router.post("/active/convertconfirm", function (req, res, next) {
  const { id } = req.query;
  sidechain_instance = sidechainStore[id];

  //burn
  samount = parseInt(req.body.amount);
  console.log(account);
  const btransaction = Transaction.createTransaction({
    account,
    gasLimit: 0,
    to: sidechain_instance.exitaccount,
    value: samount,
  });
  sidechainStore[id].pubsub.broadcastTransaction(btransaction);

  //release funds
  const amount = samount / sidechain_instance.conversionfactor;
  const rtransaction = Transaction.createTransaction({
    account: masteraccount,
    gasLimit: 0,
    to: account.address,
    value: amount,
  });
  pubsubmain.broadcastTransaction(rtransaction);
  res.json({ btransaction, rtransaction })
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

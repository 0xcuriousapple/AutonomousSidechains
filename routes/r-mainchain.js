var express = require("express");
const { ec, keccakHash } = require("../base/util");
var router = express.Router();

const request = require("request");
const Account = require("../base/account");
const Blockchain = require("../base/blockchain");
const Block = require("../base/blockchain/block");
const PubSub = require("../base/api/pubsub");
const State = require("../base/store/state");
const Transaction = require("../base/transaction");
const TransactionQueue = require("../base/transaction/transaction-queue");
const SSE = require('express-sse');

const Main_Keys = require("../public/channel_keys/Mainchain_Keys.json");
const main_credentials = {
  publishKey: Main_Keys.Publish,
  subscribeKey: Main_Keys.Subscribe,
  secretKey: Main_Keys.Secret,
};
//console.log(p);

const state = new State();
const blockchain = new Blockchain({ state });
const transactionQueue = new TransactionQueue();
const pubsub = new PubSub({
  blockchain,
  transactionQueue,
  credentials: JSON.stringify(main_credentials),
});
const account = new Account();
const transaction = Transaction.createTransaction({ account });

//sending data to dashboard
let { obj } = {
  obj: {
    address: account.address,
  },
};

request.post(
  "https://bkdashboard.herokuapp.com/dashboardpeer",
  {
    json: {
      obj,
    },
  },
  (error, res, body) => {
    if (error) {
      // console.error(error);
      console.log("---Chrome : socket closed after 2 min")
    }
    else {
      console.log(`statusCode: ${res.statusCode}`);
      console.log(body);
    }

  }
);
//synchronization getting blocks from root
//Pending : getting blocks from other peers decenterilized

request("http://localhost:3000/mainchain/explorer", (error, response, body) => {
  const { chain } = JSON.parse(body);

  blockchain
    .replaceChain({ chain })
    .then(() => console.log("Synchronized blockchain with the root node"))
    .catch((error) => console.error("Synchronization error:", error.message));
});

setTimeout(() => {
  pubsub.broadcastTransaction(transaction);
}, 500);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("v-mainchain", { title: "Mainchain" });
});

router.get("/explorer", function (req, res, next) {
  const { chain } = blockchain;
  res.json({ chain });
});

router.get("/mine", (req, res, next) => {
  const lastBlock = blockchain.chain[blockchain.chain.length - 1];
  const block = Block.mineBlock({
    lastBlock,
    beneficiary: account.address,
    transactionSeries: transactionQueue.getTransactionSeries(),
    stateRoot: state.getStateRoot(),
  });

  blockchain
    .addBlock({ block, transactionQueue })
    .then(() => {
      pubsub.broadcastBlock(block);

      res.json({ block });
    })
    .catch(next);
});

/*
Pending

This block was to add login functionality to wallet
But as our state, account and chain in memory only
this is too cumberstone

Add login once everything is stored on local db

router.get("/login", (req, res, next) => {
  res.render("v-login", { title: "Mainchain" });
});

router.post("/login/Verify", function (req, res, next) {
  console.log(req.body.pubkey);
  var pubPoint = ec.keyFromSecret(req.body.prikey).getPublic();
  // let signature = ec.sign(msgHash, privKey, "hex", { canonical: true });
  // console.log(signature);
  // req.body.prikey;

  res.render("v-sidechain-new-step2", {
    title: "Sidechain",
    id: id,
    pubkey: account.address,
    prikey: account.privateKey,
  });
});

*/
// router.get("/join", function (req, res, next) {
//   res.render("v-index", { title: "Sidechain" });
// });

router.get("/wallet", (req, res, next) => {
  //console.log(account.address);
  const balance = Account.calculateBalance({
    address: account.address,
    state,
  });
  console.log(balance);
  res.render("v-wallet", {
    title: "Wallet",
    address: account.address,

    balance: balance,
  });
});

router.post("/transfer", function (req, res, next) {
  //Currently in front end only value transfer is mentioned but follwing code is appliable to contracts too
  // const { code, gasLimit, to, value } = req.body;
  // const transaction = Transaction.createTransaction({
  //   account: !to ? new Account({ code }) : account,
  //   gasLimit,
  //   to,
  //   value,
  // });
  //const { to, value } = req.body;
  to = req.body.to;
  value = parseInt(req.body.value);
  const transaction = Transaction.createTransaction({
    account,
    gasLimit: 0,
    to,
    value,
  });
  pubsub.broadcastTransaction(transaction);
  res.json({ transaction });
});

var sse = new SSE();
router.get('/stream', sse.init);

router.get("/trie", function (req, res, next) {
  res.render("v-trie", {
    title: "State Trie"
  });
  sse.send('message');
  sse.send('message', 'message');
  //sse.send('message', eventName);


});
module.exports = router;

var express = require("express");
var router = express.Router();

const request = require("request");
const Account = require("../base/account");
const Blockchain = require("../base/blockchain");
const Block = require("../base/blockchain/block");
const PubSub = require("../base/api/pubsub");
const State = require("../base/store/state");
const Transaction = require("../base/transaction");
const TransactionQueue = require("../base/transaction/transaction-queue");

const Main_Keys = require("../public/keys/Mainchain_Keys.json");
const main_credentials = {
  publishKey: Main_Keys.Publish,
  subscribeKey: Main_Keys.Subscribe,
  secretKey: Main_Keys.Secret,
};

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

// router.get("/join", function (req, res, next) {
//   res.render("v-index", { title: "Sidechain" });
// });
module.exports = router;

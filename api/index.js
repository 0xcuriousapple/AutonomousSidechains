const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const Account = require("../account");
const Blockchain = require("../blockchain");
const Block = require("../blockchain/block");
const PubSub = require("./pubsub");
const State = require("../store/state");
const Transaction = require("../transaction");
const TransactionQueue = require("../transaction/transaction-queue");

const Main_Keys = require("./Mainchain_Keys.json");
const Side_Keys = require("./Sidechain_Keys.json");
const main_credentials = {
  publishKey: Main_Keys.Publish,
  subscribeKey: Main_Keys.Subscribe,
  secretKey: Main_Keys.Secret,
};
const side_credentials = {
  publishKey: Side_Keys.Publish,
  subscribeKey: Side_Keys.Subscribe,
  secretKey: Side_Keys.Secret,
};
const app = express();
app.use(bodyParser.json());

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

const sidechain_state = new State();
const sidechain = new Blockchain({ state: sidechain_state });
const sidechain_transactionQueue = new TransactionQueue();
const sidechain_pubsub = new PubSub({
  blockchain: sidechain,
  transactionQueue: sidechain_transactionQueue,
  credentials: JSON.stringify(side_credentials),
});
const sidechain_account = new Account();
console.log(sidechain_account);
const sidechain_transaction = Transaction.createTransaction({
  account: sidechain_account,
});

setTimeout(() => {
  pubsub.broadcastTransaction(transaction);
}, 500);

setTimeout(() => {
  sidechain_pubsub.broadcastTransaction(sidechain_transaction);
}, 500);

app.get("/blockchain", (req, res, next) => {
  const { chain } = blockchain;

  res.json({ chain });
});

app.get("/sidechain", (req, res, next) => {
  const { chain } = sidechain;

  res.json({ chain });
});

app.get("/blockchain/mine", (req, res, next) => {
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

app.get("/sidechain/mine", (req, res, next) => {
  const lastBlock = sidechain.chain[sidechain.chain.length - 1];
  const block = Block.mineBlock({
    lastBlock,
    beneficiary: sidechain_account.address,
    transactionSeries: sidechain_transactionQueue.getTransactionSeries(),
    stateRoot: sidechain_state.getStateRoot(),
  });
  console.log("sd");
  sidechain
    .addBlock({ block, transactionQueue: sidechain_transactionQueue })
    .then(() => {
      sidechain_pubsub.broadcastBlock(block);

      res.json({ block });
    })
    .catch(next);
});

app.post("/account/transact", (req, res, next) => {
  const { code, gasLimit, to, value } = req.body;
  const transaction = Transaction.createTransaction({
    account: !to ? new Account({ code }) : account,
    gasLimit,
    to,
    value,
  });

  pubsub.broadcastTransaction(transaction);

  res.json({ transaction });
});

app.get("/account/balance", (req, res, next) => {
  const { address } = req.query;

  const balance = Account.calculateBalance({
    address: address || account.address,
    state,
  });

  res.json({ balance });
});

app.use((err, req, res, next) => {
  console.error("Internal server error:", err);

  res.status(500).json({ message: err.message });
});

const peer = process.argv.includes("--peer");
const PORT = peer ? Math.floor(2000 + Math.random() * 1000) : 3000;

if (peer) {
  request("http://localhost:3000/blockchain", (error, response, body) => {
    const { chain } = JSON.parse(body);

    blockchain
      .replaceChain({ chain })
      .then(() => console.log("Synchronized blockchain with the root node"))
      .catch((error) => console.error("Synchronization error:", error.message));
  });
}

app.listen(PORT, () => console.log(`Listening at PORT: ${PORT}`));

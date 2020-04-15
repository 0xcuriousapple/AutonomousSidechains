const Blockchain = require("../blockchain");
const PubSub = require("../api/pubsub");
const State = require("../store/state");
const TransactionQueue = require("../transaction/transaction-queue");

class sidechain {
  constructor({ id, credentials }) {
    this.identifier = id;
    this.state = new State();
    this.blockchain = new Blockchain({ state: this.state });
    this.transactionQueue = new TransactionQueue();
    this.credentials = credentials;

    this.pubsub = new PubSub({
      blockachian: this.blockchain,
      transactionQueue: this.transactionQueue,
      credentials: JSON.stringify(credentials),
    });
  }

  //functions of sidechain
}
// const credentials = {
//   publishKey: "pub-c-b4ef5ca9-5b50-44f5-a57e-0894ab85c8b1",
//   subscribeKey: "sub-c-1a6ad124-7d8f-11ea-8ca3-9e2d2a3ca26d",
//   secretKey: "sec-c-NzdhNDFlOTgtNmZlMy00YWJkLTk3YzUtMWM1ZTMzM2ZiYWY4",
// };
// s = new sidechain({ id: 0, credentials });
module.exports = sidechain;

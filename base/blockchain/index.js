const Block = require("./block");
const request = require("request");

class Blockchain {
  constructor({ state }) {
    this.chain = [Block.genesis()];
    this.state = state;
  }

  addBlock({ block, transactionQueue }) {
    return new Promise((resolve, reject) => {
      Block.validateBlock({
        lastBlock: this.chain[this.chain.length - 1],
        block,
        state: this.state,
      })
        .then(() => {
          this.chain.push(block);

          Block.runBlock({ block, state: this.state });

          // const postTransact = (block) => {
          //   return new Promise((resolve, reject) => {
          //     request(
          //       ,
          //       {
          //         method: "POST",
          //         body: JSON.stringify(block),
          //       },
          //       (error, response, body) => {
          //         return resolve(JSON.parse(body));
          //       }
          //     );
          //   });
          // };
          // console.log(block);
          // postTransact(block).then((postTransactResponse) => {
          //   console.log("data upload to dashbaord");
          // });

          request.post(
            "http://localhost:1234/dashboardblock",
            {
              json: {
                block,
              },
            },
            (error, res, body) => {
              if (error) {
                console.error(error);
                return;
              }
              console.log(`statusCode: ${res.statusCode}`);
              console.log(body);
            }
          );

          transactionQueue.clearBlockTransactions({
            transactionSeries: block.transactionSeries,
          });

          return resolve();
        })
        .catch(reject);
    });
  }

  replaceChain({ chain }) {
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < chain.length; i++) {
        const block = chain[i];
        const lastBlockIndex = i - 1;
        const lastBlock = lastBlockIndex >= 0 ? chain[i - 1] : null;

        try {
          await Block.validateBlock({ lastBlock, block, state: this.state });
          Block.runBlock({ block, state: this.state });
        } catch (error) {
          return reject(error);
        }

        console.log(`*-- Validated block number: ${block.blockHeaders.number}`);
      }

      this.chain = chain;

      return resolve();
    });
  }
}

module.exports = Blockchain;

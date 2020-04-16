const request = require("request");

const { OPCODE_MAP } = require("./interpreter");
const { STOP, ADD, PUSH, STORE, LOAD } = OPCODE_MAP;

const BASE_URL = "http://localhost:3000";

const postTransact = ({ code, to, value, gasLimit }) => {
  return new Promise((resolve, reject) => {
    request(
      `${BASE_URL}/account/transact`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, to, value, gasLimit }),
      },
      (error, response, body) => {
        return resolve(JSON.parse(body));
      }
    );
  });
};

const getMine = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      request(`${BASE_URL}/mainchain/mine`, (error, response, body) => {
        return resolve(JSON.parse(body));
      });
    }, 3000);
  });
};

const getAccountBalance = ({ address } = {}) => {
  return new Promise((resolve, reject) => {
    request(
      `${BASE_URL}/account/balance` + (address ? `?address=${address}` : ""),
      (error, response, body) => {
        return resolve(JSON.parse(body));
      }
    );
  });
};

let toAccountData;

postTransact({})
  .then((postTransactResponse) => {
    console.log(
      "postTransactResponse (Create Account Transaction)",
      postTransactResponse
    );

    toAccountData = postTransactResponse.transaction.data.accountData;

    return getMine();
  })
  .then((getMineResponse) => {
    console.log("getMineResponse", getMineResponse);

    return postTransact({ to: toAccountData.address, value: 20 });
  })
  .then((postTransactResponse4) => {
    console.log(
      "postTransactResponse4 (to the smart contract)",
      postTransactResponse4
    );
    return getMine();
  });

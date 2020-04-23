const Transaction = require("../base/transaction");

const ftransaction = Transaction.createTransaction({
    account,
    gasLimit: 0,
    to: masteraccount,
    value: freezing_amount,
});
pubsubmain.broadcastTransaction(ftransaction);

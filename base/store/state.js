const Trie = require("./trie");

class State {
  constructor() {
    this.stateTrie = new Trie();
    // console.log(this.stateTrie);
    this.storageTrieMap = {};
  }

  putAccount({ address, accountData }) {
    if (!this.storageTrieMap[address]) {
      this.storageTrieMap[address] = new Trie();
    }

    this.stateTrie.put({
      key: address,
      value: {
        ...accountData,
        storageRoot: this.storageTrieMap[address].rootHash,
      },
    });
  }

  getAccount({ address }) {
    return this.stateTrie.get({ key: address });
  }

  getStateRoot() {
    return this.stateTrie.rootHash;
  }
}
// s = new State();
module.exports = State;

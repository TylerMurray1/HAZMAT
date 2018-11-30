const crypto = require('crypto');

class Block {
  constructor(index, timestamp, data, previousHash){
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash(){
    const hashString = this.index + this.previousHash + this.timestamp + JSON.stringify(this.data);
    return crypto.createHash('sha256').update(hashString).digest('hex');
  }

}

module.exports = Block;

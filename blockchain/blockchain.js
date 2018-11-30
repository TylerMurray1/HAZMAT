const Block = require('./block');

class Blockchain {
  constructor() {
    this.chain = [new Block(0, new Date().toUTCString(), 'Genosis Block', '0')]
  }

  getPreviousHash(){
    return this.chain[this.chain.length - 1].hash;
  }

  addBlock(data) {
    const timestamp = new Date().toUTCString();
    const index = this.chain.length;
    const previousHash = this.getPreviousHash();
    const newBlock = new Block(index, timestamp, data, previousHash);
    if(this.isValid(newBlock)){
      this.chain.push(newBlock);
    }
    else{
      console.log('Invalid Block');
    }
  }

  isValid(newBlock){
    const currentBlock = this.chain[this.chain.length-1];
    if(currentBlock.index + 1 !== newBlock.index){
      return false;
    }
    else if(newBlock.previousHash !== currentBlock.hash){
      return false;
    }
    else if(newBlock.hash !== newBlock.calculateHash()){
      return false;
    }
    return true;
  }

  printChain(){
    console.log(this.chain);
  }

}

module.exports = Blockchain;

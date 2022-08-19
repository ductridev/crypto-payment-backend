class Block{
    constructor(paymentID, buyerAddress, toAddress, value, proof){
        this.paymentID = paymentID;
        this.buyerAddress = buyerAddress;
        this.toAddress = toAddress;
        this.value = value;
        this.proof = proof;
    }
}

module.exports = Block;
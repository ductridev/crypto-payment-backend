const CryptoAccount = require("send-crypto");

const sendBCH = async function (request, response) {
    const account = new CryptoAccount(request.params.key);

    const txHash = await account
        .send('bitcoincash:'+ request.params.sellerAddress, request.params.amount, "BCH")
        .on("transactionHash", console.log)
        .on("confirmation", console.log);
}

module.exports = {
    sendBCH
}
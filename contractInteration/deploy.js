const fs = require('fs')
const Caver = require('caver-js')

const URL = process.env.URL || 'https://api.baobab.klaytn.net:8651/';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const FILE_NAME = process.env.FILE_NAME || "timestamp";

async function main() {
  const caver = new Caver(URL)
  const keyring = caver.wallet.keyring.createFromPrivateKey(PRIVATE_KEY)
  caver.wallet.add(keyring)

  let contract = new caver.contract(JSON.parse(fs.readFileSync("./contract/" + FILE_NAME + ".json")))
  contract.deploy({
    data: fs.readFileSync("./contract/" + FILE_NAME + ".bin"),
    arguments: [
      caver.utils.asciiToHex("8490a56c519149549f4625d742f48b1c"), // specID
      "0xE4ffd8d653c54780dbD1708a268488130ebABfdA",               // Contract Address of Oracle
      "0x11c6d510B5009a45EA9832828DE00f8cCe23c19E"                // Contract Address of LinkToken
    ]
  }).send({
    from: keyring.toAccount()._address,
    gas: 1500000,
    value: 0,
  }, function (error, transactionHash) { }
  ).then(function (newContractInstance) {
    // print contract address
    console.log("contract address :", newContractInstance.options.address)
    // write contract address into file
    fs.writeFileSync("./contract/" + FILE_NAME + "-contractAddress.bin", newContractInstance.options.address)
  }).catch(err => { console.log(err) })
}

main()

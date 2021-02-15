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

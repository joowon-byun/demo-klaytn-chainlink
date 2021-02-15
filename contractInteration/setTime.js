const fs = require('fs')
const Caver = require('caver-js')

const URL = process.env.URL || 'https://api.baobab.klaytn.net:8651/';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const FILE_NAME = process.env.FILE_NAME || "timestamp";

async function main() {
  const caver = new Caver(URL)
  const keyring = caver.wallet.keyring.createFromPrivateKey(PRIVATE_KEY)
  caver.wallet.add(keyring)

  let contract = new caver.contract(
    JSON.parse(fs.readFileSync("./contract/" + FILE_NAME + ".json")),
    fs.readFileSync("./contract/" + FILE_NAME + "-contractAddress.bin").toString(),
  )

  // Make time for `setTime`
  var today = new Date();
  var time = "" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  // deploy
  contract.methods.setTimeString(time).send({
    from: keyring.toAccount()._address,
    gas: 1500000,
    value: 0,
  }).then(console.log);
}

main()
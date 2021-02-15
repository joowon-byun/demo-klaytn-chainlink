const fs = require('fs')
const Caver = require('caver-js')

const URL = process.env.URL || 'https://api.baobab.klaytn.net:8651/';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const FILE_NAME = "LinkToken";

async function main() {
  const caver = new Caver(URL)
  const keyring = caver.wallet.keyring.createFromPrivateKey(PRIVATE_KEY)
  caver.wallet.add(keyring)

  let contract = new caver.contract(
    JSON.parse(fs.readFileSync("./contract/" + FILE_NAME + ".json")),
    fs.readFileSync("./contract/" + FILE_NAME + "-contractAddress.bin").toString(),
  )

  contract.methods.transfer(fs.readFileSync("./contract/oracle_timestamp-contractAddress.bin").toString(), 1000).send({
    from: keyring.toAccount()._address,
    gas: 1500000,
    value: 0,
  }).then(console.log
  ).catch(console.log);
}

main()

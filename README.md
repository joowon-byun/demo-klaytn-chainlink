This repo is modified version of https://github.com/Conflux-Network-Global/demo-cfx-chainlink.
# Klaytn Network + Chainlink: Connection Demo

Demonstrating how to connect Klaytn Network and Chainlink together, and thus bringing the world of oracles to Klaytn Network. This is a simple demonstration of how to use an [external initiator](https://github.com/smartcontractkit/chainlink/wiki/External-Initiators) (EI) and [external adapter](https://github.com/smartcontractkit/chainlink/wiki/External-Adapters) (EA) that allows for an external server to interact with a simple on-chain smart contract. The smart contract inherits [ChainLinkClient](https://github.com/smartcontractkit/chainlink/blob/v0.9.10/evm-contracts/src/v0.6/ChainlinkClient.sol) which also utilizes [Oracle](https://github.com/smartcontractkit/chainlink/blob/v0.9.10/evm-contracts/src/v0.6/Oracle.sol) and [LinkToken](https://github.com/smartcontractkit/LinkToken/blob/master/contracts/v0.6/LinkToken.sol).

There are two main implications:

1. The connection of Chainlink to Klaytn Network allows for the growth of all types of oracles on Klaytn Network to power exchanges, other oracle needs, and bridge Web2 technology with Web3.
1. The specific implementation of using an API server to interact with the blockchain has the potential for opening access to Web3 for users without good internet connection in areas across the world.

### Diagrams
Demonstration diagrams for the various connections and the interaction sequences to connect a Klaytn Network smart contract to external API server using Chainlink.

![](./diagrams/chainlink_sms_labelled.png)

![](./diagrams/chainlink_smsSequence.png)

## Setup Steps

Generalized setup steps for the configuration of Chainlink components - more details are provided for connecting the various pieces together. Please see [Chainlink](https://docs.chain.link/docs) documentation if more details on configuration and setup are needed.

Before configuring the Chainlink components, there needs to be an oracle contract on the Klaytn Network that emits events. This is needed for the EI to trigger job runs on the Chainlink node. See the [contractInteraction](./contractInteraction) folder for code to interact with the Klaytn Network.

### Deploying contracts
For this project, you need to know LinkToken and Oracle contract address. You can deploy them by the following steps.

#### Deploying LinkToken Contract
If you want to connect your oracle to an existing LinkToken contract, use [CONTRACT ADDRESS] in cypress network. If you want to deploy the contract for test purpose, follow the steps.
```
git clone https://github.com/smartcontractkit/LinkToken
cd LinkToken
nvm use 12
yarn remove @truffle/hdwallet-provider                            # remove eth hdwallet
yarn                                                              # install dependencies
yarn add klaytn/truffle-hdwallet-provider-klaytn#v5.1.63-klaytn   # install klaytn hdwallet
```
Add the code in `truffle-config.js`:
```
  networks: {
    baobab: {
      provider: () => new HDWalletProvider(privateKey, "https://api.baobab.klaytn.net:8651"),
      network_id: '1001', //Klaytn baobab testnet's network id
      gas: '8500000',
      gasPrice: null
    },
    cypress: {
      provider: () => new HDWalletProvider(privateKey, "https://api.cypress.klaytn.net:8651"),
      network_id: '8217', //Klaytn mainnet's network id
      gas: '8500000',
      gasPrice: null
    }
  },
```
To compile and deploy contract :
```
yarn compile                                                  # compile contract
PRIVATE_KEY= truffle deploy --network baobab -f 02 --to 02    # deploy LinkToken
```

#### Deploying Oracle Contract
```
git clone git@github.com:winnie-byun/chainlink.git
cd chainlink
git checkout klaytn-contract
nvm use 12.0.0
yarn install            # install dependencies
yarn setup:contracts    # install tools for contract and compile contract
cd evm-contracts
# Change the LinkToken address in `migrations/02_oracle.js`.
PRIVATE_KEY= truffle deploy --network baobab -f 02 --to 02    # deploy oracle contract
```

### PostgreSQL
Before running a Chainlink node, you should install postgreSQL.
```
brew update
brew install postgres
ln -sfv /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents
alias pg_start="launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist"
alias pg_stop="launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist"
pg_start
createdb chainlink      # db for a chainlink node
createdb chainlink_ei   # db for an external initiator
```

### Running a Chainlink Node

These steps involves running a Chainlink node in a local environment. (To run a chainlink node from a docker container, checkout [developer documentation](https://docs.chain.link/docs/running-a-chainlink-node).)
```
git clone git@github.com:smartcontractkit/chainlink.git
cd chainlink
git checkout v0.9.10
vi .env
```
Below is a sample `.env` file. The default $USERNAME value is the OS account name.
_Note: An ETH client URL is not required_
```
LOG_LEVEL=debug
MIN_OUTGOING_CONFIRMATIONS=2
LINK_CONTRACT_ADDRESS=
CHAINLINK_TLS_PORT=0
SECURE_COOKIES=false
ALLOW_ORIGINS=*
DATABASE_TIMEOUT=0
DATABASE_URL=postgresql://$USERNAME@localhost:5432/chainlink?sslmode=disable
ETH_DISABLED=true
FEATURE_EXTERNAL_INITIATORS=true
CHAINLINK_DEV=true
```
To run a chainlink node, go 1.14 and node 12.18 should be installed. Checkout `README.md` in the chainlink repo for detail.
```
nvm use 12.18
make install
./chainlink node n    # starts a chainlink node
```

During setup, a node password and a username/password is required for setup. The node password is used each time the node is started. The username/password is used for accessing the node UI at `http://localhost:6688` and for other parts of setup.

### Setting Up an External Initiator

External initiators observe a blockchain node endpoint and will trigger runs on the Chainlink node.  
_Note: Prerequisite for Go to be installed. See [here](https://golang.org/doc/install) for instructions._

Clone and build the [external initiator repository](https://github.com/winnie-byun/external-initiator/tree/klaytn) (forked from main repository to adapt for Conflux Network)

```
git clone git@github.com:winnie-byun/external-initiator.git
cd external-initiator
git checkout klaytn
go build
```

The external initiator can be started up using:
_Note: the database URL should be separate from the Chainlink node database_
```
./external-initiator "{\"name\":\"klaytn-baobab\",\"type\":\"klaytn\",\"url\":\"wss://api.baobab.klaytn.net:8652\"}" \
--port=8080 \
--databaseurl=postgresql://$USERNAME@localhost:5432/chainlink_ei?sslmode=disable \
--chainlinkurl=http://localhost:6688 \
--ic_accesskey=9a2c358f8dde42a6b34a36c2c78325a9 \
--ic_secret=09e9kX+rg835zu6gQV24Apw4dJmpyxZNvbIouQHL+AIuG1qDjZYqFdNeh2D7lgR9 \
--ci_accesskey=aMSu02u9zcDUHs21tEGx4zekN8mGb2OiJbqgByIT3DjmemLOPpq7z9lhR8EfepUK \
--ci_secret=+RtYy893GINTNi9DlqxvGjsF7mUaVIfBJfkMKuoZntlG1YkyuJS6sFYYIcMIL4Kq
```

The defualt websockect addresses for Klaytn are as below :
_Note: Public EN has a timeout and limited number of connections. For this reason, there could be continuous errors, but chainlink continuously tries to reconnect to the client. There would be no problem for testing. (If you are running a klaytn client in a local environment, checkout `wsreaddeadline`, `wswritedeadline` and `wsmaxconnections` flags for websocket connection.)_
| Network        | Local run                    | Public EN                              |
| -------------- | ---------------------------- | -------------------------------------- |
| Baobab         | ws://localhost:8546/         | wss://api.baobab.klaytn.net:8652       |
| Cypress        | ws://localhost:8546/         | wss://api.cypress.klaytn.net:8652      |

The external initiator uses websocket for connection. However, if you want to use rpc, refer the following :
| Network        | Local run                    | Public EN                              |
| -------------- | ---------------------------- | -------------------------------------- |
| Baobab         | http://localhost:8551/       | https://api.baobab.klaytn.net:8651     |
| Cypress        | http://localhost:8551/       | https://api.cypress.klaytn.net:8651    |

The 4 keys are needed to run an external initiator. They are generated by the Chainlink node with the following process. (Checkout [Link](https://docs.chain.link/docs/miscellaneous) for Chainlink/Docker documentation.)
```
cd chainlink                                                      # Go to chainlink repo cloned from `Running a Chainlink Node` step
./chainlink admin login
./chainlink initiators create klaytn http://localhost:8080/jobs   # The 4 keys are generated in the same order as listed above.
```

### Creating a Bridge for an External Adapter

An external adapter is provided in the [external-adapters-js/klaytn](https://github.com/winnie-byun/external-adapters-js/tree/klaytn/klaytn). It is a simple server using Express and Chainlink package that  sends the information to the smart contract on Klaytn Network.

```
git clone git@github.com:winnie-byun/external-adapters-js.git
cd external-adapters-js
git checkout klaytn
cd klaytn
yarn
PRIVATE_KEY= URL=https://api.baobab.klaytn.net:8651 EA_PORT=5002 yarn start
```
In order to connect the external adapter, one bridge is used. Go to `http://localhost:6688/` in your web and add the following in Bridge.

| Bridge Name    | Endpoint                     | Functionality                          |
| -------------- | ---------------------------- | -------------------------------------- |
| `klaytnSendTxOracle`  | http://172.17.0.1:5002 | Sending transaction to Klaytn Network |

### Running an API server

A simple API server are provided in the [api_server_timetamp](./api_server_timestamp) folder. The server returns the current time.
```
cd api_server_timestamp
yarn            # install dependencies
node index.js   # starts server
```

### Connecting Everything Together

In order to create the necessary connections between the components (Klaytn Network and Chainlink node), a job run on the node need to be created. This can be done by accessing the node via the `localhost:6688` address and logging in.

The job spec is for connecting the external initiator and can be found [here](./jobSpecs/externalInitiator.json). It send transactions to the smart contract.

```
{
  "initiators": [
    {
      "type": "external",
      "params": {
        "name": "klaytn",
        "body": {
          "endpoint": "klaytn-baobab",
          "addresses": ["0xE4ffd8d653c54780dbD1708a268488130ebABfdA"]
        }
      }
    }
  ],
  "tasks": [
    {"type": "klaytnSendTxOracle"}
  ]
}
```

### Deploying and Calling Consumer Contract
Now you are ready to deploy your consumer code. The consumer code can be found at `./contractInteraction/contract/oracle_timestamp.sol`.
```
cd ./contractInteraction
yarn
PRIVATE_KEY= FILE_NAME=oracle_timestamp node deploy
```

You can call functions in the comsumer contract by the following commands:
```
PRIVATE_KEY= node LinkToken-transfer      # transfer LinkToken to your consumer contract
PRIVATE_KEY= node LinkToken-balanceOf     # check the balance in your contract
PRIVATE_KEY= FILE_NAME=oracle_timestamp node emitEvent    # request timestamp
PRIVATE_KEY= FILE_NAME=oracle_timestamp node getInfo      # check if the data is stored
```

### Notes

- This is a demonstration integration, there are many improvements that can be made from a increased security, code optimization, and testing perspectives

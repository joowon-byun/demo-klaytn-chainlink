This is a list of issues, I confronted when trying to connect chainlink to Klaytn.

1.  ```
    [ERROR] GasUpdater: error retrieving block 50592107: missing required field 'sha3Uncles' for Header logger/default.go:139   stacktrace=github.com/smartcontractkit/chainlink/core/logger.Error
    ```
    When : Running a chainlink node
    Reason : By default, a chainlink node tries to connect to a client with the given environment variables. Check if `ETH_DISABLED=true` is set and `ETH_CHAIN_ID`, `ETH_URL`, `ETH_SECONDARY_URL` are not set. This error happened to me when I set both `ETH_DISABLED=true ETH_CHAIN_ID=1001`.

1.  ```
    $ belt compile all
    ›   Warning: compile is not a belt command.
    ```
    When : `yarn compile` at [smartcontractkit/chainlink/evm-contracts](https://github.com/smartcontractkit/chainlink/tree/develop/evm-contracts).
    Reason : `belt` is a tool made from chainlink project. Be sure to run `yarn setup:contracts` at the top most `chainlink` repo.

1.  ```
    Invalid solidity version format
    ```
    When : `yarn compile` at [smartcontractkit/chainlink/evm-contracts](https://github.com/smartcontractkit/chainlink/tree/develop/evm-contracts).
    Reason : It is solved when you change the solidity version in `app.conf.json` as specified in the error log. The format differs depending on the node version. (You can check the full version name at [Etherscan](https://etherscan.io/solcversions) )
      - When you are using node 12.0.0, use the solidity version :
        ```
        "versions": {
          "v0.4": "0.4.24+commit.e67f0147",
          "v0.5": "0.5.0+commit.1d4f565a",
          "v0.6": "0.6.6+commit.6c089d02",
          "v0.7": "0.7.0+commit.9e61f92b"
        }
        ```
      - When you are using node 12.18.0, use the solidity version :
        ```
        "versions": {
          "v0.4": "0.4.24",
          "v0.5": "0.5.0",
          "v0.6": "0.6.6",
          "v0.7": "0.7.0"
        }
        ```

1.  ```
    invalid r, v, s
    ```
    ```
    insufficient gas
    ```
    ```
    evm reverted
    ```
    When : `truffle deploy` in LinkToken or Oracle using hdwallet
    Reason : There is a truffle's hdwallet-provider for klaytn; [truffle-hdwallet-provider-klaytn](https://github.com/klaytn/truffle-hdwallet-provider-klaytn). But it is not updated for a long time and does not support node 12. You can use [hdwallet](https://github.com/trufflesuite/truffle/tree/develop/packages/hdwallet-provider) for klaytn. But you need to change some lines in hdwallet. After installing the node packages, go to `./node_modules/@truffle/hdwallet-provider/dist/index.js` and find `signTransaction` function. Set the chainID or gas like the following :
    ```
    txParams.chainId = '0x3E9';
    txParams.gas = "0x500000";
    ```
    ChainID for Baobab is `0x3E9` and for Cypress, `0x2019`.
    ([v5.1.63-klaytn](https://github.com/klaytn/truffle-hdwallet-provider-klaytn/tree/v5.1.63-klaytn) is a temporary branch, you can use directly. It is the modified version of [hdwallet v5.1.63](https://github.com/trufflesuite/truffle/tree/v5.1.63/packages/hdwallet-provider).)

1.  ```
    evm reverted
    ```
    When : calling or sending transaction to contract
    Reason : If a transaction is reverted, it could leave a log why it is reverted. Check the [debug.traceTrnasaction](https://docs.klaytn.com/bapp/json-rpc/api-references/debug/tracing#debug_tracetransaction). (You cannot do this with the public EN. You should run your own node with the `debug` option on in `kend.conf`.)
    ```
    $ ./bin/ken attach ./data/klay.ipc
    > debug.traceTransaction("0xbae8bd56daa6a3f1bba16854d14e37f265e76976c960ac57c4c7b56a78729e53", {tracer:'revertTracer'})
    "reverted due to XXX"
    ```

1.  ```
    evm reverted
    ```
    When : calling `emitRequest`, or `requestTime` with no revert reason found
    Reason : It happened to me when the oracle address is not set correctly with `setChainlinkToken(link);` in solidity. Also, be sure to have enough LinkToken in your consumer, or client, contract.
    How to send LinkToken to your contract : If you deployed a LinkToken contract, you should have LinkToken in your account. Use the following code :
    ```
    cd ./contractInteraction
    PRIVATE_KEY= node LinkToken-transfer      # transfer LinkToken to your consumer contract
    PRIVATE_KEY= node LinkToken-balanceOf     # check the balance in your contract
    ```

1.  ```
    unexpected end of JSON input []
    ```
    When : connecting to a EN with ws timeout.
    Reason : UNKOWN. No problem when running.

1.  chainlink subscribe event more than 1 time
    Reason : Every time a chainlink node goes through a task, it emits all results to all other consequent tasks. Try running it with DEBUG mode off when running a chainlink node. TODO : check this

1.  ```
    evm reverted
    known transaction
    ```
    When: in klaytn adapter log
    Reason : Chainlink node accumulates and sends all previous result to the klaytn adapter. Check the first send log. The first request could have succeded and the subsequent requests always make the errors.

1. ```
    evm reverted
    invalid request ID
    ```
    When : calling `setTime()` directly
    Reason : `setTime()` should be called from an oracle contract. In `sendChainlinkRequestTo()`, a request ID is set with an oracle address. In `recordChainlinkFulfillment(requestID)`, it checks if the sender is the oracle contract. `setTime()` should be called through the oracle contract. You can check a calling example in [`adapter.ts`](https://github.com/winnie-byun/external-adapters-js/blob/klaytn/klaytn/src/adapter.ts#L42-L52).

1.  ```
    evm reverted
    Invalid int value
    ```
    when : calling `sendfulfillment`
    Reason : The last parameter should be bytes32 type. You can convert them through [`caver.utils.leftPad(Web3.utils.numberToHex(value), 64)]`](https://github.com/winnie-byun/external-adapters-js/blob/klaytn/klaytn/src/adapter.ts#L32-L45) Be sure to pass the correct type.

1.  sendfulfillment is called with no errors but not set.
    When : calling `sendfulfillment`
    Reason : Not sure why. But it looks like the passing types should be one of int256, uint256, bytes32, bool. It happened to me when setting string type.

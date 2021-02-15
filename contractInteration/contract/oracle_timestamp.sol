// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "https://github.com/smartcontractkit/chainlink/blob/v0.9.10/evm-contracts/src/v0.6/ChainlinkClient.sol";

contract ConsumerTimestamp is ChainlinkClient {
  bytes32 internal specId;        // Job ID created from Chainlink node
  address internal oracleAddress; // Oracle Address that ChainLink listens to
  uint256[] public times;

  constructor (address _oracleAddress, address _link) public {
    specId =  "8490a56c519149549f4625d742f48b1c";
    oracleAddress = _oracleAddress;
    setChainlinkOracle(_oracleAddress);
    setChainlinkToken(_link);
  }

  // requestTime requests time from off-chain
  function requestTime() public {
    Chainlink.Request memory req = buildChainlinkRequest(specId, address(this), this.setTime.selector);
    req.add("httpgetwithunrestrictednetworkaccess", "http://localhost:5000");
    sendChainlinkRequestTo(oracleAddress, req, 10);
  }

  // setTime is called from off-chain
  function setTime(bytes32 _requestId, uint256 t) public recordChainlinkFulfillment(_requestId) {
    emit RequestFulfilled(_requestId, t);
    times.push(t);
  }

  // getTime can check what is stored in time
  function getTime() public view returns (uint256[] memory) {
      return times;
  }
}

// contracts/BoxV2.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract BoxV2 {
  // ... code from Box.sol
  uint256 private _value;
  // Auth private _auth;

  // Emitted when the stored value changes
  event ValueChanged(uint256 value);

  // constructor() {
  // _auth = new Auth(msg.sender);
  // }

  // Stores a new value in the contract
  function store(uint256 value) public {
    // Require that the caller is registered as an administrator in Auth
    // require(_auth.isAdministrator(msg.sender), 'Unauthorized');

    _value = value;
    emit ValueChanged(value);
  }

  // Reads the last stored value
  function retrieve() public view returns (uint256) {
    return _value;
  }

  // Increments the stored value by 1
  function increment() public {
    _value = _value + 1;
    emit ValueChanged(_value);
  }
}

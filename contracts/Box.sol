// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Import Auth from the access-control subdirectory
// import './access-control/Auth.sol';

// Import Ownable from the OpenZeppelin Contracts library
// import '@openzeppelin/contracts/access/Ownable.sol';

// contract Box is Ownable {
//   uint256 private _value;
//   // Auth private _auth;

//   // Emitted when the stored value changes
//   event ValueChanged(uint256 value);

//   constructor() {
//     // _auth = new Auth(msg.sender);
//   }

//   // Stores a new value in the contract
//   function store(uint256 value) public onlyOwner {
//     // Require that the caller is registered as an administrator in Auth
//     // require(_auth.isAdministrator(msg.sender), 'Unauthorized');

//     _value = value;
//     emit ValueChanged(value);
//   }

//   // Reads the last stored value
//   function retrieve() public view returns (uint256) {
//     return _value;
//   }
// }

contract Box {
  uint256 private _value;
  // Auth private _auth;

  // We can safely add a new variable after the ones we had declared
  address private _owner;

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
}

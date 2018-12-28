pragma solidity ^0.4.24;

contract IMinterRole {

  event MinterAdded(address indexed account);
  event MinterRemoved(address indexed account);

  function isMinter(address account) external view returns (bool);
  function addMinter(address account) external;
  function renounceMinter() external;
}

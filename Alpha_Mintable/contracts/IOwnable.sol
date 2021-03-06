pragma solidity ^0.4.23;


contract IOwnable {
  function owner () external view returns (address) ;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );

  function renounceOwnership() external;
  function transferOwnership(address _newOwner) external;
}

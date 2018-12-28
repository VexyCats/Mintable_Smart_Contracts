pragma solidity ^0.4.24;

import './IERC721Enumerable.sol';
import './IERC721Metadata.sol';
import './IMinterRole.sol';
import './IOwnable.sol';

contract IMintableDonation721 is IERC721Enumerable, IERC721Metadata, IMinterRole, IOwnable {

  function MINTABLE_URI () external view returns (string);
  function version () external view returns (string);
  function ready () external view returns (bool);
  function mintableDonation () external view returns (address);
  function discounts (uint256 id) external view returns (uint256);

  //------------------Type Conversion----------------------------//
  function uintToString (uint256 v) external view returns (string str);

  //------------------MintableDonation721-----------------------//
  function getDiscount (uint256 _tokenId) external view returns (uint256);
  function fetchData (uint256 _tokenId) external view returns (string discount, string tokenId, string);
  function tokenIdExists (uint256 _tokenId) external view returns (bool);
  function isMintableDonation (address _address) external view returns (bool);
  function setMintableDonation (address _mintableDonation) external returns (bool);
  function mint (address _to, uint256 _discount) external returns (bool);

}

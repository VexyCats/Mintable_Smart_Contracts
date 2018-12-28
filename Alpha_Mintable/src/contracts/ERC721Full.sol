pragma solidity ^0.4.24;

import "./ERC721Enumerable.sol";
import "./ERC721MetadataMintable.sol";

/**
 * @title Full ERC721 Token
 * This implementation includes all the required and some optional functionality of the ERC721 standard
 * Moreover, it includes approve all functionality using operator terminology
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721Full is ERC721Enumerable, ERC721MetadataMintable {
 string public version = "Mintable v0.1" ;

  constructor(string name, string symbol, string url, address owner) ERC721Metadata(name, symbol)
    public
  {

    _mint(owner, 0);
        _setTokenURI(0, url);

  }




}

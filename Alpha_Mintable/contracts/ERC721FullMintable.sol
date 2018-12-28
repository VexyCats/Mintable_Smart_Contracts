pragma solidity ^0.4.24;


import "./ERC721Enumerable.sol";
import "./ERC721Metadata.sol";
import "./ERC721MetadataMintable.sol";
import "./MinterRole.sol";

/**
 * @title Full ERC721 Token
 * This implementation includes all the required and some optional functionality of the ERC721 standard
 * Moreover, it includes approve all functionality using operator terminology
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
contract ERC721FullMintable is  ERC721Enumerable, ERC721Metadata, MinterRole {
 string public version = "Mintable v0.1" ;

  struct metaData {
     string data;
     string data1;
     string data2;
  }
  // Mapping from TokenID that stores data to said token.



  mapping (uint256 => metaData) public tokenIDtometaData;
  constructor(string name, string symbol, string url, string _input1, string _input2, string _input3, address _owner) ERC721Metadata(name, symbol)
    public
  {

    mint(_owner, url, _input1, _input2, _input3);

  }



  /**
   * @dev returns the metaData associated  with the tokenID passed in
   * @param _tokenId address owning the tokens list to be accessed
   *
   * @return string, string, string, uint256 token ID at the given index of the tokens list owned by the requested address
   */
  function fetchData(uint256 _tokenId)
  public
  view
  returns (string, string, string){
    require(_tokenId <= totalSupply());

    return (tokenIDtometaData[_tokenId].data, tokenIDtometaData[_tokenId].data1, tokenIDtometaData[_tokenId].data2);
  }

  /**
   * @dev public function to mint a new token
   * @dev Reverts if the given token ID already exists
   * @param _to address the beneficiary that will own the minted token
   *
   */
  function mint(address _to, string _url, string _input1, string _input2, string _input3) public onlyMinter {
  uint256 tokenId = totalSupply();
   _mint(_to, tokenId, _url,  _input1, _input2,  _input3);
  }
  /**
   * @dev Internal function to mint a new token
   * @dev Reverts if the given token ID already exists
   * @param _to address the beneficiary that will own the minted token
   * @param _tokenId uint256 ID of the token to be minted by the msg.sender
   */
  function _mint(address _to, uint256 _tokenId, string _url, string _input1, string _input2, string _input3) internal {

    super._mint(_to, _tokenId);


     _setTokenURI(_tokenId, _url);
    tokenIDtometaData[_tokenId].data = _input1;
    tokenIDtometaData[_tokenId].data1 = _input2;
    tokenIDtometaData[_tokenId].data2 = _input3;


  }



}

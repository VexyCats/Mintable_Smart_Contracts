pragma solidity ^0.4.24;

import './ERC721Enumerable.sol';
import './ERC721Metadata.sol';
import './MinterRole.sol';
import './Ownable.sol';

contract MintableDonation721 is ERC721Enumerable, ERC721Metadata, MinterRole, Ownable {

  string constant public MINTABLE_URI = 'https://mintable.app/discount-cards';
string public version = "Mintable v0.1" ;
  bool public ready = false;
  address public mintableDonation;

  mapping (uint256 => uint256) discounts;


  constructor ()
    public
    ERC721Metadata('Mintable', 'MTB')
  {
    mintableDonation = msg.sender;
  }

  //------------------Type Conversion----------------------------//
  //https://ethereum.stackexchange.com/questions/10932/how-to-convert-string-to-int
  function uintToString(uint256 v)
    public pure
  returns (string) {
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            uint remainder = v % 10;
            v = v / 10;
            reversed[i++] = byte(48 + remainder);
        }
        bytes memory s = new bytes(i + 1);
        for (uint j = 0; j <= i; j++) {
            s[j] = reversed[i - j];
        }
       return string(s);
    }

  //------------------MintableDonation721-----------------------//

  modifier onlyMintableDonation() {
    require(isMintableDonation(msg.sender), 'Only MinatableDonation can make this call');
    _;
  }
  modifier onlyTokenId(uint256 _tokenId) {
    require(tokenIdExists(_tokenId), 'TokenID does not exist');
    _;
  }

  function getDiscount (uint256 _tokenId)
    public view
  returns (uint256) {
       require(tokenIdExists(_tokenId));
    return discounts[_tokenId];
  }


  /**
   * @dev returns the metaData associated  with the tokenID passed in
   * @param _tokenId address owning the tokens list to be accessed
   *
   * @return string, string, string, uint256 token ID at the given index of the tokens list owned by the requested address
   */
  function fetchData(uint256 _tokenId)
    public view onlyTokenId(_tokenId)
  returns (string discount, string tokenId, string) {
    return(uintToString(discounts[_tokenId]), uintToString(_tokenId), '');
  }

  function tokenIdExists(uint256 _tokenId)
    public view
  returns (bool) {
    return _exists(_tokenId);
  }

  function isMintableDonation(address _address)
    public view
  returns(bool) {
    return isMinter(_address);
  }

  function addMinter(address account) public {
    revert ('Use setMintableDonation');
  }

  function setMintableDonation (address _mintableDonation)
    public onlyOwner
  returns (bool) {
    _removeMinter(mintableDonation);
    _addMinter(_mintableDonation);
    mintableDonation = _mintableDonation;
    ready = true;
    return ready;
  }

  /**
   * @dev public function to mint a new token
   * @dev Reverts if the given token ID already exists
   * @param _to address the beneficiary that will own the minted token
   *
   */
  function mint(address _to, uint256 _discount)
    public onlyMinter
  returns (bool) {
    uint256 tokenId = totalSupply();
    _mint(_to, tokenId, _discount);
    _setTokenURI(tokenId, MINTABLE_URI);
    return true;
  }

  /**
   * @dev Internal function to mint a new token
   * @dev Reverts if the given token ID already exists
   * @param _to address the beneficiary that will own the minted token
   * @param _tokenId uint256 ID of the token to be minted by the msg.sender
   */
  function _mint(address _to, uint256 _tokenId, uint256 _discount) internal {
    super._mint(_to, _tokenId);
    discounts[_tokenId] = _discount;
  }
}

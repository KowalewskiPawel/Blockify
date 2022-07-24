//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlockifyToken is ERC20, Ownable {
    constructor() ERC20("Blogify Token", "BGFY") {
        _mint(msg.sender, 100000 * (10 ** 18));
    }

    function createBlog() external {
        uint256 blogCost = 10000;
        address platformAddress = owner();
        transferFrom(tx.origin, platformAddress, blogCost);
    }

    function followBlog(address _caller, address _blogOwner) external {
        address platformAddress = owner();
        uint256 followCostToCreator = 900;
        uint256 followCostToPlatform = 100;
        transferFrom(_caller, _blogOwner, followCostToCreator);
        transferFrom(_caller, platformAddress, followCostToPlatform);
    }

    function addCommentTransaction(address _caller, address _blogOwner) external {
        address platformAddress = owner();
        uint256 commentCostToCreator = 300;
        uint256 commentCostToPlatform = 100;
        transferFrom(_caller, _blogOwner, commentCostToCreator);
        transferFrom(_caller, platformAddress, commentCostToPlatform);
    }
}
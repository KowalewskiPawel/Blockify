// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./libraries/Base64.sol";

import {DataTypes} from "./types/DataTypes.sol";

contract Blogify is ERC721 {

    using SafeMath for uint64;
    using Counters for Counters.Counter;
    
    constructor() ERC721("Blogify", "BLFY") {
    }
}
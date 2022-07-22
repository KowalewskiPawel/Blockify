// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./libraries/Base64.sol";

import {DataTypes} from "./DataTypes.sol";

contract Blockify is ERC721 {

    using SafeMath for uint64;
    using Counters for Counters.Counter;

    Counters.Counter private _blogId;

    mapping(uint256 => DataTypes.Blog) public blogs;
    mapping(string => DataTypes.Comment[]) public postComments;
    mapping(uint256 => address) public blogsOwners;
    mapping(uint256 => address[]) public blogFollowers;
    mapping(string => DataTypes.Comment[]) public blogComments;
    mapping(uint256 => bool) public doesBlogExist;
    mapping(string => bool) public doesBlognameExist;

    event BlogNFTMinted(address sender, uint256 blogId, DataTypes.Blog blogData);
    event PostAdded(DataTypes.Post postAdded);
    event CommentAdded(DataTypes.Comment commentAdded);
    event BlogFollowed(address follower);
    
    constructor() ERC721("Blockify", "BGFY") {
    }

    modifier isBlogOwner(uint256 _memberId) {
        require(blogsOwners[_memberId] == msg.sender, "Not the owner of the blog");
        _;
    }

    modifier doesBlogIdExist(uint256 _userId) {
        require(doesBlogExist[_userId], "Blog doesn't exist");
        _;
    }

    modifier blognameExist(string memory _username) {
        require(!doesBlognameExist[_username], "Blog name already exist!");
        _;
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        DataTypes.Blog memory blogAttributes = blogs[
            _tokenId
        ];

        string
            memory coverPicture = blogAttributes.coverPicture;
        string memory followers = Strings.toString(blogFollowers[_tokenId].length);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                         '{"Blog Title": "'
                        ,
                        blogAttributes.blogname
                        ,'","Blog No: "',
                        Strings.toString(_tokenId),
                        '", "description": "Blockify NFT", "image": "',
                        coverPicture,
                        '","attributes": [ { "trait_type": "Followers", "value": ',
                        followers,
                        '}, } ]}'
                    )
                )
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        
        return output;
    }

    function checkProfileOwner(uint256 _blogToCheckId) public view returns (DataTypes.Blog memory) {
        if (blogsOwners[_blogToCheckId] == msg.sender) {
            return blogs[_blogToCheckId];
        } else {
            revert("Not the owner of the blog");
        }
    }

    function mintBlogNFT(string memory _blogname, string memory _blogdid, string memory _coverPicture)
        external blognameExist(_blogname)
    {
        uint256 newBlogId = _blogId.current();
        _safeMint(msg.sender, newBlogId);
        
        DataTypes.Blog memory newBlog = DataTypes.Blog({
            blogId: newBlogId,
            blogDid: _blogdid,
            blogname: _blogname,
            coverPicture: _coverPicture,
            followers: 0
        });

        blogs[newBlogId] = newBlog;
        blogsOwners[newBlogId] = msg.sender;
        doesBlogExist[newBlogId] = true;
        doesBlognameExist[_blogname] = true;
        _blogId.increment();
        emit BlogNFTMinted(msg.sender, newBlogId, newBlog);
    }


    function addComment(string memory _commentToAdd, string memory _postId) external {
        
        DataTypes.Comment memory newComment = DataTypes.Comment({
            idOfPost: _postId,
            content: _commentToAdd,
            authorId: msg.sender,
            date: block.timestamp
        });

        postComments[_postId].push(newComment);
        emit CommentAdded(newComment);
    }

    function getComments(string memory _postId) public view returns(DataTypes.Comment[] memory){
        return postComments[_postId];
    }

    function followBlog(uint256 _followedBlogId) external doesBlogIdExist(_followedBlogId) {
        blogFollowers[_followedBlogId].push(msg.sender);
        emit BlogFollowed(msg.sender);
    }

    function getBlogFollowers(uint256 _blogFollowersId) public view doesBlogIdExist(_blogFollowersId) returns(address[] memory) {
        return blogFollowers[_blogFollowersId];
    }
}
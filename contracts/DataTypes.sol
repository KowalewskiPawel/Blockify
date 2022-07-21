// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity ^0.8.0;

library DataTypes {

    struct Blog {
        uint256 blogId;
        string blogname;
        string coverPicture;
        uint256 followers;

    }

    struct Comment {
        string idOfPost;
        string content;
        address authorId;
        uint date;
    }

    struct Post {
        string id;
        string title;
        string content;
        string picture;
        string video;
        string username;
        uint authorId;
        uint date;
    }
}

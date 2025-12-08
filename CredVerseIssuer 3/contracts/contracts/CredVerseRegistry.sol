// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CredVerseRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Issuer {
        bool isRegistered;
        string did;
        string domain;
        bool isRevoked;
    }

    struct Anchor {
        bytes32 rootHash;
        uint256 timestamp;
        address submitter;
    }

    mapping(address => Issuer) public issuers;
    mapping(bytes32 => Anchor) public anchors;
    mapping(bytes32 => bool) public revokedCredentials;

    event IssuerRegistered(address indexed issuerAddress, string did, string domain);
    event AnchorSubmitted(bytes32 indexed rootHash, address indexed submitter, uint256 timestamp);
    event CredentialRevoked(bytes32 indexed credentialHash, address indexed revoker, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function registerIssuer(address _issuerAddress, string memory _did, string memory _domain) external onlyRole(DEFAULT_ADMIN_ROLE) {
        issuers[_issuerAddress] = Issuer(true, _did, _domain, false);
        _grantRole(ISSUER_ROLE, _issuerAddress);
        emit IssuerRegistered(_issuerAddress, _did, _domain);
    }

    function anchorCredential(bytes32 _rootHash) external onlyRole(ISSUER_ROLE) {
        anchors[_rootHash] = Anchor(_rootHash, block.timestamp, msg.sender);
        emit AnchorSubmitted(_rootHash, msg.sender, block.timestamp);
    }

    function revokeCredential(bytes32 _credentialHash) external onlyRole(ISSUER_ROLE) {
        revokedCredentials[_credentialHash] = true;
        emit CredentialRevoked(_credentialHash, msg.sender, block.timestamp);
    }

    function isRevoked(bytes32 _credentialHash) external view returns (bool) {
        return revokedCredentials[_credentialHash];
    }
}

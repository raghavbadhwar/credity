// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CredVerseRegistry is AccessControl, ReentrancyGuard {
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
    mapping(bytes32 => address) public credentialOwners;

    event IssuerRegistered(address indexed issuerAddress, string did, string domain);
    event IssuerRevoked(address indexed issuerAddress, uint256 timestamp);
    event AnchorSubmitted(bytes32 indexed rootHash, address indexed submitter, uint256 timestamp);
    event CredentialRevoked(bytes32 indexed credentialHash, address indexed revoker, uint256 timestamp);

    error InvalidAddress();
    error InvalidInput();
    error IssuerAlreadyRegistered();
    error IssuerNotRegistered();
    error IssuerRevoked();
    error AnchorAlreadyExists();
    error CredentialAlreadyRevoked();
    error UnauthorizedRevocation();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function registerIssuer(address _issuerAddress, string memory _did, string memory _domain) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (_issuerAddress == address(0)) revert InvalidAddress();
        if (bytes(_did).length == 0) revert InvalidInput();
        if (bytes(_domain).length == 0) revert InvalidInput();
        if (issuers[_issuerAddress].isRegistered) revert IssuerAlreadyRegistered();
        
        issuers[_issuerAddress] = Issuer(true, _did, _domain, false);
        _grantRole(ISSUER_ROLE, _issuerAddress);
        emit IssuerRegistered(_issuerAddress, _did, _domain);
    }

    function revokeIssuer(address _issuerAddress) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (!issuers[_issuerAddress].isRegistered) revert IssuerNotRegistered();
        if (issuers[_issuerAddress].isRevoked) revert IssuerRevoked();
        
        issuers[_issuerAddress].isRevoked = true;
        _revokeRole(ISSUER_ROLE, _issuerAddress);
        emit IssuerRevoked(_issuerAddress, block.timestamp);
    }

    function anchorCredential(bytes32 _rootHash) external onlyRole(ISSUER_ROLE) nonReentrant {
        if (_rootHash == bytes32(0)) revert InvalidInput();
        if (issuers[msg.sender].isRevoked) revert IssuerRevoked();
        if (anchors[_rootHash].timestamp != 0) revert AnchorAlreadyExists();
        
        anchors[_rootHash] = Anchor(_rootHash, block.timestamp, msg.sender);
        credentialOwners[_rootHash] = msg.sender;
        emit AnchorSubmitted(_rootHash, msg.sender, block.timestamp);
    }

    function revokeCredential(bytes32 _credentialHash) external onlyRole(ISSUER_ROLE) nonReentrant {
        if (_credentialHash == bytes32(0)) revert InvalidInput();
        if (issuers[msg.sender].isRevoked) revert IssuerRevoked();
        if (revokedCredentials[_credentialHash]) revert CredentialAlreadyRevoked();
        
        // Verify the caller is the original issuer who anchored this credential
        address credentialOwner = credentialOwners[_credentialHash];
        if (credentialOwner != address(0) && credentialOwner != msg.sender) {
            revert UnauthorizedRevocation();
        }
        
        revokedCredentials[_credentialHash] = true;
        emit CredentialRevoked(_credentialHash, msg.sender, block.timestamp);
    }

    function isRevoked(bytes32 _credentialHash) external view returns (bool) {
        return revokedCredentials[_credentialHash];
    }

    function isIssuerRevoked(address _issuerAddress) external view returns (bool) {
        return issuers[_issuerAddress].isRevoked;
    }

    function getIssuerInfo(address _issuerAddress) external view returns (bool isRegistered, string memory did, string memory domain, bool isRevoked) {
        Issuer memory issuer = issuers[_issuerAddress];
        return (issuer.isRegistered, issuer.did, issuer.domain, issuer.isRevoked);
    }

    function getAnchorInfo(bytes32 _rootHash) external view returns (bytes32 rootHash, uint256 timestamp, address submitter, bool exists) {
        Anchor memory anchor = anchors[_rootHash];
        if (anchor.timestamp == 0) {
            return (bytes32(0), 0, address(0), false);
        }
        return (anchor.rootHash, anchor.timestamp, anchor.submitter, true);
    }
}

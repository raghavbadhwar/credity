
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialRegistry", function () {
    let registry;
    let owner, issuer, otherAccount;

    beforeEach(async function () {
        [owner, issuer, otherAccount] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("CredVerseRegistry");
        registry = await Factory.deploy();
        await registry.waitForDeployment();
    });

    it("Should register an issuer", async function () {
        await registry.getFunction("registerIssuer")(issuer.address, "did:example:123", "example.com");
        // issuers mapping
        // public mapping is available as function
        const issuerData = await registry.getFunction("issuers")(issuer.address);
        expect(issuerData.isRegistered).to.equal(true);
        expect(issuerData.did).to.equal("did:example:123");
    });

    it("Should anchor credential", async function () {
        await registry.getFunction("registerIssuer")(issuer.address, "did:example:123", "example.com");
        const hash = ethers.id("credential-data");
        await registry.connect(issuer).getFunction("anchorCredential")(hash);
        const anchor = await registry.getFunction("anchors")(hash);
        expect(anchor.submitter).to.equal(issuer.address);
    });

    it("Should revoke credential", async function () {
        await registry.getFunction("registerIssuer")(issuer.address, "did:example:123", "example.com");
        const hash = ethers.id("credential-revoke");
        await registry.connect(issuer).getFunction("revokeCredential")(hash);
        expect(await registry.getFunction("isRevoked")(hash)).to.equal(true);
    });
});

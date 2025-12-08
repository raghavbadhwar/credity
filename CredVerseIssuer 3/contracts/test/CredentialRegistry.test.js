
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredVerseRegistry", function () {
    let registry;
    let owner, issuer, otherAccount;

    beforeEach(async function () {
        [owner, issuer, otherAccount] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("CredVerseRegistry");
        registry = await Factory.deploy();
        await registry.waitForDeployment();
    });

    describe("Issuer Registration", function () {
        it("Should register an issuer", async function () {
            await registry.registerIssuer(issuer.address, "did:example:123", "example.com");
            const issuerData = await registry.issuers(issuer.address);
            expect(issuerData.isRegistered).to.equal(true);
            expect(issuerData.did).to.equal("did:example:123");
        });

        it("Should reject duplicate issuer registration", async function () {
            await registry.registerIssuer(issuer.address, "did:example:123", "example.com");
            await expect(
                registry.registerIssuer(issuer.address, "did:example:456", "other.com")
            ).to.be.revertedWithCustomError(registry, "IssuerAlreadyRegistered");
        });

        it("Should reject zero address registration", async function () {
            await expect(
                registry.registerIssuer(ethers.ZeroAddress, "did:example:123", "example.com")
            ).to.be.revertedWithCustomError(registry, "InvalidAddress");
        });
    });

    describe("Credential Anchoring", function () {
        beforeEach(async function () {
            await registry.registerIssuer(issuer.address, "did:example:123", "example.com");
        });

        it("Should anchor credential", async function () {
            const hash = ethers.id("credential-data");
            await registry.connect(issuer).anchorCredential(hash);
            const anchor = await registry.anchors(hash);
            expect(anchor.submitter).to.equal(issuer.address);
            expect(anchor.exists).to.equal(true);
        });

        it("Should reject duplicate anchor", async function () {
            const hash = ethers.id("credential-data");
            await registry.connect(issuer).anchorCredential(hash);
            await expect(
                registry.connect(issuer).anchorCredential(hash)
            ).to.be.revertedWithCustomError(registry, "AnchorAlreadyExists");
        });

        it("Should reject zero hash", async function () {
            await expect(
                registry.connect(issuer).anchorCredential(ethers.ZeroHash)
            ).to.be.revertedWithCustomError(registry, "InvalidHash");
        });
    });

    describe("Credential Revocation", function () {
        beforeEach(async function () {
            await registry.registerIssuer(issuer.address, "did:example:123", "example.com");
        });

        it("Should revoke credential", async function () {
            const hash = ethers.id("credential-revoke");
            await registry.connect(issuer).revokeCredential(hash);
            expect(await registry.isRevoked(hash)).to.equal(true);
        });
    });

    describe("Issuer Revocation", function () {
        beforeEach(async function () {
            await registry.registerIssuer(issuer.address, "did:example:123", "example.com");
        });

        it("Should allow admin to revoke issuer", async function () {
            await registry.revokeIssuer(issuer.address);
            const issuerData = await registry.issuers(issuer.address);
            expect(issuerData.isRevoked).to.equal(true);
            expect(await registry.isActiveIssuer(issuer.address)).to.equal(false);
        });

        it("Should prevent revoked issuer from anchoring", async function () {
            await registry.revokeIssuer(issuer.address);
            const hash = ethers.id("credential-data");
            await expect(
                registry.connect(issuer).anchorCredential(hash)
            ).to.be.reverted;
        });

        it("Should prevent revoked issuer from revoking credentials", async function () {
            await registry.revokeIssuer(issuer.address);
            const hash = ethers.id("credential-data");
            await expect(
                registry.connect(issuer).revokeCredential(hash)
            ).to.be.reverted;
        });
    });

    describe("View Functions", function () {
        it("Should check anchor exists", async function () {
            await registry.registerIssuer(issuer.address, "did:example:123", "example.com");
            const hash = ethers.id("credential-data");
            expect(await registry.anchorExists(hash)).to.equal(false);
            await registry.connect(issuer).anchorCredential(hash);
            expect(await registry.anchorExists(hash)).to.equal(true);
        });

        it("Should check active issuer status", async function () {
            expect(await registry.isActiveIssuer(issuer.address)).to.equal(false);
            await registry.registerIssuer(issuer.address, "did:example:123", "example.com");
            expect(await registry.isActiveIssuer(issuer.address)).to.equal(true);
        });
    });
});

const hre = require("hardhat");

async function main() {
    console.log("Deploying CredVerseRegistry...");

    // Get signers
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const CredVerseRegistry = await hre.ethers.getContractFactory("CredVerseRegistry");
    const registry = await CredVerseRegistry.deploy();

    await registry.waitForDeployment();
    const address = await registry.getAddress();

    console.log(`CredVerseRegistry deployed to: ${address}`);
    console.log(`Network: ${hre.network.name}`);
    console.log(`Chain ID: ${(await hre.ethers.provider.getNetwork()).chainId}`);

    // Self-register as Issuer for Demo purposes
    console.log("Registering deployer as Issuer...");
    const tx = await registry.registerIssuer(deployer.address, "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnn3Zua2F72", "university.edu");
    await tx.wait();
    console.log("Deployer registered as Issuer.");

    console.log("\n=== Deployment Summary ===");
    console.log(`Contract Address: ${address}`);

    let explorerUrl = `https://sepolia.etherscan.io/address/${address}`;
    if (hre.network.name === 'polygon') {
        explorerUrl = `https://polygonscan.com/address/${address}`;
    } else if (hre.network.name === 'mainnet') {
        explorerUrl = `https://etherscan.io/address/${address}`;
    }

    console.log(`Explorer: ${explorerUrl}`);
    console.log("\nAdd this to your .env file:");
    console.log(`REGISTRY_CONTRACT_ADDRESS=${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

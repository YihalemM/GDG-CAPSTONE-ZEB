import { rpc, Networks, TransactionBuilder, Operation, Keypair, Address } from "@stellar/stellar-sdk";
import fs from "fs";
import path from "path";

// Bypass TLS expiration issues on this Windows machine
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const server = new rpc.Server(RPC_URL);

import https from "https";

// Use an existing, funded testnet keypair to bypass Friendbot domain resolution issues
const deploySecret = "SC6QXTYXCFPZY2N47UC55INXYE6EVBJPZGZJQHREVIUPFGJRYTODTQDZ";
const deployer = Keypair.fromSecret(deploySecret);

async function fundAccount(publicKey: string) {
    console.log(`Funding deployer account ${publicKey}...`);
    return new Promise((resolve, reject) => {
        https.get(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`, { family: 4 }, (res) => {
            if (res.statusCode !== 200) reject(new Error("Friendbot funding failed with code " + res.statusCode));
            else resolve(true);
        }).on('error', reject);
    });
}

async function deploy() {
    try {
        await fundAccount(deployer.publicKey());
        console.log(`Using deployer account ${deployer.publicKey()}...`);

        const account = await server.getAccount(deployer.publicKey());
        const wasmPath = path.resolve(__dirname, "../../blockchain/contract/target/wasm32-unknown-unknown/release/zeb.wasm");
        const wasm = fs.readFileSync(wasmPath);

        console.log("1. Uploading WASM...");
        const uploadOp = Operation.uploadContractWasm({ wasm });
        const uploadTx = new TransactionBuilder(account, {
            fee: "1000000",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(uploadOp)
        .setTimeout(100)
        .build();

        const prepUpload = await server.prepareTransaction(uploadTx);
        prepUpload.sign(deployer);
        const uploadResult = await server.sendTransaction(prepUpload);
        
        console.log(`Upload TX Sent: ${uploadResult.hash}`);
        if(uploadResult.status === "ERROR") {
             console.error(uploadResult);
             throw new Error("Upload Failed");
        }

        // Wait for upload to complete
        let uploadTxStatus;
        while (true) {
            uploadTxStatus = await server.getTransaction(uploadResult.hash);
            if (uploadTxStatus.status !== "NOT_FOUND") break;
            await new Promise(res => setTimeout(res, 2000));
        }

        if (uploadTxStatus.status !== "SUCCESS") {
            throw new Error(`Upload transaction failed: ${uploadTxStatus.status}`);
        }

        // Extract WASM ID
        const wasmId = uploadTxStatus.returnValue?.bytes()?.toString('hex');
        if (!wasmId) throw new Error("Failed to extract WASM ID");
        console.log(`WASM ID: ${wasmId}`);

        // 2. Instantiate Contract
        console.log("2. Instantiating Contract...");
        account.incrementSequenceNumber(); // Important since we just used a sequence number
        const createOp = Operation.createCustomContract({
            wasmHash: Buffer.from(wasmId, 'hex'),
            address: Address.fromString(deployer.publicKey()),
        });

        const deployTx = new TransactionBuilder(account, {
            fee: "1000000",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(createOp)
        .setTimeout(100)
        .build();

        const prepDeploy = await server.prepareTransaction(deployTx);
        prepDeploy.sign(deployer);
        const deployResult = await server.sendTransaction(prepDeploy);

        console.log(`Deploy TX Sent: ${deployResult.hash}`);

        // Wait for deploy to complete
        let deployTxStatus;
        while (true) {
            deployTxStatus = await server.getTransaction(deployResult.hash);
            if (deployTxStatus.status !== "NOT_FOUND") break;
            await new Promise(res => setTimeout(res, 2000));
        }

        if (deployTxStatus.status !== "SUCCESS") {
            throw new Error(`Deploy transaction failed: ${deployTxStatus.status}`);
        }

        // Extract Contract ID
        const contractId = deployTxStatus.returnValue?.address()?.toString();
        if (!contractId) throw new Error("Failed to extract Contract ID");
        
        console.log(`\n\n=== SUCCESS ===`);
        console.log(`Contract ID: ${contractId}`);

        // Automatically update stellar.ts
        const stellarTsPath = path.resolve(__dirname, "../lib/stellar.ts");
        let stellarTsContent = fs.readFileSync(stellarTsPath, 'utf8');
        stellarTsContent = stellarTsContent.replace(
            /export const CONTRACT_ID = ".*";/,
            `export const CONTRACT_ID = "${contractId}";`
        );
        fs.writeFileSync(stellarTsPath, stellarTsContent);
        console.log("Updated lib/stellar.ts with new CONTRACT_ID");

    } catch (e) {
        console.error("Deployment Error:", e);
    }
}

deploy();

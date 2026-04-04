'use client'
import { 
  rpc, 
  Networks, 
  TransactionBuilder, 
  Contract, 
  nativeToScVal, 
  scValToNative,
  xdr
} from "stellar-sdk";

export const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const CONTRACT_ID = "CCHIPLUPXYSZQXYMHDRFGOL2DNUQ6OSXZHLSLFOBOJE52VIAQ75H5AJS";

export const server = new rpc.Server(RPC_URL);
export const contract = new Contract(CONTRACT_ID);

export function hexToBytes32(hex: string) {
  if (hex.length !== 64) {
    throw new Error("Hash must be exactly 64 hex characters (32 bytes)");
  }
  const bytes = Uint8Array.from(
    hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
  return nativeToScVal(bytes, { type: "bytes" });
}

/**
 * Maps cryptic Soroban contract errors to user-friendly messages.
 */
export function mapContractError(err: any): string {
  const message = err.message || String(err);
  
  if (message.includes("Error(Contract, #1)")) {
    return "This artwork is already registered on the ZEB blockchain by another creator.";
  }
  if (message.includes("Error(Contract, #2)")) {
    return "Unauthorized: You do not have permission to modify this asset.";
  }
  if (message.includes("Error(Contract, #4)")) {
    return "Insufficient funds or allowance to complete this transaction.";
  }
  
  return message.replace("HostError: ", "");
}

export async function registerArtworkOnChain(
  title: string,
  hash: string,
  publicKey: string
) {
  console.log("RISGERING")
  try {
    const { signTransaction } = await import("@stellar/freighter-api");
    const account = await server.getAccount(publicKey);

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(
      contract.call(
        "register_artwork",
        nativeToScVal(title, { type: "string" }),
        hexToBytes32(hash),
        nativeToScVal(publicKey, { type: "address" }),
        nativeToScVal(Math.floor(Date.now() / 1000), { type: "u128" })
      )
    )
    .setTimeout(1000)
    .build();

    const prepared = await server.prepareTransaction(tx);
    const signedTxEnvelope = await signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE
    });

    const signedXdr = (signedTxEnvelope as any).signedXdr || (signedTxEnvelope as any).signedTxXdr;
    if (!signedXdr) throw new Error("Signing failed");

    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const sendResult = await server.sendTransaction(signedTx);
    
    if (sendResult.status !== "PENDING") {
      throw new Error(`Transaction failed: ${sendResult.status}`);
    }

    return sendResult.hash;
  } catch (err: any) {
    console.error("On-chain registration error:", err);
    throw new Error(mapContractError(err));
  }
}

/**
 * Lists an artwork for fixed-price sale on-chain.
 */
export async function listForSaleOnChain(
  hash: string,
  seller: string,
  price: number
) {
  try {
    const { signTransaction } = await import("@stellar/freighter-api");
    const account = await server.getAccount(seller);

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(
        contract.call(
          "list_for_sale",
          hexToBytes32(hash),
          nativeToScVal(seller, { type: "address" }),
          nativeToScVal(BigInt(Math.round(price * 10000)), { type: "u128" }),
          nativeToScVal(Math.floor(Date.now() / 1000), { type: "u128" })
        )
    )
    .setTimeout(1000)
    .build();

    const prepared = await server.prepareTransaction(tx);
    const signedTxEnvelope = await signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE
    });

    const signedXdr = (signedTxEnvelope as any).signedXdr || (signedTxEnvelope as any).signedTxXdr;
    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const sendResult = await server.sendTransaction(signedTx);

    return sendResult.hash;
  } catch (err) {
    console.error("On-chain listing error:", err);
    throw err;
  }
}
/**
 * Create auction
 */

export async function createAuctionOnChain(
  hash: string,
  seller: string,
  startTime: number,
  endTime: number
) {
  try {
    const { signTransaction } = await import("@stellar/freighter-api");
    const account = await server.getAccount(seller);

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "create_auction",
          hexToBytes32(hash),
          nativeToScVal(seller, { type: "address" }),
          nativeToScVal(BigInt(startTime), { type: "u128" }),
          nativeToScVal(BigInt(endTime), { type: "u128" })
        )
      )
      .setTimeout(1000)
      .build();

    const prepared = await server.prepareTransaction(tx);

    const signed = await signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const xdr =
      (signed as any).signedXdr || (signed as any).signedTxXdr;

    const signedTx = TransactionBuilder.fromXDR(
      xdr,
      NETWORK_PASSPHRASE
    );

    const res = await server.sendTransaction(signedTx);
    return res.hash;
  } catch (err) {
    console.error("createAuction error:", err);
    throw err;
  }
}


export async function placeBidOnChain(
  hash: string,
  bidder: string,
  amount: number
) {
  try {
    const { signTransaction } = await import("@stellar/freighter-api");
    const account = await server.getAccount(bidder);

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "place_bid",
          hexToBytes32(hash),
          nativeToScVal(bidder, { type: "address" }),
          nativeToScVal(BigInt(Math.round(amount * 10000)), { type: "u128" }),
          nativeToScVal(BigInt(Date.now()), { type: "u128" })
        )
      )
      .setTimeout(1000)
      .build();

    const prepared = await server.prepareTransaction(tx);

    const signed = await signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const xdr =
      (signed as any).signedXdr || (signed as any).signedTxXdr;

    const signedTx = TransactionBuilder.fromXDR(
      xdr,
      NETWORK_PASSPHRASE
    );

    const res = await server.sendTransaction(signedTx);
    return res.hash;
  } catch (err) {
    console.error("placeBid error:", err);
    throw err;
  }
}

export async function closeAuctionOnChain(
  hash: string,
  caller: string
) {
  try {
    const { signTransaction } = await import("@stellar/freighter-api");
    const account = await server.getAccount(caller);

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "close_auction",
          hexToBytes32(hash),
          nativeToScVal(caller, { type: "address" }),
          nativeToScVal(BigInt(Date.now()), { type: "u128" })
        )
      )
      .setTimeout(60)
      .build();

    const prepared = await server.prepareTransaction(tx);

    const signed = await signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const xdr =
      (signed as any).signedXdr || (signed as any).signedTxXdr;

    const signedTx = TransactionBuilder.fromXDR(
      xdr,
      NETWORK_PASSPHRASE
    );

    const res = await server.sendTransaction(signedTx);
    return res.hash;
  } catch (err) {
    console.error("closeAuction error:", err);
    throw err;
  }
}

export async function buynow(hash: string, buyer: string) {
  try {
    const { signTransaction } = await import("@stellar/freighter-api");
    const account = await server.getAccount(buyer);

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "buy_now",
          hexToBytes32(hash),
          nativeToScVal(buyer, { type: "address" })
        )
      )
      .setTimeout(60)
      .build();

    const prepared = await server.prepareTransaction(tx);

    const signed = await signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const xdr =
      (signed as any).signedXdr || (signed as any).signedTxXdr;

    const signedTx = TransactionBuilder.fromXDR(
      xdr,
      NETWORK_PASSPHRASE
    );

    const res = await server.sendTransaction(signedTx);
    return res.hash;
  } catch (err) {
    console.error("buyNow error:", err);
    throw err;
  }
}

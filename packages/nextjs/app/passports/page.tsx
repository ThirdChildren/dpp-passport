"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
// se in futuro vorrai inviare ETH
import { useAccount } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
// componenti pre-costruiti
import { useScaffoldReadContract, useScaffoldWriteContract, useTransactor } from "~~/hooks/scaffold-eth";

// hooks wrapper wagmi

/**
 * Card che permette al produttore (owner del contratto) di mintare un nuovo passaporto digitale
 */
function MintPassportCard() {
  const { address: connectedAddress } = useAccount();
  const [form, setForm] = useState({ recipient: connectedAddress ?? "", gtin: "", batch: "", uri: "" });

  /* hook per scrivere sul contratto */
  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "ProductPassport" });
  const tx = useTransactor();

  const handleSubmit = async () => {
    try {
      await tx(async () => {
        const txHash = await writeContractAsync({
          functionName: "mintPassport",
          args: [form.recipient, form.uri, form.gtin, form.batch] as const, // const-assertion evita TS2322
        });
        if (!txHash) throw new Error("Transaction failed or was rejected");
        return txHash;
      });
      alert("Passport coniato! 🎉");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl p-6 max-w-lg">
      <h2 className="card-title mb-4">Mint Digital Product Passport</h2>

      <label className="form-control w-full mb-2">
        <span className="label-text">Recipient address</span>
        <AddressInput value={form.recipient} onChange={val => setForm({ ...form, recipient: val })} />
      </label>

      <label className="form-control w-full mb-2">
        <span className="label-text">GTIN (EAN-13 / UPC)</span>
        <input
          className="input input-bordered w-full"
          value={form.gtin}
          onChange={e => setForm({ ...form, gtin: e.target.value })}
          placeholder="08912345678904"
        />
      </label>

      <label className="form-control w-full mb-2">
        <span className="label-text">Batch / Serial</span>
        <input
          className="input input-bordered w-full"
          value={form.batch}
          onChange={e => setForm({ ...form, batch: e.target.value })}
          placeholder="LOT-2025-07-04-A"
        />
      </label>

      <label className="form-control w-full mb-4">
        <span className="label-text">Metadata URI (IPFS CID)</span>
        <input
          className="input input-bordered w-full"
          value={form.uri}
          onChange={e => setForm({ ...form, uri: e.target.value })}
          placeholder="ipfs://bafybeih..."
        />
      </label>

      <button onClick={handleSubmit} className="btn btn-primary w-full">
        Mint Passport
      </button>
    </div>
  );
}

/**
 * Card di consultazione: inserisci tokenId, ottieni URI + dati GTIN/lotto dal mapping passportInfo
 */
function PassportDetailsCard() {
  const [tokenId, setTokenId] = useState<number>();
  const readArgs = [tokenId !== undefined ? BigInt(tokenId) : undefined] as const;

  const { data: uri } = useScaffoldReadContract({
    contractName: "ProductPassport",
    functionName: "tokenURI",
    args: readArgs,
  });

  const { data: info } = useScaffoldReadContract({
    contractName: "ProductPassport",
    functionName: "passportInfo",
    args: readArgs,
  });

  return (
    <div className="card bg-base-200 shadow-xl p-6 max-w-lg">
      <h2 className="card-title mb-4">View Passport</h2>

      <label className="form-control mb-4">
        <span className="label-text">Token ID</span>
        <input
          type="number"
          className="input input-bordered"
          onChange={e => setTokenId(Number(e.target.value))}
          placeholder="es. 1"
        />
      </label>

      {uri && (
        <div className="prose">
          <p>
            <strong>tokenURI:</strong> <code>{uri as string}</code>
          </p>
          {info && (
            <>
              <p>
                <strong>GTIN:</strong> {(info as any)[0]}
              </p>
              <p>
                <strong>Batch / Serial:</strong> {(info as any)[1]}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-8 p-10">
      {/* 1. Wallet connect */}
      <ConnectButton />

      {/* 2. Mint section (solo owner) */}
      <MintPassportCard />

      {/* 3. Read section */}
      <PassportDetailsCard />
    </main>
  );
}

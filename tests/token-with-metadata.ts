import * as anchor from "@project-serum/anchor"
import { Program } from "@project-serum/anchor"
import { TokenWithMetadata } from "../target/types/token_with_metadata"
import { findMetadataPda } from "@metaplex-foundation/js"
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"

describe("token-with-metadata", () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace
    .TokenWithMetadata as Program<TokenWithMetadata>

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  )

  const nft = {
    uri: "https://arweave.net/OwXDf7SM6nCVY2cvQ4svNjtV7WBTz3plbI4obN9JNkk",
    name: "NAME",
    symbol: "SYMBOL",
  }

  const [mintPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  )

  const tokenAccount = getAssociatedTokenAddressSync(
    mintPDA,
    provider.wallet.publicKey
  )

  it("Is initialized!", async () => {
    // Add your test here.
    const metadataPDA = await findMetadataPda(mintPDA)

    const tx = await program.methods
      .initialize(nft.uri, nft.name, nft.symbol)
      .accounts({
        mint: mintPDA,
        metadata: metadataPDA,
        tokenAccount: tokenAccount,
        user: provider.wallet.publicKey,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .rpc()
    console.log("Your transaction signature", tx)

    const account = await getAccount(provider.connection, tokenAccount)
    console.log(account.amount)
  })
})

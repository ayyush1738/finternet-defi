// ✅ Minting Service for NFT (umi + irys)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createGenericFile,
  generateSigner,
  percentAmount,
  signerIdentity,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import { createFungible, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { createTokenIfMissing } from '@metaplex-foundation/mpl-toolbox';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 5000;

app.post('/mint', async (req, res) => {
  try {
    console.log('[REQ BODY]', req.body);
    const { amount, due_ts, risk, cid, creator } = req.body;

    if (!cid || !creator || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const umi = createUmi('https://api.devnet.solana.com')
      .use(irysUploader())
      .use(mplTokenMetadata());

    const secretKey = Uint8Array.from(JSON.parse(process.env.MINT_AUTHORITY_PRIVATE_KEY));
    umi.use(signerIdentity(generateSigner(umi, secretKey)));

    const metadata = {
      name: `Invoice NFT`,
      description: `Invoice NFT with risk score ${risk} and amount ${amount} SOL`,
      image: `https://ipfs.io/ipfs/${cid}`,
      properties: {
        type: 'document/pdf',
        amount,
        due: due_ts,
        riskScore: risk,
      },
    };

    const metadataFile = createGenericFile(Buffer.from(JSON.stringify(metadata)), 'metadata.json');
    const [metadataUri] = await umi.uploader.upload([metadataFile]);

    const mint = generateSigner(umi);
    await createTokenIfMissing(umi, mint);

    const tx = await createFungible(umi, {
      mint,
      authority: umi.identity,
      name: metadata.name,
      symbol: 'PDFNFT',
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(10, 2),
      decimals: 0,
    }).sendAndConfirm(umi);

    res.json({
      txSig: tx.signature,
      nftAddress: mint.publicKey.toString(),
      metadataUri,
      transaction_base64: Buffer.from(tx.bytes).toString('base64'),
    });
  } catch (err) {
    console.error('[MINT ERROR]', err);
    res.status(500).json({ message: 'Minting failed', error: err?.message || 'Unknown error', details: err });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Minting service running at http://localhost:${PORT}`);
});
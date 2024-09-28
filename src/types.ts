import { PublicKey, VersionedTransaction, type Keypair, type Transaction } from "@solana/web3.js"

export interface Project {
    address: string
    name: string
    introduction: string
    index: number
    amount: number
    scope: number
    startSlot: number
    startTimestamp: number
    slotGap: number
    reward: number
    collection: string
}

export interface Vote {
    value: number
    amount: number
}

export interface Proposal {
    address: string
    start: number
    startTimestamp: number
    index: number
    answer: number
    answerSlot: number
    reward: number
    total: number
    votes: Vote[]

}

export interface VoteNFT {
    project: string
    proposal: string
    collection: string
    address: string
    metadataAddress: string
    index: number
    amount: number
    value: number
    claimed: boolean
}


export class AnchorWallet {
    readonly payer: Keypair;
    constructor(payer: Keypair) {
        this.payer = payer;
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
        if (tx instanceof VersionedTransaction) {
            tx.sign([this.payer])
        } else {
            tx.partialSign(this.payer)
        }
        return tx;
    }

    signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
        return Promise.resolve(txs.map(tx => {
            if (tx instanceof VersionedTransaction) {
                tx.sign([this.payer])
            } else {
                tx.partialSign(this.payer)
            }
            return tx;
        })
        );
    }
    
    get publicKey(): PublicKey {
        return this.payer.publicKey;
    }
}
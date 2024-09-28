import type { Project, Proposal, Vote } from '~/types'
import { Program, BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'

export async function fetchProject(address: string, program: Program): Promise<Project | null> {
    try {

        const res = await program.account.project.fetch(address)
        return {
            address,
            name: res.name,
            scope: res.numberScope.toNumber(),
            introduction: res.introduction,
            index: res.index.toNumber(),
            amount: res.baseAmount.toNumber(),
            collection: res.nftCollection.toString(),
            slotGap: res.slotGap.toNumber(),
            startSlot: res.lastPartySlot.toNumber(),
            startTimestamp: res.lastPartyTimestamp.toNumber() * 1000,
            reward: res.reward.toNumber(),
        }
    } catch(e: any) {
        console.error(`get project [${address}] error`, e)
    }
    return null
}

export async function fetchProposal(address: string, program: Program): Promise<Proposal | null> {
    try {
        const res = await program.account.party.fetch(new PublicKey(address));
        return {
            address,
            index: res.index.toNumber(),
            start: res.startSlot.toNumber(),
            startTimestamp: res.startTimestamp.toNumber() * 1000,
            total: res.total.toNumber(),
            votes: res.votes.map((amount: BN, index: number) => ({
                value: index,
                amount: amount.toNumber(),
            })).filter((item: Vote) => item.amount > 0),
            answer: res.answer.toNumber(),
            answerSlot: res.answerSlot.toNumber(),
            reward: res.reward.toNumber(),
        }
        
    } catch (e: any) {
        console.error(`get party [${address}] error`, e);
    }
    return null;
}
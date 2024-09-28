<script setup lang="ts" name="vote">
import { AnchorProvider, BN, Program, type Idl } from '@coral-xyz/anchor';
import { Metaplex, type Metadata } from '@metaplex-foundation/js';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { fetchProject, fetchProposal } from '~/api/contract';
import { type VoteNFT, AnchorWallet } from '~/types';
import { deriveProposalAccount } from '~/utils';
import idl from '~/assets/idl/lucky.json'
import { useConfigStore } from '~/states/config';
import { useAnchorWallet, useWallet } from 'solana-wallets-vue';
import CopyAddress from '~/components/copy-address.vue';
import { useProjectStore } from '~/states/project';
import { WalletMultiButton } from 'solana-wallets-vue';
import { ref, computed, onMounted, watch } from 'vue';
import useMessage from '~/hooks/useMessage';

const programId = idl.address
const message = useMessage()
const configStore = useConfigStore()
const projectStore = useProjectStore()
const wallet = useWallet()
const anchorWallet = useAnchorWallet()
const publicKey = wallet.publicKey
const connection = computed(() => new Connection(configStore.currentRPC, 'confirmed'))
const program = computed(() => new Program(idl as Idl, new AnchorProvider(connection.value, new AnchorWallet(Keypair.generate()))))
const metaplex = computed(() => Metaplex.make(connection.value))
const votes = ref<VoteNFT[]>([])
const rewards = ref<Record<string, { answer: number; reward: number }>>({})

const selectedProject = ref('')
const projects = computed(() => projectStore.projects(configStore.network))

const claimReward = async (nft: VoteNFT) => {
    const reward = rewards.value[nft.proposal]
    if (!reward) {
        return
    }
    if (reward.answer != nft.value) {
        return
    }
    const voteProgram = new Program(idl as Idl, new AnchorProvider(connection.value, anchorWallet.value!, {}))
    try {
        const tx = await voteProgram.methods.newClaim(new BN(nft.index))
            .accountsPartial({
                project: new PublicKey(nft.project),
                party: new PublicKey(nft.proposal),
                mintAccount: new PublicKey(nft.address),
                // metadataAccount: new PublicKey(nft.metadataAddress),
                nftCollectionAccount: new PublicKey(nft.collection),
            }).rpc()
        console.log('claim', tx)
        message.success('Claim success')
    } catch (error) {
        console.error(error)
        message.error('Claim failed')
    }
}

const convertVote = (nft: Metadata, project: string): VoteNFT => {
    const name = nft.name
    const symbol = nft.symbol
    const voteInfo = symbol.split('-')
    const index = parseInt(voteInfo[0])
    const value = parseInt(voteInfo[1])
    const amount = parseInt(name)
    const claimed = voteInfo.length > 2
    const proposal = deriveProposalAccount(programId, project, index).toBase58()

    return {
        address: nft.mintAddress.toBase58(),
        metadataAddress: nft.address.toBase58(),
        collection: nft.collection!.address.toBase58(),
        project,
        proposal,
        index,
        value,
        amount,
        claimed,
    }
}

const initNfts = async () => {
    if (!publicKey.value) {
        return
    }
    if (!selectedProject.value) {
        return
    }
    const project = await fetchProject(selectedProject.value, program.value)
    if (!project) {
        return
    }
    const nftCollection = project.collection
    const nfts = await metaplex.value.nfts().findAllByOwner({ owner: publicKey.value })
    // 由 program 派生，智能合约不变时是固定的
    const creatorAddress = 'HtbkxgKUD3z5VRQNU8ofjw7uUSThMf5HTrECa4A3u1X1'
    votes.value = nfts.filter(nft => nft.collection?.address.toBase58() == nftCollection && nft.creators.some(item => item.verified && item.address.toBase58() == creatorAddress))
        .map(nft => convertVote(nft as Metadata, selectedProject.value))
        .sort((a, b) => {
            // proposal index
            const index = b.index - a.index
            if (index != 0) {
                return index
            }
            // nft balance
            const amount = b.amount - a.amount
            if (amount != 0) {
                return amount
            }
            // vote value
            return b.value - a.value
        })
}

const initRewards = async () => {
    rewards.value = {}
    const proposals = [...new Set(votes.value.map(item => item.proposal))]
    for (const address of proposals) {
        const proposal = await fetchProposal(address, program.value)
        if (proposal) {
            rewards.value[address] = {
                answer: proposal.answer,
                reward: proposal.reward,
            }
        }
    }
}

onMounted(async () => {
    if (projects.value.length > 0) {
        selectedProject.value = projects.value[0]
    }
})

watch(selectedProject, async () => {
    await initNfts()
    await initRewards()
})

</script>
<template>
    <!-- 投票记录 -->
    <!-- 以卡片的方式展示，每行两张卡片 -->
    <!-- 头部展示项目 address，居中展示投票的 value，和数量，如果 proposal 在 reward 中，则突出展示 reward -->


    <div v-if="wallet.connected.value" class="flex flex-col items-center justify-start h-full p-4 bg-black">
        <div class="w-full max-w-md mb-6">
            <select v-model="selectedProject" @change="initNfts"
                class="w-full bg-gray-800 text-yellow-300 border border-yellow-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <option v-for="project in projects" :key="project" :value="project">
                    {{ project.slice(0, 20) }}...
                </option>
            </select>
        </div>
        <div class="w-full max-w-md space-y-4">
            <div v-for="vote in votes" :key="vote.address" :class="[
                'shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300 relative overflow-hidden',
                {
                    'bg-gradient-to-r from-purple-900 to-indigo-900 text-yellow-300': rewards[vote.proposal] && rewards[vote.proposal].answer == vote.value,
                    'bg-gradient-to-r from-purple-900 to-indigo-850 text-yellow-300': rewards[vote.proposal] && rewards[vote.proposal].answer != vote.value,
                    'bg-gradient-to-r from-gray-800 to-gray-900 text-yellow-300': !rewards[vote.proposal]
                }
            ]">
                <CopyAddress :address="vote.address" />
                <div class="mt-4 flex justify-center items-center h-24">
                    <div v-if="rewards[vote.proposal]?.answer == vote.value"
                        class="w-1/2 bg-black bg-opacity-20 rounded-lg p-2 text-center h-full flex flex-col justify-center relative z-10">
                        <p class="text-sm text-yellow-300">Reward</p>
                        <p class="text-3xl font-bold text-yellow-400">{{ rewards[vote.proposal].reward * vote.amount /
                            LAMPORTS_PER_SOL }} SOL</p>
                        <button v-if="!vote.claimed" @click.stop="claimReward(vote)"
                            class="mt-2 bg-yellow-300 hover:bg-yellow-200 text-black font-bold py-1 px-3 rounded text-sm">
                            Claim
                        </button>
                    </div>
                </div>
                <div class="mt-4 flex justify-between text-sm relative z-10">
                    <span>No.{{ vote.index }}</span>
                    <span>
                        <span>{{ rewards[vote.proposal]?.answer ? 'End' : 'Running' }}</span>
                    </span>
                   
                </div>
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div class="font-bold opacity-10 text-gold" :class="[
                        { 'text-8xl': vote.index < 100, 'text-7xl': vote.index >= 100 && vote.index < 1000, 'text-6xl': vote.index >= 1000 }
                    ]">{{ vote.value }}</div>
                    <div class="font-bold opacity-10 mt-4 text-gold" :class="[
                        { 'text-6xl': vote.amount < 1000, 'text-5xl': vote.amount >= 1000 && vote.amount < 10000, 'text-4xl': vote.amount >= 10000 }
                    ]">{{ (vote.amount / LAMPORTS_PER_SOL).toFixed(2) }} SOL</div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="h-full flex justify-center items-center">
        <WalletMultiButton />
    </div>
</template>

<style scoped>
/* 可以添加一些全局样式 */
body {
    background-color: #000;
    color: #ffd700;
}
</style>
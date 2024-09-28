<script setup lang="ts" name="project">
import { AnchorWallet, type Project, type Proposal, type Vote } from '~/types';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { AnchorProvider, BN, Program, type Idl } from '@coral-xyz/anchor';
import idl from '~/assets/idl/lucky.json';
import { fetchProject, fetchProposal } from '~/api/contract';
import { formatTime } from '~/utils';
import { useConfigStore } from '~/states/config';
import { useWallet, useAnchorWallet } from 'solana-wallets-vue';
import { deriveProposalAccount, deriveMetadataAccount } from '~/utils';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import useMessage from '~/hooks/useMessage';
import CopyAddress from '~/components/copy-address.vue';
import VoteForm from '~/components/vote-form.vue';
import VoteResult from '~/components/vote-result.vue';


const route = useRoute()
const message = useMessage()
const projectAddress = route.params.address as string
const wallet = useWallet()
const anchorWallet = useAnchorWallet()

const configStore = useConfigStore()
const connection = computed(() => new Connection(configStore.currentRPC, 'confirmed'))
const onlyReadProgram = computed(() => new Program(idl as Idl, new AnchorProvider(connection.value, new AnchorWallet(Keypair.generate()))))
const writeProgram = computed(() => {
    if (anchorWallet.value === null) {
        return
    }
    return new Program(idl as Idl, new AnchorProvider(connection.value, anchorWallet.value!, { skipPreflight: true}))
})
const now = ref(Date.now())
const project = ref<Project>()
const proposal = ref<Proposal>()
const currentIndex = ref(0)
const amount = ref(0)
const votes = ref<Vote[]>([])
const period = computed(() => {
    if (!project.value) {
        return ``
    }

    const gap = project.value.slotGap * 400 / 1000
    const hour = Math.floor(gap / 60 / 60)
    const minute = Math.floor((gap - hour * 60 * 60) / 60)
    if (hour > 0) {
        if (minute > 0) {
            return `${hour}h ${minute}m`
        } else {
            return `${hour}h`
        }
    }
    return `${minute}min`
})

const progressPercentage = computed(() => {
    if (!proposal.value) {
        return 0
    }
    const gap = project.value!.slotGap * 400
    const startTime = proposal.value.startTimestamp
    const endTime = startTime + gap
    if (now.value > endTime) {
        return 100
    }
    if (now.value < startTime) {
        return 0
    }
    const elapsed = now.value - startTime;
    return Math.min(Math.max((elapsed / gap) * 100, 0), 100);
})

async function initProject() {
    const res = await fetchProject(projectAddress as string, onlyReadProgram.value)
    if (!res) {
        return
    }
    project.value = res
    currentIndex.value = project.value.index
}

async function initProposal(index: number) {
    if (index == 0) return
    const account = deriveProposalAccount(idl.address, projectAddress, index)
    const res = await fetchProposal(account.toBase58(), onlyReadProgram.value)
    if (!res) {
        return
    }
    proposal.value = res
    initProposalAmount()
    await initVotes()
}

async function newProposal() {
    if (!project.value) {
        return
    }

    const nextIndex = project.value.index + 1
    try {
        const tx = await writeProgram.value!.methods.newParty()
            .accountsPartial({
                project: new PublicKey(projectAddress),
                party: deriveProposalAccount(idl.address, projectAddress, nextIndex),
            }).rpc()
        console.log(`new proposal: [${tx}]`)
        message.success('New proposal success')
    } catch (error) {
        console.error('new proposal failed', error)
        message.error('New proposal failed')
        return
    }
    message.success('New proposal success, waiting for the next proposal')

    // localnet is fast, but mainnet and testnet is slow
    setTimeout(async () => {
        await initProject()
        await initProposal(nextIndex)

    }, 15 * 1000);
}

async function newReward(index: number) {
    console.log('new reward', index)
    try {
        const tx = await writeProgram.value!.methods.newReward(new BN(index))
            .accountsPartial({
                project: new PublicKey(projectAddress),
            }).rpc()
        console.log(`new reward: [${tx}]`)
        message.success('New reward success')
    } catch (error) {
        console.error('new reward failed', error)
        message.error('New reward failed')
        return
    }
    await initProposal(index)
}
async function initVotes() {
    votes.value = []
    if (!proposal.value) {
        return
    }
    const answer = proposal.value.answer
    const allVotes = proposal.value.votes
    const sortedVotes = allVotes.sort((a, b) => b.amount - a.amount)
    const res = []
    if (sortedVotes.length > 5) {
        res.push(...sortedVotes.slice(0, 4))
        if (res.findIndex(item => item.value === answer) > -1) {
            res.push(sortedVotes[5])
        } else {
            const index = sortedVotes.findIndex(item => item.value === answer)
            if (index > -1) {
                res.push(sortedVotes[index])
            } else {
                res.push({ value: answer, amount: 0 })
            }
        }
    } else {
        res.push(...sortedVotes)
    }
    votes.value = res
}

async function vote(value: number, amount: number) {
    if (!project.value || !proposal.value) {
        return
    }
    if (!wallet.connected.value) {
        message.error('Please connect wallet')
        return
    }
    const collectionMintAccount = new PublicKey(project.value.collection)
    const party = new PublicKey(proposal.value.address)
    const mint = Keypair.generate()
    const metadataAccount = deriveMetadataAccount(mint.publicKey)
    try {
        const tx = await writeProgram.value!.methods.joinParty(new BN(amount), new BN(value))
            .accountsPartial({
                project: new PublicKey(projectAddress),
                party,
                mintAccount: mint.publicKey,
                metadataAccount,
                collectionMintAccount,
                // payer: publicKey.value as PublicKey
            }).signers([mint]).rpc()

        console.log(`vote: [${tx}]: [${value}]: [${amount}]`)
        message.success('Vote success')
    } catch (error) {
        console.error('vote failed', error)
        message.error('Vote failed')
        return
    }
}


function initProposalAmount() {
    amount.value = 0
    if (!proposal.value) {
        return
    }
    amount.value = proposal.value.votes.map(item => item.amount).reduce((prev, next) => prev + next, 0) / LAMPORTS_PER_SOL
}

onMounted(async () => {
    await initProject()
    if (project.value) {
        await initProposal(project.value.index)
    }
    setInterval(() => {
        now.value = Date.now()
    }, 1000)
})

async function prevProposal() {
    proposal.value = undefined
    currentIndex.value += 1
    await initProposal(currentIndex.value)
}

async function nextProposal() {
    proposal.value = undefined
    currentIndex.value -= 1
    await initProposal(currentIndex.value)
}




</script>
<template>
    <!-- 项目详情页，顶部展示项目的基础信息，然后是提案的轮播卡片 -->
    <div class="flex flex-col items-start justify-start min-h-screen p-4" v-if="project">
        <!-- 项目基础信息 -->
        <div
            class="w-full max-w-md mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 shadow-lg border-2 border-yellow-300">
            <CopyAddress :address="project.address" />
            <div class="flex justify-between">

                <h2 class="text-3xl font-bold text-yellow-300 mb-4">{{ project.name }}</h2>
                <span>No.{{ project.index }}</span>
            </div>
            <p class="text-yellow-400 mb-6">{{ project.introduction }}</p>
            <div class="grid grid-cols-2 gap-4">

                <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                    <span class="text-sm text-yellow-400 font-bold">Period</span>
                    <div class="text-4xl font-bold text-yellow-300 mt-2">{{ period }}</div>


                </div>
                <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                    <span class="text-sm text-yellow-400 font-bold">Pool</span>
                    <div class="text-sm text-yellow-300 mt-2"><span class="text-4xl font-bold text-yellow-400">{{
                        parseFloat((project.reward / LAMPORTS_PER_SOL).toFixed(2)) }}</span> SOL</div>
                </div>
            </div>
            <div class="mt-6 bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <span class="text-sm text-yellow-300 font-bold">Number Range</span>
                <div class="text-2xl font-bold text-yellow-300 mt-2">
                    1 ~ {{ project.scope }}
                </div>
            </div>
            <div class="flex justify-center">
                <button v-if="project.index == 0 || project.startTimestamp + project.slotGap * 400 < now"
                    @click="newProposal"
                    class="mt-2 bg-yellow-300 hover:bg-yellow-200 text-black font-bold py-1 px-3 rounded text-sm">New
                    Proposal</button>

            </div>
        </div>

        <template v-if="proposal">
            <!-- 提案轮播卡片 -->
            <div class="w-full max-w-md">
                <div class="relative overflow-hidden">
                    <div class="w-full">
                        <div
                            class="bg-gradient-to-r from-purple-600 to-indigo-600 text-yellow-100 shadow-md rounded-lg p-3 h-56 flex flex-col justify-between relative border-2 border-yellow-300">
                            <div class="flex justify-between items-center text-sm">
                                <CopyAddress :address="proposal.address" />
                                <span class="font-bold text-yellow-300">No.{{ proposal.index }}</span>
                            </div>
                            <div class="flex flex-col justify-between flex-grow py-2">
                                <div v-if="proposal.startTimestamp + project.slotGap * 400 > now"
                                    class="text-center mt-5">
                                    <div class="flex justify-between">
                                        <div class="flex-1">
                                            <span class="text-xs text-yellow-400 font-bold">Pool</span>
                                            <div class="text-sm text-yellow-300 mt-2"><span
                                                    class="text-4xl font-bold text-yellow-400">{{
                                                        parseFloat((amount).toFixed(2)) }}</span> SOL</div>
                                        </div>
                                        <div class="flex-1">
                                            <span class="text-xs text-yellow-400 font-bold">Person</span>
                                            <div class="text-4xl font-bold text-yellow-300 mt-2">{{ proposal.total }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-2">
                                        <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div class="bg-blue-600 h-full"
                                                :style="{ width: `${progressPercentage}%` }">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div v-else class="text-center">
                                    <div v-if="proposal.answer !== 0" class="flex justify-between ">
                                        <div class="flex-1">
                                            <span class="text-xs">Answer</span>
                                            <div class="text-3xl font-bold text-yellow-300">{{ proposal.answer }}</div>
                                        </div>
                                        <div class="flex-1">
                                            <span class="text-xs">Reward</span>
                                            <div class="text-xl text-yellow-300">
                                                <span class="text-2xl font-bold">{{ proposal.reward }}</span> /SOL
                                            </div>
                                        </div>

                                    </div>

                                    <div class="flex justify-between">
                                        <div class="flex-1">
                                            <span class="text-2xs text-yellow-300">Pool</span>
                                            <div class="text-3xl font-bold text-yellow-300">{{ amount }} SOL</div>
                                        </div>
                                        <div class="flex-1">
                                            <span class="text-2xs text-yellow-300">Person</span>
                                            <div class="text-3xl font-bold text-yellow-300">{{ proposal.total }}</div>
                                        </div>
                                    </div>

                                </div>
                                <div class="flex justify-between text-xs mt-1">
                                    <span>{{ formatTime(proposal.startTimestamp) }}</span>
                                    <span>{{ formatTime(proposal.startTimestamp + project.slotGap * 400) }}</span>
                                </div>
                            </div>
                            <div class="absolute bottom-20 left-0 right-0 flex justify-between px-3">
                                <div class="flex-1">
                                    <button @click="prevProposal" v-show="currentIndex < project.index"
                                        class="bg-yellow-200 bg-opacity-10 text-yellow-200 rounded-full p-1 hover:bg-yellow-200 hover:bg-opacity-20 transition-colors duration-300">
                                        &lt;
                                    </button>
                                </div>
                                <div v-if="proposal.answer == 0 && (proposal.startTimestamp + project.slotGap * 400 < now)"
                                    class="flex justify-center">
                                    <button
                                        class="mt-2 bg-yellow-300 hover:bg-yellow-200 text-black font-bold py-1 px-3 rounded text-sm"
                                        @click="newReward(proposal.index)">Reward</button>
                                </div>
                                <div class="flex-1 flex justify-end">
                                    <button @click="nextProposal" v-show="currentIndex > 1"
                                        class="bg-yellow-200 bg-opacity-10 text-yellow-200 rounded-full p-1 hover:bg-yellow-200 hover:bg-opacity-20 transition-colors duration-300">
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="!wallet.connected" class="flex justify-center w-full">
                Login to vote
            </div>
            <template v-else>
                <VoteForm v-if="proposal.startTimestamp + project.slotGap * 400 > now" :base="project.amount"
                    :scope="project.scope" @vote="vote" />
            </template>


            <VoteResult v-if="votes.length > 0" :votes="votes" />
        </template>

    </div>

</template>
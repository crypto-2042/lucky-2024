<script setup lang="ts">
import { ref } from 'vue'
import { useAnchorWallet } from 'solana-wallets-vue'
import { Program, AnchorProvider, type Idl, BN } from '@coral-xyz/anchor';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import idl from '~/assets/idl/lucky.json'
import { useConfigStore } from '~/states/config';
import { useProjectStore } from '~/states/project';
import { deriveProjectAccount, deriveMetadataAccount } from '~/utils';
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import useMessage from '~/hooks/useMessage';

const message = useMessage()
const anchorWallet = useAnchorWallet()
const configStore = useConfigStore()
const projectStore = useProjectStore()
const connection = computed(() => new Connection(configStore.currentRPC, 'confirmed'))
const router = useRouter()

const name = ref('')
const description = ref('')
const period = ref(1)
const numberRange = ref(1)
const baseAmount = ref(0.01)

const createProject = async () => {
  if (name.value.trim() === '' || description.value.trim() === '') {
    message.error('Name and description are required')
    return
  }
  if (period.value < 1 || period.value > 48 * 60) {
    message.error('Period must be between 1min and 48h')
    return
  }
  if (numberRange.value < 1 || numberRange.value > 10000) {
    message.error('Number range must be between 1 and 10000')
    return
  }
  if (baseAmount.value < 0.01 || baseAmount.value > 100) {
    message.error('Base amount must be between 0.01 and 100')
    return
  }
  const slotGap = Math.floor(period.value * 60 * 1000 / 400)
  const program = new Program(idl as Idl, new AnchorProvider(connection.value, anchorWallet.value!, {}))
  const mintAccount = Keypair.generate()
  const metadataAccount = deriveMetadataAccount(mintAccount.publicKey)
  const account = deriveProjectAccount(idl.address, mintAccount.publicKey)
  try {
    const tx = await program.methods.newProject(
      name.value, description.value,
      new BN(numberRange.value),
      new BN(slotGap),
      new BN(baseAmount.value * LAMPORTS_PER_SOL)
    )
      .accountsPartial({
        mintAccount: mintAccount.publicKey,
        metadataAccount,
      })
      .signers([mintAccount])
      .rpc()
    console.log(`create project: ${account.toBase58()}, tx: ${tx}`)
  } catch (error) {
    console.error('create project failed', error)
    message.error('Create project failed')
    return
  }
  projectStore.addProject(account.toBase58(), configStore.network)
  message.success('Project created successfully')
  setTimeout(() => {
    router.back()
  }, 2000);
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <h1 class="text-3xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
      Create Project</h1>

    <form @submit.prevent="createProject" class="max-w-2xl mx-auto space-y-6">
      <div>
        <label for="name" class="block mb-2">Name</label>
        <input v-model="name" id="name" type="text" required
          class="w-full bg-gray-800 rounded-lg p-3 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500">
      </div>

      <div>
        <label for="description" class="block mb-2">Introduction</label>
        <textarea v-model="description" id="description" rows="4" required
          class="w-full bg-gray-800 rounded-lg p-3 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500"></textarea>
      </div>

      <div>
        <label for="period" class="block mb-2">Period(1min~48h)</label>
        <input v-model.number="period" id="period" type="number" required
          class="w-full bg-gray-800 rounded-lg p-3 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ">
      </div>

      <div>
        <label for="voteRange" class="block mb-2">Number Range</label>
        <input v-model.number="numberRange" id="voteRange" type="number" required
          class="w-full bg-gray-800 rounded-lg p-3 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ">
      </div>

      <div>
        <label for="baseAmount" class="block mb-2">Base Amount(SOL)</label>
        <input v-model.number="baseAmount" id="baseAmount" type="number" min="0.01" step="0.01" required
          class="w-full bg-gray-800 rounded-lg p-3 border border-gray-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ">
      </div>

      <button type="submit"
        class="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition duration-300">
        Submit
      </button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { AnchorProvider, Program, type Idl } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { useConfigStore } from '~/states/config';
import { useProjectStore } from '~/states/project';
import { AnchorWallet } from '~/types';
import idl from '~/assets/idl/lucky.json'
import { fetchProject } from '~/api/contract';
import { ref, computed } from 'vue'
import useMessage from '~/hooks/useMessage';

const emit = defineEmits(['success'])
const message = useMessage()
const configStore = useConfigStore()
const projectStore = useProjectStore()
const projectAddress = ref<string>('')

const connection = computed(() => new Connection(configStore.currentRPC, 'confirmed'))
const program = computed(() => new Program(idl as Idl, new AnchorProvider(connection.value, new AnchorWallet(Keypair.generate()))))

async function importProject() {
  const address = projectAddress.value
  const network = configStore.network
  if (!address) {
    message.error('Invalid project address')
    return
  }
  
  if (projectStore.projects(network).includes(address)) {
    message.warning('Project already exists')
    return
  }
  try {
    new PublicKey(address)
  } catch (error) {
    message.error('Invalid project address')
    return
  }
  const project = await fetchProject(address, program.value)
  if (project) {
    projectStore.addProject(address, network)
    message.success('Project imported successfully')
    emit('success')
  } else {
    message.error('Not found project')
  }
}

</script>
<template>
    <div class="bg-gray-900 rounded-lg p-10" @click.stop>
        <h2 class="text-2xl font-bold text-yellow-500 mb-6">Import Project</h2>
        <div class="space-y-4">
            <div class="flex flex-col">
                <label for="projectAddress" class="text-yellow-300 mb-2">Project Address</label>
                <input id="projectAddress" type="text" v-model="projectAddress"
                    class="bg-gray-800 text-yellow-500 rounded-md p-2 border border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 w-50">
            </div>
        </div>
        <div class="flex justify-end mt-4">
            <button
                class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                @click="importProject">
                Confirm
            </button>
        </div>
    </div>
</template>
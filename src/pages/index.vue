<script setup lang="ts" name="index">
import { AnchorProvider, Program, type Idl } from '@coral-xyz/anchor'
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import idl from '~/assets/idl/lucky.json'
import { fetchProject } from '~/api/contract';
import { AnchorWallet, type Project } from '~/types';
import { slotToTime } from '~/utils';
import { useConfigStore } from '~/states/config';
import { useProjectStore } from '~/states/project';
import { RemoveCircleOutline } from '@vicons/ionicons5'
import { ref, computed, onMounted } from 'vue'
import CopyAddress from '~/components/copy-address.vue';
import { formatTime } from '~/utils';

const configStore = useConfigStore()
const projectStore = useProjectStore()
const connection = computed(() => new Connection(configStore.currentRPC, 'confirmed'))
const program = computed(() => new Program(idl as Idl, new AnchorProvider(connection.value, new AnchorWallet(Keypair.generate()))))
const addresses = computed(() => projectStore.projects(configStore.network))
const projects = ref<Record<string, Project>>({})

const genesisTime = computed(() => configStore.genesisTime)

async function initProjects() {
    if (!addresses.value) return
    for (const address of addresses.value) {
        const project = await fetchProject(address, program.value)
        if (project) {
            projects.value[address] = project
        }
    }
}

function removeProject(address: string) {
    projectStore.removeProject(address, configStore.network)
}


onMounted(async () => {
    await initProjects()

})

</script>
<template>
    <!-- 首页，展示项目列表，列表以卡片的形式展示，点击卡片跳转至项目详情页 -->
    <div class="flex flex-col items-center justify-start min-h-screen p-4 bg-black">
        <div class="w-full max-w-md space-y-4">

            <div v-for="address in addresses" :key="address" 
                class="bg-gradient-to-r from-purple-900 to-indigo-900 text-yellow-300 shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300 border-2 border-yellow-400">
                <div class="flex justify-between">
                    <CopyAddress :address="address" />
                    <button @click="removeProject(address)">
                        <RemoveCircleOutline class="w-6 h-6 text-yellow-500 mr-4" />
                    </button>
                </div>
                <div v-if="projects[address]" @click="$router.push(`/project/${address}`)">
                    <h2 class="text-lg font-semibold text-yellow-400">{{ projects[address].name }}</h2>
                    <p class="text-sm mt-1 opacity-80 text-yellow-200">{{ projects[address].introduction }}</p>
                    <div class="mt-2 flex justify-between items-center">

                        <span class="text-sm text-yellow-300" v-if="projects[address].index == 0">Not Ready</span>
                        <span class="text-sm text-yellow-300" v-else>No.<span class="text-2xl font-bold text-yellow-400">{{
                            projects[address].index }}</span></span>
                        <span class="text-sm text-yellow-300"><span class="text-2xl font-bold text-yellow-400">{{
                            parseFloat((projects[address].amount / LAMPORTS_PER_SOL).toFixed(2)) }}</span> SOL</span>
                    </div>
                    <div class="mt-2 text-sm text-yellow-200">
                        {{ formatTime(slotToTime(projects[address].startSlot, genesisTime)) }}
                    </div>

                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* 可以添加一些全局样式 */
body {
    background-color: #000;
    color: #ffd700;
}
</style>
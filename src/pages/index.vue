<script setup lang="ts" name="index">
import { AnchorProvider, Program, type Idl } from '@coral-xyz/anchor'
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import idl from '~/assets/idl/lucky.json'
import { fetchProject } from '~/api/contract';
import { AnchorWallet, type Project } from '~/types';
import { useConfigStore } from '~/states/config';
import { useProjectStore } from '~/states/project';
import { RemoveCircleOutline, ArrowDownCircleOutline } from '@vicons/ionicons5'
import { ref, computed, onMounted } from 'vue'
import CopyAddress from '~/components/copy-address.vue';
import Loading from '~/components/loading.vue';
import { formatTime } from '~/utils';
import ImportProject from '~/components/import-project.vue';

const configStore = useConfigStore()
const projectStore = useProjectStore()
const connection = computed(() => new Connection(configStore.currentRPC, 'confirmed'))
const program = computed(() => new Program(idl as Idl, new AnchorProvider(connection.value, new AnchorWallet(Keypair.generate()))))
const addresses = computed(() => projectStore.projects(configStore.network))
const projects = ref<Record<string, Project>>({})
const showImportProjectModal = ref(false)

const loading = ref(true)

async function initProjects() {
    if (!addresses.value) return
    for (const address of addresses.value) {
        const project = await fetchProject(address, program.value)
        if (project) {
            projects.value[address] = project
        }
    }
    loading.value = false
}

function removeProject(address: string) {
    projectStore.removeProject(address, configStore.network)
}

function importProjectHandle() {
    initProjects()
    showImportProjectModal.value = false
}

onMounted(async () => {
    await initProjects()

})

</script>
<template>
    <!-- 首页，展示项目列表，列表以卡片的形式展示，点击卡片跳转至项目详情页 -->
    <div :class="['flex flex-col items-center h-full p-4 bg-black', loading ? 'justify-center' : 'justify-start']">
        <div class="w-full max-w-md space-y-4">
            <template v-if="loading">
                <Loading />
            </template>
            <template v-else>
                <template v-if="addresses.length == 0">
                    <div
                        class="bg-gradient-to-r from-purple-900 to-indigo-900 text-yellow-300 shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300 border-2 border-yellow-400">
                        <div class="flex flex-col items-center">
                            <h2 class="text-lg font-semibold text-yellow-400">Please import project!</h2>

                            <div class="flex justify-center mt-2 bg-yellow-300 hover:bg-yellow-300 text-black font-bold py-1 px-3 rounded text-sm"
                                @click="showImportProjectModal = true">
                                <ArrowDownCircleOutline class="w-6 h-6 text-yellow-500 mr-4" />
                                <span class="text-yellow-100">Import Project</span>
                            </div>
                            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                                v-if="showImportProjectModal" @click="showImportProjectModal = false">
                                <ImportProject @success="importProjectHandle" />
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else>

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
                            <p class="text-sm mt-1 opacity-80 text-yellow-200">{{ projects[address].introduction }}
                            </p>
                            <div class="mt-2 flex justify-between items-center">

                                <span class="text-sm text-yellow-300" v-if="projects[address].index == 0">Not
                                    Ready</span>
                                <span class="text-sm text-yellow-300" v-else>No.<span
                                        class="text-2xl font-bold text-yellow-400">{{
                                            projects[address].index }}</span></span>
                                <span class="text-sm text-yellow-300"><span
                                        class="text-2xl font-bold text-yellow-400">{{
                                            parseFloat((projects[address].amount / LAMPORTS_PER_SOL).toFixed(2))
                                        }}</span>
                                    SOL</span>
                            </div>
                            <div class="mt-2 text-sm text-yellow-200" v-if="projects[address].index">
                                {{ formatTime(projects[address].startTimestamp) }}
                            </div>

                        </div>
                    </div>

                </template>


            </template>

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
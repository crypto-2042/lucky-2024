<script setup lang="ts">
import { SettingsOutline, InformationCircleOutline, LogOutOutline, AddCircleOutline, ArrowDownCircleOutline } from '@vicons/ionicons5'
import { useConfigStore, type Network, ENV_CONFIG } from '~/states/config';
import { useWallet, WalletMultiButton } from 'solana-wallets-vue';
import CopyAddress from '~/components/copy-address.vue';
import { ref, watch } from 'vue'
import useMessage from '~/hooks/useMessage';
import ImportProject from '~/components/import-project.vue';

const message = useMessage()
const wallet = useWallet()
const connected = wallet.connected
const publicKey = wallet.publicKey
const configStore = useConfigStore()
const network = ref<Network>(configStore.network)
const rpc = ref<string>(configStore.currentRPC)


// todo
const avatarUrl = ref<string>('https://api.dicebear.com/6.x/avataaars/svg?seed=12123')
const showSettingsModal = ref(false)
const showImportProjectModal = ref(false)


async function saveConfig() {
  if (!rpc.value.startsWith('http://') && !rpc.value.startsWith('https://')) {
    message.error('Invalid RPC URL')
    return
  }
  configStore.setConfig(network.value, rpc.value)
  showSettingsModal.value = false
  message.success('network setting saved!')
}


async function logout() {
  wallet.disconnect()
}

watch(network, (value) => {
  rpc.value = ENV_CONFIG[value]
})

</script>

<template>
  <div class="flex flex-col h-full items-center justify-start min-h-screen p-4 bg-black">
    <div class="w-full max-w-md space-y-6">
      <template v-if="connected">
        <!-- 头像 -->
        <div class="flex justify-center">
          <img :src="avatarUrl" alt="用户头像" class="w-24 h-24 rounded-full border-4 border-yellow-600">
        </div>

        <!-- 用户名 -->
        <!-- <h2 class="text-xl text-center text-yellow-500">{{ publicKeyTrimmed }}</h2> -->
        <div class="flex justify-center">
          <CopyAddress :address="publicKey?.toBase58()??''" class="text-xl text-center text-yellow-500" />

        </div>

      </template>
      <template v-else>
        <div class="flex justify-center h-20 items-center">
          <WalletMultiButton/>
        </div>
      </template>
   
      <!-- 菜单列表 -->
      <div class="bg-gray-900 rounded-lg overflow-hidden">
        <div class="flex items-center p-4 hover:bg-gray-800 cursor-pointer transition-colors duration-200"
          @click="showSettingsModal=true">
          <SettingsOutline class="w-6 h-6 text-yellow-500 mr-4" />
          <span class="text-yellow-100">Settings</span>
        </div>
        <div class="flex items-center p-4 hover:bg-gray-800 cursor-pointer transition-colors duration-200"
          @click="$router.push('/project/creator')" v-if="connected">
          <AddCircleOutline class="w-6 h-6 text-yellow-500 mr-4" />
          <span class="text-yellow-100">Create Project</span>
        </div>
        <div class="flex items-center p-4 hover:bg-gray-800 cursor-pointer transition-colors duration-200"
          @click="showImportProjectModal=true">
          <ArrowDownCircleOutline class="w-6 h-6 text-yellow-500 mr-4" />
          <span class="text-yellow-100">Import Project</span>
        </div>
        <div class="flex items-center p-4 hover:bg-gray-800 cursor-pointer transition-colors duration-200">
          <InformationCircleOutline class="w-6 h-6 text-yellow-500 mr-4" />
          <span class="text-yellow-100">About</span>
        </div>
        <div class="flex items-center p-4 hover:bg-gray-800 cursor-pointer transition-colors duration-200"
          @click="logout" v-if="connected">
          <LogOutOutline class="w-6 h-6 text-yellow-500 mr-4" />
          <span class="text-yellow-100">Logout</span>
        </div>
      </div>
    </div>
    <!-- modal 展示 network 设置 -->
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" v-if="showSettingsModal" @click="showSettingsModal=false">
      <div class="bg-gray-900 rounded-lg p-8" @click.stop>
        <h2 class="text-2xl font-bold text-yellow-500 mb-6">Settings</h2>
        <div class="space-y-4">
          <div class="flex flex-col">
            <label for="network" class="text-yellow-300 mb-2">Select Network</label>
            <select id="network" v-model="network" class="bg-gray-800 text-yellow-500 rounded-md p-2 border border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="mainnet">main</option>
              <option value="testnet">test</option>
              <option value="devnet">dev</option>
              <option value="localnet">local</option>
            </select>
          </div>
          <div class="flex flex-col">
            <label for="rpc" class="text-yellow-300 mb-2">RPC</label>
            <input id="rpc" type="text" v-model="rpc" class="bg-gray-800 text-yellow-500 rounded-md p-2 border border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full">
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button
            class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            @click="saveConfig">
            Confirm
          </button>
        </div>
      </div>
    </div>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" v-if="showImportProjectModal" @click="showImportProjectModal=false">
      <ImportProject @success="showImportProjectModal=false" />
    </div>
  </div>
</template>
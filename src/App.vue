<script setup lang="ts">
import { HomeOutline, PersonOutline, AppsOutline } from '@vicons/ionicons5';
import { WalletMultiButton } from 'solana-wallets-vue';


</script>
<template>
  <div class="flex flex-col h-screen bg-gradient-to-b from-black to-gray-900 text-gold">
    <!-- 顶部状态栏 -->
    <div v-if="$route.path !== '/vote' && $route.path !== '/mine'"
      class="flex items-center justify-between h-14 bg-black bg-opacity-50 px-4">
      <h1 class="text-gold font-bold">Lucky 2024</h1>

      <WalletMultiButton />
    </div>

    <!-- 中部内容页 -->
    <div class="flex-1 overflow-y-auto">
        <RouterView />
    </div>
    <!-- 底部导航栏 -->
    <div class="flex items-center justify-between h-14 bg-gradient-to-r from-purple-900 to-indigo-900 shadow-lg">
      <button class="flex-1 text-gold flex items-center justify-center h-full transition-all duration-300"
        :class="{ 'bg-purple-800 bg-opacity-50 shadow-inner': $route.path === '/' }" @click="$router.push('/')">
        <HomeOutline class="w-6 h-6 text-gold" />
      </button>
      <button class="flex-1 text-gold flex items-center justify-center h-full transition-all duration-300"
        :class="{ 'bg-purple-800 bg-opacity-50 shadow-inner': $route.path === '/vote' }" @click="$router.push('/vote')">
        <AppsOutline class="w-6 h-6 text-gold" />
      </button>
      <button class="flex-1 text-gold flex items-center justify-center h-full transition-all duration-300"
        :class="{ 'bg-purple-800 bg-opacity-50 shadow-inner': $route.path === '/mine' }" @click="$router.push('/mine')">
        <PersonOutline class="w-6 h-6 text-gold" />
      </button>
    </div>
  </div>
</template>

<style>
.text-gold {
  color: #FFD700;
}
</style>

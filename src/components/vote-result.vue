<script setup lang="ts">
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { Vote } from '~/types';

interface Props {
  votes: Vote[]
}

const props = defineProps<Props> ()

// 计算最高票数（用于计算百分比）
const maxVotes = Math.max(...props.votes.map(item => item.amount))

</script>
<template>
  <div
    class="w-full max-w-md mt-2 bg-gradient-to-r from-purple-800 via-pink-700 to-red-700 p-6 rounded-lg  text-white border-2 border-yellow-300">
    <h2
      class="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-500">
      Result</h2>

    <div class="space-y-4">
      <div v-for="item in props.votes" :key="item.value" class="relative">
        <div class="flex items-center mb-2 justify-between">
          <span class="text-lg font-semibold mr-2 w-8 text-right">{{ item.value }}</span>
          <!-- <span class="text-lg font-medium flex-grow">{{ item.name }}</span> -->
          <span class="text-sm"><span class="text-lg font-bold pr-1">{{ (item.amount/LAMPORTS_PER_SOL).toFixed(2) }} </span>SOL</span>
        </div>
        <div class="h-6 bg-gray-800 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500 ease-out"
            :style="{ width: `${(item.amount / maxVotes) * 100}%` }"></div>
        </div>
      </div>
    </div>

    <!-- <div class="mt-8 text-center text-sm text-gray-300">
      总投票数: {{ totalVotes }}
    </div> -->
  </div>
</template>
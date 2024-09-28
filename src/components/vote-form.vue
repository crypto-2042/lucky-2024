<script setup lang="ts">

import { RefreshCircleOutline, RemoveCircleOutline, AddCircleOutline } from '@vicons/ionicons5'
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { defineProps, defineEmits, ref } from 'vue';

interface Props {
  base: number
  scope: number
}

interface Emits {
  (e: 'vote', value: number, amount: number): Promise<void>
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const sequenceNumber = ref('1')
const selectedVote = ref('0.1')
const customVote = ref('15')
const voteOptions = ['0.1', '1', '5', '10', '50', 'other']

const generateRandomNumber = () => {
  sequenceNumber.value = `${(Math.floor(Math.random() * props.scope) + 1)}`
}

const selectVote = (option: string) => {
  selectedVote.value = option
  if (option !== 'other') {
    customVote.value = '15'
  }
}


const submitVote = async () => {
  if (!sequenceNumber.value) {
    return
  }

  if (selectedVote.value === 'other' && !customVote.value) {
    return
  }
  const amount = parseFloat(selectedVote.value === 'other' ? customVote.value : selectedVote.value) * LAMPORTS_PER_SOL
  // 这里可以添加提交逻辑
  await emit('vote', parseInt(sequenceNumber.value), amount)


  // 重置表单
  sequenceNumber.value = '1'
  selectedVote.value = '0.1'
  customVote.value = ''
}
</script>
<template>
  <div
    class="w-full max-w-md bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 shadow-lg mt-2 border-2 border-yellow-300">
    <h2 class="text-3xl font-bold mb-6 text-center text-white">Vote</h2>
    <!-- 序号输入 -->
    <div class="mb-6">
      <label for="sequenceNumber" class="block text-sm font-medium text-gray-300 mb-2">NO</label>
      <div class="flex items-center">
        <input type="number" id="sequenceNumber" v-model="sequenceNumber"
          class="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none "
          placeholder="input number">
        <button @click="generateRandomNumber"
          class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-r-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900">
          <RefreshCircleOutline class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- 投票数选择 -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-300 mb-2">Vote (Base {{ props.base /
        LAMPORTS_PER_SOL}}OL)</label>
      <div class="flex flex-wrap gap-2">
        <button v-for="option in voteOptions" :key="option" @click="selectVote(option)" :class="[
          'px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200',
          selectedVote === option
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]">
          {{ option === 'other' ? 'other' : option }}
        </button>
      </div>
      <div v-if="selectedVote === 'other'" class="mt-2">
        <div class="py-2 px-3 w-full rounded-lg bg-gray-700">
          <div class="w-full flex justify-between items-center gap-x-3" data-hs-input-number="">
            <div>
              <!-- <span class="block text-xs text-gray-500 dark:text-neutral-400">
              Input quantity
            </span> -->
              <input
                class="p-0 bg-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none "
                style="-moz-appearance: textfield;" type="number" aria-roledescription="Number field"
                :value="customVote" data-hs-input-number-input="">
            </div>
            <div class="flex justify-end items-center gap-x-1.5">
              <button type="button"
                class="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border shadow-sm disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                @click="customVote = (parseFloat(customVote) - 1) + ''">
                <RemoveCircleOutline class="shrink-0 size-7" />
              </button>
              <button type="button"
                class="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border shadow-sm disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                @click="customVote = (parseFloat(customVote) + 1) + ''">
                <AddCircleOutline class="shrink-0 size-7" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 提交按钮 -->
    <button @click="submitVote"
      class="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 px-4 rounded-md hover:from-green-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 ease-in-out transform hover:scale-105">
      Submit
    </button>
  </div>
</template>
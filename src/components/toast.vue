<script setup lang="ts">
import { CheckmarkCircleOutline, CloseOutline, AlertCircleOutline, CloseCircleOutline } from '@vicons/ionicons5';
import { defineProps, defineEmits, onMounted } from 'vue';
const props = defineProps({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'success'
    },
    delay: {
        type: Number,
        default: 2000
    }
})
const emit = defineEmits(['close'])

onMounted(() => {
    setTimeout(() => {
        emit('close')
    }, props.delay);
})
</script>
<template>
    <!-- <div class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert"> -->
    <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-gray-900 rounded-lg shadow dark:text-gray-100 dark:bg-gray-900" role="alert">
        <div :class="[
            'inline-flex items-center justify-center flex-shrink-0 w-8 h-8',
            {
                'text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200': props.type == 'success',
                'text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200': props.type == 'error',
                'text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200': props.type == 'warning',
            }
        ]">
            <AlertCircleOutline v-if="props.type == 'warning'" class="w-5 h-5" />
            <CloseCircleOutline v-else-if="props.type == 'error'" class="w-5 h-5" />
            <CheckmarkCircleOutline v-else class="w-5 h-5" />
            <span class="sr-only">Check icon</span>
        </div>
        <div class="ms-3 text-sm font-normal">{{ props.message }}</div>
        <button type="button" @click="emit('close')"
            class="ms-auto -mx-1.5 -my-1.5 bg-gray-900 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-100 dark:hover:bg-gray-700">
            <span class="sr-only">Close</span>
            <CloseOutline class="w-4 h-4" />
        </button>
    </div>
</template>
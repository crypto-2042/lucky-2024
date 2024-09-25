<script lang="ts" setup>
import { CopyOutline, CheckmarkDoneOutline} from '@vicons/ionicons5'
import { defineProps, computed, ref } from 'vue'
const props = defineProps({
    address: {
        type: String,
        required: true
    },
    delay: {
        type: Number,
        default: 2000
    }
})

const trimAddress = computed(() => props.address ? (props.address.slice(0, 4) + '...' + props.address.slice(-4)) : '')
const copied = ref(false)

function copyAddress() {
    navigator.clipboard.writeText(props.address)
    copied.value = true
    setTimeout(() => {
        copied.value = false
    }, props.delay);
}
</script>
<template>
    <div class="flex items-center">
        <span class="truncate max-w-[12rem] text-yellow-300">{{ trimAddress }}</span>
        <button class="ml-1 p-1 rounded-full" @click="copyAddress">
            
            <CheckmarkDoneOutline v-if="copied" class="h-3 w-3 text-yellow-400" />
            <CopyOutline v-else class="h-3 w-3 text-yellow-400" />
        </button>
    </div>
</template>
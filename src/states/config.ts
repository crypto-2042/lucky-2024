import { defineStore } from "pinia";

export type Network = 'mainnet' | 'testnet' | 'devnet' | 'localnet'
export interface ConfigState {
    network: Network
    rpc: Record<Network, string>
    genesisTime: number
}

export const ENV_CONFIG: Record<Network, string> = {
    'mainnet': 'https://api.mainnet-beta.solana.com',
    'testnet': 'https://api.testnet.solana.com',
    'devnet': 'https://api.devnet.solana.com',
    'localnet': 'http://127.0.0.1:8899'
}

const GENESIS_TIME = {
    'mainnet': 1584368940000,
    'testnet': 1580834132000,
    // 基于当前时间校准，中途可能因为停机导致时间不准确
    'devnet': 1595875632000,
    'localnet': Date.now(),
}

const STORE_KEY = 'config:v2'
const DEFAULT_NETWORK = 'mainnet'
const DEFAULT_STATE: ConfigState = {
    network: DEFAULT_NETWORK,
    rpc: ENV_CONFIG,
    genesisTime: GENESIS_TIME[DEFAULT_NETWORK],
}

function loadConfig(): ConfigState {
    const config = localStorage.getItem(STORE_KEY)
    if (config) {
        return JSON.parse(config)
    }
    return DEFAULT_STATE
}

function saveConfig(config: ConfigState) {
    localStorage.setItem(STORE_KEY, JSON.stringify(config))
}
export const useConfigStore = defineStore('config', {
    state: (): ConfigState => loadConfig(),
    getters: {
        currentRPC: (state): string => {
            return state.rpc[state.network]
        }
    },
    actions: {
        setConfig(network: Network, rpc: string) {
            this.network = network
            this.rpc[network] = rpc
            this.genesisTime = GENESIS_TIME[network]
            saveConfig(this.$state)
        }, 
        updateGenesisTime(genesisTime: number) {
            this.genesisTime = genesisTime
            saveConfig(this.$state)
        },
        resetConfig() {
            this.network = DEFAULT_NETWORK
            this.rpc = ENV_CONFIG
            this.genesisTime = GENESIS_TIME[DEFAULT_NETWORK]
            saveConfig(this.$state)
        }
    }
})
import { defineStore } from "pinia";

export type Network = 'mainnet' | 'testnet' | 'devnet' | 'localnet'
export interface ConfigState {
    network: Network
    rpc: Record<Network, string>
}

export const ENV_CONFIG: Record<Network, string> = {
    'mainnet': 'https://api.mainnet-beta.solana.com',
    'testnet': 'https://api.testnet.solana.com',
    'devnet': 'https://api.devnet.solana.com',
    'localnet': 'http://127.0.0.1:8899'
}


const STORE_KEY = 'config:v3'
const DEFAULT_NETWORK = 'mainnet'
const DEFAULT_STATE: ConfigState = {
    network: DEFAULT_NETWORK,
    rpc: ENV_CONFIG,
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
            saveConfig(this.$state)
        }, 
        resetConfig() {
            this.network = DEFAULT_NETWORK
            this.rpc = ENV_CONFIG
            saveConfig(this.$state)
        }
    }
})
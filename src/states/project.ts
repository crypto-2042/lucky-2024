import { defineStore } from "pinia";
import type { Network } from "./config";

export type ProjectState = Record<Network, string[]>

const STORE_KEY = 'project:v0'
const DEFAULT_STATE: ProjectState = {
    mainnet: [],
    testnet: [],
    devnet: [],
    localnet: [],
}

function loadProject(): ProjectState {
    const project = localStorage.getItem(STORE_KEY)
    if (project) {
        return JSON.parse(project)
    }
    return DEFAULT_STATE
}

function saveProject(project: ProjectState) {
    localStorage.setItem(STORE_KEY, JSON.stringify(project))
}

export const useProjectStore = defineStore('project', {
    state: (): ProjectState => loadProject(),
    getters: {
        projects: (state) => {
            return (network: Network): string[] => {
                return state[network]
            }
        }
    },
    actions: {
        addProject(project: string, network: Network) {
            this.$state[network].push(project)
            saveProject(this.$state)
        },
        removeProject(project: string, network: Network) {
            this.$state[network] = this.$state[network].filter(p => p !== project)
            saveProject(this.$state)
        }
    }
})
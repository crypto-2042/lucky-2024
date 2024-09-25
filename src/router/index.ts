import { createMemoryHistory, createRouter } from 'vue-router';
import Home from '~/pages/index.vue'
import Vote from '~/pages/vote.vue'
import Mine from '~/pages/mine.vue'
import Project from '~/pages/project/[address].vue'
import CreateProject from '~/pages/project/creator.vue'

const routes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/vote',
        component: Vote
    },
    {
        path: '/mine',
        component: Mine
    },
    {
        path: '/project/:address',
        component: Project
    },
    {
        path: '/project/creator',
        component: CreateProject
    }
]

export const router = createRouter({
    history: createMemoryHistory(),
    routes
})
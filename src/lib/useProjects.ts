import { useSyncExternalStore } from 'react'
import {
  getProjectsSnapshot,
  initProjects,
  isProjectsReady,
  subscribeProjects,
} from './projectsStore'

let bootstrapped = false

function ensureInit() {
  if (bootstrapped) return
  bootstrapped = true
  void initProjects()
}

export function useProjects() {
  ensureInit()
  return useSyncExternalStore(subscribeProjects, getProjectsSnapshot, getProjectsSnapshot)
}

export function useProjectsReady() {
  ensureInit()
  return useSyncExternalStore(
    subscribeProjects,
    isProjectsReady,
    () => true,
  )
}

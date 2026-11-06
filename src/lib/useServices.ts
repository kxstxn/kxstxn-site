import { useSyncExternalStore } from 'react'
import {
  getServicesSnapshot,
  initServices,
  subscribeServices,
} from './servicesStore'

let bootstrapped = false

function ensureInit() {
  if (bootstrapped) return
  bootstrapped = true
  void initServices()
}

export function useServices() {
  ensureInit()
  return useSyncExternalStore(subscribeServices, getServicesSnapshot, getServicesSnapshot)
}

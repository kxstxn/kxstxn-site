import { useSyncExternalStore } from 'react'
import { getSiteSnapshot, initSite, subscribeSite } from './siteStore'

let bootstrapped = false

function ensureInit() {
  if (bootstrapped) return
  bootstrapped = true
  void initSite()
}

export function useSite() {
  ensureInit()
  return useSyncExternalStore(subscribeSite, getSiteSnapshot, getSiteSnapshot)
}

import { useSyncExternalStore } from 'react'
import {
  getContactsSnapshot,
  initContacts,
  subscribeContacts,
} from './contactsStore'

let bootstrapped = false

function ensureInit() {
  if (bootstrapped) return
  bootstrapped = true
  void initContacts()
}

export function useContacts() {
  ensureInit()
  return useSyncExternalStore(subscribeContacts, getContactsSnapshot, getContactsSnapshot)
}

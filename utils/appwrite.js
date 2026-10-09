import { Client, Account, Avatars, TablesDB, Storage, ID, OAuthProvider, AuthenticatorType, Query } from 'appwrite'

const endpoint = import.meta.env?.APPWRITE_ENDPOINT
  || (typeof process !== 'undefined' && process.env?.APPWRITE_ENDPOINT)
  || 'https://sgp.cloud.appwrite.io/v1'

const projectId = import.meta.env?.APPWRITE_PROJECT_ID
  || (typeof process !== 'undefined' && process.env?.APPWRITE_PROJECT_ID)
  || '6a9e987200268817ec4c'

export const APPWRITE_DATABASE_ID = import.meta.env?.APPWRITE_DATABASE_ID
  || (typeof process !== 'undefined' && process.env?.APPWRITE_DATABASE_ID)
  || '6a9f5bfb00026954d579'

export const APPWRITE_TABLE_SETTINGS = import.meta.env?.APPWRITE_TABLE_SETTINGS
  || (typeof process !== 'undefined' && process.env?.APPWRITE_TABLE_SETTINGS)
  || 'settings'

export const APPWRITE_TABLE_SERVICES = import.meta.env?.APPWRITE_TABLE_SERVICES
  || (typeof process !== 'undefined' && process.env?.APPWRITE_TABLE_SERVICES)
  || 'services'

export const APPWRITE_TABLE_POINT_TRANSACTIONS = import.meta.env?.APPWRITE_TABLE_POINT_TRANSACTIONS
  || (typeof process !== 'undefined' && process.env?.APPWRITE_TABLE_POINT_TRANSACTIONS)
  || 'point_transactions'

export const APPWRITE_TABLE_NASKAH = import.meta.env?.APPWRITE_TABLE_NASKAH
  || (typeof process !== 'undefined' && process.env?.APPWRITE_TABLE_NASKAH)
  || 'naskah'

export const APPWRITE_BUCKET_NASKAH = import.meta.env?.APPWRITE_BUCKET_NASKAH
  || (typeof process !== 'undefined' && process.env?.APPWRITE_BUCKET_NASKAH)
  || 'naskah'

export const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)

export const account = new Account(client)
export const avatars = new Avatars(client)
export const tablesDB = new TablesDB(client)
export const storage = new Storage(client)

export { ID, OAuthProvider, AuthenticatorType, Query, TablesDB, Storage }

// Run ping once when app starts to confirm setup
client.ping().then((response) => {
  console.log('Appwrite connected successfully:', response)
}).catch((err) => {
  console.warn('Appwrite ping status:', err?.message || err)
})

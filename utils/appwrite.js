import { Client, Account, Avatars } from 'appwrite'

export const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('6a9e987200268817ec4c')

export const account = new Account(client)
export const avatars = new Avatars(client)
export { ID, OAuthProvider, AuthenticatorType } from 'appwrite'

// Run ping once when app starts to confirm setup
client.ping().then((response) => {
  console.log('Appwrite connected successfully:', response)
}).catch((err) => {
  console.warn('Appwrite ping status:', err?.message || err)
})

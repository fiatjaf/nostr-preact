import {verifySignature, getPublicKey} from 'nostr-tools'
import {parsePolicy, overwriteEvent} from '../lib/helpers'
import {
  CONTEXT_NOW,
  CONTEXT_REQUESTED,
  CONTEXT_PAST,
  KIND_METADATA,
  KIND_TEXTNOTE,
  KIND_RECOMMENDSERVER,
  KIND_CONTACTLIST
} from '../lib/constants'
import {db} from '../lib/db'
import {pool} from '../lib/relay'

export default {
  async receivedEvent(store, dispatch, {event, context}) {
    // console.log(store);
    if (!verifySignature(event)) {
      console.log('received event with invalid signature', event)
      return
    }

    switch (event.kind) {
      case KIND_METADATA:
        if (context === CONTEXT_REQUESTED) {
          // just someone we're viewing
          dispatch({type: 'receivedSetMetadata', payload: {event, context}})
        } else if (context === CONTEXT_NOW) {
          // an update from someone we follow that happened just now
          dispatch({type: 'receivedSetMetadata', payload: {event, context}})
          await db.events
            .where({kind: KIND_METADATA, pubkey: event.pubkey})
            .delete()
          await db.events.put(event)
        } else if (context === CONTEXT_PAST) {
          // someone we follow, but an old update -- check first
          // check first if we don't have a newer one
          let foundNewer = await overwriteEvent(
            {kind: KIND_METADATA, pubkey: event.pubkey},
            event
          )
          if (!foundNewer) store('receivedSetMetadata', {event, context})
        }
        break
      case KIND_TEXTNOTE:
        if (event.pubkey === getPublicKey(store.key)) {
          db.mynotes.put(event)
        }
        // console.log(event);
        // if(event.tags && event.tags.length){
        //   event.tags.map(c => {
        //     c[0] === 'e' ? console.log(event) : null
        //   })
        // }
        dispatch({type: 'receivedTextNote', payload: {event, context}})
        break
      case KIND_RECOMMENDSERVER:
        let host = event.content

        try {
          new URL(host)
        } catch (err) {
          // ignore invalid URLs
          return
        }

        // ignore if we already know this
        // this prevents infinite loops and overwriting of our settings
        if (await db.relays.get(host)) {
          return
        }

        if (context === 'requested') {
          // someone we're just browsing
          await db.relays.put({
            host,
            policy: '',
            recommender: event.pubkey
          })
        } else {
          // someone we're following
          await db.relays.put({
            host,
            policy: 'r',
            recommender: event.pubkey
          })
        }

        store('loadedRelays', await db.relays.toArray())
        break
      case KIND_CONTACTLIST:
        // if (!(event.pubkey in store.state.petnames)) {
        //   // we don't know this person, so we won't use their contact list
        //   return
        // }

        // check if we have a newest version already
        let foundNewer = await overwriteEvent(
          {pubkey: event.pubkey, kind: KIND_CONTACTLIST},
          event
        )
        // process
        if (!foundNewer) store.dispatch('processContactList', event)

        break
    }
  },
  pubKeyHex (key) {
    return getPublicKey(key)
  }
}

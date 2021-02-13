// const Buffer = require('buffer/').Buffer

import { SortedMap } from "insort";
import LRU from "quick-lru";
import { getPublicKey, makeRandom32 } from "nostr-tools";
import { pool } from "../lib/relay";

import {
  CONTEXT_NOW,
  CONTEXT_REQUESTED,
  CONTEXT_PAST,
  KIND_METADATA,
  KIND_TEXTNOTE,
  KIND_RECOMMENDSERVER,
  KIND_CONTACTLIST
} from "../lib/constants";

let secretKey = localStorage.getItem("key");
if (!secretKey) {
  secretKey = Buffer.from(makeRandom32()).toString("hex");
  localStorage.setItem("key", secretKey);
}

pool.setPrivateKey(secretKey);

export const initialState = {
  key: secretKey,
  following: [],
  home: new SortedMap(),
  metadata: new LRU({ maxSize: 100 }),
  browsing: new LRU({ maxSize: 500 }),
  publishStatus: {},
  petnames: {},
  ignoredRelays: {},
  initialized: false
};

export const reducer = (state, action) => {
  console.debug(action);
  switch (action.type) {
    case "INIT":
      // always be following thyself
      // action.payload.following = action.payload.following.concat(getPublicKey(state.key))

      return {
        ...state,
        ...action.payload,
        initialized: true
      };
    case "receivedSetMetadata":
      try {
        let meta = JSON.parse(event.content);
        let {metadata} = state
        metadata.set(event.pubkey, meta);
        return {
          ...state,
          metadata
        }
      } catch (err) {}
    case "receivedTextNote":
      let { event: evt, context } = action.payload;
      let { browsing, home } = state;

      browsing.set(evt.id.slice(0, 5), evt);
      browsing.set(`from:${evt.pubkey.slice(0, 5)}:${evt.id.slice(0, 5)}`, evt);
      if (evt.tags && evt.tags.length) {
        evt.tags.map(c => {
          if(c[0] === 'e'){
            // console.log(evt);
            let noteId = c[1]
            browsing.set(`rel:${noteId.slice(0, 5)}:${evt.id.slice(0, 5)}`, evt);
          }
        })
        // console.log(state)
      }
      if (context === CONTEXT_PAST) {
        Promise.resolve(pool.reqEvent({ id: evt.id })).then(res =>
          console.log("CONTEXT", res)
        );
      }

      // only past and happening notes go to the main feed
      if (context !== CONTEXT_REQUESTED) {
        home.set(`${evt.id}:${evt.created_at}`, evt);
        // console.log(home);
      }
      return {
        ...state,
        browsing,
        home
      };
    default:
      return state;
  }
};

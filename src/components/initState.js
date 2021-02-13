import { useEffect } from "preact/hooks";
import { getPublicKey } from 'nostr-tools';
import { useStateValue } from "../context/Context";
import { pool, hardcodedRelays } from "../lib/relay";
import { parsePolicy } from "../lib/helpers";
import { db } from "../lib/db";
import { SortedMap } from "insort";

import actions from "../reducers/actions";

//4f4c3df89cfb47a9552fbff38209ef1686ea8a17ff15ca9957e6a6a4a6ad4f5f

import { KIND_METADATA, KIND_CONTACTLIST } from "../lib/constants";

async function init(key, store) {
  let [following, home, metadata, petnames] = await Promise.all([
    db.following.toArray().then(r => r.map(({ pubkey }) => pubkey).concat(getPublicKey(key))),
    db.mynotes
      .orderBy("created_at")
      .reverse()
      .limit(30)
      .toArray()
      .then(notes => {
        return new SortedMap(
          notes.map(n => [`${n.id}:${n.created_at}`, n]),
          (a, b) => b.split(":")[1] - a.split(":")[1]
        );
      }),
    db.events
      .where({ kind: KIND_METADATA })
      .toArray()
      .then(events => {
        let metadata = {};
        events.forEach(({ content, pubkey }) => {
          let meta = JSON.parse(content);
          metadata[pubkey] = meta;
        });
        return metadata;
      }),
    db.contactlist.toArray().then(contacts => {
      let petnames = {};
      contacts.forEach(({ pubkey, name }) => {
        petnames[pubkey] = [[name]];
      });
      return petnames;
    })
  ]);

  store({
    type: "INIT",
    payload: {
      following,
      home,
      metadata,
      petnames
    }
  });

  // process contact lists (nip-02)
  // let events = await db.events.where({ kind: KIND_CONTACTLIST }).toArray();
  // for (let i = 0; i < events.length; i++) {
  //   store.dispatch("processContactList", events[i]);
  // }
  return following;
}

async function initPool(following, store, dispatch) {
  const followingPromises = [];
  following.forEach(key => {
    followingPromises.push(pool.subKey(key));
  });
  Promise.all(followingPromises).then(() => {
    db.relays
      .bulkPut(hardcodedRelays)
      .then(() => db.relays.toArray())
      .then(relays => {
        relays.forEach(({ host, policy }) => {
          if (policy.indexOf("i") !== -1) {
            // store("ignoreRelay", host);
          }

          let relay = pool.addRelay(host, parsePolicy(policy));
          setTimeout(() => {
            relay.reqFeed();
          }, 1);
        });
      });
  });

  // setup event listener
  pool.onEvent(async (event, context, { url: relayURL }) => {
    actions.receivedEvent(store, dispatch, { event, context });
    // console.log({ event }, { context });
    // is this our note? mark it as published on this relay
    if (await db.mynotes.get(event.id)) {
      db.publishlog.put({
        id: event.id,
        time: Math.round(Date.now() / 1000),
        relay: relayURL,
        status: "published"
      });
    }
  });

  // setup attempt status listener
  pool.onAttempt((eventId, status, { url: relayURL }) => {
    db.publishlog.put({
      id: eventId,
      time: Math.round(Date.now() / 1000),
      relay: relayURL,
      status
    });
  });
}

export default ({ children }) => {
  const [state, dispatch] = useStateValue();

  useEffect(() => {
    return init(state.key, dispatch)
      .then(f => initPool(f, state, dispatch))
  }, []);
  return <></>;
};

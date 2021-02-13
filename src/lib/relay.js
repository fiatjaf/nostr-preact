import { relayPool } from "nostr-tools";

import { db } from "./db";
// import { parsePolicy } from "./helpers";

export const pool = relayPool();

export const hardcodedRelays = [
  {
    host: "wss://moonbreeze.richardbondi.net/ws",
    policy: "rw"
  },
  {
    host: "https://nostr-relay.herokuapp.com",
    policy: "rw"
  }
];

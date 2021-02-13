import { h } from "preact";
import { useEffect } from "preact/hooks";
import { Note, Publish } from "../../components/notes/Notes";
import { pool } from "../../lib/relay";
import { db } from "../../lib/db"
import {CONTEXT_NOW, KIND_TEXTNOTE} from "../../lib/constants";
import actions from "../../reducers/actions"

import { useStateValue } from "../../context/Context";

const Home = ({servers}) => {
  const [state, dispatch] = useStateValue();
  const notes = [];

  state.home.forEach((note, i) => {
    notes.push(note);
  });

  const publishNote = async (ev) => {
    let event = await pool.publish({
      pubkey: actions.pubKeyHex(state.key),
      kind: KIND_TEXTNOTE,
      ...ev
    })
    db.mynotes.put(event)
  }

  return (
    <main className="home-grid container is-fluid">
      <header id="publish">
        <Publish servers={servers} publishNote={publishNote} />
      </header>
      <section id="posts">
        {state.home.size === 0 ? (
          <p>No posts...</p>
        ) : (
          notes.map(note => {
            return <Note note={note} key={note.id} servers={servers} publishNote={publishNote} />;
          })
        )}
      </section>
      <nav id="nav" />
      <footer id="footer" />
    </main>
  );
};

export default Home;

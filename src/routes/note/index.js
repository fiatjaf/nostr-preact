import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Note, Publish } from "../../components/notes/Notes";
import { pool } from "../../lib/relay";
import { db } from "../../lib/db";
import { CONTEXT_NOW, KIND_TEXTNOTE } from "../../lib/constants";
import actions from "../../reducers/actions";

import { useStateValue } from "../../context/Context";

const NotePage = ({ id, servers, test }) => {
  const [state, dispatch] = useStateValue();
  const [note, setNote] = useState();
  const [rel, setRel] = useState([]);

  const publishNote = async (ev) => {
    let event = await pool.publish({
      pubkey: actions.pubKeyHex(state.key),
      kind: KIND_TEXTNOTE,
      ...ev
    })
    db.mynotes.put(event)
  }

  const getNote = async () => {
    const _note = await state.browsing.get(id.slice(0, 5));
    if (_note) {
      setNote(_note);
      const related = await getRelated(_note)
      await setRel(related)
      return _note;
    }
    setTimeout(() => getNote(), 500);
  };

  const getRelated = async (n) => {
    // console.log(state.home)

    const relatedNotes = []
    for (const key of state.browsing.keys()) {
      // console.log(key.slice(0, 10));
      if (key.slice(0, 10) == `rel:${n.id.slice(0, 5)}:`) {
        relatedNotes.push(state.browsing.get(key));
      }
    }
    return relatedNotes
  };

  useEffect(() => {
    if (state.initialized) {
      getNote()
    }
  }, [state.initialized, id]);

  return (
    <main className="container is-fluid">
      <h1>Note</h1>
      {note ? (
        <>
          <Note note={note} key={note.id} servers={servers} publishNote={publishNote} />
          {rel && rel.map(n => (
            <Note note={n} key={n.id} servers={servers} publishNote={publishNote} />
          ))}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
};

export default NotePage;

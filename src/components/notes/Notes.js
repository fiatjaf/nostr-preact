import prettydate from "pretty-date";
import { useState, useEffect } from "preact/hooks";
import { useStateValue } from "../../context/Context";
import { Link } from "preact-router/match";

export const Note = ({ note, key, servers, publishNote }) => {
  const [ref, toggleRef] = useState(false)
  let replies = [...note.tags]
  let isReply
  if(replies.length) {
    isReply = note.tags[0][1]
  }

  return (
    <article class="card">
      <div class="card-content">
        <div class="media">
          <div class="media-left">
            <figure class="image is-rounded is-48x48">
              <img
                src="../assets/img/avatar-default.png"
                alt="Placeholder image"
              />
            </figure>
          </div>
          <div class="media-content">
            <p class="title is-4">{abrr(note.pubkey)}</p>
            <p class="subtitle is-6 has-text-grey">
              <Link href={`/note/${note.id}`}>{humanDate(note.created_at)}</Link>
            </p>
          </div>
        </div>
        <div class="content">
          {isReply ? <p class='is-size-7 has-text-grey-light'>
            <Link href={`/note/${isReply}`}>{`In reply to ${isReply.slice(0, 4)}...`}</Link>
          </p> : null}
          <br/>
          {note.content}
        </div>
      </div>
      <div class="card-action">
        {ref && <Publish servers={servers} publishNote={publishNote} reference={note.id} refOff={() => toggleRef(false)} />}
        {!ref && <button class="button is-primary is-rounded" onClick={() => toggleRef(true)}>Reply</button>}

      </div>
    </article>
  );
};

export const Publish = ({ servers, publishNote, reference, refOff }) => {
  const [state, dispatch] = useStateValue();

  const [post, setPost] = useState("");
  const [publishing, togglePublish] = useState(false);
  const publishPost = e => {
    e.preventDefault();
    togglePublish(true);
    publishNote({
      created_at: Math.round(new Date().getTime() / 1000),
      tags: reference ? [['e', reference, '']] : [],
      ref: reference ?? reference,
      content: post.trim()
    })
    setPost("");
    if(reference){
      refOff()
    }
    togglePublish(false);
  };
  return (
    <div class="publish">
      <form>
        <textarea
          class="textarea"
          placeholder="Publish something"
          value={post}
          onChange={e => setPost(e.target.value)}
        />
        <footer>
          <p>
            <small class="is-family-code has-text-weight-light has-text-grey">
              Publishing to: [{servers}]
            </small>
          </p>
          <button
            class="button is-primary is-pulled-right is-rounded"
            onClick={publishPost}
            disabled={publishing}
          >
            <span>{reference ? `Reply` : `Post`}</span>
            <span class="icon">
              <ion-icon name="send-sharp" />
            </span>
          </button>
          {reference && <button class="button is-danger is-light is-pulled-right is-rounded mr-2"  onClick={() => toggleRef(true)}>Cancel</button>}
        </footer>
      </form>
    </div>
  );
};

const abrr = pubkey => `${pubkey.slice(0, 4)  }…${  pubkey.slice(-4)}`;

const humanDate = d => {
  if (typeof d === "number") d = new Date(d * 1000);
  return d && prettydate.format(d);
};

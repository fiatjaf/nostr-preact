import { h } from "preact";
import { useEffect } from "preact/hooks";
import { Router } from "preact-router";
import { StateProvider } from "../context/Context";
import { reducer, initialState } from "../reducers/reducer";
import Init from './initState'

import { pool } from "../lib/relay";

import Header from "./header";

// Code-splitting is automated for `routes` directory
import Home from "../routes/home";
import NotePage from "../routes/note";
import Profile from "../routes/profile";

const writeServersList = () => {
  if (!Object.keys(pool.relays).length) return "Loading...";
  return Object.keys(pool.relays)
    .filter(url => pool.relays[url].policy.write)
    .join(", ")
    .replace(/"/g, "");
};

const App = () => {
  const servers = writeServersList()
  return (
    <div id="app" class='has-background-white-ter	'>
      <StateProvider initialState={initialState} reducer={reducer} >
				<Init />
        <Header />
        <Router>
          <Home path="/" servers={servers} />
          <NotePage path="/note/:id" servers={servers} />
          <Profile path="/profile/" user="me" />
          <Profile path="/profile/:user" />
        </Router>

      </StateProvider>
    </div>
  );
};

export default App;

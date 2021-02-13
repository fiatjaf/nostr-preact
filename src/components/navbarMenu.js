import { useRef, useState } from "preact/hooks";
import { route } from "preact-router";

export const NavbarSearch = ({ props }) => {
  const inputSearch = useRef();
  const [searchVal, setSearchVal] = useState("");

  const handleChange = e => {
    setSearchVal(inputSearch.current.value);
  };

  const submitSearch = e => {
    e.preventDefault();
    route(`/profile/${searchVal}`);
    setSearchVal("");
  };

  return (
    <div class="navbar-item">
      <form class="control has-icons-right" onsubmit={submitSearch}>
        <input
          class="input is-rounded"
          type="text"
          placeholder="Search"
          ref={inputSearch}
          value={searchVal}
          onKeyUp={handleChange}
        />
        {searchVal.length === 0 ? (
          <span class="icon is-small is-right">
            <ion-icon name="search-sharp" />
          </span>
        ) : (
          <span class="icon is-small is-right" onclick={() => setSearchVal("")} style='cursor: pointer;'>
            <ion-icon name="close-circle-sharp" />
          </span>
        )}
      </form>
    </div>
  );
};

export const NavbarProfile = ({ props }) => {
  const profile = useRef();
  return (
    <div
      class="navbar-item is-account drop-trigger has-caret"
      ref={profile}
      onclick={() => profile.current.classList.toggle("is-active")}
    >
      <figure class="image user-image">
        <img class="is-rounded" src="assets/img/avatar-default.png" />
      </figure>
    </div>
  );
};

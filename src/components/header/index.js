import { h } from "preact";
import { Link } from "preact-router/match";
import { useRef } from 'preact/hooks'
import { NavbarSearch, NavbarProfile } from "../navbarMenu";

const Header = () => {
  const menuToggle = useRef()
  const menu = useRef()

  const handleToggle = () => {
    menuToggle.current.classList.toggle('is-active')
    menu.current.classList.toggle('is-active')
  }

  return (
  <header class="navbar">
    <div className="container is-fluid">
      <div className="navbar-brand">
        <Link href="/" class="navbar-item">
          <img
            class="logo light-image"
            src="../../assets/img/satellite-dish.svg"
            width="112"
            height="28"
            alt=""
          />
        </Link>
        <a
          role="button"
          class="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          ref={menuToggle}
          onclick={handleToggle}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>
      <div className="navbar-menu" ref={menu}>
        <div className="navbar-start">e</div>
        <div className="navbar-end">
          <NavbarSearch />
          <NavbarProfile />
        </div>
      </div>
    </div>
  </header>
)};

export default Header;

// <h1>Preact App</h1>
// <nav>
// 	<Link activeClassName="" href="/">
// 		Home
// 	</Link>
// 	<Link activeClassName="" href="/profile">
// 		Me
// 	</Link>
// 	<Link activeClassName="" href="/profile/john">
// 		John
// 	</Link>
// </nav>

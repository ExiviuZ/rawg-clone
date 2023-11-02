import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faGamepad,
  faArrowLeft,
  faArrowRight,
  faTimes,
  faBars,
  faListSquares,
} from "@fortawesome/free-solid-svg-icons";
import {
  faPlaystation,
  faXbox,
  faAndroid,
  faApple,
  faWindows,
  faLinux,
} from "@fortawesome/free-brands-svg-icons";
import "./styles/modern-normalize.css";
import "./styles/App.css";

const gameGenreEndPoint = "https://api.rawg.io/api/genres";
const gamesEndPoint = "https://api.rawg.io/api/games";
const myKey = "9ddc651261aa44139ef19394e5ad0a95";
const page_size = 40;
// https://api.rawg.io/api/games/278?key=9ddc651261aa44139ef19394e5ad0a95

// https://api.rawg.io/api/genres/4?key=9ddc651261aa44139ef19394e5ad0a95&

// Main

export default function App() {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [genres, setGenres] = useState([]);
  const [endPoint, setEndPoint] = useState(
    `${gamesEndPoint}?key=${myKey}&page_size=${page_size}&page=${currentPage}`
  );

  useEffect(function () {
    async function fetchGameCategories() {
      try {
        const res = await fetch(
          `${gameGenreEndPoint}?key=${myKey}&page_size${40}`
        );
        const { results } = await res.json();
        console.log(results);
        setGenres(results);
      } catch (error) {
        console.log(error);
        console.log("Something went wrong");
      }
    }

    fetchGameCategories();
  }, []);

  useEffect(() => {
    let endpoint = `${gamesEndPoint}?key=${myKey}&page_size=${page_size}&page=${currentPage}`;
    async function getGenreDetails() {
      const res = await fetch(
        `https://api.rawg.io/api/genres/${filter.id}?key=9ddc651261aa44139ef19394e5ad0a95`
      );
      const data = await res.json();
      setIsOpenMenu(false);
      setActiveGenre(data);
      setShowFullDescription(false);
    }

    if (filter) {
      endpoint += `&genres=${filter.slug}`;
      getGenreDetails();
    }

    if (search) {
      endpoint += `&search=${search}`;
    }

    setEndPoint(endpoint);
  }, [currentPage, filter, search]);

  function handleSetFilter(selectedFilter) {
    setCurrentPage(1);
    setFilter(selectedFilter);
  }

  if (isOpenMenu) {
    document.body.style.height = "100vh";
    document.body.style.overflowY = "hidden";
  } else {
    document.body.style.height = "auto";
    document.body.style.overflowY = "visible";
  }

  return (
    <>
      <header id="top-part" className="header">
        <nav className="nav">
          <a href="/">
            <img src="gamepad.png" height={55} />
          </a>
          <div className="search-box">
            <FontAwesomeIcon className="search-icon" icon={faMagnifyingGlass} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              className="search"
              placeholder="Search Games..."
            />
          </div>
          {genres.length != 0 ? (
            <FontAwesomeIcon
              className="burger"
              onClick={() => setIsOpenMenu(!isOpenMenu)}
              size="2xl"
              icon={faBars}
            />
          ) : null}
        </nav>
      </header>
      <main>
        <div className={`box-1 ${!isOpenMenu ? "" : "open"}`}>
          <h2>
            <span>Genres</span>{" "}
            <FontAwesomeIcon
              onClick={() => setIsOpenMenu(!isOpenMenu)}
              size="lg"
              icon={faTimes}
              className="close"
            />
          </h2>
          <GenresList
            onSetFilter={handleSetFilter}
            genres={genres}
            setGenres={setGenres}
            setSearch={setSearch}
          />
        </div>
        <div className="box-2">
          {!filter && <h1 id="title">Explore Endless Video Games!</h1>}

          <GamesList
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            loading={loading}
            setLoading={setLoading}
            endPoint={endPoint}
            activeGenre={activeGenre}
            setShowFullDescription={setShowFullDescription}
            filter={filter}
            showFullDescription={showFullDescription}
          />
        </div>
      </main>
      <footer></footer>
    </>
  );
}

// Game Part !!

function GamesList({
  currentPage,
  setCurrentPage,
  endPoint,
  loading,
  setLoading,
  activeGenre,
  setShowFullDescription,
  showFullDescription,
  filter,
}) {
  const [games, setGames] = useState([]);
  const [order, setOrder] = useState(false);
  const page_size = 40;
  const removeHtmlTags = (htmlString) => {
    const div = document.createElement("p");
    div.innerHTML = htmlString;
    return div.textContent || div.innerText || "";
  };

  function minimizeText(text) {
    const startingLength = 50;
    return `${text.split(" ").slice(0, startingLength).join(" ")}`;
  }
  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchGames() {
        setLoading(true);
        try {
          if (order) {
            endPoint += `&ordering=-${order}`;
          }
          const res = await fetch(endPoint, { signal: controller.signal });
          const data = await res.json();
          console.log(data.results);
          setGames(data.results);
          setLoading(false);
        } catch (error) {
          console.log("Something went wrong");
        } finally {
          console.log(endPoint);
        }
      }

      fetchGames();

      return function () {
        controller.abort();
      };
    },
    [currentPage, page_size, endPoint, order]
  );

  function handleNextPage() {
    setCurrentPage((currentPage) => currentPage + 1);
  }
  function handlePreviousPage() {
    if (currentPage === 1) {
      setCurrentPage(1);
    } else {
      setCurrentPage((currentPage) => currentPage - 1);
    }
  }

  return (
    <>
      {activeGenre && (
        <>
          <h1>
            {" "}
            {filter && filter.slug
              ? filter.slug === "role-playing-games-rpg"
                ? "Role-Playing Games"
                : filter.slug === "Board-Games"
                ? "Board Games"
                : `${filter.slug} Games`
              : ""}
          </h1>
          <p className="genre-description">
            {showFullDescription ? (
              <>{removeHtmlTags(activeGenre.description)}</>
            ) : (
              <>
                {`${minimizeText(removeHtmlTags(activeGenre.description))}... `}
                <button
                  style={{
                    color: "#333",
                    display: "inline-block",
                    padding: "0.1rem 0.3rem",
                    backgroundColor: "white",
                    fontSize: "0.8rem",
                    borderRadius: "5px",
                  }}
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  see more
                </button>
              </>
            )}
          </p>
        </>
      )}
      <div className="controls">
        <div className="paginate">
          <FontAwesomeIcon
            icon={faArrowLeft}
            size="xl"
            style={{ cursor: "pointer" }}
            onClick={() => handlePreviousPage()}
          />
          {currentPage}
          <FontAwesomeIcon
            icon={faArrowRight}
            size="xl"
            style={{ cursor: "pointer" }}
            onClick={() => handleNextPage()}
          />
        </div>
        <div className="sort" onChange={(e) => setOrder(e.target.value)}>
          <select
            className="order"
            name="order"
            value={order}
            id=""
            onChange={(e) => setOrder(e.target.value)}
          >
            <option value="added">Popularity</option>
            <option value="released">Released</option>
            <option value="metacritic">Metacritic</option>
            <option value="name">Name</option>
            <option value="created">Created</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : games.length === 0 ? (
        <div>No games found.</div>
      ) : (
        <ul className="games-list">
          {games.map((game) => (
            <Game key={game.id} game={game} />
          ))}
        </ul>
      )}
    </>
  );
}

function Game({ game }) {
  const platformIcons = {
    PC: faWindows,
    PlayStation: faPlaystation,
    Xbox: faXbox,
    Android: faAndroid,
    iOS: faApple,
    Nintendo: faGamepad,
    Linux: faLinux,
  };

  return (
    <div className="game-item">
      <div className="game-img-container">
        <img
          className="game-img"
          src={game.background_image}
          alt={`Game: ${game.name}`}
        />
      </div>
      <div className="game-data">
        <div className="top">
          <div className="game-platforms">
            {game.parent_platforms &&
              game.parent_platforms.map((element) => {
                const { name } = element.platform;
                const icon = platformIcons[name];
                if (icon) {
                  return (
                    <FontAwesomeIcon key={element.platform.id} icon={icon} />
                  );
                }
                return null;
              })}
          </div>
          <span
            className="rating"
            style={
              game.metacritic >= 75
                ? { borderColor: "green", color: "#00b800" }
                : game.metacritic < 75 && game.metacritic !== null
                ? { borderColor: "orange", color: "orange" }
                : { display: "none" }
            }
          >
            {game.metacritic}
          </span>
        </div>
        <span className="game-title">{game.name}</span>
        <ul className="hidden-data">
          <li>
            <span className="hidden-data-title">Release Date:</span>
            <div>
              {new Date(game.released).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </li>
          <li>
            <span className="hidden-data-title">Genres:</span>
            <div>
              {game.genres.map((genre) => {
                return <span>{genre.name}</span>;
              })}
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Genre Part!!

function GenresList({ onSetFilter, setSearch, genres, setGenres }) {
  return (
    <ul className="genres-list">
      {genres.map((genre) => {
        return (
          <Genre
            setSearch={setSearch}
            key={genre.id}
            onSetFilter={onSetFilter}
            genre={genre}
          />
        );
      })}
    </ul>
  );
}

function Genre({ genre, onSetFilter, setSearch }) {
  return (
    <div className="genre-item">
      <div className="genre-img-container">
        <img
          className="genre-img"
          src={genre.image_background}
          alt={`Genre of game: ${genre.name}`}
        />
      </div>
      <a
        href="#top-part"
        onClick={() => {
          setSearch("");
          onSetFilter(genre);
        }}
        style={{ cursor: "pointer" }}
      >
        {genre.name}
      </a>
    </div>
  );
}

//     {activeGenre && !loading ? (
//       <>
//         <h1>
//           {" "}
//           {filter && filter.slug
//             ? filter.slug === "role-playing-games-rpg"
//               ? "Role-Playing Games"
//               : filter.slug === "Board-Games"
//               ? "Board Games"
//               : `${filter.slug} Games`
//             : ""}
//         </h1>
// <p className="genre-description">
//   {showFullDescription ? (
//     <>{removeHtmlTags(activeGenre.description)}</>
//   ) : (
//     <>
//       {`${minimizeText(removeHtmlTags(activeGenre.description))}... `}
//       <button
//         style={{
//           color: "#333",
//           display: "inline-block",
//           padding: "0.1rem 0.3rem",
//           backgroundColor: "white",
//           fontSize: "0.8rem",
//           borderRadius: "5px",
//         }}
//         onClick={() => setShowFullDescription(!showFullDescription)}
//       >
//         see more
//       </button>
//     </>
//   )}
// </p>

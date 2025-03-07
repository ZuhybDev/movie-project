import React, { useState, useEffect } from "react";
import Search from "./components/Search";
import MovieLoading from "./components/MovieLoading";
import { useDebounce } from "react-use";
import MovieCard from "./components/MovieCard";
import { getTradingMovies, updateSearchTermCount } from "./appWrite";
import { Link } from "react-router";
import { section } from "framer-motion/client";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TDMB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieLists, setMovieLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounce, setDebounce] = useState("");

  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(() => setDebounce(searchTerm), 700, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("failed");
      }
      const data = await response.json();
      setMovieLists(data.results);

      if (query && data.results.length > 0) {
        await updateSearchTermCount(query, data.results[0]);
      }
    } catch (error) {
      setErrorMessage("Error fetching movies, please try again");
      setMovieLists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loeadTrendingMovies = async () => {
    try {
      const movies = await getTradingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(
    () => {
      fetchMovies(debounce);
    },
    [debounce]
  );

  useEffect(() => {
    loeadTrendingMovies();
  }, []);

  return (
    <div>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1 className="">
            Discover <span className="text-gradient">Movies</span> You'll Love
            Effortlessly!
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className=" trending">
            <h2>Trending movies</h2>

            <ul>
              {" "}
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All movies</h2>
          {isLoading ? (
            <MovieLoading className="items-center justify-center" />
          ) : errorMessage ? (
            <p className="text-red-600">{errorMessage}</p>
          ) : (
            <ul>
              {movieLists.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;

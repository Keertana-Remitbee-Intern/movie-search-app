// API Configuration

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = "https://api.themoviedb.org/3";

let currentPage = 1;
let totalResults = 0;
let detailsSource = "search";

// Select HTML Elements

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const movieContainer = document.getElementById("movieContainer");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const noResultsMessage = document.getElementById("noResultsMessage");
const inputMessage = document.getElementById("inputMessage");
const clearButton = document.getElementById("clearButton");
const pagination = document.getElementById("pagination");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const pageNumber = document.getElementById("pageNumber");
const resultsTitle = document.getElementById("resultsTitle");

// Movie Details Elements

const resultsSection = document.getElementById("resultsSection");
const movieDetails = document.getElementById("movieDetails");
const backButton = document.getElementById("backButton");
const detailsPoster = document.getElementById("detailsPoster");
const detailsTitle = document.getElementById("detailsTitle");
const detailsYear = document.getElementById("detailsYear");
const detailsRuntime = document.getElementById("detailsRuntime");
const detailsRating = document.getElementById("detailsRating");
const detailsGenre = document.getElementById("detailsGenre");
const detailsPlot = document.getElementById("detailsPlot");
const detailsDirector = document.getElementById("detailsDirector");
const detailsActors = document.getElementById("detailsActors");
const detailsReleased = document.getElementById("detailsReleased");
const detailsLanguage = document.getElementById("detailsLanguage");
const header = document.querySelector("header");
const exploreSection = document.getElementById("exploreSection");
const popularContainer = document.getElementById("popularContainer");
const topRatedContainer = document.getElementById("topRatedContainer");

// Search Event

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const searchTerm = searchInput.value.trim();

    if (searchTerm === "") {
        inputMessage.textContent = "Please enter a movie name.";
        movieContainer.innerHTML = "";
        resultsTitle.classList.add("hidden");
        pagination.classList.add("hidden");
        exploreSection.classList.remove("hidden");
        return;
    }

    inputMessage.textContent = "";
    currentPage = 1;
    clearButton.classList.remove("hidden");

    exploreSection.classList.add("hidden");

    hideMovieDetails();
    searchMovies(searchTerm);
});

// Clear Search

clearButton.addEventListener("click", function () {
    searchInput.value = "";
    movieContainer.innerHTML = "";
    currentPage = 1;
    totalResults = 0;

    resultsTitle.classList.add("hidden");
    pagination.classList.add("hidden");
    inputMessage.textContent = "";

    hideMessage(errorMessage);
    hideMessage(noResultsMessage);
    hideMessage(loadingMessage);

    clearButton.classList.add("hidden");

    exploreSection.classList.remove("hidden");
});

// Fetch Movies

async function searchMovies(searchTerm) {
    try {
        movieContainer.innerHTML = "";

        hideMessage(errorMessage);
        hideMessage(noResultsMessage);
        hideMessage(resultsTitle);

        pagination.classList.add("hidden");

        showMessage(loadingMessage);

        const url =
            `${API_URL}/search/movie?api_key=${API_KEY}` +
            `&query=${encodeURIComponent(searchTerm)}` +
            `&page=${currentPage}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch movie data.");
        }

        const data = await response.json();

        totalResults = data.total_results;

        hideMessage(loadingMessage);

        if (!data.results || data.results.length === 0) {
            showMessage(noResultsMessage);
            pagination.classList.add("hidden");
            return;
        }

        resultsTitle.textContent =
            `Search Results for "${searchTerm}"`;

        showMessage(resultsTitle);

        displayMovies(data.results);

        updatePagination();

    } catch (error) {
        hideMessage(loadingMessage);

        pagination.classList.add("hidden");

        errorMessage.textContent =
            "Something went wrong. Please try again.";

        showMessage(errorMessage);

        console.error("Error:", error);
    }
}

// Display Search Movies

function displayMovies(movies) {
    movieContainer.innerHTML = "";

    movies.forEach(function (movie) {

        const movieCard = document.createElement("div");

        movieCard.classList.add("movie-card");

        movieCard.addEventListener("click", function () {
            detailsSource = "search";
            getMovieDetails(movie.id);
        });

        const posterContainer =
            document.createElement("div");

        posterContainer.classList.add(
            "movie-poster-container"
        );

        const poster = document.createElement("img");

        poster.classList.add("movie-poster");

        poster.alt = `${movie.title} poster`;

        if (movie.poster_path) {

            poster.src =
                `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

            posterContainer.appendChild(poster);

            poster.onerror = function () {
                poster.style.display = "none";
                showFallbackPoster(posterContainer);
            };

        } else {
            showFallbackPoster(posterContainer);
        }

        const movieInfo = document.createElement("div");

        movieInfo.classList.add("movie-info");

        const title = document.createElement("h2");

        title.classList.add("movie-title");

        title.textContent = movie.title;

        const year = document.createElement("p");

        year.classList.add("movie-year");

        if (movie.release_date) {
            year.textContent =
                `Year: ${movie.release_date.substring(0, 4)}`;
        } else {
            year.textContent = "Year: N/A";
        }

        const type = document.createElement("p");

        type.classList.add("movie-type");

        type.textContent = "Type: Movie";

        const movieMeta = document.createElement("div");

        movieMeta.classList.add("movie-meta");

        movieMeta.appendChild(year);
        movieMeta.appendChild(type);

        movieInfo.appendChild(title);
        movieInfo.appendChild(movieMeta);

        movieCard.appendChild(posterContainer);
        movieCard.appendChild(movieInfo);

        movieContainer.appendChild(movieCard);
    });
}

// Fetch Movie Details

async function getMovieDetails(movieId) {

    try {

        resultsSection.classList.add("hidden");
        pagination.classList.add("hidden");
        exploreSection.classList.add("hidden");

        header.classList.add("details-mode");

        showMessage(loadingMessage);

        const movieUrl =
            `${API_URL}/movie/${movieId}?api_key=${API_KEY}`;

        const creditsUrl =
            `${API_URL}/movie/${movieId}/credits?api_key=${API_KEY}`;

        const movieResponse = await fetch(movieUrl);
        const creditsResponse = await fetch(creditsUrl);

        if (!movieResponse.ok || !creditsResponse.ok) {
            throw new Error("Failed to fetch movie details.");
        }

        const movie = await movieResponse.json();
        const credits = await creditsResponse.json();

        hideMessage(loadingMessage);

        displayMovieDetails(movie, credits);

    } catch (error) {

        hideMessage(loadingMessage);

        resultsSection.classList.remove("hidden");

        errorMessage.textContent =
            "Unable to load movie details.";

        showMessage(errorMessage);

        console.error(error);
    }
}

// Load Explore Movies

async function loadExploreMovies() {

    try {

        const popularUrl =
            `${API_URL}/movie/popular?api_key=${API_KEY}`;

        const topRatedUrl =
            `${API_URL}/movie/top_rated?api_key=${API_KEY}`;

        const popularResponse = await fetch(popularUrl);
        const topRatedResponse = await fetch(topRatedUrl);

        const popularData = await popularResponse.json();
        const topRatedData = await topRatedResponse.json();

        displayExploreMovies(
            popularData.results,
            popularContainer
        );

        displayExploreMovies(
            topRatedData.results,
            topRatedContainer
        );

    } catch (error) {

        console.error("Explore Error:", error);
    }
}

// Display Movie Details

function displayMovieDetails(movie, credits) {

    detailsTitle.textContent =
        movie.title || "Unknown Title";

    if (movie.poster_path) {

        detailsPoster.src =
            `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

        detailsPoster.style.display = "block";

    } else {

        detailsPoster.removeAttribute("src");
        detailsPoster.style.display = "none";
    }

    detailsPoster.alt =
        `${movie.title} poster`;

    if (movie.release_date) {

        detailsYear.textContent =
            movie.release_date.substring(0, 4);

    } else {

        detailsYear.textContent = "Year N/A";
    }

    if (movie.runtime) {

        detailsRuntime.textContent =
            `${movie.runtime} min`;

    } else {

        detailsRuntime.textContent = "Runtime N/A";
    }

    if (movie.vote_average) {

        detailsRating.textContent =
            `★ ${movie.vote_average.toFixed(1)}`;

    } else {

        detailsRating.textContent = "Rating N/A";
    }

    if (movie.genres && movie.genres.length > 0) {

        detailsGenre.textContent =
            movie.genres
                .map(function (genre) {
                    return genre.name;
                })
                .join(" • ");

    } else {

        detailsGenre.textContent = "Genre N/A";
    }

    detailsPlot.textContent =
        movie.overview ||
        "No plot information available.";

    const director =
        credits.crew.find(function (person) {
            return person.job === "Director";
        });

    detailsDirector.textContent =
        director ? director.name : "Not available";

    detailsActors.textContent =
        credits.cast
            .slice(0, 5)
            .map(function (actor) {
                return actor.name;
            })
            .join(", ");

    detailsReleased.textContent =
        movie.release_date || "Not available";

    detailsLanguage.textContent =
        movie.original_language
            ? movie.original_language.toUpperCase()
            : "Not available";

    movieDetails.classList.remove("hidden");

    backButton.classList.remove("hidden");
}

// Display Explore Movies

function displayExploreMovies(movies, container) {

    container.innerHTML = "";

    movies.slice(0, 10).forEach(function (movie) {

        const movieCard = document.createElement("div");

        movieCard.classList.add("movie-card");

        movieCard.addEventListener("click", function () {
            detailsSource = "explore";
            getMovieDetails(movie.id);
        });

        const posterContainer =
            document.createElement("div");

        posterContainer.classList.add(
            "movie-poster-container"
        );

        const poster = document.createElement("img");

        poster.classList.add("movie-poster");

        poster.src =
            `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

        poster.alt = `${movie.title} poster`;

        posterContainer.appendChild(poster);

        const movieInfo = document.createElement("div");

        movieInfo.classList.add("movie-info");

        const title = document.createElement("h2");

        title.classList.add("movie-title");

        title.textContent = movie.title;

        const year = document.createElement("p");

        year.classList.add("movie-year");

        if (movie.release_date) {

            year.textContent =
                `Year: ${movie.release_date.substring(0, 4)}`;

        } else {

            year.textContent = "Year: N/A";
        }

        const type = document.createElement("p");

        type.classList.add("movie-type");

        type.textContent = "Type: Movie";

        const movieMeta = document.createElement("div");

        movieMeta.classList.add("movie-meta");

        movieMeta.appendChild(year);
        movieMeta.appendChild(type);

        movieInfo.appendChild(title);
        movieInfo.appendChild(movieMeta);

        movieCard.appendChild(posterContainer);
        movieCard.appendChild(movieInfo);

        container.appendChild(movieCard);
    });
}

// Back Button

backButton.addEventListener("click", function () {

    hideMovieDetails();

    if (detailsSource === "explore") {

        resultsSection.classList.add("hidden");

        movieContainer.innerHTML = "";

        resultsTitle.classList.add("hidden");
        pagination.classList.add("hidden");

        searchInput.value = "";

        clearButton.classList.add("hidden");

        currentPage = 1;
        totalResults = 0;

        exploreSection.classList.remove("hidden");

    } else {

        resultsSection.classList.remove("hidden");

        exploreSection.classList.add("hidden");

        resultsTitle.classList.remove("hidden");
        pagination.classList.remove("hidden");
    }
});

// Hide Movie Details

function hideMovieDetails() {

    movieDetails.classList.add("hidden");

    backButton.classList.add("hidden");

    header.classList.remove("details-mode");
}

// Update Pagination

function updatePagination() {

    const totalPages =
        Math.min(
            Math.ceil(totalResults / 20),
            500
        );

    pageNumber.textContent =
        `Page ${currentPage} of ${totalPages}`;

    prevButton.disabled =
        currentPage === 1;

    nextButton.disabled =
        currentPage >= totalPages;

    pagination.classList.remove("hidden");
}

// Previous Page

prevButton.addEventListener("click", function () {

    if (currentPage > 1) {

        currentPage--;

        searchMovies(
            searchInput.value.trim()
        );
    }
});

// Next Page

nextButton.addEventListener("click", function () {

    const totalPages =
        Math.min(
            Math.ceil(totalResults / 20),
            500
        );

    if (currentPage < totalPages) {

        currentPage++;

        searchMovies(
            searchInput.value.trim()
        );
    }
});

// Create Fallback Poster

function showFallbackPoster(container) {

    container.innerHTML = `
        <div class="fallback-poster">
            <span>CineFind</span>
            <small>No Poster Available</small>
        </div>
    `;
}

// Show Message

function showMessage(element) {
    element.classList.remove("hidden");
}

// Hide Message

function hideMessage(element) {
    element.classList.add("hidden");
}

// Load Explore

loadExploreMovies();
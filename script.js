// API Configuration

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const API_URL = "https://www.omdbapi.com/";

let currentPage = 1;
let totalResults = 0;

// Select HTML Elements

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const movieContainer = document.getElementById("movieContainer");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const noResultsMessage = document.getElementById("noResultsMessage");
const inputMessage = document.getElementById("inputMessage");
const pagination = document.getElementById("pagination");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const pageNumber = document.getElementById("pageNumber");

// Search Event

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const searchTerm = searchInput.value.trim();

    // Check if input is empty

    if (searchTerm === "") {
        inputMessage.textContent = "Please enter a movie name.";
        movieContainer.innerHTML = "";
        pagination.classList.add("hidden");
        return;
    }

    inputMessage.textContent = "";
    currentPage = 1;

    searchMovies(searchTerm);
});

// Fetch Movies

async function searchMovies(searchTerm) {
    try {
        // Clear previous results

        movieContainer.innerHTML = "";

        // Reset messages

        hideMessage(errorMessage);
        hideMessage(noResultsMessage);
        pagination.classList.add("hidden");

        // Show loading

        showMessage(loadingMessage);

        // Create API URL

        const url =
            `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&page=${currentPage}`;

        // Fetch data

        const response = await fetch(url);

        // Check HTTP response

        if (!response.ok) {
            throw new Error("Failed to fetch movie data.");
        }

        // Convert response to JSON

        const data = await response.json();

        totalResults = Number(data.totalResults);

        // Hide loading

        hideMessage(loadingMessage);

        // Check API response

        if (data.Response === "False") {
            showMessage(noResultsMessage);
            pagination.classList.add("hidden");
            return;
        }

        // Display movies

        displayMovies(data.Search);
        updatePagination();
    }

    catch (error) {
        // Hide loading

        hideMessage(loadingMessage);

        // Hide pagination

        pagination.classList.add("hidden");

        // Display error

        errorMessage.textContent =
            "Something went wrong. Please try again.";

        showMessage(errorMessage);

        console.error("Error:", error);
    }
}

// Display Movies

function displayMovies(movies) {
    movieContainer.innerHTML = "";

    movies.forEach(function (movie) {

        // Create movie card

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        // Create poster container

        const posterContainer = document.createElement("div");
        posterContainer.classList.add("movie-poster-container");

        // Create poster

        const poster = document.createElement("img");

        poster.classList.add("movie-poster");
        poster.alt = `${movie.Title} poster`;

        // Check if poster exists

        if (movie.Poster && movie.Poster !== "N/A") {
            poster.src = movie.Poster;

            posterContainer.appendChild(poster);

            // Handle broken poster URL

            poster.onerror = function () {
                poster.style.display = "none";
                showFallbackPoster(posterContainer);
            };
        }
        else {
            // Show fallback if poster is N/A

            showFallbackPoster(posterContainer);
        }

        // Create movie information container

        const movieInfo = document.createElement("div");
        movieInfo.classList.add("movie-info");

        // Create title

        const title = document.createElement("h2");
        title.classList.add("movie-title");
        title.textContent = movie.Title;

        // Create year

        const year = document.createElement("p");
        year.classList.add("movie-year");
        year.textContent = `Year: ${movie.Year}`;

        // Create type

        const type = document.createElement("p");
        type.classList.add("movie-type");
        type.textContent = `Type: ${movie.Type}`;

        // Add information to movie info

        movieInfo.appendChild(title);
        movieInfo.appendChild(year);
        movieInfo.appendChild(type);

        // Add poster container and information to card

        movieCard.appendChild(posterContainer);
        movieCard.appendChild(movieInfo);

        // Add card to container

        movieContainer.appendChild(movieCard);
    });
}

// Update Pagination

function updatePagination() {
    const totalPages = Math.ceil(totalResults / 10);

    pageNumber.textContent =
        `Page ${currentPage} of ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= totalPages;

    pagination.classList.remove("hidden");
}

// Previous Page

prevButton.addEventListener("click", function () {

    if (currentPage > 1) {
        currentPage--;

        searchMovies(searchInput.value.trim());
    }
});

// Next Page

nextButton.addEventListener("click", function () {

    const totalPages = Math.ceil(totalResults / 10);

    if (currentPage < totalPages) {
        currentPage++;

        searchMovies(searchInput.value.trim());
    }
});

// Create fallback poster

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
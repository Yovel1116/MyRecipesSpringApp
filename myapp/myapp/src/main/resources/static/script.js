const API_URL = window.location.hostname === "localhost"
    ? "http://localhost:8080/api/recipes"
    : "https://recipespring.up.railway.app/api/recipes";

let currentPage = 1;
const recipesPerPage = 9;
let totalRecipes = 0;
let allRecipes = [];

// Fetch and display recipes
function fetchRecipes() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            allRecipes = data._embedded ? data._embedded.recipes : [];
            totalRecipes = allRecipes.length;
            displayRecipes();
        })
        .catch(error => console.error("Error fetching recipes:", error));
}

function displayRecipes() {
    const recipeList = document.getElementById("recipeList");
    recipeList.innerHTML = "";

    const start = (currentPage - 1) * recipesPerPage;
    const end = start + recipesPerPage;
    const recipesToShow = allRecipes.slice(start, end);

    recipesToShow.forEach(recipe => {
        let id = recipe.id || (recipe._links?.self?.href.split("/").pop() ?? "No ID");

        const li = document.createElement("li");
        li.classList.add("list-group-item", "text-start", "recipe-item");
        li.setAttribute("data-bs-toggle", "tooltip");
        li.setAttribute("data-bs-html", "true");
        li.setAttribute("title",
            `<strong>Ingredients:</strong> ${recipe.ingredients}<br>
             <strong>Instructions:</strong> ${recipe.instructions}`
        );

        li.innerHTML = `<strong>${id}:</strong> ${recipe.name} - ${recipe.prep_time} min - ${recipe.cuisine}`;
        recipeList.appendChild(li);

    });

    // Update pagination controls
    updatePaginationControls();

    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function updatePaginationControls() {
    document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${Math.ceil(totalRecipes / recipesPerPage)}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage * recipesPerPage >= totalRecipes;
}

function changePage(direction) {
    currentPage += direction;
    displayRecipes();
}

function filterRecipes() {
    let input = document.getElementById("searchRecipe").value.toLowerCase().trim();
    const recipeList = document.getElementById("recipeList");
    recipeList.innerHTML = "";

    if (input.length === 0) {
        displayRecipes();
        return;
    }

    const filteredRecipes = allRecipes.filter(recipe => {
        let id = recipe.id || (recipe._links?.self?.href.split("/").pop() ?? "No ID");
        return (
            id.toString().includes(input) ||
            recipe.name.toLowerCase().includes(input) ||
            recipe.ingredients.toLowerCase().includes(input) ||
            recipe.cuisine.toLowerCase().includes(input)
        );
    });

    const maxResults = 10;
    const displayedRecipes = filteredRecipes.slice(0, maxResults);

    displayedRecipes.forEach(recipe => {
        let id = recipe.id || (recipe._links?.self?.href.split("/").pop() ?? "No ID");

        const li = document.createElement("li");
        li.classList.add("list-group-item", "text-start", "recipe-item");
        li.setAttribute("data-bs-toggle", "tooltip");
        li.setAttribute("data-bs-html", "true");
        li.setAttribute("title",
            `<strong>Ingredients:</strong> ${recipe.ingredients}<br>
             <strong>Instructions:</strong> ${recipe.instructions}`
        );

        li.innerHTML = `<strong>${id}:</strong> ${recipe.name} - ${recipe.prep_time} min - ${recipe.cuisine}`;
        recipeList.appendChild(li);
    });

    if (filteredRecipes.length > maxResults) {
        const li = document.createElement("li");
        li.classList.add("list-group-item", "text-center", "text-muted");
        li.innerHTML = `Showing ${maxResults} out of ${filteredRecipes.length} results. Please refine your search.`;
        recipeList.appendChild(li);
    }

    if (filteredRecipes.length === 0) {
        const li = document.createElement("li");
        li.classList.add("list-group-item", "text-center", "text-muted");
        li.innerHTML = "No recipes found.";
        recipeList.appendChild(li);
    }

    // Reinitialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function showSection(sectionId) {
    document.getElementById("addRecipe").classList.add("d-none");
    document.getElementById("updateRecipe").classList.add("d-none");
    document.getElementById("deleteRecipe").classList.add("d-none");
    document.getElementById(sectionId).classList.remove("d-none");
}

// Create a new recipe
document.getElementById("recipeForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const recipeName = document.getElementById("recipeName").value.trim();
    const prepTime = document.getElementById("prepTime").value.trim();
    const cuisine = document.getElementById("cuisine").value.trim();
    const ingredients = document.getElementById("ingredients").value.trim() || "No ingredients provided.";
    const instructions = document.getElementById("instructions").value.trim() || "No instructions available.";

    const newRecipe = { name: recipeName, prep_time: prepTime, ingredients, instructions, cuisine };

    console.log("🚀 Sending Data:", JSON.stringify(newRecipe));

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecipe)
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.message || "Failed to add recipe"); });
        return response.json();
    })
    .then(() => {
        fetchRecipes();
        document.getElementById("recipeForm").reset();
        alert("Recipe added successfully!");
    })
    .catch(error => {
        console.error("❌ Error adding recipe:", error);
        alert("Error adding recipe. Check the console for details.");
    });
});

// Update an existing recipe
document.getElementById("updateForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const recipeId = document.getElementById("updateId").value.trim();
    if (!recipeId) {
        alert("Please enter a valid Recipe ID.");
        return;
    }

    const updatedRecipe = {
        name: document.getElementById("updateName").value.trim() || undefined,
        prep_time: document.getElementById("updatePrepTime").value.trim() || undefined,
        ingredients: document.getElementById("updateIngredients").value.trim() || undefined,
        instructions: document.getElementById("updateInstructions").value.trim() || undefined,
        cuisine: document.getElementById("updateCuisine").value.trim() || undefined
    };

    console.log("🚀 Update Data:", JSON.stringify(updatedRecipe));

    fetch(`${API_URL}/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecipe)
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(() => {
        fetchRecipes();
        document.getElementById("updateForm").reset();
        alert("Recipe updated successfully!");
    })
    .catch(error => console.error("Error updating recipe:", error));
});

// Delete a recipe
document.getElementById("deleteForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const recipeId = document.getElementById("deleteId").value.trim();
    if (!recipeId) {
        alert("Please enter a valid Recipe ID.");
        return;
    }

    console.log("🚀 Delete Data:", JSON.stringify(recipeId));

    fetch(`${API_URL}/${recipeId}`, { method: "DELETE" })
    .then(() => {
        fetchRecipes();
        document.getElementById("deleteForm").reset();
        alert("Recipe deleted successfully!");
    })
    .catch(error => console.error("Error deleting recipe:", error));
});
function askAI() {
    // Get the prompt from the modal's input field
    var prompt = document.getElementById("modalPrompt").value;

    fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
    })
    .then(response => response.text())
    .then(data => {
        alert(data); // Show the response in an alert
    })
    .catch(error => {
        console.error('Error:', error);
        alert("An error occurred. Please try again.");
    });

    // Close the modal after sending the request
    var modal = bootstrap.Modal.getInstance(document.getElementById('aiModal'));
    modal.hide();
}

// Get all the CRUD buttons within the offcanvas menu
const crudButtons = document.querySelectorAll('#offcanvasNavbar button[onclick^="showSection"]');

// Add a click event listener to each CRUD button
crudButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Get the offcanvas instance
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasNavbar'));
        // Hide the offcanvas menu
        offcanvas.hide();
    });
});
// Get only the CRUD links, excluding "About" and "Ask AI"
const crudLinks = document.querySelectorAll('#offcanvasNavbar a[onclick="showSection(\'addRecipe\')"], #offcanvasNavbar a[onclick="showSection(\'updateRecipe\')"], #offcanvasNavbar a[onclick="showSection(\'deleteRecipe\')"]');

// Add a click event listener to each CRUD link
crudLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Get the offcanvas instance
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasNavbar'));
        // Hide the offcanvas menu
        offcanvas.hide();

    });

});



function showSectionAbout(section) {
    const aboutSection = document.getElementById('aboutSection');
    if (section === 'about') {
        // Only proceed if the section is not already shown
        if (!aboutSection.classList.contains('show')) {
            aboutSection.classList.remove('d-none');
            // Use setTimeout to ensure the 'show' class is added after the 'd-none' class is removed
            setTimeout(() => {
                aboutSection.classList.add('show');
            }, 50);
        }
    } else if (section === 'home') {
        // Only proceed if the section is currently shown
        if (aboutSection.classList.contains('show')) {
            aboutSection.classList.remove('show');
            // Use a transitionend event listener to add 'd-none' after the transition
            aboutSection.addEventListener('transitionend', () => {
                aboutSection.classList.add('d-none');
            }, { once: true });
        }
    } else {
        // For other sections, hide the about section if it's visible
        if (aboutSection.classList.contains('show')) {
            aboutSection.classList.remove('show');
            // Use a transitionend event listener to add 'd-none' after the transition
            aboutSection.addEventListener('transitionend', () => {
                aboutSection.classList.add('d-none');
            }, { once: true });
        }
        // ... your existing code to handle other sections ...
    }
}

function hideAboutSection() {
    const aboutSection = document.getElementById('aboutSection');

    // Only proceed if the section is currently shown
    if (aboutSection.classList.contains('show')) {
        aboutSection.classList.remove('show');

        // Use a transitionend event listener to add 'd-none' after the transition
        aboutSection.addEventListener('transitionend', () => {
            aboutSection.classList.add('d-none');
        }, { once: true });
    }
}


// Fetch recipes on page load
fetchRecipes();


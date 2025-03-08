const API_URL = window.location.hostname === "localhost"
    ? "http://localhost:8080/api/recipes"
    : "https://recipespring.up.railway.app/api/recipes";

let currentPage = 1;
const recipesPerPage = 9;
let totalRecipes = 0;
let allRecipes = [];
let conversationHistory = [];

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
const crudButtons = document.querySelectorAll('#offcanvasNavbar button[onclick^="showSection"]');
crudButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Get the offcanvas instance
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasNavbar'));
        // Hide the offcanvas menu
        offcanvas.hide();
    });
});
const crudLinks = document.querySelectorAll('#offcanvasNavbar a[onclick="showSection(\'addRecipe\')"], #offcanvasNavbar a[onclick="showSection(\'updateRecipe\')"], #offcanvasNavbar a[onclick="showSection(\'deleteRecipe\')"]');
crudLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Get the offcanvas instance
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasNavbar'));
        // Hide the offcanvas menu
        offcanvas.hide();

    });

});


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

function showSection(sectionId) {
    document.getElementById("addRecipe").classList.add("d-none");
    document.getElementById("updateRecipe").classList.add("d-none");
    document.getElementById("deleteRecipe").classList.add("d-none");
    document.getElementById(sectionId).classList.remove("d-none");
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

// הוספת אייקון רענון
const clearButton = document.createElement("button");
clearButton.innerHTML = "&#x21bb;"; // אייקון רענון
clearButton.classList.add("btn", "btn-outline-secondary", "btn-sm", "ms-2"); // עיצוב כפתור
clearButton.addEventListener("click", () => {
    document.getElementById("searchRecipe").value = "";
    filterRecipes();
});

function clearSearch() {
    document.getElementById("searchRecipe").value = "";
    filterRecipes();
}

// הוספת מאזין לאירוע click לכפתור הרענון
document.getElementById("clearSearchButton").addEventListener("click", clearSearch);

function askAI() {
    const modalPrompt = document.getElementById("modalPrompt");
    let prompt = modalPrompt.value;

    prompt += ' First, try to understand the intent and context of my current prompt. ' +
        'If the prompt is a general question or statement, answer it directly without referring ' +
        'to the list of recipes. Only refer to the list of recipes if the question is specifically ' +
        'asking about a recipe or related to food. and return the ID of the recipes you returned, ' +
        'and their name. Return only the most relevant recipe when explicitly asked about recipes. ' +
        'Avoid returning recipes that have already been mentioned. Give a short and focused answer. ' +
        'Give the answer only in ENGLISH! If a recipe is not mentioned in this question, do not repeat it, just answer the question. ' +
        'When returning a recipe, please return only one and use the following format without any asterisks: ' +
        'Recipe: recipe name ID:recipe ID For example: Recipe: Chicken Teriyaki ID: 123';

    if (conversationHistory.length > 0) {
        prompt += " Previous conversation: " + JSON.stringify(conversationHistory);
    }

    const aiResponseInModal = document.getElementById("aiResponseInModal");
    aiResponseInModal.innerHTML = "Loading..."; // הצגת הודעת טעינה

    fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: prompt,
            recipes: allRecipes,
            totalRecipes:totalRecipes,
            temperature: 0.5
        })
    })
        .then(response => response.text())
        .then(data => {
            const aiResponseInModal = document.getElementById("aiResponseInModal");
            let responseText = "";

            // בדיקה אם התקבלה שגיאה מה-API
            if (data.startsWith("Error:")) {
                // הצגת הודעת שגיאה
                aiResponseInModal.innerHTML = data;
                return; // עצירת המשך ביצוע הפונקציה
            }

            // חילוץ שם המתכון (רק אם לא התקבלה שגיאה)
            const recipeNameMatch = data.match(/Recipe: (.*)/i);
            let recipeName = recipeNameMatch ? recipeNameMatch[1] : null;

            if (recipeName) {
                if (recipeName.endsWith('.')) {
                    recipeName = recipeName.slice(0, -1);
                }
                responseText = data.replace(/Recipe: (.*)/i, `Recipe: <a href="#" onclick="searchRecipeByName('${recipeName}'); closeAIModal();  closeCrudSection();">${recipeName}</a>`);
            } else {
                responseText = data;
            }
            aiResponseInModal.innerHTML = responseText;
            conversationHistory.push({ question: prompt, answer: data });
            if (conversationHistory.length > 5) {
                conversationHistory.shift();
            }
            // ניקוי ה-input
            modalPrompt.value = "";
        })
        .catch(error => {
            console.error('Error:', error);
            aiResponseInModal.innerHTML = "An error occurred. Please try again.";

            //סגירת המודל לאחר קבלת שגיאה
            const modal = bootstrap.Modal.getInstance(document.getElementById('aiModal'));
            modal.hide();

            // ניקוי ה-input
            modalPrompt.value = "";
        });
}
function closeAIModal() {
    const aiModal = document.getElementById("aiModal");
    const modal = bootstrap.Modal.getInstance(aiModal);
    modal.hide();
    const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasNavbar'));
    offcanvas.hide();
}
function searchRecipeByName(recipeName) {

    // מציאת תיבת החיפוש
    const searchInput = document.getElementById("searchRecipe");
    // הכנסת שם המתכון לתיבת החיפוש
    searchInput.value = recipeName;
    // הפעלת פונקציית הסינון
    filterRecipes();
}

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

function closeCrudSection() {
    if (window.innerWidth < 992) {
        try {
            document.getElementById("addRecipe").classList.add("d-none");
            document.getElementById("updateRecipe").classList.add("d-none");
            document.getElementById("deleteRecipe").classList.add("d-none");
            document.getElementById("recipeListSection").classList.remove("d-none");
        } catch (error) {
            console.error("Error closing CRUD sections:", error);
        }
    }
}

// Fetch recipes on page load
fetchRecipes();


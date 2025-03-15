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
        li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "recipe-item");

        const recipeText = document.createElement('span');
        recipeText.innerHTML = `<strong>${id}:</strong> ${recipe.name} - ${recipe.prep_time} min - ${recipe.cuisine} `;
        recipeText.setAttribute("data-bs-toggle", "tooltip");
        recipeText.setAttribute("data-bs-html", "true");
        recipeText.setAttribute("title",
            `<strong>Ingredients:</strong> ${recipe.ingredients}<br>
     <strong>Instructions:</strong> ${recipe.instructions}`
        );
        li.appendChild(recipeText);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.flex='none';

        const updateButton = document.createElement('button');
        updateButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'update-recipe-btn');
        updateButton.style.background = 'transparent';
        updateButton.style.border = 'none';
        updateButton.style.padding = '0';
        updateButton.style.cursor = 'pointer';
        updateButton.style.padding = '3px';
        updateButton.innerHTML = '✏️';
        updateButton.setAttribute('data-recipe-id', id);
        updateButton.addEventListener('click', () => {
            showSection('updateRecipe');
            populateUpdateForm(recipe);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'delete-recipe-btn');
        deleteButton.style.background = 'transparent';
        deleteButton.style.border = 'none';
        deleteButton.style.padding = '0';
        deleteButton.style.cursor = 'pointer';
        deleteButton.style.padding = '3px';
        deleteButton.innerHTML = '🗑️'; // Use the trash can directly
        deleteButton.setAttribute('data-recipe-id', id);
        deleteButton.addEventListener('click', () => {
            showSection('deleteRecipe');
            document.getElementById('deleteId').value = id;
        });

        buttonContainer.appendChild(updateButton);
        buttonContainer.appendChild(deleteButton);
        li.appendChild(buttonContainer);

        recipeList.appendChild(li);
    });

    updatePaginationControls();

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function populateUpdateForm(recipe) {
    document.getElementById("updateId").value = recipe.id || (recipe._links?.self?.href.split("/").pop() ?? "");
    document.getElementById("updateName").value = recipe.name;
    document.getElementById("updatePrepTime").value = recipe.prep_time;
    document.getElementById("updateIngredients").value = recipe.ingredients;
    document.getElementById("updateInstructions").value = recipe.instructions;
    document.getElementById("updateCuisine").value = recipe.cuisine;
}

function deleteRecipe(recipeId) {
    if (!recipeId) {
        alert("Invalid Recipe ID.");
        return;
    }

    console.log(" Delete Data:", JSON.stringify(recipeId));

    fetch(`${API_URL}/${recipeId}`, { method: "DELETE" })
        .then(() => {
            fetchRecipes();
            alert("Recipe deleted successfully!");
        })
        .catch(error => console.error("Error deleting recipe:", error));
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
    const section = document.getElementById(sectionId);

    if (section && section.classList.contains('overlay-section')) {
        if (!section.classList.contains('show')) {
            section.classList.remove('d-none');
            setTimeout(() => {
                section.classList.add('show');
            }, 50);
        }
    } else {
        // Hide other overlay sections if they are visible
        const overlaySections = document.querySelectorAll('.overlay-section');
        overlaySections.forEach(overlaySection => {
            if (overlaySection.classList.contains('show')) {
                overlaySection.classList.remove('show');
                overlaySection.addEventListener('transitionend', () => {
                    overlaySection.classList.add('d-none');
                }, { once: true });
            }
        });
        // ... your existing code to handle other sections ...
        if (section) {
            document.getElementById("addRecipe").classList.add("d-none");
            section.classList.remove("d-none");
        }
    }
}

function hideOverlaySection(sectionId) {
    const section = document.getElementById(sectionId);

    if (section && section.classList.contains('show')) {
        section.classList.remove('show');
        section.addEventListener('transitionend', () => {
            section.classList.add('d-none');
        }, { once: true });
    }
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
        li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "recipe-item"); // Added d-flex...
        li.setAttribute("data-bs-toggle", "tooltip");
        li.setAttribute("data-bs-html", "true");
        li.setAttribute("title",
            `<strong>Ingredients:</strong> ${recipe.ingredients}<br>
             <strong>Instructions:</strong> ${recipe.instructions}`
        );

        const recipeText = document.createElement('span');
        recipeText.innerHTML = `<strong>${id}:</strong> ${recipe.name} - ${recipe.prep_time} min - ${recipe.cuisine} `;
        li.appendChild(recipeText);

        const buttonContainer = document.createElement('div');

        const updateButton = document.createElement('button');
        updateButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'update-recipe-btn');
        updateButton.style.background = 'transparent';
        updateButton.style.border = 'none';
        updateButton.style.padding = '0';
        updateButton.style.cursor = 'pointer';
        updateButton.innerHTML = '✏️';
        updateButton.setAttribute('data-recipe-id', id);
        updateButton.addEventListener('click', () => {
            showSection('updateRecipe');
            populateUpdateForm(recipe);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'delete-recipe-btn');
        deleteButton.style.background = 'transparent';
        deleteButton.style.border = 'none';
        deleteButton.style.padding = '0';
        deleteButton.style.cursor = 'pointer';
        deleteButton.innerHTML = '🗑️';
        deleteButton.setAttribute('data-recipe-id', id);
        deleteButton.addEventListener('click', () => {
            showSection('deleteRecipe');
            document.getElementById('deleteId').value = id;
        });

        buttonContainer.appendChild(updateButton);
        buttonContainer.appendChild(deleteButton);
        li.appendChild(buttonContainer);

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
const clearButton = document.getElementById("clearSearchButton");

function clearSearch() {
    document.getElementById("searchRecipe").value = "";
    filterRecipes();
}

// הוספת מאזין לאירוע קליק
clearButton.addEventListener("click", clearSearch);

// טיפול באירועי מגע (למובייל)
clearButton.addEventListener("touchstart", (event) => {
    event.preventDefault();
    clearSearch();
});

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
    const contactSection = document.getElementById('contactSection');

    if (section === 'about') {
        if (!aboutSection.classList.contains('show')) {
            aboutSection.classList.remove('d-none');
            setTimeout(() => {
                aboutSection.classList.add('show');
            }, 50);
        }
        if(contactSection.classList.contains('show')){
            contactSection.classList.remove('show');
            contactSection.addEventListener('transitionend', () => {
                contactSection.classList.add('d-none');
            }, { once: true });
        }
    } else if (section === 'contactus') {
        if (!contactSection.classList.contains('show')) {
            contactSection.classList.remove('d-none');
            setTimeout(() => {
                contactSection.classList.add('show');
            }, 50);
        }
        if(aboutSection.classList.contains('show')){
            aboutSection.classList.remove('show');
            aboutSection.addEventListener('transitionend', () => {
                aboutSection.classList.add('d-none');
            }, { once: true });
        }
    } else if (section === 'home') {
        if (aboutSection.classList.contains('show')) {
            aboutSection.classList.remove('show');
            aboutSection.addEventListener('transitionend', () => {
                aboutSection.classList.add('d-none');
            }, { once: true });
        }
        if(contactSection.classList.contains('show')){
            contactSection.classList.remove('show');
            contactSection.addEventListener('transitionend', () => {
                contactSection.classList.add('d-none');
            }, { once: true });
        }
    } else {
        if (aboutSection.classList.contains('show')) {
            aboutSection.classList.remove('show');
            aboutSection.addEventListener('transitionend', () => {
                aboutSection.classList.add('d-none');
            }, { once: true });
        }
        if(contactSection.classList.contains('show')){
            contactSection.classList.remove('show');
            contactSection.addEventListener('transitionend', () => {
                contactSection.classList.add('d-none');
            }, { once: true });
        }
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
function showContactSection() {
    document.getElementById("contactSection").classList.remove("d-none");
}

function hideContactSection() {
    document.getElementById("contactSection").classList.add("d-none");
}
// Fetch recipes on page load
fetchRecipes();


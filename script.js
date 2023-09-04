document.addEventListener("DOMContentLoaded", function () {
    const daysInput = document.getElementById("days");
    const seasonalDaysInput = document.getElementById("seasonal");
    const ingredientsInput = document.querySelectorAll('input[type="checkbox"]');
    const generatePlanButton = document.getElementById("generatePlan");
    const mealPlan = document.querySelector(".mealPlan");
    const savePlanButton = document.getElementById("savePlan");

    // Funktion zum Generieren des Essensplans
    function generateMealPlan() {
        const days = parseInt(document.getElementById('days').value, 10); // Anzahl der Tage
        const seasonalDays = parseInt(document.getElementById('seasonal').value, 10); // Anzahl der Tage mit saisonalen Zutaten

        // Überprüfe, ob genügend Gerichte in der Datenbank verfügbar sind
        if (availableDishes.length < days) {
            alert('Nicht genügend Gerichte in der Datenbank verfügbar.');
            return;
        }

        // Kopiere die Liste der verfügbaren Gerichte, um die Auswahl zu treffen
        const availableDishesCopy = [...availableDishes];
        const mealPlan = [];

        // Zufällige Auswahl von Gerichten
        for (let i = 0; i < days; i++) {
            const randomIndex = Math.floor(Math.random() * availableDishesCopy.length);
            const selectedDish = availableDishesCopy.splice(randomIndex, 1)[0]; // Entfernt das ausgewählte Gericht aus der Liste
            mealPlan.push(selectedDish);
        }

        // Zeige den generierten Essensplan an
        displayMealPlan(mealPlan);
    }

    function hideSaveButton() {
        const savePlanButton = document.getElementById('savePlan');
        savePlanButton.style.display = 'none';
    }


    // Funktion zum Anzeigen des generierten Essensplans
    function displayMealPlan(mealPlan) {
        const mealPlanList = document.getElementById('dishesList');
        mealPlanList.innerHTML = ''; // Lösche vorherige Anzeige

        mealPlan.forEach((dish, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Tag ${index + 1}: ${dish.name} (${dish.ingredients})`;
            mealPlanList.appendChild(listItem);
        });

        // Zeige die Schaltfläche zum Speichern des Essensplans an
        showSaveButton();
    }


    // Funktion zum Anzeigen der Schaltfläche zum Speichern des Essensplans
    function showSaveButton() {
        savePlanButton.style.display = "block"; // Zeige die Schaltfläche an
    }

    // Funktion zum Weiterleiten zur "dishes.html"-Seite
    function redirectToDishesPage() {
        // Weiterleitung zur "dishes.html"-Seite
        window.location.href = "dishes.html";
    }

    // Eventlistener für das Generieren des Essensplans
    generatePlanButton.addEventListener("click", generateMealPlan);
});

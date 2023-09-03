document.addEventListener("DOMContentLoaded", function () {
    const daysInput = document.getElementById("days");
    const seasonalDaysInput = document.getElementById("seasonal");
    const ingredientsInput = document.querySelectorAll('input[type="checkbox"]');
    const generatePlanButton = document.getElementById("generatePlan");
    const mealPlan = document.querySelector(".mealPlan");
    const savePlanButton = document.getElementById("savePlan"); // Schaltfläche zum Speichern des Essensplans hinzufügen
    
    // Funktion zur Überprüfung und Aktualisierung der saisonalen Zutaten-Eingabe
    function updateSeasonalInput() {
        const seasonalDays = parseInt(seasonalDaysInput.value, 10);

        // Wenn saisonale Tage 0 oder ungültig sind, deaktiviere das Eingabefeld für saisonale Zutaten
        if (isNaN(seasonalDays) || seasonalDays <= 0) {
            ingredientsInput.forEach((checkbox) => {
                checkbox.disabled = true;
            });
        } else {
            ingredientsInput.forEach((checkbox) => {
                checkbox.disabled = false;
            });
        }
    }

    // Eventlistener für Änderungen in der Anzahl der saisonalen Tage
    seasonalDaysInput.addEventListener("input", updateSeasonalInput);
    
    // Initialisierung
    updateSeasonalInput();
    
    // Funktion zum Generieren des Essensplans
    function generateMealPlan() {
        // Hier generierst du den Essensplan basierend auf den Eingaben
        // und zeigst ihn im "mealPlan"-Element an
        mealPlan.textContent = "Hier wird der Essensplan angezeigt.";

        // Anzeigen der Schaltfläche zum Speichern des Essensplans
        showSaveButton();
    }

    // Funktion zum Anzeigen der Schaltfläche zum Speichern des Essensplans
    function showSaveButton() {
        savePlanButton.style.display = "block"; // Zeige die Schaltfläche an
    }

    // Eventlistener für das Generieren des Essensplans
    generatePlanButton.addEventListener("click", generateMealPlan);
});

document.addEventListener("DOMContentLoaded", function () {
    const daysInput = document.getElementById("days");
    const seasonalDaysInput = document.getElementById("seasonal");
    const ingredientsInput = document.querySelectorAll('input[type="checkbox"]');
    
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
    
    // Hier kannst du den Code zum Generieren des Essensplans hinzufügen
    const generatePlanButton = document.getElementById("generatePlan");
    const mealPlan = document.querySelector(".mealPlan");
    
    generatePlanButton.addEventListener("click", function () {
        // Hier generierst du den Essensplan basierend auf den Eingaben
        // und zeigst ihn im "mealPlan"-Element an
        mealPlan.textContent = "Hier wird der Essensplan angezeigt.";
    });
});

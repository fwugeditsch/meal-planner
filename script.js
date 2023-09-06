// Vor dem Aufrufen der generateMealPlan-Funktion die Gerichte aus der Datenbank abrufen und in availableDishes speichern
let availableDishes = [];

// Hier eine Funktion zum Abrufen aller Gerichte aus der Datenbank
async function fetchAvailableDishes() {
    try {
        const response = await fetch('/api/dishes'); // Stelle sicher, dass dies dem tatsächlichen Pfad zu deinem API-Endpunkt entspricht
        const data = await response.json();
        availableDishes = data; // Speichere die Gerichte im availableDishes-Array
    } catch (error) {
        console.error('Fehler beim Abrufen der Gerichte aus der Datenbank:', error);
    }
}

// Funktion zum Verstecken der Schaltfläche zum Speichern des Essensplans
function hideSaveButton() {
    const savePlanButton = document.getElementById('savePlan');
    savePlanButton.style.display = 'none';
}

// Fisher-Yates-Shuffle-Algorithmus für das zufällige Mischen eines Arrays
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function generateMealPlan() {
        const numberOfDays = parseInt(document.getElementById('days').value);
        const seasonalDays = parseInt(document.getElementById('seasonal').value);

        // Überprüfe, ob genügend Gerichte verfügbar sind
        if (!availableDishes || availableDishes.length === 0 || availableDishes.length < numberOfDays) {
            alert('Nicht genügend Gerichte in der Datenbank verfügbar.');
            hideSaveButton();
            return;
        }

        // Sammle alle saisonalen Zutaten aus dem Dropdown-Menü
        const selectedSeasonalIngredients = new Set();
        const seasonalIngredientsDropdown = document.getElementById('seasonalIngredients');
        for (const option of seasonalIngredientsDropdown.options) {
            if (option.selected) {
                selectedSeasonalIngredients.add(option.value);
            }
        }

        // Überprüfe, ob saisonale Zutaten ausgewählt wurden
        if (selectedSeasonalIngredients.size === 0 && seasonalDays > 0) {
            alert('Bitte wähle saisonale Zutaten aus.');
            return;
        }

        // Erzeuge eine Liste von Gerichten, die die saisonalen Zutaten enthalten
        const seasonalDishes = selectDishesWithSeasonalIngredients(availableDishes, selectedSeasonalIngredients, seasonalDays);

        // Überprüfe, ob genügend saisonale Gerichte verfügbar sind
        if (seasonalDays > 0 && (!seasonalDishes || seasonalDishes.length < seasonalDays)) {
            alert('Nicht genügend verschiedene Gerichte mit den ausgewählten saisonalen Zutaten verfügbar.');
            hideSaveButton();
            return;
        }

        const mealPlan = [];

        // Kopiere die verfügbaren Gerichte in ein neues Array
        const remainingDishes = [...availableDishes];

        // Mische das Array, um die Reihenfolge der Gerichte zufällig zu machen
        shuffleArray(remainingDishes);

        // Mische die saisonalen Gerichte
        shuffleArray(seasonalDishes);

        // Füge die saisonalen Gerichte zum Essensplan hinzu
        mealPlan.push(...seasonalDishes);

        // Entferne die saisonalen Gerichte aus den verbleibenden Gerichten
        seasonalDishes.forEach((dish) => {
            const index = remainingDishes.findIndex((remainingDish) => remainingDish.id === dish.id);
            if (index !== -1) {
                remainingDishes.splice(index, 1);
            }
        });

        // Mische die restlichen Gerichte
        shuffleArray(remainingDishes);

        // Generiere den restlichen Teil des Essensplans
        for (let i = seasonalDays; i < numberOfDays; i++) {
            if (remainingDishes.length === 0) {
                alert('Nicht genügend einzigartige Gerichte in der Datenbank verfügbar.');
                hideSaveButton();
                return;
            }

            // Wähle ein zufälliges Gericht aus dem verbleibenden Array aus
            const selectedDish = remainingDishes.pop();
            mealPlan.push(selectedDish);
        }

        // Überprüfen, ob ein gültiger Essensplan erstellt wurde
        if (mealPlan.length === numberOfDays) {
            showSaveButton();

            // Zeige die Tabelle an, nachdem der Essensplan generiert wurde
            const mealPlanTable = document.getElementById('mealPlanTable');
            mealPlanTable.style.display = 'table'; // Ändere den Anzeigestil auf 'table'
                } else {
            // Falls nicht genügend Gerichte vorhanden sind, verstecke die Speichern-Schaltfläche
            hideSaveButton();
        }

        // Gerichte innerhalb des Essensplans mischen
        shuffleArray(mealPlan);

        // Anzeigen des Essensplans in der Tabelle
        displayMealPlan(mealPlan);
    }






        function selectDishesWithSeasonalIngredients(availableDishes, selectedSeasonalIngredients, numberOfDays) {
            // Sammle alle Gerichte, die mindestens eine saisonale Zutat enthalten
            const dishesWithSeasonalIngredients = availableDishes.filter((dish) => {
                if (!dish.ingredients) {
                    return false;
                }
                const ingredientsArray = dish.ingredients.split(', ');
                return ingredientsArray.some((ingredient) => selectedSeasonalIngredients.has(ingredient));
            });

            // Überprüfe, ob genügend Gerichte für die Anforderung vorhanden sind
            if (dishesWithSeasonalIngredients.length < numberOfDays) {
                return null; // Nicht genügend Gerichte vorhanden
            }

            // Mische das Array, um die Reihenfolge der Gerichte zufällig zu machen
            shuffleArray(dishesWithSeasonalIngredients);

            // Wähle die ersten "numberOfDays" Gerichte aus dem gemischten Array aus
            return dishesWithSeasonalIngredients.slice(0, numberOfDays);
        }


        function displayMealPlan(mealPlan) {
            const mealPlanTable = document.getElementById('mealPlanTable');
            mealPlanTable.innerHTML = ''; // Lösche alle Zeilen aus der Tabelle

            // Erstelle eine neue Zeile für jedes Gericht im Essensplan
            mealPlan.forEach((dish, index) => {
                // Erstelle eine Überschriftszeile, falls es die erste Zeile ist
                if (index === 0) {
                    const headerRow = mealPlanTable.insertRow();
                    const numberHeader = headerRow.insertCell(0);
                    const nameHeader = headerRow.insertCell(1);
                    const ingredientsHeader = headerRow.insertCell(2);
                    const updateHeader = headerRow.insertCell(3);
                    numberHeader.textContent = 'Tag';
                    nameHeader.textContent = 'Name';
                    ingredientsHeader.textContent = 'Zutaten';
                    updateHeader.textContent = 'Gericht ändern';
                }
                
                const row = mealPlanTable.insertRow(); // Starte bei 1, um die Überschriftenzeile zu überspringen
                const numberCell = row.insertCell(0);
                const nameCell = row.insertCell(1);
                const ingredientsCell = row.insertCell(2);
                const updateCell = row.insertCell(3);
            
                numberCell.textContent = index + 1;
                nameCell.textContent = dish.name;
                ingredientsCell.textContent = dish.ingredients;
                updateCell.innerHTML = `<button class="btn btn-primary" onclick="updateDish(${index})">Gericht ändern</button>`;
            });
            
        }
        
        




        function updateDish(index) {
            const mealPlan = getMealPlan(); // Hole den aktuellen Essensplan

            // Überprüfe, ob genügend Gerichte verfügbar sind
            if (availableDishes.length === 0) {
                alert('Nicht genügend Gerichte in der Datenbank verfügbar.');
                return;
            }

            // Wähle ein zufälliges neues Gericht aus den verfügbaren Gerichten aus
            let newDish;
            do {
                const randomIndex = Math.floor(Math.random() * availableDishes.length);
                newDish = availableDishes[randomIndex];
            } while (mealPlan.some(dish => dish.name === newDish.name));

            // Ersetze das Gericht im Essensplan an der angegebenen Position (index)
            mealPlan[index] = newDish;

            // Aktualisiere die Anzeige des Essensplans
            displayMealPlan(mealPlan);
        }

        // Funktion zum Holen des aktuellen Essensplans aus der Tabelle
        function getMealPlan() {
            const mealPlanTable = document.getElementById('mealPlanTable');
            const mealPlanRows = mealPlanTable.rows;
            const mealPlan = [];

            for (let i = 1; i < mealPlanRows.length; i++) { // Starte bei 1, um die Überschriftenzeile zu überspringen
                const row = mealPlanRows[i];
                const nameCell = row.cells[1];
                const ingredientsCell = row.cells[2];

                const dish = {
                    name: nameCell.textContent,
                    ingredients: ingredientsCell.textContent,
                };

                mealPlan.push(dish);
            }

            return mealPlan;
        }



        // Funktion zum Anzeigen der Schaltfläche zum Speichern des Essensplans
        function showSaveButton() {
            const savePlanButton = document.getElementById('savePlan');
            savePlanButton.style.display = 'block'; // Zeige die Schaltfläche an
        }

        // Funktion zum Weiterleiten zur "dishes.html"-Seite
        function redirectToDishesPage() {
            // Weiterleitung zur "dishes.html"-Seite
            window.location.href = "dishes.html";
        }

        // Funktion zum Abrufen der Zutaten und Befüllen des Dropdown-Menüs
        async function fillSeasonalIngredientsDropdown() {
            const dropdown = document.getElementById('seasonalIngredients');
            dropdown.appendChild(document.createElement('option'));

            // API-Aufruf, um alle unterschiedlichen Zutaten abzurufen
            try {
                const response = await fetch('/api/ingredients');
                let ingredients = await response.json();

                // Alphabetische Sortierung der Zutaten in aufsteigender Reihenfolge
                ingredients = ingredients.sort((a, b) => a.localeCompare(b));

                // Löschen Sie alle vorhandenen Optionen im Dropdown-Menü
                dropdown.innerHTML = '';

                // Füllen Sie das Dropdown-Menü mit den alphabetisch sortierten Zutaten
                ingredients.forEach((ingredient) => {
                const option = document.createElement('option');
                option.value = ingredient;
                option.textContent = ingredient;
                dropdown.appendChild(option);
                });
            } catch (error) {
                console.error('Fehler beim Abrufen der Zutaten:', error);
            }
        }


        function getSelectedIngredients() {
            const dropdown = document.getElementById('seasonalIngredients');
            const selectedIngredients = [];
            for (let i = 0; i < dropdown.options.length; i++) {
                if (dropdown.options[i].selected) {
                selectedIngredients.push(dropdown.options[i].value);
                }
            }
            // Hier haben Sie die ausgewählten Zutaten im Array selectedIngredients
            console.log('Ausgewählte Zutaten:', selectedIngredients);
            // Fügen Sie den Code hinzu, um die ausgewählten Zutaten weiter zu verwenden
        }


        // Rufen Sie die Funktion zum Befüllen des Dropdown-Menüs auf
        fillSeasonalIngredientsDropdown();
        // Rufe die Funktion fetchAvailableDishes auf, um die verfügbaren Gerichte aus der Datenbank abzurufen
        fetchAvailableDishes();

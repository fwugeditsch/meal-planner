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
                numberCell.style.fontWeight = 'bold';
                nameCell.textContent = dish.name;
                ingredientsCell.textContent = dish.ingredients;
                // bild von refreshButton (img/refresh_button.png) als Schaltfläche zum Ändern des Gerichts
                
                // Erstellen Sie das img-Element für das Aktualisieren-Bild
                const updateImage = document.createElement('img');
                updateImage.src = 'img/refresh_button.png'; // Hier sollte der Pfad zu Ihrem Bild sein
                updateImage.alt = 'Aktualisieren';

                // Weisen Sie die CSS-Klasse "img-in-cell" zu
                updateImage.classList.add('img-in-cell');

                // Fügen Sie das Bild der updateCell hinzu
                updateCell.appendChild(updateImage);

                // Fügen Sie das onClick-Ereignis hinzu
                updateImage.addEventListener('click', () => {
                    updateDish(index);
                }
                );
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

        // Zähler für Zutatenfelder
        let ingredientCounter = 1;


        // Funktion zum Hinzufügen eines neuen Zutaten-Textfelds
        function addIngredientField() {

            // Wenn es bereits ein leerer Eingabefeld gibt, passiert nichts
            const ingredientInputs1 = document.querySelectorAll('.ingredient');
            let emptyInputFound = false;
            ingredientInputs1.forEach(input => {
                if (input.value === '') {
                    emptyInputFound = true;
                }
            }
            );
            if (emptyInputFound) {
                return;
            }

            const ingredientInputs = document.getElementById('ingredientInputs');
            const newIngredientInput = document.createElement('input');
            newIngredientInput.type = 'text';
            newIngredientInput.className = 'ingredient awesomplete'; // Stellen Sie sicher, dass die Klasse 'awesomplete' hinzugefügt wird
            newIngredientInput.dataset.list = ''; // Setzen Sie das data-list-Attribut auf einen leeren Wert
            newIngredientInput.placeholder = 'Zutat ' + (ingredientInputs.childElementCount + 1);
            ingredientInputs.appendChild(newIngredientInput);
            // Hintergrundfarbe des neuen Zutatenfelds wird #212C4D
            newIngredientInput.style.backgroundColor = '#212C4D';
            // der Rand des neuen Zutatenfeld soll 1px rgb(56, 56, 56) solid sein
            newIngredientInput.style.border = '1px rgb(56, 56, 56) solid';
            newIngredientInput.style.color = 'lightgrey';

            // Fügen Sie das neue Zutatenfeld dem Awesomplete-Plugin hinzu
            const awesomplete = new Awesomplete(newIngredientInput, {
                list: [],
                minChars: 2,
            });
            loadIngredientsIntoAutocomplete();

        }

        function resetIngredientFields() {
            // alle Zutatenfelder außer dem ersten werden entfernt
            const ingredientInputs = document.querySelectorAll('.ingredient');
            ingredientInputs.forEach((input, index) => {
                if (index !== 0)
                    input.remove();
            }
            );

            // der Inhalt des ersten Zutatenfelds wird geleert
            ingredientInputs[0].value = '';
        }

        // Funktion zum Hinzufügen eines neuen Gerichts über eine POST-Anfrage
        function addDish() {
            // Lese die Eingaben aus den Eingabefeldern aus
            const dishNameInput = document.getElementById('dishName');
            const dishName = dishNameInput.value.trim(); // Name des Gerichts
            const ingredientInputs = document.querySelectorAll('.ingredient');
            const ingredients = [];

            // Filtere leere Zutatenfelder heraus und trime Whitespaces
            ingredientInputs.forEach(input => {
                const ingredientValue = input.value.trim();
                if (ingredientValue !== '') {
                    ingredients.push(ingredientValue);
                }
            });

            if (dishName === '' || ingredients.length === 0) {
                alert('Bitte fülle alle Felder aus.');
                return;
            }

            // wenn es bereits ein Gericht mit dem gleichen Namen gibt, wird eine Fehlermeldung ausgegeben
            const dishesList = document.getElementById('dishesList');
            const dishes = dishesList.querySelectorAll('.dish');
            let continueQuery = true;
            dishes.forEach(dish => {
                const dishNameElement = dish.querySelector('h3');
                if (dishNameElement.textContent === dishName) {
                    alert('Es gibt bereits ein Gericht mit diesem Namen.');
                    continueQuery = false;
                    // FUnktion beenedet, wenn es bereits ein Gericht mit dem gleichen Namen gibt

                }
            });

            if (continueQuery === false) {
                return;
            }

            fetch('/api/dishes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: dishName,
                    ingredients: ingredients,
                }),
            })
            .then(response => {
                if (response.ok) {
                    alert('Gericht wurde erfolgreich hinzugefügt.');
                    // Lade die gespeicherten Gerichte neu
                    getAndDisplayDishes();
                    // Leere die Eingabefelder
                    dishNameInput.value = '';
                    ingredientInputs.forEach(input => {
                        input.value = '';
                    });
                    // alle Zutatenfelder außer dem ersten werden entfernt
                } else {
                    throw new Error('Fehler beim Hinzufügen des Gerichts.');
                }

                resetIngredientFields(); // Setze die Zutatenfelder zurück

                
            })
            .catch(error => {
                console.error(error);
                alert('Fehler beim Hinzufügen des Gerichts.');
            });
        }



        // Funktion zum Zurückkehren zur "index.html"-Seite
        function redirectToIndexPage() {
            window.location.href = "index.html";
        }

        // Funktion zum Abrufen und Anzeigen der gespeicherten Gerichte
        function getAndDisplayDishes() {
            fetch('/api/dishes')
            .then(response => response.json())
            .then(data => {
                const dishesList = document.getElementById('dishesList');
                dishesList.innerHTML = ''; // Leere die bestehende Liste

                data.forEach(dish => {
                    // alle Gerichte werden alphabetisch sortiert
                    data = data.sort((a, b) => a.name.localeCompare(b.name));

                    const dishDiv = document.createElement('div');
                    dishDiv.className = 'dish';
                    const dishName = document.createElement('h3');
                    dishName.textContent = dish.name;
                    const dishIngredients = document.createElement('p');
                    dishIngredients.className = 'ingredients';
                    dishIngredients.textContent = 'Zutaten: ' + dish.ingredients;
                    // den Zutatentext hellgrau
                    dishIngredients.style.color = 'grey';

                    // Hinzufügen des "Löschen"-Buttons mit Bestätigung
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Löschen';
                    deleteButton.style.backgroundColor = 'red';
                    deleteButton.style.color = 'white';

                    // wenn über den Button gehovered wird, wird die Farbe des Buttons geändert
                    deleteButton.addEventListener('mouseover', () => {
                        deleteButton.style.backgroundColor = 'darkred';
                        deleteButton.style.color = 'white';
                    });

                    // wenn der Mauszeiger den Button verlässt, wird die Farbe des Buttons wieder geändert
                    deleteButton.addEventListener('mouseout', () => {
                        deleteButton.style.backgroundColor = 'red';
                        deleteButton.style.color = 'white';
                    });

                    deleteButton.addEventListener('click', () => {
                        const confirmDelete = confirm('Sind Sie sicher, dass Sie dieses Gericht löschen möchten?');
                        if (confirmDelete) {
                            deleteDish(dish.id);
                        }
                    });

                    // Hintergrundfarbe von jedem zweiten Gericht wird dunkelblau
                    if (dishesList.childElementCount % 2 === 0) {
                        // Farbe als rgb angeben
                        dishDiv.style.backgroundColor = 'rgb(16, 25, 53)';
                    }
                    else {
                        dishDiv.style.backgroundColor = 'rgb(34, 45, 77)';
                    }

                    dishDiv.appendChild(dishName);
                    dishDiv.appendChild(dishIngredients);
                    dishDiv.appendChild(deleteButton);

                    dishesList.appendChild(dishDiv);
                });
            })
            .catch(error => {
                console.error(error);
                alert('Fehler beim Abrufen der Gerichte.');
            });
        }


        function saveMealPlan() {
            // diese Funktion wird aufgerufen, wenn der "Speichern"-Button geklickt wird.
            // Es soll der generierte Essensplan in der Datenbank mittels Jahr und Kalenderwoche gespeichert werden.
            // Dazu müssen die Werte aus den Eingabefeldern ausgelesen werden.
            
            // Vor dem Speichern soll nach Anklicken des Speichern-Buttons ein Popup-Fenster erscheinen, in welchem der Nutzer das Jahr und die Kalenderwoche eingeben, für die der Essensplan vorgesehen ist.
            // Die Eingabe soll in Variablen gespeichert werden.
            // Die Variablen sollen dann in der fetch-Anfrage verwendet werden, um den Essensplan in der Datenbank zu speichern.
            // Die fetch-Anfrage soll in einem try-catch-Block stehen.
            // Bei erfolgreicher Speicherung soll eine Erfolgsmeldung ausgegeben werden.
            // Bei einem Fehler soll eine Fehlermeldung ausgegeben werden.

            // Lese Kalenderwoche und Jahr aus den Eingabefeldern aus. Die Werte stehen im Textelement "weekPicker" im Format "KW/Jahr".
            const weekPicker = document.getElementById('weekPicker');
            const date = weekPicker.value; // Datum im Format DD/MM/YYYY
            const week = getCalendarWeek(date); // Kalenderwoche
            // ausgabe zum debuggen
            console.log('Datum: ' + date);
            console.log('Kalenderwoche: ' + week);
            const year = getYear(date); // Jahr
            console.log('Jahr: ' + year);

        }

        function getCalendarWeek(dateString) {
            // Zerlegen Sie das Datum in Tag, Monat und Jahr
            const [day, month, year] = dateString.split('/').map(Number);
        
            // Erstellen Sie ein Date-Objekt
            const date = new Date(year, month - 1, day);
        
            // Kopieren Sie das Date-Objekt, um die Originalinstanz nicht zu ändern
            const currentDate = new Date(date);
        
            // Setzen Sie das Datum auf den 4. Januar des aktuellen Jahres
            currentDate.setMonth(0, 4);
        
            // Berechnen Sie den Unterschied zwischen dem 4. Januar und dem angegebenen Datum in Millisekunden
            const timeDifference = date - currentDate;
        
            // Berechnen Sie die Anzahl der Tage seit dem 4. Januar
            const daysSinceJanuary4 = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        
            // Berechnen Sie die Kalenderwoche
            const calendarWeek = Math.ceil((daysSinceJanuary4 + currentDate.getDay() + 1) / 7);
        
            return calendarWeek;
        }

        function getYear(dateString) {
            // Zerlegen Sie das Datum in Tag, Monat und Jahr
            const [day, month, year] = dateString.split('/').map(Number);
        
            return year;
        }
        
        // Beispielaufruf
        const date = '23/12/2023';
        const calendarWeek = getCalendarWeek(date);
        console.log(`Die Kalenderwoche für ${date} ist: ${calendarWeek}`);
        

        // Funktion zum Anzeigen des Popups
        function openPopup() {
            const popup = document.getElementById('savePopup');
            popup.style.display = 'block';
        }

        // Funktion zum Verbergen des Popups
        function closePopup() {
            const popup = document.getElementById('savePopup');
            popup.style.display = 'none';
        }
    


        // Funktion zum Löschen eines Gerichts über eine DELETE-Anfrage
        function deleteDish(dishId) {
            fetch(`/api/dishes/${dishId}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                    alert('Gericht wurde erfolgreich gelöscht.');
                    // Lade die gespeicherten Gerichte neu
                    getAndDisplayDishes();
                } else {
                    throw new Error('Fehler beim Löschen des Gerichts.');
                }
            })
            .catch(error => {
                console.error(error);
                alert('Fehler beim Löschen des Gerichts.');
            });
        }

        function searchDishes() {
            const searchText = document.getElementById('dishSearch').value.toLowerCase();
            const dishesList = document.getElementById('dishesList');
            const dishes = dishesList.querySelectorAll('.dish');
        
            dishes.forEach(dish => {
                const dishNameElement = dish.querySelector('h3');
                const dishName = dishNameElement.textContent.toLowerCase();
        
                // Überprüfe, ob das Gericht den Suchbegriff enthält
                if (dishName.includes(searchText)) {
                    dish.style.display = 'block'; // Zeige das Gericht an
                } else {
                    dish.style.display = 'none'; // Verberge das Gericht
                }
            });
        }
        
        // Funktion zum Abrufen der verfügbaren Zutaten aus der Datenbank
        async function fetchAvailableIngredients() {
            try {
                const response = await fetch('/api/ingredients'); // Stelle sicher, dass dies dem tatsächlichen Pfad zu deinem API-Endpunkt entspricht
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Fehler beim Abrufen der Zutaten aus der Datenbank:', error);
                return [];
            }
        }

        // Laden Sie die Zutaten aus der Datenbank und fügen Sie sie in das Autocomplete-Feld ein
        async function loadIngredientsIntoAutocomplete() {
            const ingredientInputs = document.querySelectorAll('.ingredient.awesomplete');
            const availableIngredients = await fetchAvailableIngredients();

            ingredientInputs.forEach((input) => {
                const awesomplete = new Awesomplete(input, {
                    list: availableIngredients,
                    minChars: 2,
                });
            });
        }
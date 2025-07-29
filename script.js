// Vor dem Aufrufen der generateMealPlan-Funktion die Gerichte aus der Datenbank abrufen und in availableDishes speichern
let availableDishes = [];

const currentDate = getCurrentDate();
var displayedCalendarWeekYear = getCalendarWeekYear(getYear(currentDate), getCalendarWeek(currentDate));
var latestMealPlanWeekYear, firstMealPlanWeekYear;

// Funktion zum Initialisieren der globalen Variablen
async function initializeCalendarWeekYearLimits() {
    try {
        latestMealPlanWeekYear = await fetchMaxMealPlanWeek();
        firstMealPlanWeekYear = await fetchMinMealPlanWeek();
    } catch (error) {
        console.error('Fehler beim Initialisieren der Kalendergrenzen:', error);
    }
}

// Funktion zum Initialisieren der Button-Styles (standardmäßig deaktiviert)
function initializeButtonStyles() {
    const forwardButton = document.getElementById('nextMealPlan');
    const backwardButton = document.getElementById('previousMealPlan');
    
    // Beide Buttons standardmäßig deaktiviert stylen
    if (forwardButton) {
        forwardButton.style.backgroundColor = '#212C4D';
    }
    if (backwardButton) {
        backwardButton.style.backgroundColor = '#212C4D';
    }
}

// Funktion zum Initialisieren der Button-Styles (standardmäßig deaktiviert)
// Hier eine Funktion zum Abrufen aller Gerichte aus der Datenbank
async function fetchAvailableDishes() {
    try {
        console.log('Lade verfügbare Gerichte...');
        const response = await fetch('/api/dishes');
        const data = await response.json();
        availableDishes = data;
        
        // Cache für getMealPlanForWeek invalidieren
        window.allDishes = data;
        
        console.log(`${availableDishes.length} Gerichte geladen:`, availableDishes.map(d => d.name));
    } catch (error) {
        console.error('Fehler beim Abrufen der Gerichte aus der Datenbank:', error);
        availableDishes = [];
        window.allDishes = [];
    }
}

// Funktion zum Invalidieren des Gerichte-Cache (bei Änderungen aufrufen)
function invalidateDishCache() {
    console.log('Gerichte-Cache invalidiert');
    window.allDishes = null;
    fetchAvailableDishes(); // Neu laden
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
    
        if (seasonalDays > numberOfDays) {
            alert("Die Anzahl der Tage mit saisonalen Zutaten ist zu groß")
            return;
        }
    
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
    
        // Aufbau von meaPlan:
        // mealPlan = [
        //     {
        //         id: 1,
        //         name: 'Gericht 1',
        //         ingredients: 'Zutat 1, Zutat 2, Zutat 3'
        //     },
        //     {
        //         id: 2,
        //         name: 'Gericht 2',
        //         ingredients: 'Zutat 1, Zutat 2, Zutat 3'
        //     },
        //     ...
        // ]
    
    
        // Anzeigen des Essensplans in der Tabelle
        displayMealPlan(mealPlan);
        // class mealplan-header wird ausgeblendt
        // alle Elemente mit der Klasse mealplan-header werden ausgeblendet
        document.querySelectorAll('.mealplan-header').forEach((element) => {
            element.style.visibility = 'hidden';
        });
    
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
            // Anzeigen des Essensplans in der Tabelle
            // der Parameter mealPlan ist ein Array mit den Gerichten
            const mealPlanTable = document.getElementById('mealPlanTable');
            mealPlanTable.innerHTML = ''; // Lösche alle Zeilen aus der Tabelle
        
            console.log("Datentyp von mealPlan:", typeof mealPlan);
            console.log("Inhalt von mealPlan:", mealPlan);
        
            // Datentyp von mealPlan zum debuggen
            console.log('Datentyp von mealPlan: ' + typeof mealPlan);
            // Inhalte von mealPlan zum debuggen
            console.log('Inhalt von mealPlan: ' + mealPlan);
        
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
                
                // Spezielle Behandlung für nicht gefundene Gerichte
                if (dish._status === 'not_found') {
                    row.classList.add('not-found-dish');
                    nameCell.innerHTML = `${dish.name} <span style="color: #dc3545; font-size: 0.8em;">(nicht gefunden)</span>`;
                    ingredientsCell.style.fontStyle = 'italic';
                    ingredientsCell.style.color = '#6c757d';
                }
                
                // bild von refreshButton (img/refresh_button.png) als Schaltfläche zum Ändern des Gerichts
                
                // Erstellen Sie das img-Element für das Aktualisieren-Bild
                const updateImage = document.createElement('img');
                updateImage.src = 'img/refresh_button.png';
                updateImage.alt = 'Aktualisieren';
        
                // Weisen Sie die CSS-Klasse "img-in-cell" zu
                updateImage.classList.add('img-in-cell');
        
                // Fügen Sie das Bild der updateCell hinzu
                updateCell.appendChild(updateImage);
        
                // Fügen Sie das onClick-Ereignis hinzu (nur für verfügbare Gerichte)
                if (dish._status === 'active') {
                    updateImage.addEventListener('click', () => {
                        updateDish(index);
                    });
                } else {
                    updateImage.style.opacity = '0.3';
                    updateImage.style.cursor = 'not-allowed';
                    updateImage.title = 'Gericht nicht verfügbar - kann nicht geändert werden';
                }
            });
            
        }
        
        
        function updateDish(index) {
            const mealPlan = getMealPlan(); // Hole den aktuellen Essensplan
            // Wähle ein zufälliges neues Gericht aus den verfügbaren Gerichten aus und stelle sicher, dass es nicht bereits im Essensplan enthalten ist
            // weiters wird geprüft, ob es überhaupt noch ein verfügbares Gericht gibt, das nicht im Essensplan enthalten ist. Es soll auch kein Gericht mehrmals im Essensplan enthalten sein.
        
            const remainingDishes = availableDishes.filter(dish => !mealPlan.some(meal => meal.name === dish.name));
            if (remainingDishes.length === 0) {
                alert('Es gibt keine verfügbaren Gerichte mehr, die nicht im Essensplan enthalten sind.');
                return;
            }
            // Wähle ein zufälliges Gericht aus den verbleibenden Gerichten
            const randomIndex = Math.floor(Math.random() * remainingDishes.length);
            const newDish = remainingDishes[randomIndex];
        
            // Aktualisiere das Gericht im Essensplan
            mealPlan[index] = {
                name: newDish.name,
                ingredients: newDish.ingredients,
            };
        
            // Aktualisiere die Tabelle mit dem neuen Essensplan
            displayMealPlan(mealPlan);
            
            // Zeige die Schaltfläche zum Speichern des Essensplans an
            showSaveButton();
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

                // alle Gerichte werden alphabetisch sortiert
                const sortedDishes = data.sort((a, b) => a.name.localeCompare(b.name));

                sortedDishes.forEach(dish => {
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


        async function saveMealPlan() {
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
            if (document.getElementById('weekPicker').value === '') {
                alert('Bitte wähle ein Datum aus.');
                return;
            }

            const weekPicker = document.getElementById('weekPicker');
            const date = weekPicker.value; // Datum im Format DD/MM/YYYY
            const week = getCalendarWeek(date); // Kalenderwoche
            // ausgabe zum debuggen
            console.log('Datum: ' + date);
            console.log('Kalenderwoche: ' + week);
            const year = getYear(date); // Jahr
            console.log('Jahr: ' + year);
            // calendar_week_year: beide Integer-Werte werden kombiniert und als Integer gespeichert. Es sollen jedoch nicht die beiden Wert addiert werden, sondern die Kalenderwoche soll an das Jahr angehängt werden.
            const calendar_week_year = getCalendarWeekYear(year, week);
            // jetzt in Integer umwandeln
            
            console.log('calendar_week_year: ' + calendar_week_year);

            // wenn die Kalenderwoche bereits in der Datenbank vorhanden ist, soll der Benutzer gefragt werden, ob er den bestehenden Essensplan überschreiben möchte
            // Deklaration und Initialisierung von mealplan zu Beginn der Funktion
            let mealplan;
            let existingMealPlan = false;

            try {
                // Überprüfe, ob der Essensplan bereits in der Datenbank vorhanden ist
                const response = await fetch(`/api/MealPlans/${calendar_week_year}`);
                // Statuscode der Antwort auswerten
                if (response.status === 200) {
                    // wenn die Antwort den Statuscode 200 hat, ist der Essensplan bereits vorhanden
                    existingMealPlan = true;
                    const confirmOverwrite = confirm('Ein Essensplan für diese Woche existiert bereits. Möchten Sie ihn überschreiben?');
                    if (!confirmOverwrite) {
                        return; // Benutzer möchte nicht überschreiben
                    }
                }
            } catch (error) {
                console.error(error);
                alert('Fehler beim Speichern des Essensplans oder beim Abfragen der Datenbank. Fehlercode: ' + error.status);
            }

            try {
                // Lese den Essensplan aus der Tabelle aus
                const mealPlan = getMealPlan();
                console.log('Essensplan: ' + mealPlan);

                // Der Essensplan soll als ID die Kalenderwoche und das Jahr haben und als Inhalt die Namen der Gerichte mit Komma getrennt.
                // Erstelle ein Array mit den Namen der Gerichte
                const dishes = [];
                mealPlan.forEach(dish => {
                    dishes.push(dish.name);
                });
                // Erstelle einen String mit den Namen der Gerichte mit Komma getrennt
                const dishesString = dishes.join(', ');
                console.log('Gerichte: ' + dishesString);

                // Erstelle eine neue Instanz von Mealplan
                mealplan = {
                    // Die DB erwartet die Attribute year (JahrKalenderwoche) und IDs der dishes (Gerichte) als String mit Komma getrennt
                    calendar_week_year: calendar_week_year,
                    dishes: dishesString // IDs der Gerichte als String mit Komma getrennt
                };

                // Der Essensplan ist noch nicht in der Datenbank, also speichere ihn
                const mealplanResponse = await fetch('/api/MealPlans', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(mealplan),
                });

                if (mealplanResponse.ok) {
                    alert('Essensplan wurde erfolgreich gespeichert.');
                    // Leere die Eingabefelder
                    weekPicker.value = '';
                } else {
                    throw new Error('Fehler beim Speichern des Essensplans.');
                }
            } catch (error) {
                console.error(error);
                alert('Fehler beim Speichern des Essensplans oder beim Abfragen der Datenbank. Code: ' + error.status);
            }
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

        function getCalendarWeekYear(year, calendarWeek) {
            // Fügen Sie eine führende Null hinzu, wenn die Kalenderwoche kleiner als 10 ist
            const calendarWeekString = calendarWeek < 10 ? `0${calendarWeek}` : `${calendarWeek}`;
        
            return `${year}${calendarWeekString}`;
        }

        function getYear(dateString) {
            // Zerlegen Sie das Datum in Tag, Monat und Jahr
            const [day, month, year] = dateString.split('/').map(Number);
        
            return year;
        }

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

        function getCurrentDate() {
            // Liefert das aktuelle Datum als String im Format DD/MM/YYYY
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1;
            var yyyy = today.getFullYear();

            if (dd < 10)
                dd = '0' + dd;
            if (mm < 10)
                mm = '0' + mm;

            today = dd + '/' + mm + '/' + yyyy;

            return today;
        }

        function formatDate(date) {
            // diese Funktion nimmt ein Datum als Parameter und gibt das Datum im Format DD.MM.YYYY als String zurück

            date = new Date(date);
            var dd = date.getDate();
            var mm = date.getMonth()+1;
            var yyyy = date.getFullYear();

            if (dd < 10)
                dd = '0' + dd;
            // Add leading zero if the month is less than 10
            if (mm < 10)
                mm = '0' + mm;

            date = dd + '.' + mm + '.' + yyyy;

            return date;
        }


        function getMonday(date) {
            // diese Funktion nimmt ein Datum als Parameter und gibt das Datum des Montags der Woche als Date-Objekt zurück, in der das Datum liegt

            date = new Date(date);
            var day = date.getDay(),
                diff = date.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
            var monday = new Date(date.setDate(diff));
            
            return monday;
        }

        function getDateFromWeekAndYear(year, week) {
            // diese Funktion nimmt ein Jahr und eine Kalenderwoche als Parameter und gibt das Datum des Montags der Woche als Date-Objekt zurück, in der das Datum liegt
            // Erstelle ein neues Date-Objekt mit dem 1. Januar des gegebenen Jahres
            var date = new Date(year, 0, 1);
        
            // Berechne den Unterschied in Tagen für die angegebene Woche
            var daysToAdd = (week - 1) * 7;
        
            // Setze das Datum auf den Montag der angegebenen Woche
            date.setDate(date.getDate() + daysToAdd);
        
            return date;
        }

        // Funktion zum Ermitteln eines Datums anhand eines Datums und einer Anzahl von Tagen
        // Parameter: date
        // Rückgabe: date + days
        function addDays(date, days) {
            // AUsgabe zum debuggen
            console.log('addDays: date: ' + date);
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            console.log(result);
            return result;
            
        }

        // Funktion zum Ermitteln der nächsten calendar_week_year nach einer calendar_week_year, für welche ein Essensplan in der Datenbank vorhanden ist
        // Parameter: calendar_week_year
        // Rückgabe: calendar_week_year
        async function getNextMealPlanWeek(calendar_week_year) {
            if (calendar_week_year === null) {
                console.log('getNextMealPlanWeek: calendar_week_year ist null.');
                return null;
            }
            try {
              const response = await fetch(`/api/MealPlans/next/${calendar_week_year}`);
              if (response.status === 200) {
                const mealplanWeek = await response.json();
                console.log("Nächster Essensplan nach " + calendar_week_year + ": " + mealplanWeek);
          
                // Überprüfe, ob mealplanWeek nicht null oder undefined ist
                if (mealplanWeek) {
                  return mealplanWeek;
                } else {
                  console.log('getNextMealPlanWeek: Kein nächster Mealplan vorhanden.');
                  return null;
                }
              }
            } catch (error) {
              console.error(error);
              return null;
            }
          }

        // Funktion getLastMealPlanWeek
        // Parameter: calendar_week_year
        // Rückgabe: calendar_week_year
        async function getLastMealPlanWeek(calendar_week_year) {
            console.log('getLastMealPlanWeek aufgerufen mit:', calendar_week_year);
            
            if (calendar_week_year === null) {
                console.log('getLastMealPlanWeek: calendar_week_year ist null.');
                return null;
            }
            try {
              const response = await fetch(`/api/MealPlans/previous/${calendar_week_year}`);
              console.log('API Response Status:', response.status);
              
              if (response.status === 200) {
                const mealplanWeek = await response.json();
                console.log("Letzter Essensplan vor " + calendar_week_year + ": " + mealplanWeek);
          
                // Überprüfe, ob mealplanWeek nicht null oder undefined ist
                if (mealplanWeek) {
                  return mealplanWeek;
                } else {
                  console.log('getLastMealPlanWeek: Kein letzter Mealplan vorhanden.');
                  return null;
                }
              } else if (response.status === 404) {
                console.log('getLastMealPlanWeek: 404 - Kein vorheriger Mealplan gefunden.');
                return null;
              } else {
                console.log('getLastMealPlanWeek: Unerwarteter Status Code:', response.status);
                return null;
              }
            } catch (error) {
              console.error('Fehler in getLastMealPlanWeek:', error);
              return null;
            }
          }
          
          

        // Funktion zum Abrufen des Mealplans für eine bestimmte Woche
        // Parameter: calendar_week_year
        // Rückgabe: Array mit Gerichten
        async function getMealPlanForWeek(calendar_week_year) {
            console.log('getMealPlanForWeek aufgerufen für:', calendar_week_year);
            
            try {
                // 1. Mealplan-Daten abrufen
                const mealplanResponse = await fetch(`/api/MealPlans/${calendar_week_year}`);
                if (mealplanResponse.status !== 200) {
                    console.log(`Kein Mealplan für ${calendar_week_year} gefunden.`);
                    return [];
                }

                const mealplan = await mealplanResponse.json();
                const dishNames = mealplan.dish_names.split(',').map(name => name.trim());
                console.log('Gespeicherte Gerichtsnamen:', dishNames);

                // 2. Alle verfügbaren Gerichte abrufen (nur aktive)
                if (!window.allDishes) {
                    console.log('Lade alle aktiven Gerichte...');
                    const dishesResponse = await fetch('/api/dishes');
                    if (dishesResponse.ok) {
                        window.allDishes = await dishesResponse.json();
                        console.log('Alle aktiven Gerichte geladen:', window.allDishes.length);
                    } else {
                        console.error('Fehler beim Laden der Gerichte');
                        return [];
                    }
                }

                // 3. Gerichte zusammenstellen - fehlende als "nicht gefunden" markieren
                const mealPlanDishes = dishNames.map(dishName => {
                    const dish = window.allDishes.find(d => d.name === dishName);
                    if (dish) {
                        console.log(`✓ Gericht gefunden: ${dishName}`);
                        return { ...dish, _status: 'active' };
                    } else {
                        console.warn(`⚠ Gericht nicht gefunden: ${dishName}`);
                        return {
                            id: null,
                            name: dishName,
                            ingredients: 'nicht verfügbar',
                            category: 'nicht verfügbar',
                            seasonality: 'nicht verfügbar',
                            preparation_time: 'nicht verfügbar',
                            _status: 'not_found'
                        };
                    }
                });

                console.log(`Mealplan geladen: ${mealPlanDishes.length} Gerichte (${mealPlanDishes.filter(d => d._status === 'active').length} verfügbar, ${mealPlanDishes.filter(d => d._status === 'not_found').length} nicht gefunden)`);
                return mealPlanDishes;

            } catch (error) {
                console.error('Fehler in getMealPlanForWeek:', error);
                return [];
            }
        }



        // Funktion zum Ermitteln des nächsten Mealplans
// Parameter: calendar_week_year
// Rückgabe: Array mit Gerichten des nächsten Mealplans
async function getNextMealPlan(calendar_week_year) {
    const nextMealPlanWeek = await getNextMealPlanWeek(calendar_week_year);
  
    if (nextMealPlanWeek === null) {
      console.log('getNextMealPlan: Kein nächster Mealplan vorhanden.');
      return null;
    }
  
    const maxMealPlanWeek = await fetchMaxMealPlanWeek();
    const nextMealPlanIsMax = nextMealPlanWeek === maxMealPlanWeek;
  
    if (displayedCalendarWeekYear !== undefined) {
      console.log('getNextMealPlan: getMealPlanForWeek aufgerufen.');
      displayedCalendarWeekYear = nextMealPlanWeek;  // Aktualisiere displayedCalendarWeekYear
      // Ausgabe zum debuggen
      console.log('getNextMealPlan: displayedCalendarWeekYear: ' + displayedCalendarWeekYear);
      updateButtons(nextMealPlanIsMax);
      return getMealPlanForWeek(displayedCalendarWeekYear);
    } else {
      console.log('getNextMealPlan: displayedCalendarWeekYear ist undefined.');
      return null;
    }
  }
  
  // Funktion zum Ermitteln des vorherigen Mealplans
  // Parameter: calendar_week_year
  // Rückgabe: Array mit Gerichten des vorherigen Mealplans
  async function getPreviousMealPlan(calendar_week_year) {
    const previousMealPlanWeek = await getLastMealPlanWeek(calendar_week_year);
  
    if (previousMealPlanWeek === null) {
      console.log('getPreviousMealPlan: Kein letzter Mealplan vorhanden.');
      return null;
    }
  
    const minMealPlanWeek = await fetchMinMealPlanWeek();
    const previousMealPlanIsMin = previousMealPlanWeek === minMealPlanWeek;
  
    if (displayedCalendarWeekYear !== undefined) {
      console.log('getPreviousMealPlan: getMealPlanForWeek aufgerufen.');
      displayedCalendarWeekYear = previousMealPlanWeek;  // Aktualisiere displayedCalendarWeekYear
      // Ausgabe zum debuggen
      console.log('getPreviousMealPlan: displayedCalendarWeekYear: ' + displayedCalendarWeekYear);
      updateButtons(previousMealPlanIsMin);
      return getMealPlanForWeek(displayedCalendarWeekYear);
    } else {
      console.log('getPreviousMealPlan: displayedCalendarWeekYear ist undefined.');
      return null;
    }
  }
  
  // Funktion zum Aktualisieren der Vorwärts- und Rückwärts-Buttons
  function updateButtons() {
    const forwardButton = document.getElementById('nextMealPlan');
    const backwardButton = document.getElementById('previousMealPlan');

    // Wenn keine Meal Plan Grenzen verfügbar sind (z.B. keine Meal Plans existieren), beide Buttons deaktivieren
    if (latestMealPlanWeekYear === undefined || firstMealPlanWeekYear === undefined) {
        console.log('Keine Meal Plan Grenzen verfügbar - beide Buttons deaktivieren');
        disableForwardButton();
        disableBackwardButton();
        return;
    }

    // Überprüfen, ob der nächste Mealplan existiert
    const hasNextMealPlan = displayedCalendarWeekYear < latestMealPlanWeekYear;
    // Überprüfen, ob der vorherige Mealplan existiert
    const hasPreviousMealPlan = displayedCalendarWeekYear > firstMealPlanWeekYear;

    // Buttons entsprechend aktivieren/deaktivieren
    if (hasNextMealPlan) {
        enableForwardButton();
    } else {
        disableForwardButton();
    }

    if (hasPreviousMealPlan) {
        enableBackwardButton();
    } else {
        disableBackwardButton();
    }

    console.log(`Button-Status - Forward: ${hasNextMealPlan ? 'enabled' : 'disabled'}, Backward: ${hasPreviousMealPlan ? 'enabled' : 'disabled'}`);
  }

  function disableForwardButton() {
    const forwardButton = document.getElementById('nextMealPlan');
    forwardButton.setAttribute('disabled', '');
    forwardButton.style.backgroundColor = '#212C4D';

    // Event Listeners entfernen und neu setzen um mehrfache Registrierung zu vermeiden
    forwardButton.onmouseover = () => forwardButton.style.backgroundColor = '#212C4D';
    forwardButton.onmouseout = () => forwardButton.style.backgroundColor = '#212C4D';
  }

    function enableForwardButton() {
        const forwardButton = document.getElementById('nextMealPlan');
        forwardButton.removeAttribute('disabled');
        forwardButton.style.backgroundColor = '#6C72FF';

        forwardButton.onmouseover = () => forwardButton.style.backgroundColor = '#212C4D';
        forwardButton.onmouseout = () => forwardButton.style.backgroundColor = '#6C72FF';
    }

    function disableBackwardButton() {
        const backwardButton = document.getElementById('previousMealPlan');
        backwardButton.setAttribute('disabled', '');
        backwardButton.style.backgroundColor = '#212C4D';

        backwardButton.onmouseover = () => backwardButton.style.backgroundColor = '#212C4D';
        backwardButton.onmouseout = () => backwardButton.style.backgroundColor = '#212C4D';
    }

    function enableBackwardButton() {
        const backwardButton = document.getElementById('previousMealPlan');
        backwardButton.removeAttribute('disabled');
        backwardButton.style.backgroundColor = '#6C72FF';

        backwardButton.onmouseover = () => backwardButton.style.backgroundColor = '#212C4D';
        backwardButton.onmouseout = () => backwardButton.style.backgroundColor = '#6C72FF';
    }

  
  // Funktion zum Abrufen des maximalen calendar_week_year
  async function fetchMaxMealPlanWeek() {
    try {
      const response = await fetch('/api/MealPlans/calendarYear/max');
      const maxMealPlanWeek = await response.json();
      // Ausgabe zum debuggen
        console.log('fetchMaxMealPlanWeek: maxMealPlanWeek: ' + maxMealPlanWeek);
      return maxMealPlanWeek;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  
  // Funktion zum Abrufen des minimalen calendar_week_year
  async function fetchMinMealPlanWeek() {
    try {
      const response = await fetch('/api/MealPlans/calendarYear/min');
      const minMealPlanWeek = await response.json();
        // Ausgabe zum debuggen
        console.log('fetchMinMealPlanWeek: minMealPlanWeek: ' + minMealPlanWeek);
      return minMealPlanWeek;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
          

        // Funktion zum Abrufen und Anzeigen des nächsten Mealplans
async function getAndDisplayNextMealPlan() {
    console.log("Nächste Woche mit bestehendem Mealplan nach " + displayedCalendarWeekYear + " wird gesucht");
    const nextMealPlan = await getNextMealPlan(displayedCalendarWeekYear);
  
    // Überprüfe, ob es einen nächsten Mealplan gibt
    if (nextMealPlan !== null && nextMealPlan.length > 0) {
      console.log('getAndDisplayNextMealPlan: Mealplan:', nextMealPlan);
      displayMealPlan(nextMealPlan);
      setNewDate(displayedCalendarWeekYear);
      // Überschrift currentMealPlanHeader aktualisieren
  
      console.log('getAndDisplayNextMealPlan: displayMealPlan aufgerufen.');
    } else {
      console.log('getAndDisplayNextMealPlan: Kein nächster Mealplan vorhanden.');
    }
  }
  
  // Funktion zum Abrufen und Anzeigen des vorherigen Mealplans
  async function getAndDisplayPreviousMealPlan() {
    const lastMealPlanWeek = await getLastMealPlanWeek(displayedCalendarWeekYear);
  
    // Überprüfe, ob es einen letzten Mealplan gibt
    if (lastMealPlanWeek !== null) {
      console.log('getAndDisplayPreviousMealPlan: lastMealPlanWeek:', lastMealPlanWeek);
      const lastMealPlan = await getMealPlanForWeek(lastMealPlanWeek);
      console.log('getAndDisplayPreviousMealPlan: lastMealPlan:', lastMealPlan);
      displayMealPlan(lastMealPlan);
      setNewDate(lastMealPlanWeek);
      // Überschrift currentMealPlanHeader aktualisieren
    } else {
      console.log('getAndDisplayPreviousMealPlan: Kein letzter Mealplan vorhanden.');
    }
  }
  
  async function handleForwardButtonClick() {
    console.log('=== FORWARD NAVIGATION START ===');
    console.log('Aktuell angezeigte Woche:', displayedCalendarWeekYear);
    
    try {
        if (!displayedCalendarWeekYear) {
            console.warn('displayedCalendarWeekYear ist nicht gesetzt');
            return;
        }

        // 1. Nächste Woche finden
        const nextWeek = await getNextMealPlanWeek(displayedCalendarWeekYear);
        console.log('Nächste Woche gefunden:', nextWeek);
        
        if (!nextWeek) {
            console.log('Keine nächste Woche verfügbar - Button sollte deaktiviert sein');
            disableForwardButton();
            return;
        }

        // 2. Mealplan für nächste Woche laden
        const nextMealPlan = await getMealPlanForWeek(nextWeek);
        console.log('Nächster Mealplan geladen:', nextMealPlan.length, 'Gerichte');
        
        if (nextMealPlan.length === 0) {
            console.warn('Nächster Mealplan ist leer oder fehlerhaft');
            showUserMessage('Fehler: Der nächste Essensplan konnte nicht vollständig geladen werden.');
            return;
        }

        // 3. UI aktualisieren
        displayedCalendarWeekYear = nextWeek;
        displayMealPlan(nextMealPlan);
        await setNewDate(nextWeek);
        
        console.log('Navigation erfolgreich. Neue Woche:', displayedCalendarWeekYear);
        
    } catch (error) {
        console.error('Fehler bei Vorwärts-Navigation:', error);
        showUserMessage('Fehler beim Laden des nächsten Essensplans.');
    } finally {
        // 4. Button-Zustände aktualisieren
        updateButtons();
        console.log('=== FORWARD NAVIGATION END ===');
    }
}

// Funktion zum Behandeln des Rückwärts-Buttons
async function handleBackwardButtonClick() {
    console.log('=== BACKWARD NAVIGATION START ===');
    console.log('Aktuell angezeigte Woche:', displayedCalendarWeekYear);
    
    try {
        if (!displayedCalendarWeekYear) {
            console.warn('displayedCalendarWeekYear ist nicht gesetzt');
            return;
        }

        // 1. Vorherige Woche finden
        const previousWeek = await getLastMealPlanWeek(displayedCalendarWeekYear);
        console.log('Vorherige Woche gefunden:', previousWeek);
        
        if (!previousWeek) {
            console.log('Keine vorherige Woche verfügbar - Button sollte deaktiviert sein');
            disableBackwardButton();
            return;
        }

        // 2. Mealplan für vorherige Woche laden
        const previousMealPlan = await getMealPlanForWeek(previousWeek);
        console.log('Vorheriger Mealplan geladen:', previousMealPlan.length, 'Gerichte');
        
        if (previousMealPlan.length === 0) {
            console.warn('Vorheriger Mealplan ist leer oder fehlerhaft');
            showUserMessage('Fehler: Der vorherige Essensplan konnte nicht vollständig geladen werden.');
            return;
        }

        // 3. UI aktualisieren
        displayedCalendarWeekYear = previousWeek;
        displayMealPlan(previousMealPlan);
        await setNewDate(previousWeek);
        
        console.log('Navigation erfolgreich. Neue Woche:', displayedCalendarWeekYear);
        
    } catch (error) {
        console.error('Fehler bei Rückwärts-Navigation:', error);
        showUserMessage('Fehler beim Laden des vorherigen Essensplans.');
    } finally {
        // 4. Button-Zustände aktualisieren
        updateButtons();
        console.log('=== BACKWARD NAVIGATION END ===');
    }
}

// Hilfsfunktion für Benutzernachrichten
function showUserMessage(message) {
    // Einfache Implementierung - kann später durch Toast/Modal ersetzt werden
    console.warn('USER MESSAGE:', message);
    // Temporär mit alert - später durch bessere UI ersetzen
    // alert(message);
}



        // Funktion zum Setzen eines neuen Datums in der h2 currentMealPlanHeader mit dem Text "Essensplan für KW XX (DD.MM.YYYY - DD.MM.YYYY)"
        // Parameter: calendar_week_year (Integer) im Format JJJJKW
        // Rückgabe: none
        async function setNewDate(calendar_week_year) {
            // Ausgabe von calendar_week_year zum debuggen mit Datentyp und Inhalt
            console.log('setNewDate: calendar_week_year: ' + calendar_week_year);
            console.log('setNewDate: Datentyp von calendar_week_year: ' + typeof calendar_week_year);
            // Überprüfe, ob calendar_week_year nicht null oder undefined ist
            if (calendar_week_year) {
                const calendar_week_year_String = calendar_week_year.toString();
                const week = calendar_week_year_String.substring(4, 6);
                const year = calendar_week_year_String.substring(0, 4);
                // Ausgabe von week und year zum debuggen
                console.log('setNewDate: week: ' + week);
                console.log('setNewDate: year: ' + year);
                var monday = getMonday(getDateFromWeekAndYear(year, week));
                var sunday = addDays(monday, 6);
                // Ausgabe von Monday und Sunday zum debuggen
                console.log('setNewDate: monday: ' + monday);
                console.log('setNewDate: sunday: ' + sunday);
                const mondayFormatted = formatDate(monday);
                const sundayFormatted = formatDate(sunday);
                const currentMealPlanHeader = document.getElementById('currentMealPlanHeader');
                currentMealPlanHeader.textContent = `Essensplan für KW ${week} (${mondayFormatted} - ${sundayFormatted})`;
            } else {
                console.log('setNewDate: calendar_week_year ist null oder undefined.');
            }
        }
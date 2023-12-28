const express = require('express');
const { Sequelize } = require('sequelize');

const app = express();
const port = 3000;

// Verbindung zur SQLite-Datenbank herstellen
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'mealplanner.db'
});

// Middleware für JSON-Anfragen
app.use(express.json());
app.use(express.static(__dirname)); // Hier wird das Rootverzeichnis für statische Dateien gesetzt


// Sequelize-Modell für Gerichte (falls du Sequelize verwendest)
const Dish = sequelize.define('Dish', {
  name: {
    type: Sequelize.STRING
  },
  ingredients: {
    type: Sequelize.STRING
  }
}, {
  timestamps: false, // Deaktiviere die Verwendung von Timestamp-Spalten
  primaryKey: true, // Setze das id-Feld als Primärschlüssel
  autoIncrement: true // Lasse das id-Feld automatisch inkrementieren
});

// Sequelize-Modell für Essenspläne (falls du Sequelize verwendest)
const Mealplan = sequelize.define('MealPlan', {
  // Jahr und Kalenderwoche als Primärschlüssel
  calendar_week_year: { // Week repräsentiert die Kalenderwoche und das Jahr in der Form 202101
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  dish_names: {
    type: Sequelize.STRING
  }

}, {
  timestamps: false, // Deaktiviere die Verwendung von Timestamp-Spalten
  primaryKey: true, // Setze das id-Feld als Primärschlüssel
  autoIncrement: true // Lasse das id-Feld automatisch inkrementieren
});



// Section für das Modell des Essensplans

// Abspeichern eines generierten Essensplans mit Jahr, Kalenderwoche und IDs der Gerichte
app.post('/api/MealPlans', async (req, res) => {
  console.log(req.body);
  try {
    const {calendar_week_year, dishes } = req.body;

    // Code zum Abspeichern des Essensplans in der Datenbank
    await Mealplan.create({
      calendar_week_year: calendar_week_year, // Kombination aus Jahr und Kalenderwoche
      dish_names: dishes
    });

    res.status(201).send('Essensplan wurde erfolgreich hinzugefügt.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Hinzufügen des Essensplans.');
  }
});

// Abrufen eines gespeicherten Essensplans anhand des von calendar_week_year
app.get('/api/MealPlans/:calendar_week_year', async (req, res) => {
  try {
    const calendar_week_year = req.params.calendar_week_year;

    // Code zum Abrufen des Essensplans aus der Datenbank anhand des Werts von calendar_week_year
    const mealplan = await Mealplan.findOne({
      where: {
        calendar_week_year: calendar_week_year
      }
    });

    // Falls kein Essensplan gefunden wurde, wird 404 zurückgegeben
    // Falls ein Essensplan gefunden wurde, wird dieser als JSON-Antwort zurückgegeben und der Statuscode 200 gesetzt
    if (mealplan === null) {
      res.status(404).json({ message: 'Es wurde kein Essensplan gefunden.' });
      console.log('Es wurde kein Essensplan gefunden.');
      return;
    }

    res.status(200).json(mealplan);
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen des Essensplans');
  }
});

// API-Endpunkt zum Abrufen des maximalen calendar_week_year
app.get('/api/MealPlans/byCalendarYear/max', async (req, res) => {
  // Rückgabe: calendar_week_year in der Form YYYYWW
  try {
    // Ermittle den Mealplan mit dem größten calendar_week_year
    // Code zum Abrufen des Essensplans aus der Datenbank anhand des Werts von calendar_week_year
    const mealplanLast = await Mealplan.findOne({
      order: [
        ['calendar_week_year', 'DESC']
      ],
      raw: true // Fehlender Aufruf für die Rückgabe als einfaches JSON-Objekt
    });

    // Falls kein Essensplan gefunden wurde, wird 404 zurückgegeben
    // Falls ein Essensplan gefunden wurde, wird dieser als JSON-Antwort zurückgegeben und der Statuscode 200 gesetzt
    if (mealplanLast === null) {
      res.status(404).json({ message: 'Es wurde kein Essensplan gefunden.' });
      console.log('Es wurde kein Essensplan gefunden.');
      return;
    }

    console.log("Es wurde ein Essensplan gefunden. Datentypprüfung: " + typeof mealplanLast + ". Inhalt: " + mealplanLast);
    // es soll nur die calendar_week_year zurückgegeben werden
    res.status(200).json(mealplanLast.calendar_week_year);
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen des Essensplans');
  }
});

// API-Endpunkt zum Abrufen des minimalen calendar_week_year
app.get('/api/MealPlans/byCalendarYear/min', async (req, res) => {
  // Rückgabe: calendar_week_year in der Form YYYYWW
  try {
    // Ermittle den Mealplan mit dem kleinsten calendar_week_year
    // Code zum Abrufen des Essensplans aus der Datenbank anhand des Werts von calendar_week_year
    const mealplanFirst = await Mealplan.findOne({
      order: [
        ['calendar_week_year', 'ASC']
      ],
      raw: true // Fehlender Aufruf für die Rückgabe als einfaches JSON-Objekt
    });

    // Falls kein Essensplan gefunden wurde, wird 404 zurückgegeben
    // Falls ein Essensplan gefunden wurde, wird dieser als JSON-Antwort zurückgegeben und der Statuscode 200 gesetzt
    if (mealplanFirst === null) {
      res.status(404).json({ message: 'Es wurde kein Essensplan gefunden.' });
      console.log('Es wurde kein Essensplan gefunden.');
      return;
    }

    console.log("Es wurde ein Essensplan gefunden. Datentypprüfung: " + typeof mealplanFirst + ". Inhalt: " + mealplanFirst);
    // es soll nur die calendar_week_year zurückgegeben werden
    res.status(200).json(mealplanFirst.calendar_week_year);
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen des Essensplans');
  }
});




// Löschen eines gespeicherten Essensplans anhand des Jahres und der Kalenderwoche
app.delete('/api/MealPlans/:year/:week', async (req, res) => {
  try {
    const year = req.params.year;
    const week = req.params.week;

    // Code zum Löschen des Essensplans aus der Datenbank anhand des Jahres und der Kalenderwoche
    await Mealplan.destroy({
      where: {
        year: year,
        week: week
      }
    });

    res.status(200).send('Essensplan wurde erfolgreich gelöscht.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Löschen des Essensplans.');
  }
});

// API-Endpunkt zum Abrufen einer calendar_week_year im Format YYYYWW für ein gespeichertes Mealplans nach einem Mealplan mit angegebenem calendar_week_year
// Funktion: Übernimmt ein calendar_week_year und gibt die nächste calendar_week_year zurück, für die ein Mealplan gespeichert ist
// Sollte nach dem angegebenen calendar_week_year kein Mealplan gespeichert sein, wird null zurückgegeben
app.get('/api/MealPlans/next/:calendar_week_year', async (req, res) => {
  try {
    const calendar_week_year = req.params.calendar_week_year;

    const mealplanNext = await Mealplan.findOne({
      where: {
        calendar_week_year: {
          [Sequelize.Op.gt]: calendar_week_year
        }
      },
      order: [
        ['calendar_week_year', 'ASC']
      ]
    });

    if (!mealplanNext) {
      res.status(404).json({ message: 'Es wurde kein Essensplan gefunden.' });
      console.log('Es wurde kein Essensplan gefunden.');
      return;
    }

    console.log("Es wurde ein Essensplan gefunden. Datentypprüfung: " + typeof mealplanNext + ". Inhalt: " + mealplanNext);
    res.status(200).json(mealplanNext.calendar_week_year);
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen des Essensplans');
  }
});

// API-Endpunkt zum Abrufen einer calendar_week_year im Format YYYYWW für ein gespeichertes Mealplans vor einem Mealplan mit angegebenem calendar_week_year
app.get('/api/MealPlans/previous/:calendar_week_year', async (req, res) => {
  try {
    const calendar_week_year = req.params.calendar_week_year;

    const mealplanPrevious = await Mealplan.findOne({
      where: {
        calendar_week_year: {
          [Sequelize.Op.lt]: calendar_week_year
        }
      },
      order: [
        ['calendar_week_year', 'DESC']
      ]
    });

    if (!mealplanPrevious) {
      res.status(404).json({ message: 'Es wurde kein Essensplan gefunden.' });
      console.log('Es wurde kein Essensplan gefunden.');
      return;
    }

    console.log("Es wurde ein Essensplan gefunden. Datentypprüfung: " + typeof mealplanPrevious + ". Inhalt: " + mealplanPrevious);
    res.status(200).json(mealplanPrevious.calendar_week_year);
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen des Essensplans');
  }
});







// API-Endpunkt zum Hinzufügen eines neuen Gerichts
app.post('/api/dishes', async (req, res) => {
  try {
    const { name, ingredients } = req.body;

    // Code zum Hinzufügen des Gerichts in der Datenbank
    await Dish.create({
      name: name,
      ingredients: ingredients.join(', '), // Falls die Zutaten als Array gespeichert werden
    });

    res.status(201).send('Gericht wurde erfolgreich hinzugefügt.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Hinzufügen des Gerichts.');
  }
});

// API-Endpunkt zum Abrufen aller gespeicherten Gerichte
app.get('/api/dishes', async (req, res) => {
  try {
    const dishes = await Dish.findAll(); // Abrufen aller Gerichte aus der Datenbank
    res.json(dishes); // Senden der Gerichte als JSON-Antwort
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen der Gerichte');
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // Passe den Pfad an den Speicherort deiner index.html-Datei an
});

// API-Endpunkt zum Löschen eines Gerichts anhand seiner ID
app.delete('/api/dishes/:id', async (req, res) => {
  try {
    const dishId = req.params.id;

    // Code zum Löschen des Gerichts aus der Datenbank anhand seiner ID
    await Dish.destroy({
      where: {
        id: dishId
      }
    });

    res.status(200).send('Gericht wurde erfolgreich gelöscht.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Löschen des Gerichts.');
  }
});

// API-Endpunkt zum Abrufen aller unterschiedlichen Zutaten
app.get('/api/ingredients', async (req, res) => {
  try {
    const dishes = await Dish.findAll();

    // Extrahieren und aufteilen der Zutaten aus den Gerichten
    const uniqueIngredients = new Set(); // Verwenden Sie ein Set, um doppelte Zutaten zu verhindern

    dishes.forEach((dish) => {
      const dishIngredients = dish.ingredients.split(',').map((ingredient) => ingredient.trim());
      dishIngredients.forEach((ingredient) => {
        uniqueIngredients.add(ingredient);
      });
    });

    res.json(Array.from(uniqueIngredients));
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen der Zutaten');
  }
});

// API-Endpunkt zum Abrufen eines Gerichts anhand seines Namens
app.get('/api/dishes/:name', async (req, res) => {
  try {
    const dishName = req.params.name;

    // Code zum Abrufen des Gerichts aus der Datenbank anhand seines Namens
    const dish = await Dish.findOne({
      where: {
        name: dishName
      }
    });

    // Falls kein Gericht gefunden wurde, wird 404 zurückgegeben
    // Falls ein Gericht gefunden wurde, wird dieses als JSON-Antwort zurückgegeben und der Statuscode 200 gesetzt
    if (dish === null) {
      res.status(404).json({ message: 'Es wurde kein Gericht gefunden.' });
      console.log('Es wurde kein Gericht gefunden.');
      return;
    }

    res.status(200).json(dish);
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen des Gerichts');
  }
});



// Weitere API-Endpunkte für deine Anwendung...

// Server starten
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Der Server läuft auf Port ${port}`);
    // klickbare Ausgabe des Links zum Öffnen der Anwendung im Browser
    console.log(`http://localhost:${port}`);
  });
});


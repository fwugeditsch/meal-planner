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



// Weitere API-Endpunkte für deine Anwendung...

// Server starten
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Der Server läuft auf Port ${port}`);
    // klickbare Ausgabe des Links zum Öffnen der Anwendung im Browser
    console.log(`http://localhost:${port}`);
  });
});


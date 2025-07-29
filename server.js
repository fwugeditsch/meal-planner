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
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING
  },
  ingredients: {
    type: Sequelize.STRING
  },
  is_deleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  deleted_at: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, {
  timestamps: false, // Deaktiviere die Verwendung von Timestamp-Spalten
  paranoid: false // Wir handhaben Soft Delete manuell
});

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
  timestamps: false // Deaktiviere die Verwendung von Timestamp-Spalten
});

// Section für das Modell des Essensplans

// Abspeichern eines generierten Essensplans mit Jahr, Kalenderwoche und IDs der Gerichte
app.post('/api/MealPlans', async (req, res) => {
  console.log(req.body);
  try {
    const {calendar_week_year, dishes } = req.body;

    // Prüfen, ob bereits ein Essensplan für diese Woche existiert
    const existingMealplan = await Mealplan.findOne({
      where: {
        calendar_week_year: calendar_week_year
      }
    });

    if (existingMealplan) {
      // Aktualisiere den bestehenden Essensplan
      await Mealplan.update(
        { dish_names: dishes },
        { where: { calendar_week_year: calendar_week_year } }
      );
      res.status(200).send('Essensplan wurde erfolgreich aktualisiert.');
    } else {
      // Erstelle einen neuen Essensplan
      await Mealplan.create({
        calendar_week_year: calendar_week_year, // Kombination aus Jahr und Kalenderwoche
        dish_names: dishes
      });
      res.status(201).send('Essensplan wurde erfolgreich hinzugefügt.');
    }
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
app.get('/api/MealPlans/calendarYear/max', async (req, res) => {
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
app.get('/api/MealPlans/calendarYear/min', async (req, res) => {
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

    // calendar_week_year wird als Kombination aus Jahr und Kalenderwoche gebildet, z.B. 202301 für Jahr 2023 und Woche 1
    const calendar_week_year = parseInt(`${year}${week.toString().padStart(2, '0')}`);

    // Code zum Löschen des Essensplans aus der Datenbank anhand von calendar_week_year
    await Mealplan.destroy({
      where: {
        calendar_week_year: calendar_week_year
      }
    });

    res.status(200).send('Essensplan wurde erfolgreich gelöscht.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Löschen des Essensplans.');
  }
});
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
      ],
      raw: true // Wichtig: Gibt einfaches JSON-Objekt zurück
    });

    if (!mealplanNext) {
      res.status(404).json({ message: 'Es wurde kein Essensplan gefunden.' });
      console.log('Es wurde kein Essensplan gefunden.');
      return;
    }

    console.log("Es wurde ein Essensplan gefunden. Datentypprüfung: " + typeof mealplanNext + ". Inhalt: " + JSON.stringify(mealplanNext));
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
      ],
      raw: true // Wichtig: Gibt einfaches JSON-Objekt zurück
    });

    if (!mealplanPrevious) {
      res.status(404).json({ message: 'Es wurde kein Essensplan gefunden.' });
      console.log('Es wurde kein Essensplan gefunden.');
      return;
    }

    console.log("Es wurde ein Essensplan gefunden. Datentypprüfung: " + typeof mealplanPrevious + ". Inhalt: " + JSON.stringify(mealplanPrevious));
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
    // Prüfe, ob ingredients ein Array ist, ansonsten als String behandeln
    let ingredientsString;
    if (Array.isArray(ingredients)) {
      ingredientsString = ingredients.join(', ');
    } else if (typeof ingredients === 'string') {
      ingredientsString = ingredients;
    } else {
      ingredientsString = '';
    }

    await Dish.create({
      name: name,
      ingredients: ingredientsString,
    });

    res.status(201).send('Gericht wurde erfolgreich hinzugefügt.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Hinzufügen des Gerichts.');
  }
});
// (Hinweis: Die Funktionalität zum Abrufen aller Gerichte ist jetzt im /api/dishes-Handler mit Query-Parameter enthalten)
// API-Endpunkt zum Abrufen aller gespeicherten Gerichte (nur aktive)
app.get('/api/dishes', async (req, res) => {
  try {
    const includeDeleted = req.query.include_deleted === 'true';
    
    const whereClause = includeDeleted ? {} : { is_deleted: false };
    const dishes = await Dish.findAll({ 
      where: whereClause,
      order: [['name', 'ASC']]
    });
    
    res.json(dishes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen der Gerichte');
  }
});

// API-Endpunkt zum Abrufen eines spezifischen Gerichts anhand des Namens (inkl. gelöschte)
app.get('/api/dishes/:name', async (req, res) => {
  try {
    // URL-decode den Gerichtsnamen
    const dishName = decodeURIComponent(req.params.name);
    console.log(`Suche nach Gericht: "${dishName}"`);
    
    // Suche auch in gelöschten Gerichten für Essensplan-Kompatibilität
    const dish = await Dish.findOne({
      where: {
        name: dishName
        // Keine is_deleted Filterung hier - wir brauchen auch gelöschte für bestehende Pläne
      }
    });
    
    if (!dish) {
      console.log(`Gericht "${dishName}" nicht gefunden.`);
      res.status(404).json({ message: 'Gericht nicht gefunden.' });
      return;
    }
    
    // Markiere gelöschte Gerichte in der Antwort
    const response = {
      ...dish.toJSON(),
      is_deleted: dish.is_deleted || false
    };
    
    console.log(`Gericht "${dishName}" gefunden (${dish.is_deleted ? 'gelöscht' : 'aktiv'}).`);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen des Gerichts');
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // Passe den Pfad an den Speicherort deiner index.html-Datei an
});

// API-Endpunkt zum "Löschen" eines Gerichts (Soft Delete mit Referenz-Prüfung)
app.delete('/api/dishes/:id', async (req, res) => {
  try {
    const dishId = req.params.id;

    // Gericht finden um den Namen zu bekommen
    const dish = await Dish.findByPk(dishId);
    if (!dish) {
      return res.status(404).send('Gericht nicht gefunden.');
    }

    // Prüfe, ob das Gericht in Essensplänen verwendet wird (nach Name, nicht ID)
    const allMealPlans = await MealPlan.findAll();
    const referencingMealPlans = allMealPlans.filter(mealPlan => {
      const dishNames = mealPlan.dish_names.split(',').map(name => name.trim());
      return dishNames.includes(dish.name);
    });

    if (referencingMealPlans.length > 0) {
      const weekYears = referencingMealPlans.map(mp => mp.calendar_week_year).join(', ');
      return res.status(400).json({ 
        error: `Das Gericht "${dish.name}" kann nicht gelöscht werden, da es in ${referencingMealPlans.length} Essensplan(en) verwendet wird (Wochen: ${weekYears}). Bitte entfernen Sie es zuerst aus allen Essensplänen.`,
        affected_mealplans: referencingMealPlans.length,
        weeks: weekYears
      });
    }

    // Soft Delete durchführen
    const result = await Dish.update(
      { 
        is_deleted: true,
        deleted_at: new Date()
      },
      { 
        where: { id: dishId } 
      }
    );

    if (result[0] === 0) {
      res.status(404).send('Gericht nicht gefunden.');
      return;
    }

    res.status(200).send('Gericht wurde erfolgreich gelöscht.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Löschen des Gerichts.');
  }
});

// Neuer Endpunkt für hartes Löschen (nur für Administratoren)
app.delete('/api/dishes/:id/hard', async (req, res) => {
  try {
    const dishId = req.params.id;

    // Prüfe auf verwendete Essenspläne
    const mealplansWithDish = await Mealplan.findAll({
      where: {
        dish_names: {
          [Sequelize.Op.like]: `%${dishId}%`
        }
      }
    });

    if (mealplansWithDish.length > 0) {
      res.status(409).json({
        error: 'Gericht kann nicht gelöscht werden.',
        message: `Das Gericht wird noch in ${mealplansWithDish.length} Essensplan(en) verwendet.`,
        affected_mealplans: mealplansWithDish.map(mp => mp.calendar_week_year)
      });
      return;
    }

    // Hartes Löschen nur wenn keine Referenzen existieren
    await Dish.destroy({
      where: { id: dishId }
    });

    res.status(200).send('Gericht wurde permanent gelöscht.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim permanenten Löschen des Gerichts.');
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
        if (ingredient) uniqueIngredients.add(ingredient);
      });
    });

    res.status(200).json(Array.from(uniqueIngredients));
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen der Zutaten');
  }
});

// Server starten
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Der Server läuft auf Port ${port}`);
    // klickbare Ausgabe des Links zum Öffnen der Anwendung im Browser
    console.log(`http://localhost:${port}`);
  });
});

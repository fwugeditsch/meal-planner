const express = require('express');
const app = express();
const port = 3000;

// Importiere das ORM und die Datenbankverbindung (z.B., Sequelize oder Mongoose)

// Middleware für JSON-Anfragen
app.use(express.json());

// API-Endpunkt zum Hinzufügen eines neuen Gerichts
app.post('/api/dishes', async (req, res) => {
  try {
    // Code zum Hinzufügen des Gerichts in der Datenbank
    // Beispiel: await Dish.create(req.body);
    res.status(201).send('Gericht wurde hinzugefügt');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Hinzufügen des Gerichts');
  }
});

// API-Endpunkt zum Abrufen aller Gerichte
app.get('/api/dishes', async (req, res) => {
  try {
    // Code zum Abrufen aller Gerichte aus der Datenbank
    // Beispiel: const dishes = await Dish.findAll();
    res.json(dishes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen der Gerichte');
  }
});

// API-Endpunkt zum Aktualisieren eines Gerichts
app.put('/api/dishes/:id', async (req, res) => {
  try {
    // Code zum Aktualisieren des Gerichts in der Datenbank
    // Beispiel: await Dish.update(req.body, { where: { id: req.params.id } });
    res.send('Gericht wurde aktualisiert');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Aktualisieren des Gerichts');
  }
});

// API-Endpunkt zum Löschen eines Gerichts
app.delete('/api/dishes/:id', async (req, res) => {
  try {
    // Code zum Löschen des Gerichts aus der Datenbank
    // Beispiel: await Dish.destroy({ where: { id: req.params.id } });
    res.send('Gericht wurde gelöscht');
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Löschen des Gerichts');
  }
});

// Server starten
app.listen(port, () => {
  console.log(`Der Server läuft auf Port ${port}`);
});

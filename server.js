const express = require('express');
const app = express();
const port = 3000;

// Statische Dateien aus dem aktuellen Verzeichnis bereitstellen
app.use(express.static(__dirname));

// Server starten
app.listen(port, () => {
  console.log(`Der Server läuft auf Port ${port}`);
});


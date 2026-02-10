const express = require('express');
const path = require('path');

const app = express();
const PORT = 4000;

// Serve shell app
app.use(express.static(path.join(__dirname, 'shell-app')));

// Serve Angular 14 MFE dist
app.use('/mfe/angular14', express.static(
  path.join(__dirname, 'mfe-angular14', 'dist', 'mfe-angular14')
));

// Serve Angular 20 MFE dist (note: output is in browser/ subdirectory)
app.use('/mfe/angular20', express.static(
  path.join(__dirname, 'mfe-angular20', 'dist', 'mfe-angular20', 'browser')
));

// Fallback to shell index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'shell-app', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Microfrontend demo server running at http://localhost:${PORT}/`);
});

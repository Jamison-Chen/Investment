const open = require('open');
const express = require("express");
const path = require("path");
const {
    exec
} = require('child_process')
const app = express();
const router = express.Router();
const PORT = 5000;

app.use('/', router);

// makes all the static files loadable whithin html files
app.use("/", express.static("./frontend"));

router.get('/recorder', function (req, res) {
    res.sendFile(path.join(__dirname + '/frontend/recorder/index.html'));
});

app.listen(PORT);

// run the backend server
exec("cd backend/investment & python manage.py runserver");

// opens the url in the default browser
setTimeout(() => {
    open(`http://localhost:${PORT}/recorder/`)
}, 1500); // wait 1500ms for the backend server to be fully prepared
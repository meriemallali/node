// The index.js file of mysmarthome app

//express module handles http requests and responses in the web server program
const express = require("express");
var http = require("http"); //to load the http module and store the returned HTTP
const path = require('path'); // to extract the file name from a path
const bodyParser = require("body-parser"); //to access req.body in post requests
const app = express();
const mysql = require("mysql");


const port = 8089;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
// app.set("views",__dirname + "/views");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  // password: "mysql123",
  database: "smarthome",
  multipleStatements: true,
});


// connect to database
db.connect((err) => {
  if (err) {
    console.error("error connecting to the database :", err);
  }
  else {
    console.log("Connected to database");
  }
});
global.db = db;
require("./routes/main")(app);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.listen(port, () => console.log(`mySmartHome app listening on port ${port}!`));


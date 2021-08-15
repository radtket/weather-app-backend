require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const weather = require("./routes/weather");

const app = express();

app.use(bodyParser.json());

app.get("/weather", weather);

app.listen(5000, () => console.log("Server is up on port 5000."));

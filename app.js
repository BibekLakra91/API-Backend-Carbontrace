require("dotenv").config();

const express = require("express");
const app = express();
var cors = require("cors");
const bodyParser = require("body-parser");

const port = 5001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use("/uploads", express.static("uploads"));
require("./config/database");

app.use("/admin", require("./routes/admin"));
app.use("/client", require("./routes/client"));
// app.use('/client',require('./routes/client'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// import express, cors, and environment variables
const express = require("express");
const cors = require("cors");

require("dotenv").config();

const PORT = process.env.PORT || 3000;

// init express
const app = express();

// enable cors
app.use(cors());

// routes
app.use("/api/search/", require("./routes/searchresults.js"));

// handle production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(`${__dirname}/public`));
}
    
app.listen(PORT, () => console.log(`app has started on port: ${PORT}`));
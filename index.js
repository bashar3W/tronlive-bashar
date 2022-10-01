const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;

// internal export
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const publicRoutes = require('./routes/publicRoutes/index');
const commonRoutes = require('./routes/commonRoutes/index');
const privateRoutes = require('./routes/privateRoutes/index');
const secureRoutes = require('./routes/secureRoutes/index');
const { UpdateRoi } = require('./config/updateRoi');

const app = express();
require('dotenv').config();
const corsOptions = {
    origin: ["https://tronlive.club", "http://localhost:3000"],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

app.use(cors(corsOptions))
// app.use(cors());
app.use(express.json());

// connect with database
connectDB();

// folder structred
app.use("/public/api", publicRoutes);
app.use("/api", commonRoutes);
app.use("/private/api", privateRoutes);
app.use("/secure/api", secureRoutes);

// schedule
UpdateRoi();

// base API
app.get('/', (req, res)=>{
    res.header("Access-Control-Allow-Origin", "https://tronlive-club.herokuapp.com");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.send('Hello Client...!');

})


// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(port, ()=>{
    console.log('Server is runing at port ', port);
})
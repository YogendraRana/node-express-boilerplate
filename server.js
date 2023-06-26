import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser';

// imports
import { connectdb } from './config/database.js';

// import middleware
import ErrorMiddleware from './middleware/errorMiddleware.js';

// dov env
dotenv.config({path: '.env'});

// express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors())
app.use(express.urlencoded({ extended: true }));


// configuration
connectdb();

// port
const PORT = process.env.PORT || 8000;

// listen
app.listen(PORT, () => console.log(`Listening on port number ${PORT}`));

// error middleware
app.use(ErrorMiddleware);
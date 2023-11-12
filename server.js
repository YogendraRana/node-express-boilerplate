import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser';
import { connectdb } from './config/database.js';
import { corsOptions } from './config/corsOptions.js';
import { credentials } from './middlewares/credentialsMiddleware.js';

// import middleware
import ErrorMiddleware from './middlewares/errorMiddleware.js';

// import routes
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

// dov env
dotenv.config({path: '.env'});

// express app
const app = express();

// middlewares
app.use(credentials)
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: true }));

// configuration
connectdb();

// port
const PORT = process.env.PORT || 8000;

// listen
app.listen(PORT, () => console.log(`Listening on port number ${PORT}`));

// routes
app.use("/api/v1", authRoutes)
app.use("/api/v1", adminRoutes)

// error middleware
app.use(ErrorMiddleware);
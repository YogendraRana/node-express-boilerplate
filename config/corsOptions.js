import { allowedOrigins } from "./allowedOrigins.js"

export const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error("Origin not allowed by CORS"))
        }
    },
    optionsSuccessStatus: 200,
}
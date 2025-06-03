const express = require("express");
const fileUpload = require("express-fileupload");
const specimensRouter = require("./routes/specimens.js");
const authRouter = require("./routes/auth.js");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
require("dotenv").config();
dotenv.config(); // load environment variables

const app = express();
const PORT = process.env.PORT || 8080;

//allow cross origin script requests for all routes (for development purposes)
app.use(
    cors({
        origin: "*",
    })
);

// middleware: log requests to the console
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
// app.use(fileUpload({ useTempFiles: true })); // Enable file uploads

// TODO: host any and all images and svg via cloudinary

// serve the uploads folder statically at /uploads
// app.use("/uploads", express.static("../uploads"));

// serve the svg folder statically at /svg
// app.use("/svg", express.static("../svg"));

// routes
app.use("/api/specimens", specimensRouter);
app.use("/api", authRouter);

// connect to db
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        // listen for requests
        app.listen(PORT, () => {
            console.log("MongoDB connected successfully!");
            console.log(`listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(error);
    });

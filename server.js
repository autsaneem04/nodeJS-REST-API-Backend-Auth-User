const express = require("express");
const app = express();
const port = 5000;
const fontend_port = 3000;
const { readdirSync } = require("fs");

const usersRouter = require("./routes/users");
const autRouter = require("./routes/auth");

const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");

const { db } = require("./config/conn");

const cookieParser = require("cookie-parser");

db();
app.use(morgan("dev"));

app.use(bodyParser.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
    cors({
        origin: `http://localhost:${fontend_port}`,
        credentials: true,
    }),
);

// =================== routes 1 ===================
// app.get('/users', (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: 'Users retrieved successfully',
//         data: [
//             { id: 1, name: 'John Doe', email: 'john.doe@example.com' }
//         ]
//     });
// });

// =================== routes 2 ===================

// app.use('/api', usersRouter);
// app.use('/api', autRouter);

// =================== routes 3 ===================

readdirSync("./routes").map((file) => {
    //console.log(file);
    app.use("/api", require("./routes/" + file));
});

app.listen(port, () => {
    console.log(`Server is running  http://localhost:${port}`);
});

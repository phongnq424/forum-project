const dotenv = require("dotenv");
dotenv.config({ quiet: true });

const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const routes = require("./routes/index.js");

const http = require("http");
const { initSocket } = require("./socket");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);

const port = process.env.PORT || 3000;
const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
const dotenv = require("dotenv");
dotenv.config({ quiet: true });

const express = require("express");
const cors = require("cors");
const routes = require("./routes/index.js");

const http = require("http");
const { initSocket } = require("./socket");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

const port = process.env.PORT || 3000;
const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
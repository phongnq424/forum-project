const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const routes = require("./routes/index.js")

dotenv.config({ quiet: true })
const app = express()

app.use(cors())
app.use(express.json())

app.use("/api", routes)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`)
})


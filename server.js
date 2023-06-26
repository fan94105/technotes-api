require("dotenv").config()
const express = require("express")
const app = express()
const path = require("path")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const mongoose = require("mongoose")
require("express-async-errors")

const { logger, logEvent } = require("./middleware/logger")
const errorHandler = require("./middleware/errorHandler")
const corsOptions = require("./config/corsOptions")
const connectDB = require("./config/dbConnection")

const PORT = process.env.PORT || 3500

// 連接資料庫
connectDB()

// 啟用 logger middleware
app.use(logger)

// 啟用 cors
app.use(cors(corsOptions))

// 解析 json
app.use(express.json())

// 啟用 cookie-parser
app.use(cookieParser())

// 提供靜態頁面
app.use("/", express.static(path.join(__dirname, "/public")))

app.use("/", require("./routes/root"))

// Routers
app.use("/auth", require("./routes/authRoutes"))
app.use("/users", require("./routes/userRoutes"))
app.use("/notes", require("./routes/noteRoutes"))

// 接收未知 url，並回應 404 頁面
app.all("*", (req, res) => {
  res.status(404)
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"))
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" })
  } else {
    res.type("txt").send("404 Not Found")
  }
})

app.use(errorHandler)

// MongoDB 連接成功
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB")
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})

// MongoDB 連接失敗
mongoose.connection.once("error", (err) => {
  console.log(err)
  logEvent(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  )
})

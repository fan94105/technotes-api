const { format } = require("date-fns")
const { v4: uuid } = require("uuid")
const fs = require("fs")
const fsPromises = require("fs").promises
const path = require("path")

const logEvent = async (message, logFileName) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss")
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`

  try {
    // 若 logs 檔案不存在，則創建 logs
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"))
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    )
  } catch (err) {
    console.log(err)
  }
}

const logger = (req, res, next) => {
  logEvent(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log")
  next()
}

module.exports = {
  logEvent,
  logger,
}

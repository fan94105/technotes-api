const rateLimit = require("express-rate-limit")

const { logEvent } = require("./logger")

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 請求時間範圍
  max: 5, // 指定時間範圍內的請求數量
  message: {
    message:
      "Too many login attempts from this IP, please try again after a 60 second pause",
  },
  handler: (req, res, next, options) => {
    logEvent(
      `Too Many Request: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errLog.log"
    )
    res.status(options.statusCode).send(options.message)
  },
  standardHeaders: true, // 在 headers 的 RateLimit-* 中包含 rate limit 資訊
  legacyHeaders: false, // 禁用 X-RateLimit-* headers
})

module.exports = loginLimiter

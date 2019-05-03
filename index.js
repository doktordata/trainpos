require("dotenv").config()
const express = require("express")
const path = require("path")
const HttpsProxyAgent = require("https-proxy-agent")
const url = require("url")
const WebSocket = require("ws")
const { createServer } = require("http")
const nmea = require("nmea-0183")

const proxy = url.parse(process.env.PROXY_URL)
const endpoint = `wss://api.oxyfi.com/trainpos/listen?v=1&key=${
  process.env.API_KEY
}`
const agent = new HttpsProxyAgent(proxy)
const trainPosSocket = new WebSocket(endpoint, { agent })
const app = express()
app.use(express.static(path.join(__dirname, "/public")))

const server = createServer(app)
const wss = new WebSocket.Server({ server })

function decodeGPGGASentence(sentence) {
  const trainId = sentence.split(",").slice(-4)[0]
  return {
    ...nmea.parse(sentence),
    trainId
  }
}

wss.on("connection", socket => {
  const uniqueTrains = [] // Get unique train ids to render markers for
  trainPosSocket.on("message", data => {
    const decodedSentence = JSON.stringify(decodeGPGGASentence(data))
    socket.send(decodedSentence)
  })
})

server.listen(8080, () => console.log("Listening on http://localhost:8080"))

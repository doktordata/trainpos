require("dotenv").config()
const HttpsProxyAgent = require("https-proxy-agent")
const url = require("url")
const WebSocket = require("ws")
const nmea = require("nmea-0183")

const proxy = url.parse(process.env.PROXY_URL)
const endpoint = `wss://api.oxyfi.com/trainpos/listen?v=1&key=${
  process.env.API_KEY
}`
const agent = new HttpsProxyAgent(proxy)
const socket = new WebSocket(endpoint, { agent })

function decodeGPGGASentence(sentence) {
  return nmea.parse(sentence)
}

socket.on("message", data => console.log("data ->", decodeGPGGASentence(data)))

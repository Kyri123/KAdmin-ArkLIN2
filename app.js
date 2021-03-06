/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"
global.fs                             = require('fs')
global.pathMod                        = require('path')
global.util                           = require('util')
global.dateFormat                     = require('dateformat')

// überschreibe console.log
let logDir          = pathMod.join(__dirname, "latest_logs")
let logFile         = pathMod.join(logDir, "current.log")

// erstelle Log ordner & file (Überschreibe Console.log())
if(fs.existsSync(logDir)) fs.rmSync(logDir, {recursive: true})
fs.mkdirSync(logDir)
fs.writeFileSync(logFile, "")

let logStream = fs.createWriteStream(logFile, {flags : 'w'});
let logStdout = process.stdout;

console.log = function() {
  logStdout.write(util.format(...arguments) + '\n')

  for(let i in arguments) {
    if(typeof arguments[i] === "string") arguments[i] = arguments[i]
       .replaceAll('%s\x1b[0m', '')
       .replaceAll('\x1b[30m', '')
       .replaceAll('\x1b[31m', '')
       .replaceAll('\x1b[32m', '')
       .replaceAll('\x1b[33m', '')
       .replaceAll('\x1b[34m', '')
       .replaceAll('\x1b[35m', '')
       .replaceAll('\x1b[36m', '')
  }

  logStream.write(util.format(...arguments) + '\n', () => logStream.emit("write"))
}

// Prüfe NodeJS version
if(parseInt(process.version.replaceAll(/[^0-9]/g, '')) < 1560) {
  console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[31m NodeJS Version not supported (min 15.6.0)`)
  console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[31m Exit KAdmin-ArkLIN2`)
  process.exit(1)
}

// Prüfe OS
if(process.platform === "win32") {
  console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[31m OS is Windows or not supported`)
  console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[31m Exit KAdmin-ArkLIN2`)
  process.exit(1)
}

const createError                     = require('http-errors')
const http                            = require('http')
const cors                            = require('cors')
const express                         = require('express')
const session                         = require('express-session')
const fileupload                      = require('express-fileupload')
const bodyParser                      = require('body-parser')
const cookieParser                    = require('cookie-parser')
const logger                          = require('morgan')
const uuid                            = require('uuid')
const helmet                          = require("helmet")
const compression                     = require("compression")
const backgroundRunner                = require('./app/src/background/backgroundRunner')
const syncRequest                     = require('sync-request')
global.userHelper                     = require('./app/src/sessions/helper')
global.mainDir                        = __dirname
global.ip                             = require('ip')
global.md5                            = require('md5')
global.htmlspecialchars               = require('htmlspecialchars')
global.mysql                          = require('mysql')
//global.mode                         = "dev"
global.buildID                        = fs.readFileSync(pathMod.join(mainDir, "build"), 'utf-8')
global.panelVersion                   = "0.0.1"
global.globalUtil                     = require('./app/src/util')
global.Installed                      = true
global.serverClass                    = require('./app/src/util_server/class')

// Modulealerter
require('./app/main/mainLoader.js')
global.alerter                        = require('./app/src/alert.js')
global.debug                          = CONFIG.app.useDebug || false

globalUtil.safeFileMkdirSync([CONFIG.app.servRoot])
globalUtil.safeFileMkdirSync([CONFIG.app.logRoot])
globalUtil.safeFileMkdirSync([CONFIG.app.pathBackup])

global.buildIDBranch                  = false
try {
  global.buildIDBranch = Buffer.from(JSON.parse(syncRequest('GET', `https://api.github.com/repos/Kyri123/KAdmin-ArkLIN2/contents/build?ref=${CONFIG.updater.useBranch}`, {
    headers: {
      'user-agent': 'KAdmin-ArkLIN2',
    },
  }).getBody().toString()).content, 'base64').toString('utf-8')
} catch (e) {
  global.buildIDBranch = false
}
global.isUpdate                       = buildID !== buildIDBranch
global.isUpdating                     = false
global.needRestart                    = false

require('./app/main/sqlLoader.js')
let app         = express()

// Express Konfig
  // View
  app.set('views', pathMod.join(__dirname, 'views'))
  app.set('view engine', 'ejs')

  // Statics
  app.use(express.static(pathMod.join(__dirname, 'public')))
  app.use('/serv', express.static(pathMod.join(CONFIG.app.servRoot)))
  app.use('/logs', express.static(pathMod.join(CONFIG.app.logRoot)))
  app.use('/backup', express.static(pathMod.join(CONFIG.app.pathBackup)))
  app.use('/arkmanager', express.static(pathMod.join(CONFIG.app.pathArkmanager)))
  app.use('/steam', express.static(pathMod.join(CONFIG.app.pathSteam)))
  app.use('/nodejs_logs', express.static(logDir))

  // Session
  app.use(session({
    genid: () => {
      return uuid.v4()
    },
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: true
  }))

  // andere Konfigs
  app.use(fileupload({
    createParentPath: true
  }))
  app.use(cors())
  app.use(compression())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(express.json())
  app.use(cookieParser())
  //app.use(logger(mode))

  // Hemlet
  app.use(helmet.ieNoOpen())
  app.use(helmet.noSniff())
  app.use(helmet.hidePoweredBy())

  // Routes
  // Main
  app.use(function (req, res, next) {
    if (! ('JSONResponse' in res) ) {
      return next();
    }

    res.set('Cache-Control', 'public, max-age=31557600');
    res.json(res.JSONResponse);
  })

  app.use(/*'/', require(Installed ? './routes/index' : './routes/installer/index')*/require('./routes/index'))

  // Error
  app.use(function(err, req, res, next) {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    res.status(err.status || 500)
    res.render('error')
  })

// process.env.PORT = Portuse für z.B. Plesk
let port = typeof process.env.PORT !== "undefined" ?
   parseInt(process.env.PORT, 10) : typeof CONFIG.app.port !== "undefined" ?
      parseInt(CONFIG.app.port, 10) : 80

http.globalAgent.maxSockets = Infinity;

let httpServer = http.createServer(app)
httpServer.listen(port)
   .on('listening', () => {
     console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[36m${Installed ? "" : " follow Installer here:"} http://${ip.address()}:${CONFIG.app.port}/`)
   })

backgroundRunner.startAll()
module.exports = { app, httpServer }
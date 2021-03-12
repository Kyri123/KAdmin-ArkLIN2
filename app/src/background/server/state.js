/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2019-2020, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

// require Module
const Gamedig       = require('gamedig')
const ip            = require("ip")
const findProcess   = require('find-process')
const pidusage      = require('pidusage')
const os            = require('os')
const isRunning     = require('is-running')


/**
 * Speichert Informationen in einer JSON oder in die MYSQL
 * @param {{}} data - Daten die gespeichert werden
 * @param {string} name - Bezeichung der gespeicherten Daten (bsp server)
 * @param {{}} state - Daten zusätzlich gespeichert werden sollen (array.state)
 * @param {boolean} use_state - Soll state benutzt werden?
 */
function save(data, name, state, use_state = true) {
      // Todo X.X.X Stats
      // > state > use_state
      //data.push(state)
      globalUtil.safeFileSaveSync([mainDir, '/public/json/server', `${name}.json`], JSON.stringify(data))
}

module.exports = {
    getStateFromServers: async () => {
        let serverLocalPath     = CONFIG.app.pathArkmanager + "/instances"
        let dirArray            = fs.readdirSync(serverLocalPath)
        // Scanne Instancen
        dirArray.forEach((ITEM) => {
            // Erstelle Abfrage wenn es eine .cfg Datei ist
            if (ITEM.includes(".cfg") && !ITEM.includes(".example")) {
                let file               = pathMod.join(mainDir, '/public/json/server/')
                if(!globalUtil.safeFileExsistsSync([file])) globalUtil.safeFileMkdirSync([file])
                let name               = ITEM.replace(".cfg", "")
                let serverData         = new serverClass(name)
                let data               = serverData.getServerInfos() !== false
                   ? serverData.getServerInfos()
                   : {}
                let servCFG            = serverData.getConfig()
                let servINI            = serverData.getINI()
                let serverPath         = servCFG.path

                let pidFileArkmanager  = [serverPath, '/ShooterGame/Saved', `.arkmanager-${name}.pid`]
                let pifFileServer      = [serverPath, '/ShooterGame/Saved', `.arkserver-${name}.pid`]
                let arkUpdatePidFile   = [serverPath, '/ShooterGame/Saved', `.ark-update.lock`]
                let versionFile        = [serverPath, `version.txt`]

                // Default werte
                let arkmangerProcess   = globalUtil.safeFileExsistsSync(pidFileArkmanager)
                   ? !isRunning(+globalUtil.safeFileReadSync(pidFileArkmanager))
                   : true
                let arkUpdateProcess   = globalUtil.safeFileExsistsSync(arkUpdatePidFile)
                   ? !isRunning(+globalUtil.safeFileReadSync(arkUpdatePidFile))
                   : true

                data.isFree            = arkUpdateProcess
                data.aplayers          = 0
                data.players           = 0
                data.cpuUsage          = 0
                data.memory            = 0
                data.maxmemory         = os.totalmem() / 1048576
                data.elapsed           = 0
                data.epoch             = 0
                data.listening         = false
                data.online            = false
                data.cfg               = name
                data.ServerMap         = servINI.serverMap
                data.ServerName        = servINI.ark_SessionName
                data.connect           = `steam://connect/${ip.address()}:${servCFG.query}`
                data.is_installed      = globalUtil.safeFileExsistsSync([serverPath, servINI.arkserverexec])
                data.is_installing     = !globalUtil.safeFileExsistsSync([serverPath, servINI.arkserverexec]) && globalUtil.safeFileExsistsSync([serverPath, 'steamapps'])
                data.selfname          = servCFG.selfname
                data.icon              = globalUtil.safeFileExsistsSync([mainDir, '/img/maps', `${servINI.serverMap}.jpg`])
                   ? `/img/maps/${servINI.serverMap}.jpg`
                   : "/img/logo/logo.png"
                data.isAction          = (
                    globalUtil.safeFileExsistsSync([serverPath, "backuprun"]) ||
                    globalUtil.safeFileExsistsSync([serverPath, "isplayin"])
                )

                // Runing infos
                data.run               = globalUtil.safeFileExsistsSync(pifFileServer) ? isRunning(+globalUtil.safeFileReadSync(pifFileServer)) : false
                data.steamcmd          = false
                data.cmd               = false
                data.pid               = 0
                data.ppid              = 0
                data.bin               = ''

                // BackupInfos
                let obj         = {},
                    scan        = globalUtil.safeFileReadDirSync([servCFG.pathBackup])
                obj.max         = servCFG.autoBackupMaxDirSize
                obj.maxCount    = servCFG.autoBackupMaxCount
                if(scan !== false) {
                    let fileCount = 0,
                        totalSize = 0
                    for(let item of scan) {
                        if(item.name.includes(".zip")) {
                            fileCount++
                            totalSize += item.sizebit
                        }
                    }
                    obj.maxis           = totalSize
                    obj.maxCountis      = fileCount
                }
                else {
                    obj.maxis           = 0
                    obj.maxCountis      = 0
                }

                data.backup = obj

                // More data
                data.aplayers          = 0
                data.aplayersarr       = []
                data.ping              = 0
                data.version           = globalUtil.safeFileReadSync(versionFile).toString().trim()
                if(data.version === false || data.version === "false") data.version = '???.??'

                // Alerts
                    data.alerts = []

                    // ist Server installiert
                    if(!data.is_installed)
                       data.alerts.push("3999")

                    // ist Server am installieren
                    if(data.is_installing)
                        data.alerts.push("3998")

                    // Soll server dauerhaft laufen
                    if(servCFG.shouldRun)
                        data.alerts.push("3995")

                    // Sind keine Meldungen vorhanden
                    if(data.alerts.length === 0)
                        data.alerts.push("4000")

                if(globalUtil.safeFileExsistsSync(pifFileServer)) {
                    findProcess('pid', +globalUtil.safeFileReadSync(pifFileServer))
                       .then(async function (list) {
                           if (list.length) {
                               let index = 0
                               let pid = list[index].pid
                               let ppid = list[index].ppid
                               let cmd = list[index].cmd
                               let bin = list[index].bin
                               try {
                                   let pidData = await pidusage(pid)
                                   data.cpuUsage = Math.round(pidData.cpu / os.cpus().length * 100) / 100
                                   data.memory = pidData.memory
                                   data.elapsed = pidData.elapsed
                                   data.epoch = pidData.timestamp
                               } catch (e) {

                               }


                               data.run = true
                               data.cmd = cmd
                               data.pid = pid
                               data.ppid = ppid
                               data.bin = bin

                               Gamedig.query({
                                   type: 'arkse',
                                   host: "127.0.0.1",
                                   port: servINI.ark_QueryPort
                               })
                                  .then((state) => {
                                      data.players = servINI.ark_MaxPlayers
                                      data.aplayers = state.players.length
                                      data.aplayersarr = state.players
                                      data.listening = true
                                      data.online = true
                                      data.cfg = name
                                      data.ServerName = state.name
                                      data.usePW = state.password
                                      data.version = state.name.replaceAll(/[^0-9]/g, '') / 100
                                      data.lastGameding = state

                                      // Speichern
                                      save(data, name, state)
                                  }).catch((error) => {
                                   // Speichern
                                   save(data, name, {})
                               })
                           } else {
                               // Speichern
                               save(data, name, {})
                           }
                       })
                }
                else {
                    save(data, name, {})
                }
            }
        })
    }
};
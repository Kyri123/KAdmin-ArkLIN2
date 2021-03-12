/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2020-2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

const CommandUtil           = require('./commands_util')
const serverShell           = require('./shell')

module.exports = {

   /**
    * Sendet ein Arkmanager Befehl
    * @param server {string}
    * @param para {array} Parameters
    * <br>
    * - **--alwaysstart** (Server startet immer wenn dieser NICHT läuft) <br>
    * @return {boolean}
    */
   doArkmanagerCommand: (server,action , para) => {
      let serv       = new serverClass(server)
      if(serv.serverExsists()) {
         let parameter  = Array.isArray(para) ? para : []

         if(!Array.isArray(para)) {
            Object.entries(para).forEach(value => {
               if(isNaN(+value[0])) {
                  if(value[1].trim() !== '')
                     parameter.push(`${value[0]}=\\\"${value[1]}\\\"`)
               }
               else {
                  parameter.push(value[1])
               }
            })
         }

         let info       = serv.getServerInfos()
         let serverCfg  = serv.getConfig()
         let logPath    = pathMod.join(serverCfg.pathLogs, "latest.log")

         if(info.isFree) {
            return serverShell.runSHELL(`echo "arkmanager ${action} @${server} ${parameter.join(' ')}" > ${logPath} && screen -dmS kadmin-arklin-${server} bash -c "arkmanager ${action} ${parameter.join(' ')} @${server} >> ${logPath} && exit"`)
         }
      }
      return false
   },

   /**
    * Erstellt ein Backup vom Server
    * @param server {string}
    * @param para {array} Parameters
    * @param fromPanel {bool}
    * <br>
    * - **Derzeit keine Parameter**
    */
   doBackup: function(server, para, fromPanel = true) {
      let serv       = new serverClass(server)
      if(serv.serverExsists()) {
         let servCFG          = serv.getConfig()
         let zipPath          = pathMod.join(servCFG.pathBackup, `${Date.now()}.zip`)
         let backuprun        = pathMod.join(servCFG.pathBackup, `backuprun`)
         let paths            = ['*']
         let logPath          = pathMod.join(servCFG.pathLogs, "latest.log")
         globalUtil.safeFileMkdirSync([servCFG.pathBackup])

         if(
            !globalUtil.checkValidatePath(servCFG.path) ||
            !globalUtil.checkValidatePath(servCFG.pathBackup)
         ) return false

         if(globalUtil.safeFileCreateSync([backuprun]) && paths.length !== 0) {
            // prüfe backupverzeichnis
            let checkBackupPath = function () {
            let haveRm          = false

            let maxSize   = servCFG.autoBackupMaxDirSize
            let maxCount  = servCFG.autoBackupMaxCount
            if(maxCount !== 0 || maxSize !== 0) {
               maxSize              = maxSize * 1e+6
               let backupDirInfos   = globalUtil.safeFileReadDirSync([servCFG.pathBackup])
               let totalSize        = 0
               let totalCount       = 0
               let oldestFile       = false
               for(let file of backupDirInfos) {
                  if(file.FileExt === ".zip") {
                     let backupTime = parseInt(file.namePure, 10)
                     // finde Ältestes Backup
                     if (backupTime < oldestFile || oldestFile === false)
                        oldestFile = backupTime
                     // zähle Backups
                     totalCount++
                     // erfasse TotalSize
                     totalSize += file.sizebit
                  }
               }

               if(oldestFile !== false)
                  if(
                     (maxCount !== 0 && maxCount <= totalCount) ||
                     (maxSize !== 0 && maxSize <= totalSize)
                  ) {
                     globalUtil.safeFileRmSync([servCFG.pathBackup, `${oldestFile}.zip`])
                     haveRm = true
                  }
               }

               if(haveRm) checkBackupPath()
               return true
            }

            if(checkBackupPath()) {
               serverShell.runSHELL(`cd ${servCFG.path}/ShooterGame/Saved && zip -9 -r ${zipPath} ${paths.join(" ")} ${fromPanel ? `> ${logPath}` : ''} && rm ${backuprun}`)
               return true
            }
         }

         return false
      }
   }
}
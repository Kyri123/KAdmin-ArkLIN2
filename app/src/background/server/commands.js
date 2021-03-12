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
   doArkmanagerCommand: (server, para) => {
      let serv       = new serverClass(server)
      if(serv.serverExsists()) {
         let info       = serv.getServerInfos()
         let startLine  = CommandUtil.getStartLine(server)

         if(info.pid === 0) {
            if(para.includes("--alwaysstart")) serv.writeConfig("shouldRun", true)
            return serverShell.runSHELL(startLine)
         }
      }
      return false
   },

   /**
    * Erstellt ein Backup vom Server
    * @param server {string}
    * @param para {array} Parameters
    * <br>
    * - **Derzeit keine Parameter**
    */
   doBackup: function(server, para) {
      let serv       = new serverClass(server)
      if(serv.serverExsists()) {
         let servCFG          = serv.getConfig()
         let servINI          = serv.getINI()
         let zipPath          = pathMod.join(servCFG.pathBackup, `${Date.now()}.zip`)
         let backuprun        = pathMod.join(servCFG.pathBackup, `backuprun`)
         let paths            = ['*']
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
               serverShell.runSHELL(`cd ${servCFG.path}/ShooterGame/Saved && zip -9 -r ${zipPath} ${paths.join(" ")} && rm ${backuprun}`)
               return true
            }
         }

         return false
      }
   }
}
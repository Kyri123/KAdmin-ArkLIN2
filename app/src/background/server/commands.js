/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

//const CommandUtil           = require('./commands_util')
const serverShell           = require('./shell')

module.exports = {

   /**
    * Sendet ein Arkmanager Befehl
    * @param server {string}
    * @param action {string}
    * @param para {array} Parameters
    * <br>
    * - **--alwaysstart** (Server startet immer wenn dieser NICHT läuft) <br>
    * @return {boolean}
    */
   doArkmanagerCommand: (server, action , para) => {
      let serv       = new serverClass(server)
      if(serv.serverExsists()) {
         let parameter  = Array.isArray(para) ? para : []

         if(!Array.isArray(para)) {
            Object.entries(para).forEach(value => {
               if(isNaN(+value[0])) {
                  if(value[1].trim() !== '')
                     parameter.push(`${value[0]}='${value[1]}'`)
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
            globalUtil.safeFileSaveSync([logPath], `arkmanager ${action} @${server} ${parameter.join(' ')} \n`)
            return serverShell.runSHELL(`arkmanager ${action} ${parameter.join(' ')} @${server} >> ${logPath}`)
         }
      }
      return false
   },

   /**
    * Erstellt ein Backup vom Server
    * @param server {string}
    * @param para {array} Parameters
    * @param fromPanel {boolean}
    * <br>
    * - **Derzeit keine Parameter**
    */
   doBackup: function(server, para, fromPanel = true) {
      let serv       = new serverClass(server)
      if(serv.serverExsists()) {
         let servCFG          = serv.getConfig()
         let servINI          = serv.getINI()
         let zipPath          = pathMod.join(servCFG.pathBackup, `${Date.now()}.zip`)
         let backuprun        = pathMod.join(servCFG.pathBackup, `backuprun`)
         let paths            = ['*']
         let logPath          = pathMod.join(servCFG.pathLogs, "latest.log")
         globalUtil.safeFileMkdirSync([servCFG.pathBackup])

         if(
            !globalUtil.checkValidatePath(servINI.arkserverroot) ||
            !globalUtil.checkValidatePath(servINI.arkbackupdir)
         ) return false

         if(paths.length !== 0) {
            if(fromPanel) globalUtil.safeFileCreateSync([backuprun])
            // prüfe backupverzeichnis
            let checkBackupPath = function () {
               let haveRm          = false

               let maxSize   = servCFG.autoBackupMaxDirSize
               let maxCount  = servCFG.autoBackupMaxCount
            if(maxCount !== 0 || maxSize !== 0) {
               maxSize              = maxSize * 1e+6
               let backupDirInfos   = globalUtil.safeFileReadDirSync([servINI.arkserverroot])
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
                     globalUtil.safeFileRmSync([servINI.arkserverroot, `${oldestFile}.zip`])
                     haveRm = true
                  }
               }

               if(haveRm) checkBackupPath()
               return true
            }

            if(checkBackupPath()) {
               serverShell.runSHELLInScreen(`cd ${servINI.arkserverroot}/ShooterGame/Saved && zip -9 -r ${zipPath} ${paths.join(" ")} ${fromPanel ? `> ${logPath}` : ''} ${fromPanel ? `&& rm ${backuprun}` : ''}`, `kadmin_arklin_backupsystem_${server}`)
               return true
            }
         }

         return false
      }
   }
}
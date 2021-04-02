/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

const { array_replace_recursive }   = require('locutus/php/array')
const ini                           = require('ini')

/**
 * Informationen für einen Server
 */
module.exports = class serverClass {

   /**
    * Inizallisiert einen Server
    * @param {string} servername
    */
   constructor(servername) {
      // Erstelle this Vars
      this.exsists            = false
      this.isClusterReaded    = false
      this.server             = servername
      this.cfgPath            = [mainDir, '/app/json/server/', `${this.server}.json`]
      this.defaultCfgPath     = [mainDir, '/app/json/server/template/', `default.json`]
      this.serverInfoPath     = [mainDir, '/public/json/server/', `${this.server}.json`]
      this.serverIniPath      = [CONFIG.app.pathArkmanager, 'instances', `${this.server}.cfg`]
      this.cfg                = {}

      if(globalUtil.poisonNull(this.server)) {
         let ini         = this.getINI()
         let file        = globalUtil.safeFileReadSync(this.cfgPath, true)
         let dfile       = globalUtil.safeFileReadSync(this.defaultCfgPath, true)

         if(file === false) {
            dfile.path        = ini.arkserverroot
            dfile.pathLogs    = ini.logdir
            dfile.pathBackup  = ini.arkbackupdir
            dfile.selfname    = ini.ark_SessionName

            this.cfg          = dfile
            globalUtil.safeFileCreateSync(this.cfgPath, JSON.stringify(dfile))
         }
         else {
            this.cfg          =  dfile !== false
                  ? array_replace_recursive(dfile, file)
                  : file
         }

         this.exsists    = this.cfg !== false && globalUtil.safeFileExsistsSync(this.serverIniPath)
      }
   }

   /**
    * gibt aus ob dieser Server existiert
    * @return {boolean}
    */
   cfgReload() {
      let file        = globalUtil.safeFileReadSync(this.cfgPath, true)
      let dfile       = globalUtil.safeFileReadSync(this.defaultCfgPath, true)
      let reloadCfg   = file !== false ? (
         dfile !== false ? array_replace_recursive(dfile, file)
            : file
      ) : false
      if(reloadCfg !== false) {
         this.cfg = reloadCfg
      }
   }

   /**
    * gibt aus ob dieser Server existiert
    * @return {boolean}
    */
   serverExsists() {
      return this.exsists
   }

   /**
    * gibt aus ob dieser Server online ist
    * @return {boolean}
    */
   online() {
      if(this.serverExsists())
         return this.getServerInfos() !== false ? this.getServerInfos().online : false
      return false
   }


   /**
    * gibt aus ob dieser Server läuft ist
    * @return {boolean}
    */
   isrun() {
      if(this.serverExsists())
         return this.getServerInfos() !== false ? this.getServerInfos().pid !== 0 : false
      return false
   }

   /**
    * gibt die Konfiguration aus
    * @return {object}
    */
   getConfig() {
      if(this.serverExsists()) {
         this.cfgReload()
         return this.cfg
      }
   }

   /**
    * Bekomme alle Serverinforamtionen von diesen Server
    * @return {object}
    */
   getServerInfos() {
      return globalUtil.safeFileReadSync(this.serverInfoPath, true)
   }

   /**
    * Speichert einen beliebigen Key in der CFG
    * @param {string} key Option
    * @param {any} value Wert
    * @return {boolean}
    */
   writeState( key, value) {
      if(this.serverExsists()) {
         try {
            let file = [mainDir, "public/server", `${this.server}.json`]
            let json = globalUtil.safeFileReadSync(file, true)
            return json !== false ? globalUtil.safeFileSaveSync(file, JSON.stringify(json)) : false
         }
         catch (e) {
            if(debug) console.log('[DEBUG_FAILED]', e)
         }
      }
      return false
   }

   /**
    * Speichert einen beliebigen Key in der CFG
    * @param {string} key Option
    * @param {any} value Wert
    * @return {boolean}
    */
   writeConfig(key, value) {
      if(this.serverExsists() && typeof this.cfg[key] !== "undefined") {
         this.cfg[key] = value
         try {
            return globalUtil.safeFileSaveSync(this.cfgPath, JSON.stringify(this.cfg))
         }
         catch (e) {
            if(debug) console.log('[DEBUG_FAILED]', e)
         }
      }
      return false
   }

   /**
    * Entfernt einen beliebigen Key in der CFG
    * @param {string} key Option
    * @return {boolean}
    */
   writeConfig(key) {
      if(this.serverExsists() && typeof this.cfg[key] !== "undefined") {
         delete this.cfg[key]
         return globalUtil.safeFileSaveSync(this.cfgPath, JSON.stringify(this.cfg))
      }
      return false
   }

   /**
    * Speichert einen beliebigen Key in der Ini (Arkmanager.cfg)
    * @param {string} key Option
    * @param {string|int|float} value Wert
    * @return {boolean}
    */
   writeIni(key, value) {
      let Ini  = this.getINI()
      if(this.serverExsists()) {
         Ini[key] = value
         return this.saveINI(ini.stringify(Ini))
      }
      return false
   }

   /**
    * Entfernt einen beliebigen Key in der Ini (Arkmanager.cfg)
    * @param {string} key Option
    * @return {boolean}
    */
   removeFromIni(key) {
      let Ini  = this.getINI()
      if(this.serverExsists()) {
         delete Ini[key]
         return this.saveINI(ini.stringify(Ini))
      }
      return false
   }

   /**
    * Speichert eine Definierte CFG
    * @param {object} cfg Wert
    * @return {boolean}
    */
   saveConfig(cfg) {
      let config  = this.cfg
      if(this.serverExsists()) {
         try {
            let saveData               = array_replace_recursive(config, cfg)
            saveData.autoBackupPara    = cfg.autoBackupPara
            return globalUtil.safeFileSaveSync(this.cfgPath, JSON.stringify(saveData))
         }
         catch (e) {
            if(debug) console.log('[DEBUG_FAILED]', e)
         }
      }
      return false
   }

   /**
    * Speichert eine
    * @param {string} prop
    * @return {boolean}
    */
   saveINI(prop) {
      if(this.serverExsists()) {
         let path    = this.serverIniPath
         if(globalUtil.safeFileExsistsSync(path)) {
            try {
               return globalUtil.safeFileSaveSync(path, prop)
            } catch (e) {
               if (debug) console.log('[DEBUG_FAILED]', e)
            }
         }
      }
      return false
   }

   /**
    * lese eine GameIni aus
    * @param {string} ini
    * @param {boolean} asString
    * @return {string|boolean}
    */
   getGameINI(ini = "GameUserSettings.ini", asString = false) {
      let file          = pathMod.join(this.getIniDirLocation(), ini)
      let fileContent   = globalUtil.safeFileReadSync([file])
      if(file !== false && !asString) {
         try {
            return ini.parse(fileContent)
         } catch (e) {
            if (debug) console.log('[DEBUG_FAILED]', e)
         }
      }
      else if(file !== false && asString) {
         return fileContent
      }
      return false
   }

   /**
    * Speichert eine Definierte CFG
    * @param {string} ini
    * @param {string} cfg
    * @return {boolean}
    */
   saveGameINI(ini = "GameUserSettings.ini", cfg) {
      if(this.serverExsists())
         return globalUtil.safeFileSaveSync([this.getIniDirLocation(), ini], cfg.toString())

      return false
   }

   /**
    * Speichert eine Ini
    * @param {boolean} asString
    * @return {boolean}
    */
   getINI(asString = false) {
      let file    = globalUtil.safeFileReadSync(this.serverIniPath)
      if(file === false)
         file     = globalUtil.safeFileReadSync([mainDir, `/app/data/cfg`, `default.cfg`])
      if(file !== false && !asString) {
         try {
            return ini.parse(file)
         } catch (e) {
            if (debug) console.log('[DEBUG_FAILED]', e)
         }
      }
      else if(file !== false && asString) {
         return file
      }
      return false
   }

   /**
    * holt das Speicherstandverzeichnis
    * @param {boolean} absolute mit unterverzeichnis?
    * @return {boolean|string}
    */
   getSaveDirLocation(absolute = true) {
      if(this.serverExsists()) {
         let ini = this.getINI()
         return absolute
            ? pathMod.join(ini.arkserverroot, 'ShooterGame/Saved')
            : pathMod.join(ini.arkserverroot, 'ShooterGame/Saved', ini.ark_AltSaveDirectoryName)
      }
      return false
   }

   /**
    * holt das Modverzeichnis
    * @param {boolean} absolute mit unterverzeichnis?
    * @return {boolean|string}
    */
   getInstalledModDirLocation() {
      if(this.serverExsists()) {
         let ini = this.getINI()
         return pathMod.join(ini.arkserverroot, 'ShooterGame/Content/Mods')
      }
      return false
   }

   /**
    * holt das Ini verzeichnis
    * @return {boolean|string}
    */
   getIniDirLocation() {
      if(this.serverExsists()) {
         let ini = this.getINI()
         return pathMod.join(ini.arkserverroot, 'ShooterGame/Saved/Config/LinuxServer')
      }
      return false
   }

   /**
    * Gibt den Array an Mods
    * @return {boolean|string}
    */
   getModArray() {
      if(this.serverExsists()) {
         let ini = this.getINI()
         return ini.ark_GameModIds.split(',')
      }
      return false
   }

   /*************************************************************
    * Clustersystem
    *************************************************************/

   /**
    * Liest Cluster infos aus und suche nach dem Cluster wo der Server sich befindet
    */
   initClusterRead() {
      if(!this.isClusterReaded) {
         this.clusterFile   = globalUtil.safeFileReadSync([mainDir, "public/json/cluster/clusters.json"], true)
         if(this.clusterFile !== false) {
            // suche Server indem sich der Cluster befindet
            let clusterIndex  = false
            let clusterType   = false
            for(const i in this.clusterFile)
               for(const server of this.clusterFile[i].servers) {
                  if(server.name === this.server) {
                     clusterIndex   = i
                     clusterType    = server.type
                  }
               }

            this.isClusterReaded    = true
            this.clusterIndex       = clusterIndex
            this.isInCluster        = clusterIndex !== false
            this.serverClustertype  = clusterType
         }
      }
   }

   /**
    * gibt aus ob der Server in einem Cluster ist
    * @return {boolean}
    */
   isServerInCluster() {
      if(!this.isClusterReaded) {
         this.initClusterRead()
      }
      return this.isInCluster
   }

   /**
    * gibt den Cluster Namen aus
    * @return {string|boolean}
    */
   clusterGetName() {
      return this.isServerInCluster() ? this.clusterFile[this.clusterIndex].name : false
   }

   /**
    * gibt die ClusterID aus
    * @return {string|boolean}
    */
   clusterGetID() {
      return this.isServerInCluster() ? this.clusterFile[this.clusterIndex].name : false
   }

   /**
    * gibt den Cluster Typen aus
    * @return {number|boolean}
    */
   clusterGetType() {
      return this.isServerInCluster() ? this.serverClustertype : false
   }
}
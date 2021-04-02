/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

module.exports = {
   /**
      * Installiert Update
      * @returns {void}
   */
   startWork: async () => {
      let clusterFile   = globalUtil.safeFileReadSync([mainDir, "public/json/cluster/clusters.json"], true)

      for(const cluster of clusterFile) {
         module.exports.setClusterOptions(cluster)

         if(
            cluster.sync.GameUserSettings
            || cluster.sync.Game
            || cluster.sync.Engine
         ) module.exports.syncInis(cluster)

         if(cluster.sync.mods)
            module.exports.syncMods(cluster)
      }
   },

   /**
    * Synct Inis
    * @param cluster
    */
   syncInis: async function(cluster) {
      const inis  = [
         "GameUserSettings",
         "Game",
         "Engine"
      ]
      for(const ini of inis) {
         if(cluster.sync[ini]) {
            // Suche nach bestehenden Master
            let master = false
            for(const server of cluster.servers)
               if(server.type === 1)
                  master = server.server

            let masterClass   = new serverClass(master.toString())
            if(masterClass.serverExsists()) {
               let masterIni = masterClass.getGameINI(`${ini}.ini`, true)
               for (const server of cluster.servers) {
                  if (server.type !== 1) {
                     let slave = new serverClass(server.server)
                     if (slave.serverExsists())
                        slave.saveGameINI(`${ini}.ini`, masterIni)
                  }
               }
            }
         }
      }
   },

   /**
    * Synct Mods
    * @param cluster
    */
   setClusterOptions: async function(cluster) {
      // Suche nach bestehenden Master
      for (const server of cluster.servers) {
         let serverData = new serverClass(server.server)
         if (serverData.serverExsists()) {
            serverData.writeIni(`arkopt_clusterid`, cluster.clusterid)
            serverData.writeIni(`arkopt_ClusterDirOverride`, pathMod.join(CONFIG.app.servRoot, "cluster"))
            for (const option of Object.entries(cluster.opt)) {
               if(option[1]) {
                  serverData.writeIni(`ark_${option[0]}`, "True")
               }
               else {
                  serverData.removeFromIni(`ark_${option[0]}`)
               }
            }
         }
      }
   },

   /**
    * Synct Mods
    * @param cluster
    */
   syncMods: async function(cluster) {
      // Suche nach bestehenden Master
      let master = false
      for(const server of cluster.servers)
         if(server.type === 1)
            master = server.server

      let masterClass   = new serverClass(master)
      if(masterClass.serverExsists()) {
         let masterINI     = masterClass.getINI()
         let masterMods    = masterINI.ark_GameModIds
         if (masterMods) {
            for (const server of cluster.servers) {
               if (server.type !== 1) {
                  let slave = new serverClass(server.server)
                  if (slave.serverExsists())
                     slave.writeIni(`ark_GameModIds`, masterMods)
               }
            }
         }
      }
   }
}
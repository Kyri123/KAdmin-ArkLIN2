/*
* *******************************************************************************************
* @author:  Oliver Kaufmann (Kyri123)
* @copyright Copyright (c) 2019-2020, Oliver Kaufmann
* @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
* Github: https://github.com/Kyri123/KAdmin-ArkLIN2
* *******************************************************************************************
*/
"use strict"
let VUE_modContainer = new Vue({
    el      : '#modsContainer',
    data    : {
        mods               : [],
        installedMods      : [],
        installedFiles     : {},
        steamAPI           : {},
        listAktiveMods     : true
    },
   methods: {
      /**
       * holt Informationen vom Server
       */
      getInfos() {
         $.get('/ajax/serverCenterMods', {
            modFolderScan: true,
            server: vars.cfg
         })
            .done((data) => {
               try {
                  VUE_modContainer.installedFiles    = JSON.parse(data)

                  let installedModArray              = []
                  if(Array.isArray(VUE_modContainer.installedFiles)) for(const file of VUE_modContainer.installedFiles) {
                     if(file.isFile && file.namePure !== "111111111" && file.FileExt === ".mod") installedModArray.push(file.namePure)
                  }

                  VUE_modContainer.installedMods     = installedModArray
                  VUE_modContainer.installedMods.sort()
               }
               catch (e) {
                  console.log(e)
               }
            })
         $.get('/ajax/serverCenterMods', {
            Mods: true,
            server: vars.cfg
         })
            .done((data) => {
               try {
                  VUE_modContainer.mods  = JSON.parse(data)
                  for(const mod of VUE_modContainer.mods) {
                     if(mod === "") VUE_modContainer.mods.splice(VUE_modContainer.mods.indexOf(""), 1)
                  }
               }
               catch (e) {
                  console.log(e)
               }
            })
         $.get('/json/steamAPI/mods.json')
            .done((data) => {
               try {
                  VUE_modContainer.steamAPI  = data
               }
               catch (e) {
                  console.log(e)
               }
            })
      },

      /**
       * Prüft ob eine ModID installiert ist
       * @param modid
       * @return {boolean}
       */
      checkIsInstalled(modid) {
         let modFile       = false
         let modDirectory  = false
         if(Array.isArray(VUE_modContainer.installedFiles)) for(const file of VUE_modContainer.installedFiles) {
            if(file.name === modid && file.isDir)            modDirectory   = true
            if(file.name === `${modid}.mod` && file.isFile)  modFile        = true
         }
         if(modFile && modDirectory) return true
      },

      /**
       * Sendet eine Anfrage zum Server um aktionen zu verarbeiten
       * @param action
       * @param modId
       * @param indikator
       */
      sendRequest(action, modId, indikator) {
         $.post('/ajax/serverCenterMods', {
            server      : vars.cfg,
            action      : action,
            modId       : modId,
            indikator   : indikator
         })
            .done((data) => {
               let response   = JSON.parse(data)
               if(response.sendToast) fireToast(response.code, response.success ? "success" : "error")
               this.getInfos()
            })
            .fail(() => {
               fireToast("FAIL", "error")
            })
      },
   },
   created () {
      this.getInfos()
      this.getInfosInterval  = setInterval(() => this.getInfos(), 2000)
   },
   beforeDestroy () {
      clearInterval(this.getInfosInterval)
   }
})
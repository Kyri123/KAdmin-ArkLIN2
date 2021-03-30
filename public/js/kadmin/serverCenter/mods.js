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
        installedFiles     : {},
        steamAPI           : {}
    },
   methods: {
      checkIsInstalled(modid) {
         let modFile       = false
         let modDirectory  = false
         for(const file of VUE_modContainer.installedFiles) {
            if(file.name === modid && file.isDir)          modDirectory   = true
            if(file.name === `${modid}.mod` && file.isFile)  modFile        = true
         }
         if(modFile && modDirectory) return true
      }
   }
})

function getInfos() {
   $.get('/ajax/serverCenterMods', {
      modFolderScan: true,
      server: vars.cfg
   })
      .done((data) => {
         try {
            VUE_modContainer.installedFiles  = JSON.parse(data)
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
         }
         catch (e) {
            console.log(e)
         }
      })
   $.get('/json/steamAPI/mods.json')
      .done((data) => {
         try {
            VUE_modContainer.steamAPI  = data
            console.log(VUE_modContainer.steamAPI["731604991"])
         }
         catch (e) {
            console.log(e)
         }
      })
}

setInterval(() => getInfos(), 2000)
getInfos()
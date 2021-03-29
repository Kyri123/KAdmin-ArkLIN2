/*
* *******************************************************************************************
* @author:  Oliver Kaufmann (Kyri123)
* @copyright Copyright (c) 2019-2020, Oliver Kaufmann
* @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
* Github: https://github.com/Kyri123/KAdmin-ArkLIN2
* *******************************************************************************************
*/
"use strict"
let VUE_configContainer = new Vue({
    el      : '#configContainer',
    data    : {
        cfg                 : {},
        ArkManager          : {},
        ArkManagerReadOnly  : [],
        maps                : {},
        flags               : {},
        events              : {},
        parameters          : [],
        game_exsists        : false,
        engine_exsists      : false,
        gus_exsists         : false,
        game                : "",
        engine              : "",
        gus                 : ""
    },
   methods: {
      handleMapChange(e) {
         let datas   = e.target.options[e.target.options.selectedIndex].dataset
         let mapName = e.target.value
         let isMod   = +datas.mod !== 0
         let modId   = datas.modid

         VUE_configContainer.ArkManager.serverMap        = mapName
         VUE_configContainer.ArkManager.serverMapModId   = isMod ? modId : ''
      }
   }
})

$.get('/json/sites/serverCenterActions.cfg.json', (datas) => {
    let parm        = datas.parameter
    let array       = []

    parm.forEach((val) => {
        let parameter       = {}
        parameter.value     = val.parameter
        parameter.text      = varser.lang_arr.forservers.parameter[val.id_js.replaceAll('#', '')]
        parameter.type      = val.type
        parameter.id        = val.id_js

        array.push(parameter)
    })
    VUE_configContainer.parameters = array
})


// Maps
$.get('/json/sites/maps.json')
   .done((data) => {
      try {
         VUE_configContainer.maps    = data
      }
      catch (e) {
         console.log(e)
      }
   })
// Flags
$.get('/json/sites/flags.json')
   .done((data) => {
        try {
            VUE_configContainer.flags   = data
        }
        catch (e) {
            console.log(e)
        }
   })
// Events
$.get('/json/sites/events.json')
   .done((data) => {
      try {
         VUE_configContainer.events   = data
      }
      catch (e) {
         console.log(e)
      }
   })

let editor = {}
function getInis() {
    $.get('/ajax/serverCenterConfig', {
        serverInis  : true,
        server      : vars.cfg
    })
       .done((data) => {
           data                                 = JSON.parse(data)

           VUE_configContainer.cfg                  = data.cfg
           VUE_configContainer.ArkManager           = data.ArkManager
           VUE_configContainer.ArkManagerReadOnly   = [
               "arkserverroot",
               "logdir",
               "arkbackupdir",
               "arkserverexec",
               "arkautorestartfile"
           ]
           VUE_configContainer.game_exsists         = data.Game !== false
           VUE_configContainer.engine_exsists       = data.Engine !== false
           VUE_configContainer.gus_exsists          = data.GameUserSettings !== false
           VUE_configContainer.game                 = data.Game
           VUE_configContainer.engine               = data.Engine
           VUE_configContainer.gus                  = data.GameUserSettings
       })
       .fail(
          () => setTimeout(
             () => getCfg()
          ), 5000
       )
}
getInis()

/**
 * Speicher Cfg
 * @param {string} htmlID
 * @return {boolean}
 */
function saveCfg(htmlID) {
    $.post('/ajax/serverCenterConfig', $(htmlID).serialize(), (data) => {
        try {
            data = JSON.parse(data)
            fireToast(data.success ? 1 : 19, data.success ? "success" : "error")
        } catch (e) {
            console.log(e)
            fireToast(19, "error")
        }
    })
    return false
}

/**
 * Speicher Server Konfigurationen
 * @param {string} htmlID
 * @param {string} cfg
 * @return {boolean}
 */
function serverSave(htmlID, cfg) {
    $.post('/ajax/serverCenterConfig', {
        iniText   : $(htmlID).val(),
        cfg       : cfg,
        config    : htmlID.trim().replaceAll('#', ''),
        server    : true
    }, (data) => {
        try {
            data = JSON.parse(data)
            fireToast(data.success ? 1 : 19, data.success ? "success" : "error")
        } catch (e) {
            console.log(e)
            fireToast(19, "error")
        }
    })
    return false
}
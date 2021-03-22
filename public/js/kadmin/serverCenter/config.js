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
        parameters          : [],
        game_exsists        : false,
        engine_exsists      : false,
        gus_exsists         : false
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
    console.log(array)
    VUE_configContainer.parameters = array
})

let editor = {}
function getInis() {
    $.get('/ajax/serverCenterConfig', {
        serverInis  : true,
        server      : vars.cfg
    })
       .done((data) => {
           data                                 = JSON.parse(data)
           console.log(data)
           VUE_configContainer.cfg              = data.cfg
           VUE_configContainer.game_exsists     = data.Game !== "false"
           VUE_configContainer.engine_exsists   = data.Engine !== "false"
           VUE_configContainer.gus_exsists      = data.GameUserSettings !== "false"

           setTimeout(() => {
               let Editors = [
                   "GameUserSettings",
                   "Game",
                   "Engine",
                   "ArkManager"
               ]
               Editors.forEach(item => {
                   try {
                       editor[`#${item}`] = CodeMirror.fromTextArea(document.getElementById(item), {
                           lineNumbers: true,
                           mode: "javascript",
                           theme: "material"
                       })

                       editor[`#${item}`].setValue(data[item])
                   }
                   catch (e) {
                       console.log(e)
                   }
               })
           }, 1000)
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
 * @return {boolean}
 */
function saveCfg() {
    $.post('/ajax/serverCenterConfig', $('#pills-server').serialize(), (data) => {
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
        iniText: editor[htmlID].getValue(),
        cfg: cfg,
        server: true
    }, (data) => {
        try {
            data = JSON.parse(data)
            getCfg()
            fireToast(data.success ? 1 : 19, data.success ? "success" : "error")
        } catch (e) {
            console.log(e)
            fireToast(19, "error")
        }
    })
    return false
}
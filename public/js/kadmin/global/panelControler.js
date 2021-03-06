/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2019-2020, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

// PanelControler
const VUE_panelControler = new Vue({
   el          : "#panelControler",
   data        : {
      is_update      : globalvars.isUpdate,
      is_updating    : globalvars.isUpdating
   }
})

setInterval(() => {
   VUE_panelControler.is_update     = globalvars.isUpdate
   VUE_panelControler.is_updating   = globalvars.isUpdating
},2000)

const VUE_panelControlerModals = new Vue({
   el          : "#panelControlerModals",
   data        : {
      isAdmin        : hasPermissions(globalvars.perm, "all/is_admin"),
      logArray       : []
   }
})

setInterval(() => {
   if($('#panelControlerLogs').hasClass('show')) $.get(`/nodejs_logs/current.log`)
      .done(function(data) {
         let array   = []
         let counter = 0
         for(let item of data.split('\n').reverse()) {
            let obj = {}
            obj.text    = item
            obj.class   = item.includes('[DEBUG_FAILED]')
               ? "text-danger"
               : item.includes('[DEBUG]')
                  ? "text-warning"
                  : "text-info"

            array.push(obj)

            counter++
            if(counter === 500) break
         }
         VUE_panelControlerModals.logArray = array
      })
},500)

/**
 * sendet eine PanelAktion an den Server bzw an das Panel
 * @param action
 */
function forceAction(action) {
    fireToast(15, "info")
    $.post(`/ajax/all`, {
      "adminAction": action
    }, (datas) => {
        try {
            let toastData   = JSON.parse(datas)
            fireToast(toastData.code, toastData.type)
        }
        catch (e) {
            fireToast(33, "error")
        }
    })
}
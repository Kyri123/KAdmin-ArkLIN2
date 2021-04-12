/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

const router            = require('express').Router()
const serverClass       = require('./../../../app/src/util_server/class')
const backgroundRunner  = require('../../../app/src/background/backgroundRunner')

router.route('/')
    .post((req,res) => {
        let POST           = req.body,
            SESS           = req.session,
            success        = false

        if(POST.server) {
            let server  = new serverClass(POST.server)

           // Prüfe ob der Server Exsistiert
           if(server.serverExsists()) {
              // Lösch aktionen
              if (userHelper.hasPermissions(SESS.uid, "saves/removeSaves", server.server)) {
                 // Löschen von einer einzelenen Dateien
                 if(POST.action === "remove") {
                    let targetFile     = pathMod.join(POST.file)
                    let saveLocation   = server.getSaveDirLocation(false)

                    // Prüfe ob der Pfad im SpielstandOrdner ist
                    if(targetFile.includes(saveLocation)) {
                       // Entferne Datei
                       if(globalUtil.safeFileExsistsSync([targetFile]))
                           success = globalUtil.safeFileRmSync([targetFile])

                       let renderData = {
                          success   : success
                       }

                       if(success) {
                          /*renderData.Toast         = {}
                          renderData.Toast.code    = 0
                          renderData.Toast.type    = "success"
                          renderData.Toast.options = {}*/
                          backgroundRunner.doSavegamesRead()
                       }

                       // gebe Antwort an den Client
                       res.render('ajax/json', {
                          data: JSON.stringify(renderData)
                       })
                       return
                    }
                 }

                 // Löschen von Allen Dateien
                 if(POST.action === "removeAll") {
                    let saveLocation   = server.getSaveDirLocation(false)

                    // Entferne Verzeichniss
                    if(globalUtil.safeFileExsistsSync([saveLocation]))
                       success = globalUtil.safeFileRmSync([saveLocation])

                    // erstelle das Verzeichniss vom SpielstandOrdner
                    if(success) {
                       globalUtil.safeFileMkdirSync([saveLocation])
                       backgroundRunner.doSavegamesRead()
                    }

                    let renderData = {
                       success   : success
                    }

                    // gebe Antwort an den Client
                    res.render('ajax/json', {
                       data: JSON.stringify(renderData)
                    })
                    return

                 }
              }
           }
        }

        res.render('ajax/json', {
            data: `{"request":"failed"}`
        })
        return true
    })

    .get((req,res) => {
        // DEFAULT AJAX
        let GET         = req.query

        res.render('ajax/json', {
            data: `{"request":"failed"}`
        })
        return true
    })

module.exports = router;
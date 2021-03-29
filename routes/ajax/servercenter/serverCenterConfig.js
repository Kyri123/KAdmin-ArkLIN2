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
const ini               = require('ini')

router.route('/')

    .post((req,res)=>{
        let POST        = req.body

        if(POST.saveArkManager !== undefined && userHelper.hasPermissions(req.session.uid, "config/arkmanager", POST.cfg)) {
            let serverData  = new serverClass(POST.cfg)
            let serverIni   = serverData.getINI()

            let sendetIni   = POST.cfgsend

            sendetIni.arkserverroot         = serverIni.arkserverroot
            sendetIni.logdir                = serverIni.logdir
            sendetIni.arkbackupdir          = serverIni.arkbackupdir
            sendetIni.arkserverexec         = serverIni.arkserverexec

            if(sendetIni.arkopt_ActiveEvent === "none")
                delete sendetIni.arkopt_ActiveEvent

            let iniString   = ini.stringify(sendetIni)

            res.render('ajax/json', {
                data: JSON.stringify({
                    success: serverData.saveINI(iniString)
                })
            })
        }

        // Speicher Server
        if(POST.saveServer !== undefined && userHelper.hasPermissions(req.session.uid, "config/kadmin", POST.cfg)) {
            let serverData  = new serverClass(POST.cfg)
            let cfg         = globalUtil.safeFileReadSync([mainDir, "app/json/server/template", "default.json"], true)
            let forbidden   = globalUtil.safeFileReadSync([mainDir, "app/json/server/template", "forbidden.json"], true)
            let currCfg     = serverData.getConfig()
            let sendedCfg   = POST.cfgsend

            // Erstelle Cfg
            for (const [key, value] of Object.entries(cfg)) {
                if(!forbidden[key]) {
                    cfg[key] = sendedCfg[key]
                }
                else {
                    cfg[key] = currCfg[key]
                }

                if(key === "autoBackupPara")
                    if(cfg[key] === undefined) cfg[key] = []

                if(key === "autoBackupNext" || key === "autoUpdateNext") {
                    if(isNaN(cfg[key])) cfg[key] = 0
                }
            }

            // setzte alle Vars
            cfg = globalUtil.convertObject(cfg)

            res.render('ajax/json', {
                data: JSON.stringify({
                    success: serverData.saveConfig(cfg)
                })
            })
            return
        }

        // Server.Properties
        if(POST.server !== undefined) {
            let iniTarget   = POST.config
            let serverData  = new serverClass(POST.cfg)

            if(userHelper.hasPermissions(req.session.uid, `config/${iniTarget}`, POST.cfg)) {
                res.render('ajax/json', {
                    data: JSON.stringify({
                        success: serverData.saveGameINI(`${iniTarget}.ini`, POST.iniText)
                    })
                })
                return
            }
        }

        res.render('ajax/json', {
            data: `{"request":"failed"}`
        })
        return
    })

    .get((req,res)=>{
        // DEFAULT AJAX
        let GET         = req.query
        let SESS        = req.session
        if(GET.server === undefined) GET.server = ''

        // GET serverInis
        if(GET.serverInis !== undefined && userHelper.hasPermissions(req.session.uid, "show_kadmin", GET.server)) {
            let serverData  = new serverClass(GET.server)

            let cfg         = {}
            let forbidden   = globalUtil.safeFileReadSync([mainDir, "app/json/server/template", "forbidden.json"], true)
            let currCfg     = serverData.getConfig()

            for (const [key, value] of Object.entries(currCfg))
                if(!forbidden[key])
                    cfg[key] = currCfg[key]

            let GameUserSettings    = userHelper.hasPermissions(SESS.uid, "config/show_gameuser", GET.server) ? serverData.getGameINI("GameUserSettings.ini", true) : false
            let Game                = userHelper.hasPermissions(SESS.uid, "config/show_gameuser", GET.server) ? serverData.getGameINI("Game.ini", true) : false
            let Engine              = userHelper.hasPermissions(SESS.uid, "config/show_gameuser", GET.server) ? serverData.getGameINI("Engine.ini", true) : false
            let ArkManager          = userHelper.hasPermissions(SESS.uid, "config/show_gameuser", GET.server) ? serverData.getINI() : false

            res.render('ajax/json', {
                data: JSON.stringify({
                    GameUserSettings    : GameUserSettings,
                    Game                : Game,
                    Engine              : Engine,
                    ArkManager          : ArkManager,
                    cfg                 : cfg
                })
            })
            return true
        }

        // GET serverCfg
        if(GET.serverCfg !== undefined && userHelper.hasPermissions(req.session.uid, "show_server", GET.server)) {
            let serverData  = new serverClass(GET.server)

            let cfg         = {}
            let forbidden   = globalUtil.safeFileReadSync([mainDir, "app/json/server/template", "forbidden.json"], true)
            let currCfg     = serverData.getConfig()

            for (const [key, value] of Object.entries(currCfg))
                if(!forbidden[key])
                    cfg[key] = currCfg[key]

            res.render('ajax/json', {
                data: JSON.stringify(cfg)
            })
            return true
        }

        res.render('ajax/json', {
            data: `{"request":"failed"}`
        })
        return true
    })

module.exports = router;
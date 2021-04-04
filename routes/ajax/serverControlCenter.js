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
const serverClass       = require('../../app/src/util_server/class')
const serverCommands    = require('../../app/src/background/server/commands')
const ini               = require('ini')

router.route('/')

    .post((req,res)=>{
        let POST        = req.body

        // Erstellen & Bearbeiten eines Servers
        if((POST.action === 'edit' || POST.action === 'add') && userHelper.hasPermissions(req.session.uid, "servercontrolcenter/create")) {

            let createPerm      = userHelper.hasPermissions(req.session.uid, "servercontrolcenter/create")
            let editPerm        = userHelper.hasPermissions(req.session.uid, "servercontrolcenter/editServer")
            let forbidden       = globalUtil.safeFileReadSync([mainDir, "app/json/server/template", "forbidden.json"], true)
            let serverNameCFG  = undefined
            let sendedCfg       = POST.cfgsend

            // Erstellen
            if(POST.action === 'add' && createPerm) {
                let curr            = fs.readdirSync(pathMod.join(mainDir, '/app/json/server/'))
                let defaultString   = globalUtil.safeFileReadSync([mainDir, "app/json/server/template", "template.cfg"])
                let success         = false

                if(defaultString !== false) {
                    let serverCfg = ini.parse(defaultString)


                    let serverName = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7)
                    serverNameCFG = serverName + '.cfg'
                    while (true) {
                        if (curr.includes(serverNameCFG)) {
                            serverName = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7) + '.json'
                            serverNameCFG = serverName + '.json'
                        } else {
                            break
                        }
                    }

                    // Schreibe Daten
                    serverCfg.arkserverroot                 = pathMod.join(CONFIG.app.servRoot, serverName)
                    serverCfg.logdir                        = pathMod.join(CONFIG.app.logRoot, serverName)
                    serverCfg.arkbackupdir                  = pathMod.join(CONFIG.app.pathBackup, serverName)
                    serverCfg.ark_ServerAdminPassword       = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7)
                    serverCfg.ark_Port                      = +POST.ark_Port.replaceAll(/[^0-9]/g, '')
                    serverCfg.ark_RCONPort                  = +POST.ark_RCONPort.replaceAll(/[^0-9]/g, '')
                    serverCfg.ark_QueryPort                 = +POST.ark_QueryPort.replaceAll(/[^0-9]/g, '')

                    success     = globalUtil.safeFileSaveSync([CONFIG.app.pathArkmanager, 'instances', serverNameCFG], ini.stringify(globalUtil.convertObject(serverCfg)))
                }

                res.render('ajax/json', {
                    data: JSON.stringify({
                        success : success,
                        action  : POST.action
                    })
                })
                return true
            }

            // bearbeiten
            else if(POST.action === 'edit' && POST.targetServer && editPerm) {
                let serverData      = new serverClass(POST.targetServer)
                let curr            = serverData.getConfig()

                console.log(curr,sendedCfg)

                // Erstelle Cfg
                for (const [key, value] of Object.entries(curr)) {
                    if(forbidden[key] || key === 'selfname') {
                        curr[key] = sendedCfg[key] || value
                    }
                }

                curr  = globalUtil.convertObject(curr)

                console.log(curr)

                res.render('ajax/json', {
                    data: JSON.stringify({
                        success : serverData.saveConfig(curr),
                        action  : POST.action
                    })
                })
                return true
            }
        }


        // Lösche einen Servers
        if(POST.deleteserver !== undefined && userHelper.hasPermissions(req.session.uid, "servercontrolcenter/delete")) {
            // Erstelle default daten & Servername
            let serverName              = POST.cfg
            let serverData              = new serverClass(serverName)
            let serverInformationen     = serverData.getServerInfos(serverName)

            // fahre server runter wenn dieser noch online ist
            serverCommands.doArkmanagerCommand(serverName, "stop", [])

            // lösche alle Informationen
            try {
                globalUtil.safeFileRmSync([mainDir, '/public/json/server/', `${serverName}.json`])
                globalUtil.safeFileRmSync([mainDir, '/public/json/serveraction/', `action_${serverName}.json`])

                res.render('ajax/json', {
                    data: JSON.stringify({
                        success: globalUtil.safeFileRmSync([CONFIG.app.pathArkmanager, 'instances', `${serverName}.cfg`]) && globalUtil.safeFileRmSync([mainDir, '/app/json/server/', `${serverName}.json`])
                    })
                })
                return true
            }
            catch (e) {
                if(debug) console.log('[DEBUG_FAILED]', e)
                res.render('ajax/json', {
                    data: JSON.stringify({
                        done: false,
                        alert: alerter.rd(4)
                    })
                })
                return true
            }
        }

        res.render('ajax/json', {
            data: `{"request":"failed"}`
        })
        return true
    })

    .get((req,res)=>{
        // DEFAULT AJAX
        let GET         = req.query

        if(GET.type !== undefined && (
           userHelper.hasPermissions(req.session.uid, "servercontrolcenter/create") ||
           userHelper.hasPermissions(req.session.uid, "servercontrolcenter/editServer")
        )) {
            let type        = GET.type === 'add'
            let createPerm  = userHelper.hasPermissions(req.session.uid, "servercontrolcenter/create")
            let editPerm    = userHelper.hasPermissions(req.session.uid, "servercontrolcenter/editServer")

            let cfg         = {}
            let forbidden   = globalUtil.safeFileReadSync([mainDir, "app/json/server/template", "forbidden.json"], true)

            if(type && createPerm) {
                let defaultCfg      = globalUtil.safeFileReadSync([mainDir, "app/json/server/template", "default.json"], true)
                for (const [key, value] of Object.entries(defaultCfg))
                    if (
                       (forbidden[key] &&
                       key !== 'path' &&
                       key !== 'pathLogs' &&
                       key !== 'pathBackup') ||
                       key === 'selfname'
                    ) cfg[key]    = value
            }

            if(!type && editPerm && GET.serverCfg !== undefined) {
                let serverData      = new serverClass(GET.serverCfg)
                let currCfg         = serverData.getConfig()
                for (const [key, value] of Object.entries(currCfg))
                    if (
                       (forbidden[key] &&
                       key !== 'path' &&
                       key !== 'pathLogs' &&
                       key !== 'pathBackup') ||
                       key === 'selfname'
                    ) cfg[key]    = value
            }

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
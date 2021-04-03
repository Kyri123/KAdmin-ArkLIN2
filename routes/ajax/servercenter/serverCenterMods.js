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
const commands          = require('./../../../app/src/background/server/commands')
const url               = require('url')

router.route('/')

    .post((req,res)=>{
        let POST        = req.body
        let SESS        = req.session
        let action      = POST.action
        let server      = new serverClass(POST.server)

        // Prüfe ob server überhaupt Existiert
        if(server.serverExsists()) {
            let serverIni   = server.getINI()
            let modList     = server.getModArray()

            // Mods bewegen
            if (action === "move" && userHelper.hasPermissions(SESS.uid, "mods/moveMod", server.server)) {
                let moveUp      = POST.indikator !== "false"
                let modSource   = POST.modId
                if(!isNaN(+modSource) && modList.includes(modSource)) {
                    let currentIndex    = modList.indexOf(modSource)
                    let save            = false

                    // Prüfe Mod position und schreibe diese um
                    if(moveUp && modList[(currentIndex - 1)]) {
                        let targetMod                   = modList[(currentIndex - 1)]
                        modList[(currentIndex - 1)]     = modSource
                        modList[currentIndex]           = targetMod
                        save                            = true
                    }
                    else if(!moveUp && modList[(currentIndex + 1)]) {
                        let targetMod                   = modList[(currentIndex + 1)]
                        modList[(currentIndex + 1)]     = modSource
                        modList[currentIndex]           = targetMod
                        save                            = true
                    }


                    // Änderungen übernehmen und Response
                    if(save) {
                        modList = globalUtil.removeEmtpyElementsFromArray(modList)
                        let success     = server.writeIni("ark_GameModIds", modList.join(','))
                        res.render('ajax/json', {
                            data: JSON.stringify({
                                code        : success ? 47 : "FAIL",
                                success     : success,
                                sendToast   : false
                            })
                        })
                        return
                    }
                }
            }

            // Mods Aktivieren btw Deaktivieren
            if (action === "toggleActive" && userHelper.hasPermissions(SESS.uid, "mods/toggleMod", server.server)) {
                let activeMod   = POST.indikator === "false"
                let modSource   = POST.modId

                if(!isNaN(+modSource)) {
                    let currentIndex    = activeMod ? modList.indexOf(modSource) : false
                    let save

                    // Prüfe Mod position und schreibe diese um
                    if(activeMod) {
                        modList.splice(currentIndex, 1)
                        save    = true
                    }
                    else {
                        modList.push(modSource)
                        save    = true
                    }

                    // Änderungen übernehmen und Response
                    if(save) {
                        modList = globalUtil.removeEmtpyElementsFromArray(modList)
                        let success     = server.writeIni("ark_GameModIds", modList.join(','))
                        res.render('ajax/json', {
                            data: JSON.stringify({
                                code        : success ? 48 : "FAIL",
                                success     : success,
                                sendToast   : false
                            })
                        })
                        return
                    }
                }
            }

            // Mods Aktivieren btw Deaktivieren
            if (action === "toggleInstall" && userHelper.hasPermissions(SESS.uid, "mods/toggleInstallMod", server.server)) {
                let isInstalled = POST.indikator === "false"
                let modSource   = POST.modId
                if(!isNaN(+modSource)) {
                    let modDirLocation  = server.getInstalledModDirLocation()
                    let success

                    // Prüfe ob Mod installiert oder Deinstalliert werden muss
                    if(isInstalled) {
                        success    =
                           globalUtil.safeFileRmSync([modDirLocation, modSource])
                           && globalUtil.safeFileRmSync([modDirLocation, `${modSource}.mod`])
                    }
                    else {
                        commands.doArkmanagerCommand(server.server, `installmod "${modSource}"`, [])
                        success    = true
                    }

                    // Änderungen übernehmen und Response
                    res.render('ajax/json', {
                        data: JSON.stringify({
                            code        : success ? (!isInstalled ? 52 : 53) : "FAIL",
                            success     : success,
                            sendToast   : true
                        })
                    })
                    return
                }
            }

            // Mods Aktivieren btw Deaktivieren
            if (action === "remove" && userHelper.hasPermissions(SESS.uid, "mods/removeMod", server.server)) {
                let modSource   = POST.modId
                if(!isNaN(+modSource)) {
                    let modDirLocation  = server.getInstalledModDirLocation()
                    let success         = true
                    let isModInstalled  = globalUtil.safeFileExsistsSync([modDirLocation, modSource]) || globalUtil.safeFileExsistsSync([modDirLocation, `${modSource}.mod`])
                    let isModActive     = modList.includes(modSource)

                    // Prüfe Mod position und entferne diese
                    if(isModActive) {
                        modList.splice(modList.indexOf(modSource), 1)
                        modList = globalUtil.removeEmtpyElementsFromArray(modList)
                        success = server.writeIni("ark_GameModIds", modList.join(','))
                    }

                    // Prüfe ob Mod installiert oder Deinstalliert werden muss
                    if(isModInstalled) {
                        success    = success
                           && globalUtil.safeFileRmSync([modDirLocation, modSource])
                           && globalUtil.safeFileRmSync([modDirLocation, `${modSource}.mod`])
                    }

                    // Änderungen übernehmen und Response
                    res.render('ajax/json', {
                        data: JSON.stringify({
                            code        : success ? 50 : "FAIL",
                            success     : success,
                            sendToast   : false
                        })
                    })
                    return
                }
            }

            // Mods Hinzufügen
            if (action === "add" && userHelper.hasPermissions(SESS.uid, "mods/addMod", server.server)) {
                let modIds      = POST.modId
                let success     = false

                // ModIds lesen
                let modsToAdd    = []
                if(Array.isArray(modIds))
                    for(const element of modIds) {
                        if(element.name === "url[]") {
                            if(element.value.includes('https://')) {
                                let q     = url.parse(element.value, true).query
                                if(q.id) {
                                    if(!modsToAdd.includes(q.id)) modsToAdd.push(q.id)
                                }
                            }
                            else if(!isNaN(+element.value)) {
                                if(!modsToAdd.includes(element.value)) modsToAdd.push(element.value)
                            }
                        }
                    }

                // Mods schreiben
                if(modsToAdd.length !== 0) {
                    for (const modId of modsToAdd)
                        if (!modList.includes(modId.toString())) modList.push(modId.toString())

                    modList = globalUtil.removeEmtpyElementsFromArray(modList)
                    success = server.writeIni("ark_GameModIds", modList.join(','))
                }

                res.render('ajax/json', {
                    data: JSON.stringify({
                        code: success ? 51 : 54,
                        success: success,
                        sendToast: modsToAdd.length === 0
                    })
                })
                return
            }
        }


        res.render('ajax/json', {
            data: `{"code":"FAIL", "success":false}`
        })
        return
    })

    .get((req,res)=>{
        // DEFAULT AJAX
        let GET         = req.query
        let SESS        = req.session
        if(GET.server === undefined) GET.server = ''

        // GET Mods
        if(GET.Mods !== undefined && userHelper.hasPermissions(req.session.uid, "show_server", GET.server)) {
            let serverData  = new serverClass(GET.server)

            try {
                res.render('ajax/json', {
                    data: JSON.stringify(serverData.getINI().ark_GameModIds.split(','))
                })
                return true
            } catch (e) {}
        }

        // GET modFolderScan
        if(GET.modFolderScan !== undefined && userHelper.hasPermissions(req.session.uid, "show_server", GET.server)) {
            let serverData  = new serverClass(GET.server)

            let cfg         = {}
            let forbidden   = globalUtil.safeFileReadSync([mainDir, "app/json/server/template", "forbidden.json"], true)
            let currCfg     = serverData.getConfig()

            for (const [key, value] of Object.entries(currCfg))
                if(!forbidden[key])
                    cfg[key] = currCfg[key]

            try {
                res.render('ajax/json', {
                    data: JSON.stringify(globalUtil.safeFileReadDirSync([serverData.getInstalledModDirLocation()], false))
                })
                return true
            } catch (e) {}
        }

        res.render('ajax/json', {
            data: `{"request":"failed"}`
        })
        return true
    })

module.exports = router;
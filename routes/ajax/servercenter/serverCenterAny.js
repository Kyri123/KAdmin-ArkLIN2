/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2020-2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

const router                = require('express').Router()
const globalinfos           = require('./../../../app/src/global_infos')
const serverCommands        = require('./../../../app/src/background/server/commands')
const serverCommandsUtil    = require('./../../../app/src/background/server/commands_util')

router.route('/')

    .post((req,res)=>{
        let POST        = req.body;

        // Playeraction
        if(
            POST.sendPlayerAction !== undefined &&
            POST.command !== undefined &&
            userHelper.hasPermissions(req.session.uid, "sendCommands", POST.cfg)
        ) {
            res.render('ajax/json', {
                data: serverCommandsUtil.sendToScreen(POST.server, escape(POST.command.toString()))
            });
            return true
        }

        // Action Handle
        if(POST.actions !== undefined && POST.cfg !== undefined && userHelper.hasPermissions(req.session.uid, "actions", POST.cfg)) {
            if(POST.actions === "sendcommand") {
                let stop    = false
                let done    = false
                let para    = POST.para === undefined ? [] : POST.para
                let allowed = globalUtil.safeFileReadSync([mainDir, "public/json/sites", "serverCenterActions.cfg.json"], true)

                if(allowed.actions.includes(POST.action)) {
                    // Server Installieren
                    switch (POST.action) {
                        case "backup":
                            done = serverCommands.doBackup(POST.cfg, para)
                            break
                        default:
                            done = serverCommands.doArkmanagerCommand(POST.cfg, POST.action, para)
                    }

                    if (done) {
                        res.render('ajax/json', {
                            data: '{"success": true}'
                        })
                        return true
                    }
                }
            }
        }

        res.render('ajax/json', {
            data: `{"request":"failed"}`
        })
        return true
    })

    .get((req,res)=>{
        // DEFAULT AJAX
        let GET         = req.query;

        // GET Globale Infos
        if(GET.getglobalinfos !== undefined) {
            res.render('ajax/json', {
                data: JSON.stringify(globalinfos.get())
            });
            return true;
        }

        // Wenn keine Rechte zum abruf
        if(!userHelper.hasPermissions(req.session.uid, "show", GET.server)) return true;

        // GET serverInfos
        if(GET.getserverinfos !== undefined && GET.server !== undefined) {
            let serverData  = new serverClass(GET.server);
            res.render('ajax/json', {
                data: JSON.stringify(serverData.getServerInfos())
            });
            return true;
        }

        res.render('ajax/json', {
            data: `{"request":"failed"}`
        })
        return true
    })

module.exports = router;
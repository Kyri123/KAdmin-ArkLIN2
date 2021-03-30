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
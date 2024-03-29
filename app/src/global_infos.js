/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

const { array_replace_recursive }   = require('locutus/php/array')

module.exports = {
    /**
     * Gibt eine Arrayliste aller Server wieder
     * @return {array}
     */
    getServerList: () => {
        let serverLocalPath     = pathMod.join(mainDir, '/public/json/server')
        let servers             = []

        if(globalUtil.safeFileExsistsSync([serverLocalPath])) {
            let dirArray            = fs.readdirSync(serverLocalPath)

            dirArray.forEach((ITEM,KEY) => {
                try {
                    // Serverliste
                    if(globalUtil.safeFileExsistsSync([serverLocalPath, ITEM])) {
                        let array   = globalUtil.safeFileReadSync([serverLocalPath, ITEM], true)
                        if(array !== false) {
                            ITEM            = ITEM.replace(".json", '')
                            let serverData  = new serverClass(ITEM)
                            array           = array_replace_recursive(array, serverData.getServerInfos(), serverData.getConfig(), serverData.getINI())
                            servers[ITEM]   = array
                        }
                    }
                    else {
                        globalUtil.safeFileRmSync([serverLocalPath, ITEM])
                    }
                }
                catch (e) {
                    if(debug) console.log('[DEBUG_FAILED]', e)
                }
            })
        }

        return servers
    },

    get: () => {
        let infos               = {}
        let file                = globalUtil.safeFileReadSync([mainDir, '/public/json/serverInfos/', 'auslastung.json'], true)
        infos.server_data       = file !== false ? file : {}

        // Erkenne die Server
        infos.servers_arr       = Object.entries(module.exports.getServerList())

        // Zähle Server welche on/off sind
        infos.servercounter         = {}
        infos.servercounter.on      = 0
        infos.servercounter.off     = 0
        infos.servercounter.proc    = 0
        infos.servercounter.total   = infos.servers_arr.length

        infos.servers_arr.forEach((val) => {
            if(val[1].online) {
                infos.servercounter.on++
            }
            else if(!val[1].is_free || (!val[1].online && val[1].run)) {
                infos.servercounter.proc++
            }
            else {
                infos.servercounter.off++
            }
        })

        return infos
    }
}
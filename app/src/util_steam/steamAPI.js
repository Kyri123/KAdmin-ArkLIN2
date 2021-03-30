/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */

const querystring   = require('querystring');
const http          = require('http');

module.exports = {
   /**
    * Hole modliste von SteamAPI
    * @param {array} mods CMD command
    * @returns {boolean|array}
    */

   getModList: (mods) => {
      if (Array.isArray(mods)) {
         // Post Infos
         let post_data_obj = {
            key: CONFIG.app.steamAPIKey,
            itemcount: mods.length
         }

         mods.forEach((val, key) => {
            post_data_obj[`publishedfileids[${key}]`] = val
         })

         let post_data = querystring.stringify(post_data_obj)

         // Optionen
         let options = {
            host: 'api.steampowered.com',
            port: 80,
            path: '/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
            method: 'POST',
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
               'Content-Length': Buffer.byteLength(post_data)
            }
         }

         let data = ''
         let req = http.request(options, (res) =>  {
            res.setEncoding('utf8')
            res.on('data', (re) => {
               data += re
            })
         })

         req.on('error', (e) => {
            if (debug) console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}][DEBUG_FAILED]\x1b[36m problem with request: ` + e.message)
         })

         req.on('close', () => {
            try {
               let APIRequest = JSON.parse(data)
               let result     = {}

               for(const mod of APIRequest.response.publishedfiledetails) {
                  result[mod.publishedfileid] = mod
               }

               globalUtil.safeFileSaveSync([mainDir, '/public/json/steamAPI/', 'mods.json'], JSON.stringify(result))
            }
            catch (e) {
               if(debug) console.log('[DEBUG_FAILED]', e)
            }

         })

         req.write(post_data)
         req.end()
      }
   },
   /**
    * Hole Spielerliste von SteamAPI
    * @param {array} mods CMD command
    * @returns {boolean|array}
    */

   getPlayerList: (players) => {
      if (Array.isArray(players)) {

         // Optionen
         let options = {
            host: 'api.steampowered.com',
            port: 80,
            path: `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${CONFIG.app.steamAPIKey}&steamids=${players.join(',')}`,
            method: 'GET',
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
            }
         }

         let data = ''
         let req = http.request(options, (res) =>  {
            res.setEncoding('utf8')
            res.on('data', (re) => {
               data += re
            })
         })

         req.on('error', (e) => {
            if (debug) console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}][DEBUG_FAILED]\x1b[36m problem with request: ` + e.message)
         })

         req.on('close', () => {
            try {
               let APIRequest = JSON.parse(data)
               let result        = {}
               result.idList     = {}
               result.nameList   = {}

               for(const player of APIRequest.response.players) {
                  result.idList[player.steamid]       = player
                  result.nameList[player.personaname] = player
               }

               globalUtil.safeFileSaveSync([mainDir, '/public/json/steamAPI/', 'players.json'], JSON.stringify(result))
            }
            catch (e) {
               if(debug) console.log('[DEBUG_FAILED]', e)
            }

         })

         req.end()
      }
   }
}
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

router.route('/')

   .post((req,res) => {
      let POST             = req.body
      let SESS             = req.session
      let action           = POST.action
      let clusterFilePath  = [mainDir, "public/json/cluster/clusters.json"]
      let clusterFile      = globalUtil.safeFileReadSync(clusterFilePath, true)
      if(clusterFile === false) clusterFile = []
      let defClusterFile   = globalUtil.safeFileReadSync([mainDir, "public/json/cluster/defaultCluster.json"], true)

      if(action === "edit" && userHelper.hasPermissions(SESS.uid, "cluster/editCluster")) {
         let isSync        = POST.type === "sync"
         let clusterIndex  = +POST.clusterIndex
         let changeTo      = POST.indikator === "true"
         let key           = POST.key.toString().trim()
         let success       = false

         if(clusterFile[clusterIndex]) {
            if(clusterFile[clusterIndex][isSync ? 'sync' : 'opt'][key] !== undefined) {
               clusterFile[clusterIndex][isSync ? 'sync' : 'opt'][key] = changeTo
               success  = globalUtil.safeFileSaveSync(clusterFilePath, JSON.stringify(clusterFile))
            }
         }

         // Response
         res.render('ajax/json', {
            data: JSON.stringify({
               code: 0,
               success: success,
               sendToast: false
            })
         })
         return
      }

      if(action === "promote" && userHelper.hasPermissions(SESS.uid, "cluster/toggleSlaves")) {
         let clusterIndex  = +POST.clusterIndex
         let serverIndex   = +POST.serverIndex
         let success       = false

         if(clusterFile[clusterIndex]) {
            // Suche nach bestehenden Master
            for(const i in clusterFile[clusterIndex].servers)
               if(+clusterFile[clusterIndex].servers[i].type === 1)
                  clusterFile[clusterIndex].servers[i].type = 0

            // Schreibe Infos und Speichern
            clusterFile[clusterIndex].servers[serverIndex].type = 1
            success  = globalUtil.safeFileSaveSync(clusterFilePath, JSON.stringify(clusterFile))
         }

         // Response
         res.render('ajax/json', {
            data: JSON.stringify({
               code: 0,
               success: success,
               sendToast: false
            })
         })
         return
      }

      if(action === "addServer" && userHelper.hasPermissions(SESS.uid, "cluster/addServers")) {
         let clusterIndex  = +POST.clusterIndex
         let server        = new serverClass(POST.servernameName)
         let success       = false

         if(clusterFile[clusterIndex] && server.serverExsists()) {
            if(!server.isServerInCluster()) {
               // Suche nach bestehenden Master
               let masterIsFound = false
               for (const i in clusterFile[clusterIndex].servers)
                  if (+clusterFile[clusterIndex].servers[i].type === 1)
                     masterIsFound = true

               // Schreibe Infos und Speichern
               clusterFile[clusterIndex].servers.push({
                  server: server.server,
                  type: masterIsFound ? 0 : 1
               })
               success = globalUtil.safeFileSaveSync(clusterFilePath, JSON.stringify(clusterFile))
            }
         }

         // Response
         res.render('ajax/json', {
            data: JSON.stringify({
               code: 0,
               success: success,
               sendToast: false
            })
         })
         return
      }

      if(action === "remove" && userHelper.hasPermissions(SESS.uid, "cluster/removeServers")) {
         let clusterIndex  = +POST.clusterIndex
         let serverIndex   = +POST.serverIndex
         let success       = false

         if(clusterFile[clusterIndex]) {
            if(clusterFile[clusterIndex].servers[serverIndex]) {
               // Suche nach bestehenden Master
               clusterFile[clusterIndex].servers.splice(serverIndex, 1)

               success = globalUtil.safeFileSaveSync(clusterFilePath, JSON.stringify(clusterFile))
            }
         }

         // Response
         res.render('ajax/json', {
            data: JSON.stringify({
               code: 0,
               success: success,
               sendToast: false
            })
         })
         return
      }

      if(action === "addCluster" && userHelper.hasPermissions(SESS.uid, "cluster/createCluster")) {
         let clusterName   = POST.clusterName
         let success       = false

         if(clusterName.toString().trim().search(/^[a-zA-Z0-9]+$/) !== -1) {
            let clusterID  = md5(clusterName)

            // Suche nach bestehenden namen (ClusterID)
            let clusterIsExsists = false
            for (const cluster of clusterFile)
               if (cluster.clusterid === clusterID)
                  clusterIsExsists = true

            if(!clusterIsExsists && defClusterFile !== false) {
               let newCluster       = defClusterFile
               newCluster.name      = clusterName
               newCluster.clusterid = clusterID

               clusterFile.push(newCluster)
               success = globalUtil.safeFileSaveSync(clusterFilePath, JSON.stringify(clusterFile))
            }
         }
      }

      if(action === "removeCluster" && userHelper.hasPermissions(SESS.uid, "cluster/removeCluster")) {
         let clusterIndex  = +POST.clusterIndex
         let success       = false

         if(clusterFile[clusterIndex]) {
            clusterFile.splice(clusterIndex, 1)
            success = globalUtil.safeFileSaveSync(clusterFilePath, JSON.stringify(clusterFile))
         }

         // Response
         res.render('ajax/json', {
            data: JSON.stringify({
               code: 0,
               success: success,
               sendToast: false
            })
         })
         return
      }

      res.render('ajax/json', {
         data: `{"request":"failed"}`
      })
      return true
   })

   .get((req,res) => {
      let GET         = req.query

      res.render('ajax/json', {
       data: `{"request":"failed"}`
      })
      return true
   })

module.exports = router;
/*
* *******************************************************************************************
* @author:  Oliver Kaufmann (Kyri123)
* @copyright Copyright (c) 2019-2020, Oliver Kaufmann
* @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
* Github: https://github.com/Kyri123/KAdmin-ArkLIN2
* *******************************************************************************************
*/
"use strict"

const VUE_clusterControler = new Vue({
   el    : '#clusterControler',
   data  : {
      clusters : [],
      servers  : {}
   },
   methods : {
      /**
       * Holt Cluster Informationen
       */
      getInfos() {
         $.get('/json/serverInfos/allServers.json')
            .done((data) => {
               let servers = {}
               for(const server of data)
                  $.ajax({
                     async: false,
                     type: 'GET',
                     url: `/json/server/${server}.json`,
                     success: function(data) {
                        servers[server] = data
                     }
                  })

               $.get('/json/cluster/clusters.json')
                  .done((data) => {
                     if(typeof servers === "object" && Array.isArray(data)) {
                        this.servers = servers

                        for(const i in data) {
                           data[i].servers = data[i].servers.sort((a, b) => b.type - a.type)
                        }

                        this.clusters = data
                     }
                  })
            })
      },

      /**
       * Sendet eine Anfrage zum Server um aktionen zu verarbeiten
       * @param {string} action
       * @param {string|number} clusterIndex
       * @param {boolean|string} indikator
       * @param {object} moreInfos
       */
      sendRequest(action, clusterIndex, indikator, moreInfos = {}) {
         let mainInfos  = {
            action         : action,
            clusterIndex   : clusterIndex,
            indikator      : indikator
         }
         let postInfos  = {
            ...mainInfos,
            ...moreInfos
         }

         $.post('/ajax/cluster', postInfos)
            .done((data) => {
               let response   = JSON.parse(data)
               if(response.sendToast) fireToast(response.code, response.success ? "success" : "error")
               this.getInfos()
            })
            .fail(() => {
               fireToast("FAIL", "error")
            })
      },

      /**
       * erzeugt ein Modal um einen Cluster hinzuzufügen
       */
      fireAddModal() {
         swalWithBootstrapButtons.fire({
            icon: 'question',
            text: undefined,
            title: `<strong>${globalvars.lang_arr.cluster.addCluster}</strong>`,
            showCancelButton: true,
            confirmButtonText: `<i class="fas fa-save"></i>`,
            cancelButtonText: `<i class="fas fa-times"></i>`,
            input: 'text',
         }).then((result) => {
            if(result.isConfirmed && result.value.toString().trim() !== "" && result.value.toString().trim().search(/^[a-zA-Z0-9]+$/) !== -1) {
               this.sendRequest("addCluster", 0, true, {clusterName: result.value})
            }
            else if(result.isConfirmed) {
               fireToast("FAIL", "error")
            }
         })
      },

      /**
       * erzeugt ein Modal um einen Cluster hinzuzufügen
       * @param {string|number} clusterIndex
       */
      fireAddServerModal(clusterIndex) {
         let inputs   = {}

         for(const server of Object.entries(this.servers)) {
            let serverIsInCluster   = false
            for(const cluster of this.clusters)
               for(const clusterServer of cluster.servers) {
                  if(clusterServer.server === server[0]) serverIsInCluster = true
               }

            if(!serverIsInCluster) inputs[server[0]] = server[1].selfname
         }

         if(!jQuery.isEmptyObject(inputs)) {
            swalWithBootstrapButtons.fire({
               icon: 'question',
               text: undefined,
               title: `<strong>${globalvars.lang_arr.cluster.addServer}</strong>`,
               showCancelButton: true,
               confirmButtonText: `<i class="fas fa-save"></i>`,
               cancelButtonText: `<i class="fas fa-times"></i>`,
               inputOptions: inputs,
               input: 'select'
            }).then((result) => {
               if (result.isConfirmed && result.value.toString().trim() !== "" && result.value.toString().trim().search(/^[a-zA-Z0-9]+$/) !== -1) {
                  this.sendRequest("addServer", clusterIndex, true, {servernameName: result.value})
               } else if (result.isConfirmed) {
                  fireToast("FAIL", "error")
               }
            })
         }
         else {
            fireToast("noServerFound", "warning")
         }
      },
      
      /**
       * generiert aus dem Server die Farbe und eigenschaft
       * @param {object} server
       */
      stateColor(server) {
         let                                                              stateColor  = "danger"
         if(!server.is_installed)                                         stateColor  = "warning"
         if(server.pid !== 0 && server.online)                            stateColor  = "success"
         if((server.pid !== 0 && !server.online) || !server.isFree)       stateColor  = "primary"
         if(server.is_installing)                                         stateColor  = "info"
         
         return stateColor
      }
   },
   created() {
      this.getInfos()
      setInterval(() => this.getInfos(), 2000)
   }
})
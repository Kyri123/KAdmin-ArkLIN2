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

                        console.log(data)
                        for(const i in data) {
                           data[i].servers = data[i].servers.sort((a, b) => b.type - a.type)
                        }

                        this.clusters = data
                     }
                  })
            })
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
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
const globalinfos       = require('./../../../app/src/global_infos');
const serverClass       = require('./../../../app/src/util_server/class');


router.route('/')

    .all((req,res)=>{
       global.user         = userHelper.getinfos(req.session.uid);
       // DEFAULT ServerCenter
       let GET           = req.query
       let POST          = req.body
       let response      = ""
       let cookies       = req.cookies
       let langStr       = (cookies.lang !== undefined) ?
          fs.existsSync(pathMod.join(mainDir, "lang", cookies.lang)) ?
             cookies.lang : "de_de"
          : "de_de"
       let lang          = LANG[langStr]
       let serverName    = req.baseUrl.split('/')[2]

      if(!userHelper.hasPermissions(req.session.uid, "config/show", serverName) || !userHelper.hasPermissions(req.session.uid, "show", serverName)) {
         res.redirect("/401");
         return true;
      }

       let serverData    = new serverClass(serverName);
       let servCfg       = serverData.getConfig();
       let servIni       = serverData.getINI();
       let jars          = []

       if(fs.existsSync(servCfg.path)) fs.readdirSync(servCfg.path).forEach(file => {
          if(file.includes(".jar")) jars.push(file)
       })

      // Render Seite
      res.render('pages/servercenter/serverCenter_config', {
          userID                  : req.session.uid,
          page                    : "servercenter_config",
          response                : response,
          lang                    : lang,
          perm                    : userHelper.permissions(req.session.uid),
          sinfos                  : globalinfos.get(),
          servini                 : servIni,
          servinfos               : serverData.getServerInfos(),
          servcfg                 : servCfg,
          sclass                  : serverData,
          serverName              : serverName,
          jars                    : jars,
          breadcrumb      : [
              lang.breadcrumb["servercenter"],
              serverName,
              lang.breadcrumb["servercenter_config"],
          ]
      });
 })

module.exports = router;
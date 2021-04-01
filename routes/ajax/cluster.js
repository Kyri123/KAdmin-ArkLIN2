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
      let POST        = req.body
      let SESS        = req.session


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
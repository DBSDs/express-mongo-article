const { response } = require('express');
var express = require('express');
var router = express.Router();
var model = require('../model');

// 登录接口
router.post('/login', function(req, res , next) {
  var data = {
    username: req.body.username,
    password: req.body.password
  };
  model.connect(function(db) {
    db.collection('users').find(data).toArray(function(err, docs) {
      if (err) {
        res.redirect('/login');
      } else {
        if(docs.length > 0) {
          // 登录成功,进行session会话存储
          req.session.username = data.username;
          res.redirect('/');
        } else {
          res.redirect('/login');
        }
      }
    });
  });
});

// 退出登录
router.get('/logout', function(req, res, next) {
  req.session.username = null;
  res.redirect('/login');
});
module.exports = router;

var express = require('express');
var router = express.Router();
var model = require('../model');
var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
  var username = req.session.username || '';
  var page = req.query.page || 1;
  var data = {
    total: 0, // 总共有多少页
    curPage: page,
    list: []  // 当前页的文章列表
  };
  var pageSize = 2;

  model.connect(db => {
    // 1-查询所有文章
    db.collection('article').find().toArray(function(err, docs) {
      console.log('文章列表',err);
      data.total = Math.ceil(docs.length / pageSize);
      // 2-查询当前页的文章列表
      model.connect(db => {
        //  sort() limit() skip()
        db.collection('article').find().sort({_id: -1 }).limit(pageSize).skip((page - 1) * pageSize)
        .toArray((err, docs2) => {
          if (docs.length === 0) {
            res.redirect('/?page='+(page - 1) || 1);
          } else {
            docs2.map((item,index) => {
              item.time = moment(item.id).format('YYYY-MM-DD HH:mm:ss');
            });
            data.list =docs2;
          }
          res.render('index', {username: username, data: data});
        });
      });
    });
  });
});

//渲染注册页
router.get('/regist', function(req, res, next) {
  res.render('regist', {});
});

// 渲染登录页
router.get('/login', function(req, res, next) {
  res.render('login', {});
});

// 渲染写文章页面 / 编辑文章页面
router.get('/write', function(req, res, next) {
  var username = req.session.username || '';
  var id = parseInt(req.query.id);
  var page = req.query.page;
  var item = {
    title: '',
    content: '',
  };
  if (id) { // 编辑
    model.connect(function(db) {
      db.collection('article').findOne({id: id},function(err, docs) {
        if (err) {
          console.log('查询失败');
        } else {
          item = docs;
          item['page'] = page;
          res.render('write', {username: username, item: item});
        }
      });
    });
  } else { // 新增
    res.render('write', {username: username, item: item});
  }
});

// 渲染详情页面
router.get('/detail', function(req, res, next) {
  var id = parseInt(req.query.id);
  model.connect(function(db) {
    db.collection('article').findOne({id: id}, function(err, doc) {
      if (err) {
        console.log('查询失败');
      } else {
        var item = doc;
        item.time = moment(item.id).format('YYYY-MM-DD HH:mm:ss');
        res.render('detail', {item: item});
      }
    });
  });
});
module.exports = router;

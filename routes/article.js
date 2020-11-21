const {
  response
} = require('express');
var express = require('express');
var router = express.Router();
var model = require('../model');
var multiparty = require('multiparty');
var fs = require('fs');

// 新增
router.post('/add', function (req, res, next) {
  var id = parseInt(req.body.id);
  if (id) {  // 编辑
    var page = req.body.page;
    var title = req.body.title;
    var content = req.body.content;
    model.connect(function(db) {
      db.collection('article').updateOne({id: id }, {$set: {
        title: title,
        content: content,
      }}, function (err, ret) {
        if (err) {
          console.log('修改失败', err);
        } else {
          console.log('修改成功');
          res.redirect('/?page='+page);
        }
      });
    });
  } else {  // 新增
    var data = {
      title: req.body.title,
      content: req.body.content,
      id: Date.now(),
      username: req.session.username || '未知用户',
    };
    model.connect(function (db) {
      db.collection('article').insertOne(data, function (err, ret) {
        if (err) {
          console.log('文章发布失败');
          res.redirect('/write');
        } else {
          res.redirect('/');
        }
      });
    });
  }
});

router.get('/delete', function (req, res, next) {
  var id = parseInt(req.query.id);
  var page = req.query.page;
  model.connect(function (db) {
    db.collection('article').deleteOne({
      id: id
    }, function (err, ret) {
      if (err) {
        console.log('删除失败');
      } else {
        console.log('删除成功');
      }
      res.redirect('/?page='+page); 
    });
  });
});

router.post('/upload', function(req, res, next) {
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('文件列表',files);
      var file =files.filedata[0];

      var rs =fs.createReadStream(file.path);
      var newPath ='/upload/' + file.originalFilename;
      var ws =fs.createWriteStream('./public'+ newPath);
      rs.pipe(ws);
      ws.on('colse', function() {
        console.log('文件上传成功');
        res.send({err:'',msg:newPath});
      });
    }
  });
});
module.exports = router;
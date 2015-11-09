/*
   Copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   Licensed under the Apache License, Version 2.0 (the "License"). You
   may not use this file except in compliance with the License. A copy
   of the License is located at

      http://aws.amazon.com/apache2.0/

   or in the "license" file accompanying this file. This file is
   distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS
   OF ANY KIND, either express or implied. See the License for the
   specific language governing permissions and limitations under the
   License.
 */
var express = require('express');
var app = express();
var path = require('path');
var os = require('os');
var bodyParser = require('body-parser');
var fs = require('fs');

var add_comment = function(comment) {
    var comments = get_comments();
    comments.push({"date": new Date(), "text": comment});
    fs.writeFileSync('./comments.json', JSON.stringify(comments));
};

var get_comments = function() {
    var comments;
    if (fs.existsSync('./comments.json')) {
        comments = fs.readFileSync('./comments.json');
        comments = JSON.parse(comments);
    } else {
        comments = [];
    }
    return comments;
};

app.use(function log (req, res, next) {
  console.log([req.method, req.url].join(' '));
  next();
});
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'jade');
app.get('/', function(req, res) {
    var comments = get_comments();
    res.render("index",
               { agent: req.headers['user-agent'],
                 hostname: os.hostname(),
                 os: os.type(),
                 nodeversion: process.version,
                 time: new Date(),
                 admin: (process.env.APP_ADMIN_EMAIL || "admin@unconfigured-value.com" ),
                 comments: get_comments()
               });
});

app.post('/', function(req, res) {
    var comment = req.body.comment;
    if (comment) {
        add_comment(comment);
        console.log("Got comment: " + comment);
    }
    res.redirect("/#form-section");
});

var server = app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on %s', process.env.PORT);
});

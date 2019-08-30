/**
 * TeacherController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

require('../models/User');
require('../models/Module');
require('../models/Coursework');

module.exports = {
  myModule: async function (req, res) {

    var enrollment = await User.findOne({
      id: req.session.user.id
    }).populate('enrolledModules');

    if (!enrollment) {
      res.send({
        error: 'database error',
      });
    } else {
      res.view('user/teacher/my-module', {
        modules: enrollment.enrolledModules,
        layout: 'layouts/user-layout'
      });
    }
  },

  moduleDetail: async function (req, res) {
    await Module.findOne({
      id: req.param('id')
    }).populate('courseworks').exec((err, module) => {
      if (err) {
        req.next(err);
      }
      console.log(module.courseworks);
      res.view('user/teacher/module-detail', {
        courseworks: module.courseworks,
        module: module,
        layout: 'layouts/user-layout'
      });
    });
  },

  newCoursework: async function (req, res) {
    await Module.findOne({
      id: req.param('id')
    }).exec((err, module) => {
      if (err) {
        req.next(err);
      }
      res.view('user/teacher/new-coursework', {
        module: module,
        layout: 'layouts/user-layout'
      });
    });
  },

  createCoursework: async function (req, res) {
    console.log('repository:', req.param('repository'));
    await Coursework.create({
      courseworkTitle: req.param('title'),
      programLanguage: req.param('language'),
      coureseworkDetail: req.param('instruction'),
      deadline: req.param('deadline'),
      myModule: req.param('id'),
      testCodeReporsitory: req.param('repository'),
      script: req.param('script'),
    });

    var fs = require('fs');
    var xml2js = require('xml2js');
    var requestForCrumb = require('request');
    var options = {
      url: sails.config.jenkins.host + '/crumbIssuer/api/json',
      auth: {
        'username': sails.config.jenkins.username,
        'password': sails.config.jenkins.password,
      }
    };

    await requestForCrumb(options, (err, response, body) => {
      if (err) {
        throw new Error(err);
      }
      var crumbData = JSON.parse(body);
      var crumb = crumbData['crumb'];

      fs.readFile('xml/config.xml', (err, config) => {
        if (err) {
          req.next(err);
        }
        var parser = new xml2js.Parser();
        console.log('config', config);
        parser.parseString(config, (err, result) => {
          if (err) {
            req.next(err);
          }
          console.dir(result);
          result.project.scm[0].userRemoteConfigs[0]['hudson.plugins.git.UserRemoteConfig'][0]['url'] = req.param('repository');
          var builder = new xml2js.Builder();
          var data = builder.buildObject(result);
          console.log('*********************');

          var jobName = req.param('title');
          var request = require('request');
          var options = {
            method: 'POST',
            url: sails.config.jenkins.host + '/createItem',
            qs: {
              name: jobName
            },
            auth: {
              'username': sails.config.jenkins.username,
              'password': sails.config.jenkins.password,
            },
            headers: {
              Connection: 'keep-alive',
              Host: 'localhost:8080',
              Authorization: 'Basic',
              'Content-Type': 'application/xml',
              'Jenkins-Crumb': crumb,
            },
            body: data
          };
          request(options, async (error, response, body) => {
            if (error) {
              throw new Error(error);
            }
            var reqBuild = require('request');
            var buildUrl = sails.config.jenkins.host + '/job/' + jobName + '/build?token=sails';
            var buildOptions = {
              url: buildUrl,
              auth: {
                'username': sails.config.jenkins.username,
                'password': sails.config.jenkins.password,
              }
            };
            await reqBuild(buildOptions, (error, response, body) => {
              if (error) {
                throw new Error(error);
              }
            });
          });
        });
      });
    });
    res.redirect('/teacher/module_detail/' + req.param('id'));

  },

  // createCoursework: async function (req, res) {
  //   console.log('script:', req.param('repository'));
  //   await Coursework.create({
  //     courseworkTitle: req.param('title'),
  //     programLanguage: req.param('language'),
  //     coureseworkDetail: req.param('instruction'),
  //     deadline: req.param('deadline'),
  //     myModule: req.param('id'),
  //     testCodeReporsitory: req.param('repository'),
  //     script: req.param('script'),
  //   });
  //   res.redirect('/teacher/module_detail/' + req.param('id'));

  // }

};

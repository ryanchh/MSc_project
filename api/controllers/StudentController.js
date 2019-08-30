/* eslint-disable prefer-arrow-callback */
/* eslint-disable eqeqeq */
/**
 * StudentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

require('../models/User');
require('../models/Module');
require('../models/Coursework');
require('../models/Attempt');
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
      res.view('user/student/my-module', {
        modules: enrollment.enrolledModules,
        layout: 'layouts/user-layout'
      });
    }
  },

  moduleDetail: async function (req, res) {
    var module = await Module.findOne({
      id: req.param('id')
    }).populate('enrolledByUsers', {
      authority: 2
    }).populate('courseworks');
    var teacher = module.enrolledByUsers;
    var courseworks = module.courseworks;
    res.view('user/student/module-detail', {
      courseworks: courseworks,
      teacher: teacher,
      module: module,
      layout: 'layouts/user-layout'
    });
  },

  courseworkDetail: async function (req, res) {
    var cw = await Coursework.findOne({
      id: req.param('id')
    });
    var moduleId = cw.myModule;
    var module = await Module.findOne({
      id: moduleId
    });
    var attempts = await Attempt.find({
      student: req.session.user.id,
      coursework: req.param('id')
    });

    await attempts.forEach(async function (attempt) {
      var email = req.session.user.emailAddress.split('@')[0];
      var jobName = cw.courseworkTitle.replace(' ', '_') + '-' + email;

      var requestForReport = require('request');
      var url = sails.config.jenkins.host + '/job/' + jobName + '/' + attempt.attemptCount + '/testReport/api/json';
      var options = {
        url: url,
        auth: {
          username: sails.config.jenkins.username,
          password: sails.config.jenkins.password,
        },
      };

      await requestForReport(options, async (err, response, body) => {
        if (err) {
          throw new Error(err);
        }
        body = JSON.parse(body);
        var grade = parseInt((body['passCount'] / (body['failCount'] + body['passCount'])) * 100);
        console.log(grade);
        await Attempt.update({
          id: attempt.id
        }).set({
          grade: grade
        });
      });
    });
    // console.log(attempts);

    res.view('user/student/coursework-detail', {
      attempts: attempts,
      module: module,
      coursework: cw,
      layout: 'layouts/user-layout'
    });
  },

  newAttempt: async function (req, res) {
    var cw = await Coursework.findOne({
      id: req.param('id')
    });
    res.view('user/student/new-attempt', {
      coursework: cw,
      layout: 'layouts/user-layout'
    });
  },

  postAttempt: async function (req, res) {
    var coursework = await Coursework.findOne({
      id: req.param('id')
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

    await requestForCrumb(options, async (err, response, body) => {
      if (err) {
        throw new Error(err);
      }
      var crumbData = JSON.parse(body);
      crumb = crumbData['crumb'];

      fs.readFile('xml/pipeline.xml', (err, config) => {
        if (err) {
          req.next(err);
        }
        var parser = new xml2js.Parser();
        parser.parseString(config, async (err, result) => {
          if (err) {
            req.next(err);
          }
          // console.log('coursework.script:',coursework.script);
          console.log('result script: ', result['flow-definition']['definition'][0]['script']);
          var script = coursework.script;
          script = script.replace(/studentEmail/g,req.session.user.emailAddress);
          script = script.replace('studentRepository',req.param('repository'));
          result['flow-definition']['definition'][0]['script'] = script;
          var builder = new xml2js.Builder();
          var data = builder.buildObject(result);
          var email = req.session.user.emailAddress.split('@')[0];
          var jobName = coursework.courseworkTitle.replace(' ', '_') + '-' + email;

          // data = data.replace('scirptFlag','<![CDATA['+coursework.script+']]>');
          // console.log('data:',data);
          var attempts = await Attempt.find({
            where: {
              repository: req.param('repository'),
              student: req.session.user.id,
              coursework: req.param('id'),
            },
            sort: 'attemptCount DESC'
          });
          var path = '/createItem';
          var count = 1;
          console.log('attempts:', attempts);
          if (attempts != '') {
            path = '/job/' + jobName + '/config.xml';
            count = count + attempts[0]['attemptCount'];
          }
          console.log(path);
          console.log(count);
          var request = require('request');
          var options = {
            method: 'POST',
            url: sails.config.jenkins.host + path,
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
            body: data,
          };
          // console.log('options: ', options);
          request(options, async (error, response, body) => {
            if (error) {
              throw new Error(error);
            }
            // console.log(response.statusCode);
            if (response.statusCode == 200) {
              // console.log('email:',email);

              var reqForBuildJob = require('request');
              var reqForBuildJobUrl = sails.config.jenkins.host + '/job/' + jobName + '/build?token=sails';
              var reqForBuildJobOptions = {
                url: reqForBuildJobUrl,
                auth: {
                  'username': sails.config.jenkins.username,
                  'password': sails.config.jenkins.password,
                }
              };
              await reqForBuildJob(reqForBuildJobOptions, async (err, response, body) => {
                if (err) {
                  throw new Error(err);
                }
                if (response.statusCode == 201) {
                  console.log('build job success');
                  await Attempt.create({
                    repository: req.param('repository'),
                    student: req.session.user.id,
                    coursework: req.param('id'),
                    attemptCount: count,
                  });
                } else {
                  console.log('build failed');
                }
                res.redirect('/student/coursework_detail/' + req.param('id'));
              });
            } else {
              console.log('error occured when creating new job on jenkins.');
            }
          });
        });
      });
    });
  },

  attemptDetail: async function (req, res) {

    console.log('attempt detail');
    var attempt = await Attempt.findOne({
      id: req.param('id')
    });
    var cw = await Coursework.findOne({
      id: req.param('cwId')
    });
    var email = req.session.user.emailAddress.split('@')[0];
    var jobName = cw.courseworkTitle.replace(' ', '_') + '-' + email;
    var request = require('request');
    var options = {
      url: sails.config.jenkins.host + '/blue/rest/organizations/jenkins/pipelines/' + jobName + '/runs/' + attempt.attemptCount + '/nodes?tree=id,result,state,edges[id],displayName',
      auth: {
        username: sails.config.jenkins.username,
        password: sails.config.jenkins.password
      }
    };
    request(options, async function (err, presponse, pbody) {
      if (err) {
        console.log(err);
        throw new Error(err);
      }
      var requestForReport = require('request');
      var url = sails.config.jenkins.host + '/job/' + jobName + '/' + attempt.attemptCount + '/testReport/api/json';
      var rptoptions = {
        url: url,
        auth: {
          username: sails.config.jenkins.username,
          password: sails.config.jenkins.password,
        },
      };
      await requestForReport(rptoptions, async (err, response, body) => {
        if (err) {
          throw new Error(err);
        }
        console.log('response:', response.statusCode);
        var results = [];
        if (response.statusCode == 200) {
          console.log('get report');
          body = JSON.parse(body);
          // console.log(body);
          var grade = parseInt((body['passCount'] / (body['failCount'] + body['passCount'])) * 100);
          // console.log(body['suites'][0]['cases']);
          results = body['suites'][0]['cases'];
          await Attempt.update({
            id: attempt.id
          }).set({
            grade: grade,
          }, function (err) {
            if (err) {
              throw new Error(err);
            }
          });
        } else {
          console.log('no report');
        }
        var data = [];
        if (presponse.statusCode == 200) {
          console.log('pbody', pbody);
          data = JSON.parse(pbody);
        }

        res.view('user/student/attempt-detail', {
          nodes: data,
          results: results,
          attempt: attempt,
          layout: 'layouts/user-layout'
        });
      });
      // data = JSON.parse(pbody);
      // res.view('user/student/attempt-detail', {
      //   nodes: data,
      //   results: results,
      //   attempt: attempt,
      //   layout: 'layouts/user-layout'
      // });
    });
  },

};

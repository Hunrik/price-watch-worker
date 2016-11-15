'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _priceCheck = require('./priceCheck');

var _sendMail = require('./sendMail');

var _siteProcessor = require('./siteProcessor');

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _config = require('./config.js');

var _config2 = _interopRequireDefault(_config);

var _each = require('async/each');

var _each2 = _interopRequireDefault(_each);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var QueueUrl = 'https://sqs.eu-central-1.amazonaws.com/284590800778/Parser';
var sqs = new _awsSdk2.default.SQS();
_bluebird2.default.promisifyAll((0, _getPrototypeOf2.default)(sqs));
var shouldProcess = true;
var benchmark = 0;
var process = function process(resp) {
  return new _bluebird2.default(function (resolve, reject) {
    (0, _each2.default)(resp, function (message, callback) {
      var _JSON$parse = JSON.parse(message.Body),
          data = _JSON$parse.data,
          type = _JSON$parse.type;

      if (type === 'page') {
        (0, _siteProcessor.SiteProcessor)(data).then(function () {
          benchmark++;
          return sqs.deleteMessageAsync({
            QueueUrl: QueueUrl,
            ReceiptHandle: message.ReceiptHandle
          });
        }).then(callback);
      }
      if (type === 'product') {
        (0, _priceCheck.priceCheck)(data).then(function () {
          benchmark++;
          return sqs.deleteMessageAsync({
            QueueUrl: QueueUrl,
            ReceiptHandle: message.ReceiptHandle
          });
        }).then(callback);
      }
    }, resolve);
  });
};
var getQueue = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    var req, resp;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (shouldProcess) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return');

          case 2:
            req = {
              QueueUrl: QueueUrl,
              MaxNumberOfMessages: _config2.default.concurrency
            };
            _context.prev = 3;
            _context.next = 6;
            return sqs.receiveMessageAsync(req);

          case 6:
            resp = _context.sent;

            if (resp.Messages) {
              _context.next = 10;
              break;
            }

            shouldProcess = false;
            return _context.abrupt('return', console.log('Empty queue'));

          case 10:
            _context.next = 12;
            return process(resp.Messages);

          case 12:
            return _context.abrupt('return', getQueue());

          case 15:
            _context.prev = 15;
            _context.t0 = _context['catch'](3);
            return _context.abrupt('return', console.log(_context.t0));

          case 18:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 15]]);
  }));

  return function getQueue() {
    return _ref.apply(this, arguments);
  };
}();
var timeout = function timeout(ms) {
  return new _bluebird2.default(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

//exports.handler = async function (event, context, callback) {
var handler = _bluebird2.default.coroutine(_regenerator2.default.mark(function _callee2(event, context) {
  var params, remaining;
  return _regenerator2.default.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;

          getQueue();
          _context2.next = 4;
          return timeout(250000);

        case 4:
          // await timeout(25000)
          params = {
            AttributeNames: ['ApproximateNumberOfMessages'],
            QueueUrl: QueueUrl
          };

          shouldProcess = false;
          _context2.next = 8;
          return sqs.getQueueAttributesAsync(params);

        case 8:
          remaining = _context2.sent;

          remaining = remaining.Attributes.ApproximateNumberOfMessages;
          console.log('Messages:');
          console.log(remaining);

          if (!(remaining === '0')) {
            _context2.next = 16;
            break;
          }

          return _context2.abrupt('return');

        case 16:
          console.log('Restart');
          shouldProcess = true;
          benchmarker();
          return _context2.abrupt('return', restart());

        case 20:
          _context2.next = 25;
          break;

        case 22:
          _context2.prev = 22;
          _context2.t0 = _context2['catch'](0);

          callback(new Error(_context2.t0));

        case 25:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, this, [[0, 22]]);
}));
handler();
var benchmarker = function benchmarker() {
  console.log('Benchmark: ', Math.round(benchmark / 6));
  benchmark = 0;
  if (!shouldProcess) return;
  setTimeout(benchmarker, 6000);
};
benchmarker();

var restart = function restart() {
  var options = {
    uri: 'https://mjl05xiv1a.execute-api.eu-central-1.amazonaws.com/prod/shop-parser-production',
    headers: { 'x-api-key': '8XGbYeQwSqa5TwanMAJP6QMH1Ix0Yrj6ax5vQoW8' }
  };
  (0, _requestPromise2.default)(options);
};
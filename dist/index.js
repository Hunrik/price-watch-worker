'use strict';

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _priceCheck = require('./priceCheck');

var _priceCheck2 = _interopRequireDefault(_priceCheck);

var _siteProcessor = require('./siteProcessor');

var _siteProcessor2 = _interopRequireDefault(_siteProcessor);

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

var _hotShots = require('hot-shots');

var _hotShots2 = _interopRequireDefault(_hotShots);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var client = new _hotShots2.default();
// import { sendMail } from './sendMail' Enable it later


var sqs = new _awsSdk2.default.SQS();
_bluebird2.default.promisifyAll((0, _getPrototypeOf2.default)(sqs));
var shouldProcess = true;

var process = function process(resp) {
  return new _bluebird2.default(function (resolve, reject) {
    (0, _each2.default)(resp, function (message, callback) {
      var _JSON$parse = JSON.parse(message.Body),
          data = _JSON$parse.data,
          type = _JSON$parse.type;

      if (type === 'page') {
        (0, _siteProcessor2.default)(data).then(function () {
          client.increment('worker.processed');
          return sqs.deleteMessageAsync({
            QueueUrl: _config2.default.sqsUrl,
            ReceiptHandle: message.ReceiptHandle
          });
        }).then(callback);
      }
      if (type === 'product') {
        (0, _priceCheck2.default)(data).then(function () {
          client.increment('worker.processed');
          return sqs.deleteMessageAsync({
            QueueUrl: _config2.default.sqsUrl,
            ReceiptHandle: message.ReceiptHandle
          });
        }).then(callback);
      }
    }, resolve);
  });
};
var getQueue = _bluebird2.default.coroutine(_regenerator2.default.mark(function _callee() {
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
            QueueUrl: _config2.default.sqsUrl,
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
          return _context.abrupt('return', console.log('Queue emptied'));

        case 10:
          _context.next = 12;
          return process(resp.Messages);

        case 12:
          return _context.abrupt('return', getQueue());

        case 15:
          _context.prev = 15;
          _context.t0 = _context['catch'](3);

          console.error(_context.t0);
          return _context.abrupt('return', getQueue());

        case 19:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this, [[3, 15]]);
}));

var queueCheck = function queueCheck() {
  var params = {
    AttributeNames: ['ApproximateNumberOfMessages'],
    QueueUrl: _config2.default.sqsUrl
  };
  return sqs.getQueueAttributesAsync(params).then(function (remaining) {
    return remaining.Attributes.ApproximateNumberOfMessages;
  });
};
exports.start = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(event, context, callback) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            getQueue();
            setTimeout(restart, 250 * 1000);

          case 3:
            _context2.next = 5;
            return queueCheck();

          case 5:
            _context2.t0 = _context2.sent;

            if (!(_context2.t0 > 0)) {
              _context2.next = 11;
              break;
            }

            _context2.next = 9;
            return _bluebird2.default.delay(10 * 1000);

          case 9:
            _context2.next = 3;
            break;

          case 11:
            shouldProcess = false;
            return _context2.abrupt('return', callback());

          case 15:
            _context2.prev = 15;
            _context2.t1 = _context2['catch'](0);

            console.error(_context2.t1);
            callback(new Error(_context2.t1));

          case 19:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[0, 15]]);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var restart = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
    var options;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.t0 = !shouldProcess;

            if (_context3.t0) {
              _context3.next = 6;
              break;
            }

            _context3.next = 4;
            return queueCheck();

          case 4:
            _context3.t1 = _context3.sent;
            _context3.t0 = _context3.t1 === 0;

          case 6:
            if (!_context3.t0) {
              _context3.next = 8;
              break;
            }

            return _context3.abrupt('return');

          case 8:
            options = {
              uri: 'https://mjl05xiv1a.execute-api.eu-central-1.amazonaws.com/prod/',
              headers: { 'x-api-key': _config2.default.lambdaKey }
            };

            (0, _requestPromise2.default)(options);

          case 10:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function restart() {
    return _ref2.apply(this, arguments);
  };
}();
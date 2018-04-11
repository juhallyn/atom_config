'use babel';
// Borrowed from Atom core's spec.

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.beforeEach = beforeEach;
exports.afterEach = afterEach;

var conditionPromise = _asyncToGenerator(function* (condition) {
  var startTime = Date.now();

  while (true) {
    yield timeoutPromise(100);

    if (yield condition()) {
      return;
    }

    if (Date.now() - startTime > 5000) {
      throw new Error('Timed out waiting on condition');
    }
  }
});

exports.conditionPromise = conditionPromise;
exports.timeoutPromise = timeoutPromise;
exports.emitterEventPromise = emitterEventPromise;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function beforeEach(fn) {
  global.beforeEach(function () {
    var result = fn();
    if (result instanceof Promise) {
      waitsForPromise(function () {
        return result;
      });
    }
  });
}

function afterEach(fn) {
  global.afterEach(function () {
    var result = fn();
    if (result instanceof Promise) {
      waitsForPromise(function () {
        return result;
      });
    }
  });
}

;['it', 'fit', 'ffit', 'fffit'].forEach(function (name) {
  module.exports[name] = function (description, fn) {
    global[name](description, function () {
      var result = fn();
      if (result instanceof Promise) {
        waitsForPromise(function () {
          return result;
        });
      }
    });
  };
});

function timeoutPromise(timeout) {
  return new Promise(function (resolve) {
    global.setTimeout(resolve, timeout);
  });
}

function waitsForPromise(fn) {
  var promise = fn();
  global.waitsFor('spec promise to resolve', function (done) {
    promise.then(done, function (error) {
      jasmine.getEnv().currentSpec.fail(error);
      done();
    });
  });
}

function emitterEventPromise(emitter, event) {
  var timeout = arguments.length <= 2 || arguments[2] === undefined ? 15000 : arguments[2];

  return new Promise(function (resolve, reject) {
    var timeoutHandle = setTimeout(function () {
      reject(new Error('Timed out waiting for \'' + event + '\' event'));
    }, timeout);
    emitter.once(event, function () {
      clearTimeout(timeoutHandle);
      resolve();
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2hwdS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvYXN5bmMtc3BlYy1oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7O0lBZ0NXLGdCQUFnQixxQkFBL0IsV0FBaUMsU0FBUyxFQUFFO0FBQ2pELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTs7QUFFNUIsU0FBTyxJQUFJLEVBQUU7QUFDWCxVQUFNLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFekIsUUFBSSxNQUFNLFNBQVMsRUFBRSxFQUFFO0FBQ3JCLGFBQU07S0FDUDs7QUFFRCxRQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLEdBQUcsSUFBSSxFQUFFO0FBQ2pDLFlBQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtLQUNsRDtHQUNGO0NBQ0Y7Ozs7Ozs7O0FBM0NNLFNBQVMsVUFBVSxDQUFFLEVBQUUsRUFBRTtBQUM5QixRQUFNLENBQUMsVUFBVSxDQUFDLFlBQVk7QUFDNUIsUUFBTSxNQUFNLEdBQUcsRUFBRSxFQUFFLENBQUE7QUFDbkIsUUFBSSxNQUFNLFlBQVksT0FBTyxFQUFFO0FBQzdCLHFCQUFlLENBQUM7ZUFBTSxNQUFNO09BQUEsQ0FBQyxDQUFBO0tBQzlCO0dBQ0YsQ0FBQyxDQUFBO0NBQ0g7O0FBRU0sU0FBUyxTQUFTLENBQUUsRUFBRSxFQUFFO0FBQzdCLFFBQU0sQ0FBQyxTQUFTLENBQUMsWUFBWTtBQUMzQixRQUFNLE1BQU0sR0FBRyxFQUFFLEVBQUUsQ0FBQTtBQUNuQixRQUFJLE1BQU0sWUFBWSxPQUFPLEVBQUU7QUFDN0IscUJBQWUsQ0FBQztlQUFNLE1BQU07T0FBQSxDQUFDLENBQUE7S0FDOUI7R0FDRixDQUFDLENBQUE7Q0FDSDs7QUFFRCxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxFQUFFO0FBQ3RELFFBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxXQUFXLEVBQUUsRUFBRSxFQUFFO0FBQ2hELFVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsWUFBWTtBQUNwQyxVQUFNLE1BQU0sR0FBRyxFQUFFLEVBQUUsQ0FBQTtBQUNuQixVQUFJLE1BQU0sWUFBWSxPQUFPLEVBQUU7QUFDN0IsdUJBQWUsQ0FBQztpQkFBTSxNQUFNO1NBQUEsQ0FBQyxDQUFBO09BQzlCO0tBQ0YsQ0FBQyxDQUFBO0dBQ0gsQ0FBQTtDQUNGLENBQUMsQ0FBQTs7QUFrQkssU0FBUyxjQUFjLENBQUUsT0FBTyxFQUFFO0FBQ3ZDLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUU7QUFDcEMsVUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDcEMsQ0FBQyxDQUFBO0NBQ0g7O0FBRUQsU0FBUyxlQUFlLENBQUUsRUFBRSxFQUFFO0FBQzVCLE1BQU0sT0FBTyxHQUFHLEVBQUUsRUFBRSxDQUFBO0FBQ3BCLFFBQU0sQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUUsVUFBVSxJQUFJLEVBQUU7QUFDekQsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxLQUFLLEVBQUU7QUFDbEMsYUFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDeEMsVUFBSSxFQUFFLENBQUE7S0FDUCxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSDs7QUFFTSxTQUFTLG1CQUFtQixDQUFFLE9BQU8sRUFBRSxLQUFLLEVBQW1CO01BQWpCLE9BQU8seURBQUcsS0FBSzs7QUFDbEUsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsUUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLFlBQU07QUFDckMsWUFBTSxDQUFDLElBQUksS0FBSyw4QkFBMkIsS0FBSyxjQUFVLENBQUMsQ0FBQTtLQUM1RCxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ1gsV0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsWUFBTTtBQUN4QixrQkFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQzNCLGFBQU8sRUFBRSxDQUFBO0tBQ1YsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0giLCJmaWxlIjoiL2hvbWUvaHB1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9hc3luYy1zcGVjLWhlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuLy8gQm9ycm93ZWQgZnJvbSBBdG9tIGNvcmUncyBzcGVjLlxuXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlRWFjaCAoZm4pIHtcbiAgZ2xvYmFsLmJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGZuKClcbiAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHJlc3VsdClcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZnRlckVhY2ggKGZuKSB7XG4gIGdsb2JhbC5hZnRlckVhY2goZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGZuKClcbiAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHJlc3VsdClcbiAgICB9XG4gIH0pXG59XG5cbjtbJ2l0JywgJ2ZpdCcsICdmZml0JywgJ2ZmZml0J10uZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICBtb2R1bGUuZXhwb3J0c1tuYW1lXSA9IGZ1bmN0aW9uIChkZXNjcmlwdGlvbiwgZm4pIHtcbiAgICBnbG9iYWxbbmFtZV0oZGVzY3JpcHRpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGZuKClcbiAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiByZXN1bHQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufSlcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbmRpdGlvblByb21pc2UgKGNvbmRpdGlvbikge1xuICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBhd2FpdCB0aW1lb3V0UHJvbWlzZSgxMDApXG5cbiAgICBpZiAoYXdhaXQgY29uZGl0aW9uKCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChEYXRlLm5vdygpIC0gc3RhcnRUaW1lID4gNTAwMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaW1lZCBvdXQgd2FpdGluZyBvbiBjb25kaXRpb24nKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGltZW91dFByb21pc2UgKHRpbWVvdXQpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgZ2xvYmFsLnNldFRpbWVvdXQocmVzb2x2ZSwgdGltZW91dClcbiAgfSlcbn1cblxuZnVuY3Rpb24gd2FpdHNGb3JQcm9taXNlIChmbikge1xuICBjb25zdCBwcm9taXNlID0gZm4oKVxuICBnbG9iYWwud2FpdHNGb3IoJ3NwZWMgcHJvbWlzZSB0byByZXNvbHZlJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICBwcm9taXNlLnRoZW4oZG9uZSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICBqYXNtaW5lLmdldEVudigpLmN1cnJlbnRTcGVjLmZhaWwoZXJyb3IpXG4gICAgICBkb25lKClcbiAgICB9KVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW1pdHRlckV2ZW50UHJvbWlzZSAoZW1pdHRlciwgZXZlbnQsIHRpbWVvdXQgPSAxNTAwMCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHRpbWVvdXRIYW5kbGUgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoYFRpbWVkIG91dCB3YWl0aW5nIGZvciAnJHtldmVudH0nIGV2ZW50YCkpXG4gICAgfSwgdGltZW91dClcbiAgICBlbWl0dGVyLm9uY2UoZXZlbnQsICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SGFuZGxlKVxuICAgICAgcmVzb2x2ZSgpXG4gICAgfSlcbiAgfSlcbn1cbiJdfQ==
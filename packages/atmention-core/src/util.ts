export default {
  spliceString: function (str, start, end, insert) {
    return str.substring(0, start) + (insert || '') + str.substring(end);
  },

  extend: function (target, ...args: any[]) {
    var extended = target || {};

    for (var i = 0; i < args.length; i += 1) {
      for (var key in args[i]) {
        if (args[i].hasOwnProperty(key)) {
          extended[key] = args[i][key];
        }
      }
    }

    return extended;
  }
};

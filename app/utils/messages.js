const moment = require("moment");

const formatMessage = (username, message) => {
  return {
    message: message,
    username: username,
    time: moment().format("h:mm a"),
  };
};
module.exports = formatMessage;

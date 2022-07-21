const jwt = require("jsonwebtoken");

function getSlot(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let slot = hours * 2;
  slot = Math.round(slot);
  if (minutes > 30) {
    slot += 1;
  }
  return slot;
}

function getSlots(startTime, endTime) {
  let slots = [];
  let start = getSlot(startTime);
  console.log("start ", start);
  let end = getSlot(endTime);
  console.log("end ", end);
  for (let i = start; i <= end; i++) {
    slots.push(i);
  }
  return slots;
}

const isAuthorizedUser = async (id, token) => {
  console.log("token ", token, "id ", id);
  if (token == null) return 0;
 decoded  = jwt.verify(token, "process.env.TOKEN_SECRET");
  console.log("decoded ", decoded);
  if (decoded.data == id) return 1;
  return 0;
};

module.exports = {
  getSlot,
  getSlots,
  isAuthorizedUser,
};

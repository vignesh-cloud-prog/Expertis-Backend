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
  //console.log("start ", start);
  let end = getSlot(endTime);
  //console.log("end ", end);
  for (let i = start; i <= end; i++) {
    slots.push(i);
  }
  return slots;
}

const isValidVariable=(variable)=>{
  if(variable==null || variable==undefined ){
     
    return false;
  }
  else{
    if (typeof variable === "string") {

    variable=variable.trim();
    if(variable==""){
      return false;
    }
  }
    

  }
  return true;
}

function getDDMMMYYYYDate(date) {
  var monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  return (
    date.getDate() +
    "-" +
    monthNames[date.getMonth()] +
    "-" +
    date.getFullYear()
  );
}
console.log(getDDMMMYYYYDate(new Date()));

module.exports = {
  getSlot,
  getSlots,
  getDDMMMYYYYDate,
  isValidVariable,
};

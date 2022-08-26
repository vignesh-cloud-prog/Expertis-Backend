const convertTimeFormate = function (dateobj) {
    // time = String(time)
    // dateobj = Date(dateobj);
    // time = time.split('');
    // let newTime = []
    // time.forEach(element => {


    //     if (element != '-' && element != ':' && element != '.') {
    //         newTime.push(element)
    //     }

    // });
    // newTime = newTime.join('')
    // return newTime = newTime.slice(0, -4) + 'Z'

    var month = addzero(dateobj.getMonth() + 1);
    var day = addzero(dateobj.getDate())
    var year = dateobj.getFullYear()
    console.log(dateobj.getHours(), "object get hours")
    let hour = addzero(dateobj.getHours())
    let min = addzero(dateobj.getMinutes())
    let sec = addzero(dateobj.getSeconds())

    console.log(year, month, day, hour, min, sec)

    let full = "" + year + month + day + "T" + hour + min + sec + "Z"

    // console.log(full)
    return full
}
function addzero(target) {
    return target = target < 10 ? '0' + target : target;
}
const tCovertToDisplay = function (time) {
    console.log(time, "it in tconvertdisplay");
    year = time.slice(0, 4)
    month = time.slice(4, 6)
    day = time.slice(6, 8)
    hour = time.slice(9, 11)
    minutes = time.slice(11, 13)
    secands = time.slice(13, 15)

    fullTime = tConvert(`${hour}:${minutes}:${secands}`)
    // console.log(`year${year} month${month} day${day} hour${hour} minu${minutes} sec${secands} fultime${fullTime}`);
    let newTime = "";
    newTime += day + " ";
    switch (parseInt(month)) {
        case 01: newTime += "Jan" + " ";
            break;
        case 02: newTime += "Feb" + " ";
            break;
        case 03: newTime += "Mach" + " ";
            break;
        case 04: newTime += "April" + " ";
            break;
        case 05: newTime += "May" + " ";
            break;
        case 06: newTime += "June" + " ";
            break;
        case 07: newTime += "July" + " ";
            break;
        case 08: newTime += "Aug" + " ";
            break;
        case 09: newTime += "Sep" + " ";
            break;
        case 10: newTime += "Oct" + " ";
            break;
        case 11: newTime += "Nav" + " ";
            break;
        case 12: newTime += "Dec" + " ";
            break;
    }
    return newTime += year + "  " + fullTime.slice(0, 5) + fullTime.slice(8, 11)
}
function tConvert(time) {
    // Check correct time format and split into components
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) { // If time format correct
        time = time.slice(1);  // Remove full string match value
        time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(''); // return adjusted time or original string
}

module.exports = {
    convertTimeFormate,
    tCovertToDisplay
};
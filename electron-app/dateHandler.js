function getDate() {
    let dateObject = new Date()
    let day = intTwoChars(dateObject.getDate())
    let month = intTwoChars(dateObject.getMonth() + 1)
    let year = dateObject.getFullYear()
    let date = year + "-" + month + "-" + day
    return date
}

function getTime() {
    let dateObject = new Date()
    let hours = intTwoChars(dateObject.getHours())
    let minutes = intTwoChars(dateObject.getMinutes())
    let seconds = intTwoChars(dateObject.getSeconds())
    let time = hours + ":" + minutes + ":" + seconds
    console.log(time)
    return time
}

function intTwoChars(i) {
    return (`0${i}`).slice(-2);
}

module.exports.getDate = getDate
module.exports.getTime = getTime
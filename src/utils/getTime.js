const moment = require('moment')

/*
*  Function that gets the time a message is sent
* @returns moment The time at which the function is called
*/
function getTime() { 
    return moment().format()
}

export default getTime
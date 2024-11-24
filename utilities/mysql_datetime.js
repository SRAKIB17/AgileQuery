"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mysql_datetime = mysql_datetime;
exports.mysql_date = mysql_date;
function mysql_datetime(date) {
    let currentDate = new Date(date);
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours();
    const minute = currentDate.getMinutes();
    const second = currentDate.getSeconds();
    const formattedDate = `${year}-${month}-${day} ${hours}:${minute}:${second}`;
    return formattedDate;
}
;
function mysql_date(date) {
    let currentDate = new Date(date);
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}
;

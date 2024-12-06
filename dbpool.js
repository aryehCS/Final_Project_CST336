const mysql = require('mysql');

const pool  = mysql.createPool({
    connectionLimit: 10,
    host: "x3ztd854gaa7on6s.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "yt9sbcayqpuih13y",
    password: "iyli1nq0xqc1lixy",
    database: "zm6qb6njobeqkxwd"
});

module.exports = pool;

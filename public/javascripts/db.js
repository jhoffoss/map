var mysql = require('mysql');

var connection = mysql.createConnection({
    host : "mysql.server303.com",
    user : "llama",
    password : "antigoat",
    database : "jhoffoss_llama",
    port: 3306
});

connection.connect();

var query = connection.query(
    'SELECT * FROM users',function(err, result, fields) {
        if(err) throw err;
        console.log('result: ',result);
    });

connection.end()
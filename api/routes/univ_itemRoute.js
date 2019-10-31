const express = require('express');
const router = express();
const connect = require('../../database/database');

const corsCheck = require('../../config/corsCheck');

router.use(function (req, res, next) { //1
    // if(req.headers.authorization){
        if(corsCheck.checkAuth(req.headers.authorization)){
            next();
        }else{
            res.send(`<h1>not Found Page</h1>`);
        }
    // }
});

router.get('/:univ_id', function (req, res) {
    if (req.query.board_type) {
        var sql = 'SELECT * FROM univ_item WHERE univ_id=? AND univ_item_address=?';
        var params = [req.params.univ_id, req.query.board_type];
        connect.query(sql, params, function (err, rows, fields) {
            res.send(rows[0]);
        })
    } else {
        var sql = 'SELECT * FROM univ_item WHERE univ_id=? ORDER BY univ_item_order';
        var params = [req.params.univ_id];
        connect.query(sql, params, function (err, rows, fields) {
            res.send(rows);
        })
    }
});

module.exports = router;
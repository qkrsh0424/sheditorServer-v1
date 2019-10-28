const express = require('express');
const router = express();
const connect = require('../../database/database');

router.get('/getshbAll',function(req,res){
    if(req.query.type){
        let sql = `
            SELECT * FROM shb
            WHERE shb_classify=? AND shb_isDeleted=0
            ORDER BY shb_order
        `;
        let params = [req.query.type];

        connect.query(sql, params, function(err, rows, fields){
            if(err){
                res.json({message:'DBerror'});
            }else{
                if(!rows){
                    res.json({message:"failure"})
                }else{
                    res.json({message:'success', data:rows});
                }
            }
        });
    }else{
        let sql = `
            SELECT * FROM shb
            WHERE shb_isDeleted=0
            ORDER BY shb_order
        `;

        connect.query(sql, function(err, rows, fields){
            if(err){
                res.json({message:'DBerror'});
            }else{
                let mainCategory;
                for(let i = 0; i<rows.length; i++){
                    if(rows[i].shb_num===1101001){
                        mainCategory=rows[i];
                    }
                }
                res.json({message:'success', data:rows, main:mainCategory});
            }
        });
    }
    
});

router.get('/getshbItemAll', function(req,res){
    const shb_num = req.query.shb_num;
    let sql = `
        SELECT * FROM shb_item
        WHERE shb_item_isDeleted=0 AND shb_num=?
        ORDER BY shb_item_order
    `;
    let params = [shb_num];

    connect.query(sql, params, function(err, rows, fields){
        if(err){
            console.log(err)
            res.json({message:'DBerror'});
        }else{
            if(rows[0]){
                res.json({message:'success', data:rows});
            }else{
                res.json({message:'failure'});
            }
            
        }
    });
});

router.get('/shbItem/getOne', function(req,res){
    let sql = `
        SELECT * FROM shb_item
        WHERE shb_item_id=?
    `;
    let params = [req.query.shb_item_id];
    connect.query(sql,params,function(err,rows,fields){
        if(err){
            console.log(err);
            res.json({message:'DBerror'})
        }else{
            if(rows[0]){
                res.json({message:'success', data:rows[0]});
            }else{
                res.json({message:'failure'});
            }
            
        }
    })
})

module.exports = router;
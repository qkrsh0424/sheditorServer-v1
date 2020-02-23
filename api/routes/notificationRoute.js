const express = require('express');
const router = express();
const connect = require('../../database/database');

const cipher = require('../../handler/security');
var redis = require('redis'),
    client = redis.createClient();

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

// /api/utill/notification/comment/write
router.post('/comment/write', function(req,res){
    
    if(req.body.writerSess===null){
        return res.json({message:'non-user'})
    }
    // console.log('hi')
    let writerSess = req.body.writerSess;
    let postUrl = req.body.postUrl;
    let type = req.body.type;
    let commentId = req.body.commentId;
    // console.log(writerSess,postUrl,type,commentId);

    const sessID = 'sess:'+cipher.decrypt(writerSess);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                let sql = `
                    SELECT * FROM post WHERE post_id=?
                `;
                let params = [req.body.PostVal];
                connect.query(sql, params, function(err, postRows){
                    if(err){
                        return res.json({message:'error'})
                    }

                    if(postRows[0].user_id===user_id){
                        return res.json({message:'owner'})
                    }
                    let sql = `
                        SELECT * FROM comment
                        JOIN user ON comment.user_id=user.user_id
                        WHERE cmt_id=?
                    `;
                    let params = [commentId];
                    connect.query(sql, params, function(err, commentRows){
                        if(err){
                            return res.json({message:'error'})
                        }
                        // console.log(commentRows)
                        let notificationData = {
                            writerNickName:commentRows[0].user_nickname,
                            text:commentRows[0].cmt_desc,
                            postTitle:postRows[0].post_title,
                            postUrl:postUrl
                        };
                        let sql = `
                            INSERT INTO notification (noti_user_id, noti_writerId, noti_type, noti_data)
                            VALUES(?,?,?,?)
                        `;
                        let params = [postRows[0].user_id,user_id, type, JSON.stringify(notificationData)];
                        connect.query(sql, params, function(err, resultRows){
                            if(err){
                                return res.json({message:'error'})
                            }
                            if(resultRows.insertId){
                                return res.json({message:'success'})
                            }
                        })
                    })
                    
                    
                })
            })
        }
    });
})

// /api/utill/notification/getlist/all
router.get('/getlist/all', function(req,res){
    if(req.query.usid===undefined || req.query.usid===null){
        return res.json({message:'non-user'})
    }

    const sessID = 'sess:'+cipher.decrypt(req.query.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                let sql = `
                    SELECT * FROM notification
                    WHERE noti_user_id=? AND noti_isReaded=0 AND noti_isDeleted=0
                `;
                let params=[user_id];
                connect.query(sql, params, function(err, rows){
                    if(err){
                        console.log(err);
                        return res.json({message:'error'})
                    }
                    let notiData=[]
                    for(let i = 0; i< rows.length; i++){
                        let dd = {
                            notiType:rows[0].noti_type,
                            data:JSON.parse(rows[0].noti_data)
                        }
                        notiData.push(dd);
                    }
                    // console.log(notiData);
                    return res.json({message:'success', notiData:notiData})
                })
            })
        }
    });
});

module.exports = router;
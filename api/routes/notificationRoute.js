const express = require('express');
const router = express();
const connect = require('../../database/database');
const pool = require('../../database/databasePool');

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
                            // writerNickName:commentRows[0].user_nickname,
                            text:commentRows[0].cmt_desc,
                            postTitle:postRows[0].post_title,
                            postUrl:postUrl
                        };
                        let sql = `
                            INSERT INTO notification (noti_user_id, noti_writerId, noti_post_id, noti_type, noti_data)
                            VALUES(?,?,?,?,?)
                        `;
                        let params = [postRows[0].user_id,user_id,req.body.PostVal, type, JSON.stringify(notificationData)];
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

// /api/utill/notification/like/click
router.post('/like/click', function(req,res){
    
    if(req.body.writerSess===null){
        return res.json({message:'non-user'})
    }
    let writerSess = req.body.writerSess;
    let postUrl = req.body.postUrl;
    let type = req.body.type;

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
                    let notificationData = {
                        text:'like click',
                        postTitle:postRows[0].post_title,
                        postUrl:postUrl
                    };
                    let sql = `
                        INSERT INTO notification (noti_user_id, noti_writerId, noti_post_id, noti_type, noti_data)
                        VALUES(?,?,?,?,?)
                    `;
                    let params = [postRows[0].user_id,user_id,req.body.PostVal, type, JSON.stringify(notificationData)];
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
        }
    });
})

// /api/utill/notification/like/cancel
router.post('/like/cancel', function(req,res){
    
    if(req.body.writerSess===null){
        return res.json({message:'non-user'})
    }
    let writerSess = req.body.writerSess;
    let type = req.body.type;

    const sessID = 'sess:'+cipher.decrypt(writerSess);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;
                
                let sql = `
                    UPDATE notification SET noti_isDeleted=1
                    WHERE noti_writerId=? AND noti_post_id=? AND noti_type=?
                `;
                let params = [user_id, req.body.PostVal, type];
                connect.query(sql, params, function(err,rows){
                    if(err){
                        return res.json({message:'error'});
                    }else{
                        return res.json({message:'success'});
                    }
                })
            })
        }
    });
})

// /api/utill/notification/getlist/all
router.get('/getlist/all', async function(req,res){
    if(req.query.usid===undefined || req.query.usid===null){
        return res.json({message:'non-user'})
    }

    const sessID = 'sess:'+cipher.decrypt(req.query.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,async(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                let sql = `
                    SELECT * FROM notification
                    WHERE noti_user_id=? AND noti_isDeleted=0
                    ORDER BY noti_isReaded=1, noti_created DESC
                    LIMIT ?
                `;
                let params=[user_id, Number(req.query.notiListLimit)];
                connect.query(sql, params, async function (err, rows){
                    if(err){
                        console.log(err);
                        return res.json({message:'error'})
                    }
                    let notiData=[];
                    // console.log(rows)
                    for(let i = 0; i< rows.length; i++){
                        let writerGetSQL = `
                            SELECT user.* FROM notification
                            JOIN user ON notification.noti_writerId=user.user_id
                            WHERE notification.noti_id=?
                        `;
                        let writerGetParams = [rows[i].noti_id];
                        let [writerData,writerDataField] = await pool.query(writerGetSQL,writerGetParams);
                        
                        let dd = {
                            notiType:rows[i].noti_type,
                            writerNickName:writerData[0].user_nickname,
                            writerImage: writerData[0].user_image_url,
                            data:JSON.parse(rows[i].noti_data),
                            noti_isReaded:rows[i].noti_isReaded,
                            noti_created:rows[i].noti_created
                        }
                        notiData.push(dd);
                    }
                    return res.json({message:'success', notiData:notiData})
                })
            })
        }
    });
});

// /api/utill/notification/getlist/notiLength
router.get('/getlist/notiLength', async function(req,res){
    if(req.query.usid===undefined || req.query.usid===null){
        return res.json({message:'non-user'})
    }

    const sessID = 'sess:'+cipher.decrypt(req.query.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,async(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                let sql = `
                    SELECT * FROM notification
                    WHERE noti_user_id=? AND noti_isReaded=0 AND noti_isDeleted=0
                `;
                let params=[user_id];
                connect.query(sql, params, async function (err, rows){
                    if(err){
                        console.log(err);
                        return res.json({message:'error'})
                    }
                    return res.json({message:'success', notiLength:rows.length})
                })
            })
        }
    });
});

// /api/utill/notification/readed/normal
router.post('/readed/normal', function(req,res){
    if(req.body.usid===undefined || req.body.usid===null){
        return res.json({message:'non-user'})
    }

    const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,async(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;
                let sql = `
                    UPDATE notification SET noti_isReaded=1, noti_readed=?
                    WHERE noti_user_id=? AND noti_post_id=?
                `;
                let params = [new Date(),user_id, req.body.PostVal];
                connect.query(sql, params, function(err,rows){
                    if(err){
                        return res.json({message:'error'});
                    }

                    res.json({message:'success'});
                })
            })
        }
    });
});

module.exports = router;
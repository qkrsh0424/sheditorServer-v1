const express = require('express');
const router = express();
const connect = require('../../database/database');
const pool = require('../../database/databasePool');
const cipher = require('../../handler/security');

var redis = require('redis'),
    client = redis.createClient();

const draftjsHandle = require('../../handler/draftjsHandle');
const sheditorHandle = require('../../handler/sheditorHandle');

const corsCheck = require('../../config/corsCheck');

router.use(function (req, res, next) { //1
    // if(req.headers.authorization){
    if (corsCheck.checkAuth(req.headers.authorization)) {
        next();
    } else {
        res.send(`<h1>not Found Page</h1>`);
    }
    // }
});

router.get('/getpost/all', function (req, res) {

    // console.log(req.query.numIndex);
    let getLimit = Number(req.query.numIndex);
    // console.log(getLimit);
    let sql = `
        SELECT * FROM post 
        JOIN user ON post.user_id=user.user_id
        JOIN shb ON post.shb_num=shb.shb_num
        JOIN shb_item ON post.shb_item_id=shb_item.shb_item_id
        WHERE post_isDeleted=0 AND shb_item.shb_item_visible=1
        ORDER BY post_created DESC
        LIMIT ?
    `;

    let params = [getLimit];
    connect.query(sql, params, function (err, rows, fields) {
        let result = [];
        if (rows[0]) {
            for (let i = 0; i < rows.length; i++) {
                let data = {
                    post_id: rows[i].post_id,
                    editorType:rows[i].editorType,
                    shb_num: rows[i].shb_num,
                    shb_name: rows[i].shb_name,
                    shb_item_id: rows[i].shb_item_id,
                    shb_item_name: rows[i].shb_item_name,
                    parent_route: rows[i].parent_route,
                    post_title: rows[i].post_title,
                    post_desc: rows[i].post_title,
                    post_thumbnail_url: rows[i].post_thumbnail_url,
                    post_like_count: rows[i].post_like_count,
                    post_comment_count: rows[i].post_comment_count,
                    post_view_count: rows[i].post_view_count,
                    post_image_count: rows[i].post_image_count,
                    post_video_count: rows[i].post_video_count,
                    post_created: rows[i].post_created,
                    post_updated: rows[i].post_updated,
                    user_nickname: rows[i].user_nickname,
                    post_isSecret: rows[i].post_isSecret,
                    post_user_isSecret: rows[i].post_user_isSecret,
                }
                result.push(data);
            }
            res.json({ message: 'success', data: result });
        } else {
            res.json({ message: 'none' });
        }

    });
});

router.get('/getpost/one', function (req, res) {
    let sql = `
        SELECT post.*, user.user_nickname FROM post 
        JOIN user ON post.user_id=user.user_id
        JOIN shb_item ON post.shb_item_id=shb_item.shb_item_id
        WHERE post.post_id=? AND post.post_isDeleted=0 AND shb_item.shb_item_visible=1`;
    let params = [req.query.post_id];

    connect.query(sql, params, function (err, rowsPost) {
        if (rowsPost[0]) {
            if (req.query.usid === undefined) {
                let result = [];
                result.push({
                    message: 'success',
                    post_id: rowsPost[0].post_id,
                    editorType: rowsPost[0].editorType,
                    shb_num: rowsPost[0].shb_num,
                    shb_item_id: rowsPost[0].shb_item_id,
                    parent_route: rowsPost[0].parent_route,
                    post_title: rowsPost[0].post_title,
                    post_desc: rowsPost[0].post_desc,
                    post_thumbnail_url: rowsPost[0].post_thumbnail_url,
                    post_like_count: rowsPost[0].post_like_count,
                    post_comment_count: rowsPost[0].post_comment_count,
                    post_view_count: rowsPost[0].post_view_count,
                    post_image_count: rowsPost[0].post_image_count,
                    post_video_count: rowsPost[0].post_video_count,
                    user_nickname: rowsPost[0].user_nickname,
                    post_isSecret: rowsPost[0].post_isSecret,
                    post_user_isSecret: rowsPost[0].post_user_isSecret,
                    post_materials: JSON.parse(rowsPost[0].post_materials),
                    post_created: rowsPost[0].post_created,
                    post_updated: rowsPost[0].post_updated,
                    liked: 'off'
                });
                return res.json(result);
            }

            const sessID = 'sess:' + cipher.decrypt(req.query.usid);
            client.exists(sessID, (err, replyExists) => {

                if (replyExists) {
                    client.get(sessID, (err, replyGet) => {
                        const resultGet = JSON.parse(replyGet);
                        const user_id = resultGet.user.user_id;
                        let sql = `
                                SELECT * FROM post_like WHERE user_id=? AND post_id=? AND post_like_head_type=?
                            `;
                        let params = [user_id, req.query.post_id, rowsPost[0].shb_num];
                        connect.query(sql, params, function (err, resultrows, fields) {
                            if (err) {
                                res.status(500).json({ message: 'error' });
                            } else {
                                let result = [];
                                if (resultrows[0]) {

                                    result.push({
                                        message: 'success',
                                        post_id: rowsPost[0].post_id,
                                        editorType: rowsPost[0].editorType,
                                        shb_num: rowsPost[0].shb_num,
                                        shb_item_id: rowsPost[0].shb_item_id,
                                        parent_route: rowsPost[0].parent_route,
                                        post_title: rowsPost[0].post_title,
                                        post_desc: rowsPost[0].post_desc,
                                        post_thumbnail_url: rowsPost[0].post_thumbnail_url,
                                        post_like_count: rowsPost[0].post_like_count,
                                        post_comment_count: rowsPost[0].post_comment_count,
                                        post_view_count: rowsPost[0].post_view_count,
                                        post_image_count: rowsPost[0].post_image_count,
                                        post_video_count: rowsPost[0].post_video_count,
                                        user_nickname: rowsPost[0].user_nickname,
                                        post_isSecret: rowsPost[0].post_isSecret,
                                        post_user_isSecret: rowsPost[0].post_user_isSecret,
                                        post_materials: JSON.parse(rowsPost[0].post_materials),
                                        post_created: rowsPost[0].post_created,
                                        post_updated: rowsPost[0].post_updated,
                                        like: 'on',
                                    });
                                } else {
                                    result.push({
                                        message: 'success',
                                        post_id: rowsPost[0].post_id,
                                        editorType: rowsPost[0].editorType,
                                        shb_num: rowsPost[0].shb_num,
                                        shb_item_id: rowsPost[0].shb_item_id,
                                        parent_route: rowsPost[0].parent_route,
                                        post_title: rowsPost[0].post_title,
                                        post_desc: rowsPost[0].post_desc,
                                        post_thumbnail_url: rowsPost[0].post_thumbnail_url,
                                        post_like_count: rowsPost[0].post_like_count,
                                        post_comment_count: rowsPost[0].post_comment_count,
                                        post_view_count: rowsPost[0].post_view_count,
                                        post_image_count: rowsPost[0].post_image_count,
                                        post_video_count: rowsPost[0].post_video_count,
                                        user_nickname: rowsPost[0].user_nickname,
                                        post_isSecret: rowsPost[0].post_isSecret,
                                        post_user_isSecret: rowsPost[0].post_user_isSecret,
                                        post_materials: JSON.parse(rowsPost[0].post_materials),
                                        post_created: rowsPost[0].post_created,
                                        post_updated: rowsPost[0].post_updated,
                                        like: 'off',
                                    });
                                }
                                res.json(result);

                            }
                        });
                    });
                }
            });
            // res.json({message:'success',data:rowsPost})
        } else {
            res.json([{ message: 'error' }]);
        }
    });
})

router.get('/getpost/shbNum/all', function (req, res) {
    if (!req.query.hasBoundary) {
        let sql = `
            SELECT post.*, user.user_nickname, shb_item.shb_item_name
            FROM post
            JOIN user ON post.user_id=user.user_id
            JOIN shb_item ON shb_item.shb_item_id=post.shb_item_id
            WHERE post.shb_num=? AND post_isDeleted=0 AND shb_item.shb_item_visible=1
            ORDER BY post.post_created DESC
        `;
        let params = [req.query.shb_num];

        connect.query(sql, params, function (err, rows, fields) {
            let result = [];
            for (let i = 0; i < rows.length; i++) {
                if (rows[i]) {
                    result.push({
                        post_id: rows[i].post_id,
                        editorType: rows[i].editorType,
                        post_textOnly: rows[i].post_textOnly,
                        shb_num: rows[i].shb_num,
                        shb_item_id: rows[i].shb_item_id,
                        parent_route: rows[i].parent_route,
                        post_title: rows[i].post_title,
                        post_desc: rows[i].post_desc,
                        post_thumbnail_url: rows[i].post_thumbnail_url,
                        post_like_count: rows[i].post_like_count,
                        post_comment_count: rows[i].post_comment_count,
                        post_view_count: rows[i].post_view_count,
                        post_image_count: rows[i].post_image_count,
                        post_video_count: rows[i].post_video_count,
                        user_nickname: rows[i].user_nickname,
                        post_isSecret: rows[i].post_isSecret,
                        post_user_isSecret: rows[i].post_user_isSecret,
                        post_created: rows[i].post_created,
                        post_updated: rows[i].post_updated,
                        shb_item_name: rows[i].shb_item_name,
                        liked: 'off'
                    });
                }
            }
            return res.json(result);
        });
    } else {
        let sql = `
            SELECT post.*, user.user_nickname, shb_item.shb_item_name
            FROM post
            JOIN user ON post.user_id=user.user_id
            JOIN shb_item ON shb_item.shb_item_id=post.shb_item_id
            WHERE post.shb_num=? AND post_isDeleted=0 AND shb_item.shb_item_visible=1
            ORDER BY post.post_created DESC
        `;
        let params = [req.query.shb_num];

        connect.query(sql, params, function (err, rows, fields) {
            let result = [];
            for (let i = req.query.startPostIndex; i < req.query.currentPostIndex; i++) {
                if (rows[i]) {
                    result.push({
                        post_id: rows[i].post_id,
                        editorType: rows[i].editorType,
                        post_textOnly: rows[i].post_textOnly,
                        shb_num: rows[i].shb_num,
                        shb_item_id: rows[i].shb_item_id,
                        parent_route: rows[i].parent_route,
                        post_title: rows[i].post_title,
                        post_desc: rows[i].post_desc,
                        post_thumbnail_url: rows[i].post_thumbnail_url,
                        post_like_count: rows[i].post_like_count,
                        post_comment_count: rows[i].post_comment_count,
                        post_view_count: rows[i].post_view_count,
                        post_image_count: rows[i].post_image_count,
                        post_video_count: rows[i].post_video_count,
                        user_nickname: rows[i].user_nickname,
                        post_isSecret: rows[i].post_isSecret,
                        post_user_isSecret: rows[i].post_user_isSecret,
                        post_created: rows[i].post_created,
                        post_updated: rows[i].post_updated,
                        shb_item_name: rows[i].shb_item_name,
                        liked: 'off'
                    });
                }
            }
            return res.json(result);
        });
    }

})

router.get('/getpost/category/all', function (req, res) {
    // console.log(req.query.shb_num, req.query.shb_item_id);
    let sql = `
        SELECT post.*, user.user_nickname
        FROM post
        JOIN user ON post.user_id=user.user_id
        JOIN shb_item ON shb_item.shb_item_id=post.shb_item_id
        WHERE post.shb_num=? AND post.shb_item_id=? AND post_isDeleted=0 AND shb_item.shb_item_visible=1
        ORDER BY post.post_created DESC
    `;

    let params = [req.query.shb_num, req.query.shb_item_id];

    connect.query(sql, params, function (err, rows, fields) {
        let result = [];
        if (req.query.usid === undefined) {
            for (let i = req.query.startPostIndex; i < req.query.currentPostIndex; i++) {
                if (rows[i]) {
                    result.push({
                        post_id: rows[i].post_id,
                        editorType: rows[i].editorType,
                        post_textOnly: rows[i].post_textOnly,
                        shb_num: rows[i].shb_num,
                        shb_item_id: rows[i].shb_item_id,
                        parent_route: rows[i].parent_route,
                        post_title: rows[i].post_title,
                        post_desc: rows[i].post_desc,
                        post_thumbnail_url: rows[i].post_thumbnail_url,
                        post_like_count: rows[i].post_like_count,
                        post_comment_count: rows[i].post_comment_count,
                        post_view_count: rows[i].post_view_count,
                        post_image_count: rows[i].post_image_count,
                        post_video_count: rows[i].post_video_count,
                        user_nickname: rows[i].user_nickname,
                        post_isSecret: rows[i].post_isSecret,
                        post_user_isSecret: rows[i].post_user_isSecret,
                        post_created: rows[i].post_created,
                        post_updated: rows[i].post_updated,
                        liked: 'off'
                    });
                }
            }
            return res.json(result);
        }

        const sessID = 'sess:' + cipher.decrypt(req.query.usid);
        client.exists(sessID, (err, replyExists) => {
            if (replyExists) {
                client.get(sessID, (err, replyGet) => {
                    const resultGet = JSON.parse(replyGet);
                    const user_id = resultGet.user.user_id;
                    let sql = `
                        SELECT * FROM post_like WHERE user_id=?
                    `;
                    let params = [user_id];

                    connect.query(sql, params, function (err, rows2, fields) {
                        for (let i = req.query.startPostIndex; i < req.query.currentPostIndex; i++) {
                            if (rows[i]) {
                                let liked = 'off'
                                for (let j = 0; j < rows2.length; j++) {
                                    if (rows[i].post_id === rows2[j].post_id && String(rows[i].shb_num) === String(rows2[j].post_like_head_type)) {
                                        liked = 'on'
                                    }
                                }
                                result.push({
                                    post_id: rows[i].post_id,
                                    editorType: rows[i].editorType,
                                    post_textOnly: rows[i].post_textOnly,
                                    shb_num: rows[i].shb_num,
                                    shb_item_id: rows[i].shb_item_id,
                                    parent_route: rows[i].parent_route,
                                    post_title: rows[i].post_title,
                                    post_desc: rows[i].post_desc,
                                    post_thumbnail_url: rows[i].post_thumbnail_url,
                                    post_like_count: rows[i].post_like_count,
                                    post_comment_count: rows[i].post_comment_count,
                                    post_view_count: rows[i].post_view_count,
                                    post_image_count: rows[i].post_image_count,
                                    post_video_count: rows[i].post_video_count,
                                    user_nickname: rows[i].user_nickname,
                                    post_isSecret: rows[i].post_isSecret,
                                    post_user_isSecret: rows[i].post_user_isSecret,
                                    post_created: rows[i].post_created,
                                    post_updated: rows[i].post_updated,
                                    liked: liked
                                });

                            }
                        }
                        res.json(result);
                    })
                });
            }
        });

    });
});

router.post('/writepost/category', function (req, res) {
    if (req.body.usid === null) {
        return res.json({ message: 'invalidUser' });
    }

    const sessID = 'sess:' + cipher.decrypt(req.body.usid);
    client.exists(sessID, (err, replyExists) => {
        if (replyExists) {
            client.get(sessID, (err, replyGet) => {
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                //draftJS 포맷 형식으로만 파라미터를 설정해준다.
                let post_image_count = draftjsHandle.getImageCount(req.body.post_desc); // 이미지 개수 계산
                let post_thumbnail_url = draftjsHandle.getThumbnailUrl(req.body.post_desc); // 포스터의 첫번째 사진을 썸네일로 한다.
                let post_materials = null;
                if (req.body.post_materials[0]) {
                    post_materials = JSON.stringify(req.body.post_materials);
                }
                // var sql = `INSERT INTO post(shb_num, shb_item_id, parent_route, post_title, post_desc, post_thumbnail_url, post_image_count, user_id)
                //         VALUES(?,?,?,?,?,?,?,?)
                // `;

                var sql = `INSERT INTO post(shb_num, shb_item_id, parent_route, post_title, post_desc, post_thumbnail_url, post_image_count, user_id, post_materials)
                        VALUES(?,?,?,?,?,?,?,?,?)
                `;
                var params = [
                    req.body.shb_num,
                    req.body.shb_item_id,
                    req.body.parent_route,
                    req.body.post_topic,
                    req.body.post_desc,
                    post_thumbnail_url,
                    post_image_count,
                    user_id,
                    post_materials
                ];

                connect.query(sql, params, function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        res.json({ message: 'error' });
                    } else {
                        if (rows.insertId) {
                            res.status(200).json({ message: 'success' });
                        } else {
                            res.status(200).json({ message: 'failure' });
                        }
                    }
                });
            });
        }
    });
});

// path: /api/shb/post/getpost/sheditor/one
router.get('/getpost/sheditor/one', async function(req,res){

    let sql = `
        SELECT post.*, user.user_nickname, shb.shb_name, shb_item.shb_item_name FROM post
        JOIN shb ON shb.shb_num = post.shb_num
        JOIN user ON post.user_id=user.user_id
        JOIN shb_item ON post.shb_item_id=shb_item.shb_item_id
        WHERE post.post_id=? AND post.post_isDeleted=0 AND shb_item.shb_item_visible=1
    `;
    let params = [req.query.PostVal];
    connect.query(sql, params, async function(err, rows){
        if(err){
            return res.json({message:'error'});
        }

        let metaData = JSON.parse(rows[0].post_desc);
        let postModule = [];
        for(let i = 0; i<metaData.length;i++){
            let sql = `
                SELECT * FROM post_block WHERE pblock_id=?
            `;
            let params=[metaData[i]];
            let [getBlk,fields] = await pool.query(sql, params);
            let setModule = {
                id:getBlk[0].pblock_uuid,
                imageList:JSON.parse(getBlk[0].pblock_images),
                editorData:getBlk[0].pblock_desc,
                imageSliderOn:Boolean(getBlk[0].pblock_imageSliderOn),
                videoData:getBlk[0].pblock_videoData?JSON.parse(getBlk[0].pblock_videoData):null
            }
            postModule.push(setModule);
        }

        
        if (req.query.usid === undefined) {
            // console.log('user undefined');
            let postMetaData=[];
            postMetaData.push({
                post_id: rows[0].post_id,
                editorType: rows[0].editorType,
                post_textOnly: rows[0].post_textOnly,
                shb_num: rows[0].shb_num,
                shb_name:rows[0].shb_name,
                shb_item_id: rows[0].shb_item_id,
                shb_item_name:rows[0].shb_item_name,
                parent_route: rows[0].parent_route,
                post_title: rows[0].post_title,
                post_desc: rows[0].post_desc,
                post_thumbnail_url: rows[0].post_thumbnail_url,
                post_like_count: rows[0].post_like_count,
                post_comment_count: rows[0].post_comment_count,
                post_view_count: rows[0].post_view_count,
                post_image_count: rows[0].post_image_count,
                post_video_count: rows[0].post_video_count,
                user_nickname: rows[0].user_nickname,
                post_isSecret: rows[0].post_isSecret,
                post_user_isSecret: rows[0].post_user_isSecret,
                post_created: rows[0].post_created,
                post_updated: rows[0].post_updated,
                liked: 'off'
            });
            return res.json({
                message:'success', 
                postModule:postModule, 
                commonFiles:rows[0].post_materials,
                postMetaData:postMetaData[0]
            });
        }
        // console.log('user defined');
        const sessID = 'sess:' + cipher.decrypt(req.query.usid);
            client.exists(sessID, (err, replyExists) => {

                if (replyExists) {
                    client.get(sessID, (err, replyGet) => {
                        const resultGet = JSON.parse(replyGet);
                        const user_id = resultGet.user.user_id;
                        let postOwner = false;
                        let sql = `
                                SELECT * FROM post_like WHERE user_id=? AND post_id=? AND post_like_head_type=?
                            `;
                        let params = [user_id, req.query.PostVal, rows[0].shb_num];
                        // console.log(rows[0].user_id);
                        // console.log(user_id);

                        if(rows[0].user_id===user_id){
                            postOwner = true;
                        }

                        connect.query(sql, params, function (err, resultrows, fields) {
                            if (err) {
                                res.status(500).json({ message: 'error' });
                            } else {
                                let postMetaData = [];
                                if (resultrows[0]) {

                                    postMetaData.push({
                                        post_id: rows[0].post_id,
                                        editorType: rows[0].editorType,
                                        post_textOnly: rows[0].post_textOnly,
                                        shb_num: rows[0].shb_num,
                                        shb_name:rows[0].shb_name,
                                        shb_item_id: rows[0].shb_item_id,
                                        shb_item_name:rows[0].shb_item_name,
                                        parent_route: rows[0].parent_route,
                                        post_title: rows[0].post_title,
                                        post_desc: rows[0].post_desc,
                                        post_thumbnail_url: rows[0].post_thumbnail_url,
                                        post_like_count: rows[0].post_like_count,
                                        post_comment_count: rows[0].post_comment_count,
                                        post_view_count: rows[0].post_view_count,
                                        post_image_count: rows[0].post_image_count,
                                        post_video_count: rows[0].post_video_count,
                                        user_nickname: rows[0].user_nickname,
                                        post_isSecret: rows[0].post_isSecret,
                                        post_user_isSecret: rows[0].post_user_isSecret,
                                        post_created: rows[0].post_created,
                                        post_updated: rows[0].post_updated,
                                        liked: 'on',
                                        postOwner:postOwner
                                    });
                                } else {
                                    postMetaData.push({
                                        post_id: rows[0].post_id,
                                        editorType: rows[0].editorType,
                                        post_textOnly: rows[0].post_textOnly,
                                        shb_num: rows[0].shb_num,
                                        shb_name:rows[0].shb_name,
                                        shb_item_id: rows[0].shb_item_id,
                                        shb_item_name:rows[0].shb_item_name,
                                        parent_route: rows[0].parent_route,
                                        post_title: rows[0].post_title,
                                        post_desc: rows[0].post_desc,
                                        post_thumbnail_url: rows[0].post_thumbnail_url,
                                        post_like_count: rows[0].post_like_count,
                                        post_comment_count: rows[0].post_comment_count,
                                        post_view_count: rows[0].post_view_count,
                                        post_image_count: rows[0].post_image_count,
                                        post_video_count: rows[0].post_video_count,
                                        user_nickname: rows[0].user_nickname,
                                        post_isSecret: rows[0].post_isSecret,
                                        post_user_isSecret: rows[0].post_user_isSecret,
                                        post_created: rows[0].post_created,
                                        post_updated: rows[0].post_updated,
                                        liked: 'off',
                                        postOwner:postOwner
                                    });
                                }
                                return res.json({
                                    message:'success', 
                                    postModule:postModule, 
                                    commonFiles:rows[0].post_materials,
                                    postMetaData:postMetaData[0]
                                });

                            }
                        });
                    });
                }
            });
    }); // connect post end
}); //router end

// path: /api/shb/post/writepost/sheditor/v1
router.post('/writepost/sheditor/v1', async function (req, res) {
    if (req.body.usid === undefined) {
        return res.json({ message: 'invalidUser' });
    }

    const sessID = 'sess:' + cipher.decrypt(req.body.usid);
    client.exists(sessID, (err, replyExists) => {
        if (replyExists) {
            client.get(sessID, async(err, replyGet) => {
                const resultGet = JSON.parse(replyGet);
                
                // 1차 데이터
                const user_id = resultGet.user.user_id;
                const shb_num = req.body.BomNo;
                const shb_item_id = req.body.Category;
                const parent_route = req.body.Pr;
                const postTitle = req.body.postTitle;
                const postData = req.body.postData;
                const commonFiles = req.body.commonFiles;

                // 2차 가공 데이터  AOP = All Of Post
                let textOnly_AOP = sheditorHandle.getTextOnly(postData);
                let imageCount_AOP = sheditorHandle.getImageCount(postData);
                let thumbnailUrl_AOP = sheditorHandle.getThumbnail(postData);
                let videoCount_AOP = sheditorHandle.getVideoCount(postData);
                let blockIndexArray = [];
                let post_materials = null;

                if (commonFiles[0]) {
                    post_materials = JSON.stringify(commonFiles);
                }

                // console.log(imageCount_AOP);
                // const setBlockIndexArray = (block) =>{
                //     blockIndexArray.push(block.insertId);
                // }

                // // fill the block db
                for (let i = 0; i < postData.length; i++) {
                    // getTextOnly 의 참조변수가 배열형식이므로 데이터를 배열형식으로 집어넣어야 한다.
                    const moduleData = postData[i];
                    let textOnly_Blk = sheditorHandle.getTextOnly([moduleData]);
                    let thumbnailUrl_Blk = null;
                    let imageCount_Blk = sheditorHandle.getImageCount([moduleData]);

                    if (sheditorHandle.getThumbnail([moduleData]).imgUrl !== 'none') {
                        thumbnailUrl_Blk = sheditorHandle.getThumbnail([moduleData]);
                    }

                    // console.log('moduleData:',moduleData);
                    // console.log(`module : ${i}--------------`);
                    // console.log(textOnly_Blk);
                    // console.log(thumbnailUrl_Blk);
                    let sql = `
                        INSERT INTO post_block(pblock_uuid, pblock_images, pblock_thumbnail,pblock_image_count, pblock_desc, pblock_textOnly,pblock_imageSliderOn, pblock_videoData)
                        VALUES (?,?,?,?,?,?,?,?)
                    `;
                    let params = [
                        moduleData.id, 
                        JSON.stringify(moduleData.imageList), 
                        thumbnailUrl_Blk, 
                        imageCount_Blk, 
                        moduleData.editorData, 
                        textOnly_Blk, 
                        moduleData.imageSliderOn,
                        moduleData.videoData===null?null:JSON.stringify(moduleData.videoData)
                    ];

                    let retBlk = await pool.query(sql, params);
                    
                    if (retBlk[0].affectedRows === 1) {
                        blockIndexArray.push(retBlk[0].insertId);
                    } else {
                        return res.json({ message: 'error' });
                    }
                }

                let sql = `
                    INSERT INTO post(editorType, shb_num, shb_item_id, parent_route, post_title, post_desc, post_textOnly, post_materials, post_thumbnail_url, post_image_count, post_video_count, user_id)
                    VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
                `;
                let params = [
                    'sheditor',
                    shb_num,
                    shb_item_id,
                    parent_route,
                    postTitle,
                    JSON.stringify(blockIndexArray),
                    textOnly_AOP,
                    post_materials,
                    thumbnailUrl_AOP,
                    imageCount_AOP,
                    videoCount_AOP,
                    user_id
                ];

                let retResult = await pool.query(sql, params);
                if (retResult[0].affectedRows === 1) {
                    return res.json({ 
                        message: 'success', 
                        postInfo:{
                            postVal: retResult[0].insertId ,
                            Pr:parent_route,
                            BomNo:shb_num,
                            Category:shb_item_id
                        }
                        
                    });
                } else {
                    return res.json({ message: 'error' });
                }
            })
        }
    });
})

// path: /api/shb/post/updatepost/sheditor/v1
router.post('/updatepost/sheditor/v1', async function (req, res) {
    if (req.body.usid === undefined) {
        return res.json({ message: 'invalidUser' });
    }

    const sessID = 'sess:' + cipher.decrypt(req.body.usid);
    client.exists(sessID, (err, replyExists) => {
        if (replyExists) {
            client.get(sessID, async(err, replyGet) => {
                const resultGet = JSON.parse(replyGet);
                
                // 1차 데이터
                const user_id = resultGet.user.user_id;
                const shb_num = req.body.BomNo;
                const shb_item_id = req.body.Category;
                const parent_route = req.body.Pr;
                const postTitle = req.body.postTitle;
                const postData = req.body.postData;
                const commonFiles = req.body.commonFiles;
                const PostVal = req.body.PostVal;
                const postMetaData = req.body.postMetaData;

                let sql = `
                    SELECT * FROM post WHERE post_id=? AND post_isDeleted=0
                `;
                let params = [PostVal];
                connect.query(sql, params, function(err, rows){
                    if(err){
                        return res.json({message:'error'})
                    }
                    if(rows[0]===undefined || rows===null || rows===undefined){
                        return res.json({message:'error'})
                    }
                })

                // 2차 가공 데이터  AOP = All Of Post
                let textOnly_AOP = sheditorHandle.getTextOnly(postData);
                let imageCount_AOP = sheditorHandle.getImageCount(postData);
                let videoCount_AOP = sheditorHandle.getVideoCount(postData);
                let thumbnailUrl_AOP = sheditorHandle.getThumbnail(postData);
                let blockIndexArray = [];
                let post_materials = null;

                if (commonFiles[0]) {
                    post_materials = JSON.stringify(commonFiles);
                }

                // // // fill the block db
                for (let i = 0; i < postData.length; i++) {
                //     // getTextOnly 의 참조변수가 배열형식이므로 데이터를 배열형식으로 집어넣어야 한다.
                    const moduleData = postData[i];
                    let textOnly_Blk = sheditorHandle.getTextOnly([moduleData]);
                    let thumbnailUrl_Blk = null;
                    let imageCount_Blk = sheditorHandle.getImageCount([moduleData]);

                    if (sheditorHandle.getThumbnail([moduleData]).imgUrl !== 'none') {
                        thumbnailUrl_Blk = sheditorHandle.getThumbnail([moduleData]);
                    }
                    // console.log(postData[i]);
                    let checkExistSql = `
                        SELECT * FROM post_block WHERE pblock_uuid=?
                    `;
                    let checkExistParams = [postData[i].id];
                    let [checkExistBlock,checkExistBlockField] = await pool.query(checkExistSql,checkExistParams);
                    // console.log(checkExistBlock[0]);
                    let sql;
                    let params;
                    if(checkExistBlock[0]){
                        sql = `
                            UPDATE post_block SET pblock_images=?, pblock_thumbnail=?, pblock_image_count=?, pblock_desc=?, pblock_textOnly=?, pblock_imageSliderOn=?, pblock_videoData=?
                            WHERE pblock_id=? AND pblock_uuid=?
                        `;
                        params = [
                            JSON.stringify(moduleData.imageList),
                            thumbnailUrl_Blk,
                            imageCount_Blk,
                            moduleData.editorData,
                            textOnly_Blk,
                            moduleData.imageSliderOn,
                            moduleData.videoData===null?null:JSON.stringify(moduleData.videoData),
                            checkExistBlock[0].pblock_id, 
                            checkExistBlock[0].pblock_uuid
                        ];
                        let retBlk = await pool.query(sql, params);
                        blockIndexArray.push(checkExistBlock[0].pblock_id);
                    }else{
                        sql = `
                            INSERT INTO post_block(pblock_uuid, pblock_images, pblock_thumbnail,pblock_image_count, pblock_desc, pblock_textOnly,pblock_imageSliderOn,pblock_videoData)
                            VALUES (?,?,?,?,?,?,?,?)
                        `;
                        params = [
                            moduleData.id, 
                            JSON.stringify(moduleData.imageList), 
                            thumbnailUrl_Blk, 
                            imageCount_Blk, 
                            moduleData.editorData, 
                            textOnly_Blk, 
                            moduleData.imageSliderOn,
                            moduleData.videoData===null?null:JSON.stringify(moduleData.videoData)
                        ];
                        let retBlk = await pool.query(sql, params);
                        if (retBlk[0].affectedRows === 1) {
                            blockIndexArray.push(retBlk[0].insertId);
                        } else {
                            res.json({ message: 'error' });
                        }
                    }
                }

                let resultSql = `
                    UPDATE post SET editorType=?, shb_num=?, shb_item_id=?, parent_route=?, post_title=?, post_desc=?,post_textOnly=?,post_materials=?,post_thumbnail_url=?,post_image_count=?, post_video_count=?, user_id=?
                    WHERE post_id=?
                `;
                let resultParams = [
                    'sheditor',
                    shb_num,
                    shb_item_id,
                    parent_route,
                    postTitle,
                    JSON.stringify(blockIndexArray),
                    textOnly_AOP,
                    post_materials,
                    thumbnailUrl_AOP,
                    imageCount_AOP,
                    videoCount_AOP,
                    user_id,
                    PostVal
                ];
                let retResult = await pool.query(resultSql, resultParams);
                if (retResult[0].affectedRows === 1) {
                    return res.json({ 
                        message: 'success', 
                        postInfo:{
                            postVal: PostVal,
                            Pr:parent_route,
                            BomNo:shb_num,
                            Category:shb_item_id
                        }
                        
                    });
                } else {
                    return res.json({ message: 'error' });
                }
            })
        }
    });
})


router.post('/updatePost/category', function (req, res) {
    // console.log(req.body.usid);
    // console.log(req.body.shb_num);
    // console.log(req.body.shb_item_id);
    // console.log(req.body.post_id);
    // console.log(req.body.post_title);
    // console.log(req.body.post_desc);
    if (req.body.usid === null) {   //null or undefined
        return res.json({ message: 'invalidUser' });
    }
    const sessID = 'sess:' + cipher.decrypt(req.body.usid);
    client.exists(sessID, (err, replyExists) => {
        if (replyExists) {
            client.get(sessID, (err, replyGet) => {
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                //draftJS 포맷 형식으로만 파라미터를 설정해준다.
                let post_image_count = draftjsHandle.getImageCount(req.body.post_desc); // 이미지 개수 계산
                let post_thumbnail_url = draftjsHandle.getThumbnailUrl(req.body.post_desc); // 포스터의 첫번째 사진을 썸네일로 한다.

                var sql = `
                    UPDATE post 
                    SET post_title=?,post_desc=?,post_thumbnail_url=?,post_image_count=?, post_materials=?
                    WHERE shb_num=? AND shb_item_id=? AND post_id=? AND user_id=?
                `;
                var params = [
                    req.body.post_title,
                    req.body.post_desc,
                    post_thumbnail_url,
                    post_image_count,
                    JSON.stringify(req.body.post_materials),
                    req.body.shb_num,
                    req.body.shb_item_id,
                    req.body.post_id,
                    user_id
                ];
                // const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
                // const ip = requestip.getClientIp(req);

                // console.log(ip);

                connect.query(sql, params, function (err, rows, fields) {
                    if (err) {
                        res.status(201).json({ message: 'failure' });
                    } else {
                        // if (rows.insertId) {
                        //     res.status(201).json({ message: 'success' });
                        // } else {
                        //     res.status(201).json({ message: 'failure' });
                        // }
                        if (rows.message)
                            res.status(201).json({ message: 'success' });
                    }
                });
            });
        }
    });
});

// poster 유저 유효성 검사

router.post('/posterValidation/shb', function (req, res) {
    let sql = `
        SELECT user_id FROM post 
        WHERE post_id=? AND shb_num=?
    `;
    let params = [req.body.post_id, req.body.head_type];

    connect.query(sql, params, function (err, postGet, fileds) {

        if (postGet[0] && req.body.usid) {
            const sessID = 'sess:' + cipher.decrypt(req.body.usid);

            client.exists(sessID, (err, replyExists) => {
                if (replyExists) {
                    client.get(sessID, (err, replyGet) => {
                        const resultGet = JSON.parse(replyGet);
                        const user_id = resultGet.user.user_id;
                        if (user_id === postGet[0].user_id) {
                            res.send("valid");
                        } else {
                            res.send("invalid");
                        }
                    });
                }
            });

        } else {
            res.send("error");
        }

    });

});

router.post('/deletePoster/shb/one', function (req, res) {
    let sql = `
        SELECT user_id,post_id FROM post 
        WHERE post_id=? AND shb_num=?
    `;
    let params = [req.body.post_id, req.body.head_type];

    connect.query(sql, params, function (err, postGet, fileds) {
        if (postGet[0] && req.body.usid) {
            const sessID = 'sess:' + cipher.decrypt(req.body.usid);

            client.exists(sessID, (err, replyExists) => {
                if (replyExists) {
                    client.get(sessID, (err, replyGet) => {
                        const resultGet = JSON.parse(replyGet);
                        const user_id = resultGet.user.user_id;
                        if (user_id === postGet[0].user_id) {
                            let sql = `
                                UPDATE post SET post_isDeleted=1
                                WHERE post_id=?
                            `;
                            let params = [postGet[0].post_id];

                            connect.query(sql, params, function (err, rows, fields) {
                                res.send('success');
                            });
                        } else {
                            res.send('error');
                        }
                    });
                } else {
                    res.send('error');
                }
            });
        }
    });

});

router.post('/postCount/plus', function (req, res) {
    let sql = `
        UPDATE post SET post_view_count=post_view_count+1 WHERE post_id=?
    `;
    let params = [req.body.post_id];
    // console.log(req.body.post_id);
    connect.query(sql, params, function (err, rows, fields) {
        res.json({ message: 'postCountUpdateOK' });
    })
});

// path: /api/shb/post/getpost/recomend
router.get('/getpost/recomend', function (req, res) {

    // console.log(req.query.numIndex);
    let getLimit = Number(req.query.numIndex);
    // console.log(getLimit);
    let sql = `
        SELECT * FROM post 
        JOIN user ON post.user_id=user.user_id
        JOIN shb ON post.shb_num=shb.shb_num
        JOIN shb_item ON post.shb_item_id=shb_item.shb_item_id
        WHERE post_isDeleted=0 AND shb_item.shb_item_visible=1
        ORDER BY post_like_count DESC, post_view_count DESC
        LIMIT ?
    `;

    let params = [getLimit];
    connect.query(sql, params, function (err, rows, fields) {
        let result = [];
        if (rows[0]) {
            for (let i = 0; i < rows.length; i++) {
                let data = {
                    post_id: rows[i].post_id,
                    editorType:rows[i].editorType,
                    shb_num: rows[i].shb_num,
                    shb_name: rows[i].shb_name,
                    shb_item_id: rows[i].shb_item_id,
                    shb_item_name: rows[i].shb_item_name,
                    parent_route: rows[i].parent_route,
                    post_title: rows[i].post_title,
                    post_desc: rows[i].post_title,
                    post_thumbnail_url: rows[i].post_thumbnail_url,
                    post_like_count: rows[i].post_like_count,
                    post_comment_count: rows[i].post_comment_count,
                    post_view_count: rows[i].post_view_count,
                    post_image_count: rows[i].post_image_count,
                    post_video_count: rows[i].post_video_count,
                    post_created: rows[i].post_created,
                    post_updated: rows[i].post_updated,
                    user_nickname: rows[i].user_nickname,
                    post_isSecret: rows[i].post_isSecret,
                    post_user_isSecret: rows[i].post_user_isSecret,
                }
                result.push(data);
            }
            res.json({ message: 'success', data: result });
        } else {
            res.json({ message: 'none' });
        }

    });
});

//test
// path: /api/shb/post/papagotest
router.post('/papagotest',function(req,res){
    var request = require('request');
    var sourceText = req.body.sourceText;
    var sourceLanguage = req.body.sourceLanguage;
    var targetLanguage = req.body.targetLanguage;
    var options = {
    'method': 'POST',
    'url': 'https://openapi.naver.com/v1/papago/n2mt',
    'headers': {
        'X-Naver-Client-Id': 'TwvJBc99_86PvskJNirw',
        'X-Naver-Client-Secret': 'dQK2aht33r',
        'User-Agent': 'curl/7.49.1',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
        'Host': 'openapi.naver.com'
    },
    form: {
        'source': sourceLanguage,
        'target': targetLanguage,
        'text': sourceText
    }
    };
    request(options, function (error, response) { 
    if (error) throw new Error(error);
        // console.log(response.body)
        // console.log(JSON.parse(response.body).errorCode)
        var parsingData = JSON.parse(response.body);
        if(parsingData.errorCode==='N2MT07'){
            return res.json({message:'non-sourceText'})
        }
        res.json({message:'success',ret:parsingData});
    });
})
module.exports = router;
var express = require('express');
var router = express();
const fs = require('fs');

//AWS setting
let AWS = require("aws-sdk");
AWS.config.loadFromPath(__dirname + '/../../accesskey/awsconfig.json');

// /api/service/extend/translate/papago
router.post('/translate/papago', function (req, res) {

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
        if (parsingData.errorCode === 'N2MT07') {
            return res.json({ message: 'non-sourceText' })
        }
        res.json({ message: 'success', ret: parsingData });
    });
})

// /api/service/extend/translate/amazonTest
router.post('/translate/amazonTest', function (req, res) {


    var translate = new AWS.Translate();
    var params = {
        SourceLanguageCode: 'ko', /* required */
        TargetLanguageCode: 'zh', /* required */
        Text: '안녕하세요. 저는 프로그래머 입니다.', /* required */
    };
    translate.translateText(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
})

// /api/service/extend/corona19/korea
router.get('/corona19/korea', function (req, res) {
    // var request = require('request');
    // var cheerio = require('cheerio');

    // request('http://ncov.mohw.go.kr/index_main.jsp',function(err,response){
    //     var $ = cheerio.load(response.body);
    // console.log($('div.main_container div.co_cur ul').children().eq(0).children('a').text().split(' ')[0]);
    // console.log($('div.main_container div.co_cur ul').children().eq(1).children('a').text().split(' ')[0]);
    // console.log($('div.main_container div.co_cur ul').children().eq(2).children('a').text().split(' ')[0]);
    // let confirm = $('div.main_container div.co_cur ul').children().eq(0).children('a').text().split(' ')[0];
    // let suspect = 0;
    // let dead = $('div.main_container div.co_cur ul').children().eq(2).children('a').text().split(' ')[0];
    // let cure = $('div.main_container div.co_cur ul').children().eq(1).children('a').text().split(' ')[0];

    // console.log('확진자 : ',confirm);
    // console.log('의심환자 : ',suspect);
    // console.log('사망자 : ',dead);
    // console.log('치유환자 : ',cure);
    // res.json({
    //     message:'success',
    //     data:{
    //         confirm:confirm,
    //         suspect:suspect,
    //         dead:dead,
    //         cure:cure
    //     }
    // })
    res.json({
        message: 'success',
        data: {
            confirm: 0,
            suspect: 0,
            dead: 0,
            cure: 0
        }
    })
    // })
})

// /api/service/extend/corona19/world
router.get('/corona19/world', function (req, res) {
    var request = require('request');
    var cheerio = require('cheerio');

    request('https://ncov.dxy.cn/ncovh5/view/pneumonia', function (err, response) {
        var $ = cheerio.load(response.body);
        setTimeout(() => {
            console.log($.html());
        }, 5000)
        // console.log($('div.main_container div.co_cur ul').children().eq(1).children('a').text().split(' ')[0]);
        // console.log($('div.main_container div.co_cur ul').children().eq(2).children('a').text().split(' ')[0]);
        let confirm = $('div.main_container div.co_cur ul').children().eq(0).children('a').text().split(' ')[0];
        let suspect = 0;
        let dead = $('div.main_container div.co_cur ul').children().eq(2).children('a').text().split(' ')[0];
        let cure = $('div.main_container div.co_cur ul').children().eq(1).children('a').text().split(' ')[0];

        // console.log('확진자 : ',confirm);
        // console.log('의심환자 : ',suspect);
        // console.log('사망자 : ',dead);
        // console.log('치유환자 : ',cure);
        res.json({
            message: 'success',
            data: {
                confirm: confirm,
                suspect: suspect,
                dead: dead,
                cure: cure
            }
        })
    })
})


// /api/service/extend/translate/thispage'
router.post('/translate/thispage', async function (req, res) {
    var request = require('request');
    var cheerio = require('cheerio');
    let originHtml = req.body.originHtml;

    let test = `<div id=sheditorPart></div>`

    let array = [];
    // let element = {
    //     tag:null,
    //     attr:null,
    //     text:null,
    //     children:[]
    // }
    var $ = cheerio.load(originHtml);
    var data = $('div#sheditorPart');
    await makeElement(data);
    // console.log(array);

    await setTimeout(() => {

        let newHtml = `
            <${array[0].tag} 
                ${array[0].attr.id ? `id="${array[0].attr.id}"` : ''}
                ${array[0].attr.class ? `class="${array[0].attr.class}"` : ''}
                ${array[0].attr.style ? `style="${array[0].attr.style}"` : ''}
                ${array[0].attr.src ? `src="${array[0].attr.src}"` : ''}
                ${array[0].attr.width ? `width="${array[0].attr.width}"` : ''}
                ${array[0].attr.href ? `href="${array[0].attr.href}"` : ''}
            >
                ${array[0].text && array[0].text}
            </${array[0].tag}>
        `
        $ = cheerio.load(newHtml);
        let resultHtml = $('div#sheditorPart');

        resultHtml.append(makeHtml(array[0].children));


        console.log(resultHtml.html());
        res.send({ message: 'success', htmlData: resultHtml.html() });

    }, 2000)



    // console.log($imgTest('img.sc-jKJlTe').eq(0).attr());
    // console.log(data[0].attribs.id);
    // console.log(data.html());

    // for(let i = 0 ; i < data.children().length; i++){
    //     console.log(data.children().eq(i).html());
    //     console.log('--------------------------------');
    //     console.log('--------------------------------');
    // }

    //     res.send($.html());
    function getText(currentData) {
        // let newData = currentData;
        //     newData.children().remove();
        return new Promise((resolve, reject) => {
            let newData = currentData;
            newData.children().remove();

            var translate = new AWS.Translate();
            var params = {
                SourceLanguageCode: req.body.sourceLan ? req.body.sourceLan : 'ko', /* required */
                TargetLanguageCode: req.body.targetLan ? req.body.targetLan : 'zh', /* required */
                Text: newData.text(), /* required */
            };
            if (newData.text() === '') {
                resolve({ text: '' });
            } else {
                translate.translateText(params, async function (err, data) {
                    if (err) {
                        console.log(err, err.stack); // an error occurred
                    } else {
                        console.log(data.TranslatedText);           // successful response
                        resolve({ text: data.TranslatedText });
                        // return data.TranslatedText
                    }
                });
            }
        });



        // return newData.text();
    }

    async function makeElement(currentData) {
        // console.log('current tagName : ',currentData.get(0).tagName);
        // console.log('current tagName : ',currentData.attr());
        // console.log('he\'s children length : ',currentData.children().length);
        // console.log('hi\'s text : ', getText(currentData));
        // element.tag = currentData.get(0).tagName;
        // element.attr = currentData.attr();
        // element.text = getText(currentData);
        // element.children = [];

        // return currentData.children().length===0?0:makeElement(currentData.children().eq(0));
        let element = {
            tag: currentData.get(0).tagName,
            attr: currentData.attr(),
            // children:[
            //     {
            //         tag:currentData.children().eq(0).get(0).tagName,
            //         attr:currentData.children().eq(0).attr(),
            //         children:[]
            //     }
            // ]
            children: await makeChildren(currentData.children()),
            text: await getText(currentData).then(res => { console.log(res.text); return res.text }),
        }
        // console.log(element.children[0]);
        // console.log(element.children[0].children[0]);
        // console.log(element.children[0].children[0].children[0]);
        // console.log(element.children[0].children[0].children[0].children[0]);
        // console.log(currentData.html());
        array.push(element);
    }

    async function makeChildren(childData) {
        let array = []
        for (let i = 0; i < childData.length; i++) {
            // console.log('hi')
            // console.log(childData.get(i).tagName);
            let cd = {
                tag: childData.get(i).tagName,
                attr: childData.eq(i).attr(),
                children: childData.eq(i).children().length === 0 ? [] : await makeChildren(childData.eq(i).children()),
                text: await getText(childData.eq(i)).then(res => { console.log(res.text); return res.text })
            }
            array.push(cd);

        }
        console.log(array);
        return array;

    }

    function makeHtml(children) {
        let html = '';
        for (let i = 0; i < children.length; i++) {
            html += `
                    <${children[i].tag} 
                        ${children[i].attr.id ? `id="${children[i].attr.id}"` : ''}
                        ${children[i].attr.class ? `class="${children[i].attr.class}"` : ''}
                        ${children[i].attr.style ? `style="${children[i].attr.style}"` : ''}
                        ${children[i].attr.src ? `src="${children[i].attr.src}"` : ''}
                        ${children[i].attr.width ? `width="${children[i].attr.width}"` : ''}
                        ${children[i].attr.href ? `href="${children[i].attr.href}"` : ''}
                    >
                        ${children[i].text && children[i].text}
                        ${makeHtml(children[i].children)}
                    </${children[i].tag}>
                `
        }
        return html;

    }

    function makeChildHtml(child) {

    }
});

// /api/service/extend/translate/thispageTest'
router.post('/translate/thispageTest', async function (req, res) {
    var request = require('request');
    var cheerio = require('cheerio');
    let originHtml = req.body.originHtml;

    let test = `<div id=sheditorPart></div>`

    let array = [];
    var $ = cheerio.load(originHtml);
    var data = $('div#sheditorPart');
    await makeElement(data);
    // console.log(data.html());
    // console.log(data.children().children().html())
    // data.children().children().children().eq(0) = "hihihihihi"
    // console.log(data.children().children().children().children().eq(0).text());
    // console.log(data.children().children().children().children()[0].next.data)
    // console.log(data.children().children().children().children().eq(1).text());
    // console.log(data.children().children().children().children()[1].next.data)
    // console.log(data.children().children().children().children().eq(2).text());
    // console.log(data.children().children().children().children()[2].next?data.children().children().children().children()[2].next.data:'')

    // getText(data.children().children().children().children().eq(0));
    // getText(data.children().children().children().eq(0));
    // getText(data.children().children().eq(0));
    // getText(data.children().eq(0));
    await setTimeout(() => {

        let newHtml = `
            <${array[0].tag} 
                ${array[0].attr.id ? `id="${array[0].attr.id}"` : ''}
                ${array[0].attr.class ? `class="${array[0].attr.class}"` : ''}
                ${array[0].attr.style ? `style="${array[0].attr.style}"` : ''}
                ${array[0].attr.src ? `src="${array[0].attr.src}"` : ''}
                ${array[0].attr.width ? `width="${array[0].attr.width}"` : ''}
                ${array[0].attr.href ? `href="${array[0].attr.href}"` : ''}
            >
                ${array[0].prevText && array[0].prevText}
            </${array[0].tag}>
            ${array[0].nextText && array[0].nextText}
        `
        $ = cheerio.load(newHtml);
        let resultHtml = $('div#sheditorPart');

        resultHtml.append(makeHtml(array[0].children));


        // console.log(resultHtml.html());
        res.send({ message: 'success', htmlData: resultHtml.html() });

    }, 2000)

    function getText(currentData, type) {
        // console.log('Get Text 000000000')
        // console.log(currentData.eq(0).parent().html());
        // console.log(currentData[0].children[0]);

        // console.log(currentData.children().get(0));
        // console.log(currentData.parent());
        // if(currentData.children().length===0){
        //     console.log('lemngth0')
        //     // console.log(currentData);
        // }else{
        //     console.log(currentData.children()[0]);
        //     prevText = currentData.children()[0].prev?currentData.children()[0].prev.data:'';
        //     currentText = currentData.children().eq(0).text();
        //     nextText = currentData.children()[0].next?currentData.children()[0].next.data:'';
        //     console.log(prevText);
        //     console.log(currentText);
        //     console.log(nextText);
        // }

        // nextText = currentData
        // return new Promise((resolve, reject)=>{
        //     // console.log(currentData[0].next);
        //     resolve({
        //         prevText:currentData[0].children[0].data?currentData[0].children[0].data:'',
        //         nextText:currentData[0].next && currentData[0].next.data?currentData[0].next.data:''
        //     })
        // });

        if (type === 'prevText') {
            return new Promise((resolve, reject) => {
                // console.log(currentData[0].children[0] && currentData[0].children[0].data?currentData[0].children[0].data:'');
                // console.log(currentData[0].next && currentData[0].next.data?currentData[0].next.data:'');
                if (currentData[0].children[0] && currentData[0].children[0].data) {

                    var translate = new AWS.Translate();
                    var params = {
                        SourceLanguageCode: req.body.sourceLan ? req.body.sourceLan : 'ko', /* required */
                        TargetLanguageCode: req.body.targetLan ? req.body.targetLan : 'zh', /* required */
                        Text: currentData[0].children[0] && currentData[0].children[0].data ? currentData[0].children[0].data : '', /* required */
                    };
                    translate.translateText(params, async function (err, data) {
                        if (err) {
                            console.log(err, err.stack); // an error occurred
                            reject();
                        } else {
                            // console.log(data.TranslatedText);           // successful response
                            resolve({ status: 'success', prevText: data.TranslatedText });
                            // return data.TranslatedText
                        }
                    });

                } else {
                    resolve({ status: 'success', prevText: '' });
                }
            });
        } else if (type === 'nextText') {
            return new Promise((resolve, reject) => {
                // console.log(currentData[0].children[0].data?currentData[0].children[0].data:'');
                // console.log(currentData[0].next && currentData[0].next.data?currentData[0].next.data:'');
                if (currentData[0].next && currentData[0].next.data) {

                    var translate = new AWS.Translate();
                    var params = {
                        SourceLanguageCode: req.body.sourceLan ? req.body.sourceLan : 'ko', /* required */
                        TargetLanguageCode: req.body.targetLan ? req.body.targetLan : 'zh', /* required */
                        Text: currentData[0].next && currentData[0].next.data ? currentData[0].next.data : '', /* required */
                    };
                    translate.translateText(params, async function (err, data) {
                        if (err) {
                            console.log(err, err.stack); // an error occurred
                            reject();
                        } else {
                            // console.log(data.TranslatedText);           // successful response
                            resolve({ status: 'success', nextText: data.TranslatedText });
                            // return data.TranslatedText
                        }

                    });
                } else {
                    resolve({ status: 'success', nextText: '' });
                }
            });

        }

    }

    async function makeElement(currentData) {
        let element = {
            tag: currentData.get(0).tagName,
            attr: currentData.attr(),
            children: await makeChildren(currentData.children()),
            prevText: await getText(currentData, 'prevText').then(res => {
                if (res.status === 'success') {
                    return res.prevText
                }
            }).catch(err => {
                return res.json({ message: 'error' })
            }),
            nextText: await getText(currentData, 'nextText').then(res => {
                if (res.status === 'success') {
                    return res.nextText
                }

            }).catch(err => {
                return res.json({ message: 'error' })
            }),
        }
        array.push(element);
    }

    async function makeChildren(childData) {
        let array = []
        for (let i = 0; i < childData.length; i++) {
            let cd = {
                tag: childData.get(i).tagName,
                attr: childData.eq(i).attr(),
                children: childData.eq(i).children().length === 0 ? [] : await makeChildren(childData.eq(i).children()),
                prevText: await getText(childData.eq(i), 'prevText').then(res => {
                    if (res.status === 'success') {
                        return res.prevText
                    }

                }).catch(err => {
                    return res.json({ message: 'error' })
                }),
                nextText: await getText(childData.eq(i), 'nextText').then(res => {
                    if (res.status === 'success') {
                        return res.nextText
                    }
                }).catch(err => {
                    return res.json({ message: 'error' })
                })
            }
            array.push(cd);

        }
        return array;

    }

    function makeHtml(children) {
        let html = '';
        for (let i = 0; i < children.length; i++) {
            html += `
                    <${children[i].tag} 
                        ${children[i].attr.id ? `id="${children[i].attr.id}"` : ''}
                        ${children[i].attr.class ? `class="${children[i].attr.class}"` : ''}
                        ${children[i].attr.style ? `style="${children[i].attr.style}"` : ''}
                        ${children[i].attr.src ? `src="${children[i].attr.src}"` : ''}
                        ${children[i].attr.width ? `width="${children[i].attr.width}"` : ''}
                        ${children[i].attr.href ? `href="${children[i].attr.href}"` : ''}
                    >
                        ${children[i].prevText && children[i].prevText}
                        ${makeHtml(children[i].children)}
                    </${children[i].tag}>
                    ${children[i].nextText && children[i].nextText}
                `
        }
        return html;

    }
})

// /api/service/extend/video'
// router.get('/video', async (req, res) =>{
//     const readAliossConfig = fs.readFileSync(__dirname + '/../../accesskey/aliossconfig.json');
//     const aliossconfig = JSON.parse(readAliossConfig);
//     //Alibaba Cloud OSS Setting
//     let OSS = require('ali-oss');

//     let OSSClient = new OSS({
//         region: aliossconfig.region,
//         accessKeyId: aliossconfig.accessKeyId,
//         accessKeySecret: aliossconfig.accessKeySecret,
//         bucket: aliossconfig.bucket
//     });
//     let ossDirectory = 'videoStream/';

//     let resultData = await OSSClient.get(ossDirectory+'media1.mp4');
//     const path = resultData.res.requestUrls[0];
//     // const path="https://synabrodemo.oss-ap-southeast-1.aliyuncs.com/videoStream/media1.mp4";
//     console.log(path);
//     const stat = fs.statSync(path)
//     const fileSize = stat.size
//     const range = req.headers.range
//     if (range) {
//         const parts = range.replace(/bytes=/, "").split("-")
//         const start = parseInt(parts[0], 10)
//         const end = parts[1]
//             ? parseInt(parts[1], 10)
//             : fileSize - 1
//         const chunksize = (end - start) + 1
//         const file = fs.createReadStream(path, { start, end })
//         const head = {
//             'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//             'Accept-Ranges': 'bytes',
//             'Content-Length': chunksize,
//             'Content-Type': 'video/mp4',
//         }
//         res.writeHead(206, head);
//         file.pipe(res);
//     } else {
//         const head = {
//             'Content-Length': fileSize,
//             'Content-Type': 'video/mp4',
//         }
//         res.writeHead(200, head)
//         fs.createReadStream(path).pipe(res)
//     }
// })
module.exports = router;
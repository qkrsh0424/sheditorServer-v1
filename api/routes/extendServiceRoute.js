var express = require('express');
var router = express();
const fs = require('fs');

//AWS setting
let AWS = require("aws-sdk");
AWS.config.loadFromPath(__dirname+'/../../accesskey/awsconfig.json');

// /api/service/extend/translate/papago
router.post('/translate/papago',function(req,res){
    
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

// /api/service/extend/translate/amazonTest
router.post('/translate/amazonTest',function(req,res){
    

    var translate = new AWS.Translate();
    var params = {
        SourceLanguageCode: 'ko', /* required */
        TargetLanguageCode: 'zh', /* required */
        Text: '안녕하세요. 저는 프로그래머 입니다.', /* required */
      };
      translate.translateText(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });
})

module.exports = router;
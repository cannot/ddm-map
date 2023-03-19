const express = require("express");
const router = express.Router();
const axios = require("axios");
const url = require("url");

router.get("/:query", async (req, res) => {
    try {
        // add api key and query strings
        const params = new URLSearchParams({
            access_token: process.env.API_KEY,
            ...url.parse(req.url, true).query,
        });
        const query = req.params.query;
        const results = await axios(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?${params}`
        );

        // format data to include city and state
        results.data.features.forEach((item) => {
            item.context.forEach((type) => {
                if (type.id.includes("place")) {
                    item.city = item.text;
                }
                if (type.id.includes("region")) {
                    item.state = item.text;
                }
            });
        });

        // store results data from axios call
        const data = results.data;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/p139/:query", async (req, res) => {
    try {
        // add api key and query strings
        const params = new URLSearchParams({
            access_token: process.env.API_KEY,
            ...url.parse(req.url, true).query,
        });

        //console.log(req.query.JOB_STATUS_ALL);

        var prm = JSON.stringify({
            "data": {
                "areaCode": "",
                "branchCode": "01",
                "jobCode": (req.query.JOB_CODE == "null")?'':req.query.JOB_CODE,
                "jobOpenDtBegin": "",
                "jobOpenDtEnd": "",
                "jobStatusAll": req.query.JOB_STATUS_ALL,
                "jobStatusJ02": req.query.JOB_STATUS_J02,
                "jobStatusJ03": req.query.JOB_STATUS_J03,
                "jobStatusJ04": req.query.JOB_STATUS_J04,
                "jobStatusJ09": req.query.JOB_STATUS_J09,
                "jobStatusJ12": req.query.JOB_STATUS_J12,
                "teamId": 0,
                "userId": "WLMA103"
              }
        });

        var config = {
            method: 'post',
            url: 'http://sitdev.dyndns.org:9131/WLMAService/rest/internal/app/fm/p_139_fm_job_on_map',
            headers: {
                'token': 'dev',
                'Content-Type': 'application/json'
            },
            data: prm
        };

        const query = req.params.query;
        const results = await axios(config);

        

        // format data to include city and state
        // results.data.dataList.forEach((item) => {
        //     item.context.forEach((type) => {
        //         if (type.id.includes("place")) {
        //             item.city = item.text;
        //         }
        //         if (type.id.includes("region")) {
        //             item.state = item.text;
        //         }
        //     });
        // });

        /*
    "dataList": [
        {
            "seqPk": 16,
            "jobCode": "J650100066",
            "latitude": 0.0,
            "longitude": 0.0,
            "jobStatusCode": "J02",
            "jobStatusDesc": "มอบหมายงานแล้ว"
        },
        {
            "seqPk": 60,
            "jobCode": "J650100104",
            "latitude": 13.722483,
            "longitude": 100.508015,
            "jobStatusCode": "J04",
            "jobStatusDesc": "งานภาคสนามเสร็จสิ้น"
        },
        },
        */

        // store results data from axios call
        const data = results.data;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/p275/:query", async (req, res) => {
    try {
        // add api key and query strings
        const params = new URLSearchParams({
            access_token: process.env.API_KEY,
            ...url.parse(req.url, true).query,
        });

        //console.log(req.query.JOB_STATUS_ALL);

        var prm = JSON.stringify({
            "data": {
              "beginDate": "20100101",
              "branchCode": "string",
              "displayType": "3",
              "endDate": "20221212",
              "userId": "120"
            },
            "maxRange": 0,
            "menuCode": "string",
            "minRange": 0,
            "mode": "string",
            "userInfo": "string"
          });

        var config = {
            method: 'post',
            url: 'http://sitdev.dyndns.org:9131/WLMAService/rest/internal/app/pm/p_275_pm_pressure_on_map',
            headers: {
                'token': 'dev',
                'Content-Type': 'application/json'
            },
            data: prm
        };

        const query = req.params.query;
        const results = await axios(config);

        /*
    "dataList": [
        {
            "seqPk": 16,
            "jobCode": "J650100066",
            "latitude": 0.0,
            "longitude": 0.0,
            "jobStatusCode": "J02",
            "jobStatusDesc": "มอบหมายงานแล้ว"
        },
        {
            "seqPk": 60,
            "jobCode": "J650100104",
            "latitude": 13.722483,
            "longitude": 100.508015,
            "jobStatusCode": "J04",
            "jobStatusDesc": "งานภาคสนามเสร็จสิ้น"
        },
        },
        */

        // store results data from axios call
        const data = results.data;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/p510/:query", async (req, res) => {
    try {
        // add api key and query strings
        const params = new URLSearchParams({
            access_token: process.env.API_KEY,
            ...url.parse(req.url, true).query,
        });

        //console.log(req.query.JOB_STATUS_ALL);

        var prm = JSON.stringify({
            "data": {
              "areaCode": "01-01-01",
              "userId": "WLMA103"
            },
            "maxRange": 0,
            "menuCode": "string",
            "minRange": 0,
            "mode": "string",
            "userInfo": "string"
          });

        var config = {
            method: 'post',
            url: 'http://sitdev.dyndns.org:9131/WLMAService/rest/internal/app/dma/p_510_dma_area_general_info',
            headers: {
                'token': 'dev',
                'Content-Type': 'application/json'
            },
            data: prm
        };

        const query = req.params.query;
        const results = await axios(config);


        // store results data from axios call
        const data = results.data;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router
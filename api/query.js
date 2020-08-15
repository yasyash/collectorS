const express = require('express');

const router = express.Router();

const Stations = require('../models/stations');

const Sensors_data = require('../models/sensors_data');

const isEmpty = require('lodash.isempty');

router.post('/inject', (req, resp) => {
    var token = req.body.token;
    var message = req.body.message;
    var locality = req.body.locality;
    var object = req.body.object;
    var date_time = req.body.date_time;
    var serialnum = req.body.serialnum;
    var params = req.body.params;

    //automated system for processing air pollution information codes
    var aspapi_codes = {
        "P001": "Пыль общая",
        "PM1": "PM1",
        "PM2.5": "PM2.5",
        "PM10": "PM10",
        "P005": "NO2",
        "P006": "NO",
        "P019": "NH3",
        "P028": "бензол",
        "P030": "HF",
        "P015": "HCl",
        "м,п-ксилол": "м,п-ксилол",
        "о-ксилол": "о-ксилол",
        "P007": "O3",
        "P008": "H2S",
        "P002": "SO2",
        "P068": "стирол",
        "P071": "толуол",
        "P004": "CO",
        "P010": "фенол",
        "P022": "CH2O",
        "P077": "хлорбензол",
        "P083": "этилбензол"
    };

    var aspapi_codes_inv = {
        "Пыль общая": "P001",
        "PM1": "PM1",
        "PM2.5": "PM2.5",
        "PM10": "PM10",
        "NO2": "P005",
        "NO": "P006",
        "NH3": "P019",
        "бензол": "P028",
        "HF": "P030",
        "HCl": "P015",
        "м,п-ксилол": "м,п-ксилол",
        "о-ксилол": "о-ксилол",
        "O3": "P007",
        "H2S": "P008",
        "SO2": "P002",
        "стирол": "P068",
        "толуол": "P071",
        "CO": "P004",
        "фенол": "P010",
        "CH2O": "P022",
        "хлорбензол": "P077",
        "этилбензол": "P083"
    };

    Stations.query('where', 'code', token)
        .fetchAll()
        .then(results => {

            result = results.toJSON();
            
            if (result.length > 0) {

                var idd = result[0].idd;
                console.log('message id = ', message);
                for (key in params) {
                    if (aspapi_codes[key]) {
                        var val = aspapi_codes[key];
                        params[val] = params[key];
                        delete params[key];
                    }
                };

                for (key in params) {
                    console.log('keys ', idd, params[key].serialnum, date_time, key, params[key].measure);

                    Sensors_data.forge({ "idd": idd, "serialnum": params[key].serialnum, "date_time": params[key].date_time, "typemeasure": key, "measure": params[key].measure, "is_alert": false }).save()
                        .catch(err => resp.status(404).json({ "success": false, "error": err }));

                }
                console.log('the message is successfully processed... ');

                resp.json({ success: true, message: message });
            }
            else {
                console.log('the message id = ', message, "is processed with fail...");

                resp.status(404).json({ "success": false });

            }
        })
        .catch(err => resp.status(404).json({ "success": false, "error": err }));


});

router.get('/inject', (req, resp) => {
    resp.send({ "error" : "Method GET in not support." });
});

module.exports = router;

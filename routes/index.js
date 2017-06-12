var express = require('express');
var request = require('request');
var _ = require('underscore');
var Handlebars = require('handlebars');
var router = express.Router();
var mongoose = require('mongoose');
var moment = require('moment');

mongoose.connect('');
var db = mongoose.connection;
db.on('connected', function() {
    console.log('Mongo DB connection open for DB');
});


var Schema = mongoose.Schema;

var ResultSchema = new Schema({
    enrollment: { type: Number, min: 12, required: true },
    spi: Number,
    name: String,
    examnumber: String,
    cpi: Number,
    cgpa: Number,
    sem: String,
    branch: String,
    totalblock: Number,
    currentsemblock: Number,
    batch: Number,
    subject: [{
        code: Number,
        name: String,
        theoryese: String,
        theorypa: String,
        theorytotal: String,
        practicalese: String,
        practicalpa: String,
        practicaltotal: String,
        subjectgrade: String
    }]
});

var Result = mongoose.model('results', ResultSchema);

/* GET home page. */
/*router.get('/', function(req, res, next) {
    Result.find({}, function(err, result) {
        res.json(result);
    });
});*/

// store the data into the database from chrome extension
router.post('/', function(req, res) {

    try {
        var data = req.body;

        if(data["username"] != "deep" || data["password"] != "deep@1996"){
            console.log("data[\"password\"]", data["password"]);
            console.log("data[\"username\"]", data["username"]);
            res.send('Authentication Error');
            return;
        }

        var newData = {};

        for (var key in data) {
            if (key.indexOf("[]") != -1)
                newData[key.replace("[]", "")] = data[key];
            else
                newData[key] = data[key];
        }

        var temp = {};
        temp["enrollment"] = newData["enroll"];
        temp["spi"] = newData["SPI"];
        temp["cpi"] = newData["CPI"];
        temp["cgpa"] = newData["CGPA"];
        temp["sem"] = newData["sem"];
        temp["branch"] = newData["branch"];
        temp["totalblock"] = newData["Total Backlog"];
        temp["currentsemblock"] = newData["Current Sem. Backlog"];
        temp["name"] = newData["name"].toUpperCase();
        temp["examnumber"] = newData["examnumber"];
        temp["subject"] = [];

        if (temp["spi"].indexOf('-') != -1) {
            temp["spi"] = 0.00;
        }

        for (var key in newData) {
            var val = newData[key];
            if (typeof val == "object") {
                temp["subject"].push({
                    code: key,
                    name: val[0],
                    theoryese: val[1],
                    theorypa: val[2],
                    theorytotal: val[3],
                    practicalese: val[4],
                    practicalpa: val[5],
                    practicaltotal: val[6],
                    subjectgrade: val[7]
                });
            }
        }

        var studentMonth = moment().month("AUG").format("MM");
        var studentYear = "20" + (temp['enrollment'] + " ").substring(0, 2);

        var resultYeartTemp = temp['sem'].substring(temp['sem'].indexOf('(') + 1, temp['sem'].lastIndexOf(')')).trim().split(' ');
        var resultMonth = moment().month(resultYeartTemp[0]).format("MM");
        var resultYear = resultYeartTemp[1];

        var a = moment(new Date(studentMonth + "/01/" + studentYear));
        var b = moment(new Date(resultMonth + "/01/" + resultYear));

        var months = b.diff(a, 'months');

        var diff = Math.round(months / 6);
        var resultSem = temp['sem'].replace("BE SEM ", "").trim()[0];


        var saveData = function() {
            try {
                var result = new Result(temp);
                result.save(function(err) {
                    if (err) {
                        console.log("Error", err);
                        res.send('Error')
                    } else {
                        console.log("Saved !!!!!!!!!");
                        res.send('Data Saved Successfully')
                    }
                });
            } catch (ex) {

            }
        }


        if (temp['sem'].indexOf('Regular') != -1) {
            if (diff == resultSem) {
                temp['batch'] = studentYear;
                saveData();
            } else {
                temp['batch'] = (diff - resultSem) / 2 + parseInt(studentYear);
                var q1 = Result.find({ enrollment: temp['enrollment'] });
                q1.exec(function(err, value) {
                    if (value.length != 0) {
                        value['batch'] = temp['batch'];
                        new Result(value).save(function(err) {
                            if (err) {
                                console.log("Error", err);
                            } else {
                                console.log("Saved !!!!!!!!!");
                            }
                        })
                    }
                    saveData();
                });
            }
            
        } else {
            var q1 = Result.find({ enrollment: temp['enrollment'] }).limit(1);
            q1.exec(function(err, result) {
                if (result.length != 0) {
                    _.each(result, function(res) {
                        temp['batch'] = res['batch'];
                    });
                } else {
                    temp['batch'] = "20" + (temp['enrollment'] + "").substring(0, 2);
                }
                saveData();
            });
        }
        
    } catch (ex) {
        
    }
});

/*router.get('/alldata', function(req, res, next) {
    Result.find({}, function(err, result) {
        _.each(result, function(temp) {
            var studentMonth = moment().month("AUG").format("MM");
            var studentYear = "20" + (temp['enrollment'] + " ").substring(0, 2);

            var resultYeartTemp = temp['sem'].substring(temp['sem'].indexOf('(') + 1, temp['sem'].lastIndexOf(')')).trim().split(' ');
            var resultMonth = moment().month(resultYeartTemp[0]).format("MM");
            var resultYear = resultYeartTemp[1];

            var a = moment(new Date(studentMonth + "/01/" + studentYear));
            var b = moment(new Date(resultMonth + "/01/" + resultYear));

            var months = b.diff(a, 'months');

            var diff = Math.round(months / 6);
            var resultSem = temp['sem'].replace("BE SEM ", "").trim()[0];


            var saveData = function() {
                var result = new Result(temp);
                result.save(function(err) {
                    if (err) {
                        console.log("Error", err);
                        //res.send('Error')
                    } else {
                        console.log("Saved !!!!!!!!!");
                        //res.send('Data Saved Successfully')
                    }
                });
            }

            if (temp['sem'].indexOf('Regular') != -1) {
                if (diff == resultSem) {
                    temp['batch'] = studentYear;
                } else {
                    temp['batch'] = (diff - resultSem) / 2 + parseInt(studentYear);
                    var q1 = Result.find({ enrollment: parseInt(temp['enrollment'])} , {batch : 1});
                    q1.exec(function(err, value) {
                        _.each(value,function(val){
                            if (val.length != 0) {
                                val['batch'] = temp['batch'];
                                val.save(function(err) {
                                    if (err) {
                                        console.log("Error", err);
                                    } else {
                                        console.log("Saved !!!!!!!!!");
                                    }
                                });
                            }
                        });
                    });
                }
                saveData();
            } else {
                var q1 = Result.find({ enrollment: temp['enrollment'] }).limit(1);
                q1.exec(function(err, result) {
                    if (result.length != 0) {
                        _.each(result, function(res) {
                            temp['batch'] = res['batch'];
                        });
                    } else {
                        temp['batch'] = "20" + (temp['enrollment'] + "").substring(0, 2);
                    }
                    saveData();
                });
            }
        });
    });
});*/

// return collage top 3 students
router.post('/collagetop', function(req, res, next) {
    var top = {};

    var q1 = Result.find().sort({ 'cgpa': -1 }).limit(3);
    q1.exec(function(err, result) {
        top['cgpa'] = result;
        var q2 = Result.find().sort({ 'cpi': -1 }).limit(3);
        q2.exec(function(err, result) {
            _.each(result, function(res) { res['top'] = 'cgpa' });
            top['cpi'] = result;
            var q3 = Result.find().sort({ 'spi': -1 }).limit(3);
            q3.exec(function(err, result) {
                _.each(result, function(res) { res['top'] = 'cgpa' });
                top['spi'] = result;
                res.json(top);
            });
        });
    });
});

// return brach top 3 students
router.post('/branchtop', function(req, res, next) {
    var top = {};
    var br = req.query.branch;

    var q1 = Result.find({ branch: br }).sort({ 'cgpa': -1 }).limit(3);
    q1.exec(function(err, result) {
        top['cgpa'] = result;
        var q2 = Result.find({ branch: br }).sort({ 'cpi': -1 }).limit(3);
        q2.exec(function(err, result) {
            top['cpi'] = result;
            var q3 = Result.find({ branch: br }).sort({ 'spi': -1 }).limit(3);
            q3.exec(function(err, result) {
                top['spi'] = result;
                res.json(top);
            });
        });
    });
});


// get the semester wise result (all semester data)
router.post('/branch', function(req, res, next) {
    var top = {};
    var br = req.query.branch;
    var yr = req.query.year;
    var sem = req.query.sem;
    sem = ".*SEM " + sem + ".*";
    var q1 = Result.find({
        branch: br,
        sem: { $regex: sem },
        batch: yr
    });

    q1.exec(function(err, result) {
        res.json(result);
    });
});


// return batches of branch
router.post('/years', function(req, res, next) {

    var branch = req.query.branch;

    var q1 = Result.find({ branch: branch }).distinct("batch")

    q1.exec(function(err, result) {
        res.json(_.uniq(result, function(y) {
            return y;
        }));
    });
});

// return avilible semester on selected batch
router.post('/sem', function(req, res, next) {

    var year = req.query.year;
    var branch = req.query.branch;

    var q1 = Result.find({ branch: branch, batch: year }, { "sem": 1 });

    q1.exec(function(err, result) {
        var temp = _.uniq(result, function(y) {
            return y.sem.substring(0, 11);
        });
        res.json(temp);
    });
});

// search student by enrollment or name for search suggetions
router.post('/search', function(req, res, next) {

    var search = req.query.string;
    var branch = req.query.branch;

    enrollment = ".*" + search + ".*";
    name = ".*" + search.toUpperCase() + ".*";

    var data = {};

    var q1 = Result.find({ branch: branch, $where: "/^" + enrollment + ".*/.test(this.enrollment)" }, { name: 1, enrollment: 1, branch: 1 });
    q1.exec(function(err, result) {
        data = result;
        if (data.length == 0) {
            var q1 = Result.find({ branch: branch, "name": { $regex: name } }, { name: 1, enrollment: 1, branch: 1 });
            q1.exec(function(err, result) {
                res.json(result);
                return;
            });
        } else {
            res.json(data);
        }
    });
});

// return student data 
router.post('/student', function(req, res, next) {

    var enrollment = req.query.enrollment;
    var name = req.query.name;

    if (enrollment) {
        enrollment = ".*" + enrollment + ".*";
        var q1 = Result.find({ $where: "/^" + enrollment + ".*/.test(this.enrollment)" });
        q1.exec(function(err, result) {
            res.json(result);
        });
    } else if (name) {
        name = ".*" + name.toUpperCase() + ".*";
        var q1 = Result.find({ "name": { $regex: name } });
        q1.exec(function(err, result) {
            res.json(result);
        });
    }

});

module.exports = router;

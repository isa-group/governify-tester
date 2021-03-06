/*!
governify-tester 0.0.2, built on: 2017-03-28
Copyright (C) 2017 ISA Group
http://www.isa.us.es/
https://github.com/isa-group/governify-tester

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/


'use strict';

var request = require('request');
var Promise = require('bluebird');
var config = require('./configurations/config.js');
var fs = require('fs');
var jsyaml = require('js-yaml');
var moment = require('moment');


module.exports = {
    doParallelRequestWithDuration: _doParallelRequestWithDuration,
    doParallelRequestFromfile: _doParallelRequestFromfile,
    doOneStackOfRequest: _doOneStackOfRequest,
    doRequests: _doRequests
};



var doRequest = function(options) {
    //console.log("Building promise");
    return new Promise(function(resolve) {
        var success = null;
        request(options, function(error, response) {
            if (!error) {
                if (parseInt(response.statusCode) > 300) {
                    success = false;
                } else {
                    success = true;
                }

                resolve(success);
            } else {
                success = false;
                resolve(success);
            }
        });
    });
};


function _promisesRequests(url, method, number, body, headers) {
    let options;

    if (method.toUpperCase() == "GET") {
        options = {
            uri: url,
            method: method,
        };
    } else {
        if (body) {
            if (typeof(body) == "string") {
                body = JSON.parse(body);
            }
        }
        let isJson = true;
        if (headers && headers['content-type'] != "application/json") {
            isJson = false;
        }

        options = {
            uri: url,
            method: method,
            json: isJson,
            headers: headers,
            body: body,
        };

    }

    var asyncTasks = [];

    for (var i = 0; i < number; i++) {
        asyncTasks.push(doRequest(options));
    }
    return Promise.all(asyncTasks);


}


function _doRequests(url, method, count, body, headers) {
    setInterval(function() {
        let total = 0;
        let successful = 0;
        let error = 0;
        let start_date = moment();
        _promisesRequests(url, method, count, body, headers).then(function(success) {
            success.forEach(function(element) {
                if (element) {
                    successful++;
                } else {
                    error++;
                }

                total++;

            });

            let finish_date = moment();
            let resobject = {};
            resobject.totalRequest = total;
            resobject.success = successful;
            resobject.error = error;
            resobject.startTime = start_date.toISOString();
            resobject.finishTime = finish_date.toISOString();
            resobject.lastedFor = finish_date - start_date + " ms";
            console.log(resobject);


        });

    }, 1000); // setInterv0al

}


function _doRequestsRandom(url, method, count, duration, body, headers, fields) {
    return new Promise(function(resolve) {

        let total = 0;
        let successful = 0;
        let error = 0;
        let request_ack = 0;
        let counter_timer = 0;
        let start_date = moment();
        let interval = setInterval(function() {
            let bodygenerated;

            if (fields) {
                if (body) {
                    bodygenerated = generateRandomObjectTemplate(body, fields);
                    console.log(bodygenerated);
                } else {
                    throw new Error("Body's necessary for rendering");
                }

            } else {
                if (body) {
                    bodygenerated = generateRandomObject(body);
                    console.log(bodygenerated);
                }
            }


            if (counter_timer == duration - 1) {
                clearInterval(interval);
            }

            _promisesRequests(url, method, count, bodygenerated, headers).then(function(success) {
                success.forEach(function(element) {
                    if (element) {
                        successful++;
                    } else {
                        error++;
                    }

                    total++;

                });

                request_ack++;
                if (request_ack == duration) {
                    let finish_date = moment();
                    let resobject = {};
                    resobject.totalRequest = total;
                    resobject.success = successful;
                    resobject.error = error;
                    resobject.totalStack = request_ack;
                    resobject.startTime = start_date.toISOString();
                    resobject.finishTime = finish_date.toISOString();
                    resobject.lastedFor = finish_date - start_date + " ms";
                    resolve(resobject);
                }

            });
            counter_timer++;


        }, 1000); // setInterval

    });





}

function generateRandomObject(body) {
    let obj_rand = {};

    for (var key in body) {
        let objects = body[key];
        if (!objects.indexOf("Date")) {
            obj_rand[key] = moment().toISOString();
        } else {
            obj_rand[key] = objects[Math.floor(Math.random() * (objects.length - 1))];

        }
    }
    return obj_rand;
}


function generateRandomObjectTemplate(body, fields) {
    for (var key in fields) {
        let objects = fields[key];
        let charReplaced = '"{{' + key + '}}"';
        var re = new RegExp(charReplaced, "g");
        if (!objects.indexOf("Date")) {
            body = body.replace(re, '"' + moment().toISOString() + '"');
        } else {
            body = body.replace(re, '"' + objects[Math.floor(Math.random() * (objects.length - 1))] + '"');

        }
    }

    try {
        body = JSON.parse(body);
    } catch (e) {
        throw new Error("Render has not finished, please you should sure");
    }
    return body;
}




function _doOneStackOfRequest(url, method, count, body) {
    return new Promise(function(resolve) {
        let total = 0;
        let successful = 0;
        let error = 0;
        let start_date = moment();
        _promisesRequests(url, method, count, body).then(function(success) {
            success.forEach(function(element) {
                if (element) {
                    successful++;
                } else {
                    error++;
                }

                total++;

            });
            let finish_date = moment();
            let resobject = {};
            resobject.totalRequest = total;
            resobject.success = successful;
            resobject.error = error;
            resobject.startTime = start_date.toISOString();
            resobject.finishTime = finish_date.toISOString();
            resobject.lastedFor = finish_date - start_date + " ms";
            console.log(resobject);
            resolve(resobject);

        });


    });


}


function _doParallelRequestWithDuration(url, method, count, duration, body) {

    return new Promise(function(resolve) {
        var promiseRequest = new Promise(function(resolve) {

            let total = 0;
            let successful = 0;
            let error = 0;
            let counter_timer = 0;
            let request_ack = 0;
            let start_date = moment();
            let interval = setInterval(function() {
                if (counter_timer == duration - 1) {
                    clearInterval(interval);
                }

                _promisesRequests(url, method, count, body).then(function(success) {
                    success.forEach(function(element) {
                        if (element) {
                            successful++;
                        } else {
                            error++;
                        }

                        total++;

                    });

                    request_ack++;
                    if (request_ack == duration) {
                        let finish_date = moment();
                        let resobject = {};
                        resobject.totalRequest = total;
                        resobject.success = successful;
                        resobject.error = error;
                        resobject.totalStack = request_ack;
                        resobject.startTime = start_date.toISOString();
                        resobject.finishTime = finish_date.toISOString();
                        resobject.lastedFor = finish_date - start_date + " ms";
                        resolve(resobject);
                    }

                });
                counter_timer++;


            }, 1000); // setInterval

        });

        promiseRequest.then(function(success) {
            success.url = url;
            success.method = method;
            writeLog(success);
            console.log(success);

            resolve(success);



        });
    });
}



function _doParallelRequestFromfile(uri) {
    return new Promise(function(resolve) {
        var configString;
        if (!uri) {
            throw new Error("Parameter URI is required");
        } else {
            configString = fs.readFileSync(uri, "utf8");
        }
        //var newConfigurations = jsyaml.safeLoadAll(configString);
        var newConfigurations = [];

        jsyaml.safeLoadAll(configString, function(doc) {
            newConfigurations.push(doc);
        });

        var configs = newConfigurations.length;
        var executed = 0;
        var arrayResults = [];
        for (var i = 0; i < configs; i++) {
            let singleDoc = newConfigurations[i];
            _switchdoc(singleDoc).then(function(success) {
                executed++;
                arrayResults.push(success);
                if (executed == configs) {
                    resolve(arrayResults);
                }

            });
        }



    });



}






function _switchdoc(testConfiguration) {
    return new Promise(function(resolve) {
        var type = testConfiguration.type;

        if (type == "interval") {
            let numberOftenants = testConfiguration.tenants.length;
            let executed = 0;
            let arrayOfResult = [];

            for (var element in testConfiguration.tenants) {
                let method = testConfiguration.tenants[element].method ? testConfiguration.tenants[element].method : testConfiguration.request.method;
                let headers = testConfiguration.request.headers;
                let arrayThrougt = testConfiguration.tenants[element].intervals;
                let duration = testConfiguration.tenants[element].duration;
                let body = testConfiguration.request.body ? testConfiguration.request.body : "";

                execRequestsInterval(testConfiguration.url, method, arrayThrougt, duration, testConfiguration.tenants[element].id, testConfiguration.testId, body, headers).then(function(success) {
                    success.url = testConfiguration.url;
                    success.method = method;
                    success.idTenant = testConfiguration.tenants[element].id;
                    success.idTest = testConfiguration.testId;
                    writeLog(success);
                    arrayOfResult.push(success);
                    executed++;
                    console.log(success);
                    if (executed == numberOftenants) {
                        resolve(arrayOfResult);

                    }

                });

            }

        } else if (type == "random") {



            _doRequestsRandom(testConfiguration.url, testConfiguration.request.method, testConfiguration.count,
                testConfiguration.duration, testConfiguration.request.body, testConfiguration.headers, undefined).then(function(success) {
                success.url = testConfiguration.url;
                success.method = testConfiguration.request.method;
                success.idTest = testConfiguration.testId;
                console.log(success);
                writeLog(success);
                resolve(success);

            });
        } else if (type == "randomTemplate") {

            _doRequestsRandom(testConfiguration.url, testConfiguration.request.method, testConfiguration.count,
                testConfiguration.duration, testConfiguration.request.body, testConfiguration.request.headers, testConfiguration.request.randomFields).then(function(success) {
                success.url = testConfiguration.url;
                success.method = testConfiguration.request.method;
                success.idTest = testConfiguration.testId;
                console.log(success);
                writeLog(success);
                resolve(success);

            });




        } else {

            execRequests(testConfiguration).then(function(success) {
                success.url = testConfiguration.url;
                success.method = testConfiguration.method;
                success.idTest = testConfiguration.testId;
                console.log(success);
                writeLog(success);
                resolve(success);


            });


        }

    });

}




var execRequests = function(testConfiguration) {
    return new Promise(function(resolve) {

        let total = 0;
        let successful = 0;
        let error = 0;
        let counter_timer = 0;
        let request_ack = 0;
        let start_date = moment();
        let interval = setInterval(function() {

            if (counter_timer == testConfiguration.duration - 1) {
                clearInterval(interval);
            }

            _promisesRequests(testConfiguration.url, testConfiguration.method, testConfiguration.count, testConfiguration.body).then(function(success) {
                success.forEach(function(element) {
                    if (element) {
                        successful++;
                    } else {
                        error++;
                    }

                    total++;

                });

                request_ack++;
                if (request_ack == testConfiguration.duration) {
                    let finish_date = moment();
                    let resobject = {};
                    resobject.totalRequest = total;
                    resobject.success = successful;
                    resobject.error = error;
                    resobject.totalStack = request_ack;
                    resobject.startTime = start_date.toISOString();
                    resobject.finishTime = finish_date.toISOString();
                    resobject.lastedFor = finish_date - start_date + " ms";
                    resolve(resobject);
                }

            });
            counter_timer++;


        }, 1000); // setInterval

    });

};




var execRequestsInterval = function(uri, method, array, duration, tenantId, testId, body, headers) {
    return new Promise(function(resolve) {
        let total = 0;
        let successful = 0;
        let error = 0;
        let counter_timer = 0;
        let currentindex = 0;
        let request_ack = 0;
        let start_date = moment();
        let interval = setInterval(function() {
            if (counter_timer == duration) {
                //restart counter-time
                counter_timer = 0;
                //logger.info("Next resquests for element in position " + currentindex);
                currentindex++;

                if (currentindex == array.length) {
                    clearInterval(interval);
                }
            }
            _promisesRequests(uri, method, array[currentindex], body, headers).then(function(success) {

                success.forEach(function(element) {
                    if (element) {
                        successful++;
                    } else {
                        error++;
                    }
                    total++;

                });


                if (request_ack == array.length * duration) {
                    let finish_date = moment();
                    let resobject = {};
                    resobject.totalRequest = total;
                    resobject.success = successful;
                    resobject.error = error;
                    resobject.totalStack = request_ack;
                    resobject.startTime = start_date.toISOString();
                    resobject.finishTime = finish_date.toISOString();
                    resobject.lastedFor = finish_date - start_date + " ms";

                    resolve(resobject);
                }

                request_ack++;


            });

            counter_timer++;
        }, 1000);


    });



};

function writeLog(object) {
    fs.appendFile(config.logrequest, JSON.stringify(object) + "\r\n", function(err) {
        if (err) {
            return console.log(err);
        }
    });
}

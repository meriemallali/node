// The main.js file of mysmartHome app
module.exports = function (app) {
    app.get("/", function (req, res) {
        res.render("home.ejs")
    });
    app.get("/about", function (req, res) {
        res.render("about.ejs");
    });

    app.get("/add-device", function (req, res) {
        res.render("adddevice.ejs");
    });
    app.get("/delete-device", function (req, res) {
        //sql query returns type, name of all the cretaed devices. 
        let sqlQuery = "SELECT * FROM devices;"
        db.query(sqlQuery, function (err, result) {
            if (err) {
                console.error(err);
                res.redirect("/error");
            }
            else {
                //to render the deleteDevice.ejs file and pass the result as a parameter to the latter. 
                res.render("deleteDevice.ejs", { devices: result });
            }
        })

    });
    //get the success message when added a device.
    app.get("/success-add", function (req, res) {
        res.render("success-add.ejs");

    });
    //get the success message when updated a device.
    app.get("/success-control", function (req, res) {
        res.render("success-control.ejs");

    });
    //get the success message when a device is deleted.
    app.get("/success-delete", function (req, res) {
        res.render("success-delete.ejs");

    });
    //get the error message when an error occurs.
    app.get("/error", function (req, res) {
        res.render("error.ejs");
    });
    //get error message for long name of device.
    app.get("/error-name-ofDevice", function (req, res) {
        res.render("error-name.ejs");
    });


    //add device page
    //to add name to devices table and parameters fileds into type_parameters according to their type.
    app.post("/add-device", function (req, res) {
        //saving data in database : smarthome
        //insert a record in the database name,type,other controls  
        //are passed from middleware to the database tier smarthome table devices and "type"_parameters tables
        //since it's a post req they are acccess by req.body.type/req.body.name
        //name,type and other parameters are formed and collected from adddevice.ejs

        console.log('req.body :', req.body);
        let deviceQuery = "insert into devices(type,name) values (?,?)";
        let deviceQueryParams = [req.body.type, req.body.name];
        let parameters;
        let sqlParametersQuery = "";

        //switch statement depends on the type of each device
        //when a device type is selected relevant query is used.
        //the other parameters are collected from adddevice.ejs 
        switch (req.body.type) {
            case "tv":
                sqlParametersQuery = `INSERT INTO tv_parameters(device_id, isOn, channel, volume) 
                        VALUES (?, ?, ?, ?)`;

                parameters = [
                    req.body.isOn == "on" || false,
                    req.body.channel,
                    req.body.volume || 0
                ];
                break;
            case "fridge":
                sqlParametersQuery = `INSERT INTO fridge_parameters(device_id, isOn, temp) 
                VALUES (?, ?, ?)`;

                parameters = [
                    req.body.isOn == "on" || false,
                    req.body.temp || 0
                ]

                break;
            case "oven":
                sqlParametersQuery = `INSERT INTO oven_parameters(device_id, isOn, temp) 
                VALUES (?, ?, ?)`;

                parameters = [
                    req.body.isOn == "on" || false,
                    req.body.temp || 0
                ]

                break;

            case "radio":
                sqlParametersQuery = `INSERT INTO radio_parameters(device_id, isOn, frequency, volume) 
                VALUES (?, ?, ?, ?)`;

                parameters = [
                    req.body.isOn == "on" || false,
                    req.body.frequency || 0,
                    req.body.volume || 0
                ]
                break;
            case "door":
                sqlParametersQuery = `INSERT INTO door_parameters(device_id, isOpen, keycode) 
                VALUES (?, ?, ?)`;

                parameters = [
                    req.body.isOpen == "on" || false,
                    req.body.keycode
                ]
                break;
            default:
                break;

        }
        // execute first sql query that adds first name,type to devices table  
        db.query(deviceQuery, deviceQueryParams, (err, deviceResult) => {
            if (err) {
                console.error(err.message);
                res.status(500);
                res.redirect("/error-name-ofDevice");//redirect to error name page if the name is too long max: 100 charachters. 
            }
            else {
                console.log("added device id:", deviceResult.insertId);
                parameters.unshift(deviceResult.insertId); // add the device id as the first parameter
                // execute second query that adds parameters to relevant table, "type"_parameters 
                db.query(sqlParametersQuery, parameters, (err, result, fields) => {
                    if (err) {
                        console.error(err);//for debugging purposes
                        res.status(500);
                        res.redirect("error");//redirect to error page is any error occured while processing the request
                    }
                    else {
                        console.log("result of adding to the appropriate parameters table:", result, fields);
                        res.redirect("/success-add"); //redirect to success-add page to inform the user that the device is added 
                        console.log("add query = ", sqlParametersQuery);

                    }
                })
            }
        })
    });


    //device status page
    //to query devices table, "type"_parameters table 
    //return all the created devices with their relevant parameters when selected by device name
    app.get("/device-status", function (req, res) {
        //sql query returns all type,name of created devices
        let devicesQuery = "select * from devices";
        console.log('req.query :', req.query); //for debbuging purposes
        //get the device id from the query
        let deviceId = parseInt(req.query.id);
        //execute sql query
        db.query(devicesQuery, (err, devicesList) => {
            if (err) {
                console.error(err);
                res.redirect("/error"); //redirect to error page is any error occured while processing the request.
            } else {
                if (deviceId) {
                    //sql query returns name, type of device depending on the deviceId 
                    let deviceQuery = "SELECT * FROM devices WHERE id = ? LIMIT 1";
                    db.query(deviceQuery, [deviceId], function (err, devicesResult) {
                        if (err) {
                            console.error(err);
                            res.redirect("/error");
                        }
                        else {
                            //all parameter tables are named type_parameters e.g: tv_parameters, oven_parameters..
                            //forward first index from deviceQuery to get the parameters table name + "_parameters"
                            let parametersTableName = devicesResult[0].type + "_parameters";
                            //sql join query returns all records when there is a match in either left or right table
                            //retrieve data from devices, type+_parameters tables join sql statement 
                            let deviceStatusQuery = `SELECT * FROM devices JOIN ${parametersTableName} ON devices.id = ${parametersTableName}.device_id AND devices.id = ? LIMIT 1;`
                            db.query(deviceStatusQuery, [deviceId], function (err, statusResult) {
                                if (err) {
                                    console.error(err);
                                    res.redirect("/error");//redirect to error page when an error occured.
                                }
                                else {
                                    console.log('status :', statusResult[0]);
                                    //render the deviceStatus.ejs file and pass the results as a paramerter to the latter.
                                    res.render("deviceStatus.ejs", { devices: devicesList, deviceStatus: statusResult[0] });
                                }
                            });
                        }
                    })
                }
                else {
                    res.render("deviceStatus.ejs", { devices: devicesList, deviceStatus: null });
                }
            }
        });
    });


    //query devices table, type_parameters table. 
    app.get("/control-device", function (req, res) {
        //updating data that are collected from adddevice.ejs in database : mysmarthome
        //name,type and other parameters are formed and collected from adddevice.ejs
        //insert a record in the database name,type,other controls  
        //are passed from middleware to the database tier smarthome table devices and "type"_parameters tables
        //since it's a post req they are acccess by req.body.type/req.body.name
        let devicesQuery = "select * from devices"; //returns type,name from the devices table.
        console.log('req.query :', req.query);
        //get the device id from the query
        let deviceId = parseInt(req.query.id);
        // execute sql query
        db.query(devicesQuery, (err, devicesList) => {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } else {
                if (deviceId) {
                    let deviceQuery = "SELECT * FROM devices WHERE id = ? LIMIT 1";
                    db.query(deviceQuery, [deviceId], function (err, devicesResult) {
                        if (err) {
                            console.error(err);
                            res.redirect("/error");//redirect to error page if an error occured.
                        }
                        else {
                            //all parameter tables are named type_parameters e.g: tv_parameters, oven_parameters..
                            //forward first index from deviceQuery to get the parameters table name + "_parameters"
                            let parametersTableName = devicesResult[0].type + "_parameters";
                            //sql join query returns all records when there is a match in either left or right table
                            //retrieve data from devices, type+_parameters tables join sql statement 
                            let deviceStatusQuery = `SELECT * FROM devices JOIN ${parametersTableName} ON devices.id = ${parametersTableName}.device_id AND devices.id = ? LIMIT 1;`
                            db.query(deviceStatusQuery, [deviceId], function (err, statusResult) {
                                if (err) {
                                    console.error(err);
                                    res.redirect("/error");
                                }
                                else {
                                    console.log('status :', statusResult[0]);
                                    //render the controlDevice.ejs file and pass the results as a paramerter to the latter.
                                    res.render("controlDevice.ejs", { devices: devicesList, deviceStatus: statusResult[0] });
                                }
                            });
                        }
                    })
                }
                else {
                    res.render("controlDevice.ejs", { devices: devicesList, deviceStatus: null });

                }
            }

        });
    });

    //control device page
    //to update devices parameters depending on the type of device
    app.post("/control-device", function (req, res) {
        console.log('req.body :', req.body);
        let deviceId = req.body.deviceId;
        // get the device type : 
        let deviceQuery = "SELECT type FROM devices WHERE id = ?";
        db.query(deviceQuery, [deviceId], function (err, result) {
            if (err) {
                console.error(err);
                res.redirect("/error");
            }
            else {
                let type = result[0].type;
                console.log('type :', type);
                let parametersUpdateQuery;
                let parameters = [];
                //switch statement depends on the type of each device.
                //when a device type is selected relevant query is used.
                //the other parameters are collected from control-device.ejs 
                switch (type) {
                    case "tv":
                        parametersUpdateQuery = `UPDATE tv_parameters SET isOn = ?, channel = ?, volume = ? WHERE device_id = ?`;
                        parameters = [
                            req.body.isOn == "on" || false,
                            req.body.channel,
                            req.body.volume || 0
                        ];
                        break;
                    case "fridge":
                        parametersUpdateQuery = `UPDATE fridge_parameters SET isOn = ?, temp = ? WHERE device_id = ?`;

                        parameters = [
                            req.body.isOn == "on" || false,
                            req.body.temp || 0
                        ]

                        break;
                    case "oven":
                        parametersUpdateQuery = `UPDATE oven_parameters SET isOn = ?, temp = ? WHERE device_id = ?`;

                        parameters = [
                            req.body.isOn == "on" || false,
                            req.body.temp || 0
                        ]

                        break;

                    case "radio":
                        parametersUpdateQuery = `UPDATE radio_parameters SET isOn = ?, frequency = ?, volume = ? WHERE device_id = ?`;

                        parameters = [
                            req.body.isOn == "on" || false,
                            req.body.frequency,
                            req.body.volume || 0
                        ]
                        break;
                    case "door":
                        parametersUpdateQuery = `UPDATE door_parameters SET isOpen = ?, keycode = ? WHERE device_id = ?`;

                        parameters = [
                            req.body.isOpen == "on" || false,
                            req.body.keycode
                        ]
                        break;
                    default:
                        break;

                }
                parameters.push(deviceId);
                console.log('sqlParametersQuery :', parametersUpdateQuery);
                console.log('parameters :', parameters);
                //execute sql query 
                db.query(parametersUpdateQuery, parameters, function (err, updateResult) {
                    if (err) {
                        console.error(err);
                        res.redirect("/error");
                    }
                    else {
                        res.redirect("/success-control");
                    }
                })
            }
        })

    });


    //delete device page.
    //delete from both tables devices and "type"_parameters 
    app.post("/delete-device", function (req, res) {
        console.log('req.body :', req.body);

        //query returns the type from devices table for relevant id. 
        let deviceQuery = "SELECT type FROM devices WHERE id = ?";
        let deviceId = req.body.id;
        //executing the query to get the type of device selected.
        db.query(deviceQuery, [deviceId], function (err, result) {
            if (err) {
                console.error(err);
                res.redirect("/error");//redirect to error page if an error occured.
            }
            else {
                //all parameters tables are named type + "_parameters" e.g. door_parameters..
                //get type the type from result of the first query.
                let type = result[0].type;
                //to get the table name to be deleted from 
                let tableToDeleteFrom = type + "_parameters";
                //sql join query returns all records when there is a match in either left or right table
                //to delete data from both devices, type+ "_parameters" tables 
                let parametersDeleteQuery = `DELETE devices,${tableToDeleteFrom} from ${tableToDeleteFrom} join devices on
                 devices.id = ${tableToDeleteFrom}.device_id where devices.id = ${deviceId}`;
                console.log('delete query = ', parametersDeleteQuery)
                db.query(parametersDeleteQuery, [deviceId, deviceId], function (err, result) {
                    if (err) {
                        console.error(err);
                        res.redirect("/error");//redirect to error page if an error occured.
                    }
                    else {
                        console.log('device deleted, query = ', parametersDeleteQuery);
                        res.redirect("/success-delete");//redirect to succes delete page if the device is deleted. 
                    }
                })
            }
        })


    });

}
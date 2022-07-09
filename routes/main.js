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
        res.render("deletedevice.ejs");

    });

    app.get("/success-add", function (req, res) {
        res.render("success-add.ejs");

    });

    app.get("/success-control", function (req, res) {
        res.render("success-control.ejs");

    });
    app.get("/error", function (req, res) {
        res.render("error.ejs");
    });


    //to render the list.ejs file and pass the result as a parameter to the latter
    app.post("/add-device", function (req, res) {
        // saving data in database
        //name,type and other parameters are formed and collected from adddevice.ejs
        //insert a record in the database name,type,other controls  
        //are passed from middleware to the database tier smarthome table test
        //since it's a post req they are acccess by req.body.type/req.body.name
        // let sqlquery = "INSERT INTO test (type,name,on_off,open_close,temp,volume) VALUES (?,?,?,?,?,?)"; 
        console.log('req.body :', req.body);
        let deviceQuery = "insert into devices(type,name) values (?,?)";
        let deviceQueryParams = [req.body.type, req.body.name];
        let parameters;
        let sqlParametersQuery = "";
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
                    req.body.isOn =="on" || false,
                    req.body.temp || 0
                ]

                break;

            case "radio":
                sqlParametersQuery = `INSERT INTO radio_parameters(device_id, isOn, frequency, volume) 
                VALUES (?, ?, ?, ?)`;

                parameters = [
                    req.body.isOn == "on" || false,
                    req.body.frequency,
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

        db.query(deviceQuery, deviceQueryParams, (err, deviceResult) => {
            if (err) {
                console.error(err.message);
                res.status(500);
                res.send("an error occured while adding device parameters");
            }
            else {
                console.log("added device id:", deviceResult.insertId);
                parameters.unshift(deviceResult.insertId); // add the device id as the first parameter
                // execute second query
                db.query(sqlParametersQuery, parameters, (err, result, fields) => {
                    if (err) {
                        console.error(err);
                        res.status(500);
                        res.redirect("error");
                    }
                    else {
                        console.log("result of adding to the appropriate parameters table:", result, fields);
                        res.redirect("/success-add");

                    }
                })
            }
        })
    });


    //to query table test and return all the created devices with their parameters
    app.get("/device-status", function (req, res) {
        let devicesQuery = "select * from devices";
        console.log('req.query :', req.query);
        let deviceId = parseInt(req.query.id); // TODO: gotta check for validity here
        
        
        // execute sql query
        db.query(devicesQuery, (err, devicesList) => {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } else {
                if (deviceId) {
                    let deviceQuery = "SELECT * FROM devices WHERE id = ? LIMIT 1";
                    db.query(deviceQuery, [deviceId], function(err, devicesResult){
                        if (err) {
                            console.error(err);
                            res.redirect("/error");
                        } 
                        else {
                            let parametersTableName = devicesResult[0].type + "_parameters";
                            let deviceStatusQuery = `SELECT * FROM devices JOIN ${parametersTableName} ON devices.id = ${parametersTableName}.device_id AND devices.id = ? LIMIT 1;`
                            db.query(deviceStatusQuery, [deviceId], function(err, statusResult){
                                if (err) {
                                    console.error(err);
                                    res.redirect("/error");
                                } 
                                else {
                                    // TODO: check for empty array
                                    console.log('status :', statusResult[0]);
                                    res.render("deviceStatus.ejs", { devices: devicesList, deviceStatus :  statusResult[0]});
                                }
                            });
                        }
                    })
                }
                else {
                    res.render("deviceStatus.ejs", { devices: devicesList, deviceStatus :  null});

                }
            }

        });
    });
    

    app.get("/control-device", function (req, res) {
        let devicesQuery = "select * from devices";
        console.log('req.query :', req.query);
        let deviceId = parseInt(req.query.id); // TODO: gotta check for validity here
        
        // execute sql query
        db.query(devicesQuery, (err, devicesList) => {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } else {
                if (deviceId) {
                    let deviceQuery = "SELECT * FROM devices WHERE id = ? LIMIT 1";
                    db.query(deviceQuery, [deviceId], function(err, devicesResult){
                        if (err) {
                            console.error(err);
                            res.redirect("/error");
                        } 
                        else {
                            let parametersTableName = devicesResult[0].type + "_parameters";
                            let deviceStatusQuery = `SELECT * FROM devices JOIN ${parametersTableName} ON devices.id = ${parametersTableName}.device_id AND devices.id = ? LIMIT 1;`
                            db.query(deviceStatusQuery, [deviceId], function(err, statusResult){
                                if (err) {
                                    console.error(err);
                                    res.redirect("/error");
                                } 
                                else {
                                    // TODO: check for empty array
                                    console.log('status :', statusResult[0]);
                                    res.render("controlDevice.ejs", { devices: devicesList, deviceStatus :  statusResult[0]});
                                }
                            });
                        }
                    })
                }
                else {
                    res.render("controlDevice.ejs", { devices: devicesList, deviceStatus :  null});

                }
            }

        });
    });

    //control device page
    app.post("/control-device", function (req, res) {
        console.log('req.body :', req.body);
        let deviceId = req.body.deviceId;
        // get the device type : 
        let deviceQuery = "SELECT type FROM devices WHERE id = ?";
        db.query(deviceQuery, [deviceId], function(err, result) {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } 
            else{
                let type = result[0].type;
                console.log('type :', type);
                let parametersUpdateQuery;
                let parameters = [];
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
                            req.body.isOn =="on" || false,
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
                db.query(parametersUpdateQuery, parameters, function(err, updateResult){
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


    app.post("/devicedeleted", function (req, res) {
        // updating data in database

        let id = "select id from devices where devices.name = ?";
        let keyword = [req.body.name];
        let sqlquery = "delete devices,parameters from parameters inner join devices on devices.id = parameters.parameter_id where devices.id = id";

        
        db.query(id, keyword, sqlquery, (err, result) => {
            if (err) {
                console.error("cannot delete the newrecord to db"); //for debugging purposes 
                return console.error(err.message);
            }
            res.send(" Your device has been deleted successfully");
        });
    });

}
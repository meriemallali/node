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

    app.get("/control-device", function (req, res) {
        res.render("controldevice.ejs");

    });
    app.get("/delete-device", function (req, res) {
        res.render("deletedevice.ejs");

    });

    app.get("/success", function (req, res) {
        res.render("success.ejs");

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
                        res.redirect("success");

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
    

    //control device page
    app.post("/devicecontroled", function (req, res) {
        // updating data in in database
        let sqlquery = "select name from test";
        " update test set on_off = ? , volume = ?, open_close = ?, temp = ?, volume = ? where name = ?";
        // execute sql query
        let newrecord = [req.body.on_off, req.body.open_close, req.body.temp, req.body.volume, req.body.name];
        if (newrecord[0] == "") newrecord[0] = undefined;
        if (newrecord[1] == "") newrecord[1] = undefined;
        if (newrecord[2] == "") newrecord[2] = undefined;
        if (newrecord[3] == "") newrecord[3] = undefined;
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                console.log("cannot send the newrecord to db");
                return console.error(err.message);
            }
            // res.send(" Your device has been updated");
            // res.render("controldevice.ejs",{result});

        });
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
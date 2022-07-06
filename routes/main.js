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


    //to render the list.ejs file and pass the result as a parameter to the latter
    app.post("/add-device", function (req, res) {
        // saving data in database
        //name,type and other parameters are formed and collected from adddevice.ejs
        //insert a record in the database name,type,other controls  
        //are passed from middleware to the database tier smarthome table test
        //since it's a post req they are acccess by req.body.type/req.body.name
        // let sqlquery = "INSERT INTO test (type,name,on_off,open_close,temp,volume) VALUES (?,?,?,?,?,?)"; 
        let deviceQuery = "insert into devices(type,name) values (?,?)";

        let deviceQueryParams = [req.body.type, req.body.name];

        let parameters;

        let sqlParametersQuery = "";
        switch (req.body.type) {
            case "tv":
                sqlParametersQuery = `INSERT INTO tv_parameters(device_id, isOn, channel, volume) 
                        VALUES ((select id from devices where devices.name = ?), ?, ?, ?)`;

                // parameters = [req.body.name, req.body.isOn ?? false, req.body.channel,req.body.volume ?? 0];
                break;
            case "fridge":
                sqlParametersQuery = `INSERT INTO fridge_parameters(device_id, isOn, temp) 
                VALUES ((select id from devices where devices.name = ?), ?, ?, ?)`;

                // parameters = [req.body.name, req.body.isOn ?? false, req.body.temp ?? 0]

                break;
            case "oven":
                sqlParametersQuery = `INSERT INTO oven_parameters(device_id, isOn, temp) 
                VALUES ((select id from devices where devices.name = ?), ?, ?, ?)`;

                // parameters = [req.body.name, req.body.isOn ?? false, req.body.temp ?? 0]

                break;

            case "radio":
                sqlParametersQuery = `INSERT INTO radio_parameters(device_id, isOn, frequency, volume) 
                VALUES ((select id from devices where devices.name = ?), ?, ?, ?)`;

                // parameters = [req.body.name, req.body.isOn ?? false, req.body.frequency, req.body.volume ?? 0]
                break;
            case "door":
                sqlParametersQuery = `INSERT INTO door_parameters(device_id, isOpen, keycode) 
                VALUES ((select id from devices where devices.name = ?), ?, ?, ?)`;

                // parameters = [req.body.name, req.body.isOpen ?? false, req.body.keycode]

                break;

            default:
                break;

        }


        db.query(deviceQuery, deviceQueryParams, (err, result) => {
            if (err) {
                console.error(err.message);
                res.status(500);
                res.send("an error occured while adding device parameters");
            }
            else {
                debugger;

                console.log("result :", result);
                return;
                db.query(sqlParametersQuery, parameters, (err, result) => {
                    if (err) {
                        console.error(err.message);
                        res.status(500);
                        res.send("an error occured while adding device parameters")
                    }
                    else {
                        res.send("your device" + result.name + "has been added");

                    }
                })

            }
        })


        /* 
        let sqlquery2 = "insert into parameters (parameter_id,isOn,isOpen,temp,frequency,volume,timer,mode) values((select id from devices where devices.name = ?),?,?,?,?,?,?,?)";
        let secondrecord = [req.body.name,req.body.isOn,req.body.isOpen,req.body.temp,req.body.frequency,
                         req.body.volume,req.body.timer,req.body.mode];

        if(secondrecord[3] == "") secondrecord[3] = undefined;
        if(secondrecord[4] == "") secondrecord[4] = undefined;
        if(secondrecord[5] == "") secondrecord[5] = undefined;
        if(secondrecord[6] == "") secondrecord[6] = undefined;
        if(secondrecord[7] == "") secondrecord[7] = undefined;

        // execute fisrt sql query to insert name,type of the device in devices table

        // execute second sql query to insert other parameters using foreign key "parameter_id" in parameters table
        db.query(sqlquery2,secondrecord,(err,result) =>{
        if(err){
            console.error(err.message);
        }
        else{
            res.send(" Your device "  + req.body.name + " is added to the database");

        }
        })
        // need to show here a message that the device is added not using send 
        res.redirect("/add-device"); */

    });


    //to query table test and return all the created devices with their parameters
    app.get("/device-status", function (req, res) {
        let sqlquery2 = "select * from devices inner join parameters on devices.id = parameters.parameter_id;"; //query returns 

        // execute sql query
        db.query(sqlquery2, (err, result) => {
            if (err) {
                console.error(err.message);
                // res.redirect("/"); //redirect to home page
            } else {
                //to render the deviceStatus.ejs file and pass 
                //the result as a parameter to the latter
                res.render("deviceStatus.ejs", { devices: result });
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
    debugger;


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
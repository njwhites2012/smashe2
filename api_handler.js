var API = {

    init: function(a,s,d){

        this.app = a;
        this.server = s;
        this.database = d;

        this.path = require('path');
        this.bodyParser = require('body-parser');
        this.https = require('https');
        this.crypto = require('crypto');

        // best way to get the "body" from POST requests
        // postman testing
        this.app.use(this.bodyParser.urlencoded({ extended: false, type:"urlencoded" }));
        //app connection
        //this.app.use(this.bodyParser.json());

        // used for general file routing
        this.rootDir = this.path.dirname(require.main.filename);

        if (this.app && this.server && this.database)
            console.log("API Initialized");
        else
            console.log("Failure: API Initialization");
    },
    start: function() {
        // login
        API.app.all('/login(/)?', function(req,res) {
            if (req.method == "POST") {
                API.login(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // user signup
        API.app.all('/signup/user(/)?', function(req,res){
            if (req.method == "POST") {
                API.signup_user(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // create tourney
        API.app.all('/tourney/create(/)?', function(req,res){
            if (req.method == "POST") {
                API.create_tourney(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // create character
        API.app.all('/character/create(/)?', function(req,res) {
            if (req.method == "POST") {
                API.create_character(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // add character to tourney
        API.app.all('/tourney/add(/)?', function(req,res) {
            if (req.method == "POST") {
                API.add_tourney_character(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // get character
        API.app.all('/character(/)?', function(req,res) {
            if (req.method == "GET") {
                API.character(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // get all characters
        API.app.all('/characters(/)?', function(req,res) {
            if (req.method == "GET") {
                API.characters(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // coupon create
        API.app.all('/coupons/create(/)?', function(req,res){
            if (req.method == "POST") {
                API.coupon_create(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // coupon delete
        API.app.all('/coupons/delete(/)?', function(req,res){
            if (req.method == "POST") {
                API.coupon_delete(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // get rides
        API.app.all('/rides(/)?', function(req,res) {
            if (req.method == "GET") {
                API.rides(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // get user rides
        API.app.all('/user/rides(/)?', function(req,res) {
            if (req.method == "GET") {
                API.user_rides(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // get user membership status
        API.app.all('/user/status(/)?', function(req,res) {
            if (req.method == "GET") {
                API.user_status(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // get driver rides
        API.app.all('/driver/rides(/)?', function(req,res) {
            if (req.method == "GET") {
                API.driver_rides(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // booking a ride
        API.app.all('/rides/book(/)?', function(req,res) {
            if (req.method == "POST") {
                API.book_ride(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // claiming a ride
        API.app.all('/rides/claim(/)?', function(req,res) {
            if (req.method == "POST") {
                API.claim_ride(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // edit a ride
        API.app.all('/rides/edit(/)?', function(req,res) {
            if (req.method == "POST") {
                API.edit_ride(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // delete a ride
        API.app.all('/rides/delete(/)?', function(req,res) {
            if (req.method == "POST") {
                API.delete_ride(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // complete a ride
        API.app.all('/rides/complete(/)?', function(req,res) {
            if (req.method == "POST") {
                API.complete_ride(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });
        // get salt
        API.app.all('/salt(/)?', function(req,res) {
            if (req.method == "POST") {
                API.salt(req,res);
            }
            else {
                API.methodNotAllowed(req,res);
            }
        });

        // this handles generic file routing, and 404's the rest.
        API.app.get('/*(/)?',function(req,res){
            // disallow some things to be seen (.js files, most importantly)
            // SECURITY ISSUE!
            if (req.path.indexOf('node_modules') < 0) {
                var path;
                if (API.path.extname(req.path)) {
                    path = API.path.join(API.rootDir, req.path);
                }
                else {
                    path = API.path.join(API.rootDir, req.path, 'index.html');
                }
                res.sendFile(path, null, function(err){
                    if (err) {
                        API.notFound(req,res);
                    }
                });
            }
            else {
                API.notFound(req,res);
            }
        });
        // this needs to be the last app.all called (for 404 errors and bad requests)
        API.app.all('*', function(req, res){API.notFound(req,res);});


        console.log('API Started');
    },

    //API calls
    signup_user: function(req,res) {
        var response = { status: {code:"0",description:":)"} };
        //required items
        var first = req.body.first_name;
        var last = req.body.last_name;
        var nickname = req.body.nickname;
        var email = req.body.email;
        var password = req.body.password;
        if (password != null && email != null && first != null && last != null && nickname != null) {
            var salt = API.crypto.randomBytes(Math.ceil(16/2))
                .toString('hex')
                .slice(0,16);
            var hash = API.crypto.createHmac('sha512', salt);
            hash.update(password);
            var hashed_password = hash.digest('hex');
            API.database.add_user(first, last, nickname, hashed_password, salt, email,
            function(user) {
                if (user) {
                    response.user = {};
                    response.user.user_id = user._id;
                    API.login(req, res);
                }
                else {
                    response.status.code = "-22";
                    response.status.description = "Error Inserting Into the Database.";
                    API.sendResponse(req,res,response);
                }
            });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    login: function(req,res) {
        var response = { status: {code:"0",description:":)"} };
        if (req.body.email != null && req.body.password != null) {
            var password = req.body.password;
            var user = API.database.get_salt(req.body.email, function(user){
                if (user) {
                    //response.salt = user;
                    var salt = JSON.stringify(user);
                    salt = salt.replace("{","");
                    salt = salt.replace("}","");
                    salt = salt.replace(/"/g,'');
                    salt = salt.replace("salt:","");
                    var hash = API.crypto.createHmac('sha512', salt);
                    hash.update(password);
                    var hashed_password = hash.digest('hex');
                    API.database.check_user_credentials(req.body.email, hashed_password, function(user){
                      if (user) {
                          //success!
                          response.success = true;
                          response.user = user;
                          API.sendResponse(req,res,response);
                      }
                      else {
                          response.status.code = "-31";
                          response.status.description = "Invalid Credentials";
                          response.success = false;
                          API.sendResponse(req,res, response);
                      }
                    });
                }
                else {
                    API.badDataReceived(req,res);
                }
            });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    create_tourney: function(req,res) {
        var response = { status: {code:"0",description:":)"} };
        //required items
        var character_count = req.body.character_count;
        var name = req.body.name;
        if (character_count != null && name != null) {
            API.database.add_tourney(name, character_count,
            function(tourney) {
                if (tourney) {
                    response.tourney_id = tourney._id;
                    API.sendResponse(req, res, response);
                }
                else {
                    response.status.code = "-22";
                    response.status.description = "Error Inserting Into the Database.";
                    API.sendResponse(req,res,response);
                }
            });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    create_character: function(req,res) {
        var response = { status: {code:"0",description:":)"} };
        //required items
        var name = req.body.name;
        var image = req.body.image;
        if (name != null) {
            API.database.add_character(name, image,
            function(character) {
                if (character) {
                    response.character = character;
                    API.sendResponse(req, res, response);
                }
                else {
                    response.status.code = "-22";
                    response.status.description = "Error Inserting Into the Database.";
                    API.sendResponse(req,res,response);
                }
            });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    add_tourney_character: function(req,res) {
        var response = { status: {code:"0",description:":)"} };
        //required items
        var number = req.body.number;
        var character_name = req.body.character_name;
        var tourney_id = req.body.tourney_id;

        //optional fields
        var user_id = req.body.user_id;

        if (character_name != null && tourney_id != null && number != null) {
            API.database.add_tourney_character(number, tourney_id, character_name, user_id,
            function(tourney) {
                if (tourney) {
                    response.tourney = tourney;
                    API.sendResponse(req, res, response);
                }
                else {
                    response.status.code = "-22";
                    response.status.description = "Error Inserting Into the Database.";
                    API.sendResponse(req,res,response);
                }
            });
        }
        else {
            API.badDataReceived(req,res);
        }
    },

    //get character
    character: function(req,res) {
        var response = { status: {code:"0",description:":)"} };

        var name = req.query.name;

        if (name != null) {
          var character = API.database.get_character(name, function(character){
              if (character) {
                  response.character = character;
                  API.sendResponse(req,res,response);
              }
              else {
                  API.badDataReceived(req,res);
              }
          });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    //get character
    characters: function(req,res) {
        var response = { status: {code:"0",description:":)"} };

        var characters = API.database.get_characters(function(characters){
            if (characters) {
                response.characters = characters;
                API.sendResponse(req,res,response);
            }
            else {
                API.badDataReceived(req,res);
            }
        });
    },
    //gets active rides of a user
    user_rides: function(req,res) {
        var response = { status: {code:"0",description:":)"} };

        var user_id = req.query.user_id;

        if (user_id != null) {
          var rides = API.database.get_user_rides(user_id, function(rides){
              if (rides) {
                  response.rides = rides;
                  API.sendResponse(req,res,response);
              }
              else {
                  response.status = {code:"0",description:"empty"}
                  response.rides = [];
                  API.sendResponse(req,res,response);
              }
          });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    //gets active rides of a user
    user_status: function(req,res) {
        var response = { status: {code:"0",description:":)"} };

        var user_id = req.query.user_id;

        if (user_id != null) {
          var membership = API.database.get_premium_status(user_id, function(membership){
            if (membership) {
                response.membership = membership;
                API.sendResponse(req,res,response);
            }
            else {
                response.status = {code:"0",description:"empty"}
                response.rides = [];
                API.sendResponse(req,res,response);
            }
          });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    //gets active rides of driver
    driver_rides: function(req,res) {
        var response = { status: {code:"0",description:":)"} };

        var driver_id = req.query.driver_id;

        if (driver_id != null) {
          var rides = API.database.get_driver_rides(driver_id, function(rides){
              if (rides) {
                  response.rides = rides;
                  API.sendResponse(req,res,response);
              }
              else {
                  response.status = {code:"0",description:"empty"}
                  response.rides = [];
                  API.sendResponse(req,res,response);
              }
          });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    reset_password: function(req, res) {
        var response = { status: {code:"0",description:":)"} };

        var email = req.body.email;
        var user_type = req.body.user_type;

        if (email != null && user_type != null) {
            var salt = API.crypto.randomBytes(Math.ceil(16/2))
              .toString('hex')
              .slice(0,7);
            API.database.add_reset(email, user_type, salt,
              function(result) {
                if (result) {
                    var mailOptions = {
                      from: '"PiggyBack" <admin@piggyback.com>', // sender address
                      to: email, // list of receivers
                      subject: 'PiggyBack Password Reset', // Subject line
                      text: 'Password Reset Approved!/n/nReset Token: ' + salt + '/n/nEnter this to reset your password./n/nContact us with questions at 479-601-7242 or admin@piggyback.com', // plaintext body
                      html: 'Password Reset Approved!<br><br>Reset Token: ' + salt + '<br><br>Enter this to reset your password.<br><br>Contact us with questions at 479-601-7242 or admin@piggyback.com' // html body
                    };
                    API.emailer.sendMail(mailOptions, function(error, info){
                        if(error){
                            return console.log(error);
                        }
                        console.log('Message sent: ' + info.response);
                    });
                    response.result = result;
                    API.sendResponse(req,res,response);
                }
                else {
                    response.status.code = "-22";
                    response.status.description = "Error Updating the Database.";
                    API.sendResponse(req,res,response);
                }
              });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    update_password: function(req, res) {
        var response = { status: {code:"0",description:":)"} };

        var email = req.body.email;
        var user_type = req.body.user_type;
        var reset_token = req.body.reset_token;
        var password = req.body.password;

        if (email != null && user_type != null && reset_token != null && password != null) {
            API.database.get_token(email, user_type, function(user){
                if (user) {
                    //response.salt = user;
                    var token = JSON.stringify(user);
                    token = token.replace("{","");
                    token = token.replace("}","");
                    token = token.replace(/"/g,'');
                    token = token.replace("reset:","");
                    if (token == reset_token && token != null){
                        var user = API.database.get_salt(req.body.email, req.body.user_type, function(user){
                            if (user) {
                                var salt = JSON.stringify(user);
                                salt = salt.replace("{","");
                                salt = salt.replace("}","");
                                salt = salt.replace(/"/g,'');
                                salt = salt.replace("salt:","");
                                var hash = API.crypto.createHmac('sha512', salt);
                                hash.update(password);
                                var hashed_password = hash.digest('hex');
                                API.database.update_password(email, user_type, hashed_password, function(user){
                                      if (user) {
                                          //success!
                                          response.success = true;
                                          API.sendResponse(req,res,response);
                                      }
                                      else {
                                          response.status.code = "-22";
                                          response.status.description = "Error updating database";
                                          response.success = false;
                                          API.sendResponse(req,res, response);
                                      }
                                });
                            }
                            else {
                                API.badDataReceived(req,res);
                            }
                        });
                    }
                    else {
                        response.status.code = "-31";
                        response.status.description = "Invalid token";
                        response.success = false;
                        API.sendResponse(req,res, response);
                    }
                }
                else {
                    API.badDataReceived(req,res);
                }
            });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    coupon_create: function(req, res) {
        var response = { status: {code:"0",description:":)"} };

        var business_id = req.body.business_id;
        var coupon_name = req.body.coupon_name;
        var desc = req.body.desc;
        var loc_street = req.body.loc_street;
        var loc_city = req.body.loc_city;
        var loc_state = req.body.loc_state;
        var loc_zip = req.body.loc_zip;

        if (business_id != null && coupon_name != null && desc != null && loc_street != null
            && loc_city != null && loc_state != null && loc_zip != null) {
            API.database.add_coupon(business_id, coupon_name, desc, loc_street, loc_city,
              loc_state, loc_zip,
              function(user) {
                if (user) {
                    response.user = user;
                    API.sendResponse(req,res,response);
                }
                else {
                    response.status.code = "-22";
                    response.status.description = "Error Inserting Into the Database.";
                    API.sendResponse(req,res,response);
                }
              });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    coupons: function(req,res) {
        var response = { status: {code:"0",description:":)"} };
        var coupons = API.database.get_all_coupons(function(coupons){
              if (coupons) {
                  response.coupons = coupons;
                  API.sendResponse(req,res,response);
              }
              else {
                  API.badDataReceived(req,res);
              }
        });
    },
    user: function(req,res) {
        var response = { status: {code:"0",description:":)"} };

        var user_id = req.query.user_id;

        if (user_id != null) {
          var user = API.database.get_user(user_id, function(user){
              if (user) {
                  response.user = user;
                  API.sendResponse(req,res,response);
              }
              else {
                  response.status.code = -1;
                  response.status.description = "user not found";
                  API.sendResponse(req,res,response);
              }
          });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    user_coupons: function(req,res) {
        var response = { status: {code:"0",description:":)"} };

        var user_id = req.query.user_id;

        if (user_id != null) {
          var coupons = API.database.get_user_coupons(user_id, function(coupons){
              if (coupons) {
                  response.coupons = coupons;
                  API.sendResponse(req,res,response);
              }
              else {
                  API.badDataReceived(req,res);
              }
          });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    salt: function(req,res) {
        var response = { status: {code:"0",description:":)"} };

        var email = req.body.email;
        var user_type = req.body.user_type;

        if (email != null && user_type != null) {
          var salt = API.database.get_salt(email, user_type, function(salt){
              if (salt) {
                  response.salt = salt;
                  var string = JSON.stringify(response.salt);
                  string = string.replace("{","");
                  string = string.replace("}","");
                  string = string.replace(/"/g,'');
                  string = string.replace("salt:","");
                  API.sendResponse(req,res,response);
              }
              else {
                  API.badDataReceived(req,res);
              }
          });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    coupon_delete: function(req,res) {
        var response = { status: {code:"0",description:":)"} };

        var user_id = req.body.user_id;
        var coupon_name = req.body.coupon_name;
        var coupon_desc = req.body.coupon_desc;

        if (user_id != null && coupon_name != null && coupon_desc != null) {
            API.database.delete_coupon(user_id, coupon_name, coupon_desc,
              function(user) {
                if (user) {
                    response.success = true;
                    API.sendResponse(req,res,response);
                }
                else {
                    response.success = false;
                    response.status.code = "-22";
                    response.status.description = "Error Deleted From the Database.";
                    API.sendResponse(req,res,response);
                }
            });
        }
        else {
            API.badDataReceived(req,res);
        }
    },
    // generic response handlers
    sendResponse: function (req, res, response_object){
        res.header("Content-Type", "Application/JSON");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods","GET, PUT, POST, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers","Content-Type");
        res.status(200).send(response_object);
    },
    badDataReceived: function(req,res, message) {
        if (message == null) message = "bad data received";
        var response = {"status":{
            "code":"-31",
            "description":message
        }};
        res.header("Content-Type", "Application/JSON");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods","GET, PUT, POST, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers","Content-Type");
        res.status(400).send(response);
    },
    methodNotAllowed: function(req,res) {
        var response = {"status":{
            "code":"-11",
            "description":"wrong method was used"
        }};
        res.header("Content-Type", "Application/JSON");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods","GET, PUT, POST, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers","Content-Type");
        res.status(200).send(response); //this has to be 200 to allow CORS
    },
    serverError: function(req,res, message) {
        // this should probably be logged for QA purposes
        if (message == null) message = "internal server error";
        var response = {"status":{
            "code":"-22",
            "description":message
        }};
        res.header("Content-Type", "Application/JSON");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods","GET, PUT, POST, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers","Content-Type");
        res.status(500).send(response);
    },
    notFound: function(req,res) {
        // this should probably be logged for QA purposes
        var response = {"status":{
            "code":"-12",
            "description":"url does not exist"
        }};
        res.header("Content-Type", "Application/JSON");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods","GET, PUT, POST, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers","Content-Type");
        res.status(404).send(response);
    }
};
// this must be last.
module.exports = API;

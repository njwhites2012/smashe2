var DB = {

  init: function(){

    this.mongoose = require('mongoose');
    this.ObjectId = require('mongoose').Types.ObjectId;
    this.Schema = this.mongoose.Schema;

    this.mongoose.connect('mongodb://smasher:supersmash@ds127978.mlab.com:27978/heroku_m7rp3ssh');
    this.database = this.mongoose.connection;
    this.database.on('error', console.error.bind(console, 'connection error:'));

    this.crypt = require('crypto');

    //schema stuff
    this.userSchema = {};
    this.tourneySchema = {};
    this.characterSchema = {};
    this.user = {};
    this.tourney = {};
    this.character = {};

    this.database.once('open', function (callback) {

        //create the user schema
        DB.userSchema = new DB.Schema({
          id: DB.Schema.ObjectId,
          email: { type: String, unique: true, required: true },
          reset: { type: String, required: false },
          password: { type: String, required: true },
          salt: { type: String, required: true },
          name: {
            first: { type: String, required: false },
            last: { type: String, trim: true, required: false },
            nickname: { type: String, trim: true, required: false },
          },
          active_tourneys: [{
              tourney_name: { type: String, required: false },
              tourney_id: { type: String, required: false }
          }],
          character_rank: [{
              character_id: { type: String, required: false },
              character_name: { type: String, required: false },
              character_image: { type: String, required: false },
              character_position: { type: String, required: false },
          }],
        });
        DB.user = DB.database.model('user', DB.userSchema);

        //create the tourney schema
        DB.tourneySchema = new DB.Schema({
          id: DB.Schema.ObjectId,
          character_count: { type: String, required: true },
          name: { type: String, required: true },
          active_users: [{
              id: { type: String, required: true },
              user_id: { type: String, required: false },
              character_name: { type: String, required: true },
          }],
        });
        DB.tourney = DB.database.model('tourney', DB.tourneySchema);

        //create the character schema
        DB.characterSchema = new DB.Schema({
          id: DB.Schema.ObjectId,
          name: { type: String, unique: true, required: true },
          image: { type: String, unique: true, required: true },
        });
        DB.character = DB.database.model('character', DB.characterSchema);
      });
    },
    // functions for API
    //add user
    add_user: function (first, last, nickname, password, salt, email, callback) {
        var instance = new DB.user();
        instance.name.first = first;
        instance.name.last = last;
        instance.name.nickname = nickname;
        instance.password = password;
        instance.salt = salt;
        instance.email = email;
        instance.save(function (error) {
            if (error) {
                console.log(error);
                callback(false);
            }
            else {
                callback(instance);
            }
        });
    },
    get_salt: function(email, callback) {
          DB.database.collection('users').find({'email': email}, {salt: 1, _id: 0}).limit(50).toArray(function(err,docs) {
              if (docs[0] != null) {
                  callback(docs[0]);
              }
              else {
                  callback(false);
              }
          });
    },
    check_user_credentials: function(e, p, callback) {
        DB.database.collection('users').find({email:e,password:p}).limit(1).toArray(function(err,docs) {
            if (docs[0] != null) {
                //update last login
                DB.database.collection('users').update({_id:docs[0]._id}, { $set: {last_login: new Date()} } );
                callback(docs[0]);
            }
            else {
                callback(false);
            }
        });
    },
    add_tourney: function (name, character_count, callback) {
        var instance = new DB.tourney();
        instance.name = name;
        instance.character_count = character_count;
        instance.save(function (error) {
            if (error) {
                console.log(error);
                callback(false);
            }
            else {
                callback(instance);
            }
        });
    },
    add_character: function (name, image, callback) {
        var instance = new DB.character();
        instance.name = name;
        instance.image = image;
        instance.save(function (error) {
            if (error) {
                console.log(error);
                callback(false);
            }
            else {
                callback(instance);
            }
        });
    },
    add_tourney_character: function (number, tourney_id, character_name, user_id, callback) {
        DB.database.collection('tourneys').update({'_id':DB.ObjectId(tourney_id)}, {$addToSet: { "active_users": {"id" : number, "user_id" : user_id, "character_name" : character_id}}} , function(error, result) {
            if (result) {
                callback(result);
            }
            else {
                callback(false);
            }
        });
    },
    get_character: function(name, callback) {
        DB.database.collection('characters').find({'name': name}).limit(1).toArray(function(err,docs) {
            if (docs[0] != null) {
                callback(docs);
            }
            else {
                callback(false);
            }
        });
    },
    get_characters: function(callback) {
        DB.database.collection('characters').find().limit(100).toArray(function(err,docs) {
            if (docs[0] != null) {
                callback(docs);
            }
            else {
                callback(false);
            }
        });
    },
    /*//add member
    add_member: function (first, last, password, salt, email, phone, type, premium_status, stripe_id, callback) {
        var instance = new DB.user();
        instance.name.first = first;
        instance.name.last = last;
        instance.password = password;
        instance.salt = salt;
        instance.email = email;
        instance.phone = phone;
        instance.user_type = type;
        instance.premium_status = premium_status;
        var jsonDate = "2016-12-16T00:00:00.123Z";
        instance.premium_exp_date = new Date(jsonDate);
        instance.stripe_id = stripe_id;
        var p_hash = DB.generate_piggy_hash(email);
        instance.piggy_hash = p_hash.substring(0, 4);
        instance.save(function (error) {
            if (error) {
                console.log(error);
                callback(false);
            }
            else {
                callback(instance);
            }
        });
    },
    add_ride: function (rider_id, passengers, cost, coupon_name, coupon_desc, p_street, p_city, p_state, p_zip, p_lat, p_lng, d_street, d_city, d_state, d_zip, d_lat, d_lng, callback) {
        var instance = new DB.ride();
        instance.rider_id = rider_id;
        instance.total_passengers = passengers;
        instance.ride_status = "unclaimed";
        instance.coupon.name = coupon_name;
        instance.coupon.desc = coupon_desc;
        instance.pickup_address.street = p_street;
        instance.pickup_address.city = p_city;
        instance.pickup_address.state = p_state;
        instance.pickup_address.zip_code = p_zip;
        instance.pickup_address.lat = p_lat;
        instance.pickup_address.lng = p_lng;
        instance.dest_address.street = d_street;
        instance.dest_address.city = d_city;
        instance.dest_address.state = d_state;
        instance.dest_address.zip_code = d_zip;
        instance.dest_address.lat = d_lat;
        instance.dest_address.lng = d_lng;
        instance.cost = cost;
        instance.save(function (error) {
            if (error) {
                console.log(error);
                callback(false);
            }
            else {
                callback(instance);
            }
        });
    },
    edit_ride: function (ride_id, passengers, p_name, p_street, p_city, p_state, p_zip, d_name, d_street, d_city, d_state, d_zip) {
        DB.database.collection('rides').update({'_id':DB.ObjectId(ride_id)}, {$set: {'total_passengers': passengers,
                  'pickup_address.name': p_name, 'pickup_address.street': p_street, 'pickup_address.city': p_city, 'pickup_address.state': p_state,
                  'dest_address.name': d_name, 'dest_address.street': d_street, 'dest_address.city': d_city, 'dest_address.state': d_state}});
        return 1;
    },
    claim_ride: function (ride_id, driver_id, callback) {
        DB.database.collection('rides').find({"_id":DB.ObjectId(ride_id), ride_status: 'unclaimed'}).limit(1).toArray(function(err,docs) {
          if(docs[0] != null){
            DB.database.collection('rides').update({'_id':DB.ObjectId(ride_id)}, {$set: {'ride_status': 'claimed', 'driver_id': driver_id}});
            callback(1);
          }
          else {
            callback(0);
          }
        });
    },
    delete_ride: function (ride_id, callback) {
      DB.database.collection('rides').remove({'_id':DB.ObjectId(ride_id)}, function(error, result) {
          if (result) {
              callback(result);
          }
          else {
              callback(false);
          }
      });
    },
    get_all_unclaimed_rides: function(city, state, callback) {
        DB.database.collection('rides').find({'pickup_address.city': city,'pickup_address.state': state,'ride_status': 'unclaimed'}).limit(50).toArray(function(err,docs) {
            console.log(JSON.stringify(docs));
            if (docs[0] != null) {
                callback(docs);
            }
            else {
                callback(false);
            }
        });
    },
    get_driver_rides: function(driver_id, callback) {
        DB.database.collection('rides').find({'driver_id': driver_id, 'ride_status': 'claimed'}).limit(50).toArray(function(err,docs) {
            if (docs[0] != null) {
                callback(docs);
            }
            else {
                callback(false);
            }
        });
    },
    get_token: function(email, user_type, callback) {
      if (user_type == "user"){
          DB.database.collection('users').find({'email': email}, {reset: 1, _id: 0}).limit(50).toArray(function(err,docs) {
              if (docs[0] != null) {
                  callback(docs[0]);
              }
              else {
                  callback(false);
              }
          });
      }
      else {
          DB.database.collection('drivers').find({'email': email}, {reset: 1, _id: 0}).limit(50).toArray(function(err,docs) {
              if (docs[0] != null) {
                  callback(docs[0]);
              }
              else {
                  callback(false);
              }
          });
      }
    },
    get_stripe: function(ride_id, callback) {
        DB.database.collection('rides').find({'_id':DB.ObjectId(ride_id)}, {rider_id: 1, _id: 0}).limit(1).toArray(function(err,docs) {
            if (docs[0] != null) {
                //response.salt = user;
                var rider_id = JSON.stringify(docs[0]);
                rider_id = rider_id.replace("{","");
                rider_id = rider_id.replace("}","");
                rider_id = rider_id.replace(/"/g,'');
                rider_id = rider_id.replace("rider_id:","");
                DB.database.collection('users').find({'_id':DB.ObjectId(rider_id)}, {stripe_id: 1, _id: 0}).limit(50).toArray(function(err,docs) {
                    if (docs[0] != null) {
                        var stripe_id = JSON.stringify(docs[0]);
                        stripe_id = stripe_id.replace("{","");
                        stripe_id = stripe_id.replace("}","");
                        stripe_id = stripe_id.replace(/"/g,'');
                        stripe_id = stripe_id.replace("stripe_id:","");
                        callback(stripe_id);
                    }
                    else {
                        callback(false);
                    }
                });
            }
            else {
                callback(false);
            }
        });
    },
    get_premium_status: function(rider_id, callback) {
        DB.database.collection('users').find({'_id':DB.ObjectId(rider_id)}, {premium_status: 1, _id: 0}).limit(50).toArray(function(err,docs) {
            if (docs[0] != null) {
                var premium_status = JSON.stringify(docs[0]);
                premium_status = premium_status.replace("{","");
                premium_status = premium_status.replace("}","");
                premium_status = premium_status.replace(/"/g,'');
                premium_status = premium_status.replace("premium_status:","");
                callback(premium_status);
            }
            else {
                callback(false);
            }
        });
    },
    get_ride_cost: function(ride_id, callback) {
        DB.database.collection('rides').find({'_id':DB.ObjectId(ride_id)}, {cost: 1, _id: 0}).toArray(function(err,docs) {
            if (docs[0] != null) {
                //response.salt = user;
                var cost = JSON.stringify(docs[0]);
                cost = cost.replace("{","");
                cost = cost.replace("}","");
                cost = cost.replace(/"/g,'');
                cost = cost.replace("cost:","");
                callback(cost);
            }
            else {
                callback(false);
            }
        });
    },
    add_reset: function (email, user_type, salt, callback) {
        if (user_type == "user"){
          DB.database.collection('users').update({ 'email': email }, {$set: { 'reset': salt }}, { upsert: false }, function(error, result) {
              if (result) {
                  callback(result);
              }
              else {
                  callback(false);
              }
          });
        }
        else {
          DB.database.collection('drivers').update({ 'email': email }, {$set: { 'reset': salt }}, { upsert: false }, function(error, result) {
              if (result) {
                  callback(result);
              }
              else {
                  callback(false);
              }
          });
        }
    },
    update_password: function (email, user_type, password, callback) {
        if (user_type == "user"){
          DB.database.collection('users').update({ 'email': email }, {$set: { 'password': password, reset: null }}, { upsert: false }, function(error, result) {
              if (result) {
                  callback(result);
              }
              else {
                  callback(false);
              }
          });
        }
        else {
          DB.database.collection('drivers').update({ 'email': email }, {$set: { 'password': password, reset: null }}, { upsert: false }, function(error, result) {
              if (result) {
                  callback(result);
              }
              else {
                  callback(false);
              }
          });
        }
    },
    add_coupon: function (business_id, coupon_name, desc, loc_street, loc_city, loc_state, loc_zip, callback) {
        var instance = new DB.coupon();
        instance.business_id = business_id
        instance.coupon_name = coupon_name;
        instance.desc = desc;
        instance.address.street = loc_street;
        instance.address.city = loc_city;
        instance.address.state = loc_state;
        instance.address.zip_code = loc_zip;
        instance.start_time = new Date();
        var coupon = [];
        coupon.push({name: coupon_name, desc: desc});
        var exp_time = new Date();
        exp_time += (24 * 60 * 60 * 1000);
        instance.expiration_time = exp_time;
        DB.database.collection('drivers').update({}, {$addToSet: {'active_coupons': coupon}});
        instance.save(function (error) {
            if (error) {
                console.log(error);
                callback(false);
            }
            else {
                callback(instance);
            }
        });
    },
    get_all_coupons: function(callback) {
        DB.database.collection('coupons').find().limit(50).toArray(function(err,docs) {
            if (docs[0] != null) {
                callback(docs);
            }
            else {
                callback(false);
            }
        });
    },
    get_user_coupons: function(user_id, callback) {
        DB.database.collection('users').find({"_id":DB.ObjectId(user_id)}, {active_coupons: 1}).limit(5).toArray(function(err,docs) {
            if (docs[0] != null) {
                callback(docs[0]);
            }
            else {
                callback(false);
            }
        });
    },
    get_user: function(user_id, callback) {
        DB.database.collection('users').find({"_id":DB.ObjectId(user_id)}, {salt: 0, reset: 0}).limit(5).toArray(function(err,docs) {
            if (docs[0] != null) {
                callback(docs[0]);
            }
            else {
                callback(false);
            }
        });
    },
    delete_coupon: function (user_id, coupon_name, coupon_desc, callback) {
      DB.database.collection('users').update({'_id':DB.ObjectId(user_id)}, {$pull: {active_coupons: {name: coupon_name}, active_coupons: {desc: coupon_desc}}}, function(error, result) {
          if (result) {
              callback(result);
          }
          else {
              callback(false);
          }
      });
    },
    check_driver_credentials: function(e, p, callback) {
        DB.database.collection('drivers').find({email:e,password:p}).limit(1).toArray(function(err,docs) {
            if (docs[0] != null) {
                //update last login
                DB.database.collection('drivers').update({_id:docs[0]._id}, { $set: {last_login: new Date()} } );
                callback(docs[0]);
            }
            else {
                callback(false);
            }
        });
    },
    generate_piggy_hash: function(user_id) {
        return DB.crypt.createHash('sha256').update(user_id).digest('hex');
    }*/
};
module.exports = DB;

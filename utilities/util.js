// const randomstring = require("randomstring");
// const jwt = require("jsonwebtoken");


//  const SERVER_ADDRESS = "https://event-staging.hospitalityliving.com/";
//  const ROOM_SECRET_KEY = "uzEycvmrbmrRs3TD2h2P9PTsH8ZyTDs2";
//  const APP_ID = "staging-hospitalityliving";
//  const APP_DOMAIN = "event-staging.hospitalityliving.com"; // If this is set to "*" then all domains are allowed

// const DEFAULT_PAYLOAD =  {
//  context: {
//     user: {
//       // avatar: "",
//       name: `User${randomstring.generate({length: 10, charset: 'numeric'})}`,
//       // email: "",
//       // id: ""
//     }
//   },
//   aud: APP_ID,
//   iss: APP_ID,
//   sub: APP_DOMAIN,
//   room: `Room${randomstring.generate({length: 10, charset: 'numeric'})}`,
//   exp:  Math.ceil(Date.now()/1000) + 7200 // 2 hours from now
// };

// const DEFAULT_STREAMING_KEY = randomstring.generate({length: 10});



// exports.generateRoomURL = (roomName, expiry, context, streamKey) => {

//   if(roomName !== ""){
//     DEFAULT_PAYLOAD.room = roomName;
//   }
//   if(expiry > Math.ceil(Date.now()/1000) ){
//     DEFAULT_PAYLOAD.exp = expiry;
//   }
//   if( context.user.name !== "" ){
//     DEFAULT_PAYLOAD.context.user.name = context.user.name;
//   }
//   if( context.user.avatar !== "" ){
//     DEFAULT_PAYLOAD.context.user.avatar = context.user.avatar;
//   }
//   if( context.user.email !== "" ){
//     DEFAULT_PAYLOAD.context.user.email = context.user.email;
//   }
//   if( context.user.id !== "" ){
//     DEFAULT_PAYLOAD.context.user.id = context.user.id;
//   }
 


//   var token = jwt.sign(DEFAULT_PAYLOAD, ROOM_SECRET_KEY);

//     let link = `${SERVER_ADDRESS+DEFAULT_PAYLOAD.room}?jwt=${token}#config.streamKey="${streamKey}"`;
//     return link;
// }
const randomstring = require("randomstring");
const jwt = require("jsonwebtoken");

const SERVER_ADDRESS = "https://event.i-mbu-videoconferencing.com";
const ROOM_SECRET_KEY = "nayvPB29n5rFt82zKVKPzhB5nSazzRuu";
const APP_ID = "imbu";
const APP_DOMAIN = "event.i-mbu-videoconferencing.com";
const RECORDING_URL = "https://recording-event.i-mbu-videoconferencing.com";// If this is set to "*" then all domains are allowed

// const RECORDING_URL = "https://s3.us-east-2.amazonaws.com/recording-event.hospitalityliving.com"; If this is set to "*" then all domains are allowed

exports.generateRoomURL = (roomName, expiry, context, streamKey) => {

  if(roomName === ""){
    roomName = `Room${randomstring.generate({length: 10, charset: 'numeric'})}`;
  }
  if(expiry < Math.ceil(Date.now()/1000) ){
    expiry = Math.ceil(Date.now()/1000) + 7200;
  }
  if( context.user.name === "" ){
    payload.context.user.name = `User${randomstring.generate({length: 10, charset: 'numeric'})}`;
  }
  if( streamKey === "" ){
    streamKey = randomstring.generate({length: 10});
  }


  var token = jwt.sign({
    context,
    aud: APP_ID,
    iss: APP_ID,
    sub: APP_DOMAIN,
    room: roomName,
    exp:expiry  // 2 hours from now
  }, ROOM_SECRET_KEY);

    let streamLink = `${SERVER_ADDRESS}/${roomName}?jwt=${token}#config.streamKey=%22${streamKey}%22`;

    let attendeeLink = `${SERVER_ADDRESS}/static/stream.html?streamKey=${streamKey}`;

    let recordingLink = `${streamKey}.flv`;
    return {streamLink, attendeeLink, recordingLink};
}
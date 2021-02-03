const express = require("express");
const app = express();
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)
const User = require('../models/user-schema');
const controlMessage = require("../controller/control_message");

let socketObj = {}

io.on('connection', async socket => {
   socket.on('newUser', async (userId) => {
    socketObj[userId] = socket.id;
   socketObj["userId"] = userId;
   updateOnlineToTrue(userId)
 })
  io.emit('onlineUsers', await onlineUsers());
  

  socket.on('openChat', async (userId) => {
    let setUser = await findUser(userId)
    socket.emit('openChat', { setUser, userId })
  });

  socket.on('message', async (data) => {
   let user = await findUser(data.from)
   io.to(socketObj[data.to]).emit('messagePrivate', { user, data })
  })

  // shortcuts messages code start
  socket.on('msgUser', async (msgObj) => {
    io.to(socketObj[msgObj.to]).emit('msgUserBack', await controlMessage.add(msgObj));
  });
  
  socket.on('friendRequest', async (data) => {
    let { from, to } = data
    let user = await findUser(to)
    if (!user.friendRequest.includes(from)) {
         user.friendRequest.push(from)
         user.save((err) => {
          if (err) console.log('err', err)
        })
        io.to(socketObj[to]).emit('friendRequest',user.friendRequest)
        return
    }
    io.to(socketObj[from]).emit('friendRequestFailed')
    
});
socket.on('ConfirmRequest', async (data) => {
  let {user,to} = data
  
   io.to(socketObj[to]).emit('ConfirmRequest',user)
})
  

  
  socket.on('disconnect',async () => {
    await updateOnlineToFalse(socketObj["userId"]);
    io.emit('onlineUsers', await onlineUsers());
  });
})

async function findUser(userId) {
    return await User.findOne({ _id: userId }).select({ name: 1, photo: 1, message: 1,profilePhotos: 1, online:1, friendRequest: 1,post:1 });
  }
  
  async function onlineUsers() {
    return await User.find({ online: true }).lean().select({ message: 1, profilePhotos: 1, name: 1 });
  }
  
  async function updateOnlineToFalse(userId) {
    return await User.updateOne({ _id: userId }, { $set: { online: false } });
  }
  
  async function updateOnlineToTrue(userId) {
    await User.updateOne({ _id: userId }, { $set: { online: true } }, (err) => {
      if (err) console.log("error on update doc to online after login user:", err);
    })
  }
module.exports = { http, server,app,express,updateOnlineToTrue,findUser,io}
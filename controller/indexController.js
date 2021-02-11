const cons = require("consolidate")
const PostModel = require("../models/PostModel")
const User = require("../models/user-schema")

class IndexController {
    async homePage(req, res) {
       
        let Post = await PostModel.find({}).populate('author').sort({createdAt:-1}).exec()
        let user = await User.findById(req.userObj.userId).exec()
        let profileImg = await User.findById(req.userObj.userId).select({profilePhotos: 1 });
        let onlineUser = await User.find({online:true}).select({name:1,profilePhotos:1}).exec() // get online people
        
        res.render("newsfeed",{
            Post,
            userId:req.userObj.userId,
            userFirendLength: user.friendRequest.length,
            profileImg: profileImg.profilePhotos,
            userImg: profileImg.profilePhotos,
            onlineUser
        })
    }
    
    loginPage(req, res) {
        res.clearCookie('x-access-token')
        res.clearCookie('refreshToken')
        res.render('index')
    }
    async profilePage(req, res) {
       let user = await User.findById(req.params.id).exec()
        // user i posterna
        let userPost = await PostModel.find({author:req.params.id}).populate('author').sort({createdAt:-1}).exec()
        
        // profileImg Profile i nkarna
        let profileImg = await User.findById(req.params.id).select({profilePhotos: 1 });

        let userProfile = await User.findById(req.userObj.userId).select({profilePhotos: 1 });
        res.render('time-line',{
            name:user.name,
            userPost,
            image:user.profilePhotos,
            userId: req.userObj.userId,
            userReqParamId:req.params.id,
            userFirendLength:user.friendRequest.length,
            profileImg: profileImg.profilePhotos,
            userImg: userProfile.profilePhotos
        })
    }
    async userFriends(req, res) {
         try {
            let UserFriends = await User.findOne({ _id: req.userObj.userId }).populate('friend').exec()
            let profileImg = await User.findById(req.userObj.userId).select({profilePhotos: 1 });
            let userProfile = await User.findById(req.userObj.userId).select({profilePhotos: 1 });
            
            res.render('timeline-friends',{
                name:req.userObj.name,
                UserFriends,
                userId: req.userObj.userId,
                userReqParamId:req.params.id,
                profileImg: profileImg.profilePhotos,
                userImg: userProfile.profilePhotos
            })
        } catch (err) {
            console.log("error on friendRequest function", err);
        }
        
    }
    async friendRequest(req, res) {
        try {
            let FriendRequestList = await User.findOne({ _id: req.userObj.userId }).populate('friendRequest').exec()
            res.json({ FriendRequestList })
        } catch (err) {
            console.log("error on friendRequest function", err);
        }
     }

    async aboutPage(req,res) {
         let user = await User.findById(req.userObj.userId).exec()
         let profileImg = await User.findById(req.userObj.userId).select({profilePhotos: 1 });
         let userProfile = await User.findById(req.userObj.userId).select({profilePhotos: 1 });

        res.render('about',{
            user,
            name:user.name,
            userId: req.userObj.userId,
            userReqParamId:req.userObj.userId,
            profileImg:profileImg.profilePhotos,
            userImg: userProfile.profilePhotos
        })
    }

    async photoPage(req,res) {
        let user = await User.findById(req.params.id).exec()
        let profileImg = await User.findById(req.params.id).select({profilePhotos: 1 });
        let userProfile = await User.findById(req.userObj.userId).select({profilePhotos: 1 });
        
      res.render('timeline-photos',{
            user,
            name:user.name,
            userId: req.userObj.userId,
            userReqParamId:req.params.id,
            profileImg: profileImg.profilePhotos ,
            userImg: userProfile.profilePhotos
        })
    } 
    async userMessages(req, res) {
        let UserFriends = await User.findOne({ _id: req.userObj.userId }).populate('friend').exec()
        let profileImg = await User.findById(req.userObj.userId).select({profilePhotos: 1 });  // profileImg Profile i nkarna
        let userProfile = await User.findById(req.userObj.userId).select({profilePhotos: 1 });

        res.render('messages',{
            name:req.userObj.name,
            UserFriends,
            profileImg:profileImg.profilePhotos,
            userImg: userProfile.profilePhotos,
            userId: req.userObj.userId,
            userReqParamId:req.userObj.userId
        })
    }
    /* Confirm friend request */
    async ConfirmRequest(req, res) {
        let { from, to } = req.body
        
        try {
            let user  =  await User.findOne({ _id: from }).select({ friendRequest: 1, friend: 1,name:1 });
            user.friend.push(to)
            let UserFriendRequest =user.friendRequest 
            let index = UserFriendRequest.indexOf(to)
            if(index > -1) UserFriendRequest.splice(index,1)
            user.friendRequest = UserFriendRequest
            user.save((err)=>{ if(err) console.log(err)})
            
            let UserFriend = await User.findOne({ _id: to }).select({ friend: 1, name: 1, profilePhotos: 1 });
             UserFriend.friend.push(from)
            UserFriend.save();
            res.json({ 
              message: `Now ${UserFriend.name} is your firend `,
              imageName: UserFriend.profilePhotos,
              info:{user:user.name,to},
              friendsCount:user.friendRequest.length 
            })

        } catch (err) {
            console.log("error on confirmRequest", err);
        }

    }

    /* Delete Friend Request */
    async DeleteRequest(req,res) {
        let {from,to} = req.body
        try {
         let user = await User.findOne({_id:from}).select({friendRequest:1,friend:1}).exec()
         let UserFriend =  await User.findOne({_id:to}).select({friend:1,name:1}).exec()

         let UserFriendRequest =user.friendRequest 
         let index = UserFriendRequest.indexOf(to)
         if(index > -1) UserFriendRequest.splice(index,1)
         user.friendRequest = UserFriendRequest
         user.save((err)=>{ if(err) console.log(err)})
         res.json({
             message:`${UserFriend.name} Delete your friend request`,
             friendsCount:user.friendRequest.length
           })
        } catch(err) {
           console.log(err)
        }
    }
}
module.exports = new IndexController()
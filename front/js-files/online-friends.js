const activeFriendUl = document.getElementById('people-list')
const Logout = document.querySelector('#Logout')

const chatBox = document.querySelector('.chat-box')
const chatUserName = document.querySelector('.chatUserName')
const chatMessage = document.querySelector('.text-box')
const messageText = document.getElementById('messageText')
const messageUl = document.querySelector('#messageUl')

let userId = localStorage.getItem('userId')
function newUserConnected() {
    socket.emit('newUser', userId)
}
newUserConnected()


let writeToUser = null;
function writeWhom(whom) { 
    writeToUser = whom.id;
}

socket.on('onlineUsers', (data) => {
    outputOnlineUsers(data);
})


function outputOnlineUsers(data) {
   
    activeFriendUl.innerHTML = `${data.map(user => `
    <li class='friend' onclick="writeWhom(this)" id=${user._id}>
		 <figure>
			<img src="images/resources/${user.profilePhotos}" alt="">
				<span class="status f-online"></span>
		 </figure>
			<div class="friendz-meta">
				<a href="/profile/${user._id}">${user.name}</a>
			</div>
	</li>
    `).join('')}`
    for (let elem of activeFriendUl.childNodes) {
        elem.addEventListener('click', () => {
            let userid = elem.id;
            socket.emit('openChat', userid)
        })
    }
}

Logout.addEventListener('click', (err) => {
    if (err) {
        console.log("error on logOut:", err);
    }
    alert('Log out')
    let userId = localStorage.getItem('userId')
    socket.emit('Offline', userId)
})





var config = {
    apiKey: "AIzaSyDvfAhkbIULdrzhEv13fri3_yNuVepHAL4",
    authDomain: "eneida-s-awesome-project.firebaseapp.com",
    databaseURL: "https://eneida-s-awesome-project.firebaseio.com",
    projectId: "eneida-s-awesome-project",
    storageBucket: "eneida-s-awesome-project.appspot.com",
    messagingSenderId: "426844293091"
};

firebase.initializeApp(config);

var database = firebase.database();

var players = {}

var turn

var playerChoicesArray = ["rock", "paper", "scissors"]
// var player2ChoicesArray = ["rock", "paper", "scissors"]

var myPlayer

var player1Choice
var player2Choice

var chat

document.getElementById("submit-chat").disabled = true


database.ref("players").on("value", function(snapshot) {

	console.log(snapshot.val())
    if (snapshot.exists()) {
    	players = snapshot.val()
    }

    if (players.hasOwnProperty('player2') && players.player2.onlineState === false){
    	var p = $('<p style=color:blue>')
		p.text(players.player2.name+" disconnected")
		$("#chat-box").append(p)

    	database.ref("players/player2").remove()

    	$("#playerWelcome").text("Oh no! Player 2 disconnected :( You gotta wait...")

    	$("#player1-choices").empty()
    	database.ref("turn").set("")

    }

    if (players.hasOwnProperty('player1') && players.player1.onlineState === false && players.hasOwnProperty('player2')){
    	var p = $('<p style=color:blue>')
		p.text(players.player1.name+" disconnected")
		$("#chat-box").append(p)

		database.ref("players/player1/onlineState").onDisconnect().set(false)
		database.ref("players/player2/onlineState").onDisconnect().cancel()

    	database.ref("players/player1").remove()
    	database.ref("players/player2").remove()
    	database.ref("players/player1").set({
    		name: players.player2.name,
    		wins: players.player2.wins,
    		losses: players.player2.losses,
    		onlineState: true})

    	$("#playerWelcome").text("Oh no! Player 1 disconnected :( You're now Player 1 and you gotta wait for another player...")
    	$("#player2-choices").empty()
    	$("#player1-choices").empty()
    	$("#player-2-username").empty()
    	$("#player-1-username").text(players.player1.name)
    	$("#player1-score").html("<p>Wins: <span id=player1wins>" +players.player1.wins+"</span> Losses:<span id=player1losses>"+players.player1.losses+"</span></p>")
    	$("#player2-score").html("<p>Wins: <span id=player2wins>0</span> Losses:<span id=player2losses>0</span></p>")

    	database.ref("turn").set("")
    	myPlayer = "player1"

    }

    if (players.hasOwnProperty('player1') && players.player1.onlineState === false && !players.hasOwnProperty('player2')){
    	database.ref("players/player1").remove()
    }



}, function(errorObject){ 
  console.log("The read failed: " + errorObject.code)

});


$("#submit-username").on("click", function() {

	event.preventDefault();
	document.getElementById("submit-chat").disabled = false


	if (players.hasOwnProperty('player1')) {

		var player2Username = $("#user-name").val().trim()
	
		database.ref("players/player2").set({
			name: player2Username,
			wins: 0,
			losses: 0,
			onlineState: true
		})

		$("#player-2-username").text(player2Username)
		$("#player-1-username").text("Waiting for "+players.player1.name+ " to make a choice...")
		$("#playerWelcome").text("Hi " + player2Username+", you're Player 2")
		$("#player2-score").html("<p>Wins: <span id=player2wins>0</span> Losses:<span id=player2losses>0</span></p>")
		$("#submit-button").empty()

		database.ref("players/player2/onlineState").onDisconnect().set(false)

		myPlayer = "player2"

		database.ref("turn").set(
	    	"player1"
		)

	} else{
		

		var player1Username = $("#user-name").val().trim()

		
		database.ref("players/player1").set({
	    	name: player1Username,
	    	wins: 0,
	    	losses: 0,
	    	onlineState: true
		})

		database.ref("players/player1/onlineState").onDisconnect().set(false)

		$("#player-1-username").text(player1Username)
		$("#player1-score").html("<p>Wins: <span id=player1wins>0</span> Losses:<span id=player1losses>0</span></p>")
		$("#player-2-username").text("Waiting for Player 2")
		$("#playerWelcome").text("Hi " + player1Username+", you're Player 1")
		$("#submit-button").empty()

		myPlayer = "player1"


	}

	
})


database.ref("turn").on("value", function(snapshot) {

	console.log("turn")

    if (snapshot.val() === myPlayer) {

    	$("#player-2-username").text(players.player2.name)
    	$("#player-1-username").text(players.player1.name)


	    for(var i=0; i<playerChoicesArray.length; i++) {
			var p = $('<p class="choicePs">')
			p.attr("choice-data", playerChoicesArray[i])
			p.addClass("choice-button")
			p.text(playerChoicesArray[i])
			$("#"+myPlayer+"-choices").append(p)

		}

		$("#playerWelcome").text("It's your turn!")

    }

    if (snapshot.val() === "calculate"){
    	console.log(players.player1.choice)
    	console.log(players.player2.choice)


    	if (players.player1.choice === "rock" && players.player2.choice === "scissors") {
    		player1Wins()
    	}

    	if (players.player1.choice === "rock" && players.player2.choice === "paper") {
    		player2Wins()
    	}

     	if (players.player1.choice === "paper" && players.player2.choice === "rock") {
   			player1Wins()
     	}
    	if (players.player1.choice === "paper" && players.player2.choice === "scissors") {
    		player2Wins()  
      	}

     	if (players.player1.choice === "scissors" && players.player2.choice === "rock") {
        	player2Wins()
      	}

      	if (players.player1.choice === "scissors" && players.player2.choice === "paper") {
        	player1Wins()
      	}
      	if (players.player1.choice === players.player2.choice) {
        	playersTie()
      	}
    }

    if (snapshot.val() === "restart"){
    	
		$("#playerWelcome").empty()
		$("#winner").empty()
		$("#player1-choices").empty()
	    $("#player2-choices").empty()
	    $("#player1wins").text(players.player1.wins)
	    $("#player2wins").text(players.player2.wins)
	    $("#player1losses").text(players.player1.losses)
	    $("#player2losses").text(players.player2.losses)
		database.ref("turn").set("player1")
		if (myPlayer === "player2"){
			$("#player1-choices").text("Waiting for "+players.player1.name+" to make a choice...")
		}
	}
}, function(errorObject){ 
  console.log("The read failed: " + errorObject.code)

});

function selectChoice() {
		if (myPlayer === "player1"){
			var choice = $(this).attr("choice-data")

			database.ref("players/player1/choice").set(
		    	$(this).attr("choice-data")
			)

			$("#player1-choices").html("<h1>" + choice + "</h1")
			$("#player2-choices").text("Waiting for " + players.player2.name +" to make a choice")
			$("#playerWelcome").empty()

			database.ref("turn").set(
		    	"player2"
			)

		}
		if (myPlayer === "player2"){
			var choice = $(this).attr("choice-data")

			database.ref("players/player2/choice").set(
		    	$(this).attr("choice-data")
			)

			$("#player2-choices").html("<h1>" + choice + "</h1")


			database.ref("turn").set(
		    	"calculate"
			)
		}
}


function restart(){
	console.log("restart")
	$("#playerWelcome").empty()
	$("#winner").empty()
	$("#player1-choices").empty()
    $("#player2-choices").empty()
    $("#player1wins").text(players.player1.wins)
    $("#player2wins").text(players.player2.wins)
    $("#player1losses").text(players.player1.losses)
    $("#player2losses").text(players.player2.losses)
	database.ref("turn").set("player1")
	if (myPlayer === "player2"){
		$("#player1-choices").text("Waiting for "+players.player1.name+" to make a choice...")
	}
}



function player1Wins(){

	setTimeout(function (){database.ref("turn").set("restart")}, 5000)

	$("#player2-choices").html("<h1>" + players.player2.choice + "</h1")
	$("#player1-choices").html("<h1>" + players.player1.choice + "</h1")
	$("#playerWelcome").empty()
	players.player2.losses +=1
	players.player1.wins +=1

    database.ref("players").set(players)

	$("#winner").html("<h1>"+players.player1.name+" wins!"+"</h1>")


}

function player2Wins(){
	setTimeout(function (){database.ref("turn").set("restart")}, 5000)

	$("#player1-choices").html("<h1>" + players.player1.choice + "</h1")
	$("#player2-choices").html("<h1>" + players.player2.choice + "</h1")
	$("#playerWelcome").empty()

 	players.player1.losses +=1
	players.player2.wins +=1

    database.ref("players").set(players)


	$("#winner").html("<h1>"+players.player2.name+" wins!"+"</h1>")
	
}

function playersTie() {
	setTimeout(function (){database.ref("turn").set("restart")}, 5000)

	$("#player1-choices").html("<h1>" + players.player1.choice + "</h1")
	$("#player2-choices").html("<h1>" + players.player2.choice + "</h1")
	$("#playerWelcome").empty()

	$("#winner").html("<h1> It's a tie!</h1>")


}

$(document).on("click", ".choice-button", selectChoice)


$("#submit-chat").on("click", function() {
	event.preventDefault();

	database.ref("chats").push({
		player: players[myPlayer].name,
		message:$("#chat-message").val().trim()
		})

	$('#chat-message').val('')

	// $("#chat-box").append(chatMessage)
})

database.ref("chats").on("child_added", function(snapshot, prevChildKey) {
	chat = snapshot.val()

	p = $("<p>")
	p.text(chat.player+": "+chat.message)
	$("#chat-box").append(p)

}, function(errorObject){ 
  console.log("The read failed: " + errorObject.code)

});


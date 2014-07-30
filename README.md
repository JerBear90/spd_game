Notes: 
	Node.js
		- Provide for the main fondation for the back-end of the gmae. 
		- Allows us to utilize Express Frameword and the Socket.IO Library

	Express Framework
		- Serves static files such as HTML, CSS, and JavaScript

	Socket.IO
		- Allows for real-time communcation betwen the webvowser and a server (in our case the server is running Node.JS and Express)

	Client Side (JavaScript)
		- JQuery for animations 
		- FastClick.JS remove the 300ms delay on mobile devices

	Css - Styles the overall structure of the website.

	In the Same Room?
		Scan the QR Code using your favorite QR Scanner!

Functions:

 updateWaitingScreen : where the number of players can be edited * a function neeeds to be written that ask the users if they want to add more players. 

 endGame : where the two players score are caluclated
 	if there is a tie there will me a message that is displayed, else the Host will display who the Winner is. 

 countDown : 
 	Starts at 5 Seconds. 


 This is where we would update the amount of players of the screen  
 		// Display the players' names on screen
                $('#player1Score')
                    .find('.playerName')
                    .html(App.Host.players[0].playerName);

  Scoring
  	- here we have the score set to 5
  		// Add 5 to the player's score
                        $pScore.text( +$pScore.text() + 5 );

    - if the player is wrong subtract 3
   		$pScore.text( +$pScore.text() - 3 );

Hoogle Challenge!

		Technology used
			Node.JS - Games Structure
			Express - Game Struture 
			Socket.IO - Multiplayer Cabilites
			HTML5 - Formmating Pages
			Clay.IO - Learderboards, Score, Social, Awards
			Angular.JS - Formating Pages
			Terminal - Creating Directories /  Installing Packages
			Sass - Styling
			JQuery - Animations
			JSON	- Storing Data
			Karma - Unit Testing // TDD
			
		May be best on what code to learn for Google

		Notes:
			3 Devices
			2 Players
			10  Rounds
			3 Types of Languages
				Node.Js
				Express
				Socket.IO

		Project Proposal:

			Create a JavaScript game that will utilize two mobile devices and a desktop browsers. The game will challenge the two users by asking questions related to javaScript (or other languages). There will be one question on the desktop and the two users have to answer the question with the corresponding correct answer. If the user gets the answer right first they are awarded points and the next round starts. There are 10 rounds, the player with the highest score at the end of the round wins. The players have the option in sign-in with clay.io to keep their scores, and achievements as well as post them on Facebook and Twiiter. If the User(s) gets a set amount of points or higher they are awarded with an achievement, which can also be stored and shared. 
;
jQuery(function($){    
    'use strict';
        // All of the code relevent to Socket.IO witll be collected inthe IO namespace
        // Here we are conecting to the Socket IO click and serer when the page is displayed

        var IO = {
            init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },

            //While Socket.IO is connect wit will listen to the fillowing events emitted by the socket Servier, then run the appropriate function.
            bindEvents : function (){
                IO.socket.on('connected', IO.onConnected); //when the game is connected
                IO.socket.on('newGameCreated', IO.onNewGameCreated); // when a NewGame has been Created
                IO.socket.on('playerJoinedRoom' ,IO.playerJoinedRoom ); // When a player has joined the room
                IO.socket.on('beginNewGame' , IO.beginNewGame ); // When a New Game Begins
                IO.socket.on('newWordData' , IO.onNewWordData ); // when a New Word is Present
                IO.socket.on('hostCheckAnswer' , IO.hostCheckAnswer ); // Host check if the Awnser is correct
                IO.socket.on('gameOver' , IO.gameOver); // When the Game is Over
                IO.socket.on('error', IO.error); // Where an Error occurs

            },

            // When the client is successfully connected

            onConnected : function () {
                // Store a copy fo the client's Socket.IO session ID on the App
                //alert the user/console that the user IO was successfully connected
                //alert("Yay you were successfully connected.");
                App.mySocketId = IO.socket.socket.sessionid;

            },

            // A new game has been created and a random gme ID has been generated
            onNewGameCreated : function(data){
                App.Host.gameInit(data);
            },

            // Funtion for when a player successfully joins a game
            playerJoinedRoom : function(data){
                //When a player joins a room there are two undataWaitingScreen functions
                // One for the player  - App.Player.updateWaitingScreen
                //and one for the Host - App.Host.updateWaitingScreen
                App[App.myRole].updateWaitingScreen(data);

            },

            //When X(2) amount of players have joined the room the countdown will be intitalized
            beginNewGame : function(data){
                App[App.myRole].gameCountdown(data);
            },

            // A new set of question for the round is returned from the server
            onNewWordData : function(data){
                App.currentRound = data.round;
                App[App.myRole].newWord(data);

            },

            // Once a player has answered the question 
            //we want to make sure it is the corresponding answer 
            //to that of the Host
            hostCheckAnswer : function(data){
                if(App.myRole === 'Host' ){
                    App.Host.checkAnswer(data);
                }
            },

            // Let the players know that the Game is Over
            gameOver : function(data) {
                App[App.myRole].endGame(data);
            },

            // If an error has occured we want to send .message to our client's
            error : function(data){
                alert(data.message);
            }
        }; // end of our var IO 

        var App = {

            // Keep track of the gameId, identical to the ID of the Socket.IO room
            // intially setting the gameid var to 0;
            gameId : 0,

            //used to differentiate between Player and Host,
            myRole : '' ,

            //The Socket identitfier that is unique to both player and host. 
            // Generated when the browser intially connect to the page for the first time
            mySocketId : '',

            //Identifies the current round
            // Start off at 0 because that is the first Round and the first item in the array
            currentRound : 0,

            // Here runs the intall setup when the pages loads

            //This runs when the game loads for the first time
            init : function(){
                App.cacheElements();
                App.showInitScreen();
                App.bindEvents();

                //Intitalize our fast click JavaScript Library that will ommit the 300ms delay in mobile browsers
                FastClick.attach(document.body);
            },

            //Create references to on-screen elements used throughout the game
            cacheElements : function(){
                App.$doc = $(document);

                //Our Templates used in HTML
            App.$gameArea = $('#gameArea');
            App.$templateIntroScreen = $('#intro-screen-template').html();
            App.$templateNewGame = $('#create-game-template').html();
            App.$templateJoinGame = $('#join-game-template').html();
            App.$hostGame = $('#host-game-template').html();
            },

            //Here we will create some event Handlers for our buttons 
            //throughout the game
            bindEvents : function() {
                //Host Only!
                //#btnStart, munipulated to creat game when 
                //player are sure they are ready,
                // when the btnCreateGame is clicked bind App.Host.onCreateClick  to it
                App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);

                //Player
                App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
            App.$doc.on('click', '#btnStart',App.Player.onPlayerStartClick);
            App.$doc.on('click', '.btnAnswer',App.Player.onPlayerAnswerClick);
            App.$doc.on('click', '#btnPlayerRestart', App.Player.onPlayerRestart);

            },

            // Here begins
            // Our Game Logic

            // Show the Intial [Game Name] Ttile Screen
            // Showing Start and Join Buttons
            showInitScreen: function() {
            App.$gameArea.html(App.$templateIntroScreen);
            App.doTextFit('.title');
        },

            //Code containing Reference to Host

            Host : {

                //Contains Refernce to Player Data
                players : [],

                // used after the first game has ended and Players have not 
                // refreshed their browsers
                isNewGame : false,

                // Keep track of the number of players in the room
                numPlayersInRoom : 0,

                //used to reference to the correct
                // answer in that particular round
                currentCorrectAnswer : '',

                //Handler for the StartButton on the Title Screen
               onCreateClick: function () {
                // console.log('Clicked "Create A Game"');
                IO.socket.emit('hostCreateNewGame');
            },

                // The Host Screen is display for the first time
                gameInit: function (data) {
                App.gameId = data.gameId;
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Host.numPlayersInRoom = 0;

                App.Host.displayNewGameScreen();
                    // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);

                },

                // Show the host screen and then display 
                // what the URl is along with the unique gameId
                displayNewGameScreen : function () {
                    // Fill the Green Screen with the appropriate HTML
                    App.$gameArea.html(App.$templateNewGame);

                    //display the URl on the screen
                    // This is where the URL can be QR Code
                    $('#gameURL').text(window.location.href);
                    App.doTextFit('#gameURL');

                    //Show the GameID / ROOM ID on the Screen
                    $('#spanNewGameCode').text(App.gameId);
                },

                updateWaitingScreen: function(data) {
                // If this is a restarted game, show the screen.
                if ( App.Host.isNewGame ) {
                    App.Host.displayNewGameScreen();
                }
                // Update host screen
                $('#playersWaiting')
                    .append('<p/>')
                    .text('Player ' + data.playerName + ' joined the game.');

                // Store the new player's data on the Host.
                App.Host.players.push(data);

                    //Increment the number of players in the room
                    App.Host.numPlayersInRoom += 1;

                    //If Two players have joined the room, Start the game
                    // This section can be spit into three sections Solo, 2 players , 4 Players
                    // Main Focus is JUST 2 Players
                if (App.Host.numPlayersInRoom === 2) {
                        // Let the server know that the game is full
                        // that the two players are present
                        //and we are ready to begin
                    IO.socket.emit('hostRoomFull',App.gameId);
                    }
                },

                    //Show the countdown Screen
                    gameCountdown : function(){
                        //Prepare the Game with HTML
                        App.$gameArea.html(App.$hostGame);
                        App.doTextFit('#hostWord');

                        // Begin the onscreen timer
                         var $secondsLeft = $('#hostWord');
                        App.countDown( $secondsLeft, 5, function(){
                        IO.socket.emit('hostCountdownFinished', App.gameId);
                            });

                        //Dispaly the players Names on the Screen
                        //Duplicate for more than Two users
                        // player1Score
                        $('#player1Score')
                    .find('.playerName')
                    .html(App.Host.players[0].playerName);

                $('#player2Score')
                    .find('.playerName')
                    .html(App.Host.players[1].playerName);

                // Set the Score section on screen to 0 for each player.
                $('#player1Score').find('.score').attr('id',App.Host.players[0].mySocketId);
                $('#player2Score').find('.score').attr('id',App.Host.players[1].mySocketId);
            },

                    newWord : function(data) {
                // Insert the new word into the DOM
                $('#hostWord').text(data.word);
                App.doTextFit('#hostWord');

                // Update the data for the current round
                App.Host.currentCorrectAnswer = data.answer;
                App.Host.currentRound = data.round;
            },


                    //Here we are checking the correct answer from the Player
                    checkAnswer : function(data) {
                        // Verify answer was from current round
                        //Prevent from any late answers to be submitted by late Joiners

                      
                        if(data.round === App.currentRound){
                          // Here we are getting the players score based on the current Round
                            var $pScore = $('#' + data.playerId);

                        // Advance the player Score of it is correct
                        if (App.Host.currentCorrectAnswer === data.answer){

                            //Add X (5) points to the players score
                            $pScore.text(+$pScore.text() + 5);

                            // Advence to the next round by 1
                            App.currentRound += 1;

                            //Prepare this DATA and send it to the server
                            var data = {
                                gameId : App.gameId,
                                round : App.currentRound
                            }

                            //Notify to the SERVER that it time to start the next round
                            IO.socket.emit('hostNextRound' , data);

                        } else {
                               //If a wrong answer has been submitting, 
                               //decrease the players's score by 3 point 
                               $pScore.text(+$pScore.text() - 3);
                        }
                    }
                },

                //All 10 Rounds have been playerd out.
                // End game function

                endGame : function(data) {
                // Get the data for player 1 from the host screen
                var $p1 = $('#player1Score');
                var p1Score = +$p1.find('.score').text();
                var p1Name = $p1.find('.playerName').text();

                // Get the data for player 2 from the host screen
                var $p2 = $('#player2Score');
                var p2Score = +$p2.find('.score').text();
                var p2Name = $p2.find('.playerName').text();

                // Find the winner based on the scores
                var winner = (p1Score < p2Score) ? p2Name : p1Name;
                var tie = (p1Score === p2Score);

                    //Display the Winner (of if there is a tie)
                    if(tie){
                    $('#hostWord').text("It's a Tie!");
                } else {
                    $('#hostWord').text( winner + ' Wins!!' );
                }
                App.doTextFit('#hostWord');

                    //Reset the game data back to 0 
                    //tell the server that the new game has started
                    App.Host.numPlayersInRoom = 0;
                    App.Host.isNewGame = true;

                },

                // A player has hit the "Start Again" btn after the game has ended
              estartGame : function() {
                App.$gameArea.html(App.$templateNewGame);
                $('#spanNewGameCode').text(App.gameId);
            }
        },

            //Here we are Generating The code for the Player

            Player : {

                //Reference to the socket ID of the Host

                hostSocketId: '',

                //The players name has entered onto the screen
                myName: '',

                //Click handler for the "Join" button
                onJoinClick: function(){
                    //The click for Join a Game has been Made
                    // Display the Join Game HTML on the Payer's Screen 
                    App.$gameArea.html(App.$templateJoinGame);
                },

                // The player has Entered their name in the Input 
                //if the player does not enter a name then it will be anon
                onPlayerStartClick : function(){
                    // Player clicked start
                    //Collect the data and send it to the server
                    var data = {
                    gameId : +($('#inputGameId').val()),
                    playerName : $('#inputPlayerName').val() || 'anon'
                };

                    // Send the GameID and playerName to the Server
                IO.socket.emit('playerJoinGame', data);

                    // Set the appropriate propertiest for the current player
                    App.myRole = 'Player';
                App.Player.myName = data.playerName;
            },


                // Click handler for the Player Hitting a word in the word listen
                onPlayerAnswerClick: function() {
                // console.log('Clicked Answer Button');
                var $btn = $(this);      // the tapped button
                var answer = $btn.val(); // The tapped word

                    //Send the tapped word and player info to the Host
                    //To see if the button pressed is the correct word
                    var data = {
                    gameId: App.gameId,
                    playerId: App.mySocketId,
                    answer: answer,
                    round: App.currentRound
                }
                IO.socket.emit('playerAnswer',data);
            },

                // Click handler for "Start Again" button that appears
                // when the game is over 
                onPlayerRestart : function() {
                var data = {
                    gameId : App.gameId,
                    playerName : App.Player.myName
                }
                IO.socket.emit('playerRestart',data);
                App.currentRound = 0;
                $('#gameArea').html("<h3>Waiting on host to start new game.</h3>");
            },

                // display the waiting Screen for Player 1
                updateWaitingScreen : function(data) {
                if(IO.socket.socket.sessionid === data.mySocketId){
                    App.myRole = 'Player';
                    App.gameId = data.gameId;

                    $('#playerWaitingMessage')
                        .append('<p/>')
                        .text('Joined Game ' + data.gameId + '. Please wait for game to begin.');
                }
            },

                // Display Get Ready While the COundown timer Clicks
                gameCountdown : function(hostData) {
                App.Player.hostSocketId = hostData.mySocketId;
                $('#gameArea')
                    .html('<div class="gameOver">Get Ready!</div>');
            },

                // Show the list of words for the current round that we are in
                newWord : function(data) {
                // Create an unordered list element
                var $list = $('<ul/>').attr('id','ulAnswers');

                // Insert a list item for each word in the word list
                // received from the server.
                $.each(data.list, function(){
                    $list                                //  <ul> </ul>
                        .append( $('<li/>')              //  <ul> <li> </li> </ul>
                            .append( $('<button/>')      //  <ul> <li> <button> </button> </li> </ul>
                                .addClass('btnAnswer')   //  <ul> <li> <button class='btnAnswer'> </button> </li> </ul>
                                .addClass('btn')         //  <ul> <li> <button class='btnAnswer'> </button> </li> </ul>
                                .val(this)               //  <ul> <li> <button class='btnAnswer' value='word'> </button> </li> </ul>
                                .html(this)              //  <ul> <li> <button class='btnAnswer' value='word'>word</button> </li> </ul>
                            )
                        )
                });

                // Insert the list onto the screen.
                $('#gameArea').html($list);
            },

                    // Show the "Game Over" Screen
                     endGame : function() {
                $('#gameArea')
                    .html('<div class="gameOver">Game Over!</div>')
                    .append(
                        // Create a button to start a new game.
                        $('<button>Start Again</button>')
                            .attr('id','btnPlayerRestart')
                            .addClass('btn')
                            .addClass('btnGameOver')
                    );
            }
        },

            // Display the countdown timer on the host Screen
            // $el - The countaier element for the coundown timer
            // StartTime - param
            // Callback - the funtio to call when the timer ends
            countDown : function( $el, startTime, callback) {

            // Display the starting time on the screen.
            $el.text(startTime);
            App.doTextFit('#hostWord');

            // console.log('Starting Countdown...');

            // Start a 1 second timer
            var timer = setInterval(countItDown,1000);

                //Decrement the displayed timer value by 1 second each "tick"
                function countItDown(){
                startTime -= 1
                $el.text(startTime);
                App.doTextFit('#hostWord');

                if( startTime <= 0 ){
                    // console.log('Countdown Finished.');

                    // Stop the timer and do the callback.
                    clearInterval(timer);
                    callback();
                    return;
                }
            }

        },


            // doTextFit extention to make text fix inside a given element
            // also make it as big as possible
           doTextFit : function(el) {
            textFit(
                $(el)[0],
                {
                    alignHoriz:true,
                    alignVert:false,
                    widthOnly:true,
                    reProcess:true,
                    maxFontSize:300
                }
            );
        }

    };

    IO.init();
    App.init();

}($));
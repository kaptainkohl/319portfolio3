var http = require('http'),
    fs = require('fs'),
    index = fs.readFileSync(__dirname + '/index.html');

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

var io = require('socket.io').listen(app);


var playernum = 1;

io.on('connection', function(socket) {
    // connection with only 1 client
    
	//when a client connects to the server
    socket.on('i am client',  function(data) {
		console.log(data);
	});
	//when a player presses join
	socket.on('join',  function(data) {
		//console.log(data);
		if( data !=2 &&data!=1)
		{
	
		socket.emit('welcome', playernum );
		
		if (playernum  == 1)
		{
			socket.emit('waiting', 'waiting');
			initMatrix();
			socket.emit('board_state', matrix);
		}
		if (playernum  == 2)
		{
			console.log("Starting Game");
			socket.emit('start', 'start');
			 initMatrix();
			 socket.emit('board_state', matrix);
		}
		if (playernum  > 2)
		{
			socket.emit('full', 'full');
			playernum =3;
		}
		playernum ++;
		}
		
	});
	//when the game is over
	socket.on('reset_game', function(data) {
		playernum = 1;
		io.emit('welcome', 0 );
	});
	//on color change
	socket.on('color_pick', function(data) {
		if (data.id == 1)
		{
			player1color =data.data;
		}
		else 
		{
			player2color =data.data;
		}
		io.emit('color_change', {p1 : player1color, p2 : player2color});
		io.emit('board_state', matrix);
	});
	//when a piece is placed
	socket.on('place', function(data) {
		button(data);
	});	
	//when someone leaves let another person join
	socket.on('disconnect', function() {
      console.log('Got disconnect!');
	  playernum =1;
	});
	
});
//listen on heroku's port or on a localhost port 5000
app.listen(process.env.PORT || 5000);

//game vars
var matrix = [ [0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
var turn= 1;
var player1color = "red";
var player2color = "yellow";
var pointer=0;
var GAMEMODE = "p1";
var winner=0;


//reset the game for everyone
function initMatrix()
{
	turn= 1;
	winner=0;
	for(var r = 0; r<6;r++)
	{
		for(var c = 0; c<7;c++)
		{
			matrix[r][c]=0;
			
		}		
	}
	io.emit('player_turn', turn);
}

//placing pieces on the board
function button(col)
{
	for(var r = 5; r>-1;r--)
	{
		if(matrix[r][col]==0)
		{
			if (turn==1)
			{
				matrix[r][col]=1;
				turn=2;
				io.emit('board_state', matrix);
				io.emit('player_turn', turn);
				if(Winning_Algorithm())
				{

					winner=1;
					io.emit('winner', 1);
				}	
			}
			else
			{
				matrix[r][col]=2;	
				turn=1;
				io.emit('board_state', matrix);
				io.emit('player_turn', turn);
				if(Winning_Algorithm())
				{
					
					winner=2;
					io.emit('winner', 2);


				}
			}
			break;
		}
	}	
}


// see if someone has won.
function Winning_Algorithm() {
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 7; j++) {
			
			if (matrix[i][j] == 1) {
				if (i<3 && matrix[i+1][j] == 1 && matrix[i+2][j] == 1 && matrix[i+3][j] == 1) {
					// p1 WINS;
					return true;
				}
				if (j<4 && matrix[i][j+1] == 1 && matrix[i][j+2] == 1 && matrix[i][j+3] == 1) {
					// p1 WINS;
					return true;
				}
				if (i<3 && j<4 && matrix[i+1][j+1] == 1 && matrix[i+2][j+2] == 1 && matrix[i+3][j+3] == 1) {
					// p1 WINS;
					return true;
				}
				if (i>3 && j<4 && matrix[i-1][j+1] == 1 && matrix[i-2][j+2] == 1 && matrix[i-3][j+3] == 1) {
					// p1 WINS;
					return true;
				}
			}
			else if (matrix[i][j] == 2) {
				if (i<3 &&matrix[i+1][j] == 2 && matrix[i+2][j] == 2 && matrix[i+3][j] == 2) {
					// p2 WINS;
					return true;
				}
				if (j<4 && matrix[i][j+1] == 2 && matrix[i][j+2] == 2 && matrix[i][j+3] == 2) {
					// p2 WINS;
					return true;
				}
				if (i<3 && j<4 && matrix[i+1][j+1] == 2 && matrix[i+2][j+2] == 2 && matrix[i+3][j+3] == 2) {
					// p2 WINS;
					return true;
				}
				if (i>3 && j<4 && matrix[i-1][j+1] == 2 && matrix[i-2][j+2] == 2 && matrix[i-3][j+3] == 2) {
					// p2 WINS;
					return true;
				}
			}
		}
	}
	return false;
}

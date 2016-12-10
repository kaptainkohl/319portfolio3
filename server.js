var http = require('http'),
    fs = require('fs'),
    index = fs.readFileSync(__dirname + '/index.html');

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);


var playernum = 1;

// Emit welcome message on connection
io.on('connection', function(socket) {
    // Use socket to communicate with this particular client only, sending it it's own id
    
	
    socket.on('i am client',  function(data) {
		console.log(data);
	});
	
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
	
	socket.on('reset_game', function(data) {
		playernum = 1;
		io.emit('welcome', 0 );
	});
	
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

	socket.on('place', function(data) {
		button(data);
	});	
	
});

app.listen(process.env.PORT || 5000);


var matrix = [ [0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
var turn= 1;
var player1color = "red";
var player2color = "yellow";
var pointer=0;
var GAMEMODE = "p1";
var winner=0;



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

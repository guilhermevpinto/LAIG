function Socket(scene) {
	this.scene = scene;
	this.boardResponse = null;
	this.scoreResponse = null;
	this.colorsResponse = null;	
	this.winnerResponse = null;
	this.botResponseDROP = null;
	this.botResponseDRAG = null;
};

var validPositions = null;
Socket.prototype = Object.create(Object.prototype);
Socket.prototype.constructor = Socket;


Socket.prototype.sendRequest = function(requestString, type){
	this.postGameRequest(requestString, type);
};

Socket.prototype.postGameRequest = function(requestString, type){
	var request = new XMLHttpRequest();
	request.open('POST', '../../game', true);
	var socket = this;

	if(type == 'board')
		request.onload = function(data){
									var message = data.target.response.split(";");
									var board = JSON.parse(message);
									socket.boardResponse = board.slice(',');
								};
	else if(type == 'score')
		request.onload = function(data){
									var message = data.target.response.split(";");
									var board = JSON.parse(message);
									socket.scoreResponse = board.slice(',');
								};
	else if(type == 'colors')
		request.onload = function(data){

									var message = data.target.response.split(";");
									var array = JSON.parse(message);
									socket.colorsResponse = array.slice(',');
								};
	else if(type == 'winner')
		request.onload = function(data){
									var message = data.target.response.split(";");
									var array = JSON.parse(message);
									socket.winnerResponse = array.slice(',');

									socket.scene.stateMachine.game.saveWinner(socket.winnerResponse[0]);
								};					
	else if(type == 'botdrop')
		request.onload = function(data){
									var message = data.target.response.split(";");
									socket.botResponseDROP = [parseInt(message[0]),parseInt(message[1]),parseInt(message[2])];
								};
	else if(type == 'botdrag')
		request.onload = function(data){
									var message = data.target.response.split(";");
									socket.botResponseDRAG = [parseInt(message[0]),parseInt(message[1]),parseInt(message[2]),parseInt(message[3])];
								};						

	request.onerror = function(){console.log("Error waiting for response");};

	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	request.send('requestString='+encodeURIComponent(requestString));		
};

Socket.prototype.processBoardToString = function(){
	var result = "[";

	for(var i = 1; i < this.scene.stateMachine.game.board.board.length; i++)
	{
		var line = '[';

		for(var j = 1; j < this.scene.stateMachine.game.board.board[i].length; j++)
		{
			line += this.scene.stateMachine.game.board.board[i][j].info;

			if(j != this.scene.stateMachine.game.board.board[i].length - 1)
				line += ',';
		}

		line += ']';
		if(i != this.scene.stateMachine.game.board.board.length - 1)
			line += ',';

		result += line;
	}

	return result + "]";
}

Socket.prototype.processRemainingStonesToString = function(){
	var result = this.scene.stateMachine.game.remainingStones;
	return "["+result+"]";
}

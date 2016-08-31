
 function MyBoard(scene) {
 	CGFobject.call(this,scene);
 	this.scene = scene;
	this.board = [];

	this.makeBoard();

};

MyBoard.prototype = Object.create(CGFobject.prototype);
MyBoard.prototype.constructor = MyBoard;

/**
	Função responsável pela inicialização das posições do tabuleiro. Esta posições acedem-se da mesma forma que que no prolog.
	[
		            [empty, empty, empty, empty, empty],
		         [empty, empty, empty, empty, empty, empty],
		      [empty, empty, empty, empty, empty, empty, empty],
		   [empty, empty, empty, empty, empty, empty, empty, empty],
		[empty, empty, empty, empty, empty, empty, empty, empty, empty],
		   [empty, empty, empty, empty, empty, empty, empty, empty],
		      [empty, empty, empty, empty, empty, empty, empty],
		         [empty, empty, empty, empty, empty, empty],
		            [empty, empty, empty, empty, empty]
	]
*/
MyBoard.prototype.makeBoard = function() {
	var side = -1;
	var boardID = 1;
	for(var y=1; y<=9; y++) {
		this.board[y] = [];
		for(var x=1; x<=9; x++) {
			if(y >=5)
				side = 1;
			switch(y){
				case 9:
				case 1:
				if(x <=5){
					this.board[y][x] = new MyBoardTile(this.scene, boardID, new Coords((x+1)*2  - 8,0,side*6.8), y, x);
				}
				break;
				case 8:
				case 2:
				if(x <=6){
					this.board[y][x] = new MyBoardTile(this.scene, boardID, new Coords((x+0.5)*2  - 8,0,side*5.1), y, x);
				}
				break;
				case 7:
				case 3:
				if(x <=7){
					this.board[y][x] = new MyBoardTile(this.scene, boardID, new Coords((x)*2  - 8,0,side*3.4), y, x);
				}
				break;
				case 6:
				case 4:
				if(x <=8){
					this.board[y][x] = new MyBoardTile(this.scene, boardID, new Coords((x-0.5)*2  - 8,0,side*1.7), y, x);
				}
				break;
				case 5:
				if(x <=9){
					this.board[y][x] = new MyBoardTile(this.scene, boardID, new Coords((x-1)*2  - 8,0,side*0), y, x);
				}
				break;
				default:
			}

			boardID++;
		}
	}
};


MyBoard.prototype.getRegistedBoard = function(Xpos,Ypos){
	var res = [this.board[Xpos][Ypos],/*this.boardRegisterID[Xpos][Ypos]*/];
	return res;
};


MyBoard.prototype.displayBoard = function(){
	for(var y = 1 ; y <= 9; y++){
		for(var x = 1; x < this.board[y].length;x++){
			this.scene.pushMatrix();
			this.scene.translate(this.board[y][x].position.x,this.board[y][x].position.y,this.board[y][x].position.z);
			this.scene.register(this.board[y][x]);
			this.board[y][x].display();
			this.scene.popMatrix();
		}
	}
};


MyBoard.prototype.display = function(){
	this.displayBoard();
};


MyBoard.prototype.highlightDragPositions = function(boardResponse){
	for(var y = 1 ; y <= 9; y++)
		for(var x = 1; x < this.board[y].length;x++){
			if(boardResponse[y-1][x-1] == 1){
				this.board[y][x].highlight = true;	
		}
	}
};


MyBoard.prototype.highlightDropPositions = function(){
	for(var y = 1 ; y <= 9; y++)
		for(var x = 1; x < this.board[y].length;x++)
			if(this.board[y][x].info == 0)
				this.board[y][x].highlight = true;
};


MyBoard.prototype.resetHighlight = function(){
	for(var y = 1 ; y <= 9; y++)
		for(var x = 1; x < this.board[y].length;x++)
				this.board[y][x].highlight = false;
};

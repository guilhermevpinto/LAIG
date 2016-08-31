:- include('project/reader/plog/meerkats.pl').
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_path)).
:- use_module(library(http/http_client)).
:- use_module(library(http/http_server_files)).

:- use_module(library(lists)).

:- http_handler(root(game), prepReplyStringToJSON, []).
:- http_handler(project(.), serve_files_in_directory(project), [prefix]).
http:location(project, root(project), []).
user:file_search_path(document_root, '.').
user:file_search_path(project, document_root(project)).

server(Port) :- http_server(http_dispatch, [port(Port)]).

%Receive Request as String via POST
prepReplyStringToJSON(Request) :-
		member(method(post), Request), !,
        http_read_data(Request, Data, []),
		processString(Data).

prepReplyStringToJSON(_Request) :-
		format('Content-type: text/plain~n~n'),
		write('Can only handle POST Requests'),
		format('~n').

formatAsJSON(Reply):-
		format('Content-type: application/json~n~n'),
		writeJSON(Reply).

writeJSON([Val]):-
		write(Val).
writeJSON([Val|VT]):-
		write(Val), write(';'),
		writeJSON(VT).

processString([_Par=Val]):-
        term_string(List, Val),
		Term =.. List,
		Term.

%---------------------------------------------
sortColors([Players], [Bots], Result):-
	atom_number(Players, NumberPlayers),
	atom_number(Bots, NumberBots),
	availableColors(Colors),
	assignBOTColor(NumberBots,Colors,5,FinalBOTsInfo,ResultColors),
	assignPlayerColor(NumberPlayers, ResultColors, 1, FinalPlayersInfo,_),
	append(FinalBOTsInfo, FinalPlayersInfo, Result),
	formatAsJSON([Result]).

%---------------------------------------------	
makeTest0([Number]):-
					atom_number(Number,Numberr),
					open('hogwarts2.txt',write,Stream), 
					write(Stream,Numberr),  nl(Stream),														
					close(Stream).
				

%INICIO->TESTES------------------------------------------------------------------------------------------------------------------------------------------------------

makeTest():-
			logicalBoardTest(LogicalBoard),
			displayBoard(Board),
			drawBoard(Board,LogicalBoard),
			getStoneCellBOT(LogicalBoard,4,4,X,Y),
			write('X: '),write(X),nl,
			write('Y: '),write(Y),nl.
			
makeTest2():-
			logicalBoardTest(LogicalBoard),
			getInfo(4,2,Info,LogicalBoard),
			write(Info).
makeTest3():-
			logicalBoardTest2(LogicalBoard),
			displayBoard(Board),
			drawBoard(Board,LogicalBoard),
			getEmptyCellBOT(LogicalBoard,X,Y),
			write('X: '),write(X),nl,
			write('Y: '),write(Y),nl.
makeTest4():-
			Stones = [[1,red],[2,blue],[3,yellow],[4,green],[5,yellow],[6,red],[7,blue]],
			getRandomStone(Stones,ResultRemainingStones,Stone),
			write("RemainingStones: "),write(Stones),nl,
			write("ResultRemainingStones: "),write(ResultRemainingStones),nl,
			write("Stone: "),write(Stone).
			
makeTest5():-
			Stones = [[1,blue],[2,red],[3,yellow],[4,green],[5,cenas]],
			delete(Stones,[4,green],Stones2),
			write("Stones: "),write(Stones),nl,
			write("Stones2: "),write(Stones2),nl.
makeTest6():-
			Stones = [1,2,3,4,5,6,7,8,9],
			logicalBoardTest(LogicalBoard),
			write(LogicalBoard),nl,
			stoneDropBOT(LogicalBoard,Stones,IDstone,Xpos,Ypos),
			write("Stones: "),write(Stones),nl,
			write("StoneID: "),write(IDstone),nl,
			write("Xpos: "),write(Xpos),nl,
			write("Ypos: "),write(Ypos),nl.
			
makeTest7():-
			logicalBoardTest2(LogicalBoard),
			write("Initial board: "),nl,
			write(LogicalBoard),nl,
			stoneDragBOT(LogicalBoard,["1"],["1"],Xinicial,Yinicial,Xfinal,Yfinal),
			write("Xinitial: "),write(Xinicial),nl,
			write("Yinicial: "),write(Yinicial),nl,
			write("Xfinal: "),write(Xfinal),nl,
			write("Yfinal: "),write(Yfinal),nl.
			
			

%FIM->TESTES---------------------------------------------------------------------------------------------------------------------------------------------------------
/*open('hogwarts.txt',write,Stream), 
write(Stream,Board),  nl(Stream),
write(Stream,RemainingStones),  nl(Stream), 														
close(Stream)*/



%funciona!!
/*@brief esta função é responsável por selecionar um sitio para colocar uma peça aleatória no tabuleiro
  @param Board tabuleiro actual onde se quer colocar a peça
  @param RemainingStones array com os ID´s das pedra que faltam ainda colocar no tabuleiro [1,2,3,4,5,...] neste formato
  @param IDstone pedra que foi seleccionada pelo BOT para colocar no tabuleiro 
  @param Xpos posição X da nova peça no tabuleiro
  @param Ypos posição Y da nova peça no tabuleiro
*/

stoneDropBOT(Board,RemainingStones,IDstone,Xpos,Ypos):-
														getEmptyCellBOT(Board,Xpos,Ypos),
														getRandomStone(RemainingStones,IDstone),
														formatAsJSON([IDstone,Xpos,Ypos]).




/*@brief esta função é responsável por selecionar um pedra aleatória
  @param RemainingStones tabuleiro actual onde se quer colocar a peça
  @param ResultRemainingStones array com as pedra resultantes
  @param Stone pedra que foi seleccionada pelo BOT para colocar no tabuleiro [1,red] neste formato
*/
getRandomStone(RemainingStones,Stone):-
															length(RemainingStones,Length),
															NewLength is Length + 1,
															random(1,NewLength,StonePos),
															getLineInfo(StonePos,RemainingStones,Stone).

															

/*@brief esta função é responsável por arrastar uma pedra aleatória do board
  @param Board tabuleiro actual onde se quer arrastar a peça
  @param Xpos posição X do local para onde vai ser arrastada
  @param [Xplayed] posição x para onde o jogador jogou inicialmente
  @param [Yplayed] posição y para onde o jogador jogou inicialmente
  @param Ypos posição Y do local para onde vai ser arrastada
*/															
stoneDragBOT(Board,[Xplayed],[Yplayed],Xinicial,Yinicial,Xfinal,Yfinal):-
																	atom_number(Xplayed,XplayedStone),
																	atom_number(Yplayed,YplayedStone),
																	getStoneCellBOT(Board,XplayedStone,YplayedStone,Xtemp,Ytemp),
																	random(1, 7, Direction), 
																	random(1, 5, NumberCells),
																	checkDrag(Board,Xtemp,Ytemp,Direction,NumberCells,Final1,Final2),
																	Xfinal is Final1,Yfinal is Final2,
																	Xinicial is Xtemp, Yinicial is Ytemp,
																	formatAsJSON([Xinicial,Yinicial,Xfinal,Yfinal]);
																	stoneDragBOT(Board,[Xplayed],[Yplayed],Xinicial,Yinicial,Xfinal,Yfinal).
validDragPositions(Row, Col, Board, Result):-
	registBoard(R),
	validDragLeft(Row, Col, Board, R, R1),
	validDragRight(Row, Col, Board, R1, R2),
	validDragUpLeft(Row, Col, Board, R2, R3),
	validDragUpRight(Row, Col, Board, R3, R4),
	validDragDownLeft(Row, Col, Board, R4, R5),
	validDragDownRight(Row, Col, Board, R5, Result),
	formatAsJSON([Result]).

validDragLeft(Row, Col, Board, Register, FinalRegister):-
	PrevCol is Col - 1,
	getInfo(Row, PrevCol, 0, Board),
	setInfo(Row, PrevCol, 1, Register, Temp),
	validDragLeft(Row, PrevCol, Board, Temp, FinalRegister).
validDragLeft(_, _, _, Register, Register).

validDragRight(Row, Col, Board, Register, FinalRegister):-
	NextCol is Col + 1,
	getInfo(Row, NextCol, 0, Board),
	setInfo(Row, NextCol, 1, Register, Temp),
	validDragRight(Row, NextCol, Board, Temp, FinalRegister).
validDragRight(_, _, _, Register, Register).

validDragUpLeft(Row, Col, Board, Register, FinalRegister):-
	Row > 5,
	PrevRow is Row - 1,
	getInfo(PrevRow, Col, 0, Board),
	setInfo(PrevRow, Col, 1, Register, Temp),
	validDragUpLeft(PrevRow, Col, Board, Temp, FinalRegister).
validDragUpLeft(Row, Col, Board, Register, FinalRegister):-
	Row < 6,
	PrevCol is Col - 1,
	PrevRow is Row - 1,
	getInfo(PrevRow, PrevCol, 0, Board),
	setInfo(PrevRow, PrevCol, 1, Register, Temp),
	validDragUpLeft(PrevRow, PrevCol, Board, Temp, FinalRegister).
validDragUpLeft(_, _, _, Register, Register).

validDragUpRight(Row, Col, Board, Register, FinalRegister):-
	Row > 5,
	PrevRow is Row - 1,
	NextCol is Col + 1,
	getInfo(PrevRow, NextCol, 0, Board),
	setInfo(PrevRow, NextCol, 1, Register, Temp),
	validDragUpRight(PrevRow, NextCol, Board, Temp, FinalRegister).
validDragUpRight(Row, Col, Board, Register, FinalRegister):-
	Row < 6,
	PrevRow is Row - 1,
	getInfo(PrevRow, Col, 0, Board),
	setInfo(PrevRow, Col, 1, Register, Temp),
	validDragUpRight(PrevRow, Col, Board, Temp, FinalRegister).
validDragUpRight(_, _, _, Register, Register).

validDragDownLeft(Row, Col, Board, Register, FinalRegister):-
	Row < 5,
	NextRow is Row + 1,
	getInfo(NextRow, Col, 0, Board),
	setInfo(NextRow, Col, 1, Register, Temp),
	validDragDownLeft(NextRow, Col, Board, Temp, FinalRegister).
validDragDownLeft(Row, Col, Board, Register, FinalRegister):-
	Row > 4,
	NextRow is Row + 1,
	PrevCol is Col - 1,
	getInfo(NextRow, PrevCol, 0, Board),
	setInfo(NextRow, PrevCol, 1, Register, Temp),
	validDragDownLeft(NextRow, PrevCol, Board, Temp, FinalRegister).
validDragDownLeft(_, _, _, Register, Register).

validDragDownRight(Row, Col, Board, Register, FinalRegister):-
	Row < 5,
	NextRow is Row + 1,
	NextCol is Col + 1,
	getInfo(NextRow, NextCol, 0, Board),
	setInfo(NextRow, NextCol, 1, Register, Temp),
	validDragDownRight(NextRow, NextCol, Board, Temp, FinalRegister).
validDragDownRight(Row, Col, Board, Register, FinalRegister):-
	Row > 4,
	NextRow is Row + 1,
	getInfo(NextRow, Col, 0, Board),
	setInfo(NextRow, Col, 1, Register, Temp),
	validDragDownRight(NextRow, Col, Board, Temp, FinalRegister).
validDragDownRight(_, _, _, Register, Register).
%---------------------------------------------	
checkScore(Board, Result):-
	floodFill(Board, Result),
	formatAsJSON([Result]).
%---------------------------------------------
checkWinner(Board, Result):-
	winner(Board, Result, _),
	formatAsJSON([Result]).

:- server(8081).

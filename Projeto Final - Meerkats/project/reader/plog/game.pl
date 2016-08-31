%availableColors(['blue', 'red', 'green', 'yellow']).
availableColors([1, 2, 3, 4]).
availableStones([[15|blue],[15|red],[15|green],[15|yellow]]).
playerInfo([]).




playGame(NumberPlayers,NumberBots):- 	availableColors(Colors),
										assignBOTColor(NumberBots, Colors,5,FinalBOTsInfo,ResultColors),
										Humans is NumberPlayers - NumberBots,
										assignPlayerColor(Humans, ResultColors, 1, FinalPlayersInfo,_),
										append(FinalPlayersInfo, FinalBOTsInfo, FinalInfo),
										displayPrepareForTheGame(NumberPlayers),
										gameStart(FinalInfo).
							
displayPrepareForTheGame(N):-
	clearScreen,
	write('***************************************************'), nl,
	write('||                                               ||'), nl,
	write('||   Game will start after you press ENTER!      ||'), nl,	
	write('||                                               ||'), nl,
	format('||    There are ~d player in game! Good luck!     ||', [N]), nl,
	write('||                                               ||'), nl,
	write('***************************************************'), nl,
	getEnter.
							
					
					
%------------------------------------------------------------%
%------------------Sorting for Colors------------------------%
%------------------------------------------------------------%

assignBOTColor(0,Colors,_,[],Colors).

assignBOTColor(NumberBots, Colors, N, [NewInfo | ResultInfo], ResultColors):-
										Temp is NumberBots+4,
										N =< Temp,
										sortPlayerColor(N, Colors, NewInfo, RemainingColors),
										N1 is N + 1,
										assignBOTColor(NumberBots, RemainingColors, N1, ResultInfo, ResultColors).	

assignBOTColor(_, Colors, _, [], Colors).




assignPlayerColor(0,Colors,_,[],Colors).

assignPlayerColor(NumberPlayers, Colors, N, [[N| [Color | []]] | ResultInfo], ResultColors):-
										N =< NumberPlayers,
										sortPlayerColor(N, Colors, [N | [Color | []]] , RemainingColors),
										N1 is N + 1,
										assignPlayerColor(NumberPlayers, RemainingColors, N1, ResultInfo, ResultColors).			

assignPlayerColor(_, Colors, _, [], Colors).

sortPlayerColor(N, Colors, [N, Color], ResultColors):-
										length(Colors, Length),
										random(0, Length, Index),
										getColor(Index, Color, Colors, ResultColors).


getColor(_, _, [],[]).

getColor(Index, Color, [H|A], [H|NA]):- Index > 0,
									    Nindex is Index-1,
									    getColor(Nindex,Color,A,NA).

getColor(0, Color, [Color|A], A).


playerReadyForColorAssignment(N):-
	clearScreen,
	write('***************************************************'), nl,
	write('||                                               ||'), nl,
	format('||   Time for player ~d to sort his color.        ||', [N]), nl,	
	write('||                                               ||'), nl,
	write('||    Make sure your are the only one            ||'), nl,
	write('||    watching the result!!!                     ||'), nl,
	write('||                                               ||'), nl,
	write('||    Type Enter when you are ready!             ||'), nl,
	write('||                                               ||'), nl,
	write('***************************************************'), nl,
	getEnter.

playerColorScreen(N, Color):-
	clearScreen,
	write('***************************************************'), nl,
	write('||                                               ||'), nl,
	format('||   Player ~d, the color assigned to you was:    ||', [N]), nl,	
	write('||                                               ||'), nl,
	write('||                 '),
	ansi_format([bold,fg(Color)], ' ~s ', [Color]),
	(
		Color = blue -> write('                        ||');
		Color = green -> write('                       ||');
		Color = yellow -> write('                      ||');
		
		write('                         ||')
	), nl, 
	write('||                                               ||'), nl,
	write('***************************************************'), nl,
	getEnter.

	
	

gameStart(Players):- logicalBoard(LogicalBoard),
					displayBoard(Board),
					availableStones(Stones),
					startPlaying(Board,Stones,LogicalBoard,Players,Winner, 1),
					getPlayerColor(Players,[Color|_],Winner),
					displayWinner(Winner,Color).
					

displayWinner(Winner,Color):-
						Winner < 5,
						format('The Winner is: ~d -> ~w color!',[Winner,Color]),
						getEnter.
displayWinner(Winner,Color):-
						Winner > 4,
						WinnerBOT is Winner - 4,
						format('The Winner is: BOT ~d -> ~w color!',[WinnerBOT,Color]),
						getEnter.
							
							
showBoard():-
			logicalBoard(LogicalBoard),
			displayBoard(Board),
			drawBoard(Board,LogicalBoard).
		
startPlaying(Board,Stones,LogicalBoard,Players,Winner,Round):-
	/*Ver se todas as peças foram jogadas ou se existe um grupo de 15!*/
	/*---CODE--*/
	/*Joga uma vez completa com todos os jogadores!*/
	playRound(Board,Stones,LogicalBoard,Players,Players,ResultBoard,RemainingStones,Round,WinningPlayer),
	(
		WinningPlayer == 1 -> Winner is 1;
		WinningPlayer == 2 -> Winner is 2;
		WinningPlayer == 3 -> Winner is 3;
		WinningPlayer == 4 -> Winner is 4;
		WinningPlayer == 5 -> Winner is 5;
		WinningPlayer == 6 -> Winner is 6;
		WinningPlayer == 7 -> Winner is 7;
		WinningPlayer == 8 -> Winner is 8;

		startPlaying(Board,RemainingStones,ResultBoard,Players,Winner,2), !
	).
	
getPlayer([],_,0).
getPlayer([[Id|[Color|_]]|_], Color, Id). 	
getPlayer([_ | Tail],Color,Player):- getPlayer(Tail, Color, Player).

getPlayerColor([],nocolor,_).
getPlayerColor([[Id|Color]| _],Color,Id).
getPlayerColor([_| Tail],Color,Id):-getPlayerColor(Tail,Color,Id).




/*Faz uma jogada! Retornando o tabuleiro atual e as pedras restantes*/

playRound(_,_,LogicalBoard,[],_,LogicalBoard,_,_,Winner):- nonvar(Winner),(
																Winner == 1;
																Winner == 2;
																Winner == 3;
																Winner == 4;
																Winner == 5;
																Winner == 6;
																Winner == 7;
																Winner == 8
																),!.
		
playRound(_,Stones,LogicalBoard,[],_,LogicalBoard,Stones,_,_).
/*
playRound(_,Stones,LogicalBoard,[],_,LogicalBoard,Stones, _,2). 
playRound(_,Stones,LogicalBoard,[],_,LogicalBoard,Stones, _,3). 
playRound(_,Stones,LogicalBoard,[],_,LogicalBoard,Stones, _,4).
playRound(_,Stones,LogicalBoard,[],_,LogicalBoard,Stones, _,_).
 */
playRound(Board,Stones,LogicalBoard,[[H|_]|Tail],Players,ResultBoard,RemainingStones,1,Winner):-	
											drawBoard(Board, LogicalBoard),
											format('It is Player ~d turn!', [H]), nl,
											makePlay(Board,Stones,LogicalBoard,[[H|_]|Tail],Players,ResultBoard,RemainingStones,1,Winner), !.		

playRound(Board,Stones,LogicalBoard,[[H|_]|Tail],Players,ResultBoard,RemainingStones,2,Winner):-	
											drawBoard(Board, LogicalBoard),
											format('It is Player ~d turn!', [H]), nl,
											makePlay(Board,Stones,LogicalBoard,[[H|_]|Tail],Players,ResultBoard,RemainingStones,2,Winner), !.





/*Falta a play bot! só com players já funcemina! :D*/
makePlay(Board,Stones,LogicalBoard,[[H|_]|Tail],Players,ResultBoard,RemainingStones,N,Winner):-
		H > 4,
		playBot(Board,Stones,LogicalBoard,[[H|_]|Tail],Players,ResultBoard,RemainingStones,N,Winner), !.

makePlay(Board,Stones,LogicalBoard,[[H|_]|Tail],Players,ResultBoard,RemainingStones,N,Winner):-
		H < 5,
		playHuman(Board,Stones,LogicalBoard,[[H|_]|Tail],Players,ResultBoard,RemainingStones,N,Winner), !. 
		
		
		

/*A primeira jogada de todas*/
playHuman(Board,Stones,LogicalBoard,[_|Tail],Players,ResultBoard,RemainingStones,1,Winner):-
											withdrawStone(Stones,RemainingStones1,ChoosedStone),
											displayRemainingStones(RemainingStones1),
											getEmptyCell(LogicalBoard,RowIdentifier,RowPos),
											setInfo(RowIdentifier,RowPos,ChoosedStone,LogicalBoard,ResultBoard1),
											playRound(Board,RemainingStones1,ResultBoard1,Tail,Players,ResultBoard,RemainingStones, 2,Winner),!.
											
/*A segunda jogada e restantes jogadas*/										
playHuman(Board,Stones,LogicalBoard,[_|Tail],Players,ResultBoard,RemainingStones,2,Winner):-
											dropStone(LogicalBoard,Stones,RemainingStones1,RowIdentifier,RowPos,ResultBoard1),
											getWinningOnDrop(Board,RemainingStones1,ResultBoard1,Tail,Players,ResultBoard,RemainingStones,2,Winner,RowIdentifier,RowPos),!.
																					 						
playBot(Board,Stones,LogicalBoard,[[H|_]|Tail],Players,ResultBoard,RemainingStones,1,Winner):-
											dropStoneBOT(H,LogicalBoard,Stones,RemainingStones1,_,_,ResultBoard1),
											playRound(Board,RemainingStones1,ResultBoard1,Tail,Players,ResultBoard,RemainingStones, 2,Winner),!.

playBot(Board,Stones,LogicalBoard,[[H|_]|Tail],Players,ResultBoard,RemainingStones,2,Winner):-
											dropStoneBOT(H,LogicalBoard,Stones,RemainingStones1,RowIdentifier,RowPos,ResultBoard1),
											getWinningOnDropBOT(Board,RemainingStones1,ResultBoard1,Tail,Players,ResultBoard,RemainingStones,2,Winner,RowIdentifier,RowPos),!.											





dropStone(LogicalBoard,Stones,RemainingStones1,RowIdentifier,RowPos,ResultBoard1):-
			withdrawStone(Stones,RemainingStones1,ChoosedStone),
			displayRemainingStones(RemainingStones1),
			getEmptyCell(LogicalBoard,RowIdentifier,RowPos),
			setInfo(RowIdentifier,RowPos,ChoosedStone,LogicalBoard,ResultBoard1).



getWinningOnDrop(_,_,FinalBoard,_,Players,_,_,2,ID,_,_):-
			winner(FinalBoard, [H|_], 15),
			getPlayer(Players,H,ID),
			ID \= 0.
			
getWinningOnDrop(_,RemainingStones1,FinalBoard,_,Players,_,_,2,ID,_,_):-
			getStoneNumber(RemainingStones1,red,Number1),
			getStoneNumber(RemainingStones1,green,Number2),
			getStoneNumber(RemainingStones1,blue,Number3),
			getStoneNumber(RemainingStones1,yellow,Number4),
			Number is Number1 + Number2 + Number3 + Number4,
			Number == 0,
			winner(FinalBoard, [H|_], _),
			getPlayer(Players,H,ID).
			
			

getWinningOnDrop(Board,RemainingStones1,FinalBoard,Tail,Players,ResultBoard,RemainingStones,2,Winner,RowIdentifier,RowPos):-
			drawBoard(Board, FinalBoard),
			dragStone(FinalBoard,RowIdentifier,RowPos,FinalBoard1),
			getWinningOnDrag(Board,RemainingStones1,FinalBoard1,Tail,Players,ResultBoard,RemainingStones,2,Winner,RowIdentifier,RowPos), !.



getWinningOnDrag(_,_,FinalBoard,_,Players,_,_,2,ID,_,_):-
			winner(FinalBoard, [H|_], 15),
			getPlayer(Players,H,ID),
			ID \= 0.

getWinningOnDrag(Board,RemainingStones1,FinalBoard,Tail,Players,ResultBoard,RemainingStones,2,Winner,_,_):-
			playRound(Board,RemainingStones1,FinalBoard,Tail,Players,ResultBoard,RemainingStones,2,Winner), !.

					
									
											

/*Retorna o numero total de stones existente*/
getTotalStoneNumber([],0).


getTotalStoneNumber([[H|_]|Tail],Sum):-
					getTotalStoneNumber(Tail,Rest),
					Sum is H + Rest.
								
								
/**********************************************************************************************************************************/
		
																		
checkDrag(LogicalBoard,InitialCoord1,InitialCoord2,1,NumberCells,FinalRow,FinalCol):-
									checkDragDiagonalUpLeft(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol).

checkDrag(LogicalBoard,InitialCoord1,InitialCoord2,2,NumberCells,FinalRow,FinalCol):-
									checkDragDiagonalUpRight(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol).

checkDrag(LogicalBoard,InitialCoord1,InitialCoord2,3,NumberCells,FinalRow,FinalCol):-
									checkDragRight(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol).

checkDrag(LogicalBoard,InitialCoord1,InitialCoord2,4,NumberCells,FinalRow,FinalCol):-
									checkDragDiagonalDownRight(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol). 

checkDrag(LogicalBoard,InitialCoord1,InitialCoord2,5,NumberCells,FinalRow,FinalCol):-									
									checkDragDiagonalDownLeft(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol).

checkDrag(LogicalBoard,InitialCoord1,InitialCoord2,6,NumberCells,FinalRow,FinalCol):-	
									checkDragLeft(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol).


checkDragDiagonalUpLeft(_,InitialCoord1,InitialCoord2,0,InitialCoord1,InitialCoord2).
checkDragDiagonalUpLeft(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol):- 	NewRow is InitialCoord1 - 1,
																									InitialCoord1 < 6,
																									NewCol is InitialCoord2 - 1,
																									validCell(NewRow,NewCol), !,
																									getInfo(NewRow, NewCol, Info, LogicalBoard),
																									Info == 0, !,
																									NewNumberCells is NumberCells - 1,
																									checkDragDiagonalUpLeft(LogicalBoard,NewRow,NewCol,NewNumberCells,FinalRow,FinalCol).

checkDragDiagonalUpLeft(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol):- 	NewRow is InitialCoord1 - 1,
																									InitialCoord1 > 5,
																									NewCol is InitialCoord2,
																									validCell(NewRow,NewCol), !,
																									getInfo(NewRow, NewCol, Info, LogicalBoard),
																									Info == 0, !,
																									NewNumberCells is NumberCells - 1,
																									checkDragDiagonalUpLeft(LogicalBoard,NewRow,NewCol,NewNumberCells,FinalRow,FinalCol).


checkDragDiagonalUpRight(_,InitialCoord1,InitialCoord2,0,InitialCoord1,InitialCoord2).
checkDragDiagonalUpRight(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol):- 	NewRow is InitialCoord1 - 1,
																									InitialCoord1 > 5,
																									NewCol is InitialCoord2 + 1,
																								 	validCell(NewRow,NewCol), !,
																								 	getInfo(NewRow,NewCol,Info,LogicalBoard),
																								 	Info == 0, !,
																								 	NewNumberCells is NumberCells - 1,
																								 	checkDragDiagonalUpRight(LogicalBoard,NewRow,NewCol,NewNumberCells,FinalRow,FinalCol).

checkDragDiagonalUpRight(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol):- 	NewRow is InitialCoord1 - 1,
																									InitialCoord1 < 6,
																									NewCol is InitialCoord2,
																								 	validCell(NewRow,NewCol), !,
																								 	getInfo(NewRow,NewCol,Info,LogicalBoard),
																								 	Info == 0, !,
																								 	NewNumberCells is NumberCells - 1,
																								 	checkDragDiagonalUpRight(LogicalBoard,NewRow,NewCol,NewNumberCells,FinalRow,FinalCol).


checkDragRight(_,InitialCoord1,InitialCoord2,0,InitialCoord1,InitialCoord2).
checkDragRight(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol):-	NewCol is InitialCoord2 + 1,
																				validCell(InitialCoord1,NewCol), !,
																				getInfo(InitialCoord1,NewCol,Info,LogicalBoard),
																				Info == 0, !,
																				NewNumberCells is NumberCells - 1,
																				checkDragRight(LogicalBoard,InitialCoord1,NewCol,NewNumberCells,FinalRow,FinalCol).


checkDragDiagonalDownRight(_,InitialCoord1,InitialCoord2,0,InitialCoord1,InitialCoord2).
checkDragDiagonalDownRight(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol):- 	NewRow is InitialCoord1 + 1,
																										InitialCoord1 < 5, 
																										NewCol is InitialCoord2+1,
																				 						validCell(NewRow,InitialCoord2), !,
																					 					getInfo(NewRow,NewCol,Info,LogicalBoard),
																					 					Info == 0, !,
																				 						NewNumberCells is NumberCells - 1,
																				 						checkDragDiagonalDownRight(LogicalBoard,NewRow,NewCol,NewNumberCells,FinalRow,FinalCol).


checkDragDiagonalDownRight(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol):- 	NewRow is InitialCoord1 + 1,
																										InitialCoord1 > 4,
																										NewCol is InitialCoord2,
																				 						validCell(NewRow,InitialCoord2), !,
																					 					getInfo(NewRow,NewCol,Info,LogicalBoard),
																					 					Info == 0, !,
																				 						NewNumberCells is NumberCells - 1,
																				 						checkDragDiagonalDownRight(LogicalBoard,NewRow,NewCol,NewNumberCells,FinalRow,FinalCol).

checkDragDiagonalDownLeft(_,InitialCoord1,InitialCoord2,0,InitialCoord1,InitialCoord2).
checkDragDiagonalDownLeft(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol):- NewRow is InitialCoord1 + 1,
																									InitialCoord1 > 4,
																									NewCol is InitialCoord2 - 1,
																									validCell(NewRow,NewCol), !,
																									getInfo(NewRow, NewCol, Info, LogicalBoard),
																									Info == 0, !,
																									NewNumberCells is NumberCells - 1,
																									checkDragDiagonalDownLeft(LogicalBoard,NewRow,NewCol,NewNumberCells,FinalRow,FinalCol).

checkDragDiagonalDownLeft(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol):- NewRow is InitialCoord1 + 1,
																									InitialCoord1 < 5,
																									NewCol is InitialCoord2,
																									validCell(NewRow,NewCol), !,
																									getInfo(NewRow, NewCol, Info, LogicalBoard),
																									Info == 0, !,
																									NewNumberCells is NumberCells - 1,
																									checkDragDiagonalDownLeft(LogicalBoard,NewRow,NewCol,NewNumberCells,FinalRow,FinalCol).


checkDragLeft(_,InitialCoord1,InitialCoord2,0,InitialCoord1,InitialCoord2).
checkDragLeft(LogicalBoard,InitialCoord1,InitialCoord2,NumberCells,FinalRow,FinalCol):-	NewCol is InitialCoord2 - 1,
																				validCell(InitialCoord1,NewCol), !,
																				getInfo(InitialCoord1,NewCol,Info,LogicalBoard),
																				Info == 0, !,
																				NewNumberCells is NumberCells - 1,
																				checkDragLeft(LogicalBoard,InitialCoord1,NewCol,NewNumberCells,FinalRow,FinalCol).
																				
																				
/*Message = valid ou invalid*/	

displayDirectionsList(Direction, NumberCells):- 	write('1 -> Up-Left     2 -> Up-Right     3 -> Right'),  nl,
													write('4 -> Down-Right  5 -> Down-Left    6 -> Left'), nl,
													write('Direction: '), getInteger(Direction), 
													Direction < 7,
													Direction > 0,
													displayGetNumberCells(NumberCells)
													;
													nl, write('Invalid Input. Try again'),
													displayDirectionsList(Direction, NumberCells).

displayGetNumberCells(NumberCells):-	write('Insert the number of cells you want to drag your stone: '), getInteger(NumberCells).
										


dragStone(LogicalBoard,PlayedStoneCoord1,PlayedStoneCoord2,ResultBoard):-
										write('What stone do you want to move?'),nl,
										getStoneCell(LogicalBoard,PlayedStoneCoord1,PlayedStoneCoord2,Initial1,Initial2),
										displayDirectionsList(Direction, NumberCells),
										checkDrag(LogicalBoard,Initial1,Initial2,Direction,NumberCells,Final1,Final2),
										getInfo(Initial1,Initial2,Stone,LogicalBoard),setInfo(Initial1,Initial2,empty,LogicalBoard,Res),setInfo(Final1,Final2,Stone,Res,ResultBoard);
										dragStone(LogicalBoard,PlayedStoneCoord1,PlayedStoneCoord2,ResultBoard).
	
/********************************************************/
	
	
	
chooseStone(ChoosedStone):-
							write('Write the stone you want to play!'),nl,
							write('1 -> red | 2 -> green | 3 -> blue | 4 -> yellow'),nl,
							getInteger(StoneID),(
							StoneID == 1 ->  ChoosedStone = red;
							StoneID == 2 ->  ChoosedStone = green;
							StoneID == 3 ->  ChoosedStone = blue;
							StoneID == 4 ->  ChoosedStone = yellow;
							write('Invalid stone name!'),nl,
							chooseStone(ChoosedStone)).
	
displayRemainingStones([[Blue | _] | [[Red | _] | [[Green | _] | [[Yellow| _]]]]]):- format('Remaing stones: ~d Blues, ~d Reds, ~d Greens and ~d Yellows.', [Blue, Red, Green, Yellow]), nl.

								
/*Faz a jogava correspondente a retirar uma peça das Stones que ainda restam e "retorna" as Stones que restam*/
withdrawStone(Stones,RemainingStones,StoneColor):-
									chooseStoneBOT(ChoosedStone),
									getStoneNumber(Stones,ChoosedStone,Number),
									Number > 0 ->write('Stone withdraw: '),write(ChoosedStone),nl, NewNum is Number -1,setStoneNumber(Stones,ChoosedStone,NewNum,RemainingStones),StoneColor = ChoosedStone;
									write('There are no more of those stones! Choose another one!'),nl,
									withdrawStone(Stones,RemainingStones,StoneColor).
									

/*Vê o numero de peças correspondentes a uma cor*/
/*getStoneNumber(Stones,ChoosedStone,Number)*/
getStoneNumber([[_|T]|Tail],ChoosedStone,Number):- 
												T \= ChoosedStone,
												getStoneNumber(Tail,ChoosedStone,Number).

												
getStoneNumber([[H|T]|_],ChoosedStone,Number):-  
												T == ChoosedStone,
												Number = H.
												
												
												
			
/*Faz set ao numero de peças da cor*/
/*setStoneNumber(Stones,ChoosedStone,Number,RemainingStones)*/	

setStoneNumber([],_,_,[]).
setStoneNumber([[H|A]|Tail],ChoosedStone,Number,[[H|A]|NA]):- 
	ChoosedStone \= A,
	setStoneNumber(Tail,ChoosedStone,Number,NA).
	
setStoneNumber([[_|A]|Tail],_,Number,[[Number|A]|Tail]).


		
/*-------------------------------------------------------------------------------------------*/											


	
getCoords(X,Y):-
		write('Get Coord1: '),nl,
		getInteger(X),
		write('Get Coord2: '),nl,
		getInteger(Y).
					
/*Esta funcção vê se as coordenadas são inteiros válidos entre 1 e 9*/	
getValidCoords(X,Y):-
				getCoords(X,Y),
				validCell(X,Y);
				write('Coordinates inserted are not valid!!! Please try again.'), nl,
				getValidCoords(X,Y). 
							



/*Esta função só termina quando existe um movimento válido*/	
getEmptyCell(Board,RowIdentifier,RowPos):-
	getValidCoords(Coord1,Coord2),
	getInfo(Coord1,Coord2,Info,Board),
	Info == empty -> RowIdentifier is Coord1,RowPos is Coord2;
	getEmptyCell(Board,RowIdentifier,RowPos).
	
	
/*Ve se o que está selecionado é uma peça*/	
getStoneCell(Board,PlayedStoneCoord1,PlayedStoneCoord2,RowIdentifier,RowPos):-
	getNotEqualCoords(PlayedStoneCoord1,PlayedStoneCoord2,Coord1,Coord2),
	getInfo(Coord1,Coord2,Info,Board),
	
	Info \= empty ->write('Valid move!'),nl, RowIdentifier is Coord1,RowPos is Coord2;
	write('Not a stone!'),nl,
	getStoneCell(Board,PlayedStoneCoord1,PlayedStoneCoord2,RowIdentifier,RowPos).	
/*-------------------------------------------------------------------------------------------*/											

getNotEqualCoords(Initial1,Initial2,ResCoord1,ResCoord2):-
											getValidCoords(C1,C2),
											compCoords(Initial1,Initial2,C1,C2,M),
											M == notEqual ->ResCoord1 is C1,ResCoord2 is C2;
											write('Cant move the stone you just played!'),nl,
											getNotEqualCoords(Initial1,Initial2,ResCoord1,ResCoord2).
											




%-------------------------------------------%
%--------------BOARD FUNCTIONS--------------$
%-------------------------------------------%



logicalBoard([
	            [0, 0, 0, 0, 0],
	         [0, 0, 0, 0, 0, 0],
	      [0, 0, 0, 0, 0, 0, 0],
	   [0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	   [0, 0, 0, 0, 0, 0, 0, 0],
	      [0, 0, 0, 0, 0, 0, 0],
	         [0, 0, 0, 0, 1, 0],
	            [0, 0, 0, 0, 0]

	]).

logicalBoardTest([
	            [1, 1, 1, 1, 1],
	         [1, 1, 1, 1, 1, 1],
	      [1, 1, 1, 1, 1, 1, 1],
	   [1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 0, 1, 1],
	   [1, 1, 1, 1, 1, 0, 1, 1],
	      [1, 1, 1, 1, 1, 1, 1],
	         [1, 1, 1, 1, 1, 1],
	            [1, 1, 1, 1, 1]

	]).
	
logicalBoardTest2([
	            [1, 0, 0, 0, 0],
	         [0, 0, 0, 0, 0, 0],
	      [0, 0, 0, 0, 0, 0, 0],
	   [0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	   [0, 0, 0, 0, 0, 0, 0, 0],
	      [0, 0, 0, 0, 0, 0, 0],
	         [0, 0, 0, 0, 1, 0],
	            [0, 0, 0, 0, 0]

	]).


displayBoard([
	            ['1', '2', '3', '4', '5'],
	          ['1', '2', '3', '4', '5', '6'],
	        ['1', '2', '3', '4', '5', '6', '7'],
	      ['1', '2', '3', '4', '5', '6', '7', '8'],
	   ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
	      ['1', '2', '3', '4', '5', '6', '7', '8'],
	        ['1', '2', '3', '4', '5', '6', '7'],
	          ['1', '2', '3', '4', '5', '6'],
	            ['1', '2', '3', '4', '5']
	]).

horizontalBottomBorders([
		'         -------------------------',
		'       -----------------------------',
		'     ---------------------------------',
		'   -------------------------------------',
		'   -------------------------------------',
		'     ---------------------------------',
		'       -----------------------------',
		'         -------------------------',
		'           ---------------------'
	]).

rowIdentifiers([' 1         |', ' 2       |', ' 3     |', ' 4   |', ' 5 |', ' 6   |', ' 7     |', ' 8       |', ' 9         |']).



drawBoard(Board, LogicalBoard):- 
			printTopBorder, nl,
			rowIdentifiers(RowsIndexes),
			horizontalBottomBorders(BottomBorders),
			printBoardRows(Board, LogicalBoard, RowsIndexes, BottomBorders).

printBoardRows([], [], [], []).

printBoardRows([Head | Tail], [LHead | LTail], [RHead | RTail], [BHead | BTail]):- 
						write(RHead), printBoardRow(Head, LHead),
						nl, write(BHead), 
						nl,	printBoardRows(Tail, LTail, RTail, BTail).

printBoardRow([], []).

printBoardRow([Head | Tail], [LHead | LTail]):- 
			printCell(Head, LHead),
			write('|'),
			printBoardRow(Tail, LTail).
			
printCell(Element, LogicalElement):- 
			LogicalElement = empty   -> format(' ~w ', [Element]);
			LogicalElement = blue    -> ansi_format([bold,fg(blue)], ' ~w ', [Element]);
			LogicalElement = yellow  -> ansi_format([bold,fg(yellow)], ' ~w ', [Element]);
			LogicalElement = red     -> ansi_format([bold,fg(red)], ' ~w ', [Element]);
			LogicalElement = green   -> ansi_format([bold,fg(green)], ' ~w ', [Element]).


printTopBorder:- write('           ---------------------').


%------------------------------------%
%-----------Winner Calculator--------%
%------------------------------------%

winner(L, W, A):-
				floodFill(L, R),
				calculateWinner(R, W, A).

winner(_, [0], 0).

calculateWinner(Result, Winner, AreaResult):-	getMainGroups(Result, 16, Winner, AreaResult), !.




getMainGroups(Result, MaxValue, ColorResult, Area):- 	findMaxAreaValue(Result, MaxValue, AreaResult),	%retorna o valor da maior area ate MaxValue unidades
												getCorrespondentTeam(Result, _, AreaResult, X), %retorna lista com as cores com areas da dimensao de AreaResult
												length(X, Length),
												(
													Length > 1 -> NewMax is AreaResult, getMainGroups(Result, NewMax, ColorResult, Area);
													Length == 1 ->  append([], X, ColorResult), Area is AreaResult;
													Length == 0 ->  append([], [], ColorResult), Area is AreaResult
												). 
												

findMaxAreaValue([[_ | [Blue | _]] | [[_ | [Red | _]] | [[_ | [Green| _]] | [[_ | [Yellow |_]]]]]], MaxValue, AreaResult):-	findMax(Blue, MaxValue, 0, RB),
																															findMax(Red, MaxValue, 0, RR),
																															findMax(Green, MaxValue, 0, RG),
																															findMax(Yellow, MaxValue, 0, RY),
																															findMax([RB, RR, RG, RY], 16, 0, AreaResult).

findMax([], _, Result, Result).

findMax([Head | Tail], MaxValue, Min, Result):- Head > Min,
												Head < MaxValue,
												findMax(Tail, MaxValue, Head, Result), !.


findMax([_ | Tail], MaxValue, Min, Result):- findMax(Tail, MaxValue, Min, Result), !.

getCorrespondentTeam([], [], _, []).


getCorrespondentTeam([Head | Tail] , [Head | FinalResult], AreaResult, [Color | ColorResult]):- checkMember(AreaResult, Head, Color), !, 
																								getCorrespondentTeam(Tail, FinalResult, AreaResult, ColorResult), !.

getCorrespondentTeam([[Color | [_]] | Tail] , [[Color | [[]]] | FinalResult], AreaResult, ColorResult):- getCorrespondentTeam(Tail, FinalResult, AreaResult, ColorResult), !.

checkMember(Value, [Result | [Tail | _]], Result):- member(Value, Tail).





%------------------------------------%
%-------------FloodFill--------------%
%------------------------------------%

registBoard([
	            [0, 0, 0, 0, 0],
	          [0, 0, 0, 0, 0, 0],
	        [0, 0, 0, 0, 0, 0, 0],
	       [0, 0, 0, 0, 0, 0, 0, 0],
	     [0, 0, 0, 0, 0, 0, 0, 0, 0],
	      [0, 0, 0, 0, 0, 0, 0, 0],
	        [0, 0, 0, 0, 0, 0, 0],
	          [0, 0, 0, 0, 0, 0],
	            [0, 0, 0, 0, 0]
	]).


floodFill(L,R):-
				flood(1, Rb, L),
				flood(2, Rr, L),
				flood(3, Rg, L),
				flood(4, Ry, L),
				append([Rb], [Rr], R1), append([Rg], [Ry], R2), append(R1, R2, R).

flood(Color, Result, LogicalBoard):- 	registBoard(RegistBoard),
										searchNextColorOcurrence(1, 1, LogicalBoard, RegistBoard, Color, [Row | [Col | _]]),
										searchColorGroups(Row, Col, Color, LogicalBoard, RegistBoard, R),
										append([Color], [R], Result), !.

searchColorGroups(9, 6, _, _, _, []).

searchColorGroups(Row, Col, Color, LogicalBoard, RegistBoard, [FinalArea | Result]):- 	calculateArea(Row, Col, Color, RegistBoard, LogicalBoard, FinalArea, LastRegistBoard),
																						searchNextColorOcurrence(Row, Col, LogicalBoard, LastRegistBoard, Color, [R | [C | _]]),
																						searchColorGroups(R, C, Color, LogicalBoard, LastRegistBoard, Result).

calculateArea(Row, Col, Color, RegistBoard, LogicalBoard, FinalArea, FinalRegistBoard):-validCell(Row, Col),
																						visitedCell(Row, Col, RegistBoard, Visited),
																						Visited = 0,
																						checkForColor(Row, Col, NewColor, LogicalBoard),
																						NewColor = Color,
																						setVisitedCell(Row, Col, RegistBoard, NewRegistBoard),
																						calculateUpperLeft(Row, Col, Color, NewRegistBoard, LogicalBoard, A1, FR1),
																						calculateUpperRight(Row, Col, Color, FR1, LogicalBoard, A2, FR2),
																						calculateRight(Row, Col, Color, FR2, LogicalBoard, A3, FR3),
																						calculateDownRight(Row, Col, Color, FR3, LogicalBoard, A4, FR4),
																						calculateDownLeft(Row, Col, Color, FR4, LogicalBoard, A5, FR5),
																						calculateLeft(Row, Col, Color, FR5, LogicalBoard, A6, FinalRegistBoard),
																						FinalArea is 1+A1+A2+A3+A4+A5+A6, !.


calculateArea(_, _, _, RegistBoard, _, 0, RegistBoard).



calculateUpperLeft(Row, Col, Color, RegistBoard, LogicalBoard, A, FR):-
					Row > 5, NewRow is Row - 1, calculateArea(NewRow, Col, Color, RegistBoard, LogicalBoard, A, FR).
calculateUpperLeft(Row, Col, Color, RegistBoard, LogicalBoard, A, FR):-					
					NewRow is Row - 1, NewCol is Col - 1, calculateArea(NewRow, NewCol, Color, RegistBoard, LogicalBoard, A, FR).

calculateUpperRight(Row, Col, Color, RegistBoard, LogicalBoard, A, FR):-
					Row > 5, NewRow is Row - 1, NewCol is Col + 1, calculateArea(NewRow, NewCol, Color, RegistBoard, LogicalBoard, A, FR).
calculateUpperRight(Row, Col, Color, RegistBoard, LogicalBoard, A, FR):-					
					NewRow is Row - 1, calculateArea(NewRow, Col, Color, RegistBoard, LogicalBoard, A, FR).

calculateRight(Row, Col, Color, RegistBoard, LogicalBoard, A, FR):-
					NewCol is Col + 1, calculateArea(Row, NewCol, Color, RegistBoard, LogicalBoard, A, FR).

calculateDownRight(Row, Col, Color, RegistBoard, LogicalBoard, A, FR):-
					Row > 4, NewRow is Row + 1, calculateArea(NewRow, Col, Color, RegistBoard, LogicalBoard, A, FR).
calculateDownRight(Row, Col, Color, RegistBoard, LogicalBoard, A, FR):-					
					NewRow is Row + 1, NewCol is Col + 1, calculateArea(NewRow, NewCol, Color, RegistBoard, LogicalBoard, A, FR).

calculateDownLeft(Row, Col, Color, RegistBoard, LogicalBoard, A, FR):-
					Row > 4, NewRow is Row + 1, NewCol is Col - 1, calculateArea(NewRow, NewCol, Color, RegistBoard, LogicalBoard, A, FR).
calculateDownLeft(Row, Col, Color, RegistBoard, LogicalBoard, A, FR):-					
					NewRow is Row + 1, calculateArea(NewRow, Col, Color, RegistBoard, LogicalBoard, A, FR).

calculateLeft(Row, Col, Color, RegistBoard, LogicalBoard, A, FR):-
					NewCol is Col - 1, calculateArea(Row, NewCol, Color, RegistBoard, LogicalBoard, A, FR).




searchNextColorOcurrence(9, 6, _, _, _, [9, 6]).

searchNextColorOcurrence(Row, Col, LogicalBoard, RegistBoard, Color, Result):-	not(validCell(Row, Col)),
																				NewRow is Row+1,
																				searchNextColorOcurrence(NewRow, 1, LogicalBoard, RegistBoard, Color, Result).
																				

searchNextColorOcurrence(Row, Col, LogicalBoard, RegistBoard, Color, Result):- 	search(Row, Col, LogicalBoard, Color, [R | [C | _]]),
																				visitedCell(R, C, RegistBoard, 0),
																				append([R], [C], Result).


searchNextColorOcurrence(Row, Col, LogicalBoard, RegistBoard, Color, Result):- 	search(Row, Col, LogicalBoard, Color, _), 
																				NextCol is Col + 1,
																				searchNextColorOcurrence(Row, NextCol, LogicalBoard, RegistBoard, Color, Result).



visitedCell(Row, Col, RegistBoard, Visited):-	getInfo(Row, Col, Visited, RegistBoard).

visitedCell(9, 6, _, 0).

setVisitedCell(Row, Col, RegistBoard, FinalRegistBoard):- setInfo(Row, Col, 1, RegistBoard, FinalRegistBoard).
					
checkForColor(Row, Col, Color, Board):- getInfo(Row, Col, Color, Board).


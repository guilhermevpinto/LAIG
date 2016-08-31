
clearScreen :- write('\33\[2J').

getChar(Input) :- 
				get_char(Input),
				get_char(_).
					

getInteger(Input) :-	get_code(Code),
						Input is Code - 48,
						get_char(_).

getEnter :-	get_char(_).

startSeed:-
	now(Usec), Seed is Usec mod 30269,
	getrand(random(X, Y, Z, _)),
	setrand(random(Seed, X, Y, Z)), !.
	
	


%----------------------------------------------------------------------------%
%------------------------------Compare Coordinates---------------------------%
%----------------------------------------------------------------------------%
																
compCoords(X1,_,X2,_,notEqual):-
						X1 \= X2.		
compCoords(_,Y1,_,Y2,notEqual):-
						Y1 \= Y2.						
											
compCoords(X1,Y1,X2,Y2,equal):-
						X1 == X2,
						Y1 == Y2.	



%----------------------------------------------------------------------------%
%----------------Grabs all the stone cells on the board----------------------%
%----------------------------------------------------------------------------%


getColorCells(Board,Row,Pos,[], Color):- search(Row, Pos, Board, Color, [X | [Y]]),
									X == 9, Y == 6.

getColorCells(Board,Row,Pos,[[X|Y] | ResultBoard], Color):-
											search(Row, Pos, Board, Color, [X | [Y]]),
											NewRow is X, NewPos is Y + 1,
											getColorCells(Board,NewRow,NewPos,ResultBoard, Color).



getColorCells(_,_,_,[], _).

%----------------------------------------------------------------------------%
%----------------Grabs all the empty cells on the board----------------------%
%----------------------------------------------------------------------------%

getEmptyCells(Board,Row,Pos,[]):- search(Row, Pos, Board, empty, [X | [Y]]),
									X == 9, Y == 6.

getEmptyCells(Board,Row,Pos,[[X|Y] | ResultBoard]):-
											search(Row, Pos, Board, empty, [X | [Y]]),
											NewRow is X, NewPos is Y + 1,
											getEmptyCells(Board,NewRow,NewPos,ResultBoard).



getEmptyCells(_,_,_,[]).





%----------------------------------------------------------------------------%
%-----Functions to get any info from a certain position of any matrix--------%
%----------------------------------------------------------------------------%
%getInfo(X,Y,Info,Board)
%getLineInfo(X,Row,Info)


getLineInfo(Pos,[H|T],Info):-
						Pos > 1,
						NewPos is Pos - 1,
						getLineInfo(NewPos,T,Info);
						Info = H.
						
getInfo(0, 1, Head, [Head | _]).

getInfo(0, Col, Info, [_ | Tail]):-	NewCol is Col - 1,
									getInfo(0, NewCol, Info, Tail).

getInfo(1, Col, Info, [Head | _]):- getInfo(0, Col, Info, Head).

getInfo(Row, Col, Info, [_ | Tail]):- 	NextRow is Row - 1,
										getInfo(NextRow, Col, Info, Tail).

%----------------------------------------------------------------------------%
%-----Functions to set any info into a certain position of any matrix--------%
%----------------------------------------------------------------------------%
%setInfo(X,Y,Info,Board,ResultBoard)

setInfo(0, 1, Info, [_ | Tail],  [Info | Tail]).

setInfo(0, Col, Info, [Head | Tail], [Head | RTail]):-	NewCol is Col - 1,
											setInfo(0, NewCol, Info, Tail, RTail).

setInfo(1, Col, Info, [Head | Tail], [RHead | Tail]):- setInfo(0, Col, Info, Head, RHead).

setInfo(Row, Col, Info, [Head | Tail], [Head | RTail]):-	NewRow is Row - 1,
															setInfo(NewRow, Col, Info, Tail, RTail), !.							

%----------------------------------------------------------------------------%
%-----Functions to search for a certain Element on a matrix------------------%
%----------------------------------------------------------------------------%

search(9, 6, _, _, [9, 6]).

search(Row, Col, LogicalBoard, Element, [Row, Col]):-	validCell(Row, Col),
														getInfo(Row, Col, NewElement, LogicalBoard),
														Element = NewElement, !.

search(Row, Col, LogicalBoard, Element, Result):- 	not(validCell(Row, Col)),
													NewRow is Row + 1,
													search(NewRow, 1, LogicalBoard, Element, Result), !.

search(Row, Col, LogicalBoard, Element, Result):-	validCell(Row, Col),
													NewCol is Col + 1,
													search(Row, NewCol, LogicalBoard, Element, Result), !.


%------------------------------------------------------------------------------------------%
%-----Functions to get for a certain Element on a matrix given a position------------------%
%------------------------------------------------------------------------------------------%

getIndexInfo([Info | _], 1, Info).

getIndexInfo([_ | Tail], Index, Info):- NewIndex is Index - 1, getIndexInfo(Tail, NewIndex, Info).
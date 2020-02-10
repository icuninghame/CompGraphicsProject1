# COMP4471 Computer Graphics Project 1: Super Bug Zapper

Due Date: February 14, 2020

Using WebGL and JavaScript (but not three.js), and the mathematics package that comes with the textbook, develop a two dimensional interactive game with the following features:

1.	The playing field starts as a circular disk centered at the origin.
2.	The player views the disk from above.
3.	Bacteria grow on the circumference of the disk starting at an arbitrary spot on the circumference and growing out uniformly in each direction from that spot at a speed determined by the game.
4.	The player needs to eradicate the bacteria by placing the mouse over the bacteria and hitting a button.
5.	The effect of the poison administered is to immediately remove the poisoned bacteria.
6.	The game can randomly generate up to a fixed number (say 10) different bacteria (each a different color).
7.	The bacteria appear as a crust on the circumference of the disk.
8.	The game gains points through the delays in the user responding and by any specific bacteria reaching a threshold (for example a 30 degree arc).
9.	The player wins if all bacteria are poisoned before any two different bacteria reach the threshold mentioned above.

A well-developed implementation for the above will earn a grade of 80%. To get higher grade, two of the following should be completed in addition (each feature successfully completed adds 10%).
1.	The effect of the poison administered also propagates outward from the point of insertion of the position until all the bacteria are destroyed.
2.	When two bacteria cultures collide, the first one to appear on the circumference dominates and consumes the later generated bacteria.
3.	When a bacterial culture is hit, use a simple 2D particle system to simulate an explosion at the point where the poison is administered.

Notes:
1.	A class demonstration is required for each game (demo on podium machine in classroom).
2.	Students may work in teams of up to three.

Electronic submission of source code and documentation will be through myCourseLink:
1.	Submit ONE compressed file (.zip only).
2.	This .zip file should contain all your source files plus the files specified in 3 below and the files should be correctly placed so that the program runs from a browser.
3.	Include in your submission two .doc (or .docx or .pdf) files: one for a user guide and one for a gallery of screen captures (with at most a 3 line explanation of each image). The screen captures should be complete and illustrate all aspects of the project requirements sufficient for marking needs.

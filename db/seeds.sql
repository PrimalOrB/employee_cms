INSERT INTO departments ( name )
VALUES ("Sales"),
("Engineering"),
("Legal"),
("Finance"),
("HR"),
("QC"),
("Management");

INSERT INTO roles ( title, salary, department_id )
VALUES ("Sales Lead", 100000, 1),
("Salesperson", 80000, 1),
("Lead Engineer", 150000, 2),
("Software Engineer", 120000, 2),
("Junior Engineer", 90000, 2),
("Legal Team Lead", 250000, 3),
("Lawyer", 190000, 3),
("Accountant", 125000, 4),
("Human Resources Lead", 140000, 5),
("Quality Control Team Lead", 200000, 6),
("Quality Control Technician", 120000, 6),
("CEO", 400000, 7),
("CFO", 300000, 7),
("CTO", 300000, 7),
("GM", 300000, 7);



INSERT INTO employees ( first_name, last_name, role_id, manager_id )
VALUES 
( "Austin",     "Powers",       12, null    ), 
( "Tyler",      "Bigglesworth", 13, 1       ), 
( "Foxy",       "Cleopatra",    14, 1       ), 
( "Jonny",      "Nonny",        15, 1       ),
( "John",       "Doe",          1,  4       ), 
( "Billy",      "Joel",         2,  5       ), 
( "Muhammad",   "Ali",          3,  3       ), 
( "George",     "Dubya",        4,  7       ),  
( "Derek",      "Zoolander",    4,  7       ),  
( "Hansel",     "Gretel",       5,  7       ),  
( "Zooey",      "Doodle",       6,  3       ),
( "Ronald",     "Weasley",      7,  11      ), 
( "Ginny",      "Weasley",      7,  11      ), 
( "John",       "Wick",         8,  2       ), 
( "Barry",      "Allen",        9,  4       ), 
( "Tony",       "Stark",        10, 4       ), 
( "Tom",        "Holland",      11, 16      );
    // load inquirer
const inquirer = require( 'inquirer' );
    // load db
const db = require( '../db/connection' );
    // load console.table
const cTable = require('console.table');

    // initial menu
function initial() {
    return inquirer.prompt( [
        {
            type: 'list',
            name: "action",
            message: "When would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update an employee role"
            ]
        }
    ]).then( data => {
            // switch statement casing the choices from above
        switch ( data.action ){
        case "View all departments":
            viewDepartments();
            break;
        case "View all roles":
            viewRoles();
            break;
        case "View all employees":
            viewEmployees();
            break;
        case "Add a department":
            addDepartment();
            break;
        case "Add a role":
            addRole();
            break;
        }
    })
};

    // view all departments
function viewDepartments() {
        // query string
    db.promise().query(`SELECT departments.id,
                        departments.name,
                        COUNT(roles.id) AS department_roles
                    FROM departments
                    LEFT JOIN roles
                    ON departments.id = roles.department_id
                    GROUP BY departments.id;`)
        .then( ([rows,fields]) => {
                // display in table
            console.table( rows )
                // return to menu
            initial();
        })
        .catch( err => {
            console.log( err );
        } );
};

    // view all roles
function viewRoles() {
        // query string
    db.promise().query(`SELECT roles.id, 
                        roles.title AS role_title,
                        departments.name AS department,
                    COUNT(employees.id) AS employee_count 
                    FROM roles
                    LEFT JOIN departments
                    ON roles.department_id = departments.id
                    LEFT JOIN employees
                    ON roles.id = employees.role_id
                    GROUP BY roles.id
                    ORDER BY roles.id;`)
       .then( ([rows,fields]) => {
                // display in table
            console.table( rows )
                // return to menu
            initial();
       })
       .catch( err => {
           console.log( err );
       } );
};

    // view all employees
function viewEmployees() {
        // query string
    db.promise().query(`SELECT employees.id, 
                            concat(employees.first_name,' ',employees.last_name) AS name, 
                            roles.title AS job_title, 
                            departments.name AS department, 
                            CONCAT('$',FORMAT(roles.salary, 'c')) AS salary,
                            concat( managers.first_name, ' ', managers.last_name ) AS manager
                        FROM employees
                        LEFT JOIN employees AS managers
                        ON employees.manager_id = managers.id
                        LEFT JOIN roles
                        ON employees.role_id = roles.id
                        LEFT JOIN departments
                        ON roles.department_id = departments.id;`)
       .then( ([rows,fields]) => {
                // display in table
           console.table( rows )
                // return to menu
           initial();
       })
       .catch( err => {
           console.log( err );
       } );
};

    // add new department
function addDepartment() {
    return inquirer.prompt( [
        {
            type: 'text',
            name: "department",
            message: "What department would you like to add?",
            validate: input => { // validate that an input has been entered
                if( input ) {
                    return true
                } else {
                    console.log( 'Enter a department name' )
                    return false
                }
            }
        }
    ] )
    .then( data => {
            // collect response as string
        const department = Object.values(data)[0]
            // query string
        db.promise().query(`INSERT INTO departments ( name ) VALUES ( ? )`, [ department ])
           .then( ([rows,fields]) => {
                    // display confirmation
               console.log( `------------------
${rows.affectedRows} department added
------------------` )
                    // return to menu
               initial();
           })
           .catch( err => {
               console.log( err );
           } );
    })

};

    // add new role
function addRole() {
    const roles = []
        // collect department names from database for choices in inquirer prompt
    db.promise().query(`SELECT name,id FROM departments;`)
        .then( ([rows,fields]) => {
            // create empty array
        const choices = []   
            // push choices into array
        rows.forEach( entry => choices.push( Object.values(entry)[0] ))
            // push results into array to search for ID after selection
        rows.forEach( entry => roles.push( {id: Object.values(entry)[1], department: Object.values(entry)[0] } ) )
            // return to menu
         return inquirer.prompt( [
                {
                    type: 'text',
                    name: "role",
                    message: "What role would you like to add?",
                    validate: input => { // validate that an input has been entered
                        if( input ) {
                            return true
                        } else {
                            console.log( 'Enter a role name' )
                            return false
                        }
                    }
                },
                {
                    type: 'list',
                    name: 'department',
                    message: "What department does this belong to?",
                    choices: choices,
                    validate: input => {
                        if( input.length === 1 ) { // check for length of 1 to validate single selection
                            return true
                        } else {
                            console.log( 'Select a department!' )
                            return false
                        }
                    }
                },
                {
                    type: 'text',
                    name: 'salary',
                    message: "What salaray does this role offer?",
                    validate: input => {
                        if( !input === NaN || input > 0 ) {
                            return true
                        } else {
                            console.log( 'Enter a salary value!' )
                            return false
                        }
                    }
                }
            ] )
        })
        .then( data => {
                // collect ID of department by
            const departmentID = roles.filter( x => x.department === data.department)
            db.promise().query(`INSERT INTO roles ( title, salary, department_id ) VALUES ( ?, ?, ? )`, [ data.role, data.salary, departmentID[0].id ])
           .then( ([rows,fields]) => {
                    // display confirmation
               console.log( `------------------
${rows.affectedRows} role added
------------------` )
                    // return to menu
               initial();
           })
           .catch( err => {
               console.log( err );
           } );
        })
        .catch( err => {
            console.log( err );
        } );
};

module.exports = initial;


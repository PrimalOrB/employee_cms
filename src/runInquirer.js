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

module.exports = initial;


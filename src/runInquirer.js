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
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update an employee role",
                "Update an employee manager",
                "View employees by manager"
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
        case "Add an employee":
            addEmployee();
            break;
        case "Update an employee role":
            updateEmployeeRole();
            break;
        case "Update an employee manager":
            updateEmployeeManager();
            break;
        case "View employees by manager":
            viewEmployeesByManager();
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
    const departments = []
        // collect department names from database for choices in inquirer prompt
    db.promise().query(`SELECT name,id FROM departments;`)
        .then( ([rows,fields]) => {
            // create empty array
        const choices = []   
            // push choices into array
        rows.forEach( entry => choices.push( Object.values(entry)[0] ))
            // push results into array to search for ID after selection
        rows.forEach( entry => departments.push( {id: Object.values(entry)[1], department: Object.values(entry)[0] } ) )
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
            const departmentID = departments.filter( x => x.department === data.department)
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

    // add new employee
function addEmployee() {
        // create empty array to store roles
    const roles = []
        // create array to store employees with a default 'None'
    const employees = [{id: null, name: 'None'}]
        // collect employeed list for selecting manager
    db.promise().query(`SELECT concat(first_name,' ',last_name) AS name,id FROM employees;`)
        .then( ([rows,fields]) => {
                // create array with default 'None'
            const managerList = ['None']
                // push choices into array
            rows.forEach( entry => managerList.push( Object.values(entry)[0] ))
                // populate list for manager selection
            rows.forEach( entry => employees.push( {id: Object.values(entry)[1], name: Object.values(entry)[0] } ) )
                // collect roles for selection in the inquirer prompts
            db.promise().query(`SELECT title,id FROM roles;`)
                .then( ([rows,fields]) => {
                        // create empty array
                    const roleList = []   
                        // push choices into array
                    rows.forEach( entry => roleList.push( Object.values(entry)[0] ))
                        // push results into array to search for ID after selection
                    rows.forEach( entry => roles.push( {id: Object.values(entry)[1], title: Object.values(entry)[0] } ) )
                        // return to menu
                        return inquirer.prompt( [
                            {
                                type: 'text',
                                name: "first_name",
                                message: "Enter first name",
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
                                type: 'text',
                                name: "last_name",
                                message: "Enter last name",
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
                                name: 'title',
                                message: "Select a role",
                                choices: roleList,
                                validate: input => {
                                    if( input.length === 1 ) { // check for length of 1 to validate single selection
                                        return true
                                    } else {
                                        console.log( 'Select a role!' )
                                        return false
                                    }
                                }
                            },
                            {
                                type: 'list',
                                name: 'manager',
                                message: "Does the employee have a manager?",
                                choices: managerList,
                                validate: input => {
                                    if( input.length === 1 ) { // check for length of 1 to validate single selection
                                        return true
                                    } else {
                                        console.log( 'Select a manager!' )
                                        return false
                                    }
                                }
                            }
                        ] )
                    })
                    .then( data => {
                            // collect role match
                        const roleID = roles.filter( x => x.title === data.title)
                            // collect employee match from manager selection
                        const managerId = employees.filter( x => x.name === data.manager)
                        console.log( data, roleID[0].id, managerId[0].id)
                        db.promise().query(`INSERT INTO employees ( first_name, last_name, role_id, manager_id ) VALUES ( ?, ?, ?, ? )`, [ data.first_name, data.last_name,  roleID[0].id, managerId[0].id ])
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
        })
};

    // update employee role
function updateEmployeeRole() {
        // create empty array to store roles
    const roles = []
        // create empty array
    const employees = []
        // collect employeed list for selecting manager
    db.promise().query(`SELECT concat(first_name,' ',last_name) AS name,id FROM employees;`)
        .then( ([rows,fields]) => {
                // create empty array
            const employeeList = []
                // push choices into array
            rows.forEach( entry => employeeList.push( Object.values(entry)[0] ))
                // populate list for manager selection
            rows.forEach( entry => employees.push( {id: Object.values(entry)[1], name: Object.values(entry)[0] } ) )
                // collect roles for selection in the inquirer prompts
            db.promise().query(`SELECT title,id FROM roles;`)
                .then( ([rows,fields]) => {
                        // create empty array
                    const roleList = []   
                        // push choices into array
                    rows.forEach( entry => roleList.push( Object.values(entry)[0] ))
                        // push results into array to search for ID after selection
                    rows.forEach( entry => roles.push( {id: Object.values(entry)[1], title: Object.values(entry)[0] } ) )
                        // return to menu
                        return inquirer.prompt( [
                            {
                                type: 'list',
                                name: 'employee',
                                message: "Which employee role do you want to update?",
                                choices: employeeList,
                                validate: input => {
                                    if( input.length === 1 ) { // check for length of 1 to validate single selection
                                        return true
                                    } else {
                                        console.log( 'Select an employee!' )
                                        return false
                                    }
                                }
                            },
                            {
                                type: 'list',
                                name: 'title',
                                message: "Select a new role",
                                choices: roleList,
                                validate: input => {
                                    if( input.length === 1 ) { // check for length of 1 to validate single selection
                                        return true
                                    } else {
                                        console.log( 'Select a role!' )
                                        return false
                                    }
                                }
                            }
                        ] )
                    })
                    .then( data => {
                            // collect role match
                        const roleID = roles.filter( x => x.title === data.title)
                            // collect employee match
                        const employeeId = employees.filter( x => x.name === data.employee)
                        db.promise().query(`UPDATE employees SET role_id = ? WHERE id = ?`, [ roleID[0].id, employeeId[0].id ])
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
                    } )
                    .catch( err => {
                        console.log( err );
                    } );
        })
};

    // update employee role
function updateEmployeeManager() {
    // create empty array
const employees = [{id: null, name: 'None'}]
    // collect employeed list for selecting manager
db.promise().query(`SELECT concat(first_name,' ',last_name) AS name,id FROM employees;`)
    .then( ([rows,fields]) => {
            // create empty array
        const employeeList = []
            // create empty array
        const managerList = [ 'None' ]    
            // push choices into Employee array
        rows.forEach( entry => employeeList.push( Object.values(entry)[0] ))
            // push choices into Manager list
        rows.forEach( entry => managerList.push( Object.values(entry)[0] ))
            // populate list for manager selection
        rows.forEach( entry => employees.push( {id: Object.values(entry)[1], name: Object.values(entry)[0] } ) )
            // collect roles for selection in the inquirer prompts
                    return inquirer.prompt( [
                        {
                            type: 'list',
                            name: 'employee',
                            message: "Which employee role do you want to update?",
                            choices: employeeList,
                            validate: input => {
                                if( input.length === 1 ) { // check for length of 1 to validate single selection
                                    return true
                                } else {
                                    console.log( 'Select an employee!' )
                                    return false
                                }
                            }
                        },
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Select a new manager",
                            choices: managerList,
                            validate: input => {
                                if( input.length === 1 ) { // check for length of 1 to validate single selection
                                    return true
                                } else {
                                    console.log( 'Select a new manager!' )
                                    return false
                                }
                            }
                        }
                    ] )
                })
                .then( data => {
                        // collect employee match
                    const employeeId = employees.filter( x => x.name === data.employee)
                        // collect employee match
                    const managerId = employees.filter( x => x.name === data.manager)
                    console.log( data, managerId[0].id, employeeId[0].id)
                    db.promise().query(`UPDATE employees SET manager_id = ? WHERE id = ?`, [ managerId[0].id, employeeId[0].id ])
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
                } )
                .catch( err => {
                    console.log( err );
                } );

};

module.exports = initial;


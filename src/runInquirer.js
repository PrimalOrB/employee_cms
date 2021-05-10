    // load inquirer
const inquirer = require( 'inquirer' );
    // load db
const db = require( '../db/connection' );
    // load console.table
const cTable = require('console.table');
    // populateDepartments helper
const populateCompare = require( '../utils/populateCompare' );
    // populate list choices helper
const populateChoices = require( '../utils/populateChoices.js' );
    // populate list choices helper
const populateConsole = require( '../utils/populateConsole.js' );
    // populate list choices helper
const filterID = require( '../utils/filterID.js' );

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
                "View employees by manager",
                "View employees by department",
                "View departmental salary budget",
                "Delete a department",
                "Delete a role",
                "Delete an employee"
            ]
        }
    ] ).then( data => {
            // switch statement casing the choices from above
        switch ( data.action ) {
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
            case "View employees by department":
                viewEmployeesByDepartment();
                break;
            case "View departmental salary budget":
                viewDepartmentBudget();
                break;
            case "Delete a department":
                deleteDepartment();
                break;
            case "Delete a role":
                deleteRole();
                break;
            case "Delete an employee":
                deleteEmployee();
                break;
            }
    } );
};

    // view all departments
function viewDepartments() {
        // SQL query - get departments and corresponding data
    db.promise().query( `SELECT departments.id,
                        departments.name,
                        COUNT(roles.id) AS department_roles
                        FROM departments
                        LEFT JOIN roles
                        ON departments.id = roles.department_id
                        GROUP BY departments.id;` )
        .then( ( [ rows ] ) => {
                // display in table
            console.table( rows )
                // return to menu
            initial();
        } )
        .catch( err => {
            console.log( err );
        } );
};

    // view all roles
function viewRoles() {
        // SQL query - get roles and corresponding data
    db.promise().query(`SELECT roles.id, 
                        roles.title AS role_title,
                        departments.name AS department,
                        CONCAT('$',FORMAT(roles.salary, 'c')) AS salary,
                        COUNT(employees.id) AS employee_count 
                        FROM roles
                        LEFT JOIN departments
                        ON roles.department_id = departments.id
                        LEFT JOIN employees
                        ON roles.id = employees.role_id
                        GROUP BY roles.id
                        ORDER BY roles.id;`)
       .then( ( [ rows ] ) => {
                // display in table
            console.table( rows )
                // return to menu
            initial();
       } )
       .catch( err => {
           console.log( err );
       } );
};

    // view all employees
function viewEmployees() {
        // SQL query - get employees table and corresponding details
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
       .then( ( [ rows ] ) => {
                // display in table
           console.table( rows )
                // return to menu
           initial();
       } )
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

            // SQL query - add response into departments table
        db.promise().query(`INSERT INTO departments ( name ) VALUES ( ? )`, [ department ])
        .then( ( [ rows ] ) => {
                // display confirmation
            populateConsole( rows, 'department added' );
                // return to menu
            initial();
        } )
        .catch( err => {
            console.log( err );
        } );
    } )
    .catch( err => {
        console.log( err );
    } );
};

    // add new role
function addRole() {
        // create empty departments array for comparison
    const departments = []

        // SQL query - collect department names from database for choices in inquirer prompt
    db.promise().query(`SELECT id, name FROM departments;`)
    .then( ( [ rows ] ) => {
            // create empty array of choices for inquirer
        const choices = []   
            // push choices into array
        populateChoices( choices, rows );
            // push results into array to search for ID after selection
        populateCompare( departments, rows )
            // inquirer questioning
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
    } )
    .then( data => {
            // collect ID of department by
        const departmentID = filterID( departments, data.department )
            // SQL query - insert responses into roles table
        db.promise().query( `INSERT INTO roles ( title, salary, department_id ) VALUES ( ?, ?, ? )`, [ data.role, data.salary, departmentID ] )
        .then( ( [ rows ] ) => {
                // display confirmation
            populateConsole( rows, 'role added' );
                // return to menu
            initial();
        } )
        .catch( err => {
            console.log( err );
        } );
    } )

    .catch( err => {
        console.log( err );
    } );
};

    // add new employee
function addEmployee() {
        // create empty array to store roles
    const roles = []
        // create array to store employees with a default 'None'
    const employees = [ { id: null, name: 'None' } ]
    
        // SQL query - get names for populating the employee and managers list
    db.promise().query( `SELECT id, concat(first_name,' ',last_name) AS name FROM employees;` )
    .then( ( [ rows ] ) => {
            // create array with default 'None' to be used in inquirer
        const managerList = ['None']
            // push choices into array to be used in inquirer
        populateChoices( managerList, rows );
            // populate list for comparison after selection to get IDs
        populateCompare( employees, rows )
        
            // SQL query - get roles for use in inquirer
        db.promise().query(`SELECT id, title FROM roles;`)
        .then( ( [ rows ] ) => {
                // create empty array
            const roleList = []   
                // push choices into array
            populateChoices( roleList, rows );
                // push results into array to search for ID after selection
            populateCompare( roles, rows )
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
            } )
            .then( data => {
                    // collect role match
                const roleID = filterID( roles, data.title )
                    // collect employee match from manager selection
                const managerId = filterID( employees, data.manager )

                // SQL query - insert employee into employees table
                db.promise().query(`INSERT INTO employees ( first_name, last_name, role_id, manager_id ) VALUES ( ?, ?, ?, ? )`, [ data.first_name, data.last_name,  roleID, managerId ] )
                .then( ( [ rows ] ) => {
                        // display confirmation
                    populateConsole( rows, 'emploee added' );
                        // return to menu
                    initial();
                })
                .catch( err => {
                    console.log( err );
                } );

            } )
            .catch(  err => {
                console.log( err );
        } );
    } );
};

    // update employee role
function updateEmployeeRole() {
        // create empty array to store roles
    const roles = []
        // create empty array
    const employees = []

        // SQL query - get names for populating the employee list
    db.promise().query(`SELECT id, concat(first_name,' ',last_name) AS name FROM employees;`)
    .then( ( [ rows ] ) => {
            // create empty array
        const employeeList = []
            // push choices into array
        populateChoices( employeeList, rows );
            // populate list for manager selection
        populateCompare( employees, rows );

            // SQL query - get roles for populating the role list
        db.promise().query(`SELECT id, title FROM roles;`)
        .then( ( [ rows ] ) => {
                // create empty array
            const roleList = []   
                // push choices into array
            populateChoices( roleList, rows );
                // push results into array to search for ID after selection
            populateCompare( roles, rows );
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
        } )
        .then( data => {
                // collect role match
            const roleID = filterID( roles, data.title );
                // collect employee match
            const employeeId = filterID( employees, data.employee );

                // SQL query - update employees table by id
            db.promise().query(`UPDATE employees SET role_id = ? WHERE id = ?`, [ roleID, employeeId ])
            .then( ( [ rows ] ) => {
                    // display confirmation
                populateConsole( rows, 'role updated' );
                    // return to menu
                initial();
            } )
            .catch( err => {
                console.log( err );
            } );

        } )
        .catch( err => {
            console.log( err );
        } );

    } )
    .catch( err => {
        console.log( err );
    } );
};

    // update employee role
function updateEmployeeManager() {
        // create array with a default value
    const employees = [{id: null, name: 'None'}]

        // SQL query - get names for populating the employee list
    db.promise().query(`SELECT id, concat(first_name,' ',last_name) AS name FROM employees;`)
    .then( ( [ rows ] ) => {
            // create empty array
        const employeeList = []
            // create empty array
        const managerList = [ 'None' ]    
            // push choices into array
        populateChoices( employeeList, rows );
            // push choices into array
        populateChoices( managerList, rows );
            // populate list for manager selection
        populateCompare( employees, rows );
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
    } )
    .then( data => {
            // collect employee match
        const employeeId = filterID( employees, data.employee );
            // collect employee match
        const managerId = filterID( employees, manager.employee );

            // SQL query - update employees table manager designation
        db.promise().query(`UPDATE employees SET manager_id = ? WHERE id = ?`, [ managerId, employeeId ] )
            .then( ( [ rows ] ) => {
                    // display confirmation
                populateConsole( rows, 'manager updated' );
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

    // view employees by Manager
function viewEmployeesByManager() {
        // create empty array
        const employees = [{id: null, name: 'None'}]

        // SQL query - get employees by manager
    db.promise().query(`SELECT managers.id, concat( managers.first_name, ' ', managers.last_name ) AS manager
                        FROM employees
                        LEFT JOIN employees AS managers
                        ON employees.manager_id = managers.id
                        WHERE employees.manager_id IS NOT NULL
                        GROUP BY manager
                        ORDER BY manager;`)
    .then( ( [ rows ] ) => {
            // create empty array
        const managerList = [ 'None' ] 
            // push choices into array
        populateChoices( managerList, rows );
            // populate list for manager selection
        populateCompare( employees, rows );
            // collect roles for selection in the inquirer prompts
        return inquirer.prompt( [
            {
                type: 'list',
                name: 'manager',
                message: "Select manager to view",
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
    } )
    .then( data => {
            // collect manager match
        const managerId = filterID( employees, data.manager );
                
            // SQL query - select employees by manager
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
                            ON roles.department_id = departments.id
                            WHERE employees.manager_id = ?;`, [ managerId ] )
        .then( ( [ rows ] ) => {
                // display in table
            console.table( rows )
                // return to menu
            initial();
        } )
        .catch( err => {
            console.log( err );
        } );

    } )
    .catch( err => {
        console.log( err );
    } );
};

    // view all employees
function viewEmployeesByDepartment() {
        // create empty array
        const departments = []

        // SQL query - get departments for list
    db.promise().query(`SELECT id, name FROM departments;`)
    .then( ( [ rows ] ) => {
            // create empty array
        const departmentList = []    
            // push choices into array
        populateChoices( departmentList, rows );
            // populate list for manager selection
        populateCompare( departments, rows );
            // collect roles for selection in the inquirer prompts
        return inquirer.prompt( [
            {
                type: 'list',
                name: 'department',
                message: "Select department to view",
                choices: departmentList,
                validate: input => {
                    if( input.length === 1 ) { // check for length of 1 to validate single selection
                        return true
                    } else {
                        console.log( 'Select a department!' )
                        return false
                    }
                }
            }
        ] )
    } )
    .then( data => {
            // collect department match
        const departmentId = filterID( employees, data.department );
        
            // SQL query - get employees by department
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
                            ON roles.department_id = departments.id
                            WHERE departments.id = ?;`, [ departmentId ] )
        .then( ( [ rows ] ) => {
                // display in table
            console.table( rows )
                // return to menu
            initial();
        } )
        .catch( err => {
            console.log( err );
        } );

    } )
    .catch( err => {
        console.log( err );
    } );
};

    // view department budget
function viewDepartmentBudget() {

        // SQL query - get department budgets
    db.promise().query(`SELECT departments.name AS department, 
                            CONCAT('$',FORMAT(SUM(roles.salary), 'c')) AS salary
                            FROM employees
                            LEFT JOIN employees AS managers
                            ON employees.manager_id = managers.id
                            LEFT JOIN roles
                            ON employees.role_id = roles.id
                            LEFT JOIN departments
                            ON roles.department_id = departments.id
                            GROUP BY departments.id
                            ORDER BY departments.id;`)
    .then( ( [ rows ] ) => {
            // display in table
        console.table( rows )
            // return to menu
        initial();
    } )
    .catch( err => {
        console.log( err );
    } );
};

    // delete a department
function deleteDepartment() {
        // create empty array
    const departments = []

        // SQL query - get departments for list
    db.promise().query( `SELECT id, name FROM departments;` )
    .then( ( [ rows ] ) => {
            // create empty array
        const departmentList = []    
            // push choices into array
        populateChoices( departmentList, rows );
            // populate list for manager selection
        populateCompare( departments, rows );
            // collect roles for selection in the inquirer prompts
        return inquirer.prompt( [
            {
                type: 'list',
                name: 'department',
                message: "Select department to delete",
                choices: departmentList,
                validate: input => {
                    if( input.length === 1 ) { // check for length of 1 to validate single selection
                        return true
                    } else {
                        console.log( 'Select a department!' )
                        return false
                    }
                }
            }
        ] )
    } )
    .then( data => {
            // collect department match
        const departmentId = filterID( departments, data.department );

            // SQL query - delete department by id
        db.promise().query(`DELETE FROM departments WHERE id = ?;`, [ departmentId ] )
        .then( ( [ rows ] ) => {
                // display in table
            populateConsole( rows, 'department deleted' );
                // return to menu
            initial();
        } )
        .catch( err => {
            console.log( err );
        } );

    } )
    .catch( err => {
        console.log( err );
    } );
}

    // delete a role
function deleteRole() {
        // create empty array
    const roles = []

        // SQL query - get roles for list
    db.promise().query(`SELECT * FROM roles;`)
    .then( ( [ rows ] ) => {
            // create empty array
        const roleList = []    
            // push choices into array
        populateChoices( roleList, rows );
            // populate list for manager selection
        populateCompare( roles, rows );
            // collect roles for selection in the inquirer prompts
        return inquirer.prompt( [
                {
                    type: 'list',
                    name: 'role',
                    message: "Select role to delete",
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
                // collect department match
            const roleId = filterID( roles, data.role );
                
                // SQL query - delete role by id
            db.promise().query(`DELETE FROM roles WHERE id = ?;`, [ roleId ] )
            .then( ( [ rows ] ) => {
                    // display in table
                    populateConsole( rows, 'role deleted' );
                    // return to menu
                initial();
        } )
        .catch( err => {
            console.log( err );
        } );

    } )
    .catch( err => {
        console.log( err );
    } );
}

    // delete an employee
function deleteEmployee() {
        // create empty array
    const employees = []

        // SQL query - get employees for list
    db.promise().query( `SELECT id, concat(first_name,' ',last_name) AS name FROM employees;` )
    .then( ( [ rows ] ) => {
            // create empty array
        const employeeList = []   
            // push choices into array
        populateChoices( employeeList, rows );
            // populate list for manager selection
        populateCompare( employees, rows );
            // collect roles for selection in the inquirer prompts
        return inquirer.prompt( [
            {
                type: 'list',
                name: 'employee',
                message: "Select employee to delete",
                choices: employeeList,
                validate: input => {
                    if( input.length === 1 ) { // check for length of 1 to validate single selection
                        return true
                    } else {
                        console.log( 'Select an employee!' )
                        return false
                    }
                }
            }
        ] )
    })
    .then( data => {
            // collect department match
        const employeeId = filterID( employees, data.employee );
            
            // SQL query - delete employee by id
        db.promise().query(`DELETE FROM employees WHERE id = ?;`, [ employeeId ] )
        .then( ( [ rows ] ) => {
                // display in table
            populateConsole( rows, 'emploee deleted' );
                // return to menu
            initial();
        } )
        .catch( err => {
            console.log( err );
        } );

    } )
    .catch( err => {
        console.log( err );
    } );
}

module.exports = initial;


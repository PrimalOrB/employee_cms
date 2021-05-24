# Employee Content Management System (CMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

Express.js / Node.js / mySQL application allowing a user to control an employee database of Departments, Roles, Managers, and Salaries.

## Table Of Contents

- [Video](#video)
- [Installation](#installation)
- [Usage](#usage)
- [Built Using](#built)
- [License](#license)
- [Contribution](#contribution)
- [Tests](#tests)
- [Questions](#questions)

## Video

- [View video Demo](https://drive.google.com/file/d/1BZNu-U7wr0QcwgEKdHiDxR1ZoVBr2jfG/view?usp=sharing)

## Installation

- To install locally, clone the respository
  - run `npm install` to download dependencies
  - `cd` to the cloned directory and run `npm start`
    - localhost:3001 will be utilized, and page can be viewed in a web browser

## Usage

- Presented with a main menu, your options are:
  - View all departments
    - Presented with table showing `id`, `name`, and `number of department roles`
  - View all roles
    - Presented with table showing `id`, `role_title`, `department`, `salary`, and `employee count` within each departments
  - View all employees
    - Presented with table showing `id`, `name`, `job_title`, `department`, `salary`, and `manager` ( derived from same employee list )
  - Add a department
    - Create a new department by name
  - Add a role
    - Create a new role
      - Child of a department
      - Defined salary
  - Add an employee
    - Create new employee
      - Child of a role
      - Can be assigned manager (from list of employees)
  - Update an employee role
    - Select an employee from the list, and choose a new role
  - Update an employee manager
    - Select an employee from the list, and choose a new manager
  - View employees by manager
    - Select a manager from the list (an employee who has > 0 employees who report to them)
    - Presented with a table listing the employees who report to the selected manager
  - View employees by departments
    - Select a department from the list
    - Presented with a table listing the employees who are assigned the selected role
  - View departmental salary budget
    - Presented with a table that shows each department, and the allocated salary (based on the employees and roles currently assigned)
  - Delete a department
    - Delete a department from the list
      - Will cascase to role
  - Delete a role
    - Delete a role from the list
  - Delete an employee
    - Delete an employee

## Built

- [Node.js](https://nodejs.org/en/)
- [Inquirer](https://www.npmjs.com/package/inquirer)
- [mySQL2](https://www.npmjs.com/package/mysql2)
- [console.table](https://www.npmjs.com/package/console.table)

## License

This application is covered under the [MIT](https://opensource.org/licenses/MIT) license.

## Contribution

- There is no contribution required for this project

## Tests

- There are no tests for this project

## Questions

Please feel free to contact me regarding any further questions:

- [GitHub Profile](https://github.com/PrimalOrB)
- [Email Me](mailto://primalorb@gmail.com)

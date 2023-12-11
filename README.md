[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/9NDadFFr)
Add design docs in *images/*

## Instructions to setup and run project
### Requirements
- [Node.js](https://nodejs.org/en/download) and npm (Node.js comes with npm)
- [MongoDB Community Edition](https://www.mongodb.com/docs/manual/administration/install-community/)
    - On Windows, unselect the option "MongoDB as a Service."

### Setup Instructions
1. In a command prompt, run MongoDB Community Edition.
```console
$ "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="c:\data\db"
```
2. In a command prompt, clone this repository:
```console
$ git clone https://github.com/sbu-ckane-f23-cse316-projectorg/projectfakeso-tbear.git
```
3. Navigate to this repository in the terminal.
```console
$ cd projectfakeso-tbear
```
4. In a separate command prompt, navigate to the `client` and `server` folders and install dependencies using npm.
```console
$ cd client
$ npm install
$ cd ../server
$ npm install
```
5. While in the `server` folder, initialize the database. The username and password for an admin user must be provided and can be anything.
```console
# In the projectfakeso-tbear/server folder
$ node init.js <username_of_admin> <password_of_admin>
```
6. In the `server` folder, start the server. This can be done with either `node` or `nodemon`.
```console
$ node server.js
# OR
$ nodemon server.js
```
7. In a separate command prompt, navigate to the client folder and run the client.
```console
# In the projectfakeso-tbear/client folder
$ npm start
```

## Team Member 1 (Torin McNally) Contribution
- Searchbar functionality
- Modifying and deleting questions, answers, and tags
- Welcome, register, and login pages (frontend and backend)
- Session handling
- User schema and user profile page
- Functionalities specific to guest users
- UML Diagrams

## Team Member 2 (Jared Tjahjadi) Contribution
- Comments schema and functionality
- Question, answer, comment navigation (prev and next buttons)
- Voting and user reputation, and related constraints based on user's reputation
- Admin Profile
- Populating database with dummy users and initializing admin user (init.js)
- README
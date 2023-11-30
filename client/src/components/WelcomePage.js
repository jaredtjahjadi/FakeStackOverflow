import * as Constants from '../constants'
import { useEffect, useState } from 'react';
import axios from 'axios'
import { QuestionsInfo } from './HomePage';
import { invalidForm } from './PostQuestionPage';

/*
    This is the first page the user will see when accessing the website.
    The user will be given the options to Login, Register, or Continue as Guest.
    When the user logs in, the website will render the HomePage component, which
    is the actual website's content.
*/

export default function WelcomePage() {

    const [currPage, setCurrPage] = useState(Constants.SPLASH_PAGE)

    let content;

    switch(currPage) {
        case Constants.SPLASH_PAGE:
            content = <SplashPage setCurrPage={setCurrPage}/>;
            break;

        case Constants.LOGIN_PAGE:
            content = <Login setCurrPage={setCurrPage}/>;
            break;

        case Constants.REGISTER_PAGE:
            content = <Register setCurrPage={setCurrPage}/>;
            break;

        default:
            console.log("Wrong page detected!: " + currPage)
    }

    return (
        <>
            <h1 className="header">
                Welcome to Fake Stack Overflow!
            </h1>
            {content}
        </>
    )
}

function SplashPage({setCurrPage}) {
    return (
        <>
            <div id="welcome-options">
                <button className="welcome-button" onClick={() => setCurrPage(Constants.LOGIN_PAGE)}>
                    Login
                </button>
                <button className="welcome-button" onClick={() => setCurrPage(Constants.REGISTER_PAGE)}>
                    Register
                </button>
                <button className="welcome-button">
                    Continue as Guest
                </button>
            </div>
        </>
    )
}

function Login({setCurrPage}) {
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState("")
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const handleLogin = (event) => {
        // STILL IN PROGRESS
        event.preventDefault()


    }

    return(
        <form className="welcome-form">
            <div>
                <label htmlFor='email' className='welcome-input'>Email: </label>
                <input type='text' id='email' onChange={(email) => setEmail(email)}></input>
            </div>
            <br></br>
            <div>
                <label htmlFor='password' className='welcome-input'>Password: </label>
                <input type='password' id='password' onChange={(password) => setEmail(password)}></input>
            </div>
            <br></br>
            <div>
                <button className="welcome-button" onClick={() => setCurrPage(Constants.SPLASH_PAGE)}>
                        Back
                </button>
                <button className="welcome-button" onClick={() => setCurrPage(Constants.LOGIN_PAGE)}>
                        Login
                </button>
            </div>
        </form>
    )
}

function Register({setCurrPage}) {

    const [username, setUsername] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState("")
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [passwordVerification, setPasswordVerification] = useState("")
    const [passwordVerifError, setPasswordVerifError] = useState("")

    const handleRegister = (event) => {
        event.preventDefault();

        /*
            Regex for a valid email is taken from this source:
            https://www.regular-expressions.info/email.html
        */
        const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
        const passwordRegex = new RegExp(username + '|' + email.substr(0, email.indexOf('@')), "gi")

        // Email should have a correct format.
        if(!emailRegex.test(email)) {
            setEmailError("Invalid email.")
            return
        }
        else
            setEmailError("")

        // The typed password should not contain the username or the email id.
        if(passwordRegex.test(password)) {
            setPasswordError("The password must not contain the username nor the email id.")
            return
        }
        else
            setPasswordError("")

        // The password verification must match the password.
        if(password != passwordVerification) {
            setPasswordVerifError("The password verification does not match the typed password.")
            return
        }
        else
            setPasswordVerifError("")

        const registerUser = async () => {
            const userData = {
                username: username,
                email: email,
                password: password,
            }

            await axios.post('http://localhost:8000/register', userData)
        }
    
        registerUser()
            .then(() => {
                setCurrPage(Constants.LOGIN_PAGE)
            })
            .catch(error => {
                if(!error.response)
                    console.log("Server is down. Try again later.")
                else
                    setEmailError("Email is already associated with an existing user.")
            })
    }

    /*
        Ngl this is a monstrosity to look at, but it gets the job done.
        If you want to fix it, be my guest. - Torin
    */
    return (
        <form className="welcome-form" onSubmit={handleRegister}>
            <div>
                <label htmlFor='email' className='welcome-input'>Username: </label>
                <input type='text' id='username' onChange={(event) => setUsername(event.target.value)}></input>
                <div>{usernameError}</div>
            </div>
            <br></br>
            <div id='email-form'>
                <label htmlFor='email' className='welcome-input'>Email: </label>
                <input type='text' id='email' onChange={(event) => setEmail(event.target.value)}></input>
                <div>{emailError}</div>
            </div>
            <br></br>
            <div id='password-form'>
                <label htmlFor='password' className='welcome-input'>Password: </label>
                <input type='password' id='password' onChange={(event) => setPassword(event.target.value)}></input>
                <div>{passwordError}</div>
            </div>
            <br></br>
            <div id='password-verification-form'>
                <label htmlFor='password_verification' className='welcome-input'>Verify Password: </label>
                <input type='password' id='password_verification' onChange={(event) => setPasswordVerification(event.target.value)}></input>
                <div>{passwordVerifError}</div>
            </div>
            <br></br>
            <div>
                <button className="welcome-button" onClick={() => setCurrPage(Constants.SPLASH_PAGE)}>
                    Back
                </button>
                <button className="welcome-button">
                    Sign Up
                </button>
            </div>
        </form>
    )
}
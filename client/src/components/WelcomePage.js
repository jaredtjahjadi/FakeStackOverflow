import * as Constants from '../constants'
import { useState } from 'react';
import axios from 'axios'

/*
    This is the first page the user will see when accessing the website.
    The user will be given the options to Login, Register, or Continue as Guest.
    When the user logs in, the website will render the HomePage component, which
    is the actual website's content.
*/

export default function WelcomePage({setIsAuthenticated}) {
    const [currPage, setCurrPage] = useState(Constants.SPLASH_PAGE)
    let content;

    switch(currPage) {
        case Constants.SPLASH_PAGE:
            content = <SplashPage setCurrPage={setCurrPage} setIsAuthenticated={setIsAuthenticated}/>;
            break;

        case Constants.LOGIN_PAGE:
            content = <Login setCurrPage={setCurrPage} setIsAuthenticated={setIsAuthenticated}/>;
            break;

        case Constants.REGISTER_PAGE:
            content = <Register setCurrPage={setCurrPage}/>;
            break;

        default:
            console.log("Wrong page detected!: " + currPage)
    }

    return (
        <>
            <h1 className="header">Welcome to Fake Stack Overflow!</h1>
            {content}
        </>
    )
}

function SplashPage({setCurrPage, setIsAuthenticated}) {
    return (
        <>
            <div id="welcome-options">
                <button tabIndex='0' className="welcome-button" onClick={() => setCurrPage(Constants.LOGIN_PAGE)}>Login</button>
                <button tabIndex='0' className="welcome-button" onClick={() => setCurrPage(Constants.REGISTER_PAGE)}>Register</button>
                <button tabIndex='0' className="welcome-button" onClick={async () => {
                    await axios.post('http://localhost:8000/guest')
                    setIsAuthenticated(false)
                }}>
                    Continue as Guest
                </button>
            </div>
        </>
    )
}

function Login({setCurrPage, setIsAuthenticated}) {
    const notRegistered = "The given email is not registered with a user.";
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState("")
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const handleLogin = (event) => {
        event.preventDefault()
        const loginUser = async () => {
            const userData = {
                email: email,
                password: password
            }
            const res = await axios.post('http://localhost:8000/login', userData)
            return res
        }
    
        loginUser()
            .then(() => {
                setPassword('') // security reasons
                setIsAuthenticated(true)
            })
            // Display message if form field is incorrect
            .catch(error => {
                const msg = error.response.data.message
                if(msg === notRegistered || msg === "Email field required.") {
                    setPasswordError('')
                    setEmailError(msg);
                }
                else if(msg === "The password is incorrect." || msg === "Password field required.") {
                    setPasswordError(msg);
                    setEmailError('')
                }
            })
    }

    return(
        <form className="welcome-form" onSubmit={handleLogin}>
            <WelcomePageForm idName={'email'} text={"Email"} setField={setEmail} error={emailError} /><br />
            <WelcomePageForm idName={'password'} text={"Password"} setField={setPassword} error={passwordError} /><br />
            <div>
                <button className="welcome-button" onClick={() => setCurrPage(Constants.SPLASH_PAGE)}>Back</button>
                <button className="welcome-button" onClick={() => setCurrPage(Constants.LOGIN_PAGE)}>Login</button>
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
        const emailRegex = /^[^@]+@[^@]+\.[^@]+$/
        const passwordRegex = new RegExp(username + '|' + email.substring(0, email.indexOf('@')), "gi")

        if(username.length === 0) {
            setUsernameError("Invalid username.")
            return
        }
        else setUsernameError("")

        // Email should have a correct format.
        if(!emailRegex.test(email)) {
            setEmailError("Invalid email.")
            return
        }
        else setEmailError("")

        if(password.length === 0) {
            setPasswordError("Invalid password.")
            return
        }
        else setPasswordError("")

        // The typed password should not contain the username or the email id.
        if(passwordRegex.test(password)) {
            setPasswordError("The password must not contain the username nor the email id.")
            return
        }
        else setPasswordError("")

        // The password verification must match the password.
        if(password !== passwordVerification) {
            setPasswordVerifError("The password verification does not match the typed password.")
            return
        }
        else setPasswordVerifError("")

        const registerUser = async () => {
            const userData = {
                username: username,
                email: email,
                password: password,
            }

            const res = await axios.post('http://localhost:8000/register', userData)
            return res
        }
    
        registerUser()
            .then(() => {
                alert("Registration successful.");
                setCurrPage(Constants.LOGIN_PAGE)
            })
            .catch(error => {
                if(!error.response) alert("Server is down. Try again later.")
                else setEmailError("Email is already associated with an existing user.")
            })
    }

    /*
        Ngl this is a monstrosity to look at, but it gets the job done.
        If you want to fix it, be my guest. - Torin

        fixed with modularization 😎 -jared
    */
    return (
        <form className="welcome-form" onSubmit={handleRegister}>
            <WelcomePageForm idName={'username'} text={"Username"} setField={setUsername} error={usernameError} /><br />
            <WelcomePageForm idName={'email'} text={"Email"} setField={setEmail} error={emailError} /><br />
            <WelcomePageForm idName={'password'} text={"Password"} setField={setPassword} error={passwordError} /><br />
            <WelcomePageForm idName={"passwordverification"} text={"Verify Password"} setField={setPasswordVerification} error={passwordVerifError} /><br />
            <div>
                <button tabIndex='0' className="welcome-button" onClick={() => setCurrPage(Constants.SPLASH_PAGE)}>Back</button>
                <button tabIndex='0' className="welcome-button">Sign Up</button>
            </div>
        </form>
    )
}

function WelcomePageForm(props) {
    return (
        <div id={props.idName + "-form"}>
            <label htmlFor={props.idName} className='welcome-input'>{props.text}: </label>
            <input type={(props.idName.includes('password') ? 'password' : 'text')} id={props.idName} onChange={(event) => props.setField(event.target.value)} />
            <div>{props.error}</div>
        </div>
    )
}
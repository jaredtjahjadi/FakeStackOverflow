import * as Constants from '../constants'
import { useState } from 'react';
import axios from 'axios'
import { QuestionsInfo } from './HomePage';

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
    // const [loginFormData, setLoginFormData] = useState({email: "", password: ""})

    // const handleLogin = (event) => {
    //     // STILL IN PROGRESS
    //     event.preventDefault()
    // }

    return(
        <form className="welcome-form">
            <div>
                <label htmlFor='email' className='welcome-input'>Email: </label>
                <input type='text' id='email'></input>
            </div>
            <br></br>
            <div>
                <label htmlFor='password' className='welcome-input'>Password: </label>
                <input type='password' id='password'></input>
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

    const handleRegister = (event) => {
        event.preventDefault();

        let errMsg = document.getElementById("error-message")

        let username = event.target.username.value.trim();
        let email = event.target.email.value.trim();
        let password = event.target.password.value.trim();
        let password_verification = event.target.password_verification.value.trim();

        // Email verification (no two users can have the same email, should be a valid form)
        document.getElementById("email").appendChild(errMsg);
        
        /*
            Regex for a valid email is taken from this source:
            https://www.regular-expressions.info/email.html
        */
        const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

        if(!emailRegex.test(email)) {
            //IN PROGRESS
        }

        const addQuestion = async () => {
            try {
                const userData = {
                    username: username,
                    email: email,
                    password: password,
                }
    
                await axios.post('http://localhost:8000/register', userData)
            } catch (error) {
                console.log(error)
            }
        }
    
        addQuestion()
            .then(setCurrPage(Constants.LOGIN_PAGE))
    }

    /*
        Ngl this is a monstrosity to look at, but it gets the job done.
        If you want to fix it, be my guest. - Torin
    */
    return (
        <form className="welcome-form" onSubmit={handleRegister}>
            <div>
                <label htmlFor='email' className='welcome-input'>Username: </label>
                <input type='text' id='username'></input>
            </div>
            <div id="error-message"/>
            <br></br>
            <div>
                <label htmlFor='email' className='welcome-input'>Email: </label>
                <input type='text' id='email'></input>
            </div>
            <br></br>
            <div>
                <label htmlFor='password' className='welcome-input'>Password: </label>
                <input type='password' id='password'></input>
            </div>
            <br></br>
            <div>
                <label htmlFor='password_verification' className='welcome-input'>Verify Password: </label>
                <input type='password' id='password_verification'></input>
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
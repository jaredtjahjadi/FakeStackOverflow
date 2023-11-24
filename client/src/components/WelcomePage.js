import * as Constants from '../constants'
import { useState } from 'react';

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
            content = <Login />;
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
    return(
        <h1>Registered!</h1>
    )
}

/*
    Ngl this is a monstrosity to look at, but it gets the job done.
    If you want to fix it, be my guest. - Torin
*/

function Register({setCurrPage}) {
    return (
        <div className="welcome-form">
            <div>
                <label htmlFor='email' className='welcome-input'>Username: </label>
                <input type='text' id='username'></input>
            </div>
            <br></br>
            <div>
                <label htmlFor='email' className='welcome-input'>Email: </label>
                <input type='text' id='email'></input>
            </div>
            <br></br>
            <div>
                <label htmlFor='password' className='welcome-input'>Password: </label>
                <input type='text' id='password'></input>
            </div>
            <br></br>
            <div>
                <label htmlFor='password-verification' className='welcome-input'>Verify Password: </label>
                <input type='text' id='password-verification'></input>
            </div>
            <br></br>
            <div>
                <button className="welcome-button" onClick={() => setCurrPage(Constants.SPLASH_PAGE)}>
                    Back
                </button>
                <button className="welcome-button" onClick={() => setCurrPage(Constants.LOGIN_PAGE)}>
                    Register
                </button>
            </div>
        </div>
    )
}
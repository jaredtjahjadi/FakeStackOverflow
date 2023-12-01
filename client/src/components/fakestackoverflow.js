import { createContext, useState, useEffect } from 'react';
import WelcomePage from './WelcomePage.js';
import HomePage from './HomePage.js';
import axios from 'axios'

/*
  *** FOR JARED ***

  All content from FakeStackOverflow has been moved to a new file called HomePage.
  This is where all of our work from last homeworks are. Since there's now a login
  page, we now have to dynamically choose whether to render the welcome page or
  the website's actual content.

  If you want to continue working on your part independently while the Welcome
  page is in progress, set isLoggedIn to true in the component below.

  - el torino
*/

/*
  *** FOR TORIN ***

  🐔👍

  - bear
*/

// Tracks the current user's info
export const UserInfo = createContext();

export default function FakeStackOverflow() {
  const [isLoggedIn, setLoggedIn] = useState(false)
  //const [username, setUsername] = useState("")

  axios.defaults.withCredentials = true;
  /*
    Check the session to see if the session is valid. If it isn't, then direct to the Login Page.
    Else, direct them to their personalized Home Page.
  */
  useEffect(() => {
    const verifyAuth = async () => {
      await axios.get('http://localhost:8000/')
        .then(res => {
          setLoggedIn(true)
          console.log(res.data)
        })
        .catch(error => {
          if(!error.response)
            console.log("ERROR")
          console.log(error)
        })
    }

    verifyAuth()
  }, [])

  switch(isLoggedIn) {
    case false:
      return <WelcomePage setLoggedIn={setLoggedIn}/>

    case true:
      return <HomePage />

    default:
      console.log("The state of the user is not defined!")
  }
}

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
  page is in progress, set isAuthenticated to true in the component below.

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
  const [isAuthenticated, setIsAuthenticated] = useState(null)


  axios.defaults.withCredentials = true;
  /*
    Check the session to see if the session is valid. If it isn't, then direct to the Login Page.
    Else, direct them to their personalized Home Page.
  */
  useEffect(() => {
    const verifyAuth = async () => {
      await axios.get('http://localhost:8000/')
        .then(() => setIsAuthenticated(true))
        .catch(error => {
          if(!error.response)
            alert("Request failed. Try again later.")
        })
    }

    verifyAuth()
  }, [])

  switch(isAuthenticated) {

    case null:
      return <WelcomePage setIsAuthenticated={setIsAuthenticated}/>

    default:
      return <HomePage isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
  }
}

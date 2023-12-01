import { createContext, useState } from 'react';
import WelcomePage from './WelcomePage.js';
import HomePage from './HomePage.js';

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
  const [isLoggedIn, setLoggedIn] = useState(true)

  switch(isLoggedIn) {
    case false:
      return <WelcomePage />

    case true:
      return <HomePage />

    default:
      console.log("The state of the user is not defined!")
  }
}

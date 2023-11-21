import { createContext, useState } from 'react';
import WelcomePage from './WelcomePage.js';

// Tracks the current user's info
export const UserInfo = createContext();

export default function FakeStackOverflow() {
  const [isLoggedIn, setLoggedIn] = useState(false)

  switch(isLoggedIn) {
    case false:
      return <WelcomePage />

    case true:
      return <FakeStackOverflow />

    default:
      console.log("The state of the user is not defined!")
  }
}

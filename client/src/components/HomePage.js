import { createContext, useEffect, useState } from 'react';
import Body from './body';
import * as Constants from '../constants'
import axios from 'axios'

export const QuestionsInfo = createContext();

export default function HomePage({isAuthenticated, setIsAuthenticated}) {
  const [currPage, setCurrPage] = useState(Constants.QUESTIONS_PAGE);
  const [currFilter, setCurrFilter] = useState(Constants.NEWEST_FILTER);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currDisplayedQuestions, setDisplayedQuestions] = useState([]) // For Questions Page
  const [numQuestions, setNumQuestions] = useState(allQuestions.length);
  const [typeResults, setTypeResults] = useState("All Questions");

  /**
   * FOR JARED (again)
   * 
   * I need to keep track of the current answer being edited, so this is being called 
   * currDisplayedPost so that when I switch from the user profile to editing an 
   * answer, I can keep track of what answer we are editing in the first place,
   * instead of specifically a current question.
   * 
   * All currDisplayQuestion and setCurrDisplayQuestion are now replaced with
   * currDisplayedPost and setCurrDisplayed Post. Everything works the exact
   * same, just use the new one to replace the old variable name.
   * 
   * - el torino
   */

  const [currDisplayedPost, setDisplayedPost] = useState([])
  
  const getNewestQuestions = async () => {
    await axios.get('http://localhost:8000/newestQuestions')
    .then(res => {
      const questions = res.data;
      setAllQuestions(questions);
      setDisplayedQuestions(questions.slice(0, 5));
      setNumQuestions(questions.length)
    })
  }
  
  const getActiveQuestions = async () => {
    await axios.get('http://localhost:8000/activeQuestions')
      .then(res => {
        const questions = res.data;
        setAllQuestions(questions);
        setDisplayedQuestions(questions.slice(0, 5));
        setNumQuestions(questions.length)
      })
  }
  
  const getUnansweredQuestions = async () => {
    await axios.get('http://localhost:8000/unansweredQuestions')
      .then(res => {
        const questions = res.data;
        setAllQuestions(questions);
        setDisplayedQuestions(questions.slice(0, 5));
        setNumQuestions(questions.length)
      })
  }

  // This useEffect is done to conditionally render specific questions based on the current filter.

  useEffect(() => {

    // Define the requests to make based on the current filter to be applied

    switch(currFilter) {
      case Constants.NEWEST_FILTER:
        getNewestQuestions()
        break;

      case Constants.ACTIVE_FILTER:
        getActiveQuestions()
        break;

      case Constants.UNANSWERED_FILTER:
        getUnansweredQuestions()
        break;

      default:
    }
  }, [currFilter])

  return (
    <>
        <QuestionsInfo.Provider value = {
          {
            currPage,
            setCurrPage, 
            currFilter,
            setCurrFilter,
            allQuestions,
            setAllQuestions,
            currDisplayedQuestions,
            setDisplayedQuestions,
            numQuestions,
            setNumQuestions,
            typeResults,
            setTypeResults,
            currDisplayedPost,
            setDisplayedPost,
            getNewestQuestions,
            setIsAuthenticated,
            isAuthenticated
          }
        }>
          <div id="header" className="header">
            <h1 id="website-title">Fake Stack Overflow</h1>
            <SearchBar />
          </div>
          <Body />
        </QuestionsInfo.Provider>
    </>
  );

  function SearchBar() {
    function handleSearch(event) {
      if(event.key === 'Enter'){
        setCurrPage(Constants.QUESTIONS_PAGE)
        const input = event.target.value;

        const getSearchResults = async () => {
          await axios.get('http://localhost:8000/searchResults', {
              params: input
          })
          .then(res => {
            const questions = res.data;
            setNumQuestions(questions.length)
            setTypeResults("Search Results")
            setDisplayedQuestions(questions);
            setCurrFilter(Constants.SEARCH_FILTER);

            document.getElementById("Newest").classList.remove("active");
            document.getElementById("Active").classList.remove("active");
            document.getElementById("Unanswered").classList.remove("active");
            }
          )
        }
        getSearchResults()
      }
    }

    return (<input id="search-bar" type="text" placeholder="Search . . ." onKeyUp={handleSearch}></input>)
  }
}
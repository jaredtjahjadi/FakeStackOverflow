import { createContext, useEffect, useState } from 'react';
import Body from './body';
import * as Constants from '../constants'
import axios from 'axios'

export const QuestionsInfo = createContext();

export default function HomePage({setLoggedIn}) {
  const [currPage, setCurrPage] = useState(Constants.QUESTIONS_PAGE);
  const [currFilter, setCurrFilter] = useState(Constants.NEWEST_FILTER);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currDisplayedQuestions, setDisplayedQuestions] = useState([]) // For Questions Page
  const [numQuestions, setNumQuestions] = useState(allQuestions.length);
  const [typeResults, setTypeResults] = useState("All Questions");

  /**
   * FOR JARED
   * 
   * This is a new change so that I don't have to copy and paste the form for modifiying and
   * deleting a question again. The currDisplayedQuestion state now not only represents
   * the question we are looking at the answer for, but also the question that is currently 
   * being modified on the Post Question page.
   * 
   * This depends on the page being displayed, and is interchangeable.
   * 
   * - el torino
   */

  const [currDisplayedQuestion, setDisplayedQuestion] = useState([])
  const [username, setUsername] = useState("");
  
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

  // This useEffect is done to dynamically fetch and render the user's username

  useEffect(() => {

    const getUsername = async () => {
        await axios.get('http://localhost:8000/username')
        .then(res => {
          setUsername(res.data)
        })
    }

    getUsername()
  }, [])

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
            currDisplayedQuestion,
            setDisplayedQuestion,
            getNewestQuestions,
            // allAnswers,
            // setAllAnswers,
            // currDisplayedAnswers,
            // setDisplayedAnswers,
            // allComments,
            // setAllComments,
            // currDisplayedComments,
            // setDisplayedComments,
            setLoggedIn
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
            console.log(questions)
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
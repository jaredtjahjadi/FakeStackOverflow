import { createContext, useEffect, useState } from 'react';
import Body from './body';
import * as Constants from '../constants'
import axios from 'axios'

export const QuestionsInfo = createContext();

export default function HomePage() {
  const [currPage, setCurrPage] = useState(Constants.QUESTIONS_PAGE);
  const [currFilter, setCurrFilter] = useState(Constants.NEWEST_FILTER);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currDisplayedQuestions, setDisplayedQuestions] = useState([]) // For Questions Page
  const [numQuestions, setNumQuestions] = useState(allQuestions.length);
  const [typeResults, setTypeResults] = useState("All Questions");
  const [currDisplayedQuestion, setDisplayedQuestion] = useState([]) // SHOULD PROBABLY BE MOVED TO SEE ANSWERS INSTEAD
  const [allAnswers, setAllAnswers] = useState([]);
  const [currDisplayedAnswers, setDisplayedAnswers] = useState([]);
  
  /*
    By using useEffect, the GET request for questions will always be done after every rendering.
    So, since it's initially set to an empty array, it'll render no questions, but the effect
    will go through, rendering the newest questions last :) - Torin
  */
  useEffect(() => {

    // Define the requests to make based on the current filter to be applied
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
            currDisplayedQuestion,
            setDisplayedQuestion,
            allAnswers,
            setAllAnswers,
            currDisplayedAnswers,
            setDisplayedAnswers
          }
        }>
          <div id="header" className="header">
            <h2 id="user-link">{}</h2>
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
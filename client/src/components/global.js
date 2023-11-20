import * as Constants from '../constants'
import axios from 'axios'
import {QuestionsInfo} from './fakestackoverflow'
import React, { useContext } from 'react';

// Contains the components that are "global" to all of the pages on the website.
// More specifically, elements that will always be on the screen no matter what page the user is on.

export function FakeSoTitle() {
    return (
        <h1 id="website-title">Fake Stack Overflow</h1>
    )
}

export function Menu() {

    const questionsInfo = useContext(QuestionsInfo);
    
    const currPage = questionsInfo.currPage;
    const setCurrPage = questionsInfo.setCurrPage;

    return (
        <div id="menu" className="column">
            <div 
                id="questions-link" 
                className={currPage === Constants.QUESTIONS_PAGE ? "active" : undefined}
                onClick={function() {
                    setCurrPage(Constants.QUESTIONS_PAGE);
                }}
            >
                Questions
            </div>

            <div 
                id="tags-link"
                className={currPage === Constants.TAGS_PAGE ? "active" : undefined}
                onClick={() => setCurrPage(Constants.TAGS_PAGE)}
            >
                Tags
            </div>
        </div>
    )
}

export function SearchBar() {

    const questionsInfo = useContext(QuestionsInfo);
    
    const setCurrPage = questionsInfo.setCurrPage;
    const setCurrFilter = questionsInfo.setCurrFilter;
    const setDisplayedQuestions = questionsInfo.setDisplayedQuestions;
    const setNumQuestions = questionsInfo.setNumQuestions;
    const setTypeResults = questionsInfo.setTypeResults;

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

// EXCEPTION: Only disappears when there's an answer being posted.
export function AskQuestion() {
    const questionsInfo = useContext(QuestionsInfo);
    
    const setCurrPage = questionsInfo.setCurrPage;
    return (
        <div id="ask-question-container">
            <button id="ask-question" type="button" onClick={() => setCurrPage(Constants.POST_QUESTION_PAGE)}>Ask Question</button>
        </div>
    )
}
import React, { useContext } from 'react';
import * as Constants from '../constants';
import QuestionsPage from './QuestionsPage';
import PostQuestionPage from './PostQuestionPage';
import TagsPage from './TagsPage';
import { SeeAnswers } from './SeeAnswers';
import { QuestionsInfo } from './HomePage';
import PostAnswerPage from './PostAnswerPage';
import { UserProfile } from './UserProfile';
import { SeeUserAnswers } from './SeeUserAnswers'
import axios from 'axios'

export default function Body() {

    return (
        <div id='body' className='body'>
            <Menu />
            <Main />
        </div>
    )
}

export function Main() {
    let mainContent;

    const questionsInfo = useContext(QuestionsInfo);
    const currPage = questionsInfo.currPage;
    const setCurrPage = questionsInfo.setCurrPage;
    const setDisplayedQuestion = questionsInfo.setDisplayedQuestion;

    switch(currPage) {
        case Constants.POST_QUESTION_PAGE:
            mainContent = <PostQuestionPage />;
            break;
        case Constants.QUESTIONS_PAGE:
            mainContent = <QuestionsPage />;
            break;
        case Constants.TAGS_PAGE:
            mainContent = <TagsPage />;
            break;
        case Constants.SEE_ANSWERS_PAGE:
            mainContent = <SeeAnswers />
            break;
        case Constants.POST_ANSWER_PAGE:
            mainContent = <PostAnswerPage />;
            break;
        case Constants.USER_PROFILE:
            mainContent = <UserProfile setCurrPage={setCurrPage} setDisplayedQuestion={setDisplayedQuestion}/>;
            break;
        case Constants.MODIFY_QUESTION_PAGE:
            mainContent = <PostQuestionPage />;
            break;
        case Constants.SEE_USER_ANSWERS_PAGE:
            mainContent = <SeeAnswers />
            break;
        case Constants.MODIFY_ANSWER_PAGE:
            mainContent = <SeeUserAnswers />
            break;
        default:
            mainContent = <QuestionsPage />;
    }

    return (
        <div id='main' className='main'>
            {mainContent}
        </div>
    )
}

export function Menu() {

    const questionsInfo = useContext(QuestionsInfo);
    
    const currPage = questionsInfo.currPage;
    const setCurrPage = questionsInfo.setCurrPage;
    const setLoggedIn = questionsInfo.setLoggedIn

    return (
        <div id="menu" className="column">
            <div 
                id="questions-link" 
                className={currPage === Constants.QUESTIONS_PAGE ? "active" : undefined}
                onClick={() => setCurrPage(Constants.QUESTIONS_PAGE)}
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
            <div
            className={currPage === Constants.USER_PROFILE ? "active" : undefined}
                onClick={async () => {setCurrPage(Constants.USER_PROFILE)}}
            >
                User Profile
            </div>
            <div
                onClick={async () => {
                    await axios.post('http://localhost:8000/logout')
                    setLoggedIn(false)
                }}
            >
                Logout
            </div>
        </div>
    )
}

// Can be exported to display on different pages depending on the page body.
export function AskQuestion() {
    const questionsInfo = useContext(QuestionsInfo);
    
    const setCurrPage = questionsInfo.setCurrPage;
    return (
        <div id="ask-question-container">
            <button id="ask-question" type="button" onClick={() => setCurrPage(Constants.POST_QUESTION_PAGE)}>Ask Question</button>
        </div>
    )
}
import { Menu } from './global';
import React, { useContext } from 'react';
import * as Constants from '../constants';
import QuestionsPage from './questionspage';
import PostQuestionPage from './PostQuestionPage';
import TagsPage from './TagsPage';
import { SeeAnswers } from './seeAnswers';
import { QuestionsInfo } from './fakestackoverflow';
import PostAnswerPage from './PostAnswerPage';

export default function Body() {
    return (
        <div id='body' className='body'>
            <Menu />
            <Main />
        </div>
    )
}

// MAKE SURE YOU'RE PASSING IN THE RIGHT PROPS
export function Main() {
    let mainContent;
    const currPage = useContext(QuestionsInfo).currPage;

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
        default:
            mainContent = <QuestionsPage />;
    }

    return (
        <div id='main' className='main'>
            {mainContent}
        </div>
    )
}
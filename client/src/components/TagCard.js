import { useContext, useEffect, useState } from 'react';
import * as Constants from '../constants';
import { QuestionsInfo } from './fakestackoverflow';
import axios from 'axios';

export default function TagCard(props) {
    const tag = props.tag;
    const [questions, setQuestions] = useState([]);
    useEffect(() => {
        const getQuestions = async () => {
            await axios.get('http://localhost:8000/tagQuestions', { params: tag })
            .then(res => { setQuestions(res.data) })
        }
        getQuestions();
    }, [tag])
    const questionsInfo = useContext(QuestionsInfo);
    const setCurrPage = questionsInfo.setCurrPage;
    const setCurrFilter = questionsInfo.setCurrFilter;
    const setDisplayedQuestions = questionsInfo.setDisplayedQuestions;
    const setNumQuestions = questionsInfo.setNumQuestions;
    const numQuestions = questions.length;
    return (
        <div className="tag-card">
            <button className="tag-link" onClick={() => {
                setDisplayedQuestions(questions);
                setNumQuestions(questions.length);
                setCurrFilter(Constants.NEWEST_FILTER);
                setCurrPage(Constants.QUESTIONS_PAGE);
             }}>
                {tag.name}
            </button>
            <div className='tag-card-num-question'>{numQuestions} question{(numQuestions !== 1) ? "s" : ""}</div>
        </div>
    )
}
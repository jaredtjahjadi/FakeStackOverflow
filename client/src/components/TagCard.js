import { useContext, useEffect, useState } from 'react';
import * as Constants from '../constants';
import { QuestionsInfo } from './HomePage';
import axios from 'axios';
import { ErrorMessage } from './PostQuestionPage';

export default function TagCard(props) {
    const tag = props.tag;
    const isUsers = props.isUsers
    const setUsedTags = props.setUsedTags
    const usedTags = props.usedTags
    const [questions, setQuestions] = useState([]);
    const [isEditing, setIsEditing] = useState(false)
    const [tagName, setTagName] = useState(tag.name)
    const [errMsg, setErrMsg] = useState("")

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
            {isEditing ? (<input id="tag-edit" value={tagName} onChange={(event) => setTagName(event.target.value)}/>)
            : (
                <button className="tag-link" onClick={() => {
                    setDisplayedQuestions(questions);
                    setNumQuestions(questions.length);
                    setCurrFilter(Constants.TAGS_FILTER);
                    setCurrPage(Constants.QUESTIONS_PAGE);
                }}>
                    {tagName}
                </button>
                )
            }
            <div className='tag-card-num-question'>
                {numQuestions} question{(numQuestions !== 1) ? "s" : ""}
                {isUsers && numQuestions === 0 && 
                <>
                    <br/>
                    {isEditing ? (
                        <button onClick={async () => {

                            let inputtedName = tagName.trim()
                            console.log(inputtedName)

                            if(inputtedName.indexOf(" ") !== -1) {
                                setErrMsg("Tags cannot contain more than one tag name.")
                                return
                            }

                            else if(inputtedName.length > 10) {
                                setErrMsg("Tag length must be no more than 10 characters.")
                                return
                            }

                            else if(inputtedName.length === 0) {
                                setErrMsg("Tag cannot be empty.")
                                return
                            }

                            try {
                                await axios.get(`http://localhost:8000/tagExists/${inputtedName}`)
                            } catch(error) {
                                setErrMsg("Tag already exists.")
                                return
                            }

                            setIsEditing(false)
                            setErrMsg("")
                            await axios.post('http://localhost:8000/modifyTag', {
                                tid: tag.tid,
                                name: inputtedName
                            })

                        }}>
                            Save
                        </button>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)}>Edit</button>
                            <button onClick={async () => {
                                await axios.post('http://localhost:8000/deleteTag', tag)
                                setUsedTags(usedTags.filter(t => t.tid !== tag.tid))
                                console.log(usedTags)
                            }}>
                                Delete
                            </button>
                        </>
                    )}
                    <ErrorMessage errMsg={errMsg} />
                </>
                }
            </div>
        </div>
    )
}
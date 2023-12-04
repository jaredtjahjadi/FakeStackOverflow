import { useContext, useState, useEffect } from "react";
import { QuestionsInfo } from "./HomePage";
import { DateMetadata, splitArray } from "./questionspage";
import { ErrorMessage } from "./PostQuestionPage";
import { Text } from "./seeAnswers";
import axios from "axios";

let commentChunkInd = 0;

export default function Comments(props) {
    const question = props.question;
    const emptyFieldStr = "This field must be filled out.";
    const questionsInfo = useContext(QuestionsInfo);
    const comments = questionsInfo.allComments;
    const setComments = questionsInfo.setAllComments;
    const currDisplayedComments = questionsInfo.currDisplayedComments;
    const setDisplayedComments = questionsInfo.setDisplayedComments;
    const [insertComment, showInsertComment] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        let isMounted = true;
        const getComments = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/${question.qid}/comments`)
                if(isMounted) {
                    setComments(res.data);
                    setDisplayedComments(res.data.slice(0, 3));
                    commentChunkInd = 0;
                }
            } catch(error) { console.log(error) }
        }
        getComments();
        return () => { isMounted = false; }
    }, [setDisplayedComments, question, setComments])

    const handleSubmit = async (event) => {
        event.preventDefault();
        const commentText = event.target.commenttext.value.trim();
        const commentUser = event.target.commentuser.value.trim();
        const errors = validateForm({commentText, commentUser});
        if(Object.keys(errors).length === 0) {
            try {
                event.target.reset();
                setFormErrors({});
                showInsertComment(!insertComment);
                await axios.post('http://localhost:8000/postQComment', {
                    text: commentText,
                    com_by: commentUser,
                    com_date_time: new Date(),
                    votes: 0,
                    qid: question.qid
                })
            } catch { console.log(errors); }
        } else setFormErrors(errors);
    }

    const validateForm = ({commentText, commentUser}) => {
        const errors = {};
        if(commentText.length === 0) errors.commentText = emptyFieldStr;
        const tokens = commentText.match(/\[[^\]]*\]\([^)]*\)/g); // [...](...). "..." = anything (including empty string)
        const regex = /\[.+?\]\(\s*(https:\/\/|http:\/\/)[^)](.*?)\)/g; // [text](link)
        if(tokens) {
            for(let token of tokens) if(!regex.test(token))
                errors.ansText = "Hyperlink in answer text invalid. Must be of the form [text](link).";
        }
        if(commentUser.length === 0) errors.commentUser = emptyFieldStr;
        return errors;
    }

    return (
        <div className="question-comment-container">
            <div className="question-comment">
                {console.log(currDisplayedComments)}
                {currDisplayedComments.map((c) => <Comment key={c.cid} comment={c} />)}
                </div>
            {insertComment
                ? <form id='post-comment' onSubmit={handleSubmit}>
                    <input type='text' name='commenttext' />
                    {formErrors.commentText && <ErrorMessage errMsg={formErrors.commentText} />}
                    <input type='text' name='commentuser' />
                    {formErrors.commentUser && <ErrorMessage errMsg={formErrors.commentUser} />}
                    <input type='submit' value="Post Comment" />
                </form>
                : <div id="add-comment-container"><button id="add-comment" type="button" onClick={() => {showInsertComment(!insertComment)}}>Add Comment</button></div>
            }
            {comments.length > 3 && <CommentNav coms={comments} setDisplayedComments={setDisplayedComments} />}
        </div>
    )
}

function Comment({comment}) {
    return (
        <div className="comment-container">
            <div><Text text={comment.text} /></div>
            <DateMetadata comment={comment} />
        </div>
    )
}

function CommentNav(props) {
    const commentChunks = splitArray(props.coms, 3);
    const setDisplayedComments = props.setDisplayedComments;

    return (
        <div id="nav-button-container">
            <div id="prev-button" onClick={() => {
                if(commentChunkInd > 0) {
                    commentChunkInd--;
                    setDisplayedComments(commentChunks[commentChunkInd]);
                }
            }}>◄ Prev</div>
            <div id="next-button" onClick={() => {
                if(commentChunkInd < commentChunks.length - 1) {
                    commentChunkInd++;
                    setDisplayedComments(commentChunks[commentChunkInd]);
                }
            }}>Next ►</div>
        </div>
    )
}
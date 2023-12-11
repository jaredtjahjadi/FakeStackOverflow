import { useState, useEffect } from "react";
import { DateMetadata, splitArray } from "./QuestionsPage";
import { ErrorMessage } from "./PostQuestionPage";
import { Text } from "./SeeAnswers";
import * as Constants from '../constants';
import axios from "axios";

let commentChunkInd = 0;

/*
    TODO:
    Fix issue: When there are multiple pages for a comments section, clicking on Next will show the next
    page of comments for a split second and then go back to the first page.
*/
export default function Comments(props) {
    let question = props.question;
    let answer = props.answer;
    const [comments, setComments] = useState([]);
    const [currDisplayedComments, setDisplayedComments] = useState([]);
    const [insertComment, showInsertComment] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Fetch comments for a given question or answer
    useEffect(() => {
        const getComments = async () => {
            try {
                let res;
                if(question) res = await axios.get(`http://localhost:8000/questions/${question.qid}/comments`);
                if(answer) res = await axios.get(`http://localhost:8000/answers/${answer.aid}/comments`);
                setComments(res.data.reverse()); // Newest first
            } catch(error) { console.log(error) }
        }
        getComments();
    }, [question, answer])

    // Comments rerenders only when the comments varaible changes
    useEffect(() => { setDisplayedComments(comments.slice(commentChunkInd * 3, (commentChunkInd * 3) + 3)) }, [comments])

    const handleSubmit = async (event) => {
        event.preventDefault();
        const commentText = event.target.commenttext.value.trim();
        const errors = validateForm({commentText});
        if(Object.keys(errors).length === 0) {
            try {
                event.target.reset();
                setFormErrors({});
                showInsertComment(!insertComment);
                let comment;
                if(question) {
                    comment = {
                        text: commentText,
                        comDate: new Date(),
                        votes: 0,
                        qid: question.qid
                    }
                }
                if(answer) {
                    comment = {
                        text: commentText,
                        comDate: new Date(),
                        votes: 0,
                        aid: answer.aid
                    }
                }
                await axios.post('http://localhost:8000/postComment', comment)
                setComments([comment, ...comments])
            } catch(error) {
                console.log(error);
                alert(error.response.data.message);
            }
        } else setFormErrors(errors);
    }

    const validateForm = ({commentText}) => {
        const errors = {};
        if(commentText.length === 0) errors.commentText = Constants.EMPTY_FIELD_ERROR;
        const tokens = commentText.match(/\[[^\]]*\]\([^)]*\)/g); // [...](...). "..." = anything (including empty string)
        const regex = /\[.+?\]\(\s*(https:\/\/|http:\/\/)[^)](.*?)\)/g; // [text](link)
        if(tokens) {
            for(let token of tokens) if(!regex.test(token))
                errors.ansText = "Hyperlink in answer text invalid. Must be of the form [text](link).";
        }
        return errors;
    }

    return (
        <div className="comment-container">
            <div className="comments">{currDisplayedComments.map((c) => <Comment key={c.cid} comment={c} />)}</div>
            
            {props.isAuthenicated && (insertComment
                ? <form id='post-comment' onSubmit={handleSubmit}>
                    <input type='text' name='commenttext' />
                    {formErrors.commentText && <ErrorMessage errMsg={formErrors.commentText} />}
                    <input type='submit' value="Post Comment" />
                </form>
                : <div id="add-comment-container"><button id="add-comment" type="button" onClick={() => {showInsertComment(!insertComment)}}>Add Comment</button></div>
            )}
            {comments.length > 3 && <CommentNav coms={comments} setDisplayedComments={setDisplayedComments} />}
        </div>
    )
}

function Comment({comment}) {
    const [username, setUsername] = useState('');
    const [votes, setVotes] = useState(comment.votes);
    useEffect(() => {
        const getCommentUsername = async () => {
            await axios.get('http://localhost:8000/userData', {params: comment })
            .then(res => { setUsername(res.data) })
        }
        getCommentUsername();
    }, [comment])

    return (
        <div className="comment">
            <div className="votes">
                    <p className="upvote" onClick={() => {
                        const incCVote = async() => {
                            const c = comment;
                            c.votes++;
                            setVotes(c.votes);
                            try { await axios.post('http://localhost:8000/incCVote', comment) }
                            catch(error) { console.log(error) }
                        }
                        incCVote();
                    }}>🡅</p>
                    {votes}
                </div>
            <div><Text text={comment.text} /></div>
            <DateMetadata comment={comment} user={username} />
        </div>
    )
}

function CommentNav(props) {
    const commentChunks = splitArray(props.coms, 3);
    const setDisplayedComments = props.setDisplayedComments;

    return (
        <div id="nav-button-container">
            {commentChunkInd !== 0 && 
                <div id="prev-button" onClick={() => {
                    if(commentChunkInd > 0) {
                        commentChunkInd--;
                        setDisplayedComments(commentChunks[commentChunkInd]);
                    }
                }}>◄ Prev</div>
            }
            {commentChunkInd === 0 && <div />}
            {commentChunkInd !== commentChunks.length - 1 &&
                <div id="next-button" onClick={() => {
                    if(commentChunkInd < commentChunks.length - 1) {
                        commentChunkInd++;
                        setDisplayedComments(commentChunks[commentChunkInd]);
                    }
                }}>Next ►</div>
            }
        </div>
    )
}
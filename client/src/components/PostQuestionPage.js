import { useContext, useState, useEffect } from 'react';
import FormField from './FormField';
import * as Constants from '../constants';
import { QuestionsInfo } from './HomePage';
import axios from 'axios'

export default function PostQuestionPage() {
    const questionsInfo = useContext(QuestionsInfo);
    const setCurrPage = questionsInfo.setCurrPage;
    const getNewestQuestions = questionsInfo.getNewestQuestions
    const currDisplayedPost = questionsInfo.currDisplayedPost
    const [formErrors, setFormErrors] = useState({});

    // Decides certain display depending on either posting or modifying
    const isModifying = questionsInfo.currPage === Constants.MODIFY_QUESTION_PAGE;

    /**
     * These states are used to modify the inputs of the form if the form is used for
     * modification rather than posting a new question.
     */

    const [questionTitle, setQuestionTitle] = useState(currDisplayedPost.title)
    const [questionSummary, setQuestionSummary] = useState(currDisplayedPost.summary)
    const [questionText, setQuestionText] = useState(currDisplayedPost.text)
    const [questionTags, setQuestionTags] = useState(currDisplayedPost.tags)

    // We retrieve the tags and convert it to string format to insert into the Tags form.
    useEffect(() => {
        const getTags = async () => {
            await axios.get('http://localhost:8000/tags', {params: currDisplayedPost.tagIds})
            .then(res => {
                console.log(res)
                console.log(currDisplayedPost)
                let tagsInput = ""
                res.data.map(tag => tagsInput += tag.name + " ")
                setQuestionTags(tagsInput)
            })
        }
        getTags();
    }, [currDisplayedPost])

    const handleSubmit = async (event) => {
        event.preventDefault(); // Stop the page from refreshing
        const questionTitle = event.target.title.value.trim();
        const questionSummary = event.target.summary.value.trim();
        const questionTagStr = event.target.tags.value.trim();
        const inputTags = questionTagStr.split(" ");
        const questionTags = inputTags.filter(inputTag => inputTag !== "").map(inputTag => inputTag.toLowerCase());
        const questionText = event.target.qtext.value.trim();
        const errors = validateForm({questionTitle, questionSummary, questionText, questionTagStr, questionTags});
        // If no errors in form (all fields are valid)
        if(Object.keys(errors).length === 0) {
            try {
                /**
                 * TODO (Jared)
                 * Fix issue: Upon submit, the questions page loads with newest filter, but the question that was
                 * just submitted does not appear. In the below section, putting setCurrPage and setCurrFilter under
                 * the Axios post request does not seem to work.
                 * 
                 * EDIT: FIXED, passing in the getNewestQuestions in the context and calling it refreshes it now.
                 */
                event.target.reset();
                setFormErrors({});
                if(isModifying) {
                    const questionData = {
                        qid: currDisplayedPost.qid,
                        title: questionTitle,
                        summary: questionSummary,
                        text: questionText,
                        tags: questionTags,
                    }
                    await axios.post('http://localhost:8000/modifyQuestion', questionData)
                    setCurrPage(Constants.USER_PROFILE);
                }
                
                else {
                    const questionData = {
                        title: questionTitle,
                        summary: questionSummary,
                        text: questionText,
                        tags: questionTags,
                        answers: [],
                        ask_date_time: new Date(),
                        views: 0,
                        votes: 0,
                        comments: []
                    }
                    await axios.post('http://localhost:8000/addQuestion', questionData)
                    await getNewestQuestions()
                    setCurrPage(Constants.QUESTIONS_PAGE);
                }
            } catch (error) {
                console.log(error);
                alert(error.response.data.message)
            }
        } else setFormErrors(errors);
    }

    const handleDelete = async () => {
        await axios.post('http://localhost:8000/deleteQuestion', {qid: currDisplayedPost.qid})
        await getNewestQuestions()
    }

    // Form validation: Add corresponding property to errors object if an error is found
    const validateForm = ({ questionTitle, questionSummary, questionText, questionTagStr, questionTags, questionUsername }) => {
        const errors = {};

        // Title validation
        if (questionTitle.length === 0) errors.questionTitle = Constants.EMPTY_FIELD_ERROR;
        else if (questionTitle.length > 100) errors.questionTitle = "Question title must be no more than 100 characters.";

        // Summary validation
        if(questionSummary.length === 0) errors.questionTile = Constants.EMPTY_FIELD_ERROR;
        else if (questionSummary.length > 140) errors.questionSummary = "Question summary must be no more than 140 characters.";

        // Text validation
        if (questionText.length === 0) errors.questionText = Constants.EMPTY_FIELD_ERROR;
        // Hyperlink validation
        const tokens = questionText.match(/\[[^\]]*\]\([^)]*\)/g); // [...](...). "..." = anything (including empty string)
        const regex = /\[.+?\]\((https:\/\/|http:\/\/)[^)](.*?)\)/g; // [text](link)
        // If potential hyperlinks are present in the question text, test them if they are valid against the regex
        if(tokens) for(let token of tokens) if(!regex.test(token)) errors.questionText = "Hyperlink in question text invalid. Must be of the form [text](link).";
        if(questionTagStr.length === 0) errors.questionTags = Constants.EMPTY_FIELD_ERROR;
        if(questionTags.length > 5) errors.questionTags = "No more than five tags for one question."; // Ensure there are no more than 5 tags
        // Ensure each tag is no more than 10 characters
        for(var i = 0; i < questionTags.length; i++) {
            let lower = questionTags[i].toLowerCase();
            if((lower !== "shared-preferences" || lower !== "web-scripting" || lower !== "android-studio") && lower.length > 10)
                if(lower.length > 10) errors.questionTags = "Tag length must be no more than 10 characters.";
        }
        //if(questionUsername.length === 0) errors.questionUsername = Constants.EMPTY_FIELD_ERROR;
        return errors;
    };

    return (
        <div id="new-question">
            <form id="new-question-form" name="new-question" onSubmit={handleSubmit}>
                <FormField
                    id="question-title"
                    title="Question Title"
                    instrs="Limit title to 100 characters or less"
                    input={true}
                    name='title'
                    value={isModifying ? questionTitle : null}
                    onChange={isModifying ? (event) => setQuestionTitle(event.target.value) : null}
                />
                {formErrors.questionTitle && <ErrorMessage errMsg={formErrors.questionTitle} />}
                <FormField
                    id="question-summary"
                    title="Question Summary"
                    input={true}
                    name='summary'
                    value={isModifying ? questionSummary : null}
                    onChange={isModifying ? (event) => setQuestionSummary(event.target.value) : null}
                />
                {formErrors.questionText && <ErrorMessage errMsg={formErrors.questionText} />}
                <FormField
                    id="question-text"
                    title="Question Text"
                    instrs="Add details"
                    input={false}
                    name='qtext'
                    value={isModifying ? questionText : null}
                    onChange={isModifying ? (event) => setQuestionText(event.target.value) : null}
                />
                {formErrors.questionText && <ErrorMessage errMsg={formErrors.questionText} />}
                <FormField
                    id="question-tags"
                    title="Tags"
                    instrs="Add keywords separated by whitespace"
                    input={true}
                    name='tags'
                    value={isModifying ? questionTags : null}
                    onChange={isModifying ? (event) => setQuestionTags(event.target.value) : null}
                />
                {formErrors.questionTags && <ErrorMessage errMsg={formErrors.questionTags} />}
                <div id="end-form">
                    <input className="submit-button" type="submit" value="Post Question" />
                    {isModifying && <input className="submit-button" type="submit" value="Delete Question" onClick={handleDelete}/>}
                    <div id="mandatory-fields">* indicates mandatory fields</div>
                </div>
            </form>
        </div>
    )
}

export function ErrorMessage(props) { return ( <div className='error-message'>{props.errMsg}</div> ) }
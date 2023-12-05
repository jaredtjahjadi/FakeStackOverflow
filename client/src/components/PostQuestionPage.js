import { useContext, useState, useEffect } from 'react';
import FormField from './FormField';
import * as Constants from '../constants';
import { QuestionsInfo } from './HomePage';
import axios from 'axios'

/**
 * FOR JARED (VERY IMPORTANT)
 * 
 * I realized that modifying a question is the same form as the PostQuestion form, 
 * so this component could be used for both purposes.
 * 
 * The idea here is that we check the page to see if we are either modifying or
 * posting. If we're posting, then we can proceed as usual when you did earlier
 * homeworks. If we're modifying, then we add a Delete Question button and fill
 * the fields with the question being modified using states to keep track of the
 * modifications using conditional rendering. We'll also use the boolean isModifiying
 * to choose whether to use the inputted data to make a new question or modify a 
 * question.
 * 
 * Don't worry about the warning regarding values and onChange. That has to do
 * with the Username component which we'll remove later.
 * 
 * TLDR It would've been messy to make a new form that does almost the same exact
 * thing so I borrowed your component to make my life easier :3
 * 
 * - @author el torino 
 * (wow I forgot I can do that with jsdoc)
 */

export default function PostQuestionPage() {
    const emptyFieldStr = "This field must be filled out."
    const questionsInfo = useContext(QuestionsInfo);
    const setCurrPage = questionsInfo.setCurrPage;
    const getNewestQuestions = questionsInfo.getNewestQuestions
    const currDisplayedQuestion = questionsInfo.currDisplayedQuestion
    const [formErrors, setFormErrors] = useState({});

    // Decides certain display depending on either posting or modifying
    const isModifying = questionsInfo.currPage === Constants.MODIFY_QUESTION_PAGE;

    /**
     * These states are used to modify the inputs of the form if the form is used for
     * modification rather than posting a new question.
     */

    const [questionTitle, setQuestionTitle] = useState(currDisplayedQuestion.title)
    const [questionSummary, setQuestionSummary] = useState(currDisplayedQuestion.summary)
    const [questionText, setQuestionText] = useState(currDisplayedQuestion.text)
    const [questionTags, setQuestionTags] = useState(currDisplayedQuestion.tags)

    /**
     * We retrieve the tags and convert it to string format to insert into the Tags form.
     */

    useEffect(() => {
        const getTags = async () => {
            await axios.get('http://localhost:8000/tags', {params: currDisplayedQuestion.tags})
                .then(res => {
                    let tagsInput = ""
                    res.data.map(tag => tagsInput += tag.name + " ")
                    setQuestionTags(tagsInput)
                })
        }
        
        getTags();
    }, [currDisplayedQuestion])

    const handleSubmit = async (event) => {
        event.preventDefault(); // Stop the page from refreshing
        const questionTitle = event.target.title.value.trim();
        const questionSummary = event.target.summary.value.trim();
        const questionTagStr = event.target.tags.value.trim();
        const inputTags = questionTagStr.split(" ");
        const questionTags = inputTags.filter(inputTag => inputTag !== "").map(inputTag => inputTag.toLowerCase());
        const questionText = event.target.qtext.value.trim();
        const questionUsername = event.target.quser.value.trim();
        const errors = validateForm({questionTitle, questionSummary, questionText, questionTagStr, questionTags, questionUsername});
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
                        _id: currDisplayedQuestion._id,
                        title: questionTitle,
                        summary: questionSummary,
                        text: questionText,
                        tags: questionTags,
                    }
                    await axios.post('http://localhost:8000/modifyQuestion', questionData)
                }
                
                else {
                    const questionData = {
                        title: questionTitle,
                        summary: questionSummary,
                        text: questionText,
                        tags: questionTags,
                        answers: [],
                        asked_by: questionUsername,
                        ask_date_time: new Date(),
                        views: 0,
                        votes: 0,
                        comments: []
                    }
                    await axios.post('http://localhost:8000/addQuestion', questionData)
                }

                await getNewestQuestions()
                setCurrPage(Constants.QUESTIONS_PAGE);
            } catch (error) { console.log(error); }
        } else setFormErrors(errors);
    }

    const handleDelete = async () => {
        await axios.post('http://localhost:8000/deleteQuestion', {_id: currDisplayedQuestion._id})
    }

    // Form validation: Add corresponding property to errors object if an error is found
    const validateForm = ({ questionTitle, questionSummary, questionText, questionTagStr, questionTags, questionUsername }) => {
        const errors = {};

        // Title validation
        if (questionTitle.length === 0) errors.questionTitle = emptyFieldStr;
        else if (questionTitle.length > 100) errors.questionTitle = "Question title must be no more than 100 characters.";

        // Summary validation
        if(questionSummary.length === 0) errors.questionTile = emptyFieldStr;
        else if (questionSummary.length > 140) errors.questionSummary = "Question summary must be no more than 140 characters.";
    
        // Text validation
        if (questionText.length === 0) errors.questionText = emptyFieldStr;
        // Hyperlink validation
        const tokens = questionText.match(/\[[^\]]*\]\([^)]*\)/g); // [...](...). "..." = anything (including empty string)
        const regex = /\[.+?\]\((https:\/\/|http:\/\/)[^)](.*?)\)/g; // [text](link)
        // If potential hyperlinks are present in the question text, test them if they are valid against the regex
        if(tokens) for(let token of tokens) if(!regex.test(token)) errors.questionText = "Hyperlink in question text invalid. Must be of the form [text](link).";
        if(questionTagStr.length === 0) errors.questionTags = emptyFieldStr;
        if(questionTags.length > 5) errors.questionTags = "No more than five tags for one question."; // Ensure there are no more than 5 tags
        // Ensure each tag is no more than 10 characters
        for(var i = 0; i < questionTags.length; i++) {
            let lower = questionTags[i].toLowerCase();
            if((lower !== "shared-preferences" || lower !== "web-scripting" || lower !== "android-studio") && lower.length > 10)
                if(lower.length > 10) errors.questionTags = "Tag length must be no more than 10 characters.";
        }
        //if(questionUsername.length === 0) errors.questionUsername = emptyFieldStr;
        return errors;
    };

    /**
     * TODO (Jared): Double-check if only one error is allowed to appear at a time or if multiple errors can appear. If the latter, fix below code.
     */
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
                    input={false}
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
                <FormField
                    id="question-username"
                    title="Username"
                    input={true}
                    name='quser'
                />                
                {formErrors.questionUsername && <ErrorMessage errMsg={formErrors.questionUsername} />}
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
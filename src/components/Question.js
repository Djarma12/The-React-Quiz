import Options from "./Options";

function Question({ displayQuestions, question, dispatch, answer }) {
  return (
    <div>
      <h4>{question.question}</h4>
      <Options
        displayQuestions={displayQuestions}
        question={question}
        dispatch={dispatch}
        answer={answer}
      />
    </div>
  );
}

export default Question;

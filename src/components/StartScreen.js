function StartScreen({ numQuestions, dispatch, children }) {
  return (
    <div className="start">
      <h2>Welcome to The React Quiz!</h2>
      <h3>{numQuestions} questions to test your React mastery</h3>
      {children}
      <button
        className="btn btn-ui"
        onClick={() => dispatch({ type: "start", payload: numQuestions })}
      >
        Let's start
      </button>
    </div>
  );
}

export default StartScreen;

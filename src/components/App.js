import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";
import Timer from "./Timer";
import Footer from "./Footer";
import PrevButton from "./PrevButton";
import FilterQuestion from "./FilterQuestion";

const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],

  // 'loading', 'error', 'ready', 'active', 'finished'
  status: "loading",
  filterQuestion: "all",
  index: 0,
  answer: null,
  answerHistory: [],
  points: 0,
  highscore: 0,
  secondsRemaining: null,
};

function reducer(state, action) {
  // console.log(state, action);
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };
    case "highscoreReceived":
      return {
        ...state,
        status: "ready",
        highscore: action.payload,
      };
    case "dataFaild":
      return {
        ...state,
        status: "error",
      };
    case "filterQuestions":
      return { ...state, filterQuestion: action.payload };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: action.payload * SECS_PER_QUESTION,
      };
    case "newAnswer":
      const question = action.payload.displayQuestions.at(state.index);

      return {
        ...state,
        answer: action.payload.index,
        points:
          action.payload.index === question.correctOption
            ? state.points + question.points
            : state.points,
        answerHistory: [...state.answerHistory, action.payload.index],
      };
    case "nextQuestion":
      return {
        ...state,
        index: state.index + 1,
        answer: state.answerHistory[state.index + 1]
          ? state.answerHistory[state.index + 1]
          : null,
      };
    case "prevQuestion":
      return {
        ...state,
        index: state.index - 1,
        answer: state.answerHistory[state.index - 1],
      };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };
    case "restart":
      return {
        ...initialState,
        questions: state.questions,
        highscore: state.highscore,
        status: "ready",
      };
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    default:
      throw new Error("Action unknown");
  }
}

export default function App() {
  const [
    {
      questions,
      status,
      index,
      answer,
      points,
      highscore,
      secondsRemaining,
      filterQuestion,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  let displayQuestions;
  if (filterQuestion === "easy")
    displayQuestions = questions.filter((question) => question.points === 10);
  else if (filterQuestion === "medium")
    displayQuestions = questions.filter((question) => question.points === 20);
  else if (filterQuestion === "advanced")
    displayQuestions = questions.filter((question) => question.points === 30);
  else displayQuestions = questions;

  const numQuestions = displayQuestions.length;
  const maxPossiblePoints = displayQuestions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );

  // Load questions and highscore in the state
  useEffect(function () {
    fetch("http://localhost:8000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((err) => dispatch({ type: "dataFaild" }));
  }, []);
  useEffect(function () {
    fetch("http://localhost:8000/highscore")
      .then((res) => res.json())
      .then((data) => {
        dispatch({ type: "highscoreReceived", payload: data.highscore });
      })
      .catch((err) => dispatch({ type: "dataFaild" }));
  }, []);

  useEffect(
    function () {
      if (status === "finished") {
        fetch("http://localhost:8000/highscore", {
          method: "POST",
          body: JSON.stringify({ highscore: highscore }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            // Handle the response if necessary
            console.log("Highscore updated:", data);
          })
          .catch((err) => dispatch({ type: "dataFaild" }));
      }
    },
    [status, highscore]
  );

  return (
    <div className="app">
      <Header />

      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch}>
            <FilterQuestion dispatch={dispatch} />
          </StartScreen>
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question
              displayQuestions={displayQuestions}
              question={displayQuestions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <PrevButton dispatch={dispatch} index={index} />
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                index={index}
                numQuestions={numQuestions}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishScreen
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
}

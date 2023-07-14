function PrevButton({ dispatch, index }) {
  if (index > 0)
    return (
      <button
        style={{ float: "left", marginRight: "1rem" }}
        className="btn btn-ui"
        onClick={() => dispatch({ type: "prevQuestion" })}
      >
        Previous
      </button>
    );
}

export default PrevButton;

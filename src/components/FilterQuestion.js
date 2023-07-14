function FilterQuestion({ dispatch }) {
  return (
    <select
      className="btn"
      style={{ marginInline: "auto", marginBottom: "2rem" }}
      onChange={(e) =>
        dispatch({ type: "filterQuestions", payload: e.target.value })
      }
    >
      <option value="all">All</option>
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="advanced">Advanced</option>
    </select>
  );
}

export default FilterQuestion;

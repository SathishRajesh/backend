import React from "react";
import axios from "axios";

export default function App() {
  const [inputVal, setInputVal] = React.useState("");
  const [userList, setUserList] = React.useState([]);

  const handleChange = (e) => {
    const { value = "" } = e?.target || {};
    setInputVal(value);
  };
  const handleSave = () => {
    if (!inputVal) return;
    axios
      .post("http://localhost:5000/create/user", { user: inputVal })
      .then((res) => {
        setUserList((prev) => {
          const arr = [...prev];
          arr.push(inputVal);
          return arr;
        });
        setInputVal("");

        if (res.data.message) {
          alert(res.data.message);
        }
      })
      .catch((err) => {
        if (err.data.message) {
          alert(err.data.message);
        }
      });
  };

  React.useEffect(() => {
    axios
      .get("http://localhost:5000/get-all")
      .then((res) => {
        const { data = [] } = res?.data || {};
        if (data && data?.length) {
          setUserList(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <input value={inputVal} onChange={handleChange} />
      <button onClick={handleSave}> add </button>

      {/* Render */}
      <div>
        {userList && userList?.length
          ? userList.map((x, idx) => (
              <div key={idx}>
                {" "}
                {x} <button> delete </button>{" "}
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

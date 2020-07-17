import React, { useEffect, useState, useRef } from "react";
import { stringifyUrl } from "query-string";
import { useQuery } from "react-query";
import Measure from "react-measure";
import Graph from "./Graph";
import "./App.css";

const Input = ({ width = 500, height = 75 }) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="search" style={{ maxWidth: width, height }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder="Search!"
        style={{ fontSize: 24 }}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
      {value.length > 0 && (
        <button
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
        >
          <i className="icon ion-android-close" />
        </button>
      )}
      {loading ? (
        <button disabled={true}>
          <div className="loader" />
        </button>
      ) : (
        <button
          onClick={(event) => {
            event.preventDefault();

            setLoading(true);

            if (value.length > 0) {
            }
          }}
        >
          <i className="icon ion-android-search" />
        </button>
      )}
    </div>
  );
};

const App = () => {
  useEffect(() => {
    let fetchData = async () => {
      let url = stringifyUrl({
        url: "http://localhost:4004/api/evaluate",
        query: {
          expr: "Albert Einstein",
        },
      });

      let res = await fetch(url, {
        method: "GET",
      });

      let json = await res.json();

      console.log("json", json);
    };

    fetchData();
  }, []);
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "hsl(0, 0%, 10%)",
        overflow: "hidden",
        flexDirection: "column",
      }}
    >
      <Input />
      <Measure bounds client>
        {({ contentRect }) => {
          console.log("contentRect", contentRect);
          return <Graph />;
        }}
      </Measure>
    </div>
  );
};

export default App;

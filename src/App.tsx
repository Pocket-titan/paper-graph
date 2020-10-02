import React, { useEffect, useState, useRef } from "react";
import _ from "lodash";
import { stringifyUrl } from "query-string";
import Measure from "react-measure";
import Graph from "./Graph";
import "./App.css";

const delay = (ms: number): Promise<never> =>
  new Promise((resolve, reject) => {
    setTimeout(() => reject("Took too long!"), ms);
  });

type Result = {
  Ty: "0";
  Id: number;
  Ti: string;
  AA: {
    AuN: string;
  };
  logprob: number;
  prob: number;
  CC: number;
  CitCon: { [Id: string]: string[] };
};

const Input = ({ width = 500, height = 75 }) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [results, setResults] = useState([] as Result[]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedAutocomplete = useRef(
    _.debounce(async (input: string) => {
      setLoading(true);

      try {
        let url = stringifyUrl({
          url: "http://localhost:4004/api/results",
          query: {
            input,
          },
        });

        let res = await fetch(url, { method: "GET" });
        let results = (await res.json()) as Result[];
        setResults(results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 1000)
  );

  const fetchGraph = async (Id: number) => {
    setIsInputDisabled(true);
    setLoading(true);

    try {
      let url = stringifyUrl({
        url: "http://localhost:4004/api/papers",
        query: {
          Id: Id.toString(),
        },
      });

      let res = await Promise.race([
        fetch(url, { method: "GET" }),
        delay(2000),
      ]);
      let json = await res.json();

      console.log("json", json);
    } catch (error) {
    } finally {
      setIsInputDisabled(false);
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", width }}>
      <div className="search" style={{ maxWidth: width, height }}>
        <input
          disabled={isInputDisabled}
          ref={inputRef}
          type="text"
          value={value}
          placeholder="Search!"
          style={{ fontSize: 24 }}
          onChange={({ target: { value } }) => {
            setValue(value);

            if (value.length === 0) {
              debouncedAutocomplete.current.cancel();
              setResults([]);
            } else {
              debouncedAutocomplete.current(value);
            }
          }}
        />
        {value.length > 0 && (
          <button
            className="clear-button"
            disabled={isInputDisabled}
            onClick={() => {
              setValue("");
              setResults([]);
              debouncedAutocomplete.current.cancel();
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
            className="search-button"
            onClick={(event) => {
              event.preventDefault();

              if (value.length > 0) {
                debouncedAutocomplete.current.flush();
              }
            }}
          >
            <i className="icon ion-android-search" />
          </button>
        )}
      </div>
      <div
        className="results"
        style={{
          zIndex: 999,
          position: "absolute",
          top: "100%",
          width,
          overflow: "hidden",
        }}
      >
        {results.map((result) => (
          <div
            key={result.Id}
            className="result"
            onClick={() => {
              setResults([]);
              fetchGraph(result.Id);
            }}
          >
            {result.Ti}
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
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

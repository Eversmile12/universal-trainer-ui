"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

type UrlData = {
  url: string;
  maxPages?: number;
  completed: boolean;
  jobId?: string;
  status?: number | undefined;
  startTime?: number | null;
  endTime?: number | null;
  timeElapsed?: string | null;
};

const UrlTrainer = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [maxPages, setMaxPages] = useState<number>(10);

  const calculateElapsedTime = (startTime: number) => {
    const elapsedTime = Date.now() - startTime;
    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    // Retrieve data from local storage on component mount
    const storedUrls = localStorage.getItem("urls");
    if (storedUrls) {
      setUrls(JSON.parse(storedUrls));
    }
  }, []);

  useEffect(() => {
    // Update local storage whenever the urls state changes
    localStorage.setItem("urls", JSON.stringify(urls));
  }, [urls]);

  const addUrl = () => {
    console.log("adding url");
    if (inputUrl) {
      // Check if the input is a comma-separated list
      if (inputUrl.includes(",")) {
        // Split the input on commas
        const urlList = inputUrl.split(",");

        // Process each URL individually
        urlList.forEach((url) => {
          let trimmedUrl = url.trim(); // Remove any leading/trailing whitespace
          if (!isUrl(trimmedUrl)) {
            trimmedUrl = "https://" + trimmedUrl;
            if (!isUrl(trimmedUrl)) {
              alert("Only urls are allowed");
              return;
            }
          }
          if (trimmedUrl) {
            setUrls((prevState) => {
              // Check if the URL is already in the state
              if (prevState.some((urlData) => urlData.url === trimmedUrl)) {
                console.log("URL already added");
                return prevState; // Return the previous state unchanged
              }

              // Add the URL to the state
              return [
                ...prevState,
                {
                  url: trimmedUrl,
                  maxPages: maxPages,

                  completed: false,
                },
              ];
            });
          }
        });
      } else {
        let trimmedUrl = inputUrl.trim();

        if (!isUrl(trimmedUrl)) {
          trimmedUrl = "https://" + trimmedUrl;
          if (!isUrl(trimmedUrl)) {
            alert("Only urls are allowed");
            return;
          }
        }
        const urlObject = new URL(trimmedUrl);
        const domain = urlObject.hostname;

        // Check if the domain has a dot (.) followed by a domain extension
        if (!/\.\w+$/.test(domain)) {
          console.log("URL does not have a domain extension:", trimmedUrl);
          return; // Skip adding the URL without a domain extension
        }
        // If the input is not a comma-separated list, but is a valid URL, add it to the state
        setUrls((prevState) => {
          // Check if the URL is already in the state
          if (prevState.some((urlData) => urlData.url === trimmedUrl)) {
            console.log("URL already added");
            return prevState; // Return the previous state unchanged
          }

          // Add the URL to the state
          return [
            ...prevState,
            {
              url: trimmedUrl,
              maxPages: maxPages,
              completed: false,
            },
          ];
        });
      }
      if (maxPages < 300) {
        setUrls((prevState) => prevState.slice(0, 20));
      } else if (maxPages <= 500) {
        setUrls((prevState) => prevState.slice(0, 15));
      } else if (maxPages < 800) {
        setUrls((prevState) => prevState.slice(0, 10));
      }
      // Clear the input field
      setInputUrl("");
    }
  };

  const removeUrl = (url: string) => {
    const confirmed = confirm(
      "If already started, deleting this won't stop the training process, it will just delete the page from this list"
    );
    if (confirmed) {
      setUrls((prevState) => prevState.filter((data) => data.url !== url));

      // Remove the URL from local storage
      const storedUrls = localStorage.getItem("urls");
      if (storedUrls) {
        const updatedUrls = JSON.parse(storedUrls).filter(
          (data: UrlData) => data.url !== url
        );
        localStorage.setItem("urls", JSON.stringify(updatedUrls));
      }
    }
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);

    if (value >= 1) {
      setMaxPages(value);
      if (urls.length) {
        if (value < 300) {
          setUrls((prevState) => prevState.slice(0, 20));
        } else if (value < 500) {
          setUrls((prevState) => prevState.slice(0, 15));
        } else if (value <= 800) {
          setUrls((prevState) => prevState.slice(0, 10));
        } else {
          alert("Number should be less than or equal to 800");
          setMaxPages(800);
        }
      }
    } else {
      setMaxPages(1);
    }
  };
  const trainUrls = async () => {
    const urlsToSend = urls.filter((data) => !data.jobId);
    if (urlsToSend.length) {
      const confirmed = confirm(
        `Start training the following ${
          urls.filter((url) => !url.jobId).length
        } website(s)?`
      );
      if (!confirmed) return;
      const updatedUrls = [...urls];

      await Promise.all(
        urlsToSend.map(async (data) => {
          const response = await fetch(
            "https://s77iy3mjfe.execute-api.eu-central-1.amazonaws.com/Stage/start-workflow",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: "asd",
                url: data.url,
                MAX_PAGES: data.maxPages,
                // Include the jobId in the payload
              }),
            }
          ).then((response) => response.json());
          console.log(response);
          const urlIndex = updatedUrls.findIndex(
            (urlData) => urlData.url === data.url
          );
          if (urlIndex !== -1) {
            updatedUrls[urlIndex].jobId = response.jobId;
            updatedUrls[urlIndex].status = 0;
            const startTime = Date.now();
            updatedUrls[urlIndex].startTime = startTime;
          }
        })
      );

      setUrls(updatedUrls);
    } else {
      alert("Add a new website to start training");
    }
  };
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setUrls((prevUrls) => {
  //       return prevUrls.map((data) => {
  //         if (data.startTime && !data.completed) {
  //           return {
  //             ...data,
  //             timeElapsed: ,
  //           };
  //         }
  //         return data;
  //       });
  //     });
  //   }, 5000);

  //   return () => clearInterval(intervalId);
  // }, []);
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("fetching statuses");
      urls.forEach((data, index) => {
        if (!data.completed) {
          if (data.jobId && data.startTime) {
            fetch(
              `https://s77iy3mjfe.execute-api.eu-central-1.amazonaws.com/Stage/get-job-status?jobId=${data.jobId}`
            )
              .then((res) => res.json())
              .then((res) => {
                if (res.job?.status) {
                  urls[index].status = res.job.status;
                }
                urls[index].timeElapsed = calculateElapsedTime(data.startTime!);
                if (res.job?.status === 3) {
                  urls[index].completed = true;
                  urls[index].endTime = Date.now();
                }
                setUrls([...urls]);
              });
          }
        }
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [urls]);

  const isUrl = (str: string) => {
    try {
      new URL(str);
    } catch (_) {
      return false;
    }

    return true;
  };
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="p-6 w-2/6 mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter URL"
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
        />
        <input
          type="number"
          min={1}
          max={1500}
          value={maxPages}
          onChange={handleNumberChange}
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
        />
        <button
          onClick={addUrl}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          +
        </button>
      </div>

      <div className="w-2/6 mx-auto mt-4 flex gap-2 justify-center flex-wrap ">
        {urls.map((data, index) => (
          <div
            key={index}
            className="p-4 w-full bg-white rounded-xl shadow-md flex items-center space-x-4 mb-4"
          >
            <span className="flex-grow">
              <p className="text-gray-700 ">{data.url}</p>
              <p className="text-gray-700">Pages {data.maxPages}</p>
              {data.timeElapsed && (
                <p className="text-gray-700">
                  Elapsed Time: {data.timeElapsed}
                </p>
              )}
            </span>
            {data.status === 0 && (
              <div className="w-3 h-3 border-t-4 border-blue-500 rounded-full animate-spin"></div>
            )}
            {data.status === 1 && (
              <div className="w-3 h-3 border-t-4 border-yellow-500 rounded-full animate-spin"></div>
            )}
            {data.status === 2 && (
              <div className="w-3 h-3 border-t-4 border-purple-500 rounded-full animate-spin"></div>
            )}
            {data.status === 3 && (
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            )}
            {data.status !== undefined && (
              <p className="text-gray-700">
                {data.status === 0 && "Initializing"}
                {data.status === 1 && "Scraping"}
                {data.status === 2 && "Vectorizing"}
                {data.status === 3 && "Complete"}
              </p>
            )}
            <button
              onClick={() => removeUrl(data.url)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={trainUrls}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
      >
        Train
      </button>
    </div>
  );
};

export default UrlTrainer;

"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
type FileData = {
  file: File;
  completed: boolean;
  jobId?: string;
  status?: number | undefined;
  startTime?: number | null;
  endTime?: number | null;
  timeElapsed?: string | null;
};

const FileUpload = () => {
  const [files, setFiles] = useState<FileData[] | null>(null);

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
    const intervalId = setInterval(() => {
      if (files) {
        files.forEach((file, index) => {
          console.log("fetching status for", file);

          if (!file.completed) {
            if (file.jobId && file.startTime) {
              fetch(
                `https://s77iy3mjfe.execute-api.eu-central-1.amazonaws.com/Stage/get-job-status?jobId=${file.jobId}`
              )
                .then((res) => res.json())
                .then((res) => {
                  if (res.job?.status) {
                    files[index].status = Number(res.job.status);
                  }
                  files[index].timeElapsed = calculateElapsedTime(
                    file.startTime!
                  );

                  if (files[index].status === 3) {
                    console.log(files[index]);
                    files[index].completed = true;
                    files[index].endTime = Date.now();
                  }
                  setFiles([...files]);
                });
            }
          }
        });
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [files]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles((prevState: FileData[] | null) => {
        const fileData: FileData[] = acceptedFiles.map(
          (file: File): FileData => {
            return {
              file: file,
              completed: false,
            };
          }
        );
        if (prevState) {
          return [...prevState, ...fileData];
        } else {
          return fileData;
        }
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    minSize: 0,
    maxSize: 1048576,
  });
  const handleSubmit = async () => {
    if (files) {
      const fileReader = new FileReader();
      let currentIndex = 0;
      const updatedFiles = [...files];
      fileReader.onload = async (event) => {
        const csvData = event.target?.result as string;
        console.log(csvData);

        try {
          const response = await fetch(
            "https://s77iy3mjfe.execute-api.eu-central-1.amazonaws.com/Stage/start-workflow",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: "asd",
                csvData: csvData,
                jobType: 1,
              }),
            }
          ).then((response) => response.json());
          console.log(response);

          // Set the start time for each file
          updatedFiles[currentIndex].jobId = response.jobId;
          updatedFiles[currentIndex].status = 0;
          const startTime = Date.now();
          updatedFiles[currentIndex].startTime = startTime;
        } catch (error) {
          console.error(error);
        }
      };
      if (files.length) {
        files.map((file, index) => {
          currentIndex = index;
          if (!file.completed) fileReader.readAsText(file.file);
        });
        setFiles(updatedFiles);
      }
    }
  };

  const filesList = files?.map((file) => (
    <li key={file.jobId}>
      <div className="p-4 bg-white rounded-xl shadow-md flex items-center space-x-4 mb-4">
        <span className="flex-grow">
          {file.file.name} - {file.file.size} bytes
          {file.timeElapsed && (
            <p className="text-gray-700">Elapsed Time: {file.timeElapsed}</p>
          )}
        </span>
        {file.status === 0 && (
          <div className="w-3 h-3 border-t-4 border-blue-500 rounded-full animate-spin"></div>
        )}
        {file.status === 1 && (
          <div className="w-3 h-3 border-t-4 border-yellow-500 rounded-full animate-spin"></div>
        )}
        {file.status === 2 && (
          <div className="w-3 h-3 border-t-4 border-purple-500 rounded-full animate-spin"></div>
        )}
        {file.status === 3 && (
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        )}
        {file.status !== undefined && (
          <p className="text-gray-700">
            {file.status === 0 && "Initializing"}
            {file.status === 1 && "Scraping"}
            {file.status === 2 && "Vectorizing"}
            {file.status === 3 && "Complete"}
          </p>
        )}
        {/* <button
          // onClick={() => removeUrl(data.url)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Remove
        </button> */}
      </div>
    </li>
  ));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-8">
        <div
          {...getRootProps()}
          className={`p-12 bg-blue-100 border-4 border-dashed border-blue-500 rounded-lg ${
            isDragActive ? "bg-blue-200" : ""
          }`}
        >
          <input {...getInputProps()} />

          {isDragActive ? (
            <p className="text-xl text-blue-600">Drop the file here</p>
          ) : (
            <p className="text-xl text-gray-600">
              Drag and drop a CSV file here, or click to select a file
            </p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-2xl font-bold mb-4">Files</h4>
        <ul>{filesList}</ul>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
        >
          Train
        </button>
      </div>
    </div>
  );
};

export default FileUpload;

import React, { useState } from "react";

function FileUpload({onFileUpload, onFileDigest}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [apiUrl] = useState(process.env.REACT_APP_API_URL)

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.txt')) {
      setSelectedFile(file);
      setErrorMessage("");
    } else {
      setSelectedFile(null);
      setErrorMessage("Please select a .txt file.");
    }
  };

  const digest = () =>{
    fetch(apiUrl+'/digest')
    .then((res)=>{
        console.log(res)
        console.log("File uploaded and digested successfully.");
        onFileDigest();
    })
    .catch((err)=>{
        console.log("File uploaded but there is some issue in digesting the file")
    })
  }

  const handleUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      fetch(apiUrl + "/upload", {
        method: "POST",
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("File upload failed.");
        }
        // Handle successful upload here
        onFileUpload(); 
        digest()
      })
      .catch(error => {
        console.error("Error uploading file:", error);
        // Handle error here
      });
    } else {
      setErrorMessage("Please select a file to upload.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <input type="file" onChange={handleFileChange} style={{ display: "none" }} id="fileInput" />
      <label htmlFor="fileInput" style={{ cursor: "pointer", padding: "10px 20px", background: "#3498db", color: "#fff", borderRadius: "5px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", marginRight: "10px" }}>Choose File</label>
      <button onClick={handleUpload} style={{ padding: "10px 20px", background: "#2ecc71", color: "#fff", borderRadius: "5px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>Upload</button>
      {errorMessage && <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>}
    </div>
  );
}

export default FileUpload;

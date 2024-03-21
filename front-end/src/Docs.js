import React, { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

function Docs() {
  const [docs, setDocs] = useState([]);
  const [api_url] = useState(process.env.REACT_APP_API_URL)
  const [digest, setDigest] = useState("")
  useEffect(() => {
    fetch(api_url+"/get-file-list")
      .then(response => response.json())
      .then(data => {
        setDigest("Digesting File, Please Wait..")
        fetch(api_url+'/digest')
        .then((res)=>{
            setDigest("")
            setDocs(data)
        })
        
      })
      .catch(error => console.error("Error fetching file list:", error));
  }, [api_url]);

  const onFileDigest = () =>{
    fetch(api_url+"/get-file-list")
      .then(response => response.json())
      .then(data => {
        setDocs(data)
        setDigest("")
      })
      .catch(error => console.error("Error fetching file list:", error));
  }

  const onFileUpload = () => {
    setDigest("Digesting File, Please Wait..")
  }

  const handleDelete = (filename) => {
    fetch(api_url + '/delete-file/' + filename, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        fetch(api_url+"/get-file-list")
        .then(response => response.json())
        .then(data => {
            setDigest("Digesting File, Please Wait..")
            fetch(api_url+'/digest')
            .then((res)=>{
                setDigest("")
                setDocs(data)
            })
        })
        .catch(error => console.error("Error fetching file list:", error));
      } else {
        // Handle error response
        console.error('Failed to delete file:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Error deleting file:', error);
    });
  };

  return (
    <>
      <div className="col-xs-4 no-pad">
        <div className="people">
          <div className="user">
            <div className="user-item"> 
              <img className="pull-left" src="https://plus.google.com/u/0/_/focus/photos/public/AIbEiAIAAABECND6k6O2gLWavQEiC3ZjYXJkX3Bob3RvKigyMjgzNGM2ZWZkYjJhZDZhZjI1YTI0MzQxYzJkYTRkODEzNDBhY2UyMAHQr8BxOTmI3m0dZJGY3Vj4osnP9g?sz=48" alt="" />
              <div className="pull-left">
                <p className="name">Docs Chat</p>
                <p className="active">Nix</p>
              </div>
            </div>
          </div>
          <div className="list-head">
            <p>Reference Files</p>
          </div>
          <div className="list">
            <FileUpload onFileUpload={onFileUpload} onFileDigest={onFileDigest}/>
            <p className="text-center text-white">{digest}</p>
            <div className="docs" style={{ maxHeight: "500px", overflowY: "auto" }}>
            {docs.map((doc, index) => (
            <div className="list-item active" key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <img className="pull-left img-responsive" src="/images/documents.png" alt="" />
                <p className="pull-left text-white" style={{ flex: '1', marginRight: '10px' }}>
                <a style={{ color: '#fff' }} href={api_url+'/docs/'+doc} target="_blank" rel="noreferrer">{doc}</a>
                </p>
                <button onClick={() => handleDelete(doc)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                <img src="/images/delete.png" alt="Delete" style={{ width: '20px', height: '20px' }} />
                </button>
            </div>
            ))}
            </div>
            
          </div>
        </div>
        
      </div>
    </>
  );
}

export default Docs;

from flask import Flask, request, send_from_directory,jsonify
import os
from ollama import Client
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_community.document_loaders import DirectoryLoader
from flask_cors import CORS

client = Client(host='https://halibut-light-locally.ngrok-free.app')
path = './docs'

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'docs'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'txt'}
retriever = None

@app.route('/digest')
def digest():
    global retriever
    retriever = None
    loader = DirectoryLoader(path, glob="**/*.txt", loader_cls=TextLoader)
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)

    # Create Ollama embeddings and vector store
    embeddings = OllamaEmbeddings(base_url="https://halibut-light-locally.ngrok-free.app", model="mistral")
    vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings)
    retriever = vectorstore.as_retriever()
    return jsonify({"status" : "ok", "msg" : "Digest Completed"})

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Define the Ollama LLM function
def ollama_llm(question, context):
    formatted_prompt = f"Question: {question}\n\nContext: {context}"
    response = client.chat(model='mistral', messages=[{'role': 'user', 'content': formatted_prompt}])
    return response['message']['content']

# Define the RAG chain
def rag_chain(question):
    global retriever
    retrieved_docs = retriever.invoke(question)
    formatted_context = format_docs(retrieved_docs)
    return ollama_llm(question, formatted_context)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return "Welcome to RAG System, visit https://docschat.shivrajan.com"

@app.route('/server-status')
def status():
    return jsonify({ "status" : 'ok' })

@app.route('/get-file-list')
def list_files():
    files = os.listdir(UPLOAD_FOLDER)
    return jsonify(files)

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = file.filename
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return jsonify({ "status" : 'ok', "msg" : "File Uploaded" })
        else:
            return jsonify({ "status" : 'error', "msg" : "only txt file is supported" })
    else:
        return jsonify({ "status" : 'error', "msg" : "File missing" })
        


@app.route('/docs/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/delete-file/<filename>', methods=['DELETE'])
def delete_file(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        os.remove(file_path)
        return jsonify({"message": "File deleted successfully"})
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/get-response', methods=['POST'])
def get_response():
    user_input = request.json['message']
    result = rag_chain(user_input) 
    print(result)
    return jsonify({"status": 'ok', "message": result})



if __name__ == '__main__':
    app.run(debug=True)

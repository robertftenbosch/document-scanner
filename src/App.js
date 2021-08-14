import './App.css';
import React, {useState} from "react";
import CropImage from "./components/crop_image/CropImage";

function App() {
    const [crop, setCrop] = useState();

  return (
    <div className="App">
        <CropImage/>
    </div>
  );
}

export default App;

import './App.css';
import example from './static/example.jpg';
import Cropper from 'react-easy-crop'
function App() {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    console.log(croppedArea, croppedAreaPixels)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
     
        <img src={example} alt="example" />
      </header>
      <Cropper
      image={example}
      crop={crop}
      zoom={zoom}
      aspect={4 / 3}
      onCropChange={setCrop}
      onCropComplete={onCropComplete}
      onZoomChange={setZoom}
    />
    </div>
  );
}

export default App;

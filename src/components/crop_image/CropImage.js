import React, {useState, useCallback, useRef, useEffect} from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Tesseract from 'tesseract.js';
import { createWorker } from 'tesseract.js';
function generateDownload(canvas, crop) {
    if (!crop || !canvas) {
        return;
    }

    canvas.toBlob(
        (blob) => {
            const previewUrl = window.URL.createObjectURL(blob);

            const anchor = document.createElement('a');
            anchor.download = 'cropPreview.png';
            anchor.href = URL.createObjectURL(blob);
            anchor.click();

            window.URL.revokeObjectURL(previewUrl);
        },
        'image/png',
        1
    );
}


export default function CropImage() {
    const [upImg, setUpImg] = useState();
    const [scanImage, setScanImage] = useState();
    const [text,setText] = useState("");
    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const [crop, setCrop] = useState({unit: '%', width: 30});
    const [completedCrop, setCompletedCrop] = useState(null);
    const [confidence, setConfidence] = useState();
    const [thinking, setThinking] = useState(false);
    const worker = createWorker({
        logger: m => console.log(m),
    });
    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setUpImg(reader.result));
            reader.readAsDataURL(e.target.files[0]);
        }
    };




    const handleClick = () => {


        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext('2d');

        // ctx.drawImage(imageRef.current, 0, 0);
        // ctx.putImageData(preprocessImage(canvas),0,0);
        const dataUrl = canvas.toDataURL("image/jpeg");

        Tesseract.recognize(
            dataUrl,'eng',
            {
                logger: m => console.log(m)
            }
        )
            .catch (err => {
                console.error(err);
            })
            .then(result => {
                // Get Confidence score
                let confidence = result.confidence
                console.log(confidence)
                // Get full output
                let text = result.text
                console.log(result.data.text)
                console.log(text);
                setText(result.data.text);
            })
    }

    const handleClickAsync = async () => {
        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext('2d');

        // ctx.drawImage(imageRef.current, 0, 0);
        // ctx.putImageData(preprocessImage(canvas),0,0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        await worker.load();
        await worker.loadLanguage('eng+nl');
        await worker.initialize('eng+nl');
        const { data: { text, confidence } } = await worker.recognize(dataUrl);
        await worker.terminate();
        setText(text);
        setConfidence(confidence);
    }

    const onLoad = useCallback((img) => {
        imgRef.current = img;
    }, []);

    useEffect(() => {
        if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
            return;
        }

        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        const crop = completedCrop;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');
        const pixelRatio = window.devicePixelRatio;

        canvas.width = crop.width * pixelRatio * scaleX;
        canvas.height = crop.height * pixelRatio * scaleY;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        );
    }, [completedCrop]);

    return (
        <div className="App">
            <div>
                <input type="file" accept="image/*" onChange={onSelectFile}/>
            </div>
            <ReactCrop
                src={upImg}
                onImageLoaded={onLoad}
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
            />
            <div>
                <canvas
                    ref={previewCanvasRef}
                    // Rounding is important so the canvas width and height matches/is a multiple for sharpness.
                    style={{
                        width: Math.round(completedCrop?.width ?? 0),
                        height: Math.round(completedCrop?.height ?? 0)
                    }}
                />
            </div>

            <button
                type="button"
                disabled={!completedCrop?.width || !completedCrop?.height}
                onClick={() =>
                    generateDownload(previewCanvasRef.current, completedCrop)
                }
            >
                Download cropped image
            </button>
            <button
                type="button"
                disabled={!completedCrop?.width || !completedCrop?.height}
                onClick={() =>
                    handleClickAsync()
                }
            >
                Scan for text cropped image
            </button>
            <h1>{text}</h1>
            <h2>confidence: {confidence}</h2>
        </div>
    );
}

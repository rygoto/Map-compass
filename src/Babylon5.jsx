import React, { useEffect, useRef, useState } from 'react';
import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    MeshBuilder,
    ActionManager,
    ExecuteCodeAction,
    AxesViewer,
    WebXRState,
    WebXRDomOverlay,
    Texture,
    StandardMaterial,
    Space,
    Axis,
    PointerEventTypes,
    SceneLoader,
    Color3,
    DynamicTexture,
    Vector4,
    PBRMetallicRoughnessMaterial,
    CubeTexture
} from '@babylonjs/core';
import '@babylonjs/loaders';

function BabylonScene5() {
    const canvasRef = useRef(null);
    const [sliderValue, setSliderValue] = useState(1.5);
    const [texture, setTexture] = useState(null);
    const [noodleIcons, setNoodleIcons] = useState([]);
    const [parkIcons, setParkIcons] = useState([]);
    const [cafeIcons, setCafeIcons] = useState([]);
    const [fontData, setFontData] = useState(null);
    const [iconsonMap, setIconsonMap] = useState([]);
    const [unvisiblecylinder, setUnvisibleCylinder] = useState(null);

    useEffect(() => {
        const loadFontData = async () => {
            const fetchedFontData = await fetch("https://assets.babylonjs.com/fonts/Droid Sans_Regular.json").then(res => res.json());
            setFontData(fetchedFontData);
        };
        loadFontData();
    }, []);


    const handleSliderChange = (event) => {
        setSliderValue(parseFloat(event.target.value));
    };
    //Texture Controll
    useEffect(() => {
        if (texture) {
            const uvScale = sliderValue / 1.8;
            const scaleFactorU = 0.7 * uvScale;
            const scaleFactorV = 1.2 * uvScale;

            const uOffset = 0.5 * (1 - scaleFactorU);//中心からスケール管理できるように
            const vOffset = 0.5 * (1 - scaleFactorV);
            texture.uScale = scaleFactorU;
            texture.vScale = scaleFactorV;

            texture.uOffset = uOffset;
            texture.vOffset = vOffset;
        }
    }, [sliderValue, texture]);

    useEffect(() => {
        if (unvisiblecylinder) {
            const scaleValue = 1 / sliderValue;
            unvisiblecylinder.scaling = new Vector3(scaleValue, scaleValue, scaleValue);
        }
    }, [sliderValue, unvisiblecylinder]);

    function ClickIcon(clickedIcon, shopdata, compass, compass2, sliderValue) {
        const newIcons = [];
        shopdata.forEach((data, index) => {
            const angle = data.angle;
            const radius = data.radius;// * sliderValue;
            const iconx = radius * Math.cos(angle);
            const iconz = radius * Math.sin(angle);
            const icony = 0.035;

            const icononMap = clickedIcon.clone("icononMap" + index);
            const icononWorld = clickedIcon.clone("icononWorld" + index);
            if (icononMap) {
                icononMap.position = new Vector3(iconx, icony, iconz);
                icononMap.rotation = compass.rotation;
                const scaleValue = 0.045;
                icononMap.scaling = new Vector3(scaleValue, 0.038, scaleValue);
                icononMap.parent = compass;
                icononMap.rotate(Vector3.Up(), Math.PI / 2);

                const distancevalue = 5.0;
                const heightvalue = 2.0;
                const icononWorldx = iconx * distancevalue;
                const icononWorldz = iconz * distancevalue;
                icononWorld.position = new Vector3(icononWorldx, heightvalue, icononWorldz);
                icononWorld.parent = compass;
            }
            newIcons.push(icononMap);
        });
        setIconsonMap(newIcons);
    };


    useEffect(() => {
        if (canvasRef.current) {
            const engine = new Engine(canvasRef.current, true);
            const scene = new Scene(engine);
            const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 0, 5), scene);
            camera.attachControl(canvasRef.current, true);
            const light = new HemisphericLight("light", new Vector3(0, 1, 3), scene);
            light.intensity = 10;

            //Sky creation
            /*var skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
            var skyboxMaterial = new StandardMaterial("skyBox", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
            skyboxMaterial.specularColor = new Color3(0, 0, 0);
            skybox.material = skyboxMaterial;*/
            //End of sky creation

            //Create Map-Compass
            const cylinder = MeshBuilder.CreateCylinder("cylinder", { diameterTop: 1.85, diameterBottom: 1.85, height: 0.07 }, scene);
            const textureInstance = new Texture('map2.png');
            const material = new StandardMaterial("material", scene);
            material.diffuseTexture = textureInstance;
            cylinder.material = material;
            cylinder.position.z = 3;
            cylinder.position.y = -1;
            cylinder.rotation.x = -Math.PI / 10;
            setTexture(textureInstance);
            SceneLoader.ImportMeshAsync("", "/", "Compass5.glb", scene)
                .then((result) => {
                    const compass = result.meshes[0];
                    compass.position = new Vector3(0, 0.18, 0);
                    let scaleValue = 0.8;
                    compass.scaling = new Vector3(scaleValue, scaleValue, scaleValue);
                    compass.rotation.x = -Math.PI / 10;
                    compass.parent = cylinder;

                    const metalicMaterial = new PBRMetallicRoughnessMaterial("metal", scene);
                    metalicMaterial.baseColor = new Color3(0.9, 0.9, 0.5);
                    metalicMaterial.metallic = 0.5;
                    metalicMaterial.roughness = 0.5;
                    //compass.material = metalicMaterial;
                });
            const unvisibleCylinder = MeshBuilder.CreateCylinder("cylinder", { diameterTop: 1.85, diameterBottom: 1.85, height: 0.07 }, scene);
            unvisibleCylinder.visibility = 0;
            unvisibleCylinder.parent = cylinder;
            setUnvisibleCylinder(unvisibleCylinder);
            //End of Create Map Compass

            //Create Map Icons
            let noodleIcon = null;
            let parkIcon = null;
            let cafeIcon = null;
            const noodleshopdata = [
                { radius: 0.5, angle: 0, shopName: "Noodle" },
                { radius: 0.2, angle: Math.PI / 2, shopName: "Park" },
                { radius: 0.4, angle: Math.PI, shopName: "Cafe" },
                { radius: 0.8, angle: Math.PI * 3 / 2, shopName: "Shop" }
            ];
            const parkdata = [
                { radius: 0.3, angle: 0, shopName: "Noodle" },
                { radius: 0.4, angle: Math.PI / 5, shopName: "Park" },
                { radius: 0.8, angle: Math.PI, shopName: "Cafe" },
                { radius: 0.4, angle: -Math.PI * 3 / 2, shopName: "Shop" }
            ];
            SceneLoader.ImportMeshAsync("", "/", "noodle.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    noodleIcon = result.meshes[0];
                    noodleIcon.position = new Vector3(-0.4, -0.2, 1);
                    noodleIcon.scaling = new Vector3(0.2, 0.2, 0.2);
                    noodleIcon.rotation = new Vector3(0, -Math.PI / 2, 0);
                });

            const box1 = MeshBuilder.CreateBox("box", { width: 0.3, height: 0.3, depth: 0.3 }, scene);
            box1.position = new Vector3(-0.4, 0, 1); // 位置設定を修正
            box1.visibility = 0;
            box1.actionManager = new ActionManager(scene);
            box1.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (evt) => {
                ClickIcon(noodleIcon, noodleshopdata, cylinder, unvisibleCylinder, sliderValue);
            }));

            SceneLoader.ImportMeshAsync("", "/", "park.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    parkIcon = result.meshes[0];
                    parkIcon.position = new Vector3(0, -0.2, 1);
                    parkIcon.scaling = new Vector3(0.1, 0.1, 0.1);
                    parkIcon.rotation = new Vector3(0, -Math.PI / 2, 0);
                });

            const box2 = MeshBuilder.CreateBox("box", { width: 0.3, height: 0.3, depth: 0.3 }, scene);
            box2.position = new Vector3(0, 0, 1); // 位置設定を修正
            box2.visibility = 0;
            box2.actionManager = new ActionManager(scene);
            box2.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (evt) => {
                ClickIcon(parkIcon, parkdata, cylinder);
            }));

            SceneLoader.ImportMeshAsync("", "/", "cafe.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    cafeIcon = result.meshes[0];
                    cafeIcon.position = new Vector3(0.4, -0.2, 1);
                    cafeIcon.scaling = new Vector3(0.1, 0.1, 0.1);
                    cafeIcon.rotation = new Vector3(0, -Math.PI / 2, 0);
                });
            //End of Create Map Icons

            const axesViewer = new AxesViewer(scene);

            engine.runRenderLoop(() => {
                scene.render();
            });

            return () => {
                engine.dispose();
            };
        }
    }, []);

    return (
        <>
            <div
                className="dom-overlay-container"
                style={{ display: 'block' }}//通常モードのみARは使わない
            //onTouchStart={preventTouchPropagation}
            //onPointerDown={preventTouchPropagation}
            >
                <label>範囲 : {(sliderValue * 100).toFixed(2)}m</label>
                <input
                    type="range"
                    min="0.3"
                    max="5"
                    step="0.05"
                    value={sliderValue}
                    className="dom-overlay-slider"
                    onChange={handleSliderChange}
                ></input>
            </div>
            <canvas ref={canvasRef} style={{ width: '800px', height: '600px' }} />
        </>
    );
}


export default BabylonScene5;
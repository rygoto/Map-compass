import React, { useEffect, useRef, useState } from 'react';
import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    MeshBuilder,
    Mesh,
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
    CubeTexture,
    Color4,
} from '@babylonjs/core';
import '@babylonjs/loaders';
//import { AdvancedDynamicTexture, Control } from '@babylonjs/gui/2D';
//import * as GUI from 'babylonjs-gui';
import * as GUI from '@babylonjs/gui';

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

    function ClickIcon(clickedIcon, shopdata, compass, compass2, sliderValue, scene) {
        const newIcons = [];
        const guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
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

                //
                const label = new GUI.TextBlock();
                label.text = data.shopName;
                label.color = "white";
                label.fontSize = 24;
                label.outlineWidth = 2;
                label.outlineColor = "black";
                label.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                label.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

                guiTexture.addControl(label); // GUIテクスチャにラベルを追加

                // アイコンの位置に応じてGUI要素を更新
                label.linkWithMesh(icononWorld);
                label.linkOffsetY = 0.0; // テキストのメッシュからのオフセット
                label.linkOffsetX = -10.0;
                label.linkOffsetZ = 0.0;


                //テキスト生成の試み集め
                /*
                const plane = Mesh.CreatePlane("textPlane" + index, 2, scene, false, Mesh.DOUBLESIDE);

                plane.position = new Vector3(icononWorldx, heightvalue - 0.3, icononWorldz); // テキスト位置調整
                plane.parent = compass;
                //plane.position = new Vector3(0, 0, 0); // テキスト位置調整
                //plane.parent = icononWorld;
                const texture = new DynamicTexture("dynamic texture", 512, scene, true);
                texture.hasAlpha = true;
                const textureContext = texture.getContext();
                textureContext.clearRect(0, 0, 512, 512);
                textureContext.font = "bold 44px Arial";
                textureContext.fillStyle = "white";
                textureContext.textAlign = "center";
                textureContext.fillText(data.shopName, 256, 256); // テキスト中央揃え
                texture.update();

                const material = new StandardMaterial("textMat" + index, scene);
                material.emissiveTexture = texture;
                material.useAlphaFromDiffuseTexture = true;
                plane.material = material;

                material.diffuseColor = new Color3(0, 0, 0);
                material.specularColor = new Color3(0, 0, 0);
                material.alpha = 0;
                */
                //End of テキスト生成の試み集め



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
            const light = new HemisphericLight("light", new Vector3(-0.5, 0, 4), scene);
            light.intensity = 0.9;
            const light2 = new HemisphericLight("light", new Vector3(0.5, 0, 4), scene);
            light2.intensity = 0.9;

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
                ClickIcon(noodleIcon, noodleshopdata, cylinder, unvisibleCylinder, sliderValue, scene);
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

            //Create XR experience
            scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: 'immersive-ar',
                },
            }).then(xrExperience => {
                const featuresManager = xrExperience.baseExperience.featuresManager;
                featuresManager.enableFeature(WebXRDomOverlay, "latest",
                    { element: ".dom-overlay-container" }, undefined, false);

                xrExperience.baseExperience.onStateChangedObservable.add((webXRState) => {
                    const overlayElement = document.querySelector('.dom-overlay-container');
                    if (overlayElement) {
                        switch (webXRState) {
                            case WebXRState.ENTERING_XR:
                            case WebXRState.IN_XR:
                                overlayElement.style.display = 'block'; // オーバーレイを表示
                                //overlayElement.textContent = 'うんこしてますかー'; // 例として文字を表示
                                break;
                            default:
                                overlayElement.style.display = 'none'; // 非表示にするnoneだった
                                break;
                        }
                    }
                });
            });
            //End of Create XR experience

            // const axesViewer = new AxesViewer(scene);

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
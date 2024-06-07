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
    Vector4
} from '@babylonjs/core';
import '@babylonjs/loaders';

function BabylonScene4() {
    const canvasRef = useRef(null);
    const [sliderValue, setSliderValue] = useState(1.5);
    const [texture, setTexture] = useState(null);
    const [noodleIcons, setNoodleIcons] = useState([]);
    const [parkIcons, setParkIcons] = useState([]);
    const [cafeIcons, setCafeIcons] = useState([]);
    const [noodleIconsData, setNoodleIconsData] = useState([
        { radius: 0.7, angle: Math.PI * 2 },
        { radius: 0.8, angle: Math.PI * 4 },
        { radius: 0.4, angle: Math.PI * 1 / 4 }
    ]);

    //Create Invisible Ground for touch
    function createInvisibleGround(scene) {
        const ground = MeshBuilder.CreatePlane("invisibleGround", { size: 1000 }, scene); // 適当に大きなサイズを設定
        ground.position.y = -498;  //Sliderイベントが伝播しないためにここに設定
        ground.position.z = 20;
        ground.rotation.x = 0;//Math.PI / 2;  // X軸に沿って90度回転して地面と平行にする

        const material = new StandardMaterial("groundMaterial", scene);
        material.alpha = 0;  // 完全に透明にする
        material.disableLighting = true;  // ライティングの影響を受けないようにする
        ground.material = material;
        ground.isPickable = true;  // ピッキングを可能にする
    }
    //End of Create Invisible Ground for touch

    //Create Text Below Sphereicons
    function createTextPlane(name, text, color, scene) {
        // テキストを表示するための平面
        const dynamicTexture = new DynamicTexture("DynamicTexture", { width: 512, height: 256 }, scene, true);
        dynamicTexture.hasAlpha = true;
        // テキストのスタイル設定
        dynamicTexture.drawText(text, null, null, "bold 44px Arial", color, "transparent", true);
        // 平面を作成してテクスチャを適用
        const plane = MeshBuilder.CreatePlane(name, { width: 3, height: 1.5 }, scene);
        const material = new StandardMaterial("TextPlaneMaterial", scene);
        material.diffuseTexture = dynamicTexture;
        material.opacityTexture = dynamicTexture;
        plane.material = material;
        return plane;
    }
    //End of Create Text Below Sphereicons

    const handleSliderChange = (event) => {
        setSliderValue(parseFloat(event.target.value));
    };

    // DOM 内でのタッチイベントの伝播を防ぐ
    const preventTouchPropagation = (event) => {
        event.stopPropagation();
        event.preventDefault();
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

    //Create icon contorll Effect
    useEffect(() => {
        const radius = sliderValue <= 1.2 ? 0.92 : 1.0 / sliderValue;
        const visiblityValue = sliderValue > 1 ? 1 : 0;
        noodleIcons.forEach((icon, index) => {
            const angle = ((Math.PI * 2 * index) / noodleIcons.length);// + Math.random();
            icon.position.x = radius * Math.cos(angle);
            icon.position.z = radius * Math.sin(angle);
            icon.position.y = 0.035;
            console.log("Radius", radius);
        });
    }, [sliderValue, noodleIcons]);

    useEffect(() => {
        const radius = sliderValue <= 1.2 ? 0.92 : 1.0 / sliderValue;
        const visiblityValue = sliderValue > 1 ? 1 : 0;
        parkIcons.forEach((icon, index) => {
            const angle = ((Math.PI * 2 * index) / parkIcons.length) + 0.3;
            icon.position.x = radius * Math.cos(angle);
            icon.position.z = radius * Math.sin(angle);
            icon.position.y = 0.035;
            console.log("Radius", radius);
        });
    }, [sliderValue, parkIcons]);

    useEffect(() => {
        const radius = sliderValue <= 1.2 ? 0.92 : 1.0 / sliderValue;
        const visiblityValue = sliderValue > 1 ? 1 : 0;
        cafeIcons.forEach((icon, index) => {
            const angle = ((Math.PI * 2 * index) / cafeIcons.length) + 0.6;
            icon.position.x = radius * Math.cos(angle);
            icon.position.z = radius * Math.sin(angle);
            icon.position.y = 0.035;
            console.log("Radius", radius);
        });
    }, [sliderValue, cafeIcons]);
    //End of Create icon contorll Ef
    useEffect(() => {
        if (canvasRef.current) {
            const engine = new Engine(canvasRef.current, true);
            const scene = new Scene(engine);
            const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 0, 5), scene);
            camera.attachControl(canvasRef.current, true);
            const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);

            let noodleIcon = null;
            let parkIcon = null;
            let cafeIcon = null;

            //Create Map Compass
            const cylinder = MeshBuilder.CreateCylinder("cylinder", { diameterTop: 1.85, diameterBottom: 1.85, height: 0.07 }, scene);
            const textureInstance = new Texture('map2.png');
            //let uvScale = 1;
            //texture.uScale = 0.7 * uvScale;
            //texture.vScale = 1.2 * uvScale;
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
                });
            //End of Create Map Compass

            //Create Yajirushi
            SceneLoader.ImportMeshAsync("", "/", "yajirusi.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    const yajirushi = result.meshes[0];
                    yajirushi.position = new Vector3(0, 1, 4);
                    yajirushi.scaling = new Vector3(0.28, 0.28, 0.28);
                    yajirushi.rotation = new Vector3(Math.PI / 4 - Math.PI / 8, Math.PI, 0);
                    yajirushi.parent = cylinder;
                });

            //Add Plane for touch 
            createInvisibleGround(scene);

            cylinder.actionManager = new ActionManager(scene);
            cylinder.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                //cylinder.rotate(Axis.Y, Math.PI / 4, Space.LOCAL);
            }));

            //Create Map Icons
            SceneLoader.ImportMeshAsync("", "/", "noodle.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    noodleIcon = result.meshes[0];
                    noodleIcon.position = new Vector3(-0.4, -0.2, 1);
                    noodleIcon.scaling = new Vector3(0.2, 0.2, 0.2);
                    noodleIcon.rotation = new Vector3(0, -Math.PI / 2, 0);
                });

            SceneLoader.ImportMeshAsync("", "/", "park.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    parkIcon = result.meshes[0];
                    parkIcon.position = new Vector3(0, -0.2, 1);
                    parkIcon.scaling = new Vector3(0.1, 0.1, 0.1);
                    parkIcon.rotation = new Vector3(0, -Math.PI / 2, 0);
                });

            SceneLoader.ImportMeshAsync("", "/", "cafe.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    cafeIcon = result.meshes[0];
                    cafeIcon.position = new Vector3(0.4, -0.2, 1);
                    cafeIcon.scaling = new Vector3(0.1, 0.1, 0.1);
                    cafeIcon.rotation = new Vector3(0, -Math.PI / 2, 0);
                });
            //End of Create Map Icons

            //Create Invisible Meshes for icon touch
            const box = MeshBuilder.CreateBox("box", { width: 0.3, height: 0.3, depth: 0.3 }, scene);
            box.position = new Vector3(-0.4, 0, 1); // 位置設定を修正
            box.visibility = 0;

            const cone = MeshBuilder.CreateCylinder("cone", { diameterTop: 0, diameterBottom: 0.4, height: 0.4 }, scene); // Cone を作成
            cone.position = new Vector3(0, 0, 1); // 位置設定
            cone.visibility = 0;

            const torus = MeshBuilder.CreateTorus("torus", { diameter: 0.25, thickness: 0.2 }, scene); // Torus を作成
            torus.position = new Vector3(0.4, -0.2, 1); // 位置設定
            torus.visibility = 0;
            //End of Create Invisible Meshes for icon touch

            //Create 3 IconsTouch excute
            box.actionManager = new ActionManager(scene);
            box.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                const numberOfBoxes = 5;
                const newNoodleIcons = [];
                noodleIconsData.forEach((data, index) => {
                    const x = data.radius * Math.cos(data.angle);
                    const z = data.radius * Math.sin(data.angle);
                    const y = 0.035;

                    const noodleIcon = MeshBuilder.CreateBox("noodleIcon" + index, { size: 0.1 }, scene); // Create a placeholder box for demo
                    noodleIcon.position = new Vector3(x, y, z);
                    noodleIcon.scaling = new Vector3(0.055, 0.055, 0.055); // Example scaling
                    noodleIcon.parent = box; // Set parent if needed

                    // Additional setup for noodleIcon can be added here
                });
                /*for (let i = 0; i < numberOfBoxes; i++) {
                    const angle = Math.random() * Math.PI * 2; // Random angle
                    //const radius = 0.7;
                    const radius = 0.5 + Math.random() * 0.5;
                    const x = radius * Math.cos(angle);
                    const z = radius * Math.sin(angle);
                    const y = 0.035;

                    const newNoodleIcon = noodleIcon.clone("newNoodleIcon" + i);
                    newNoodleIcon.position = new Vector3(x, y, z);
                    newNoodleIcon.rotation = cylinder.rotation; // シリンダーの回転に合わせる
                    const scaleValue = 0.055;
                    newNoodleIcon.scaling = new Vector3(scaleValue, scaleValue, scaleValue);
                    newNoodleIcon.parent = cylinder;
                    newNoodleIcon.rotate(Vector3.Up(), Math.PI / 2);

                    newNoodleIcons.push(newNoodleIcon);

                    const sphereRadius = 10;
                    const sphereX = sphereRadius * Math.cos(angle);
                    const sphereZ = sphereRadius * Math.sin(angle);
                    const sphereY = 1.5;

                    /*const sphere = MeshBuilder.CreateSphere("sphere" + i, { diameter: 1 }, scene);
                    sphere.position = new Vector3(sphereX, sphereY, sphereZ);
                    sphere.parent = cylinder;*/
                /*const sphereNoodleIcon = noodleIcon.clone("sphereNoodleIcon" + i);
                sphereNoodleIcon.position = new Vector3(sphereX, sphereY, sphereZ);
                sphereNoodleIcon.scaling = new Vector3(0.75, 0.75, 0.75);
                sphereNoodleIcon.rotation = cylinder.rotation;
                sphereNoodleIcon.parent = cylinder;
            }
                setNoodleIcons(newNoodleIcons);*/
            }));

            cone.actionManager = new ActionManager(scene);
            cone.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                const numberOfBoxes = 3;
                const newParkIcons = [];
                for (let i = 0; i < numberOfBoxes; i++) {
                    const angle = Math.random() * Math.PI * 2; // Random angle
                    const radius = 0.70; // Half of the diameterTop
                    const x = radius * Math.cos(angle);
                    const z = radius * Math.sin(angle);
                    const y = 0.035; // Slightly above the top surface

                    const newParkIcon = parkIcon.clone("newParkIcon" + i);
                    newParkIcon.position = new Vector3(x, y, z);
                    newParkIcon.rotation = cylinder.rotation; // シリンダーの回転に合わせる
                    const scaleValue = 0.045;
                    newParkIcon.scaling = new Vector3(scaleValue, 0.038, scaleValue);
                    newParkIcon.parent = cylinder;
                    newParkIcon.rotate(Vector3.Up(), Math.PI / 2);

                    newParkIcons.push(newParkIcon);

                    const sphereRadius = 10;
                    const sphereX = sphereRadius * Math.cos(angle);
                    const sphereZ = sphereRadius * Math.sin(angle);
                    const sphereY = 1.5;

                    const sphereParkIcon = parkIcon.clone("sphereParkIcon" + i);
                    sphereParkIcon.position = new Vector3(sphereX, sphereY, sphereZ);
                    sphereParkIcon.scaling = new Vector3(0.75, 0.75, 0.75);
                    sphereParkIcon.rotation = cylinder.rotation;
                    sphereParkIcon.parent = cylinder;
                }
                setParkIcons(newParkIcons);
            }));

            torus.actionManager = new ActionManager(scene);
            torus.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                const numberOfBoxes = 3;
                const newCafeIcons = [];
                for (let i = 0; i < numberOfBoxes; i++) {
                    const angle = Math.random() * Math.PI * 2; // Random angle
                    const radius = 0.70; // Half of the diameterTop
                    const x = radius * Math.cos(angle);
                    const z = radius * Math.sin(angle);
                    const y = 0.035; // Slightly above the top surface

                    const newCafeIcon = cafeIcon.clone("newCafeIcon" + i);
                    newCafeIcon.position = new Vector3(x, y, z);
                    newCafeIcon.rotation = cylinder.rotation; // シリンダーの回転に合わせる
                    const scaleValue = 0.055;
                    newCafeIcon.scaling = new Vector3(scaleValue, scaleValue, scaleValue);
                    newCafeIcon.parent = cylinder;
                    newCafeIcon.rotate(Vector3.Up(), Math.PI / 2);

                    newCafeIcons.push(newCafeIcon);

                    const sphereRadius = 10;
                    const sphereX = sphereRadius * Math.cos(angle);
                    const sphereZ = sphereRadius * Math.sin(angle);
                    const sphereY = 1.5;

                    const sphereCafeIcon = cafeIcon.clone("sphereCafeIcon" + i);
                    sphereCafeIcon.position = new Vector3(sphereX, sphereY, sphereZ);
                    sphereCafeIcon.scaling = new Vector3(0.75, 0.75, 0.75);
                    sphereCafeIcon.rotation = cylinder.rotation;
                    sphereCafeIcon.parent = cylinder;
                }
                setCafeIcons(newCafeIcons);
            }));
            //End of Create 3 IconsTouch excute

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

            //Create Axes Viewer
            //const axesViewer = new AxesViewer(scene);
            //End of Create Axes Viewer

            //Create Touch Function
            let isTouchActive = false;
            let currentPointerPosition = null;
            let lastPointerPosition = null;
            scene.onPointerObservable.add((pointerInfo) => {
                switch (pointerInfo.type) {
                    case PointerEventTypes.POINTERDOWN:
                        if (pointerInfo.pickInfo.pickedPoint) {
                            isTouchActive = true;
                            lastPointerPosition = pointerInfo.pickInfo.pickedPoint.clone();
                        }
                        break;
                    case PointerEventTypes.POINTERMOVE:
                        if (isTouchActive && pointerInfo.pickInfo.pickedPoint) {
                            currentPointerPosition = pointerInfo.pickInfo.pickedPoint.clone();
                        }
                        break;
                    case PointerEventTypes.POINTERUP:
                        isTouchActive = false;
                        break;
                }
            });

            function handlePointerMove(start, end) {
                let direction = end.subtract(start).normalize();
                let distance = Vector3.Distance(start, end);
                console.log("Direction:", direction, "Distance:", distance);
            }
            //ENd of Create Touch Function

            engine.runRenderLoop(() => {
                if (isTouchActive && lastPointerPosition && currentPointerPosition) {
                    let direction = currentPointerPosition.subtract(lastPointerPosition);
                    let amountValue = 0.5;
                    let rotationAmount = direction.x * amountValue; // スケールファクター調整
                    cylinder.rotate(Axis.Y, rotationAmount, Space.LOCAL);
                    lastPointerPosition = currentPointerPosition.clone(); // 次のフレームのために更新
                }
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

export default BabylonScene4;
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

    //NoodleIcons Controll
    useEffect(() => {
        const radius = 1.0 / sliderValue;
        const displayThreshold = 1.2;
        const visiblityValue = sliderValue > 1 ? 1 : 0;
        noodleIcons.forEach((icon, index) => {

            const angle = (Math.PI * 2 * index) / noodleIcons.length; // 配置する角度
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            const y = 0.035;
            icon.position = new Vector3(x, y, z); // 新しい位置にアイコンを配置
        });
    }, [sliderValue, noodleIcons]);

    //General Controll
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

                    const newMaterial = new StandardMaterial("newMaterial", scene);
                    newMaterial.diffuseColor = new Color3(0.8, 0.2, 0.2);
                    noodleIcon.material = newMaterial;
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
                const numberOfBoxes = 3;
                const newNoodleIcons = [];
                for (let i = 0; i < numberOfBoxes; i++) {
                    const angle = Math.random() * Math.PI * 2; // Random angle
                    const radius = 0.7;
                    const x = radius * Math.cos(angle);
                    const z = radius * Math.sin(angle);
                    const y = 0.035;

                    const newNoodleIcon = noodleIcon.clone("newNoodleIcon" + i);
                    newNoodleIcon.position = new Vector3(x, y, z);
                    newNoodleIcon.rotation = cylinder.rotation; // シリンダーの回転に合わせる
                    newNoodleIcon.scaling = new Vector3(0.075, 0.075, 0.075);
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
                    const sphereNoodleIcon = noodleIcon.clone("sphereNoodleIcon" + i);
                    sphereNoodleIcon.position = new Vector3(sphereX, sphereY, sphereZ);
                    sphereNoodleIcon.scaling = new Vector3(0.75, 0.75, 0.75);
                    sphereNoodleIcon.rotation = cylinder.rotation;
                    sphereNoodleIcon.parent = cylinder;

                    /*const Text = MeshBuilder.CreateTextCreateText("myText", "HELLO WORLD", fontData, {
                        size: 16,
                        resolution: 64,
                        depth: 10,
                        faceUV: [
                            new Vector4(0, 0, 1, 1),
                            new Vector4(0, 0, 1, 1),
                            new Vector4(0, 0, 1, 1),
                        ],
                    });
                    Text.position = new Vector3(sphereX, sphereY - 1.0, sphereZ);*/
                    //const textPlane = createTextPlane("TextPlane" + i, "テキスト " + (i + 1), "red  ", scene);
                    //textPlane.position = new Vector3(sphereX, sphereY - 1.0, sphereZ);
                    //textPlane.parent = sphereNoodleIcon;
                }
                setNoodleIcons(newNoodleIcons);
            }));

            cone.actionManager = new ActionManager(scene);
            cone.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                const numberOfBoxes = 3;
                for (let i = 0; i < numberOfBoxes; i++) {
                    const angle = Math.random() * Math.PI * 2; // Random angle
                    const radius = 0.70; // Half of the diameterTop
                    const x = radius * Math.cos(angle);
                    const z = radius * Math.sin(angle);
                    const y = 0.035; // Slightly above the top surface

                    const newParkIcon = parkIcon.clone("newParkIcon" + i);
                    newParkIcon.position = new Vector3(x, y, z);
                    newParkIcon.rotation = cylinder.rotation; // シリンダーの回転に合わせる
                    newParkIcon.scaling = new Vector3(0.075, 0.075, 0.075);
                    newParkIcon.parent = cylinder;
                    newParkIcon.rotate(Vector3.Up(), Math.PI / 2);

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
            }));

            torus.actionManager = new ActionManager(scene);
            torus.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                const numberOfBoxes = 3;
                for (let i = 0; i < numberOfBoxes; i++) {
                    const angle = Math.random() * Math.PI * 2; // Random angle
                    const radius = 0.70; // Half of the diameterTop
                    const x = radius * Math.cos(angle);
                    const z = radius * Math.sin(angle);
                    const y = 0.035; // Slightly above the top surface

                    const newCafeIcon = cafeIcon.clone("newCafeIcon" + i);
                    newCafeIcon.position = new Vector3(x, y, z);
                    newCafeIcon.rotation = cylinder.rotation; // シリンダーの回転に合わせる
                    newCafeIcon.scaling = new Vector3(0.075, 0.075, 0.075);
                    newCafeIcon.parent = cylinder;
                    newCafeIcon.rotate(Vector3.Up(), Math.PI / 2);

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
                                overlayElement.style.display = 'none'; // 非表示にする
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
                onTouchStart={preventTouchPropagation}
                onPointerDown={preventTouchPropagation}
            >
                <label>Slider Value: {sliderValue}</label>
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
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
} from '@babylonjs/core';
import '@babylonjs/loaders';

function BabylonScene4() {
    const canvasRef = useRef(null);

    //タッチ処理用の透明なオブジェクト
    function createInvisibleGround(scene) {
        const ground = MeshBuilder.CreatePlane("invisibleGround", { size: 1000 }, scene); // 適当に大きなサイズを設定
        ground.position.y = 0;  // シーン内の適切な高さに設定
        ground.position.z = 20;
        ground.rotation.x = 0;//Math.PI / 2;  // X軸に沿って90度回転して地面と平行にする

        const material = new StandardMaterial("groundMaterial", scene);
        material.alpha = 0;  // 完全に透明にする
        material.disableLighting = true;  // ライティングの影響を受けないようにする
        ground.material = material;
        ground.isPickable = true;  // ピッキングを可能にする
    }


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
            //地図磁石 
            const cylinder = MeshBuilder.CreateCylinder("cylinder", { diameterTop: 1.7, diameterBottom: 1.85, height: 0.07 }, scene);
            const texture = new Texture('map2.png');
            //texture.uScale = 0.7;
            //texture.vScale = 0.7;
            const material = new StandardMaterial("material", scene);
            material.diffuseTexture = texture;
            cylinder.material = material;
            cylinder.position.z = 3;
            cylinder.position.y = -1;
            cylinder.rotation.x = -Math.PI / 10;
            //タッチ処理用のplane追加
            createInvisibleGround(scene);

            cylinder.actionManager = new ActionManager(scene);
            cylinder.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                //cylinder.rotate(Axis.Y, Math.PI / 4, Space.LOCAL);
            }));

            //glb読み込み
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


            const box = MeshBuilder.CreateBox("box", { width: 0.3, height: 0.3, depth: 0.3 }, scene);
            box.position = new Vector3(-0.4, 0, 1); // 位置設定を修正
            box.visibility = 0;

            const cone = MeshBuilder.CreateCylinder("cone", { diameterTop: 0, diameterBottom: 0.4, height: 0.4 }, scene); // Cone を作成
            cone.position = new Vector3(0, 0, 1); // 位置設定
            cone.visibility = 0;

            const torus = MeshBuilder.CreateTorus("torus", { diameter: 0.25, thickness: 0.2 }, scene); // Torus を作成
            torus.position = new Vector3(0.4, -0.2, 1); // 位置設定
            torus.visibility = 0;

            //タッチによるオブジェクト追加、３つ
            box.actionManager = new ActionManager(scene);
            box.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                const numberOfBoxes = 3;
                for (let i = 0; i < numberOfBoxes; i++) {
                    const angle = Math.random() * Math.PI * 2; // Random angle
                    const radius = 0.70;
                    const x = radius * Math.cos(angle);
                    const z = radius * Math.sin(angle);
                    const y = 0.035;

                    const newNoodleIcon = noodleIcon.clone("newNoodleIcon" + i);
                    newNoodleIcon.position = new Vector3(x, y, z);
                    newNoodleIcon.rotation = cylinder.rotation; // シリンダーの回転に合わせる
                    newNoodleIcon.scaling = new Vector3(0.075, 0.075, 0.075);
                    newNoodleIcon.parent = cylinder;
                    newNoodleIcon.rotate(Vector3.Up(), Math.PI / 2);

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
                }
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
            //ここまで

            scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: 'immersive-ar',
                },
            });
            const axesViewer = new AxesViewer(scene);

            //タッチによる方向と量の測定（試し）
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
            //ここまで

            engine.runRenderLoop(() => {
                if (isTouchActive && lastPointerPosition && currentPointerPosition) {
                    let direction = currentPointerPosition.subtract(lastPointerPosition);
                    let rotationAmount = direction.x * 1; // スケールファクター調整
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
            <canvas ref={canvasRef} style={{ width: '800px', height: '600px' }} />
        </>
    );
}

export default BabylonScene4;
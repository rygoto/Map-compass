import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, Mesh, MeshBuilder, ActionManager, ExecuteCodeAction, AxesViewer, WebXRState, WebXRDomOverlay, Texture, StandardMaterial, Space, Axis } from '@babylonjs/core';

function BabylonScene() {
    const canvasRef = useRef(null);


    useEffect(() => {
        if (canvasRef.current) {
            const engine = new Engine(canvasRef.current, true);
            const scene = new Scene(engine);
            //const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 0, 5), scene);
            //camera.attachControl(canvasRef.current, true);
            const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
            const cylinder = MeshBuilder.CreateCylinder("cylinder", { diameterTop: 1.5, diameterBottom: 1.65, height: 0.07 }, scene);
            const texture = new Texture('map2.png');
            //texture.uScale = 0.7;
            //texture.vScale = 0.7;
            const material = new StandardMaterial("material", scene);
            material.diffuseTexture = texture;
            cylinder.material = material;
            cylinder.position.z = 3;
            cylinder.position.y = 0;
            cylinder.rotation.x = -Math.PI / 10;

            cylinder.actionManager = new ActionManager(scene);
            cylinder.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                cylinder.rotate(Axis.Y, Math.PI / 4, Space.LOCAL);
            }));

            const box = MeshBuilder.CreateBox("box", { width: 0.12, height: 0.5, depth: 0.12 }, scene);
            box.position.y = 0.35;
            box.position.x = -0.7;
            box.parent = cylinder;

            /*const xr = scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: 'immersive-ar',
                },
            });*/
            scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: 'immersive-ar',
                },
            }).then((experience) => {
                camera = experience.baseExperience.camera;  // XRカメラを使用
                //sphere.position = camera.getFrontPosition(2);  // カメラの前方2mに配置
            });
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
            <canvas ref={canvasRef} style={{ width: '800px', height: '600px' }} />
        </>
    );
}

export default BabylonScene;
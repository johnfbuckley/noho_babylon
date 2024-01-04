function createGameScene(gameEngine, gameCanvas) {
    const gameScene = new BABYLON.Scene(gameEngine);
    const gameCamera = new BABYLON.ArcRotateCamera("GameCamera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0,0,5), gameScene);
    gameCamera.attachControl(gameCanvas, true);

    const plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 10, height: 10}, scene);
    plane.position.y = 0; // Position the plane on the ground

    // ... rest of scene creation code ...

    gameScene.onPointerObservable.add((pointerEventInfo) => {
        switch (pointerEventInfo.type) {
            case BABYLON.PointerEventTypes.POINTERMOVE:
                const groundPickResult = gameScene.pick(gameScene.pointerX, gameScene.pointerY, (mesh) => mesh == ground);
                if (groundPickResult.hit) {
                    target.position.x = groundPickResult.pickedPoint.x;
                    target.position.z = groundPickResult.pickedPoint.z;
                }
                break;

            case BABYLON.PointerEventTypes.POINTERPICK:
                const pickedMesh = pointerEventInfo.pickInfo.pickedMesh;
                if (pickedMesh) {
                    const pickedPosition = pointerEventInfo.pickInfo.pickedPoint;
                    pickedPosition.y += 1;
                    const pickedDirection = pointerEventInfo.pickInfo.ray.direction;
                    // Add functionality for POINTERPICK event
                }
                break;
        }
    });

    return gameScene;
}

function initializeGame() {
    if (BABYLON.Engine.isSupported()) {
        const gameCanvas = document.getElementById("renderCanvas");
        const gameEngine = new BABYLON.Engine(gameCanvas, true);
        const gameScene = createGameScene(gameEngine, gameCanvas);
        gameEngine.runRenderLoop(() => {
            if (gameScene) {
                gameScene.render();
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", initializeGame, false);
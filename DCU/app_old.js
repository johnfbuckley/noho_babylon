

window.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        

        // Declare the Proxy meshes
        let groundProxy;
        let roomProxy; 

        
    // Define targetPosition and target before they are used
    var targetPosition = new BABYLON.Vector3(0, 0, 0);
    var target = BABYLON.MeshBuilder.CreateBox("target", {}, scene);
    target.isVisible = false;
        
    let lerpSpeed = 0.01;

        
     // Create a camera with a tiny near clipping plane
     var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 1.5, -0.1), scene);
     camera.minZ = 0.01;

     // Enable collision detection with proxy meshes
     camera.checkCollisions = true;
     camera.applyGravity = true;
     camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);    


        // Load the meshes
        BABYLON.SceneLoader.ImportMesh("", "scenes/", "proxy.gltf", scene, function (meshes) {
            // Find the RoomProxy and GroundProxy meshes
            meshes.forEach(function (mesh) {
                if (mesh.name === "RoomProxy") {
                    roomProxy = mesh;
                    roomProxy.checkCollisions = true;
                    roomProxy.isVisible = false;
                } else if (mesh.name === "GroundProxy") {
                    groundProxy = mesh;
                    groundProxy.isVisible = false;
                    groundProxy.checkCollisions = true; // The camera will collide with this mesh
                }
            });

            // Set up the point/click and move behavior
            scene.onPointerObservable.add((pointerInfo) => {
                let pickResult;
                switch (pointerInfo.type) {
                    case BABYLON.PointerEventTypes.POINTERMOVE:
                        pickResult = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh == groundProxy);
                        if (pickResult.hit) {
                            // Move the target to the picked point
                            target.position.x = pickResult.pickedPoint.x;
                            target.position.z = pickResult.pickedPoint.z;
                        }
                        break;
                    case BABYLON.PointerEventTypes.POINTERDOWN:
                        pickResult = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh == groundProxy);
                        if (pickResult.hit) {
                            // Set the target position to the picked point
                            targetPosition.x = pickResult.pickedPoint.x;
                            targetPosition.z = pickResult.pickedPoint.z;
                        }
                        break;
                }
            });

            // Smoothly move the camera towards the target position
            scene.registerBeforeRender(function () {
                camera.position.x += (targetPosition.x - camera.position.x) * lerpSpeed;
                camera.position.z += (targetPosition.z - camera.position.z) * lerpSpeed;
            });
        });

 



        // Create a target material
        var targetMaterial = new BABYLON.StandardMaterial("targetMaterial", scene);
        targetMaterial.diffuseTexture = new BABYLON.Texture("scenes/assets/target.png", scene);

        // Create a small square mesh for the target
        
        var target = BABYLON.MeshBuilder.CreatePlane("target", {width: 1, height: 1}, scene);
        target.material = targetMaterial;

        // Set up the point/click and move behavior
        scene.onPointerObservable.add((pointerInfo) => {
            let pickResult;
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERMOVE:
                    pickResult = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh == groundProxy);
                    if (pickResult.hit) {
                        // Move the target to the picked point
                        target.position.x = pickResult.pickedPoint.x;
                        target.position.z = pickResult.pickedPoint.z;
                    }
                    break;
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    pickResult = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh == groundProxy);
                    if (pickResult.hit) {
                        // Set the target position to the picked point
                        targetPosition.x = pickResult.pickedPoint.x;
                        targetPosition.z = pickResult.pickedPoint.z;
                    }
                    break;
            }
        });

        // Smoothly move the camera towards the target position
        scene.registerBeforeRender(function () {
            camera.position.x += (targetPosition.x - camera.position.x) * lerpSpeed;
            camera.position.z += (targetPosition.z - camera.position.z) * lerpSpeed;
        });



        return scene;
    };

    var scene = createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });
});



       
            var directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(0, -1, 0), scene);
            directionalLight.intensity = 1;
            directionalLight.diffuse = new BABYLON.Color3(1, 1, 1); // White
            directionalLight.specular = new BABYLON.Color3(0, 0, 0); // Black

        
            var hemisphericLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
            hemisphericLight.intensity = 0.5; 

            var pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 1, 0), scene);
            pointLight.intensity = 2;
            pointLight.range = 50;
            pointLight.diffuse = new BABYLON.Color3(1, 1, 1); // Red
            pointLight.specular = new BABYLON.Color3(0, 0, 0); // White

        function assignLightmapOnMaterial(material, lightmap) {
            material.lightmapTexture = lightmap;
            material.lightmapTexture.coordinatesIndex = 2;
            material.useLightmapAsShadowmap = true;
        }

        var lightmapTexture = new BABYLON.Texture("scenes/assets/lightmapRGBD.png", scene);
        lightmapTexture.isRGBD = true;

        var hdrTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData("scenes/assets/RefProbe.dds", scene);
        hdrTexture.gammaSpace = false;
        hdrTexture.level = 1.2;
        scene.environmentTexture = hdrTexture;
        hdrTexture.boundingBoxSize = new BABYLON.Vector3(8.2, 4, 11);
        hdrTexture.boundingBoxPosition = new BABYLON.Vector3(0, 2.3, 0);

        BABYLON.SceneLoader.ImportMesh("", "scenes/", "windows.gltf", scene, function (meshes) {   
            meshes.forEach(function (mesh) {
                mesh.checkCollisions = true;
                if (mesh.material) {
                    mesh.material.lightmapTexture = lightmapTexture;
                    lightmapTexture.level = 2.0; // Increase this value to make the lightmap brighter
                    mesh.material.lightmapTexture.coordinatesIndex = 1;
                    mesh.material.lightmapTexture.vScale = 1; 
                    mesh.material.useLightmapAsShadowmap = true;
                    mesh.material.reflectivityColor = new BABYLON.Color3(1, 1, 1); // Adjust this value to control the strength of the reflections
                    mesh.material.microSurface = 0.5;
                }
            }
            
            );
        });



        BABYLON.SceneLoader.ImportMesh("", "scenes/", "final_room.gltf", scene, function (meshes) {   
    
            meshes.forEach(function (mesh) {
                mesh.checkCollisions = true;
                if (mesh.material) {
                    mesh.material.lightmapTexture = lightmapTexture;
                    lightmapTexture.level = 2.0; // Increase this value to make the lightmap brighter
                    mesh.material.lightmapTexture.coordinatesIndex = 1;
                    mesh.material.lightmapTexture.vScale = 1; 
                    mesh.material.useLightmapAsShadowmap = true;
                    mesh.material.reflectivityColor = new BABYLON.Color3(1, 1, 1); // Adjust this value to control the strength of the reflections
                    mesh.material.microSurface = 0.5;
                }
            });


            var floorMat = scene.getMaterialByName("Floor"); // replace "materialName" with the name of your material

            // Check if the material exists
            if (floorMat) {
                // Load a different texture map
                floorMat.albedoTexture = new BABYLON.Texture("scenes/assets/Floor_basecolor.png", scene); // replace with your texture path
                floorMat.bumpTexture = new BABYLON.Texture("scenes/assets/Floor_Normal.png", scene); // replace with your texture path
                floorMat.metallicTexture = new BABYLON.Texture("scenes/assets/Floor_ORM.png", scene); // replace with your ORM texture path

                // Indicate which channels of the texture to use for each property
                floorMat.useMetallnessFromMetallicTextureBlue = true;
                floorMat.useRoughnessFromMetallicTextureGreen = true;
                floorMat.useAmbientOcclusionFromMetallicTextureRed = true;
            
            }


        });
            var createScene = function () {

                engine.runRenderLoop(function () {
                    scene.render();
                });

                window.addEventListener('resize', function () {
                    engine.resize();
                });

                return scene;
            };


